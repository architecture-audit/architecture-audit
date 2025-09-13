// Enhanced Site Navigation with Categories
(function() {
    function setupNavigation() {
        const navContainer = document.querySelector('.site-nav-container');
        if (!navContainer) {
            console.error('Navigation container not found');
            return;
        }

        // Create the enhanced navigation HTML
        const navHTML = `
            <a href="/" class="site-logo">
                🏢 AI Architecture Audit
            </a>
            
            <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">☰</button>
            
            <ul class="site-menu" id="siteMenu">
                <li class="site-menu-item">
                    <a href="/">Home</a>
                </li>
                
                <li class="site-menu-item has-mega-menu">
                    <a href="#" onclick="event.preventDefault()">Calculators</a>
                    <div class="mega-menu">
                        <div class="mega-menu-grid">
                            <!-- AI & ML Category -->
                            <div class="mega-menu-category">
                                <h4><span>🤖</span> AI & Machine Learning</h4>
                                <div class="mega-menu-links">
                                    <a href="/calculators/ai-readiness/">
                                        <span>📊</span> AI Readiness Assessment
                                    </a>
                                    <a href="/calculators/llm-framework/">
                                        <span>🧠</span> LLM Framework Selection
                                    </a>
                                    <a href="/calculators/mlops-audit/">
                                        <span>🔧</span> MLOps Maturity Audit
                                    </a>
                                    <a href="/calculators/genai-security/">
                                        <span>🔐</span> GenAI Security Framework
                                        <span class="integrated-tag">NEW</span>
                                    </a>
                                </div>
                            </div>

                            <!-- Security Category -->
                            <div class="mega-menu-category">
                                <h4><span>🔒</span> Security & Compliance</h4>
                                <div class="mega-menu-links">
                                    <a href="/calculators/security-audit/">
                                        <span>🛡️</span> Security Audit Framework
                                        <span class="integrated-tag">+ OWASP</span>
                                    </a>
                                    <a href="/calculators/genai-security/">
                                        <span>🤖</span> GenAI Security
                                        <span class="integrated-tag">+ Blue Team</span>
                                    </a>
                                </div>
                            </div>

                            <!-- Cloud & Infrastructure Category -->
                            <div class="mega-menu-category">
                                <h4><span>☁️</span> Cloud & Infrastructure</h4>
                                <div class="mega-menu-links">
                                    <a href="/calculators/cloud-migration/">
                                        <span>📦</span> Cloud Migration Planner
                                    </a>
                                    <a href="/calculators/cost-optimization/">
                                        <span>💰</span> Cloud Cost Optimization
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                
                <li class="site-menu-item has-mega-menu">
                    <a href="#" onclick="event.preventDefault()">Documentation</a>
                    <div class="mega-menu">
                        <div class="mega-menu-grid">
                            <!-- AI & ML Docs -->
                            <div class="mega-menu-category">
                                <h4><span>📚</span> AI & ML Guides</h4>
                                <div class="mega-menu-links">
                                    <a href="/docs/ai-readiness/">AI Readiness Guide</a>
                                    <a href="/docs/llm-framework/">LLM Framework Guide</a>
                                    <a href="/docs/mlops-audit/">MLOps Audit Guide</a>
                                    <a href="/docs/genai-security/">GenAI Security Guide</a>
                                </div>
                            </div>

                            <!-- Security Docs -->
                            <div class="mega-menu-category">
                                <h4><span>📚</span> Security Guides</h4>
                                <div class="mega-menu-links">
                                    <a href="/docs/security-audit/">Security Audit Guide</a>
                                    <a href="/docs/genai-security/">GenAI Security Guide</a>
                                </div>
                            </div>

                            <!-- Cloud Docs -->
                            <div class="mega-menu-category">
                                <h4><span>📚</span> Cloud Guides</h4>
                                <div class="mega-menu-links">
                                    <a href="/docs/cloud-migration/">Cloud Migration Guide</a>
                                    <a href="/docs/cost-optimization/">Cost Optimization Guide</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>

                <li class="site-menu-item">
                    <a href="/calculator-hub.html">Quick Tools</a>
                </li>
            </ul>
        `;

        // Replace the existing navigation content
        navContainer.innerHTML = navHTML;
        console.log('Enhanced navigation loaded successfully');
    }

    // Mobile menu toggle function
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('siteMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNavigation);
    } else {
        // DOM is already loaded, run immediately
        setupNavigation();
    }
})();