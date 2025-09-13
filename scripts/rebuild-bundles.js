#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const uglify = require('uglify-js');

const assetsDir = path.join(__dirname, '..', 'docs', 'assets', 'js');

// Bundle configurations
const bundles = {
    'bundle-utilities.min.js': [
        'auto-save.js',
        'loading-overlay.js',
        'notifications.js',
        'validation.js',
        'dark-mode.js',
        'progress-tracker.js',
        'ux-improvements.js'
    ],
    'bundle-features.min.js': [
        'export-excel.js',
        'share-results.js',
        'report-generator.js'
    ]
};

// Function to wrap each file content in IIFE to prevent variable conflicts
function wrapInIIFE(content, filename) {
    return `
// === ${filename} ===
(function() {
    ${content}
})();
`;
}

// Create bundles
Object.entries(bundles).forEach(([bundleName, files]) => {
    console.log(`Creating ${bundleName}...`);
    
    let bundleContent = `// ${bundleName} - Generated on ${new Date().toISOString()}\n`;
    bundleContent += '// This bundle contains multiple utilities wrapped in IIFEs to prevent conflicts\n\n';
    
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
    
    // Minify the bundle
    try {
        const minified = uglify.minify(bundleContent);
        if (minified.error) {
            console.error(`  Error minifying ${bundleName}:`, minified.error);
            // Save unminified version
            fs.writeFileSync(path.join(assetsDir, bundleName), bundleContent);
        } else {
            fs.writeFileSync(path.join(assetsDir, bundleName), minified.code);
            console.log(`  ✓ ${bundleName} created successfully`);
        }
    } catch (error) {
        console.error(`  Error processing ${bundleName}:`, error);
        // Save unminified version
        fs.writeFileSync(path.join(assetsDir, bundleName), bundleContent);
    }
});

console.log('\nBundles rebuilt successfully!');