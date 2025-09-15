/**
 * Global Setup for Integration Tests
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
    // Load calculator modules
    const modulePaths = [
        '../../calculators/databricks-sizing/databricks-comprehensive.js',
        '../../calculators/databricks-sizing/databricks-multicloud.js'
    ];

    // Ensure modules exist
    for (const modulePath of modulePaths) {
        const fullPath = path.join(__dirname, modulePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`Warning: Module not found at ${fullPath}`);
        }
    }

    // Set up test environment variables
    process.env.TEST_ENV = 'integration';
    process.env.CALCULATOR_BASE_URL = 'file://' + path.join(__dirname, '../../calculators/databricks-sizing/index.html');

    console.log('Integration test environment setup complete');
};