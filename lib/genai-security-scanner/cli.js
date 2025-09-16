#!/usr/bin/env node

/**
 * GenAI Security Scanner CLI
 * Command-line interface with parameterized provider and model selection
 */

// Load environment variables from parent directories
const path = require('path');
const fs = require('fs');

// Try to load .env from current or parent directories
const dotenvPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env')
];

for (const envPath of dotenvPaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        break;
    }
}

const GenAISecurityScanner = require('./index');
const { listAvailableModels } = require('./config/providers');
const readline = require('readline');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        provider: null,
        model: null,
        apiKey: null,
        mode: 'standard',
        help: false,
        list: false,
        interactive: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case '-p':
            case '--provider':
                options.provider = args[++i];
                break;
            case '-m':
            case '--model':
                options.model = args[++i];
                break;
            case '-k':
            case '--api-key':
                options.apiKey = args[++i];
                break;
            case '--mode':
                options.mode = args[++i];
                break;
            case '-i':
            case '--interactive':
                options.interactive = true;
                break;
            case '-l':
            case '--list':
                options.list = true;
                break;
            case '-h':
            case '--help':
                options.help = true;
                break;
        }
    }

    return options;
}

// Display help
function showHelp() {
    console.log(`
🛡️  GenAI Security Scanner CLI

Usage: genai-scan [options]

Options:
  -p, --provider <name>    LLM provider (openai, anthropic, google, etc.)
  -m, --model <name>       Model name (gpt-4, claude-3-sonnet, etc.)
  -k, --api-key <key>      API key for the provider
  --mode <mode>            Scan mode: quick, standard, comprehensive (default: standard)
  -i, --interactive        Interactive mode with prompts
  -l, --list              List all available providers and models
  -h, --help              Show this help message

Environment Variables:
  OPENAI_API_KEY          API key for OpenAI
  ANTHROPIC_API_KEY       API key for Anthropic
  GOOGLE_API_KEY          API key for Google AI
  HUGGINGFACE_API_KEY     API key for HuggingFace

Examples:
  # Quick scan with OpenAI GPT-3.5
  genai-scan -p openai -m gpt-3.5-turbo --mode quick

  # Comprehensive scan with Anthropic Claude
  genai-scan -p anthropic -m claude-3-sonnet-20240229 --mode comprehensive

  # Interactive mode
  genai-scan -i

  # List all available models
  genai-scan -l

  # Use local Ollama
  genai-scan -p ollama -m llama2
`);
}

// List available models
function showAvailableModels() {
    console.log('\n📋 Available LLM Providers and Models:\n');
    console.log('=' .repeat(60));

    const models = listAvailableModels();

    for (const [providerKey, provider] of Object.entries(models)) {
        console.log(`\n🔷 ${provider.name} (${providerKey})`);
        console.log('-' .repeat(40));

        for (const model of provider.models) {
            const defaultTag = model.default ? ' ⭐' : '';
            const freeTag = model.free ? ' 🆓' : '';
            console.log(`  ${model.key}${defaultTag}${freeTag}`);
            console.log(`    Name: ${model.name}`);
            console.log(`    Max Tokens: ${model.maxTokens.toLocaleString()}`);
            console.log(`    Cost: ${model.cost}`);
            console.log('');
        }
    }

    console.log('\nLegend: ⭐ = Default model, 🆓 = Free to use\n');
}

// Interactive mode
async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    console.log('\n🛡️  GenAI Security Scanner - Interactive Mode\n');
    console.log('=' .repeat(50));

    // Provider selection
    console.log('\nAvailable providers:');
    const models = listAvailableModels();
    const providers = Object.keys(models);
    providers.forEach((p, i) => console.log(`  ${i + 1}. ${models[p].name} (${p})`));

    const providerIndex = await question('\nSelect provider (number): ');
    const selectedProvider = providers[parseInt(providerIndex) - 1];

    if (!selectedProvider) {
        console.log('❌ Invalid selection');
        rl.close();
        return;
    }

    // Model selection
    console.log(`\nAvailable models for ${models[selectedProvider].name}:`);
    const providerModels = models[selectedProvider].models;
    providerModels.forEach((m, i) => {
        const tags = [];
        if (m.default) tags.push('default');
        if (m.free) tags.push('free');
        const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : '';
        console.log(`  ${i + 1}. ${m.name} (${m.key})${tagStr}`);
    });

    const modelIndex = await question('\nSelect model (number or press Enter for default): ');
    const selectedModel = modelIndex ?
        providerModels[parseInt(modelIndex) - 1]?.key :
        providerModels.find(m => m.default)?.key || providerModels[0].key;

    // API Key
    let apiKey = null;
    if (selectedProvider !== 'ollama') {
        const envKey = `${selectedProvider.toUpperCase()}_API_KEY`;
        const hasEnvKey = process.env[envKey];

        if (hasEnvKey) {
            const useEnv = await question(`\nUse API key from ${envKey} environment variable? (y/n): `);
            if (useEnv.toLowerCase() !== 'y') {
                apiKey = await question('Enter API key: ');
            }
        } else {
            apiKey = await question(`\nEnter ${models[selectedProvider].name} API key: `);
        }
    }

    // Scan mode
    console.log('\nScan modes:');
    console.log('  1. Quick (5-10 tests)');
    console.log('  2. Standard (20-30 tests)');
    console.log('  3. Comprehensive (50+ tests)');

    const modeIndex = await question('\nSelect scan mode (number): ');
    const modes = ['quick', 'standard', 'comprehensive'];
    const selectedMode = modes[parseInt(modeIndex) - 1] || 'standard';

    rl.close();

    // Run scan
    console.log('\n' + '=' .repeat(50));
    console.log(`\n🚀 Starting security scan...`);
    console.log(`   Provider: ${models[selectedProvider].name}`);
    console.log(`   Model: ${selectedModel}`);
    console.log(`   Mode: ${selectedMode}`);
    console.log('\n' + '=' .repeat(50) + '\n');

    await runScan({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey,
        mode: selectedMode
    });
}

