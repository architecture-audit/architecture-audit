// Site-wide Navigation Component - Fixed Version
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Navigation] Loading from:', window.location.pathname);
    
    // Remove any existing navigation first
    const existingNavs = document.querySelectorAll('.site-nav');
    existingNavs.forEach(nav => {
        console.log('[Navigation] Removing existing navigation');
        nav.remove();
    });
    
    // Force absolute URLs using window.location.origin
    const origin = window.location.origin;
    console.log('[Navigation] Using origin:', origin);
    
    // Create navigation HTML with fully qualified absolute URLs
    const navHTML = `
    <nav class="site-nav">
        <div class="site-nav-container">
            <a href="${origin}/" class="site-logo">
                🏢 AI Architecture Audit
            </a>
            
            <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">☰</button>
            
            <ul class="site-menu" id="siteMenu">
                <li class="site-menu-item">
                    <a href="${origin}/">Home</a>
                </li>
                
                <li class="site-menu-item has-dropdown">
                    <a href="#" onclick="event.preventDefault()">Calculators</a>
                    <div class="dropdown-menu">
                        <a href="${origin}/calculators/ai-readiness/" onclick="console.log('Navigating to:', this.href)">🤖 AI Readiness</a>
                        <a href="${origin}/calculators/cloud-migration/" onclick="console.log('Navigating to:', this.href)">☁️ Cloud Migration</a>
                        <a href="${origin}/calculators/mlops-audit/" onclick="console.log('Navigating to:', this.href)">🔧 MLOps Audit</a>
                        <a href="${origin}/calculators/llm-framework/" onclick="console.log('Navigating to:', this.href)">🧠 LLM Framework</a>
                        <a href="${origin}/calculators/security-audit/" onclick="console.log('Navigating to:', this.href)">🔒 Security Audit</a>
                        <a href="${origin}/calculators/genai-security/" onclick="console.log('Navigating to:', this.href)">🛡️ GenAI Security</a>
                        <a href="${origin}/calculators/cost-optimization/" onclick="console.log('Navigating to:', this.href)">💰 Cost Optimization</a>
                    </div>
                </li>
                
                <li class="site-menu-item has-dropdown">
                    <a href="#" onclick="event.preventDefault()">Documentation</a>
                    <div class="dropdown-menu">
                        <a href="${origin}/docs/ai-readiness/">📖 AI Readiness Guide</a>
                        <a href="${origin}/docs/cloud-migration/">📖 Cloud Migration Guide</a>
                        <a href="${origin}/docs/mlops-audit/">📖 MLOps Audit Guide</a>
                        <a href="${origin}/docs/llm-framework/">📖 LLM Framework Guide</a>
                        <a href="${origin}/docs/security-audit/">📖 Security Audit Guide</a>
                        <a href="${origin}/docs/genai-security/">📖 GenAI Security Guide</a>
                        <a href="${origin}/docs/cost-optimization/">📖 Cost Optimization Guide</a>
                    </div>
                </li>
            </ul>
        </div>
    </nav>
    `;
    
    // Insert navigation into container or at beginning of body
    const navContainer = document.getElementById('site-navigation');
    if (navContainer) {
        navContainer.innerHTML = navHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }
    
    // Add click handlers to debug navigation issues
    document.querySelectorAll('.site-nav a[href^="/"]').forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('[Navigation] Clicked:', this.getAttribute('href'));
            console.log('[Navigation] Will navigate to:', this.href);
            // Don't prevent default - let the link work normally
        });
    });
    
    // Log all calculator links for debugging
    console.log('[Navigation] Created links:');
    document.querySelectorAll('.site-nav a[href*="calculator"]').forEach(link => {
        console.log(`  ${link.textContent.trim()}: ${link.href}`);
    });
    
    // Adjust body padding to account for fixed navigation
    const nav = document.querySelector('.site-nav');
    if (nav) {
        const navHeight = nav.offsetHeight;
        document.body.style.paddingTop = navHeight + 'px';
    }
    
    // Highlight current page in navigation
    highlightCurrentPage();
    
    // Dispatch event for mobile navigation handler
    document.dispatchEvent(new Event('navigationInjected'));
});

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('siteMenu');
    menu.classList.toggle('active');
}

// Highlight current page in navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.site-menu-item a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
            item.style.color = '#10b981';
        }
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('siteMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// Make function global
window.toggleMobileMenu = toggleMobileMenu;
