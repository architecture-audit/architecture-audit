// Mega Navigation Component - Scalable for 50+ Frameworks
// Uses navigation-config.js as the single source of truth

class MegaNavigation {
    constructor() {
        this.config = typeof NavigationConfig !== 'undefined' ? NavigationConfig : {};
        this.searchDebounceTimer = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    render() {
        const navHTML = `
        <nav class="mega-nav" role="navigation">
            <div class="mega-nav-container">
                <!-- Logo -->
                <a href="/" class="mega-nav-logo">
                    🏢 AI Architecture Audit
                </a>

                <!-- Search Bar (Desktop) -->
                <div class="mega-nav-search">
                    <input type="search"
                           class="mega-nav-search-input"
                           placeholder="${this.config.search?.placeholder || 'Search frameworks...'}"
                           aria-label="Search frameworks">
                    <div class="mega-nav-search-results"></div>
                </div>

                <!-- Primary Navigation -->
                <ul class="mega-nav-menu">
                    <li class="mega-nav-item">
                        <a href="/catalog.html" class="mega-nav-link mega-nav-highlight">
                            📚 Catalog
                        </a>
                    </li>

                    <li class="mega-nav-item mega-nav-has-dropdown">
                        <button class="mega-nav-link" aria-expanded="false">
                            ⚡ Quick Start
                            <span class="mega-nav-arrow">▼</span>
                        </button>
                        <div class="mega-dropdown">
                            <div class="mega-dropdown-section">
                                <h3>Most Popular</h3>
                                <a href="/calculators/ai-readiness/">🤖 AI Readiness Assessment</a>
                                <a href="/calculators/cloud-migration/">☁️ Cloud Migration</a>
                                <a href="/calculators/security-audit/">🔒 Security Audit</a>
                                <a href="/calculators/well-architected/">🏗️ Well-Architected</a>
                            </div>
                            <div class="mega-dropdown-section">
                                <h3>New & Trending</h3>
                                <a href="/calculators/genai-security/">🛡️ GenAI Security</a>
                                <a href="/calculators/llm-framework/">🧠 LLM Framework</a>
                                <a href="/calculators/mlops-audit/">🔧 MLOps Audit</a>
                                <a href="/calculators/cost-optimization/">💰 Cost Optimization</a>
                            </div>
                        </div>
                    </li>

                    <li class="mega-nav-item">
                        <a href="/docs/" class="mega-nav-link">
                            📖 Docs
                        </a>
                    </li>
                </ul>

                <!-- Mobile Menu Toggle -->
                <button class="mega-nav-mobile-toggle" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <!-- Mobile Menu -->
            <div class="mega-nav-mobile">
                <div class="mega-nav-mobile-search">
                    <input type="search" placeholder="Search frameworks...">
                </div>
                <ul class="mega-nav-mobile-menu">
                    <li><a href="/">🏠 Home</a></li>
                    <li><a href="/catalog.html">📚 Browse All Frameworks</a></li>
                    <li><a href="/docs">📖 Documentation</a></li>
                </ul>
            </div>
        </nav>

        <style>
            /* Mega Navigation Styles */
            .mega-nav {
                background: #1e293b;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .mega-nav-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 2rem;
                display: flex;
                align-items: center;
                height: 64px;
                gap: 2rem;
            }

            .mega-nav-logo {
                font-size: 1.25rem;
                font-weight: bold;
                color: white;
                text-decoration: none;
                white-space: nowrap;
                transition: color 0.2s;
            }

            .mega-nav-logo:hover {
                color: #10b981;
            }

            /* Search Bar */
            .mega-nav-search {
                flex: 1;
                max-width: 500px;
                position: relative;
            }

            .mega-nav-search-input {
                width: 100%;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.05);
                color: white;
                font-size: 0.95rem;
                transition: all 0.2s;
            }

            .mega-nav-search-input::placeholder {
                color: rgba(255,255,255,0.5);
            }

            .mega-nav-search-input:focus {
                outline: none;
                background: white;
                color: #1e293b;
                border-color: #10b981;
            }

            .mega-nav-search-results {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                margin-top: 0.5rem;
                display: none;
                max-height: 400px;
                overflow-y: auto;
            }

            .mega-nav-search-results.active {
                display: block;
            }

            /* Menu */
            .mega-nav-menu {
                display: flex;
                list-style: none;
                margin: 0;
                padding: 0;
                gap: 0.5rem;
            }

            .mega-nav-link {
                color: white;
                text-decoration: none;
                padding: 0.75rem 1rem;
                border-radius: 6px;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: none;
                border: none;
                font-size: 1rem;
                cursor: pointer;
                font-family: inherit;
            }

            .mega-nav-link:hover {
                background: rgba(255,255,255,0.1);
            }

            .mega-nav-highlight {
                background: #10b981;
                font-weight: 500;
            }

            .mega-nav-highlight:hover {
                background: #059669;
            }

            .mega-nav-arrow {
                font-size: 0.7rem;
                transition: transform 0.2s;
            }

            /* Mega Dropdown */
            .mega-nav-has-dropdown {
                position: relative;
            }

            .mega-dropdown {
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                padding: 1.5rem;
                margin-top: 0.5rem;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s;
                min-width: 400px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }

            .mega-nav-has-dropdown:hover .mega-dropdown,
            .mega-nav-has-dropdown:focus-within .mega-dropdown {
                opacity: 1;
                visibility: visible;
            }

            .mega-nav-has-dropdown:hover .mega-nav-arrow {
                transform: rotate(180deg);
            }

            .mega-dropdown-section h3 {
                color: #64748b;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 0.75rem;
                font-weight: 600;
            }

            .mega-dropdown-section a {
                display: block;
                padding: 0.5rem 0.75rem;
                color: #1e293b;
                text-decoration: none;
                border-radius: 6px;
                transition: background 0.2s;
                margin-bottom: 0.25rem;
            }

            .mega-dropdown-section a:hover {
                background: #f1f5f9;
                color: #10b981;
            }

            /* Mobile Toggle */
            .mega-nav-mobile-toggle {
                display: none;
                flex-direction: column;
                gap: 4px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
            }

            .mega-nav-mobile-toggle span {
                width: 24px;
                height: 2px;
                background: white;
                transition: all 0.3s;
            }

            /* Mobile Menu */
            .mega-nav-mobile {
                display: none;
                position: fixed;
                top: 64px;
                left: 0;
                right: 0;
                bottom: 0;
                background: #1e293b;
                padding: 1rem;
                overflow-y: auto;
            }

            .mega-nav-mobile.active {
                display: block;
            }

            .mega-nav-mobile-search {
                margin-bottom: 1.5rem;
            }

            .mega-nav-mobile-search input {
                width: 100%;
                padding: 0.75rem;
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.2);
                background: rgba(255,255,255,0.1);
                color: white;
                font-size: 1rem;
            }

            .mega-nav-mobile-menu {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .mega-nav-mobile-menu a {
                display: block;
                padding: 1rem;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                transition: background 0.2s;
            }

            .mega-nav-mobile-menu a:hover {
                background: rgba(255,255,255,0.1);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .mega-nav-search,
                .mega-nav-menu {
                    display: none;
                }

                .mega-nav-mobile-toggle {
                    display: flex;
                }

                .mega-nav-container {
                    justify-content: space-between;
                }
            }

            /* Body padding for fixed nav */
            body {
                padding-top: 64px;
            }
        </style>
        `;

        // Remove existing navigation
        const existingNavs = document.querySelectorAll('.site-nav, .mega-nav');
        existingNavs.forEach(nav => nav.remove());

        // Insert new navigation
        document.body.insertAdjacentHTML('afterbegin', navHTML);

        // Initialize event handlers
        this.initEventHandlers();
    }

    initEventHandlers() {
        // Search functionality
        const searchInput = document.querySelector('.mega-nav-search-input');
        const searchResults = document.querySelector('.mega-nav-search-results');

        if (searchInput && searchResults) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.handleSearch(e.target.value, searchResults);
                }, 300);
            });

            // Close search on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.mega-nav-search')) {
                    searchResults.classList.remove('active');
                }
            });
        }

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mega-nav-mobile-toggle');
        const mobileMenu = document.querySelector('.mega-nav-mobile');

        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
        }

        // Mobile search
        const mobileSearchInput = document.querySelector('.mega-nav-mobile-search input');
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    // Handle mobile search
                    console.log('Mobile search:', e.target.value);
                }, 300);
            });
        }
    }

    handleSearch(query, resultsContainer) {
        if (!query || query.length < 2) {
            resultsContainer.classList.remove('active');
            return;
        }

        const results = this.config.searchFrameworks ?
            this.config.searchFrameworks(query) : [];

        if (results.length > 0) {
            resultsContainer.innerHTML = results.map(r => `
                <a href="${r.calculatorUrl}" class="search-result">
                    <span class="search-result-icon">${r.icon}</span>
                    <div class="search-result-content">
                        <div class="search-result-title">${r.name}</div>
                        <div class="search-result-category">${r.category}</div>
                    </div>
                </a>
            `).join('');

            // Add search result styles
            if (!document.querySelector('#search-result-styles')) {
                const styles = `
                <style id="search-result-styles">
                    .search-result {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding: 0.75rem 1rem;
                        text-decoration: none;
                        color: #1e293b;
                        transition: background 0.2s;
                        border-bottom: 1px solid #f1f5f9;
                    }
                    .search-result:last-child {
                        border-bottom: none;
                    }
                    .search-result:hover {
                        background: #f8fafc;
                    }
                    .search-result-icon {
                        font-size: 1.5rem;
                    }
                    .search-result-title {
                        font-weight: 600;
                        margin-bottom: 0.125rem;
                    }
                    .search-result-category {
                        font-size: 0.875rem;
                        color: #64748b;
                    }
                </style>
                `;
                document.head.insertAdjacentHTML('beforeend', styles);
            }

            resultsContainer.classList.add('active');
        } else {
            resultsContainer.innerHTML = `
                <div style="padding: 1rem; text-align: center; color: #64748b;">
                    No results found for "${query}"
                </div>
            `;
            resultsContainer.classList.add('active');
        }
    }
}

// Initialize navigation
new MegaNavigation();