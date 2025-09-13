// Enhanced Mobile Navigation - Complete UI/UX Solution
document.addEventListener('DOMContentLoaded', function() {
    console.log('[MobileNav] Initializing enhanced mobile navigation');
    
    // Configuration
    const config = {
        mobileBreakpoint: 768,
        scrollOffset: 80,
        animationDuration: 300
    };
    
    // State management
    let isMenuOpen = false;
    let scrollPosition = 0;
    
    // Create navigation structure with improved mobile menu
    function createNavigation() {
        const origin = window.location.origin;
        const currentPath = window.location.pathname;
        
        // Remove existing navigation
        const existingNavs = document.querySelectorAll('.site-nav');
        existingNavs.forEach(nav => nav.remove());
        
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.onclick = closeMobileMenu;
        
        // Navigation HTML with mobile-optimized structure
        const navHTML = `
        <nav class="site-nav" role="navigation" aria-label="Main navigation">
            <div class="site-nav-container">
                <a href="${origin}/" class="site-logo" aria-label="Home">
                    🏢 AI Architecture Audit
                </a>
                
                <button class="mobile-menu-toggle" 
                        onclick="toggleMobileMenu()" 
                        aria-label="Toggle menu" 
                        aria-expanded="false"
                        aria-controls="siteMenu">
                    <span></span>
                </button>
                
                <ul class="site-menu" id="siteMenu" role="menu">
                    <!-- Mobile Navigation Items -->
                    <li class="site-menu-item mobile-only" role="menuitem">
                        <a href="${origin}/" onclick="handleMenuClick(event, '/')">
                            <span>🏠</span> Home
                        </a>
                    </li>
                    
                    <li class="site-menu-item mobile-only" role="menuitem">
                        <a href="${origin}/#calculators" onclick="handleMenuClick(event, '#calculators')">
                            <span>🧮</span> Calculators
                        </a>
                    </li>
                    
                    <li class="site-menu-item mobile-only" role="menuitem">
                        <a href="${origin}/#frameworks" onclick="handleMenuClick(event, '#frameworks')">
                            <span>🚀</span> Frameworks
                        </a>
                    </li>
                    
                    <li class="site-menu-item mobile-only" role="menuitem">
                        <a href="${origin}/#about" onclick="handleMenuClick(event, '#about')">
                            <span>📖</span> About
                        </a>
                    </li>
                    
                    <li class="site-menu-item divider mobile-only"></li>
                    
                    <li class="site-menu-item mobile-only" role="menuitem">
                        <a href="${origin}/docs/" onclick="handleMenuClick(event, '/docs/')">
                            <span>📚</span> Documentation
                        </a>
                    </li>
                    
                    <li class="site-menu-item mobile-only cta" role="menuitem">
                        <a href="${origin}/calculators/" onclick="handleMenuClick(event, '/calculators/')">
                            Start Assessment →
                        </a>
                    </li>
                    
                    <!-- Desktop Navigation Items -->
                    <li class="site-menu-item desktop-only">
                        <a href="${origin}/">Home</a>
                    </li>
                    
                    <li class="site-menu-item has-dropdown desktop-only">
                        <a href="#" onclick="event.preventDefault()">Calculators</a>
                        <div class="dropdown-menu">
                            <a href="${origin}/calculators/ai-readiness/">🤖 AI Readiness</a>
                            <a href="${origin}/calculators/cloud-migration/">☁️ Cloud Migration</a>
                            <a href="${origin}/calculators/mlops-audit/">🔧 MLOps Audit</a>
                            <a href="${origin}/calculators/llm-framework/">🧠 LLM Framework</a>
                            <a href="${origin}/calculators/security-audit/">🔒 Security Audit</a>
                            <a href="${origin}/calculators/genai-security/">🛡️ GenAI Security</a>
                            <a href="${origin}/calculators/cost-optimization/">💰 Cost Optimization</a>
                        </div>
                    </li>
                    
                    <li class="site-menu-item has-dropdown desktop-only">
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
        
        // Insert navigation and overlay
        document.body.insertAdjacentHTML('afterbegin', navHTML);
        document.body.appendChild(overlay);
        
        // Set up scroll padding for anchor links
        const nav = document.querySelector('.site-nav');
        if (nav) {
            const navHeight = nav.offsetHeight;
            document.body.style.paddingTop = navHeight + 'px';
            document.documentElement.style.scrollPaddingTop = navHeight + 'px';
        }
        
        // Initialize mobile menu state
        updateMenuState();
    }
    
    // Toggle mobile menu with animations
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('siteMenu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        const overlay = document.querySelector('.menu-overlay');
        
        if (!menu || !toggle) return;
        
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            // Store current scroll position
            scrollPosition = window.pageYOffset;
            
            // Open menu
            menu.classList.add('active');
            toggle.classList.add('active');
            overlay?.classList.add('active');
            document.body.classList.add('menu-open');
            
            // Update ARIA
            toggle.setAttribute('aria-expanded', 'true');
            
            // Trap focus in menu
            trapFocus(menu);
        } else {
            closeMobileMenu();
        }
    };
    
    // Close mobile menu
    window.closeMobileMenu = function() {
        const menu = document.getElementById('siteMenu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        const overlay = document.querySelector('.menu-overlay');
        
        if (!menu || !toggle) return;
        
        isMenuOpen = false;
        
        // Close menu
        menu.classList.remove('active');
        toggle.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Update ARIA
        toggle.setAttribute('aria-expanded', 'false');
        
        // Restore scroll position
        window.scrollTo(0, scrollPosition);
        
        // Release focus trap
        releaseFocus();
    };
    
    // Handle menu item clicks
    window.handleMenuClick = function(event, target) {
        // Close menu first
        closeMobileMenu();
        
        // Handle anchor links with smooth scroll
        if (target.startsWith('#')) {
            event.preventDefault();
            const element = document.querySelector(target);
            if (element) {
                const offset = document.querySelector('.site-nav')?.offsetHeight || config.scrollOffset;
                const targetPosition = element.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL
                history.pushState(null, null, target);
            }
        }
        // Let normal links proceed
    };
    
    // Focus trap for accessibility
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
            
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });
    }
    
    // Release focus trap
    function releaseFocus() {
        const menu = document.getElementById('siteMenu');
        if (menu) {
            const newMenu = menu.cloneNode(true);
            menu.parentNode.replaceChild(newMenu, menu);
        }
    }
    
    // Update menu state based on viewport
    function updateMenuState() {
        const width = window.innerWidth;
        
        if (width > config.mobileBreakpoint && isMenuOpen) {
            closeMobileMenu();
        }
    }
    
    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateMenuState, 250);
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Prevent scroll when menu is open
    document.addEventListener('touchmove', function(e) {
        if (isMenuOpen && !e.target.closest('.site-menu')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle back button
    window.addEventListener('popstate', function() {
        if (isMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Highlight current page
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.site-menu-item a');
        
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href.replace(window.location.origin, ''))) {
                item.classList.add('current');
            }
        });
    }
    
    // Initialize navigation
    createNavigation();
    highlightCurrentPage();
    
    // Log successful initialization
    console.log('[MobileNav] Enhanced navigation initialized successfully');
});