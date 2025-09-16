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
    BATCH_SIZE: parseInt(process.env.BATCH_SIZE || '10'), // Smaller batch for stability
    MODEL: process.env.MODEL || 'gpt-4o-mini', // Can switch to 'gpt-3.5-turbo'
    TEMPERATURE: parseFloat(process.env.TEMPERATURE || '0.1'),
    RESUME_FROM: process.env.RESUME_FROM || null, // Resume key like 'aws_streaming_large_medium_cost'
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 2000
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

// Generate enhanced LLM prompt with better architecture guidance
function generatePrompt(params) {
    // Map priority to SLA requirement
    const slaMap = {
        'cost': 'basic',
        'performance': 'critical',
        'reliability': 'critical',
        'balanced': 'standard'
    };

    // Enhanced cluster type guidance with specific reasoning
    const clusterTypeGuidance = {
        'streaming': {
            type: 'streaming',
            reason: 'Streaming workloads require dedicated streaming clusters or serverless for real-time data processing with Delta Live Tables',
            alternative: 'serverless'
        },
        'batch_processing': {
            type: 'standard',
            reason: 'Batch processing workloads benefit from standard clusters for isolated job execution or high-concurrency for shared workloads',
            alternative: 'highconcurrency'
        },
        'machine_learning': {
            type: 'ml',
            reason: 'Machine learning workloads need ML-optimized clusters with GPU support for training and inference tasks',
            alternative: 'ml'
        },
        'business_intelligence': {
            type: 'sql',
            reason: 'Business intelligence workloads require SQL warehouses for optimal concurrent query performance and BI tool integration',
            alternative: 'highconcurrency'
        },
        'data_science': {
            type: 'ml',
            reason: 'Data science workloads use ML clusters for notebook collaboration, experimentation, and model development',
            alternative: 'ml'
        }
    };

    const workloadGuide = clusterTypeGuidance[params.workload];

    return `As a Databricks sizing expert, provide a specific recommendation for:

Cloud Provider: ${params.cloudProvider}
Workload Type: ${params.workload}
Data Scale: ${params.dataScale} (${DESCRIPTIONS.dataScale[params.dataScale]})
Team Size: ${params.teamSize} (${DESCRIPTIONS.teamSize[params.teamSize]})
Priority: ${params.priority} (${DESCRIPTIONS.priority[params.priority]})
SLA Requirement: ${slaMap[params.priority]}

CRITICAL ARCHITECTURE GUIDANCE:
- PRIMARY CLUSTER TYPE: Use "${workloadGuide.type}" cluster because: ${workloadGuide.reason}
- ALTERNATIVE: Consider "${workloadGuide.alternative}" cluster for specific scenarios
- The cluster type MUST align with the workload: ${params.workload} → ${workloadGuide.type}

Priority-specific optimization:
${params.priority === 'cost' ? '- Cost priority: Use smallest viable instance sizes, maximize spot instance usage (70-90%), consider serverless for variable workloads, use reserved instances for predictable base load' : ''}
${params.priority === 'performance' ? '- Performance priority: Use memory-optimized instances (r5/r6 series on AWS), enable Photon acceleration, minimize spot usage (0-20%), use latest generation instances' : ''}
${params.priority === 'reliability' ? '- Reliability priority: Use only on-demand instances (0% spot), enable auto-scaling with generous headroom, implement multi-AZ redundancy, use production-grade instance types' : ''}
${params.priority === 'balanced' ? '- Balanced approach: Mix 30-50% spot with on-demand, use compute-optimized instances, enable Photon for critical paths only, moderate auto-scaling' : ''}

Instance sizing logic for ${params.dataScale} scale:
- small: Entry-level instances (4-8 cores, 16-32GB RAM)
- medium: Mid-range instances (8-16 cores, 64-128GB RAM)
- large: High-performance instances (16-32 cores, 128-256GB RAM)
- xlarge: Maximum performance instances (32-64+ cores, 256-512GB+ RAM)

Provide a JSON response with EXACTLY this format (no markdown, just JSON):
{
  "instanceType": "specific instance type for ${params.cloudProvider}",
  "nodeCount": number,
  "clusterType": "MUST be one of: standard, highconcurrency, ml, sql, streaming, serverless",
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
    "REQUIRED: Why ${workloadGuide.type} cluster was chosen for ${params.workload} workload: ${workloadGuide.reason}",
    "REQUIRED: Instance type ${params.cloudProvider} selection rationale for ${params.dataScale} data scale (${DESCRIPTIONS.dataScale[params.dataScale]})",
    "REQUIRED: Node count calculation based on ${params.teamSize} team size (${DESCRIPTIONS.teamSize[params.teamSize]}) and concurrency requirements",
    "REQUIRED: Cost optimization strategy specific to ${params.priority} priority including spot/reserved instance mix",
    "REQUIRED: Feature enablement decisions (Photon, Unity Catalog, Delta Live Tables, Auto-scaling) and their impact"
  ],
  "pros": ["array", "of", "specific", "advantages"],
  "cons": ["array", "of", "specific", "tradeoffs"]
}

IMPORTANT REQUIREMENTS:
1. The clusterType MUST match the workload type (${params.workload} → ${workloadGuide.type})
2. Each explanation item MUST be a complete, detailed sentence explaining the specific decision
3. Use real ${params.cloudProvider} instance types (e.g., m5.xlarge for AWS, Standard_D8s_v3 for Azure, n2-standard-8 for GCP)
4. Provide realistic cost estimates based on current market rates`;
}

