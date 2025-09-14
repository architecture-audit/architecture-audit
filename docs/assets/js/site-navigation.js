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
    <!-- Skip to main content link for accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <div class="site-nav-container">
            <a href="${origin}/" class="site-logo" aria-label="AI Architecture Audit - Home">
                🏢 AI Architecture Audit
            </a>

            <button class="mobile-menu-toggle"
                    onclick="toggleMobileMenu()"
                    aria-label="Toggle navigation menu"
                    aria-expanded="false"
                    aria-controls="siteMenu">☰</button>
            
            <ul class="site-menu" id="siteMenu">
                <li class="site-menu-item">
                    <a href="${origin}/">Home</a>
                </li>
                
                <!-- Mobile-only menu items -->
                <li class="site-menu-item mobile-only">
                    <a href="${origin}/#calculators" onclick="closeMobileMenu()">🧮 Calculators</a>
                </li>
                
                <li class="site-menu-item mobile-only">
                    <a href="${origin}/#about" onclick="closeMobileMenu()">📖 About</a>
                </li>
                
                <!-- Desktop-only dropdown items -->
                <li class="site-menu-item has-dropdown desktop-only">
                    <button class="dropdown-toggle"
                            aria-haspopup="true"
                            aria-expanded="false"
                            onclick="event.preventDefault()">
                        Calculators
                        <span class="dropdown-arrow" aria-hidden="true">▼</span>
                    </button>
                    <div class="dropdown-menu" role="menu">
                        <a href="${origin}/calculators/" style="font-weight: 600; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.5rem;">🧮 View All Calculators</a>
                        <a href="${origin}/calculators/ai-readiness/" onclick="console.log('Navigating to:', this.href)">🤖 AI Readiness</a>
                        <a href="${origin}/calculators/cloud-migration/" onclick="console.log('Navigating to:', this.href)">☁️ Cloud Migration</a>
                        <a href="${origin}/calculators/mlops-audit/" onclick="console.log('Navigating to:', this.href)">🔧 MLOps Audit</a>
                        <a href="${origin}/calculators/llm-framework/" onclick="console.log('Navigating to:', this.href)">🧠 LLM Framework</a>
                        <a href="${origin}/calculators/security-audit/" onclick="console.log('Navigating to:', this.href)">🔒 Security Audit</a>
                        <a href="${origin}/calculators/genai-security/" onclick="console.log('Navigating to:', this.href)">🛡️ GenAI Security</a>
                        <a href="${origin}/calculators/cost-optimization/" onclick="console.log('Navigating to:', this.href)">💰 Cost Optimization</a>
                        <a href="${origin}/calculators/well-architected/" onclick="console.log('Navigating to:', this.href)">🏗️ Well-Architected</a>
                    </div>
                </li>
                
                <li class="site-menu-item has-dropdown desktop-only">
                    <a href="${origin}/docs/"
                       aria-haspopup="true"
                       aria-expanded="false">Documentation</a>
                    <div class="dropdown-menu" role="menu">
                        <a href="${origin}/docs/">📚 All Documentation</a>
                        <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e2e8f0;">
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
        
        // Add scroll padding to prevent headings from hiding under fixed nav
        document.documentElement.style.scrollPaddingTop = navHeight + 'px';
    }
    
    // Highlight current page in navigation
    highlightCurrentPage();
    
    // Dispatch event for mobile navigation handler
    document.dispatchEvent(new Event('navigationInjected'));
    
    // Handle anchor link clicks with offset for fixed header
    document.querySelectorAll('a[href*="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.includes('#') && !href.startsWith('#')) {
                const hash = href.substring(href.indexOf('#'));
                const target = document.querySelector(hash);
                if (target) {
                    e.preventDefault();
                    const nav = document.querySelector('.site-nav');
                    const offset = nav ? nav.offsetHeight + 20 : 80;
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL
                    history.pushState(null, null, href);
                    
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            }
        });
    });
});

// Toggle mobile menu with accessibility
function toggleMobileMenu() {
    const menu = document.getElementById('siteMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const isOpen = menu.classList.contains('active');

    menu.classList.toggle('active');

    // Update ARIA attributes
    if (toggle) {
        toggle.setAttribute('aria-expanded', !isOpen);
        toggle.innerHTML = !isOpen ? '✕' : '☰';
    }

    // Trap focus in mobile menu when open
    if (!isOpen) {
        menu.setAttribute('tabindex', '-1');
        menu.focus();
    }
}

// Close mobile menu
function closeMobileMenu() {
    const menu = document.getElementById('siteMenu');
    if (menu) {
        menu.classList.remove('active');
    }
}

// Highlight current page in navigation with ARIA
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.site-menu-item a');

    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
            item.style.color = '#10b981';
            item.setAttribute('aria-current', 'page');
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
