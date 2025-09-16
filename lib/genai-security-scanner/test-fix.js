#!/usr/bin/env node
/**
 * Test script to verify the GenAI Security Scanner fixes
 * This tests that the detectors are properly connected to LLMConnector
 */

const GenAISecurityScanner = require('./index');

async function testFix() {
    console.log('🧪 Testing GenAI Security Scanner Fix\n');
    console.log('=====================================\n');

    // Test configuration - you can change these
    const config = {
        // Option 1: Use OpenAI (requires OPENAI_API_KEY environment variable)
        provider: 'openai',
        model: 'gpt-3.5-turbo',

        // Option 2: Use mock endpoint for testing without API key
        // target: 'mock://test',

        mode: 'quick', // quick mode for faster testing
        verbose: true
    };

    console.log('📋 Configuration:');
    console.log(`  Provider: ${config.provider || 'mock'}`);
    console.log(`  Model: ${config.model || 'N/A'}`);
    console.log(`  Mode: ${config.mode}`);
    console.log('');

    try {
        // Create scanner instance
        const scanner = new GenAISecurityScanner(config);

        // Test 1: Verify LLM Connector initialization
        console.log('✅ Test 1: LLM Connector Initialization');
        console.log('  - Scanner created successfully');
        console.log(`  - LLM Connector initialized: ${scanner.scanner.llmConnector ? 'YES' : 'NO'}`);
        console.log('');

        // Test 2: Verify detectors have llmConnector
        console.log('✅ Test 2: Detector Wiring');
        const detectors = scanner.scanner.detectors;
        for (const [name, detector] of Object.entries(detectors)) {
            const hasConnector = detector.llmConnector ? '✓' : '✗';
            console.log(`  - ${name}: ${hasConnector} ${detector.llmConnector ? 'Connected' : 'NOT CONNECTED'}`);
        }
        console.log('');

        // Test 3: Test connection (if API key is available)
        if (config.provider && config.provider !== 'mock') {
            console.log('✅ Test 3: API Connection Test');
            try {
                const testResult = await scanner.scanner.llmConnector.testConnection();
                console.log(`  - Connection: ${testResult.success ? 'SUCCESS' : 'FAILED'}`);
                console.log(`  - Provider: ${testResult.type}`);
                console.log(`  - Model: ${testResult.model}`);
                if (testResult.responseTime) {
                    console.log(`  - Response Time: ${testResult.responseTime}ms`);
                }
                if (!testResult.success) {
                    console.log(`  - Error: ${testResult.error}`);
                }
            } catch (error) {
                console.log(`  - Connection test failed: ${error.message}`);
                console.log(`  - This is expected if no API key is configured`);
            }
            console.log('');
        }

        // Test 4: Quick vulnerability scan
        console.log('✅ Test 4: Quick Vulnerability Detection');
        console.log('  Running quick prompt injection test...');

        try {
            // Test prompt injection detector specifically
            const injectionDetector = scanner.scanner.detectors.promptInjection;

            // Check if it has llmConnector
            if (!injectionDetector.llmConnector) {
                console.log('  ⚠️ Warning: Prompt injection detector has no LLM connector');
                console.log('  - Will use fallback mock responses');
            }

            // Run a quick measure
            const result = await injectionDetector.measure();
            console.log(`  - Injection Rate: ${result.rate}%`);
            console.log(`  - Confidence: ${result.confidence}%`);

            // Verify the response isn't just the default mock
            if (result.rate === 15 && result.confidence === 85) {
                console.log('  ⚠️ Note: These appear to be default/mock values');
            }
        } catch (error) {
            console.log(`  - Detection failed: ${error.message}`);
            if (error.message.includes('API key')) {
                console.log('  - Set OPENAI_API_KEY environment variable to test with real API');
            }
        }
        console.log('');

        // Summary
        console.log('📊 Summary:');
        console.log('=====================================');

        const allDetectorsWired = Object.values(scanner.scanner.detectors)
            .every(d => d.llmConnector !== undefined);

        if (allDetectorsWired) {
            console.log('✅ ALL DETECTORS PROPERLY WIRED TO LLM CONNECTOR');
            console.log('✅ The integration fix was successful!');
        } else {
            console.log('❌ Some detectors are still not connected');
            console.log('❌ Additional fixes may be needed');
        }

        // Provide next steps
        console.log('\n📝 Next Steps:');
        console.log('1. Set up API credentials:');
        console.log('   export OPENAI_API_KEY="your-key-here"');
        console.log('   # OR');
        console.log('   export ANTHROPIC_API_KEY="your-key-here"');
        console.log('');
        console.log('2. Run a full scan:');
        console.log('   const scanner = new GenAISecurityScanner({');
        console.log('     provider: "openai",');
        console.log('     model: "gpt-3.5-turbo",');
        console.log('     mode: "comprehensive"');
        console.log('   });');
        console.log('   const results = await scanner.scan();');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
    }
}

// Run the test
if (require.main === module) {
    testFix().catch(console.error);
}

module.exports = testFix;