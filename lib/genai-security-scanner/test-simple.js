#!/usr/bin/env node

/**
 * Simple test to verify the scanner works without errors
 */

const GenAISecurityScanner = require('./index');

async function testScanner() {
    console.log('Testing GenAI Security Scanner...\n');

    try {
        // Create scanner with minimal config
        const scanner = new GenAISecurityScanner({
            mode: 'quick',
            verbose: true
        });

        console.log('✅ Scanner created successfully');

        // Test fingerprinting
        console.log('\nTesting system fingerprinting...');
        const fingerprint = await scanner.scanner.fingerprint();
        console.log('✅ Fingerprinting completed');
        console.log('  Model type:', fingerprint.modelType);

        // Test a simple detector
        console.log('\nTesting prompt injection detector...');
        const injectionTest = await scanner.scanner.detectors.promptInjection.measure();
        console.log('✅ Prompt injection test completed');
        console.log('  Rate:', injectionTest.rate + '%');
        console.log('  Confidence:', injectionTest.confidence + '%');

        // Test behavioral anomaly detector (our new one)
        console.log('\nTesting behavioral anomaly detector...');
        const anomalyTest = await scanner.scanner.detectors.behavioralAnomaly.measure();
        console.log('✅ Behavioral anomaly test completed');
        console.log('  Rate:', anomalyTest.rate + '%');

        console.log('\n✅ All basic tests passed!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run the test
testScanner();