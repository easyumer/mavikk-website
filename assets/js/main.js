/**
 * FILE: assets/js/main.js
 * VERSION: v0.01.0
 * DESCRIPTION: Main JavaScript functionality for the Mavikk website
 */

// Import modules
import DigitalHorizon from './horizon.js';
import TestimonialsCarousel from './components/testimonials.js';

/**
 * MavikkWebsite class - Manages all website functionality
 */
class MavikkWebsite {
  constructor() {
    // DOM Elements
    this.header = document.getElementById('header');
    this.navToggle = document.querySelector('.nav__toggle');
    this.navMenu = document.querySelector('.nav__menu');
    this.navLinks = document.querySelectorAll('.nav__link');
    this.contactForm = document.getElementById('contact-form');
    
    // State
    this.isMenuOpen = false;
    this.isScrolled = false;
    this.revealElements = document.querySelectorAll('.reveal-text');
    this.serviceCards = document.querySelectorAll('.service-card');
    this.painPointCards = document.querySelectorAll('.pain-point-card');
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize website functionality
   */
  init() {
    // Initialize components
    this.initMobileMenu();
    this.initScrollEffects();
    this.initServiceToggle();
    this.initFormValidation();
    this.initSmoothScroll();
    
    // Add scroll progress indicator
    this.addScrollProgress();
    
    // Reveal elements that are already in viewport on load
    this.revealInViewElements();
    
    console.log('Mavikk website initialized');
  }
  
  /**
   * Initialize mobile menu functionality
   */
  initMobileMenu() {
    if (!this.navToggle || !this.navMenu) return;
    
    this.navToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });
    
