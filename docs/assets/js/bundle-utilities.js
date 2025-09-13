// bundle-utilities.js - Generated on 2025-09-13T16:24:42.028Z
// Lightweight bundle for better performance


// === auto-save.js ===
(function() {
    'use strict';
    // Auto-save functionality
class AutoSave {
    constructor(calculatorName, interval = 30000) { // Auto-save every 30 seconds
        this.calculatorName = calculatorName;
        this.interval = interval;
        this.lastSave = null;
        this.hasChanges = false;
        this.saveTimer = null;
        
        this.init();
    }
    
    init() {
        // Track changes
        document.addEventListener('input', () => {
            this.hasChanges = true;
        });
        
        document.addEventListener('change', () => {
            this.hasChanges = true;
        });
        
        // Auto-save interval
        this.saveTimer = setInterval(() => {
            if (this.hasChanges) {
                this.save();
            }
        }, this.interval);
        
        // NO beforeunload handler - auto-save runs periodically
        // This eliminates ALL leave warnings
        
        // Load saved data on init
        setTimeout(() => this.load(), 500); // Delay to ensure DOM is ready
    }
    
    save() {
        try {
            // Check if collectAllData function exists
            if (typeof window.collectAllData !== 'function') {
                console.warn('collectAllData function not found, using fallback');
                return this.fallbackSave();
            }
            
            const data = window.collectAllData();
            data.timestamp = new Date().toISOString();
            data.calculator = this.calculatorName;
            
            localStorage.setItem(`${this.calculatorName}_autosave`, JSON.stringify(data));
            localStorage.setItem(`${this.calculatorName}_lastSave`, data.timestamp);
            
            this.lastSave = data.timestamp;
            this.hasChanges = false;
            
            // Show subtle save indicator
            this.showSaveIndicator();
            
            return true;
        } catch (error) {
            console.error('Auto-save error:', error);
            return false;
        }
    }
    
    fallbackSave() {
        try {
            const formData = {};
            
            // Collect all form inputs
            document.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.id) {
                    formData[element.id] = element.value;
                }
            });
            
            const data = {
                formData: formData,
                timestamp: new Date().toISOString(),
                calculator: this.calculatorName
            };
            
            localStorage.setItem(`${this.calculatorName}_autosave`, JSON.stringify(data));
            localStorage.setItem(`${this.calculatorName}_lastSave`, data.timestamp);
            
            this.lastSave = data.timestamp;
            this.hasChanges = false;
            this.showSaveIndicator();
            
            return true;
        } catch (error) {
            console.error('Fallback save error:', error);
            return false;
        }
    }
    
    load() {
        try {
            const savedData = localStorage.getItem(`${this.calculatorName}_autosave`);
            if (savedData) {
                const data = JSON.parse(savedData);
                const lastSave = localStorage.getItem(`${this.calculatorName}_lastSave`);
                
                // Silently restore data if it exists
                // No annoying popups - just restore the user's work
                if (data) {
                    this.restoreData(data);
                    
                    // Mark as no changes after restore - this is saved data, not new changes
                    setTimeout(() => {
                        this.hasChanges = false;
                        console.log('Data restored, hasChanges reset to false');
                    }, 200);
                    
                    // Show a subtle notification that data was restored
                    // Only if data is older than 5 minutes (to avoid showing on quick refreshes)
                    if (lastSave) {
                        const timeDiff = new Date() - new Date(lastSave);
                        const fiveMinutes = 5 * 60 * 1000;
                        
                        if (timeDiff > fiveMinutes && window.notify) {
                            const timeSince = this.getTimeSince(lastSave);
                            window.notify.show(`📋 Restored work from ${timeSince}`, 'info');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Auto-load error:', error);
        }
    }
    
    restoreData(data) {
        try {
            // Try to use calculator-specific restore function
            if (typeof window.restoreData === 'function') {
                window.restoreData(data);
            } else {
                // Fallback restore
                this.fallbackRestore(data);
            }
        } catch (error) {
            console.error('Restore error:', error);
        }
    }
    
    fallbackRestore(data) {
        if (data.formData) {
            // Temporarily disable change tracking during restore
            const originalHasChanges = this.hasChanges;
            
            Object.keys(data.formData).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = data.formData[key];
                    // Trigger change event for any listeners
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            
            // Reset hasChanges after restore since this is loaded data, not new changes
            setTimeout(() => {
                this.hasChanges = false;
            }, 100);
        }
    }
    
    showSaveIndicator() {
        // Create or update save indicator
        let indicator = document.getElementById('save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'save-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(16, 185, 129, 0.9);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.innerHTML = `<span>✅</span> Auto-saved ${new Date().toLocaleTimeString()}`;
        indicator.style.display = 'flex';
        indicator.style.opacity = '1';
        
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    getTimeSince(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diff = now - then;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }
    
    // Manual save method
    manualSave() {
        const saved = this.save();
        if (saved) {
            // Try to show notification
            if (window.notify && window.notify.show) {
                window.notify.show('✅ Progress saved successfully!', 'success');
            } else {
                // Fallback to console message if notification system isn't ready
                console.log('✅ Progress saved successfully!');
                // Try to initialize notification system if it exists
                if (window.NotificationSystem && !window.notify) {
                    window.notify = new NotificationSystem();
                    window.notify.show('✅ Progress saved successfully!', 'success');
                }
            }
        }
        return saved;
    }
    
    // Clear saved data
    clearSaved() {
        localStorage.removeItem(`${this.calculatorName}_autosave`);
        localStorage.removeItem(`${this.calculatorName}_lastSave`);
        this.hasChanges = false;
        if (window.notify) {
            window.notify.show('🗑️ Saved data cleared', 'info');
        }
    }
}

// Initialize auto-save for each calculator
document.addEventListener('DOMContentLoaded', () => {
    // Detect which calculator we're on
    const path = window.location.pathname;
    let calculatorName = 'unknown';
    
    if (path.includes('ai-readiness')) calculatorName = 'ai-readiness';
    else if (path.includes('cloud-migration')) calculatorName = 'cloud-migration';
    else if (path.includes('mlops-audit')) calculatorName = 'mlops-audit';
    else if (path.includes('llm-framework')) calculatorName = 'llm-framework';
    else if (path.includes('security-audit')) calculatorName = 'security-audit';
    else if (path.includes('cost-optimization')) calculatorName = 'cost-optimization';
    
    // Only initialize if on a calculator page
    if (calculatorName !== 'unknown' && path.includes('calculator')) {
        window.autoSave = new AutoSave(calculatorName);
        console.log(`✅ Auto-save initialized for ${calculatorName}`);
    }
});

window.AutoSave = AutoSave;
})();

// === notifications.js ===
(function() {
    'use strict';
    // Notification system for user feedback
class NotificationSystem {
    constructor() {
        this.createContainer();
    }
    
    createContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }
    
    show(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
            min-width: 300px;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `<span style="font-size: 1.2em; flex-shrink: 0;">${icons[type]}</span> <span>${message}</span>`;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// Create global instance
window.notify = new NotificationSystem();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { 
            transform: translateX(100%); 
            opacity: 0; 
        }
        to { 
            transform: translateX(0); 
            opacity: 1; 
        }
    }
    @keyframes slideOut {
        from { 
            transform: translateX(0); 
            opacity: 1; 
        }
        to { 
            transform: translateX(100%); 
            opacity: 0; 
        }
    }
    
    @media (max-width: 768px) {
        #notification-container {
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
        
        .notification {
            font-size: 14px;
        }
    }
`;
document.head.appendChild(style);
})();

// === validation.js ===
(function() {
    'use strict';
    // Form validation system
class FormValidator {
    static validateRequired(element, fieldName) {
        if (!element.value || element.value.trim() === '') {
            if (window.notify) {
                window.notify.show(`${fieldName} is required`, 'error');
            }
            element.style.border = '2px solid #ef4444';
            element.classList.add('validation-error');
            return false;
        }
        element.style.border = '2px solid #10b981';
        element.classList.remove('validation-error');
        return true;
    }
    
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            if (window.notify) {
                window.notify.show('Invalid email address', 'error');
            }
            return false;
        }
        return true;
    }
    
    static validateNumber(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        if (isNaN(num) || num < min || num > max) {
            if (window.notify) {
                window.notify.show(`Value must be between ${min} and ${max}`, 'error');
            }
            return false;
        }
        return true;
    }
    
    static validateForm(formId) {
        const form = formId instanceof HTMLElement ? formId : document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const errors = [];
        
        // Check all required inputs
        form.querySelectorAll('input[required], select[required], textarea[required]').forEach(element => {
            const fieldName = element.placeholder || element.name || element.id || 'Field';
            if (!element.value || element.value.trim() === '') {
                element.style.border = '2px solid #ef4444';
                errors.push(fieldName);
                isValid = false;
            } else {
                element.style.border = '';
            }
        });
        
        // Check email fields
        form.querySelectorAll('input[type="email"]').forEach(element => {
            if (element.value && !this.validateEmail(element.value)) {
                element.style.border = '2px solid #ef4444';
                isValid = false;
            }
        });
        
        // Check number fields
        form.querySelectorAll('input[type="number"]').forEach(element => {
            const min = parseFloat(element.min) || 0;
            const max = parseFloat(element.max) || Infinity;
            if (element.value && !this.validateNumber(element.value, min, max)) {
                element.style.border = '2px solid #ef4444';
                isValid = false;
            }
        });
        
        if (!isValid && errors.length > 0 && window.notify) {
            window.notify.show(`Please fill in required fields: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`, 'error', 5000);
        }
        
        return isValid;
    }
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', () => {
    // Add validation to all inputs on blur
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('blur', function() {
            if (this.hasAttribute('required') && this.value) {
                const fieldName = this.placeholder || this.name || this.id || 'Field';
                FormValidator.validateRequired(this, fieldName);
            }
        });
        
        // Remove error styling on focus
        element.addEventListener('focus', function() {
            this.style.border = '';
            this.classList.remove('validation-error');
        });
        
        // Validate on input for better UX
        element.addEventListener('input', function() {
            if (this.classList.contains('validation-error') && this.value) {
                this.style.border = '';
                this.classList.remove('validation-error');
            }
        });
    });
});

// Add validation styles
const style = document.createElement('style');
style.textContent = `
    .validation-error {
        background-color: #fef2f2 !important;
    }
    
    input:focus, select:focus, textarea:focus {
        outline: none;
        border: 2px solid #6366f1 !important;
    }
    
    input:valid, select:valid, textarea:valid {
        border-color: #10b981;
    }
`;
document.head.appendChild(style);

window.FormValidator = FormValidator;
})();
