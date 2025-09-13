// UX Improvements Module - Visual Feedback & Enhanced User Experience
// Built by an Architect, Built for Architects

// Check if UXEnhancements already exists to prevent duplicate declaration
if (typeof UXEnhancements === 'undefined') {

class UXEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.createAutoSaveIndicator();
        this.enhanceProgressTracker();
        this.addLoadingStates();
        this.setupNotificationSystem();
        this.addFeatureBadges();
        this.enhanceButtons();
    }

    // ========== AUTO-SAVE INDICATOR ==========
    createAutoSaveIndicator() {
        // Create persistent auto-save status badge
        const indicator = document.createElement('div');
        indicator.id = 'auto-save-status';
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = `
            <div class="auto-save-badge">
                <span class="status-icon">✅</span>
                <span class="status-text">Auto-Save: ON</span>
                <span class="last-saved"></span>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .auto-save-indicator {
                position: fixed;
                top: 70px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 25px;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                font-size: 13px;
                font-weight: 600;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .auto-save-indicator:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            }

            .auto-save-indicator.saving {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                animation: pulse-save 1s infinite;
            }

            .auto-save-indicator.error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }

            @keyframes pulse-save {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }

            .status-icon {
                font-size: 16px;
                display: inline-flex;
                animation: none;
            }

            .saving .status-icon {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .last-saved {
                font-size: 11px;
                opacity: 0.9;
                margin-left: 8px;
                padding-left: 8px;
                border-left: 1px solid rgba(255,255,255,0.3);
            }

            @media (max-width: 768px) {
                .auto-save-indicator {
                    top: auto;
                    bottom: 80px;
                    right: 10px;
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(indicator);

        // Update last saved time
        this.updateLastSaved();
        setInterval(() => this.updateLastSaved(), 30000); // Update every 30 seconds
    }

    updateAutoSaveStatus(status) {
        const indicator = document.querySelector('.auto-save-indicator');
        const statusText = document.querySelector('.status-text');
        const statusIcon = document.querySelector('.status-icon');
        
        if (!indicator) return;

        switch(status) {
            case 'saving':
                indicator.className = 'auto-save-indicator saving';
                statusIcon.textContent = '⏳';
                statusText.textContent = 'Saving...';
                break;
            case 'saved':
                indicator.className = 'auto-save-indicator';
                statusIcon.textContent = '✅';
                statusText.textContent = 'Auto-Save: ON';
                this.updateLastSaved();
                break;
            case 'error':
                indicator.className = 'auto-save-indicator error';
                statusIcon.textContent = '❌';
                statusText.textContent = 'Save Failed';
                break;
        }
    }

    updateLastSaved() {
        const lastSavedEl = document.querySelector('.last-saved');
        if (!lastSavedEl) return;

        const calculatorName = this.getCalculatorName();
        const lastSave = localStorage.getItem(`${calculatorName}_lastSave`);
        
        if (lastSave) {
            const timeDiff = Date.now() - new Date(lastSave);
            const minutes = Math.floor(timeDiff / 60000);
            
            if (minutes < 1) {
                lastSavedEl.textContent = 'Just now';
            } else if (minutes === 1) {
                lastSavedEl.textContent = '1 minute ago';
            } else if (minutes < 60) {
                lastSavedEl.textContent = `${minutes} minutes ago`;
            } else {
                const hours = Math.floor(minutes / 60);
                lastSavedEl.textContent = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
        }
    }

    // ========== ENHANCED PROGRESS TRACKER ==========
    enhanceProgressTracker() {
        // Override existing progress tracker with enhanced version
        const style = document.createElement('style');
        style.textContent = `
            #progress-tracker {
                height: 10px !important;
                background: linear-gradient(90deg, #f3f4f6, #e5e7eb) !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) inset !important;
            }

            #progress-fill {
                position: relative;
                overflow: visible !important;
            }

            .progress-badge {
                position: absolute;
                right: -40px;
                top: 15px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                white-space: nowrap;
                z-index: 10;
                transition: all 0.3s ease;
            }

            .progress-badge::before {
                content: '';
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 8px solid #6366f1;
            }

            .progress-details {
                position: fixed;
                top: 75px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 8px 16px;
                border-radius: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                font-size: 13px;
                font-weight: 600;
                color: #64748b;
                z-index: 9998;
                transition: all 0.3s ease;
            }

            .progress-details.hidden {
                opacity: 0;
                transform: translateX(-50%) translateY(-10px);
            }

            #progress-indicator {
                font-size: 18px !important;
                padding: 12px 24px !important;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
                font-weight: bold !important;
            }
        `;
        document.head.appendChild(style);

        // Add progress badge to existing progress bar
        setTimeout(() => {
            const progressFill = document.getElementById('progress-fill');
            if (progressFill && !progressFill.querySelector('.progress-badge')) {
                const badge = document.createElement('div');
                badge.className = 'progress-badge';
                badge.textContent = '0%';
                progressFill.appendChild(badge);
            }

            // Add progress details
            if (!document.querySelector('.progress-details')) {
                const details = document.createElement('div');
                details.className = 'progress-details';
                details.textContent = '0 of 0 fields completed';
                document.body.appendChild(details);
            }
        }, 1000);
    }

    // ========== LOADING STATES ==========
    addLoadingStates() {
        const style = document.createElement('style');
        style.textContent = `
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.8;
            }

            .btn-loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin-left: -8px;
                margin-top: -8px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spinner 0.6s linear infinite;
            }

            @keyframes spinner {
                to { transform: rotate(360deg); }
            }

            .btn-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                animation: success-pulse 0.5s ease;
            }

            @keyframes success-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .skeleton-loader {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }

            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ========== NOTIFICATION SYSTEM ENHANCEMENT ==========
    setupNotificationSystem() {
        // Enhance existing notification system with better styling
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                animation: slideInRight 0.3s ease !important;
                backdrop-filter: blur(10px);
                background: rgba(255, 255, 255, 0.95) !important;
                border-left: 4px solid;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
            }

            .notification.success {
                border-left-color: #10b981;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%) !important;
            }

            .notification.error {
                border-left-color: #ef4444;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%) !important;
            }

            .notification.info {
                border-left-color: #3b82f6;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%) !important;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========== FEATURE BADGES ==========
    addFeatureBadges() {
        // Feature badges removed - only Auto-Save indicator is shown
        // Auto-Save indicator is created in createAutoSaveIndicator() method
        return;
    }

    // ========== BUTTON ENHANCEMENTS ==========
    enhanceButtons() {
        // Add loading state to all buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button || button.classList.contains('no-loading')) return;

            // Store original text
            const originalText = button.innerHTML;
            
            // Add loading class
            button.classList.add('btn-loading');
            
            // Remove loading after action completes (or timeout)
            setTimeout(() => {
                button.classList.remove('btn-loading');
                button.classList.add('btn-success');
                
                // Show success state briefly
                setTimeout(() => {
                    button.classList.remove('btn-success');
                    button.innerHTML = originalText;
                }, 1000);
            }, 500);
        });
    }

    // ========== UTILITY FUNCTIONS ==========
    getCalculatorName() {
        const path = window.location.pathname;
        if (path.includes('ai-readiness')) return 'ai-readiness';
        if (path.includes('cloud-migration')) return 'cloud-migration';
        if (path.includes('mlops-audit')) return 'mlops-audit';
        if (path.includes('llm-framework')) return 'llm-framework';
        if (path.includes('security-audit')) return 'security-audit';
        if (path.includes('cost-optimization')) return 'cost-optimization';
        return 'unknown';
    }

    // ========== PUBLIC API ==========
    showLoading(element) {
        element?.classList.add('btn-loading');
    }

    hideLoading(element) {
        element?.classList.remove('btn-loading');
    }

    showSuccess(message) {
        if (window.notify) {
            window.notify.show(message, 'success');
        }
        this.updateAutoSaveStatus('saved');
    }

    showError(message) {
        if (window.notify) {
            window.notify.show(message, 'error');
        }
        this.updateAutoSaveStatus('error');
    }

    celebrate() {
        // Add confetti or celebration animation
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 100px;
            z-index: 10000;
            animation: celebrate 1s ease;
        `;
        document.body.appendChild(celebration);
        
        setTimeout(() => celebration.remove(), 1000);
    }
}

} // End of if statement checking for duplicate UXEnhancements

// Initialize UX enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uxEnhancements = new UXEnhancements();
    });
} else {
    window.uxEnhancements = new UXEnhancements();
}

// Enhance existing save function if it exists
if (window.saveProgress) {
    const originalSave = window.saveProgress;
    window.saveProgress = async function() {
        window.uxEnhancements?.updateAutoSaveStatus('saving');
        try {
            const result = await originalSave.apply(this, arguments);
            window.uxEnhancements?.showSuccess('✅ Progress saved successfully!');
            return result;
        } catch (error) {
            window.uxEnhancements?.showError('❌ Failed to save progress');
            throw error;
        }
    };
}

// Enhance auto-save if it exists
if (window.autoSave) {
    const originalAutoSave = window.autoSave.save.bind(window.autoSave);
    window.autoSave.save = function() {
        window.uxEnhancements?.updateAutoSaveStatus('saving');
        const result = originalAutoSave();
        if (result) {
            setTimeout(() => {
                window.uxEnhancements?.updateAutoSaveStatus('saved');
            }, 500);
        }
        return result;
    };
}

console.log('✨ UX Enhancements loaded successfully!');