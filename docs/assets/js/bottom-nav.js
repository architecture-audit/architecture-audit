// Bottom Navigation - Simple and Reliable
document.addEventListener('DOMContentLoaded', function() {
    console.log('[BottomNav] Initializing bottom navigation');
    
    const origin = window.location.origin;
    const currentPath = window.location.pathname;
    
    // Check if mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Create mobile header
    function createMobileHeader() {
        if (!isMobile()) return;
        
        // Remove any existing mobile header
        const existingHeader = document.querySelector('.mobile-header');
        if (existingHeader) existingHeader.remove();
        
        const headerHTML = `
        <div class="mobile-header">
            <a href="${origin}/" class="logo">
                🏢 AI Architecture Audit
            </a>
        </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
    
    // Create bottom navigation
    function createBottomNav() {
        if (!isMobile()) return;
        
        // Remove any existing bottom nav
        const existingNav = document.querySelector('.bottom-nav');
        if (existingNav) existingNav.remove();
        
        const navHTML = `
        <nav class="bottom-nav" role="navigation" aria-label="Mobile navigation">
            <a href="${origin}/" class="bottom-nav-item" data-section="home">
                <span class="icon">🏠</span>
                <span class="label">Home</span>
            </a>
            
            <a href="${origin}/#calculators" class="bottom-nav-item" data-section="calculators">
                <span class="icon">🧮</span>
                <span class="label">Frameworks</span>
            </a>
            
            <a href="${origin}/#features" class="bottom-nav-item" data-section="features">
                <span class="icon">🚀</span>
                <span class="label">Features</span>
            </a>
            
            <a href="${origin}/docs/" class="bottom-nav-item" data-section="docs">
                <span class="icon">📚</span>
                <span class="label">Docs</span>
            </a>
            
            <a href="${origin}/#about" class="bottom-nav-item" data-section="about">
                <span class="icon">📖</span>
                <span class="label">About</span>
            </a>
        </nav>
        `;
        
        document.body.insertAdjacentHTML('beforeend', navHTML);
        
        // Handle navigation clicks
        attachNavigationHandlers();
        
        // Highlight current page
        highlightCurrentPage();
    }
    
    // Handle navigation with smooth scroll
    function attachNavigationHandlers() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Handle anchor links
                if (href.includes('#')) {
                    const [path, hash] = href.split('#');
                    
                    // If we're on the same page, smooth scroll
                    if (path === origin + '/' || path === currentPath) {
                        e.preventDefault();
                        const target = document.getElementById(hash);
                        
                        if (target) {
                            const offset = document.querySelector('.mobile-header')?.offsetHeight || 60;
                            const targetPosition = target.offsetTop - offset - 10;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                            
                            // Update URL
                            history.pushState(null, null, '#' + hash);
                        }
                    }
                    // Otherwise, let the browser handle navigation
                }
            });
        });
    }
    
    // Highlight current page/section
    function highlightCurrentPage() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        const currentHash = window.location.hash;
        
        navItems.forEach(item => {
            item.classList.remove('current');
            const href = item.getAttribute('href');
            
            // Check if this is the current page
            if (currentPath.includes('/docs/') && href.includes('/docs/')) {
                item.classList.add('current');
            } else if (currentPath === '/' || currentPath === '/index.html') {
                if (currentHash && href.includes(currentHash)) {
                    item.classList.add('current');
                } else if (!currentHash && item.dataset.section === 'home') {
                    item.classList.add('current');
                }
            }
        });
    }
    
    // Update on scroll to highlight visible section
    function updateActiveSection() {
        if (!isMobile()) return;
        
        const sections = ['calculators', 'features', 'about'];
        const navItems = document.querySelectorAll('.bottom-nav-item');
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        let currentSection = 'home';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section && section.offsetTop < scrollPosition) {
                currentSection = sectionId;
            }
        });
        
        navItems.forEach(item => {
            if (item.dataset.section === currentSection) {
                item.classList.add('current');
            } else if (item.dataset.section !== 'docs') {
                item.classList.remove('current');
            }
        });
    }
    
    // Initialize
    function init() {
        createMobileHeader();
        createBottomNav();
        
        // Update on scroll
        let scrollTimer;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateActiveSection, 100);
        });
        
        // Update on hash change
        window.addEventListener('hashchange', highlightCurrentPage);
        
        // Rebuild on resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                createMobileHeader();
                createBottomNav();
            }, 250);
        });
    }
    
    // Start
    init();
    
    console.log('[BottomNav] Bottom navigation initialized');
});