#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const OpenAI = require('openai');

// Configuration
const CONFIG = {
    OUTPUT_DIR: process.env.CACHE_OUTPUT_DIR || 'public/data',
    CACHE_VERSION: new Date().toISOString().split('T')[0],
    MAX_COMBINATIONS: parseInt(process.env.MAX_COMBINATIONS || '300'),
    API_DELAY_MS: parseInt(process.env.API_DELAY_MS || '1000'),
    PARAMETER_NAME: '/amplify/databricks-calculator/openai-api-key',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1'
};

// Strategic combinations that cover 95% of use cases
// For testing, you can limit combinations by setting MAX_COMBINATIONS env var
const TEST_MODE = process.env.MAX_COMBINATIONS && parseInt(process.env.MAX_COMBINATIONS) <= 10;

const COMBINATIONS = {
    cloudProviders: TEST_MODE ? ['aws', 'azure'] : ['aws', 'azure', 'gcp'],

    profiles: TEST_MODE ? [
        // Test profiles using scale categories
        { workload: 'analytics', dataScale: 'small', teamSize: 'small', priority: 'cost', sla: 'basic' },
        { workload: 'streaming', dataScale: 'medium', teamSize: 'medium', priority: 'balanced', sla: 'standard' },
        { workload: 'ml', dataScale: 'large', teamSize: 'large', priority: 'performance', sla: 'critical' }
    ] : [
        // All combinations using scale categories (not fixed values)

        // Small scale combinations
        { workload: 'analytics', dataScale: 'small', teamSize: 'small', priority: 'cost', sla: 'basic' },
        { workload: 'analytics', dataScale: 'small', teamSize: 'small', priority: 'balanced', sla: 'standard' },
        { workload: 'streaming', dataScale: 'small', teamSize: 'small', priority: 'cost', sla: 'basic' },
        { workload: 'batch', dataScale: 'small', teamSize: 'small', priority: 'cost', sla: 'basic' },
        { workload: 'ml', dataScale: 'small', teamSize: 'small', priority: 'balanced', sla: 'standard' },

        // Medium scale combinations
        { workload: 'analytics', dataScale: 'medium', teamSize: 'medium', priority: 'balanced', sla: 'standard' },
        { workload: 'analytics', dataScale: 'medium', teamSize: 'medium', priority: 'performance', sla: 'standard' },
        { workload: 'streaming', dataScale: 'medium', teamSize: 'medium', priority: 'balanced', sla: 'standard' },
        { workload: 'batch', dataScale: 'medium', teamSize: 'medium', priority: 'cost', sla: 'standard' },
        { workload: 'ml', dataScale: 'medium', teamSize: 'medium', priority: 'performance', sla: 'critical' },

        // Large scale combinations
        { workload: 'analytics', dataScale: 'large', teamSize: 'large', priority: 'performance', sla: 'critical' },
        { workload: 'analytics', dataScale: 'large', teamSize: 'large', priority: 'balanced', sla: 'critical' },
        { workload: 'streaming', dataScale: 'large', teamSize: 'large', priority: 'performance', sla: 'critical' },
        { workload: 'batch', dataScale: 'large', teamSize: 'large', priority: 'balanced', sla: 'standard' },
        { workload: 'ml', dataScale: 'large', teamSize: 'large', priority: 'performance', sla: 'critical' },

        // Extra large scale
        { workload: 'analytics', dataScale: 'xlarge', teamSize: 'xlarge', priority: 'performance', sla: 'critical' },
        { workload: 'streaming', dataScale: 'xlarge', teamSize: 'xlarge', priority: 'performance', sla: 'critical' },
        { workload: 'batch', dataScale: 'xlarge', teamSize: 'xlarge', priority: 'balanced', sla: 'critical' },
        { workload: 'ml', dataScale: 'xlarge', teamSize: 'xlarge', priority: 'performance', sla: 'critical' },
    ],

    // Additional variations for each priority
    priorityVariations: TEST_MODE ? ['cost'] : ['cost', 'performance', 'balanced']
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
    // Convert to human-readable ranges
    const dataRanges = {
        'small': 'less than 1TB daily processing',
        'medium': '1-10TB daily processing',
        'large': '10-100TB daily processing',
        'xlarge': 'over 100TB daily processing'
    };

    const userRanges = {
        'small': '1-10 concurrent users',
        'medium': '10-50 concurrent users',
        'large': '50-200 concurrent users',
        'xlarge': '200+ concurrent users'
    };

    return `As a Databricks sizing expert, provide a specific recommendation for:

Cloud Provider: ${params.cloudProvider}
Workload Type: ${params.workload}
Data Scale: ${params.dataScale} (${dataRanges[params.dataScale]})
Team Size: ${params.teamSize} (${userRanges[params.teamSize]})
Priority: ${params.priority}
SLA Requirement: ${params.sla}

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

Consider current Databricks pricing and best practices for ${params.cloudProvider}.`;
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
            temperature: 0.3, // Lower temperature for more consistent results
            max_tokens: 800
        });

        const response = completion.choices[0].message.content;

        // Clean up response (remove markdown if any)
        const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Error getting recommendation:', error);
        throw error;
    }
}

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main execution
async function main() {
    console.log('🚀 Starting Databricks LLM Cache Generation');
    console.log('================================================');

    // Step 1: Get API key from Parameter Store
    console.log('1. Fetching API key from AWS Parameter Store...');
    const apiKey = await getApiKeyFromParameterStore();
    console.log('   ✅ API key retrieved successfully');

    // Step 2: Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Step 3: Generate all combinations
    const allCombinations = [];
    for (const cloud of COMBINATIONS.cloudProviders) {
        for (const profile of COMBINATIONS.profiles) {
            for (const priority of COMBINATIONS.priorityVariations) {
                allCombinations.push({
                    cloudProvider: cloud,
                    ...profile,
                    priority: priority // Override with variation
                });
            }
        }
    }

    console.log(`2. Generating ${allCombinations.length} combinations...`);

    // Step 4: Generate recommendations with rate limiting
    const cache = {
        version: CONFIG.CACHE_VERSION,
        generated: new Date().toISOString(),
        totalCombinations: allCombinations.length,
        recommendations: {}
    };

    let completed = 0;
    const errors = [];

    for (const combo of allCombinations) {
        const key = `${combo.cloudProvider}_${combo.workload}_${combo.dataScale}_${combo.teamSize}_${combo.priority}_${combo.sla}`;

        try {
            console.log(`   Processing [${++completed}/${allCombinations.length}]: ${key}`);

            const recommendation = await getRecommendation(openai, combo);

            cache.recommendations[key] = {
                input: combo,
                recommendation: recommendation,
                timestamp: new Date().toISOString()
            };

            // Rate limiting
            if (completed % 10 === 0) {
                console.log(`   ⏸️  Rate limit pause (${CONFIG.API_DELAY_MS}ms)...`);
                await sleep(CONFIG.API_DELAY_MS);
            }

        } catch (error) {
            console.error(`   ❌ Error for ${key}:`, error.message);
            errors.push({ key, error: error.message });

            // Add fallback recommendation
            cache.recommendations[key] = {
                input: combo,
                recommendation: null,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Step 5: Save cache file
    console.log('3. Saving cache file...');
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'databricks-llm-cache.json');
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(cache, null, 2));
    console.log(`   ✅ Cache saved to: ${outputPath}`);

    // Step 6: Generate summary
    console.log('\n================================================');
    console.log('📊 Generation Summary:');
    console.log(`   Total combinations: ${allCombinations.length}`);
    console.log(`   Successful: ${completed - errors.length}`);
    console.log(`   Failed: ${errors.length}`);
    console.log(`   Cache size: ${(JSON.stringify(cache).length / 1024).toFixed(2)} KB`);
    console.log(`   Estimated API cost: $${(completed * 0.001).toFixed(2)}`);

    if (errors.length > 0) {
        console.log('\n⚠️  Failed combinations:');
        errors.forEach(e => console.log(`   - ${e.key}: ${e.error}`));
    }

    console.log('\n✅ Cache generation complete!');
}

// Run with error handling
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});