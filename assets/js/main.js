/**
 * Mavikk Digital Agency - Main JavaScript
 * 
 * This file initializes all website components and functionality.
 * 
 * @version 1.0.0
 */

import DigitalHorizon from './horizon.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Digital Horizon background effect
  initBackgroundEffect();
  
  // Initialize navigation
  initNavigation();
  
  // Initialize scroll reveal animations
  initScrollReveal();
  
  // Initialize smooth scrolling
  initSmoothScroll();
});

/**
 * Initialize Digital Horizon background effect
 */
function initBackgroundEffect() {
  try {
    // Create enhanced version of the Digital Horizon
    const horizon = new DigitalHorizon({
      containerId: 'background',
      particleCount: 250,
      baseColor: 0x8A5CF7,     // Main purple
      secondaryColor: 0xFFFFFF, // White
      accentColor: 0xB290FF,   // Light purple
      particleAlpha: { min: 0.2, max: 0.7 },
      particleMinSize: 1,
      particleMaxSize: 4,
      waveAmplitude: 25,
      connectingLines: true,
      maxConnections: 3,
      maxLineDistance: 150
    });
    
    // Store in window for debugging
    window.horizonEffect = horizon;
    
    console.log('Digital Horizon initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Digital Horizon:', error);
    
    // Fall back to CSS background
    const container = document.getElementById('background');
    if (container) {
      const fallback = document.createElement('div');
      fallback.className = 'digital-horizon-fallback';
      container.appendChild(fallback);
    }
  }
}

/**
 * Initialize mobile navigation
 */
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav__menu');
  
  if (!navToggle || !navMenu) return;
  
  // Toggle mobile menu
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('nav-open');
  });
  
  // Close menu when clicking nav links
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('nav-open');
    });
  });
  
  // Handle header transparency on scroll
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    });
  }
}

/**
 * Initialize scroll reveal animations
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-text');
  
  if (!revealElements.length) return;
  
  const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOptions);
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      const headerOffset = document.querySelector('.header')?.offsetHeight || 0;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Error handling and reporting
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.message || 'Unknown error');
  
  // You could send errors to a reporting service here
  
  // Don't prevent default behavior
  // event.preventDefault();
});