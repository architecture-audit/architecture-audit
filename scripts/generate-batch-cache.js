#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const OpenAI = require('openai');

// Configuration
const CONFIG = {
    OUTPUT_DIR: process.env.CACHE_OUTPUT_DIR || 'public/data',
    BATCH_DIR: process.env.BATCH_DIR || 'batch-jobs',
    CACHE_VERSION: new Date().toISOString().split('T')[0],
    PARAMETER_NAME: '/amplify/databricks-calculator/openai-api-key',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1'
};

// All wizard options - generates 960 combinations
const WIZARD_OPTIONS = {
    cloudProviders: ['aws', 'azure', 'gcp'],
    workloads: [
        'streaming',
        'batch_processing',
        'machine_learning',
        'business_intelligence',
        'data_science'
    ],
    dataScales: ['small', 'medium', 'large', 'xlarge'],
    teamSizes: ['small', 'medium', 'large', 'xlarge'],
    priorities: ['cost', 'performance', 'reliability', 'balanced']
};

// Human-readable descriptions
const DESCRIPTIONS = {
    dataScale: {
        'small': 'less than 1TB daily processing',
        'medium': '1-10TB daily processing',
        'large': '10-100TB daily processing',
        'xlarge': 'over 100TB daily processing'
    },
    teamSize: {
        'small': '1-10 concurrent users',
        'medium': '10-50 concurrent users',
        'large': '50-200 concurrent users',
        'xlarge': '200+ concurrent users'
    },
    priority: {
        'cost': 'minimize cost',
        'performance': 'maximum performance',
        'reliability': 'high reliability and uptime',
        'balanced': 'balanced cost and performance'
    }
};

// Get OpenAI API key from Parameter Store only
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
        console.log('Please ensure parameter exists: ' + CONFIG.PARAMETER_NAME);
        process.exit(1);
    }
}

// Generate prompt for a combination
function generatePrompt(params) {
    const slaMap = {
        'cost': 'basic',
        'performance': 'critical',
        'reliability': 'critical',
        'balanced': 'standard'
    };

    const clusterTypeGuidance = {
        'streaming': 'For streaming workloads, use streaming-optimized clusters with Delta Live Tables for real-time processing',
        'batch_processing': 'For batch processing, use standard or high-concurrency clusters depending on job isolation needs',
        'machine_learning': 'For ML workloads, use ML-optimized clusters with GPU support for training and inference',
        'business_intelligence': 'For BI workloads, use SQL warehouses or high-concurrency clusters for concurrent query performance',
        'data_science': 'For data science, use ML clusters with notebook support and collaborative features'
    };

    return `As a Databricks sizing expert, provide a specific recommendation for:

Cloud Provider: ${params.cloudProvider}
Workload Type: ${params.workload}
Data Scale: ${params.dataScale} (${DESCRIPTIONS.dataScale[params.dataScale]})
Team Size: ${params.teamSize} (${DESCRIPTIONS.teamSize[params.teamSize]})
Priority: ${params.priority} (${DESCRIPTIONS.priority[params.priority]})
SLA Requirement: ${slaMap[params.priority]}

Important architectural considerations:
- ${clusterTypeGuidance[params.workload]}
- For ${params.priority === 'cost' ? 'cost priority: minimize instance sizes, maximize spot usage, consider serverless for variable workloads' : ''}
- For ${params.priority === 'performance' ? 'performance priority: use memory-optimized instances, enable Photon acceleration, minimize spot usage' : ''}
- For ${params.priority === 'reliability' ? 'reliability priority: use on-demand instances only, enable auto-scaling, implement multi-AZ redundancy' : ''}
- For ${params.priority === 'balanced' ? 'balanced approach: mix of spot and on-demand, moderate instance sizes, selective Photon usage' : ''}

Cluster type selection logic:
- streaming workload → streaming or serverless cluster
- batch_processing → standard or highconcurrency based on isolation needs
- machine_learning → ml cluster with GPU support if needed
- business_intelligence → sql warehouse or highconcurrency for concurrency
- data_science → ml cluster for notebook collaboration

Provide a JSON response with EXACTLY this format (no markdown, just JSON):
{
  "instanceType": "specific instance type for ${params.cloudProvider}",
  "nodeCount": number,
  "clusterType": "one of: standard, highconcurrency, ml, sql, streaming, serverless",
  "spotInstancePercent": number (0-100),
  "reservedInstancePercent": number (0-100),
  "features": {
    "photon": boolean,
    "autoScaling": boolean,
    "unityCatalog": boolean,
    "deltaLiveTables": boolean
  },
  "estimatedMonthlyCost": number (USD),
  "confidence": number (0-100),
  "explanation": [
    "Detailed reason for selecting cluster type",
    "Justification for instance type based on data scale",
    "Node count calculation based on team size and workload",
    "Cost optimization strategy for priority",
    "Feature enablement rationale"
  ],
  "pros": ["array", "of", "specific", "advantages"],
  "cons": ["array", "of", "specific", "tradeoffs"]
}

Ensure the explanation array contains detailed, specific reasons for each architectural decision.
Use real ${params.cloudProvider} instance types and realistic pricing based on current market rates.`;
}

// Generate all combinations
function generateAllCombinations() {
    const combinations = [];

    for (const cloud of WIZARD_OPTIONS.cloudProviders) {
        for (const workload of WIZARD_OPTIONS.workloads) {
            for (const dataScale of WIZARD_OPTIONS.dataScales) {
                for (const teamSize of WIZARD_OPTIONS.teamSizes) {
                    for (const priority of WIZARD_OPTIONS.priorities) {
                        combinations.push({
                            cloudProvider: cloud,
                            workload: workload,
                            dataScale: dataScale,
                            teamSize: teamSize,
                            priority: priority
                        });
                    }
                }
            }
        }
    }

    return combinations;
}

