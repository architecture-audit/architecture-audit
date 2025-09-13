// Diagnostic script to test calculator functionality
console.log('🔍 Running Calculator Diagnostics...');

// Test if all required functions exist
function runDiagnostics() {
    const requiredFunctions = [
        'saveProgress',
        'exportToExcel',
        'loadSavedData',
        'generateShareableLink',
        'calculateMaturityScore',
        'collectAllData'
    ];
    
    console.log('\n📋 Function Availability Check:');
    requiredFunctions.forEach(func => {
        const exists = typeof window[func] === 'function';
        console.log(`${exists ? '✅' : '❌'} ${func}: ${exists ? 'Available' : 'Missing'}`);
    });
    
    // Test localStorage
    console.log('\n💾 LocalStorage Test:');
    try {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        console.log('✅ LocalStorage is working');
    } catch(e) {
        console.error('❌ LocalStorage error:', e);
    }
    
    // Test SheetJS
    console.log('\n📊 SheetJS (XLSX) Test:');
    if (typeof XLSX !== 'undefined') {
        console.log('✅ SheetJS library loaded');
    } else {
        console.error('❌ SheetJS library not loaded');
    }
    
    // Check for jQuery conflicts
    console.log('\n🔧 jQuery Check:');
    if (typeof $ !== 'undefined') {
        console.log('✅ jQuery loaded');
    } else {
        console.log('⚠️ jQuery not loaded (might be OK if not needed)');
    }
    
    // Check data in localStorage
    console.log('\n📦 Saved Data Check:');
    const savedKeys = Object.keys(localStorage).filter(key => 
        key.includes('Readiness') || key.includes('Migration') || 
        key.includes('MLOps') || key.includes('LLM') || 
        key.includes('Security') || key.includes('Cost')
    );
    
    if (savedKeys.length > 0) {
        console.log(`✅ Found ${savedKeys.length} saved calculator data:`, savedKeys);
    } else {
        console.log('ℹ️ No saved calculator data found');
    }
    
    // Test if buttons are connected
    console.log('\n🔘 Button Connection Check:');
    const saveBtn = document.querySelector('button[onclick*="save"]');
    const exportBtn = document.querySelector('button[onclick*="export"]');
    
    if (saveBtn) {
        console.log('✅ Save button found and connected');
    } else {
        console.error('❌ Save button not properly connected');
    }
    
    if (exportBtn) {
        console.log('✅ Export button found and connected');
    } else {
        console.error('❌ Export button not properly connected');
    }
    
    console.log('\n✨ Diagnostics Complete!');
    
    // Return summary
    return {
        functionsOK: requiredFunctions.every(f => typeof window[f] === 'function'),
        localStorageOK: true,
        sheetJSOK: typeof XLSX !== 'undefined',
        buttonsOK: saveBtn && exportBtn
    };
}

// Run diagnostics when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostics);
} else {
    runDiagnostics();
}

// Expose to window for manual testing
window.runDiagnostics = runDiagnostics;