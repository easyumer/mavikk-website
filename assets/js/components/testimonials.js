/**
 * FILE: assets/js/components/testimonials.js
 * VERSION: v0.01.0
 * DESCRIPTION: Testimonials carousel functionality for the Mavikk website
 */

/**
 * TestimonialsCarousel class - Manages the testimonials carousel functionality
 */
class TestimonialsCarousel {
    /**
     * Create a new TestimonialsCarousel instance
     * @param {string} containerId - The ID of the carousel container element
     * @param {Object} options - Configuration options
     */
    constructor(containerId = 'testimonial-carousel', options = {}) {
      // Default configuration
      this.config = {
        autoplay: true,
        autoplayDelay: 5000, // 5 seconds
        transitionDuration: 500, // 0.5 seconds
        showPagination: true,
        showArrows: true,
        loop: true,
        initialSlide: 0,
        ...options
      };
      
      // State
      this.currentSlide = this.config.initialSlide;
      this.totalSlides = 0;
      this.isTransitioning = false;
      this.autoplayTimer = null;
      this.isHovering = false;
      
      // Elements
      this.container = document.getElementById(containerId);
      if (!this.container) {
        console.error(`Testimonial carousel container #${containerId} not found`);
        return;
      }
      
      // Initialize
      this.init();
    }
    
    /**
     * Initialize the carousel
     */
    init() {
      // Find or create required elements
      this.setupDOM();
      
      // Get total number of slides
      this.totalSlides = this.slidesContainer.children.length;
      if (this.totalSlides === 0) {
        console.warn('No testimonial slides found');
        return;
      }
      
      // Set initial slide
      this.goToSlide(this.currentSlide, false);
      
      // Add event listeners
      this.setupEventListeners();
      
      // Start autoplay if enabled
      if (this.config.autoplay) {
        this.startAutoplay();
      }
      
      // Add intersection observer for pause/resume on visibility
      this.setupIntersectionObserver();
      
      // Enable reveal animations for initial slide
      setTimeout(() => {
        this.revealCurrentSlideContent();
      }, 100);
      
      console.log(`Testimonials carousel initialized with ${this.totalSlides} slides`);
    }
    
