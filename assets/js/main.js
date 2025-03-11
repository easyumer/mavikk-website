/**
 * Main JavaScript Entry Point
 * Mavikk Digital Agency
 */

// Import modules
import './components/animations.js';
import './components/mobile-menu.js';
import './components/form-validation.js';

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  
  // Initialize smooth scrolling
  initSmoothScroll();
  
  // Check for prefers-reduced-motion
  checkReducedMotion();
  
  // Initialize scroll progress indicator
  initScrollProgress();
  
  // Add parallax class to elements
  setupParallaxElements();
  
  // Handle sticky header on scroll
  handleStickyHeader();
  
  console.log('Mavikk Digital Agency - Scripts initialized');
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Get header height for offset
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        
        // Scroll to target with offset for header
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight,
          behavior: 'smooth'
        });
        
        // Update URL but don't add to browser history
        window.history.replaceState(null, null, targetId);
      }
    });
  });
}

/**
 * Check if user prefers reduced motion
 */
function checkReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }
}

/**
 * Initialize scroll progress indicator
 */
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    progressBar.style.width = `${scrollPercent}%`;
  });
}

/**
 * Add parallax class to elements that should have parallax effects
 */
function setupParallaxElements() {
  // Add parallax effects to specific sections
  document.querySelectorAll('.bg-shape, .hero__media, .featured-testimonial').forEach(element => {
    element.classList.add('parallax-element');
  });
}

/**
 * Handle sticky header on scroll
 */
function handleStickyHeader() {
  const header = document.querySelector('.site-header');
  
  if (!header) return;
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // Initial check
  handleScroll();
}