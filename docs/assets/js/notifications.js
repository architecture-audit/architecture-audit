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