// Run security scan
async function runScan(options) {
    try {
        // Create scanner with parameterized config
        const scanner = new GenAISecurityScanner({
            provider: options.provider,
            model: options.model,
            apiKey: options.apiKey,
            mode: options.mode,
            verbose: true
        });

        // Test connection
        console.log('🔗 Testing connection...');
        const connectionTest = await scanner.scanner.llmConnector.testConnection();

        if (!connectionTest.success) {
            console.error(`\n❌ Connection failed: ${connectionTest.error}`);
            console.log('\n💡 Tips:');
            console.log('  - Check your API key is correct');
            console.log('  - Verify the provider endpoint is accessible');
            console.log('  - For Ollama, ensure it\'s running locally\n');
            process.exit(1);
        }

        console.log(`✅ Connected to ${connectionTest.type}${connectionTest.model ? ' (' + connectionTest.model + ')' : ''}`);
        console.log(`   Response time: ${connectionTest.responseTime}ms\n`);

        // Run scan
        console.log('🔍 Running security tests...\n');
        const results = await scanner.scan();

        // Display results
        displayResults(results);

        // Save report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `security-report-${timestamp}.json`;

        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`\n📄 Report saved to: ${filename}`);

    } catch (error) {
        console.error(`\n❌ Scan failed: ${error.message}`);
        process.exit(1);
    }
}

// Display scan results
function displayResults(results) {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SECURITY SCAN RESULTS');
    console.log('=' .repeat(50));

    // System Info
    if (results.systemInfo) {
        console.log('\n🎯 System Information:');
        console.log(`  Model Type: ${results.systemInfo.modelType || 'Unknown'}`);
        console.log(`  Version: ${results.systemInfo.version || 'Unknown'}`);
        console.log(`  Security Features: ${results.systemInfo.securityFeatures?.join(', ') || 'None detected'}`);
    }

    // Vulnerabilities
    if (results.vulnerabilities) {
        console.log('\n⚠️  Vulnerability Assessment:');
        const vulns = results.vulnerabilities;

        const formatRate = (rate) => {
            if (rate === undefined || rate === null) return 'N/A';
            const value = typeof rate === 'object' ? rate.rate : rate;
            return `${value}%`;
        };

        console.log(`  Prompt Injection Rate: ${formatRate(vulns.promptInjection?.rate)}`);
        console.log(`  Jailbreak Success Rate: ${formatRate(vulns.jailbreak?.rate)}`);
        console.log(`  Data Leakage Risk: ${formatRate(vulns.dataLeakage?.rate)}`);
        console.log(`  Hallucination Rate: ${formatRate(vulns.hallucination?.rate)}`);
        console.log(`  Model Extraction Risk: ${formatRate(vulns.modelExtraction?.extractability)}`);
    }

    // OWASP Compliance
    if (results.compliance?.owasp) {
        console.log('\n📋 OWASP LLM Top 10 Compliance:');
        const owasp = results.compliance.owasp;
        console.log(`  Overall Score: ${owasp.overallScore}%`);
        console.log(`  Compliance Level: ${owasp.compliance}`);
        console.log(`  Maturity Level: ${owasp.maturityLevel}`);

        if (owasp.criticalGaps?.length > 0) {
            console.log(`\n  Critical Gaps:`);
            owasp.criticalGaps.slice(0, 3).forEach(gap => {
                console.log(`    - ${gap.name}: ${gap.score}%`);
            });
        }
    }

    // Risk Profile
    if (results.riskProfile) {
        console.log('\n🎯 Risk Assessment:');
        console.log(`  Risk Score: ${results.riskProfile.score}`);
        console.log(`  Risk Level: ${results.riskProfile.level}`);
        console.log(`  Risk Factors: ${results.riskProfile.factors?.join(', ') || 'N/A'}`);
    }

    // Recommendations
    if (results.recommendations?.length > 0) {
        console.log('\n💡 Top Recommendations:');
        results.recommendations.slice(0, 5).forEach((rec, i) => {
            console.log(`\n  ${i + 1}. [${rec.severity}] ${rec.recommendation}`);
            if (rec.impact) console.log(`     Impact: ${rec.impact}`);
            if (rec.effort) console.log(`     Effort: ${rec.effort}`);
        });
    }

    console.log('\n' + '=' .repeat(50));
}

// Main execution
async function main() {
    const options = parseArgs();

    if (options.help) {
        showHelp();
        process.exit(0);
    }

    if (options.list) {
        showAvailableModels();
        process.exit(0);
    }

    if (options.interactive) {
        await interactiveMode();
    } else if (options.provider) {
        await runScan(options);
    } else {
        console.log('🛡️  GenAI Security Scanner\n');
        console.log('Use -h for help or -i for interactive mode\n');
        showHelp();
    }
}

// Run CLI
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});