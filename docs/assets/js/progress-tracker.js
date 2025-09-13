// Progress tracking system
class ProgressTracker {
    constructor() {
        this.init();
        this.lastPercentage = 0;
    }
    
    init() {
        // Create more prominent progress bar
        const progressBar = document.createElement('div');
        progressBar.id = 'progress-tracker';
        progressBar.style.cssText = `
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #f3f4f6, #e5e7eb);
            z-index: 9998;
            transition: opacity 0.3s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) inset;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.id = 'progress-fill';
        progressFill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            width: 0%;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            position: relative;
        `;
        
        progressBar.appendChild(progressFill);
        document.body.appendChild(progressBar);
        
        // Create progress indicator with better visibility
        const indicator = document.createElement('div');
        indicator.id = 'progress-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 24px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-size: 16px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            z-index: 9997;
            display: none;
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
        `;
        document.body.appendChild(indicator);
        
        // Track progress
        this.updateProgress();
        
        // Update on any input change
        document.addEventListener('input', () => this.updateProgress());
        document.addEventListener('change', () => this.updateProgress());
        
        // Also track when elements are added/removed dynamically
        const observer = new MutationObserver(() => {
            this.updateProgress();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }
    
    updateProgress() {
        // Get all trackable fields
        const allFields = document.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="hidden"]), select, textarea');
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
        
        // Use required fields if available, otherwise use all fields
        const fieldsToTrack = requiredFields.length > 0 ? requiredFields : allFields;
        const totalFields = fieldsToTrack.length;
        
        if (totalFields === 0) {
            this.hideProgress();
            return 0;
        }
        
        let filledFields = 0;
        fieldsToTrack.forEach(field => {
            if (this.isFieldFilled(field)) {
                filledFields++;
            }
        });
        
        const percentage = Math.round((filledFields / totalFields) * 100);
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
            
            // Change color based on progress
            if (percentage < 30) {
                progressFill.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
            } else if (percentage < 70) {
                progressFill.style.background = 'linear-gradient(90deg, #f59e0b, #3b82f6)';
            } else if (percentage < 100) {
                progressFill.style.background = 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
            } else {
                progressFill.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
                
                // Show completion message only once
                if (this.lastPercentage < 100 && window.notify) {
                    window.notify.show('🎉 All required fields completed!', 'success', 5000);
                }
            }
        }
        
        // Update indicator with better formatting
        const indicator = document.getElementById('progress-indicator');
        if (indicator) {
            // Use innerHTML for better formatting with larger numbers
            indicator.innerHTML = `
                <span style="font-size: 20px; font-weight: bold;">${percentage}%</span> 
                <span style="opacity: 0.95;">Complete</span> 
                <span style="margin-left: 8px; opacity: 0.9; font-size: 14px;">(${filledFields}/${totalFields})</span>
            `;
            indicator.style.display = percentage > 0 && percentage < 100 ? 'block' : 'none';
            
            // Add pulse animation when close to completion
            if (percentage >= 80 && percentage < 100) {
                indicator.style.animation = 'pulse 2s infinite';
            } else {
                indicator.style.animation = '';
            }
        }
        
        this.lastPercentage = percentage;
        return percentage;
    }
    
    isFieldFilled(field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
            // For checkboxes and radios, check if any in the group are checked
            const name = field.name || field.id;
            if (name) {
                const group = document.querySelectorAll(`input[name="${name}"]`);
                return Array.from(group).some(input => input.checked);
            }
            return field.checked;
        } else if (field.tagName === 'SELECT') {
            // For select, check if a non-empty option is selected
            return field.value && field.value !== '' && field.value !== '0';
        } else {
            // For text inputs and textareas
            return field.value && field.value.trim() !== '';
        }
    }
    
    hideProgress() {
        const progressBar = document.getElementById('progress-tracker');
        const indicator = document.getElementById('progress-indicator');
        
        if (progressBar) progressBar.style.opacity = '0';
        if (indicator) indicator.style.display = 'none';
    }
    
    showProgress() {
        const progressBar = document.getElementById('progress-tracker');
        if (progressBar) progressBar.style.opacity = '1';
    }
    
    getProgress() {
        return this.lastPercentage;
    }
}

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        50% {
            box-shadow: 0 2px 20px rgba(99, 102, 241, 0.4);
        }
        100% {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    }
    
    #progress-tracker {
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    #progress-fill {
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
    }
    
    @media (max-width: 768px) {
        #progress-indicator {
            font-size: 12px !important;
            padding: 6px 12px !important;
        }
    }
`;
document.head.appendChild(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on calculator pages (check various possible paths)
    const path = window.location.pathname;
    const isCalculator = path.includes('calculator') || 
                       path.includes('ai-readiness') || 
                       path.includes('cloud-migration') || 
                       path.includes('mlops-audit') || 
                       path.includes('llm-framework') || 
                       path.includes('security-audit') || 
                       path.includes('cost-optimization');
                       
    if (isCalculator) {
        window.progressTracker = new ProgressTracker();
        console.log('✅ Progress tracker initialized');
    }
});

window.ProgressTracker = ProgressTracker;