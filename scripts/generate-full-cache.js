#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const OpenAI = require('openai');

// Configuration
const CONFIG = {
    OUTPUT_DIR: process.env.CACHE_OUTPUT_DIR || 'public/data',
    CACHE_VERSION: new Date().toISOString().split('T')[0],
    API_DELAY_MS: parseInt(process.env.API_DELAY_MS || '500'),
    PARAMETER_NAME: '/amplify/databricks-calculator/openai-api-key',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    BATCH_SIZE: 20 // Process in batches to avoid rate limits
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

// Human-readable descriptions for LLM
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

// Get OpenAI API key from AWS Parameter Store
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
        console.log('Make sure you have:');
        console.log('1. AWS credentials configured (aws configure)');
        console.log('2. Parameter created: aws ssm put-parameter --name "' + CONFIG.PARAMETER_NAME + '" --value "your-api-key" --type "SecureString"');
        process.exit(1);
    }
}

// Generate LLM prompt for Databricks recommendation
function generatePrompt(params) {
    // Map priority to SLA requirement
    const slaMap = {
        'cost': 'basic',
        'performance': 'critical',
        'reliability': 'critical',
        'balanced': 'standard'
    };

    return `As a Databricks sizing expert, provide a specific recommendation for:

Cloud Provider: ${params.cloudProvider}
Workload Type: ${params.workload}
Data Scale: ${params.dataScale} (${DESCRIPTIONS.dataScale[params.dataScale]})
Team Size: ${params.teamSize} (${DESCRIPTIONS.teamSize[params.teamSize]})
Priority: ${params.priority} (${DESCRIPTIONS.priority[params.priority]})
SLA Requirement: ${slaMap[params.priority]}

Important considerations:
- For ${params.priority === 'cost' ? 'cost priority, use smaller instances and consider spot/reserved instances' : ''}
- For ${params.priority === 'performance' ? 'performance priority, use larger instances with Photon enabled' : ''}
- For ${params.priority === 'reliability' ? 'reliability priority, avoid spot instances and ensure redundancy' : ''}
- For ${params.priority === 'balanced' ? 'balanced approach, optimize for cost-performance ratio' : ''}

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
  "explanation": ["array", "of", "explanation", "points"],
  "pros": ["array", "of", "advantages"],
  "cons": ["array", "of", "tradeoffs"]
}

Use real ${params.cloudProvider} instance types and realistic pricing.`;
}

// Get recommendation from OpenAI
async function getRecommendation(openai, params) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a Databricks architecture expert. Always respond with valid JSON only, no markdown formatting."
                },
                {
                    role: "user",
                    content: generatePrompt(params)
                }
            ],
            temperature: 0.3,
            max_tokens: 800
        });

        const response = completion.choices[0].message.content;
        const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Error getting recommendation:', error.message);
        throw error;
    }
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

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Process combinations in batches
async function processBatch(batch, openai, startIndex, totalCount) {
    const results = {};

    for (let i = 0; i < batch.length; i++) {
        const combo = batch[i];
        const currentIndex = startIndex + i + 1;
        const key = `${combo.cloudProvider}_${combo.workload}_${combo.dataScale}_${combo.teamSize}_${combo.priority}`;

        try {
            console.log(`   [${currentIndex}/${totalCount}] Processing: ${key}`);

            const recommendation = await getRecommendation(openai, combo);

            results[key] = {
                input: combo,
                recommendation: recommendation,
                timestamp: new Date().toISOString()
            };

            // Small delay between requests
            await sleep(CONFIG.API_DELAY_MS);

        } catch (error) {
            console.error(`   ❌ Error for ${key}:`, error.message);
            results[key] = {
                input: combo,
                recommendation: null,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    return results;
}

// Main execution
async function main() {
    console.log('🚀 Starting FULL Databricks LLM Cache Generation');
    console.log('================================================');

    // Step 1: Get API key
    console.log('1. Fetching API key from AWS Parameter Store...');
    const apiKey = await getApiKeyFromParameterStore();
    console.log('   ✅ API key retrieved successfully');

    // Step 2: Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Step 3: Generate all combinations
    const allCombinations = generateAllCombinations();
    console.log(`2. Generated ${allCombinations.length} combinations (all wizard possibilities)`);
    console.log(`   Estimated cost: $${(allCombinations.length * 0.001).toFixed(2)}`);
    console.log(`   Estimated time: ${Math.ceil(allCombinations.length * CONFIG.API_DELAY_MS / 1000 / 60)} minutes`);

    // Step 4: Process in batches
    console.log(`3. Processing in batches of ${CONFIG.BATCH_SIZE}...`);

    const cache = {
        version: CONFIG.CACHE_VERSION,
        generated: new Date().toISOString(),
        totalCombinations: allCombinations.length,
        recommendations: {}
    };

    let processed = 0;
    const errors = [];

    for (let i = 0; i < allCombinations.length; i += CONFIG.BATCH_SIZE) {
        const batch = allCombinations.slice(i, i + CONFIG.BATCH_SIZE);
        console.log(`\n   📦 Batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(allCombinations.length / CONFIG.BATCH_SIZE)}`);

        const batchResults = await processBatch(batch, openai, i, allCombinations.length);

        // Merge results
        Object.assign(cache.recommendations, batchResults);

        // Count errors
        Object.values(batchResults).forEach(result => {
            if (result.error) errors.push(result);
        });

        processed += batch.length;

        // Longer pause between batches
        if (i + CONFIG.BATCH_SIZE < allCombinations.length) {
            console.log(`   ⏸️  Batch complete. Pausing for rate limit...`);
            await sleep(2000);
        }
    }

    // Step 5: Save cache
    console.log('\n4. Saving cache file...');
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'databricks-llm-cache.json');
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(cache, null, 2));
    console.log(`   ✅ Cache saved to: ${outputPath}`);

    // Step 6: Summary
    console.log('\n================================================');
    console.log('📊 Generation Summary:');
    console.log(`   Total combinations: ${allCombinations.length}`);
    console.log(`   Successful: ${processed - errors.length}`);
    console.log(`   Failed: ${errors.length}`);
    console.log(`   Cache size: ${(JSON.stringify(cache).length / 1024).toFixed(2)} KB`);
    console.log(`   Total API cost: $${(processed * 0.001).toFixed(2)}`);

    if (errors.length > 0) {
        console.log(`\n⚠️  ${errors.length} combinations failed. You may want to retry these.`);
    }

    console.log('\n✅ Full cache generation complete!');
    console.log('   All 960 wizard combinations are now cached.');
}

// Run with error handling
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});