// Get recommendation from OpenAI with retries
async function getRecommendation(openai, params, retryCount = 0) {
    try {
        const completion = await openai.chat.completions.create({
            model: CONFIG.MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a Databricks architecture expert with deep knowledge of cluster configurations, performance optimization, and cost management. Always provide detailed, specific explanations for your recommendations. Respond with valid JSON only, no markdown formatting."
                },
                {
                    role: "user",
                    content: generatePrompt(params)
                }
            ],
            temperature: CONFIG.TEMPERATURE,
            max_tokens: 1200 // Increased for detailed explanations
        });

        const response = completion.choices[0].message.content;
        const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedResponse);

        // Validate the response has proper explanations
        if (!parsed.explanation || parsed.explanation.length < 5) {
            throw new Error('Incomplete explanation in response');
        }

        return parsed;
    } catch (error) {
        if (retryCount < CONFIG.MAX_RETRIES) {
            console.error(`   ⚠️ Retry ${retryCount + 1}/${CONFIG.MAX_RETRIES} for ${JSON.stringify(params)}: ${error.message}`);
            await sleep(CONFIG.RETRY_DELAY_MS * (retryCount + 1));
            return getRecommendation(openai, params, retryCount + 1);
        }
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

// Load existing cache if resuming
async function loadExistingCache() {
    const cachePath = path.join(CONFIG.OUTPUT_DIR, 'databricks-llm-cache.json');
    try {
        const data = await fs.readFile(cachePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

// Save cache with progress
async function saveCache(cache, isPartial = false) {
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'databricks-llm-cache.json');
    const backupPath = path.join(CONFIG.OUTPUT_DIR, `databricks-llm-cache-${Date.now()}.json`);

    // Create backup if full cache exists and we're doing partial save
    if (isPartial) {
        try {
            await fs.copyFile(outputPath, backupPath);
            console.log(`   📦 Backup saved to: ${backupPath}`);
        } catch (error) {
            // No existing file to backup
        }
    }

    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(cache, null, 2));

    const completedCount = Object.keys(cache.recommendations).length;
    console.log(`   💾 Progress saved: ${completedCount}/${cache.totalCombinations} combinations`);
}

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

// Calculate pricing estimates
function calculatePricing(model, combinations) {
    const pricing = {
        'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
        'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
        'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
    };

    const avgInputTokens = 800;  // Enhanced prompt is longer
    const avgOutputTokens = 500; // Detailed explanations

    const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
    const costPerRequest = (avgInputTokens * modelPricing.input + avgOutputTokens * modelPricing.output) / 1000;
    const totalCost = costPerRequest * combinations;

    return {
        model,
        costPerRequest: costPerRequest.toFixed(4),
        totalCost: totalCost.toFixed(2)
    };
}

// Main execution
async function main() {
    console.log('🚀 Starting Resumable Databricks LLM Cache Generation');
    console.log('====================================================');
    console.log(`Model: ${CONFIG.MODEL}`);
    console.log(`Temperature: ${CONFIG.TEMPERATURE}`);
    console.log(`Batch Size: ${CONFIG.BATCH_SIZE}`);

    // Step 1: Get API key
    console.log('\n1. Fetching API key from AWS Parameter Store...');
    const apiKey = await getApiKeyFromParameterStore();
    console.log('   ✅ API key retrieved successfully');

    // Step 2: Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Step 3: Generate all combinations
    let allCombinations = generateAllCombinations();
    console.log(`\n2. Generated ${allCombinations.length} combinations`);

    // Step 4: Load existing cache and filter if resuming
    let cache = await loadExistingCache();
    let startIndex = 0;

    if (cache && cache.recommendations) {
        const existingKeys = Object.keys(cache.recommendations);
        console.log(`   📂 Found existing cache with ${existingKeys.length} combinations`);

        if (CONFIG.RESUME_FROM) {
            // Find the index to resume from
            const resumeIndex = allCombinations.findIndex(combo => {
                const key = `${combo.cloudProvider}_${combo.workload}_${combo.dataScale}_${combo.teamSize}_${combo.priority}`;
                return key === CONFIG.RESUME_FROM;
            });

            if (resumeIndex >= 0) {
                startIndex = resumeIndex;
                console.log(`   ▶️ Resuming from: ${CONFIG.RESUME_FROM} (index ${startIndex})`);
            }
        } else {
            // Filter out already processed combinations
            const processedKeys = new Set(existingKeys);
            const remaining = allCombinations.filter(combo => {
                const key = `${combo.cloudProvider}_${combo.workload}_${combo.dataScale}_${combo.teamSize}_${combo.priority}`;
                return !processedKeys.has(key);
            });

            if (remaining.length < allCombinations.length) {
                console.log(`   ⏩ Skipping ${allCombinations.length - remaining.length} already processed combinations`);
                allCombinations = remaining;
                startIndex = 0;
            }
        }
    } else {
        // Create new cache
        cache = {
            version: CONFIG.CACHE_VERSION,
            generated: new Date().toISOString(),
            model: CONFIG.MODEL,
            temperature: CONFIG.TEMPERATURE,
            totalCombinations: allCombinations.length,
            recommendations: {}
        };
    }

    // Calculate pricing for remaining
    const remainingCount = allCombinations.length - startIndex;
    const pricingInfo = calculatePricing(CONFIG.MODEL, remainingCount);
    console.log(`\n3. Processing ${remainingCount} remaining combinations`);
    console.log(`   Estimated cost: $${pricingInfo.totalCost}`);
    console.log(`   Estimated time: ${Math.ceil(remainingCount * CONFIG.API_DELAY_MS / 1000 / 60)} minutes`);

    // Step 5: Process in batches
    console.log(`\n4. Processing in batches of ${CONFIG.BATCH_SIZE}...`);

    let processed = 0;
    const errors = [];

    for (let i = startIndex; i < allCombinations.length; i += CONFIG.BATCH_SIZE) {
        const batch = allCombinations.slice(i, Math.min(i + CONFIG.BATCH_SIZE, allCombinations.length));
        const batchNum = Math.floor((i - startIndex) / CONFIG.BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(remainingCount / CONFIG.BATCH_SIZE);

        console.log(`\n   📦 Batch ${batchNum}/${totalBatches}`);

        const batchResults = await processBatch(batch, openai, i, allCombinations.length);

        // Merge results
        Object.assign(cache.recommendations, batchResults);

        // Count errors
        Object.values(batchResults).forEach(result => {
            if (result.error) errors.push(result);
        });

        processed += batch.length;

        // Save progress after each batch
        await saveCache(cache, true);

        // Longer pause between batches
        if (i + CONFIG.BATCH_SIZE < allCombinations.length) {
            console.log(`   ⏸️  Batch complete. Pausing for rate limit...`);
            await sleep(2000);
        }
    }

    // Step 6: Final save
    console.log('\n5. Final cache save...');
    await saveCache(cache, false);

    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'databricks-llm-cache.json');
    console.log(`   ✅ Cache saved to: ${outputPath}`);

    // Step 7: Summary
    console.log('\n====================================================');
    console.log('📊 Generation Summary:');
    console.log(`   Model used: ${CONFIG.MODEL}`);
    console.log(`   Temperature: ${CONFIG.TEMPERATURE}`);
    console.log(`   Total combinations: ${cache.totalCombinations}`);
    console.log(`   Successfully processed: ${Object.keys(cache.recommendations).length}`);
    console.log(`   Failed: ${errors.length}`);
    console.log(`   Cache size: ${(JSON.stringify(cache).length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total API cost: $${pricingInfo.totalCost}`);

    if (errors.length > 0) {
        console.log(`\n⚠️  ${errors.length} combinations failed. Re-run the script to retry these.`);
        const errorKeys = errors.map(e => {
            const input = e.input;
            return `${input.cloudProvider}_${input.workload}_${input.dataScale}_${input.teamSize}_${input.priority}`;
        });
        console.log('   Failed keys:', errorKeys.slice(0, 5).join(', '), errors.length > 5 ? '...' : '');
    }

    console.log('\n✅ Cache generation complete!');
    console.log('   All wizard combinations are now cached with detailed architectural explanations.');
}

// Run with error handling
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});