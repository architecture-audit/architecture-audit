// PWA Registration and Management
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }
    
    async init() {
        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported');
            return;
        }
        
        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        this.showUpdateNotification();
                    }
                });
            });
            
            // Handle service worker updates
            this.handleUpdates(registration);
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
        
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed');
            this.hideInstallButton();
            
            if (window.notify) {
                window.notify.show('✅ App installed successfully!', 'success');
            }
        });
        
        // Check if app is installed
        this.checkIfInstalled();
        
        // Handle offline/online events
        this.handleConnectivity();
    }
    
    handleUpdates(registration) {
        // Check for updates every hour
        setInterval(() => {
            registration.update();
        }, 3600000);
        
        // Listen for controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
    
    showUpdateNotification() {
        const updateBanner = document.createElement('div');
        updateBanner.id = 'update-banner';
        updateBanner.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 350px;
        `;
        
        updateBanner.innerHTML = `
            <span style="font-size: 20px;">🔄</span>
            <div style="flex: 1;">
                <div style="font-weight: 600;">Update Available!</div>
                <div style="font-size: 14px; opacity: 0.9;">A new version is ready.</div>
            </div>
            <button onclick="window.pwaManager.updateApp()" style="
                background: white;
                color: #3b82f6;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            ">Update</button>
        `;
        
        document.body.appendChild(updateBanner);
    }
    
    updateApp() {
        // Skip waiting and reload
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
    }
    
    showInstallButton() {
        // Check if button already exists
        if (document.getElementById('install-button')) return;
        
        const installButton = document.createElement('button');
        installButton.id = 'install-button';
        installButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            background: linear-gradient(135deg, #10b981, #06b6d4);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            z-index: 9998;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        `;
        
        installButton.innerHTML = `
            <span style="font-size: 20px;">📱</span>
            Install App
        `;
        
        installButton.addEventListener('click', () => {
            this.installApp();
        });
        
        installButton.addEventListener('mouseenter', () => {
            installButton.style.transform = 'scale(1.05)';
        });
        
        installButton.addEventListener('mouseleave', () => {
            installButton.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(installButton);
    }
    
    hideInstallButton() {
        const button = document.getElementById('install-button');
        if (button) {
            button.remove();
        }
    }
    
    async installApp() {
        if (!this.deferredPrompt) {
            console.log('Install prompt not available');
            return;
        }
        
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`User response: ${outcome}`);
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
        
        // Hide install button
        this.hideInstallButton();
    }
    
    checkIfInstalled() {
        // Check if app is installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ App running in standalone mode');
            this.hideInstallButton();
        }
        
        // Check for iOS
        if (window.navigator.standalone === true) {
            console.log('✅ App running on iOS in standalone mode');
            this.hideInstallButton();
        }
    }
    
    handleConnectivity() {
        // Show offline indicator
        const showOfflineIndicator = () => {
            if (document.getElementById('offline-indicator')) return;
            
            const indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: #ef4444;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            indicator.innerHTML = `
                <span>📡</span> Offline Mode
            `;
            
            document.body.appendChild(indicator);
        };
        
        const hideOfflineIndicator = () => {
            const indicator = document.getElementById('offline-indicator');
            if (indicator) {
                indicator.remove();
            }
        };
        
        // Check initial connection
        if (!navigator.onLine) {
            showOfflineIndicator();
        }
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            hideOfflineIndicator();
            if (window.notify) {
                window.notify.show('✅ Back online!', 'success');
            }
        });
        
        window.addEventListener('offline', () => {
            showOfflineIndicator();
            if (window.notify) {
                window.notify.show('📡 Working offline', 'info');
            }
        });
    }
    
    // Cache additional resources
    async cacheResources(urls) {
        if (!navigator.serviceWorker.controller) return;
        
        navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_URLS',
            urls: urls
        });
    }
    
    // Clear all caches
    async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            
            if (window.notify) {
                window.notify.show('🗑️ Cache cleared', 'info');
            }
        }
    }
}

// Initialize PWA Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
    console.log('✅ PWA Manager initialized');
});

// Export for global use
window.PWAManager = PWAManager;