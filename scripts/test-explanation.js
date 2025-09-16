#!/usr/bin/env node

const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const OpenAI = require('openai');

async function getApiKey() {
    const ssmClient = new SSMClient({ region: 'us-east-1' });
    const command = new GetParameterCommand({
        Name: '/amplify/databricks-calculator/openai-api-key',
        WithDecryption: true
    });
    const response = await ssmClient.send(command);
    return response.Parameter.Value;
}

async function testExplanation() {
    const apiKey = await getApiKey();
    const openai = new OpenAI({ apiKey });

    const testParams = {
        cloudProvider: 'aws',
        workload: 'streaming',
        dataScale: 'large',
        teamSize: 'medium',
        priority: 'performance'
    };

    const prompt = `As a Databricks sizing expert, provide a specific recommendation for:

Cloud Provider: aws
Workload Type: streaming
Data Scale: large (10-100TB daily processing)
Team Size: medium (10-50 concurrent users)
Priority: performance (maximum performance)
SLA Requirement: critical

Important architectural considerations:
- For streaming workloads, use streaming-optimized clusters with Delta Live Tables for real-time processing
- For performance priority: use memory-optimized instances, enable Photon acceleration, minimize spot usage

Cluster type selection logic:
- streaming workload → streaming or serverless cluster

Provide a JSON response with EXACTLY this format (no markdown, just JSON):
{
  "instanceType": "specific instance type for aws",
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
    "Detailed reason for selecting streaming cluster type",
    "Justification for instance type based on large data scale",
    "Node count calculation based on medium team size and workload",
    "Cost optimization strategy for performance priority",
    "Feature enablement rationale"
  ],
  "pros": ["array", "of", "specific", "advantages"],
  "cons": ["array", "of", "specific", "tradeoffs"]
}

Ensure the explanation array contains detailed, specific reasons for each architectural decision.`;

    console.log('Testing explanation generation with GPT-4o mini...\n');

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a Databricks architecture expert with deep knowledge of cluster configurations, performance optimization, and cost management. Always provide detailed explanations for your recommendations. Respond with valid JSON only, no markdown formatting.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.1,
        max_tokens: 1000
    });

    const response = JSON.parse(completion.choices[0].message.content);

    console.log('Cluster Type:', response.clusterType);
    console.log('\nExplanation:');
    response.explanation.forEach((exp, i) => {
        console.log(`${i + 1}. ${exp}`);
    });

    console.log('\nFull response:');
    console.log(JSON.stringify(response, null, 2));
}

testExplanation().catch(console.error);