    // Close menu when clicking a link
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.toggleMobileMenu();
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && 
          !this.navMenu.contains(e.target) && 
          !this.navToggle.contains(e.target)) {
        this.toggleMobileMenu();
      }
    });
  }
  
  /**
   * Toggle mobile menu open/closed state
   */
  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Toggle active classes
    this.navToggle.classList.toggle('nav__toggle--active', this.isMenuOpen);
    this.navMenu.classList.toggle('nav__menu--active', this.isMenuOpen);
    
    // Prevent body scroll when menu is open
    document.body.classList.toggle('scroll-lock', this.isMenuOpen);
    
    // Announce state change for screen readers
    this.navToggle.setAttribute('aria-expanded', this.isMenuOpen);
  }
  
  /**
   * Initialize scroll effects
   */
  initScrollEffects() {
    // Header scroll effect
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Check initial scroll position
    this.handleScroll();
    
    // Reveal elements on scroll with Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Stop observing after revealing
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe reveal elements
    this.revealElements.forEach(el => {
      observer.observe(el);
    });
    
    // Observe service cards with sequential animation
    if (this.serviceCards.length) {
      this.serviceCards.forEach(card => {
        observer.observe(card);
      });
    }
    
    // Observe pain point cards with sequential animation
    if (this.painPointCards.length) {
      this.painPointCards.forEach(card => {
        observer.observe(card);
      });
    }
  }
  
  /**
   * Handle scroll events
   */
  handleScroll() {
    const scrollY = window.scrollY;
    
    // Add scrolled class to header when scrolled down
    if (scrollY > 50 && !this.isScrolled) {
      this.header.classList.add('header--scrolled');
      this.isScrolled = true;
    } else if (scrollY <= 50 && this.isScrolled) {
      this.header.classList.remove('header--scrolled');
      this.isScrolled = false;
    }
    
    // Update scroll progress indicator
    this.updateScrollProgress();
  }
  
  /**
   * Add scroll progress indicator to header
   */
  addScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'header__progress';
    
    // Add to header
    this.header.appendChild(progressBar);
    
    // Store reference
    this.progressBar = progressBar;
  }
  
  /**
   * Update scroll progress indicator
   */
  updateScrollProgress() {
    if (!this.progressBar) return;
    
    // Calculate scroll progress
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    
    // Update progress bar width
    this.progressBar.style.width = `${progress}%`;
  }
  
  /**
   * Initialize service card toggle functionality
   */
  initServiceToggle() {
    const toggleButtons = document.querySelectorAll('.service-card__toggle');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const card = e.target.closest('.service-card');
        if (card) {
          card.classList.toggle('service-card--expanded');
          
          // Update button text
          const isExpanded = card.classList.contains('service-card--expanded');
          button.setAttribute('aria-expanded', isExpanded);
          
          // Update text based on state
          const textElement = button.querySelector('span');
          if (textElement) {
            textElement.textContent = isExpanded ? 'Show Less' : 'Learn More';
          }
        }
      });
    });
  }
  
  /**
   * Initialize form validation
   */
  initFormValidation() {
    if (!this.contactForm) return;
    
    this.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Basic validation
      const isValid = this.validateForm(this.contactForm);
      
      if (isValid) {
        // Show loading state
        this.contactForm.classList.add('form--loading');
        
        // Simulate form submission
        setTimeout(() => {
          // Form submission would happen here in production
          // For now, just show success state
          this.showFormSuccess();
        }, 1500);
      }
    });
    
    // Validate fields on input
    const formInputs = this.contactForm.querySelectorAll('.form-input');
    formInputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }
  
  /**
   * Validate an entire form
   * @param {HTMLFormElement} form The form to validate
   * @returns {boolean} Whether the form is valid
   */
  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  /**
   * Validate a single form field
   * @param {HTMLInputElement|HTMLTextAreaElement} field The field to validate
   * @returns {boolean} Whether the field is valid
   */
  validateField(field) {
    // Clear existing error
    this.clearFieldError(field);
    
    // Skip validation for non-required fields with no value
    if (!field.hasAttribute('required') && !field.value.trim()) {
      return true;
    }
    
    let isValid = true;
    const value = field.value.trim();
    
    // Required validation
    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, 'This field is required');
      isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  /**
   * Show error message for a field
   * @param {HTMLElement} field The field with the error
   * @param {string} message The error message
   */
  showFieldError(field, message) {
    // Add error class
    field.classList.add('form-input--error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error-message';
    errorElement.textContent = message;
    
    // Add after field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }
  
  /**
   * Clear error for a field
   * @param {HTMLElement} field The field to clear errors for
   */
  clearFieldError(field) {
    // Remove error class
    field.classList.remove('form-input--error');
    
    // Remove error message
    const errorElement = field.parentNode.querySelector('.form-error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }
  
  /**
   * Show form success state
   */
  showFormSuccess() {
    // Remove loading state
    this.contactForm.classList.remove('form--loading');
    
    // Create success message
    const formContainer = this.contactForm.parentNode;
    const successMessage = document.createElement('div');
    successMessage.className = 'contact__success-message';
    successMessage.innerHTML = `
      <h3>Thank You!</h3>
      <p>Your message has been received. We'll get back to you shortly.</p>
    `;
    
    // Replace form with success message
    formContainer.innerHTML = '';
    formContainer.appendChild(successMessage);
  }
  
  /**
   * Initialize smooth scroll for navigation links
   */
  initSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Only handle links to sections
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          e.preventDefault();
          
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            // Get header height for offset
            const headerHeight = this.header.offsetHeight;
            
            // Calculate position with offset
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            
            // Scroll smoothly
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }
  
  /**
   * Reveal elements that are already in viewport on load
   */
  revealInViewElements() {
    // Check all reveal elements on page load
    setTimeout(() => {
      this.revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('revealed');
        }
      });
      
      // Also check service and pain point cards
      this.serviceCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          card.classList.add('revealed');
        }
      });
      
      this.painPointCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          card.classList.add('revealed');
        }
      });
    }, 100);
  }
  
  /**
   * Add ripple effect to buttons
   * @param {MouseEvent} e The click event
   */
  createRipple(e) {
    const button = e.currentTarget;
    
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    // Position ripple where clicked
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    // Remove existing ripples
    const ripple = button.querySelector('.ripple');
    if (ripple) {
      ripple.remove();
    }
    
    // Add new ripple
    button.appendChild(circle);
  }
  
  /**
   * Initialize button ripple effects
   */
  initButtonEffects() {
    const buttons = document.querySelectorAll('.btn--ripple');
    
    buttons.forEach(button => {
      button.addEventListener('click', this.createRipple);
    });
  }
}

// Initialize the website when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create website instance
  window.mavikkWebsite = new MavikkWebsite();
});

export default MavikkWebsite;