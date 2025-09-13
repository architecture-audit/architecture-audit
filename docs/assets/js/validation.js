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