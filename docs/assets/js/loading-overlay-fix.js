// Loading Overlay Module - Fixed Version
class LoadingOverlay {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        // Create overlay element
        this.overlay = document.createElement('div');
        this.overlay.id = 'loading-overlay';
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(5px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }

            .loading-overlay.active {
                display: flex;
            }

            .loading-content {
                text-align: center;
            }

            .spinner {
                width: 50px;
                height: 50px;
                margin: 0 auto 20px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid #6366f1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 18px;
                color: #6366f1;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.overlay);
    }

    show(text = 'Loading...') {
        if (this.overlay) {
            const loadingText = this.overlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = text;
            }
            this.overlay.classList.add('active');
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }

    update(text) {
        const loadingText = this.overlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }
}

// Create global instance and class reference
window.LoadingOverlay = LoadingOverlay;
window.loadingOverlay = new LoadingOverlay();

// Create static methods on the class for compatibility
LoadingOverlay.show = function(text) {
    window.loadingOverlay.show(text);
};

LoadingOverlay.hide = function() {
    window.loadingOverlay.hide();
};

LoadingOverlay.update = function(text) {
    window.loadingOverlay.update(text);
};

// Helper functions for backward compatibility
window.showLoadingOverlay = function(text) {
    window.loadingOverlay.show(text);
};

window.hideLoadingOverlay = function() {
    window.loadingOverlay.hide();
};

console.log('✅ LoadingOverlay loaded successfully!');