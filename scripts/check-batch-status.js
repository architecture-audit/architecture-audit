#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const OpenAI = require('openai');

const CONFIG = {
    OUTPUT_DIR: process.env.CACHE_OUTPUT_DIR || 'public/data',
    BATCH_DIR: process.env.BATCH_DIR || 'batch-jobs',
    PARAMETER_NAME: '/deo-portfolio/openai-api-key',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1'
};

async function getApiKeyFromParameterStore() {
    try {
        const ssmClient = new SSMClient({ region: CONFIG.AWS_REGION });
        const command = new GetParameterCommand({
            Name: CONFIG.PARAMETER_NAME,
            WithDecryption: true
        });
        const response = await ssmClient.send(command);
        return response.Parameter.Value;
    } catch (error) {
        console.error('Failed to get API key from Parameter Store:', error);
        process.exit(1);
    }
}

async function checkBatchStatus() {
    console.log('🔍 Checking Batch Job Status');
    console.log('============================\n');

    // Read batch info
    const batchInfoPath = path.join(CONFIG.BATCH_DIR, 'current-batch.json');

    try {
        const batchInfo = JSON.parse(await fs.readFile(batchInfoPath, 'utf8'));

        // Get API key and initialize OpenAI
        const apiKey = await getApiKeyFromParameterStore();
        const openai = new OpenAI({ apiKey });

        // Check current status
        const batch = await openai.batches.retrieve(batchInfo.batchId);

        console.log(`Batch ID: ${batch.id}`);
        console.log(`Status: ${batch.status}`);
        console.log(`Created: ${new Date(batch.created_at * 1000).toLocaleString()}`);

        if (batch.completed_at) {
            console.log(`Completed: ${new Date(batch.completed_at * 1000).toLocaleString()}`);
        }

        console.log(`\nRequest counts:`);
        console.log(`  Total: ${batch.request_counts?.total || 0}`);
        console.log(`  Completed: ${batch.request_counts?.completed || 0}`);
        console.log(`  Failed: ${batch.request_counts?.failed || 0}`);

        // Calculate progress
        const progress = batch.request_counts?.completed || 0;
        const total = batch.request_counts?.total || batchInfo.totalRequests;
        const percentage = ((progress / total) * 100).toFixed(1);

        console.log(`\nProgress: ${progress}/${total} (${percentage}%)`);

        // If completed, process results
        if (batch.status === 'completed' && batch.output_file_id) {
            console.log('\n✅ Batch completed! Processing results...\n');

            await processResults(openai, batch.output_file_id);

            // Update batch info
            batchInfo.status = 'completed';
            batchInfo.outputFileId = batch.output_file_id;
            batchInfo.completedAt = batch.completed_at;
            await fs.writeFile(batchInfoPath, JSON.stringify(batchInfo, null, 2));

        } else if (batch.status === 'failed') {
            console.log('\n❌ Batch failed!');
            if (batch.errors) {
                console.log('Errors:', JSON.stringify(batch.errors, null, 2));
            }
        } else if (batch.status === 'cancelled') {
            console.log('\n⚠️ Batch was cancelled');
        } else {
            console.log('\n⏳ Batch is still processing...');
            console.log('   Check again later with: node scripts/check-batch-status.js');
        }

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('❌ No active batch job found.');
            console.log('   Run "node scripts/generate-batch-cache.js" to start a new batch');
        } else {
            console.error('Error:', error);
        }
    }
}

async function processResults(openai, outputFileId) {
    try {
        // Download results
        console.log('Downloading results file...');
        const fileContent = await openai.files.content(outputFileId);
        const text = await fileContent.text();

        // Parse JSONL results
        const results = text.trim().split('\n').map(line => JSON.parse(line));

        // Build cache object
        const cache = {
            version: new Date().toISOString().split('T')[0],
            generated: new Date().toISOString(),
            model: 'gpt-4o-mini',
            temperature: 0.1,
            totalCombinations: results.length,
            recommendations: {}
        };

        let successCount = 0;
        let errorCount = 0;

        results.forEach(result => {
            if (result.response && result.response.body && result.response.body.choices) {
                try {
                    const content = result.response.body.choices[0].message.content;
                    const recommendation = JSON.parse(content);

                    // Parse the custom_id to get input params
                    const parts = result.custom_id.split('_');
                    const input = {
                        cloudProvider: parts[0],
                        workload: parts[1],
                        dataScale: parts[2],
                        teamSize: parts[3],
                        priority: parts[4]
                    };

                    cache.recommendations[result.custom_id] = {
                        input: input,
                        recommendation: recommendation,
                        timestamp: new Date().toISOString()
                    };

                    successCount++;
                } catch (parseError) {
                    console.error(`Failed to parse result for ${result.custom_id}:`, parseError.message);
                    errorCount++;
                }
            } else if (result.error) {
                console.error(`Error for ${result.custom_id}:`, result.error.message);
                errorCount++;
            }
        });

        console.log(`✅ Processed ${successCount} successful results`);
        if (errorCount > 0) {
            console.log(`⚠️  ${errorCount} errors encountered`);
        }

        // Save cache file
        const outputPath = path.join(CONFIG.OUTPUT_DIR, 'databricks-llm-cache.json');
        await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(cache, null, 2));

        console.log(`\n✅ Cache saved to: ${outputPath}`);
        console.log(`   File size: ${(JSON.stringify(cache).length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Total combinations: ${successCount}`);

    } catch (error) {
        console.error('Error processing results:', error);
        throw error;
    }
}

// Run
checkBatchStatus().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});