// Create JSONL file for batch processing
async function createBatchFile(combinations) {
    const batchRequests = [];

    combinations.forEach((combo, index) => {
        const customId = `${combo.cloudProvider}_${combo.workload}_${combo.dataScale}_${combo.teamSize}_${combo.priority}`;

        const request = {
            custom_id: customId,
            method: "POST",
            url: "/v1/chat/completions",
            body: {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a Databricks architecture expert with deep knowledge of cluster configurations, performance optimization, and cost management. Always provide detailed explanations for your recommendations. Respond with valid JSON only, no markdown formatting."
                    },
                    {
                        role: "user",
                        content: generatePrompt(combo)
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000
            }
        };

        batchRequests.push(JSON.stringify(request));
    });

    // Save JSONL file
    const jsonlPath = path.join(CONFIG.BATCH_DIR, `databricks-batch-${Date.now()}.jsonl`);
    await fs.mkdir(CONFIG.BATCH_DIR, { recursive: true });
    await fs.writeFile(jsonlPath, batchRequests.join('\n'));

    return jsonlPath;
}

// Submit batch job to OpenAI
async function submitBatchJob(openai, jsonlPath) {
    try {
        // Upload the file
        console.log('   Uploading batch file to OpenAI...');
        const file = await openai.files.create({
            file: await fs.readFile(jsonlPath),
            purpose: 'batch'
        });

        console.log(`   ✅ File uploaded: ${file.id}`);

        // Create batch job
        console.log('   Creating batch job...');
        const batch = await openai.batches.create({
            input_file_id: file.id,
            endpoint: "/v1/chat/completions",
            completion_window: "24h"
        });

        console.log(`   ✅ Batch job created: ${batch.id}`);

        return batch;
    } catch (error) {
        console.error('Error submitting batch job:', error);
        throw error;
    }
}

// Check batch status
async function checkBatchStatus(openai, batchId) {
    try {
        const batch = await openai.batches.retrieve(batchId);
        return batch;
    } catch (error) {
        console.error('Error checking batch status:', error);
        throw error;
    }
}

// Process batch results
async function processBatchResults(openai, outputFileId) {
    try {
        // Download results file
        console.log('   Downloading results...');
        const fileContent = await openai.files.content(outputFileId);
        const text = await fileContent.text();

        // Parse JSONL results
        const results = text.trim().split('\n').map(line => JSON.parse(line));

        // Build cache object
        const cache = {
            version: CONFIG.CACHE_VERSION,
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
                    console.error(`   ❌ Failed to parse result for ${result.custom_id}:`, parseError.message);
                    errorCount++;
                }
            } else if (result.error) {
                console.error(`   ❌ Error for ${result.custom_id}:`, result.error.message);
                errorCount++;
            }
        });

        console.log(`   ✅ Processed ${successCount} successful results`);
        if (errorCount > 0) {
            console.log(`   ⚠️  ${errorCount} errors encountered`);
        }

        return cache;
    } catch (error) {
        console.error('Error processing batch results:', error);
        throw error;
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting Databricks LLM Cache Generation (Batch Mode)');
    console.log('=====================================================');

    // Step 1: Get API key
    console.log('1. Fetching API key from AWS Parameter Store...');
    const apiKey = await getApiKeyFromParameterStore();
    console.log('   ✅ API key retrieved successfully');

    // Step 2: Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Step 3: Generate combinations
    const allCombinations = generateAllCombinations();
    console.log(`2. Generated ${allCombinations.length} combinations`);

    // Calculate pricing (50% cheaper with batch API)
    const costPerRequest = 0.00032; // ~50% of regular pricing
    const totalCost = (costPerRequest * allCombinations.length).toFixed(2);
    console.log(`   Estimated cost: $${totalCost} (50% cheaper with Batch API)`);
    console.log(`   Processing window: 24 hours`);

    // Step 4: Create batch file
    console.log('3. Creating batch request file...');
    const jsonlPath = await createBatchFile(allCombinations);
    console.log(`   ✅ Batch file created: ${jsonlPath}`);

    // Step 5: Submit batch job
    console.log('4. Submitting batch job to OpenAI...');
    const batch = await submitBatchJob(openai, jsonlPath);

    // Step 6: Save batch info for monitoring
    const batchInfo = {
        batchId: batch.id,
        status: batch.status,
        created: batch.created_at,
        inputFileId: batch.input_file_id,
        totalRequests: allCombinations.length
    };

    const batchInfoPath = path.join(CONFIG.BATCH_DIR, 'current-batch.json');
    await fs.writeFile(batchInfoPath, JSON.stringify(batchInfo, null, 2));

    console.log('\n=====================================================');
    console.log('📊 Batch Job Summary:');
    console.log(`   Batch ID: ${batch.id}`);
    console.log(`   Status: ${batch.status}`);
    console.log(`   Total requests: ${allCombinations.length}`);
    console.log(`   Estimated cost: $${totalCost}`);
    console.log(`   Completion window: Within 24 hours`);
    console.log('\n✅ Batch job submitted successfully!');
    console.log('   Run "node scripts/check-batch-status.js" to monitor progress');
    console.log('   Results will be automatically processed when complete');
}

// Run with error handling
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});