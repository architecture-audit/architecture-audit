// Master utilities file - include in all calculators
// This file must be loaded BEFORE individual calculator JS files

// Initialize all utilities
document.addEventListener('DOMContentLoaded', function() {
    // Check dependencies
    const dependencies = {
        'NotificationSystem': typeof NotificationSystem !== 'undefined',
        'FormValidator': typeof FormValidator !== 'undefined',
        'AutoSave': typeof AutoSave !== 'undefined',
        'ProgressTracker': typeof ProgressTracker !== 'undefined',
        'LoadingOverlay': typeof LoadingOverlay !== 'undefined'
    };
    
    let allLoaded = true;
    Object.entries(dependencies).forEach(([name, loaded]) => {
        if (!loaded) {
            console.error(`❌ ${name} not loaded`);
            allLoaded = false;
        } else {
            console.log(`✅ ${name} loaded`);
        }
    });
    
    if (allLoaded) {
        console.log('✅ All calculator utilities loaded successfully');
    }
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    if (window.notify) {
        window.notify.show('⚠️ An error occurred. Please refresh the page if issues persist.', 'error', 5000);
    }
});

// Prevent form submission on enter (except in textareas)
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        if (event.target.form) {
            event.preventDefault();
            // Move to next field instead
            const formElements = Array.from(event.target.form.elements);
            const currentIndex = formElements.indexOf(event.target);
            const nextElement = formElements[currentIndex + 1];
            if (nextElement && nextElement.focus) {
                nextElement.focus();
            }
        }
    }
});

// Utility functions for all calculators
window.CalculatorUtils = {
    // Safe number parsing
    safeParseFloat: function(value, defaultValue = 0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    },
    
    // Safe percentage calculation
    safePercentage: function(value, total, decimals = 1) {
        if (total === 0) return 0;
        const percentage = (value / total) * 100;
        return isNaN(percentage) ? 0 : parseFloat(percentage.toFixed(decimals));
    },
    
    // Format currency
    formatCurrency: function(value, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },
    
    // Format number with commas
    formatNumber: function(value) {
        return new Intl.NumberFormat('en-US').format(value);
    },
    
    // Debounce function for performance
    debounce: function(func, wait = 250) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Enhanced save with feedback
    saveWithFeedback: async function() {
        try {
            if (window.autoSave) {
                const saved = window.autoSave.manualSave();
                if (saved) {
                    window.notify.show('✅ Progress saved successfully!', 'success');
                    return true;
                }
            } else if (typeof saveProgress === 'function') {
                await saveProgress();
                window.notify.show('✅ Progress saved successfully!', 'success');
                return true;
            }
            throw new Error('Save function not available');
        } catch (error) {
            window.notify.show('❌ Failed to save: ' + error.message, 'error');
            return false;
        }
    },
    
    // Enhanced export with loading
    exportWithLoading: async function() {
        try {
            await LoadingOverlay.withLoading(async () => {
                if (typeof exportToExcel === 'function') {
                    await exportToExcel();
                    window.notify.show('✅ Excel file downloaded successfully!', 'success');
                } else {
                    throw new Error('Export function not available');
                }
            }, '📊 Generating Excel file...');
        } catch (error) {
            window.notify.show('❌ Export failed: ' + error.message, 'error');
        }
    },
    
    // Reset calculator with confirmation
    resetWithConfirmation: function() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            if (typeof resetCalculator === 'function') {
                resetCalculator();
                window.notify.show('🔄 Calculator reset successfully', 'info');
                
                // Clear auto-save
                if (window.autoSave) {
                    window.autoSave.clearSaved();
                }
                
                // Reset progress tracker
                if (window.progressTracker) {
                    window.progressTracker.updateProgress();
                }
            } else {
                // Fallback reset
                document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(element => {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        element.checked = false;
                    } else {
                        element.value = '';
                    }
                });
                window.notify.show('🔄 Form reset successfully', 'info');
            }
        }
    },
    
    // Validate before action
    validateAndExecute: function(formId, action) {
        if (FormValidator.validateForm(formId)) {
            action();
        } else {
            window.notify.show('⚠️ Please fill in all required fields', 'warning');
        }
    }
};

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add tab key navigation improvements
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        const activeElement = document.activeElement;
        if (activeElement) {
            // Add visual focus indicator
            activeElement.style.outline = '2px solid #6366f1';
            activeElement.style.outlineOffset = '2px';
        }
    }
});

// Remove focus indicator on mouse click
document.addEventListener('mousedown', function() {
    document.querySelectorAll('*').forEach(element => {
        element.style.outline = '';
        element.style.outlineOffset = '';
    });
});

console.log('✅ Calculator utilities initialized');