    /**
     * Set up the DOM elements for the carousel
     */
    setupDOM() {
      // Find or create slides container
      this.slidesContainer = this.container.querySelector('.testimonial-carousel__slides');
      if (!this.slidesContainer) {
        this.slidesContainer = document.createElement('div');
        this.slidesContainer.className = 'testimonial-carousel__slides';
        
        // Move all direct children into the slides container
        while (this.container.firstChild) {
          const child = this.container.firstChild;
          if (child.nodeType === 1) { // Element node
            const slide = document.createElement('div');
            slide.className = 'testimonial-carousel__slide';
            slide.appendChild(child);
            this.slidesContainer.appendChild(slide);
          } else {
            this.container.removeChild(child);
          }
        }
        
        this.container.appendChild(this.slidesContainer);
      }
      
      // Ensure all children are wrapped in slide divs
      Array.from(this.slidesContainer.children).forEach(child => {
        if (!child.classList.contains('testimonial-carousel__slide')) {
          const slide = document.createElement('div');
          slide.className = 'testimonial-carousel__slide';
          child.parentNode.insertBefore(slide, child);
          slide.appendChild(child);
        }
        
        // Ensure each slide has a card wrapper for animations
        const cardElements = child.querySelectorAll('.testimonial-card');
        cardElements.forEach(card => {
          if (!card.parentNode.classList.contains('testimonial-carousel__card-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'testimonial-carousel__card-wrapper';
            card.parentNode.insertBefore(wrapper, card);
            wrapper.appendChild(card);
          }
        });
      });
      
      // Create controls if needed
      if (!this.container.querySelector('.testimonial-carousel__controls')) {
        this.createControls();
      } else {
        this.controls = this.container.querySelector('.testimonial-carousel__controls');
        this.prevButton = this.controls.querySelector('.testimonial-carousel__button--prev');
        this.nextButton = this.controls.querySelector('.testimonial-carousel__button--next');
        this.pagination = this.controls.querySelector('.testimonial-carousel__pagination');
        
        // Create pagination indicators if they don't exist
        if (this.pagination && !this.pagination.children.length) {
          this.createPaginationIndicators();
        }
      }
    }
    
    /**
     * Create navigation controls
     */
    createControls() {
      this.controls = document.createElement('div');
      this.controls.className = 'testimonial-carousel__controls';
      
      // Create previous button
      if (this.config.showArrows) {
        this.prevButton = document.createElement('button');
        this.prevButton.className = 'testimonial-carousel__button testimonial-carousel__button--prev';
        this.prevButton.setAttribute('aria-label', 'Previous testimonial');
        this.prevButton.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        this.controls.appendChild(this.prevButton);
      }
      
      // Create pagination indicators
      if (this.config.showPagination) {
        this.pagination = document.createElement('div');
        this.pagination.className = 'testimonial-carousel__pagination';
        this.createPaginationIndicators();
        this.controls.appendChild(this.pagination);
      }
      
      // Create next button
      if (this.config.showArrows) {
        this.nextButton = document.createElement('button');
        this.nextButton.className = 'testimonial-carousel__button testimonial-carousel__button--next';
        this.nextButton.setAttribute('aria-label', 'Next testimonial');
        this.nextButton.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        this.controls.appendChild(this.nextButton);
      }
      
      this.container.appendChild(this.controls);
    }
    
    /**
     * Create pagination indicators
     */
    createPaginationIndicators() {
      if (!this.pagination) return;
      
      // Clear existing indicators
      this.pagination.innerHTML = '';
      
      // Create an indicator for each slide
      const slides = this.slidesContainer.children;
      for (let i = 0; i < slides.length; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'testimonial-carousel__indicator';
        indicator.setAttribute('data-index', i);
        indicator.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        
        if (i === this.currentSlide) {
          indicator.classList.add('testimonial-carousel__indicator--active');
        }
        
        this.pagination.appendChild(indicator);
      }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
      // Arrow buttons
      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => this.prevSlide());
      }
      
      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => this.nextSlide());
      }
      
      // Pagination indicators
      if (this.pagination) {
        this.pagination.addEventListener('click', (e) => {
          if (e.target.classList.contains('testimonial-carousel__indicator')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              this.goToSlide(index);
            }
          }
        });
      }
      
      // Pause autoplay on hover
      this.container.addEventListener('mouseenter', () => {
        this.isHovering = true;
        if (this.autoplayTimer) {
          clearTimeout(this.autoplayTimer);
        }
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.isHovering = false;
        if (this.config.autoplay) {
          this.startAutoplay();
        }
      });
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        // Only handle keys if carousel is visible
        if (this.isInViewport()) {
          if (e.key === 'ArrowLeft') {
            this.prevSlide();
          } else if (e.key === 'ArrowRight') {
            this.nextSlide();
          }
        }
      });
      
      // Video testimonials play button
      const playButtons = this.container.querySelectorAll('.testimonial-video__play');
      playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const videoContainer = e.target.closest('.testimonial-video');
          if (videoContainer) {
            this.playVideo(videoContainer);
          }
        });
      });
    }
    
    /**
     * Set up intersection observer to pause/resume on visibility
     */
    setupIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Resume autoplay when visible
              if (this.config.autoplay && !this.isHovering) {
                this.startAutoplay();
              }
            } else {
              // Pause autoplay when not visible
              if (this.autoplayTimer) {
                clearTimeout(this.autoplayTimer);
              }
            }
          });
        }, {
          root: null,
          threshold: 0.1 // 10% visibility
        });
        
        observer.observe(this.container);
      }
    }
    
    /**
     * Go to the next slide
     */
    nextSlide() {
      if (this.isTransitioning) return;
      
      // Calculate next slide index
      let nextSlide = this.currentSlide + 1;
      
      // Handle looping
      if (nextSlide >= this.totalSlides) {
        if (this.config.loop) {
          nextSlide = 0;
        } else {
          return; // Can't go beyond last slide if not looping
        }
      }
      
      this.goToSlide(nextSlide);
    }
    
    /**
     * Go to the previous slide
     */
    prevSlide() {
      if (this.isTransitioning) return;
      
      // Calculate previous slide index
      let prevSlide = this.currentSlide - 1;
      
      // Handle looping
      if (prevSlide < 0) {
        if (this.config.loop) {
          prevSlide = this.totalSlides - 1;
        } else {
          return; // Can't go beyond first slide if not looping
        }
      }
      
      this.goToSlide(prevSlide);
    }
    
    /**
     * Go to a specific slide
     * @param {number} index - The index of the slide to go to
     * @param {boolean} animate - Whether to animate the transition
     */
    goToSlide(index, animate = true) {
      if (index === this.currentSlide || this.isTransitioning || index >= this.totalSlides || index < 0) {
        return;
      }
      
      // Reset autoplay
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
      }
      
      // Mark as transitioning
      this.isTransitioning = true;
      
      // Get current and target slides
      const slides = this.slidesContainer.children;
      const currentSlide = slides[this.currentSlide];
      const targetSlide = slides[index];
      
      if (animate) {
        // Set transition classes
        currentSlide.classList.add('testimonial-carousel__slide--exiting');
        targetSlide.classList.add('testimonial-carousel__slide--entering');
        
        // Start animation after a small delay to ensure classes are applied
        setTimeout(() => {
          // Transform the slides container
          this.slidesContainer.style.transform = `translateX(-${index * 100}%)`;
          
          // Update classes for animation
          targetSlide.classList.remove('testimonial-carousel__slide--entering');
          targetSlide.classList.add('testimonial-carousel__slide--active');
          
          // Update card reveal animations
          this.hideCurrentSlideContent();
          
          // Wait for transition to complete
          setTimeout(() => {
            // Clean up classes
            currentSlide.classList.remove('testimonial-carousel__slide--exiting');
            currentSlide.classList.remove('testimonial-carousel__slide--active');
            
            // Update current slide index
            this.currentSlide = index;
            
            // Update pagination indicators
            this.updatePaginationIndicators();
            
            // Mark as not transitioning
            this.isTransitioning = false;
            
            // Reveal content for new slide
            this.revealCurrentSlideContent();
            
            // Restart autoplay if enabled
            if (this.config.autoplay && !this.isHovering) {
              this.startAutoplay();
            }
          }, this.config.transitionDuration);
        }, 50);
      } else {
        // Immediate transition without animation
        this.slidesContainer.style.transition = 'none';
        this.slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        
        // Force reflow to apply immediate change
        // eslint-disable-next-line no-unused-expressions
        this.slidesContainer.offsetHeight;
        
        // Restore transition
        this.slidesContainer.style.transition = '';
        
        // Update current slide index
        this.currentSlide = index;
        
        // Update pagination indicators
        this.updatePaginationIndicators();
        
        // Mark as not transitioning
        this.isTransitioning = false;
        
        // Start autoplay if enabled
        if (this.config.autoplay && !this.isHovering) {
          this.startAutoplay();
        }
      }
    }
    
    /**
     * Hide content for current slide (for animations)
     */
    hideCurrentSlideContent() {
      const slides = this.slidesContainer.children;
      const currentSlide = slides[this.currentSlide];
      
      const cardWrappers = currentSlide.querySelectorAll('.testimonial-carousel__card-wrapper');
      cardWrappers.forEach(wrapper => {
        wrapper.classList.remove('revealed');
      });
    }
    
    /**
     * Reveal content for current slide (for animations)
     */
    revealCurrentSlideContent() {
      const slides = this.slidesContainer.children;
      const currentSlide = slides[this.currentSlide];
      
      const cardWrappers = currentSlide.querySelectorAll('.testimonial-carousel__card-wrapper');
      cardWrappers.forEach((wrapper, index) => {
        // Stagger the reveal animations
        setTimeout(() => {
          wrapper.classList.add('revealed');
        }, 200 + (index * 100));
      });
    }
    
    /**
     * Update pagination indicators
     */
    updatePaginationIndicators() {
      if (!this.pagination) return;
      
      const indicators = this.pagination.children;
      for (let i = 0; i < indicators.length; i++) {
        if (i === this.currentSlide) {
          indicators[i].classList.add('testimonial-carousel__indicator--active');
        } else {
          indicators[i].classList.remove('testimonial-carousel__indicator--active');
        }
      }
      
      // Update button states for non-looping carousel
      if (!this.config.loop) {
        if (this.prevButton) {
          this.prevButton.disabled = this.currentSlide === 0;
        }
        
        if (this.nextButton) {
          this.nextButton.disabled = this.currentSlide === this.totalSlides - 1;
        }
      }
    }
    
    /**
     * Start autoplay
     */
    startAutoplay() {
      // Clear any existing timer
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
      }
      
      // Set timer for next slide
      this.autoplayTimer = setTimeout(() => {
        this.nextSlide();
      }, this.config.autoplayDelay);
    }
    
    /**
     * Handle video play
     * @param {HTMLElement} videoContainer - The video container element
     */
    playVideo(videoContainer) {
      // Get thumbnail image and play button
      const thumbnail = videoContainer.querySelector('.testimonial-video__thumbnail');
      const playButton = videoContainer.querySelector('.testimonial-video__play');
      
      // Get video URL from data attribute
      const videoUrl = videoContainer.getAttribute('data-video-url');
      if (!videoUrl) {
        console.error('No video URL specified for video testimonial');
        return;
      }
      
      // Create iframe for video
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', videoUrl + '?autoplay=1');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'autoplay');
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      
      // Remove thumbnail and play button
      if (thumbnail) thumbnail.remove();
      if (playButton) playButton.remove();
      
      // Add iframe to container
      videoContainer.appendChild(iframe);
      
      // Pause autoplay
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
      }
    }
    
    /**
     * Check if carousel is in viewport
     * @returns {boolean} Whether the carousel is in viewport
     */
    isInViewport() {
      const rect = this.container.getBoundingClientRect();
      return (
        rect.top < window.innerHeight &&
        rect.bottom > 0
      );
    }
    
    /**
     * Destroy the carousel and clean up
     */
    destroy() {
      // Clear autoplay timer
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
      }
      
      // Remove event listeners
      if (this.prevButton) {
        this.prevButton.removeEventListener('click', this.prevSlide);
      }
      
      if (this.nextButton) {
        this.nextButton.removeEventListener('click', this.nextSlide);
      }
      
      // Reset DOM
      this.slidesContainer.style.transform = '';
      
      // Remove all added classes
      const slides = this.slidesContainer.children;
      for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove(
          'testimonial-carousel__slide--active',
          'testimonial-carousel__slide--entering',
          'testimonial-carousel__slide--exiting'
        );
      }
    }
  }
  
  // Export the class
  export default TestimonialsCarousel;