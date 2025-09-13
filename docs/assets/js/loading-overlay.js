// Loading overlay system
class LoadingOverlay {
    static show(message = 'Processing...') {
        // Remove existing overlay
        this.hide();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.3s ease;
        `;
        
        const spinner = document.createElement('div');
        spinner.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                min-width: 200px;
                max-width: 90%;
            ">
                <div class="spinner" style="
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <div style="font-size: 16px; color: #1f2937; word-wrap: break-word;">${message}</div>
            </div>
        `;
        
        overlay.appendChild(spinner);
        document.body.appendChild(overlay);
        
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';
    }
    
    static hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    static async withLoading(asyncFunction, message = 'Processing...') {
        try {
            this.show(message);
            const result = await asyncFunction();
            this.hide();
            return result;
        } catch (error) {
            this.hide();
            throw error;
        }
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @media (max-width: 768px) {
        #loading-overlay > div > div {
            padding: 20px !important;
        }
        
        .spinner {
            width: 40px !important;
            height: 40px !important;
        }
    }
`;
document.head.appendChild(style);

// Export for global use
window.LoadingOverlay = LoadingOverlay;