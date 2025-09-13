// Dark Mode System
class DarkMode {
    constructor() {
        this.isDark = this.loadPreference();
        this.init();
    }
    
    init() {
        // Apply saved theme immediately
        this.applyTheme();
        
        // Create toggle button
        this.createToggle();
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.getPreference() === 'system') {
                    this.isDark = e.matches;
                    this.applyTheme();
                }
            });
        }
    }
    
    loadPreference() {
        const saved = localStorage.getItem('theme-preference');
        if (saved === 'dark') return true;
        if (saved === 'light') return false;
        
        // Default to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        return false;
    }
    
    getPreference() {
        return localStorage.getItem('theme-preference') || 'system';
    }
    
    savePreference(isDark) {
        localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
        this.isDark = isDark;
    }
    
    createToggle() {
        // Create toggle button
        const toggle = document.createElement('button');
        toggle.id = 'dark-mode-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: white;
            border: 2px solid #e5e7eb;
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        toggle.innerHTML = this.isDark ? '☀️' : '🌙';
        
        toggle.addEventListener('click', () => {
            this.toggle();
        });
        
        // Add hover effect
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1)';
        });
        
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(toggle);
    }
    
    toggle() {
        this.isDark = !this.isDark;
        this.savePreference(this.isDark);
        this.applyTheme();
        
        // Update toggle button
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) {
            toggle.innerHTML = this.isDark ? '☀️' : '🌙';
            
            // Show notification
            if (window.notify) {
                window.notify.show(
                    this.isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled',
                    'info'
                );
            }
        }
    }
    
    applyTheme() {
        if (this.isDark) {
            document.documentElement.classList.add('dark-mode');
            this.injectDarkStyles();
        } else {
            document.documentElement.classList.remove('dark-mode');
            this.removeDarkStyles();
        }
    }
    
    injectDarkStyles() {
        // Check if styles already exist
        if (document.getElementById('dark-mode-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'dark-mode-styles';
        styles.textContent = `
            /* Dark Mode Styles */
            .dark-mode {
                --bg-primary: #1f2937;
                --bg-secondary: #111827;
                --bg-tertiary: #374151;
                --text-primary: #f9fafb;
                --text-secondary: #e5e7eb;
                --text-tertiary: #9ca3af;
                --border-color: #4b5563;
                --accent-primary: #8b5cf6;
                --accent-secondary: #a78bfa;
            }
            
            .dark-mode body {
                background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
                color: var(--text-primary);
            }
            
            .dark-mode .header,
            .dark-mode header {
                background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
                color: var(--text-primary);
            }
            
            .dark-mode .container,
            .dark-mode .section,
            .dark-mode .card,
            .dark-mode .test-container,
            .dark-mode .test-category {
                background: var(--bg-primary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            .dark-mode .nav-tabs {
                background: var(--bg-secondary);
                border-color: var(--border-color);
            }
            
            .dark-mode .nav-tab {
                background: var(--bg-tertiary);
                color: var(--text-secondary);
                border-color: var(--border-color);
            }
            
            .dark-mode .nav-tab.active,
            .dark-mode .nav-tab:hover {
                background: var(--accent-primary);
                color: white;
            }
            
            .dark-mode input,
            .dark-mode select,
            .dark-mode textarea {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            .dark-mode input:focus,
            .dark-mode select:focus,
            .dark-mode textarea:focus {
                border-color: var(--accent-primary);
                outline-color: var(--accent-primary);
            }
            
            .dark-mode table {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .dark-mode th {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            .dark-mode td {
                border-color: var(--border-color);
            }
            
            .dark-mode .btn,
            .dark-mode button {
                background: var(--accent-primary);
                color: white;
                border-color: var(--accent-primary);
            }
            
            .dark-mode .btn:hover,
            .dark-mode button:hover {
                background: var(--accent-secondary);
                border-color: var(--accent-secondary);
            }
            
            .dark-mode .btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            .dark-mode .alert {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            .dark-mode .alert-info {
                background: #1e3a8a;
                border-color: #2563eb;
            }
            
            .dark-mode .alert-success {
                background: #14532d;
                border-color: #16a34a;
            }
            
            .dark-mode .alert-warning {
                background: #713f12;
                border-color: #ca8a04;
            }
            
            .dark-mode .alert-danger {
                background: #7f1d1d;
                border-color: #dc2626;
            }
            
            .dark-mode .score-card {
                background: var(--bg-tertiary);
                border-color: var(--border-color);
            }
            
            .dark-mode .dropdown-menu {
                background: var(--bg-secondary);
                border-color: var(--border-color);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            }
            
            .dark-mode .dropdown-menu a {
                color: var(--text-primary);
            }
            
            .dark-mode .dropdown-menu a:hover {
                background: var(--bg-tertiary);
            }
            
            .dark-mode .site-nav {
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border-color);
            }
            
            .dark-mode .site-logo {
                color: var(--text-primary);
            }
            
            .dark-mode .site-menu-item a {
                color: var(--text-secondary);
            }
            
            .dark-mode .site-menu-item a:hover {
                color: var(--accent-secondary);
            }
            
            .dark-mode footer {
                background: var(--bg-secondary);
                border-top-color: var(--border-color);
                color: var(--text-secondary);
            }
            
            .dark-mode #dark-mode-toggle {
                background: var(--bg-tertiary);
                border-color: var(--border-color);
            }
            
            /* Fix for notification system in dark mode */
            .dark-mode .notification {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            /* Fix for loading overlay in dark mode */
            .dark-mode #loading-overlay > div > div {
                background: var(--bg-primary);
                color: var(--text-primary);
            }
            
            /* Smooth transitions */
            .dark-mode,
            .dark-mode * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    removeDarkStyles() {
        const styles = document.getElementById('dark-mode-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Initialize dark mode when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.darkMode = new DarkMode();
    console.log('✅ Dark mode system initialized');
});

// Export for global use
window.DarkMode = DarkMode;