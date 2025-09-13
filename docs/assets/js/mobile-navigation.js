// Mobile Navigation Handler
(function() {
    'use strict';
    
    let initialized = false;
    
    // Toggle mobile menu
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('siteMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    };
    
    // Handle dropdown toggles on mobile
    function initMobileDropdowns() {
        if (initialized) return;
        initialized = true;
        
        // Use event delegation for dynamic content
        document.addEventListener('click', function(e) {
            if (window.innerWidth > 768) return;
            
            const link = e.target.closest('.site-menu-item.has-dropdown > a');
            
            if (link) {
                e.preventDefault();
                e.stopPropagation();
                
                const menuItem = link.parentElement;
                const dropdown = menuItem.querySelector('.dropdown-menu');
                
                if (!dropdown) return;
                
                handleDropdownToggle(menuItem, dropdown);
            }
        });
    }
    
    function handleDropdownToggle(menuItem, dropdown) {
        const isExpanded = menuItem.classList.contains('expanded');
        
        // Close other dropdowns smoothly
        const otherItems = document.querySelectorAll('.site-menu-item.has-dropdown');
        otherItems.forEach(other => {
            if (other !== menuItem && other.classList.contains('expanded')) {
                const otherDropdown = other.querySelector('.dropdown-menu');
                if (otherDropdown) {
                    otherDropdown.style.height = otherDropdown.scrollHeight + 'px';
                    otherDropdown.offsetHeight; // Force reflow
                    otherDropdown.style.height = '0px';
                }
                other.classList.remove('expanded');
            }
        });
        
        // Toggle current dropdown with smooth animation
        if (isExpanded) {
            // Closing
            dropdown.style.height = dropdown.scrollHeight + 'px';
            dropdown.offsetHeight; // Force reflow
            dropdown.style.height = '0px';
            menuItem.classList.remove('expanded');
        } else {
            // Opening
            menuItem.classList.add('expanded');
            const height = dropdown.scrollHeight;
            dropdown.style.height = '0px';
            dropdown.offsetHeight; // Force reflow
            dropdown.style.height = height + 'px';
            
            // After animation, set to auto for dynamic content
            setTimeout(() => {
                if (menuItem.classList.contains('expanded')) {
                    dropdown.style.height = 'auto';
                }
            }, 300);
        }
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('siteMenu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
            menu.classList.remove('active');
            
            // Also close all dropdowns
            document.querySelectorAll('.site-menu-item.expanded').forEach(item => {
                const dropdown = item.querySelector('.dropdown-menu');
                if (dropdown) {
                    dropdown.style.height = '0px';
                }
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
                    const dropdown = item.querySelector('.dropdown-menu');
                    if (dropdown) {
                        dropdown.style.height = '';
                    }
                    item.classList.remove('expanded');
                });
            }
        }, 250);
    });
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initMobileDropdowns, 100);
        });
    } else {
        setTimeout(initMobileDropdowns, 100);
    }
    
    // Reinitialize after navigation injection (for dynamically added navigation)
    setTimeout(initMobileDropdowns, 500);
    setTimeout(initMobileDropdowns, 1000);
    
    // Also listen for navigation updates
    document.addEventListener('navigationInjected', initMobileDropdowns);
})();