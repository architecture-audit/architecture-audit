// Simple Site Navigation - Direct HTML injection
(function() {
    function injectNavigation() {
        const navContainer = document.querySelector('.site-nav-container');
        if (!navContainer) {
            console.error('Navigation container not found');
            return;
        }

        // Direct HTML injection for simple dropdown navigation
        navContainer.innerHTML = `
            <a href="/" class="site-logo">
                🏢 AI Architecture Audit
            </a>
            
            <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">☰</button>
            
            <ul class="site-menu" id="siteMenu">
                <li class="site-menu-item">
                    <a href="/">Home</a>
                </li>
                
                <li class="site-menu-item has-dropdown">
                    <a href="#" onclick="event.preventDefault()">Calculators</a>
                    <div class="dropdown-menu">
                        <a href="/calculators/ai-readiness/">🤖 AI Readiness</a>
                        <a href="/calculators/cloud-migration/">☁️ Cloud Migration</a>
                        <a href="/calculators/mlops-audit/">🔧 MLOps Audit</a>
                        <a href="/calculators/llm-framework/">🧠 LLM Framework</a>
                        <a href="/calculators/security-audit/">🔒 Security Audit</a>
                        <a href="/calculators/genai-security/">🛡️ GenAI Security</a>
                        <a href="/calculators/cost-optimization/">💰 Cost Optimization</a>
                    </div>
                </li>
                
                <li class="site-menu-item has-dropdown">
                    <a href="#" onclick="event.preventDefault()">Documentation</a>
                    <div class="dropdown-menu">
                        <a href="/docs/ai-readiness/">📖 AI Readiness Guide</a>
                        <a href="/docs/cloud-migration/">📖 Cloud Migration Guide</a>
                        <a href="/docs/mlops-audit/">📖 MLOps Audit Guide</a>
                        <a href="/docs/llm-framework/">📖 LLM Framework Guide</a>
                        <a href="/docs/security-audit/">📖 Security Audit Guide</a>
                        <a href="/docs/genai-security/">📖 GenAI Security Guide</a>
                        <a href="/docs/cost-optimization/">📖 Cost Optimization Guide</a>
                    </div>
                </li>
                
                <li class="site-menu-item">
                    <a href="/calculator-hub.html">Quick Tools</a>
                </li>
            </ul>
        `;
        
        console.log('Simple navigation injected successfully');
    }

    // Mobile menu toggle
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('siteMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavigation);
    } else {
        injectNavigation();
    }
})();