/**
 * Mobile Menu Module
 * Mavikk Digital Agency
 * 
 * Handles mobile menu interactions and responsive behavior
 */

// IIFE to avoid global scope pollution
(function() {
    'use strict';
    
    // DOM Elements
    const header = document.querySelector('.site-header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-nav__link');
    
    /**
     * Initialize mobile menu functionality
     */
    function init() {
      if (!mobileMenuToggle || !mobileMenu) return;
      
      initHeaderScroll();
      initMobileMenuToggle();
      initMobileMenuLinks();
      initWindowResizeCheck();
    }
    
    /**
     * Handle header state on scroll
     */
    function initHeaderScroll() {
      if (!header) return;
      
      const handleScroll = () => {
        if (window.scrollY > 50) {
          header.classList.add('site-header--scrolled');
        } else {
          header.classList.remove('site-header--scrolled');
        }
      };
      
      window.addEventListener('scroll', throttle(handleScroll, 100));
      
      // Initial check
      handleScroll();
    }
    
    /**
     * Initialize mobile menu toggle functionality
     */
    function initMobileMenuToggle() {
      mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        
        // Toggle menu state
        toggleMobileMenu(!isExpanded);
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (
          mobileMenu.classList.contains('mobile-menu--active') &&
          !mobileMenu.contains(e.target) &&
          !mobileMenuToggle.contains(e.target)
        ) {
          toggleMobileMenu(false);
        }
      });
      
      // Close menu when pressing Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('mobile-menu--active')) {
          toggleMobileMenu(false);
        }
      });
    }
    
    /**
     * Initialize mobile menu link functionality
     */
    function initMobileMenuLinks() {
      mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
          // Close menu when a link is clicked
          toggleMobileMenu(false);
          
          // Add subtle animation class to the clicked link
          link.classList.add('mobile-nav__link--clicked');
          
          // Remove the class after animation completes
          setTimeout(() => {
            link.classList.remove('mobile-nav__link--clicked');
          }, 500);
        });
      });
    }
    
    /**
     * Close the mobile menu when window is resized to desktop size
     */
    function initWindowResizeCheck() {
      window.addEventListener('resize', debounce(() => {
        // Check if we're at desktop width
        if (window.innerWidth >= 1024 && mobileMenu.classList.contains('mobile-menu--active')) {
          // Close the mobile menu
          toggleMobileMenu(false);
        }
      }, 250));
    }
    
    /**
     * Toggle mobile menu state
     * @param {boolean} open - Whether to open or close the menu
     */
    function toggleMobileMenu(open) {
      mobileMenuToggle.setAttribute('aria-expanded', open);
      
      if (open) {
        mobileMenu.classList.add('mobile-menu--active');
        document.body.classList.add('no-scroll');
        
        // Animate menu items in
        const menuItems = mobileMenu.querySelectorAll('.mobile-nav__item');
        menuItems.forEach((item, index) => {
          item.style.animationDelay = `${index * 0.05}s`;
          item.classList.add('animate-fade-in');
        });
      } else {
        mobileMenu.classList.remove('mobile-menu--active');
        document.body.classList.remove('no-scroll');
        
        // Reset animation classes
        const menuItems = mobileMenu.querySelectorAll('.mobile-nav__item');
        menuItems.forEach(item => {
          item.classList.remove('animate-fade-in');
          item.style.animationDelay = '';
        });
      }
    }
    
    /**
     * Utility: Throttle function to limit execution rate
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    function throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
    
    /**
     * Utility: Debounce function to delay execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);
  })();