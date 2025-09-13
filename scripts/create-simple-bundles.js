#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'docs', 'assets', 'js');

// Simple bundle configurations - only essential files
const bundles = {
    'bundle-utilities.js': [
        'auto-save.js',
        'notifications.js',
        'validation.js'
    ],
    'bundle-features.js': [
        // Empty for now - features will be loaded individually
    ]
};

// Function to wrap each file content in IIFE to prevent variable conflicts
function wrapInIIFE(content, filename) {
    return `
// === ${filename} ===
(function() {
    'use strict';
    ${content}
})();
`;
}

// Create bundles
Object.entries(bundles).forEach(([bundleName, files]) => {
    console.log(`Creating ${bundleName}...`);
    
    let bundleContent = `// ${bundleName} - Generated on ${new Date().toISOString()}\n`;
    bundleContent += '// Lightweight bundle for better performance\n\n';
    
    if (files.length === 0) {
        bundleContent += '// Empty bundle - features loaded individually\n';
    } else {
        files.forEach(file => {
            const filePath = path.join(assetsDir, file);
            if (fs.existsSync(filePath)) {
                console.log(`  Adding ${file}...`);
                const content = fs.readFileSync(filePath, 'utf8');
                bundleContent += wrapInIIFE(content, file);
            } else {
                console.log(`  Warning: ${file} not found, skipping...`);
            }
        });
    }
    
    // Save NON-minified version for better performance
    fs.writeFileSync(path.join(assetsDir, bundleName), bundleContent);
    console.log(`  ✓ ${bundleName} created successfully (non-minified for performance)`);
});

console.log('\nLightweight bundles created successfully!');