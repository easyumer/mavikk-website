/**
 * FILE: assets/js/components/before-after-slider.js
 * VERSION: v0.01.0
 * DESCRIPTION: Before/After comparison slider for case studies
 */

/**
 * BeforeAfterSlider class - Creates an interactive before/after image comparison
 * slider that allows users to see the difference between two images by dragging
 * a divider.
 */
class BeforeAfterSlider {
    /**
     * Create a new BeforeAfterSlider instance
     * @param {HTMLElement|string} element - The slider container element or selector
     * @param {Object} options - Configuration options
     */
    constructor(element, options = {}) {
      // Handle if element is a string selector
      if (typeof element === 'string') {
        this.container = document.querySelector(element);
        if (!this.container) {
          console.error(`Element not found: ${element}`);
          return;
        }
      } else {
        this.container = element;
      }
      
      // Default configuration
      this.config = {
        initialPosition: 50, // Percentage from left
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        showLabels: true,
        beforeLabel: 'Before',
        afterLabel: 'After',
        dragControlColor: '#8A5CF7', // Accent color for the handle
        dragControlSize: 40, // Size in pixels
        dividerWidth: 2, // Width of the divider line in pixels
        animateOnHover: false, // Animate on hover instead of drag
        ...options
      };
      
      // State
      this.isDragging = false;
      this.position = this.config.initialPosition;
      
      // Initialize
      this.init();
    }
    
    /**
     * Initialize the slider
     */
    init() {
      // Check if container has necessary structure or create it
      this.setupDOM();
      
      // Set initial position
      this.updatePosition(this.config.initialPosition);
      
      // Add event listeners
      this.setupEventListeners();
      
      // Add intersection observer for animations
      this.setupIntersectionObserver();
      
      // Add intro animation
      this.addIntroAnimation();
    }
    
    /**
     * Set up the DOM structure for the slider
     */
    setupDOM() {
      // Check if container has before/after class
      if (!this.container.classList.contains('before-after-slider')) {
        this.container.classList.add('before-after-slider');
      }
      
      // Check if container has orientation class
      const orientationClass = `before-after-slider--${this.config.orientation}`;
      if (!this.container.classList.contains(orientationClass)) {
        this.container.classList.add(orientationClass);
      }
      
      // Find or create before image container
      this.beforeContainer = this.container.querySelector('.before-after-slider__before');
      if (!this.beforeContainer) {
        // Try to find the first image
        const firstImage = this.container.querySelector('img');
        if (firstImage) {
          // Create before container
          this.beforeContainer = document.createElement('div');
          this.beforeContainer.className = 'before-after-slider__before';
          
          // Move the image inside
          firstImage.parentNode.insertBefore(this.beforeContainer, firstImage);
          this.beforeContainer.appendChild(firstImage);
        } else {
          console.error('No images found in container');
          return;
        }
      }
      
      // Find or create after image container
      this.afterContainer = this.container.querySelector('.before-after-slider__after');
      if (!this.afterContainer) {
        // Try to find the second image
        const secondImage = this.container.querySelectorAll('img')[1];
        if (secondImage) {
          // Create after container
          this.afterContainer = document.createElement('div');
          this.afterContainer.className = 'before-after-slider__after';
          
          // Move the image inside
          secondImage.parentNode.insertBefore(this.afterContainer, secondImage);
          this.afterContainer.appendChild(secondImage);
        } else {
          console.error('Second image not found in container');
          return;
        }
      }
      
      // Find or create divider
      this.divider = this.container.querySelector('.before-after-slider__divider');
      if (!this.divider) {
        this.divider = document.createElement('div');
        this.divider.className = 'before-after-slider__divider';
        this.container.appendChild(this.divider);
      }
      
      // Set divider width/height based on orientation
      if (this.config.orientation === 'horizontal') {
        this.divider.style.width = `${this.config.dividerWidth}px`;
      } else {
        this.divider.style.height = `${this.config.dividerWidth}px`;
      }
      
      // Find or create drag control
      this.dragControl = this.container.querySelector('.before-after-slider__control');
      if (!this.dragControl) {
        this.dragControl = document.createElement('div');
        this.dragControl.className = 'before-after-slider__control';
        
        // Create the visual handle
        const handle = document.createElement('div');
        handle.className = 'before-after-slider__handle';
        handle.style.backgroundColor = this.config.dragControlColor;
        
        // Add arrow icons based on orientation
        if (this.config.orientation === 'horizontal') {
          handle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;
        } else {
          handle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 15L12 9L6 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 9L12 15L6 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;
        }
        
        this.dragControl.appendChild(handle);
        this.divider.appendChild(this.dragControl);
      }
      
      // Set drag control size
      this.dragControl.style.width = `${this.config.dragControlSize}px`;
      this.dragControl.style.height = `${this.config.dragControlSize}px`;
      
      // Add labels if enabled
      if (this.config.showLabels) {
        // Before label
        this.beforeLabel = this.container.querySelector('.before-after-slider__label--before');
        if (!this.beforeLabel) {
          this.beforeLabel = document.createElement('div');
          this.beforeLabel.className = 'before-after-slider__label before-after-slider__label--before';
          this.beforeLabel.textContent = this.config.beforeLabel;
          this.container.appendChild(this.beforeLabel);
        }
        
        // After label
        this.afterLabel = this.container.querySelector('.before-after-slider__label--after');
        if (!this.afterLabel) {
          this.afterLabel = document.createElement('div');
          this.afterLabel.className = 'before-after-slider__label before-after-slider__label--after';
          this.afterLabel.textContent = this.config.afterLabel;
          this.container.appendChild(this.afterLabel);
        }
      }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
      // Mouse events
      this.container.addEventListener('mousedown', this.onDragStart.bind(this));
      document.addEventListener('mousemove', this.onDragMove.bind(this));
      document.addEventListener('mouseup', this.onDragEnd.bind(this));
      
      // Touch events for mobile
      this.container.addEventListener('touchstart', this.onDragStart.bind(this), { passive: true });
      document.addEventListener('touchmove', this.onDragMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.onDragEnd.bind(this));
      
      // Hover animation if enabled
      if (this.config.animateOnHover) {
        this.container.addEventListener('mouseenter', this.startHoverAnimation.bind(this));
        this.container.addEventListener('mouseleave', this.stopHoverAnimation.bind(this));
      }
      
      // Keyboard accessibility
      this.container.setAttribute('tabindex', '0');
      this.container.addEventListener('keydown', this.onKeyDown.bind(this));
      
      // Window resize event
      window.addEventListener('resize', this.onResize.bind(this));
    }
    
