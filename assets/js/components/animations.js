/**
 * Animations Module
 * Mavikk Digital Agency
 * 
 * Handles scroll-based reveal animations and subtle interactive effects
 */

// IIFE to avoid global scope pollution
(function() {
    'use strict';
  
    // Animation settings
    const settings = {
      // Reveal animation settings
      reveal: {
        threshold: 0.15,       // How much of the element needs to be visible
        rootMargin: '0px 0px -50px 0px', // Offset from viewport edges
        once: true,            // Only animate once
        duration: {
          standard: 600,       // Standard animation duration (ms)
          staggered: 100       // Stagger delay between elements (ms)
        },
        delay: {
          base: 0,
          staggered: 100,
          heroElements: 200    // Hero elements stagger delay
        }
      },
      // Parallax settings
      parallax: {
        strength: 0.1,         // Parallax movement strength (0-1)
        threshold: 0           // Start parallax as soon as element is in view
      }
    };
  
    /**
     * Initialize all animations
     */
    function init() {
      // Skip animations if user prefers reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Still make all elements visible without animation
        document.querySelectorAll('.reveal-element').forEach(el => {
          el.classList.add('revealed');
        });
        return;
      }
  
      // Set up different types of animations
      initRevealAnimations();
      initHeroAnimations();
      initParallaxEffects();
      initSectionTransitions();
      initHoverAnimations();
      initScrollIndicator();
  
      // Initialize carousel if it exists
      if (document.querySelector('.testimonial-carousel')) {
        initTestimonialCarousel();
      }
    }
  
    /**
     * Initialize reveal animations for elements as they enter the viewport
     */
    function initRevealAnimations() {
      const elements = document.querySelectorAll('.reveal-element');
      
      if (elements.length === 0) return;
      
      const options = {
        threshold: settings.reveal.threshold,
        rootMargin: settings.reveal.rootMargin
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Add a staggered delay for groups of elements
            const delay = entry.target.dataset.delay || 
                          (entry.target.dataset.staggered ? 
                            index * settings.reveal.delay.staggered : 
                            settings.reveal.delay.base);
            
            // Apply the delay
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            
            // Unobserve after animation is triggered if set to once
            if (settings.reveal.once) {
              observer.unobserve(entry.target);
            }
          }
        });
      }, options);
      
      elements.forEach(element => {
        observer.observe(element);
      });
    }
  
    /**
     * Initialize special animations for the hero section
     */
    function initHeroAnimations() {
      // Add subtle floating animation to hero image
      const heroImage = document.querySelector('.hero__image-container');
      if (heroImage) {
        heroImage.classList.add('floating-animation');
      }
      
      // Add typing animation to hero title
      const heroTitle = document.querySelector('.hero__title');
      if (heroTitle) {
        // Make sure animations are loaded
        heroTitle.classList.add('animate__animated', 'animate__fadeIn');
        heroTitle.style.animationDuration = '1.2s';
      }
      
      // Subtle animations for stat badges
      const statBadges = document.querySelectorAll('.stat-badge');
      statBadges.forEach((badge, index) => {
        badge.classList.add('reveal-element');
        badge.dataset.delay = 1000 + (index * settings.reveal.delay.heroElements);
        badge.dataset.staggered = true;
      });
      
      // Subtle animation for CTA button
      const heroCta = document.querySelector('.hero__cta .btn--primary');
      if (heroCta) {
        heroCta.classList.add('pulse-animation');
      }
    }
    
    /**
     * Initialize subtle parallax effects for selected elements
     */
    function initParallaxEffects() {
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      if (parallaxElements.length === 0) return;
      
      // Scroll event handler (throttled)
      let lastScrollPosition = window.scrollY;
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        lastScrollPosition = window.scrollY;
        
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateParallaxElements(lastScrollPosition);
            ticking = false;
          });
          
          ticking = true;
        }
      });
      
      // Add the parallax-ready class to all elements
      parallaxElements.forEach(element => {
        element.classList.add('parallax-ready');
        
        // Set custom strength if specified
        if (!element.dataset.parallaxStrength) {
          element.dataset.parallaxStrength = settings.parallax.strength;
        }
      });
      
      // Initial update
      updateParallaxElements(lastScrollPosition);
    }
    
    /**
     * Update positions of parallax elements based on scroll position
     */
    function updateParallaxElements(scrollY) {
      const parallaxElements = document.querySelectorAll('.parallax-element.parallax-ready');
      
      parallaxElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top + scrollY;
        const elementCenter = elementTop + (element.offsetHeight / 2);
        const windowCenter = scrollY + (window.innerHeight / 2);
        const distance = windowCenter - elementCenter;
        
        // Get the custom strength or use default
        const strength = parseFloat(element.dataset.parallaxStrength) || settings.parallax.strength;
        const parallaxOffset = distance * strength;
        
        // Apply the transform
        element.style.transform = `translateY(${parallaxOffset}px)`;
      });
    }
    
    /**
     * Initialize smooth transitions between sections
     */
    function initSectionTransitions() {
      // Add scroll-based color/background transitions for sections
      const sections = document.querySelectorAll('section[data-bg-transition]');
      
      if (sections.length === 0) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // When section is 50% visible
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Get the background color from data attribute
            const bgColor = entry.target.dataset.bgTransition;
            
            // Apply subtle body background color change
            document.body.style.backgroundColor = bgColor;
          }
        });
      }, { threshold: [0.5] });
      
      sections.forEach(section => {
        observer.observe(section);
      });
    }
    
    /**
     * Initialize hover animations for interactive elements
     */
    function initHoverAnimations() {
      // Magnetic button effect for primary buttons
      const magneticButtons = document.querySelectorAll('.btn--primary');
      
      magneticButtons.forEach(button => {
        button.addEventListener('mousemove', e => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Calculate distance from center
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Subtle magnetic effect
          const moveX = (x - centerX) * 0.1;
          const moveY = (y - centerY) * 0.1;
          
          button.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
          // Reset position
          button.style.transform = '';
        });
      });
      
      // Service card hover effect
      const serviceCards = document.querySelectorAll('.service-card');
      
      serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          // Add a subtle glow effect
          card.classList.add('service-card--hover');
        });
        
        card.addEventListener('mouseleave', () => {
          // Remove the effect
          card.classList.remove('service-card--hover');
        });
      });
    }
    
    /**
     * Initialize the scroll indicator that shows progress through the page
     */
    function initScrollIndicator() {
      // Create the scroll indicator element
      const scrollIndicator = document.createElement('div');
      scrollIndicator.className = 'scroll-indicator';
      document.body.appendChild(scrollIndicator);
      
      // Update indicator on scroll
      window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollIndicator.style.width = scrolled + '%';
      });
    }
    
    /**
     * Initialize the testimonial carousel
     */
    function initTestimonialCarousel() {
      const carousel = document.querySelector('.testimonial-carousel');
      const track = carousel.querySelector('.testimonial-carousel__track');
      const slides = carousel.querySelectorAll('.testimonial-carousel__slide');
      const indicators = carousel.querySelectorAll('.testimonial-carousel__indicator');
      
      let currentSlide = 0;
      const slideCount = slides.length;
      
      // Set up indicator functionality
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          // Update current slide
          currentSlide = index;
          
          // Update indicator states
          indicators.forEach((ind, i) => {
            if (i === currentSlide) {
              ind.classList.add('testimonial-carousel__indicator--active');
            } else {
              ind.classList.remove('testimonial-carousel__indicator--active');
            }
          });
          
          // Scroll to the correct slide
          const slideWidth = slides[0].offsetWidth;
          const slideGap = parseInt(window.getComputedStyle(track).columnGap || 0);
          const scrollPosition = (slideWidth + slideGap) * currentSlide;
          
          track.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        });
      });
      
      // Handle scroll events to update indicator
      track.addEventListener('scroll', () => {
        const scrollPosition = track.scrollLeft;
        const slideWidth = slides[0].offsetWidth;
        const slideGap = parseInt(window.getComputedStyle(track).columnGap || 0);
        
        // Calculate which slide is most visible
        const activeSlide = Math.round(scrollPosition / (slideWidth + slideGap));
        
        // Update current slide if different
        if (activeSlide !== currentSlide && activeSlide >= 0 && activeSlide < slideCount) {
          currentSlide = activeSlide;
          
          // Update indicator states
          indicators.forEach((ind, i) => {
            if (i === currentSlide) {
              ind.classList.add('testimonial-carousel__indicator--active');
            } else {
              ind.classList.remove('testimonial-carousel__indicator--active');
            }
          });
        }
      });
      
      // Add touch swiping capability
      let touchStartX = 0;
      let touchEndX = 0;
      
      track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
      
      function handleSwipe() {
        const threshold = 50; // Minimum swipe distance
        
        if (touchStartX - touchEndX > threshold) {
          // Swipe left (next)
          const nextSlide = Math.min(currentSlide + 1, slideCount - 1);
          indicators[nextSlide].click();
        } else if (touchEndX - touchStartX > threshold) {
          // Swipe right (prev)
          const prevSlide = Math.max(currentSlide - 1, 0);
          indicators[prevSlide].click();
        }
      }
    }
    
    // Initialize animations when document is ready
    document.addEventListener('DOMContentLoaded', init);
  })();