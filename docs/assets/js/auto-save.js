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