    /**
     * Handle drag start event
     * @param {MouseEvent|TouchEvent} e The event object
     */
    onDragStart(e) {
      e.preventDefault();
      
      // Only proceed if clicking on the divider or drag control
      const target = e.target;
      if (!target.closest('.before-after-slider__divider') && 
          !target.closest('.before-after-slider__control')) {
        return;
      }
      
      this.isDragging = true;
      this.container.classList.add('before-after-slider--dragging');
      
      // Calculate position based on click/touch point
      this.updatePositionFromEvent(e);
    }
    
    /**
     * Handle drag move event
     * @param {MouseEvent|TouchEvent} e The event object
     */
    onDragMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      
      // Update position based on mouse/touch position
      this.updatePositionFromEvent(e);
    }
    
    /**
     * Handle drag end event
     */
    onDragEnd() {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      this.container.classList.remove('before-after-slider--dragging');
    }
    
    /**
     * Handle keydown event for accessibility
     * @param {KeyboardEvent} e The keyboard event
     */
    onKeyDown(e) {
      // Handle arrow keys for accessibility
      const step = 5; // Percentage to move per key press
      
      if (this.config.orientation === 'horizontal') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.updatePosition(Math.max(0, this.position - step));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.updatePosition(Math.min(100, this.position + step));
        }
      } else {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.updatePosition(Math.max(0, this.position - step));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.updatePosition(Math.min(100, this.position + step));
        }
      }
    }
    
    /**
     * Handle window resize event
     */
    onResize() {
      // Re-apply current position to ensure correct sizing
      this.updatePosition(this.position);
    }
    
    /**
     * Start hover animation
     */
    startHoverAnimation() {
      if (this.isDragging) return;
      
      // Animate from initial position to the end and back
      const duration = 1000; // Animation duration in ms
      const startPosition = this.config.initialPosition;
      const endPosition = startPosition < 50 ? 100 : 0;
      
      let startTime = null;
      
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Calculate position with easing
        const easeProgress = this.easeInOutQuad(progress);
        
        // Forward then backward animation
        let animatedPosition;
        if (progress < 0.5) {
          // Going to end position
          animatedPosition = startPosition + (endPosition - startPosition) * (easeProgress * 2);
        } else {
          // Going back to start position
          animatedPosition = endPosition - (endPosition - startPosition) * ((easeProgress - 0.5) * 2);
        }
        
        this.updatePosition(animatedPosition);
        
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        }
      };
      
      this.animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Stop hover animation
     */
    stopHoverAnimation() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      
      // Return to initial position
      this.updatePosition(this.config.initialPosition);
    }
    
    /**
     * Update position from mouse/touch event
     * @param {MouseEvent|TouchEvent} e The event object
     */
    updatePositionFromEvent(e) {
      const rect = this.container.getBoundingClientRect();
      let clientX, clientY;
      
      // Handle both mouse and touch events
      if (e.type.startsWith('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      let newPosition;
      if (this.config.orientation === 'horizontal') {
        newPosition = ((clientX - rect.left) / rect.width) * 100;
      } else {
        newPosition = ((clientY - rect.top) / rect.height) * 100;
      }
      
      // Clamp position between 0 and 100
      newPosition = Math.max(0, Math.min(100, newPosition));
      
      // Update position
      this.updatePosition(newPosition);
    }
    
    /**
     * Update the slider position
     * @param {number} position Percentage position (0-100)
     */
    updatePosition(position) {
      this.position = position;
      
      // Update UI based on orientation
      if (this.config.orientation === 'horizontal') {
        // Update clip path for after image
        this.afterContainer.style.clipPath = `inset(0 0 0 ${position}%)`;
        
        // Update divider position
        this.divider.style.left = `${position}%`;
        
        // Update labels position if enabled
        if (this.config.showLabels) {
          // Position based on available space
          if (position < 20) {
            this.beforeLabel.classList.add('before-after-slider__label--outside');
          } else {
            this.beforeLabel.classList.remove('before-after-slider__label--outside');
          }
          
          if (position > 80) {
            this.afterLabel.classList.add('before-after-slider__label--outside');
          } else {
            this.afterLabel.classList.remove('before-after-slider__label--outside');
          }
        }
      } else {
        // Vertical orientation
        // Update clip path for after image
        this.afterContainer.style.clipPath = `inset(${position}% 0 0 0)`;
        
        // Update divider position
        this.divider.style.top = `${position}%`;
        
        // Update labels position if enabled
        if (this.config.showLabels) {
          // Position based on available space
          if (position < 20) {
            this.beforeLabel.classList.add('before-after-slider__label--outside');
          } else {
            this.beforeLabel.classList.remove('before-after-slider__label--outside');
          }
          
          if (position > 80) {
            this.afterLabel.classList.add('before-after-slider__label--outside');
          } else {
            this.afterLabel.classList.remove('before-after-slider__label--outside');
          }
        }
      }
      
      // Update ARIA attributes for accessibility
      this.container.setAttribute('aria-valuenow', position);
    }
    
    /**
     * Set up intersection observer for animations
     */
    setupIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Play intro animation when in viewport
              this.addIntroAnimation();
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.2,
          rootMargin: '0px'
        });
        
        observer.observe(this.container);
      }
    }
    
    /**
     * Add intro animation when slider comes into view
     */
    addIntroAnimation() {
      // Don't animate if already dragging
      if (this.isDragging) return;
      
      // Animate from 0 or 100 to initial position
      const startPosition = this.position < 50 ? 100 : 0;
      const endPosition = this.config.initialPosition;
      
      // Set initial position
      this.updatePosition(startPosition);
      
      // Animate to final position
      setTimeout(() => {
        this.container.classList.add('before-after-slider--animating');
        
        // Smoothly animate to the desired position
        let startTime = null;
        const duration = 800; // Animation duration in ms
        
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Calculate position with easing
          const easeProgress = this.easeOutQuad(progress);
          const animatedPosition = startPosition + (endPosition - startPosition) * easeProgress;
          
          this.updatePosition(animatedPosition);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            this.container.classList.remove('before-after-slider--animating');
          }
        };
        
        requestAnimationFrame(animate);
      }, 300);
    }
    
    /**
     * Easing function for animations (ease out quad)
     * @param {number} t Progress from 0 to 1
     * @returns {number} Eased value
     */
    easeOutQuad(t) {
      return t * (2 - t);
    }
    
    /**
     * Easing function for animations (ease in out quad)
     * @param {number} t Progress from 0 to 1
     * @returns {number} Eased value
     */
    easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    /**
     * Destroy the slider and clean up
     */
    destroy() {
      // Remove event listeners
      this.container.removeEventListener('mousedown', this.onDragStart);
      document.removeEventListener('mousemove', this.onDragMove);
      document.removeEventListener('mouseup', this.onDragEnd);
      
      this.container.removeEventListener('touchstart', this.onDragStart);
      document.removeEventListener('touchmove', this.onDragMove);
      document.removeEventListener('touchend', this.onDragEnd);
      
      this.container.removeEventListener('mouseenter', this.startHoverAnimation);
      this.container.removeEventListener('mouseleave', this.stopHoverAnimation);
      
      this.container.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('resize', this.onResize);
      
      // Cancel any animations
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }
  }
  
  // Export the class
  export default BeforeAfterSlider;