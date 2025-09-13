// Mobile Navigation Handler
(function() {
    'use strict';
    
    // Toggle mobile menu
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('siteMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    };
    
    // Handle dropdown toggles on mobile
    function initMobileDropdowns() {
        const dropdownItems = document.querySelectorAll('.site-menu-item.has-dropdown');
        
        dropdownItems.forEach(item => {
            const link = item.querySelector('a');
            const dropdown = item.querySelector('.dropdown-menu');
            
            if (link && dropdown) {
                // Remove any existing click handlers
                link.removeEventListener('click', handleDropdownClick);
                
                // Add click handler for mobile
                link.addEventListener('click', handleDropdownClick);
            }
        });
    }
    
    function handleDropdownClick(e) {
        // Only handle on mobile
        if (window.innerWidth > 768) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const menuItem = this.parentElement;
        const dropdown = menuItem.querySelector('.dropdown-menu');
        
        if (!dropdown) return;
        
        // Toggle expanded class
        menuItem.classList.toggle('expanded');
        
        // Close other dropdowns
        const otherItems = document.querySelectorAll('.site-menu-item.has-dropdown');
        otherItems.forEach(other => {
            if (other !== menuItem) {
                other.classList.remove('expanded');
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('siteMenu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
            menu.classList.remove('active');
            
            // Also close all dropdowns
            document.querySelectorAll('.site-menu-item.expanded').forEach(item => {
                item.classList.remove('expanded');
            });
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                // Reset mobile menu state on desktop
                const menu = document.getElementById('siteMenu');
                if (menu) {
                    menu.classList.remove('active');
                }
                
                // Remove expanded state from all items
                document.querySelectorAll('.site-menu-item.expanded').forEach(item => {
                    item.classList.remove('expanded');
                });
            }
        }, 250);
    });
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileDropdowns);
    } else {
        initMobileDropdowns();
    }
    
    // Reinitialize after navigation injection (for dynamically added navigation)
    setTimeout(initMobileDropdowns, 500);
})();