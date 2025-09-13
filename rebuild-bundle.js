// Simple bundle rebuilder
const fs = require('fs');
const path = require('path');

const utilityFiles = [
    'docs/assets/js/notifications.js',
    'docs/assets/js/form-validator.js', 
    'docs/assets/js/auto-save.js',
    'docs/assets/js/progress-tracker.js',
    'docs/assets/js/ux-improvements.js',
    'docs/assets/js/calculator-utils.js'
];

console.log('Building utilities bundle...');

let bundleContent = '// Bundled Utilities - Built by an Architect, Built for Architects\n';
bundleContent += '// Generated: ' + new Date().toISOString() + '\n\n';
bundleContent += '(function() {\n';
bundleContent += '"use strict";\n\n';

utilityFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  Adding ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        bundleContent += `// ========== ${path.basename(file)} ==========\n`;
        bundleContent += content + '\n\n';
    } else {
        console.log(`  Warning: ${file} not found`);
    }
});

bundleContent += '})();\n';

// Write bundle
const outputPath = path.join(__dirname, 'docs/assets/js/bundle-utilities.min.js');
fs.writeFileSync(outputPath, bundleContent);

console.log(`✅ Bundle created: ${outputPath}`);
console.log(`   Size: ${(bundleContent.length / 1024).toFixed(2)} KB`);