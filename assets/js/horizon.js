/**
 * FILE: assets/js/horizon.js
 * VERSION: v0.01.0
 * DESCRIPTION: PixiJS implementation of the Digital Horizon background effect
 */

/**
 * DigitalHorizon class - Creates a subtle, animated particle system background
 * using PixiJS for better performance with WebGL and Canvas fallback.
 */
class DigitalHorizon {
    /**
     * Create a new DigitalHorizon instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
      // Default configuration
      this.config = {
        containerId: 'background',
        particleCount: 200,
        baseColor: 0x8A5CF7,    // Purple brand color
        secondaryColor: 0xFFFFFF, // White
        particleAlpha: 0.15,
        particleMinSize: 1,
        particleMaxSize: 3,
        animationSpeed: 0.3,
        responsive: true,
        ...options
      };
      
      // Performance and device detection
      this.deviceCapability = this.detectDeviceCapability();
      
      // Adjust based on device capability
      if (!this.deviceCapability.highPerformance) {
        this.config.particleCount = Math.floor(this.config.particleCount * 0.6);
        this.config.animationSpeed *= 0.7;
      }
      
      // Reference elements
      this.container = null;
      this.app = null;
      this.particleContainer = null;
      this.particles = [];
      this.mousePosition = null;
      this.isTabActive = true;
      this.fps = 60;
      this.fpsUpdateInterval = null;
      
      // Initialize the component
      this.initialize();
    }
    
    /**
     * Initialize the PixiJS application and setup the component
     */
    initialize() {
      // Ensure the container exists
      this.ensureContainer();
      
      // Setup PixiJS only if WebGL is supported, otherwise use CSS fallback
      if (this.deviceCapability.hasWebGL) {
        try {
          // Initialize PixiJS app
          this.app = new PIXI.Application({
            resizeTo: window,
            transparent: true,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
          });
          
          // Add to DOM
          this.container.appendChild(this.app.view);
          
          // Setup particles
          this.createParticleSystem();
          
          // Setup event listeners
          this.setupEventListeners();
          
          // Start animation
          this.animate();
          
          // Monitor performance
          this.setupPerformanceMonitoring();
          
          // Check battery status if available
          this.checkBatteryStatus();
        } catch (error) {
          console.error('Error initializing PixiJS:', error);
          this.setupFallback();
        }
      } else {
        // Use CSS fallback for devices without WebGL
        this.setupFallback();
      }
    }
    
    /**
     * Ensure the container element exists, create if needed
     */
    ensureContainer() {
      this.container = document.getElementById(this.config.containerId);
      
      if (!this.container) {
        console.warn(`Container #${this.config.containerId} not found, creating element.`);
        this.container = document.createElement('div');
        this.container.id = this.config.containerId;
        this.container.className = 'background';
        document.body.insertBefore(this.container, document.body.firstChild);
      }
    }
    
    /**
     * Create the particle system
     */
    createParticleSystem() {
      // Create a container for particles
      // We'll use a regular Container instead of ParticleContainer since we're using 
      // Graphics objects which aren't compatible with ParticleContainer
      this.particleContainer = new PIXI.Container();
      
      this.app.stage.addChild(this.particleContainer);
      
      // Create particles
      for (let i = 0; i < this.config.particleCount; i++) {
        const particle = this.createParticle();
        this.particleContainer.addChild(particle);
        this.particles.push({
          sprite: particle,
          speed: (Math.random() * 0.5 + 0.5) * this.config.animationSpeed,
          direction: Math.random() * Math.PI * 2,
          turningSpeed: (Math.random() - 0.5) * 0.01,
          amplitude: Math.random() * 0.5 + 0.5
        });
      }
    }
    
    /**
     * Create a single particle
     * @returns {PIXI.Graphics} The particle as a PIXI Graphics object
     */
    createParticle() {
      // Randomly choose between base and secondary color
      const useBaseColor = Math.random() > 0.3;
      const color = useBaseColor ? this.config.baseColor : this.config.secondaryColor;
      
      // Random size within configured range
      const size = this.config.particleMinSize + Math.random() * 
                  (this.config.particleMaxSize - this.config.particleMinSize);
      
      // Create the particle
      const particle = new PIXI.Graphics();
      particle.beginFill(color);
      particle.drawCircle(0, 0, size);
      particle.endFill();
      
      // Apply opacity
      particle.alpha = this.config.particleAlpha * (Math.random() * 0.5 + 0.5);
      
      // Random position
      particle.x = Math.random() * this.app.screen.width;
      particle.y = Math.random() * this.app.screen.height;
      
      return particle;
    }
    
    /**
     * Setup event listeners for interactions
     */
    setupEventListeners() {
      // Mouse movement for interaction effects
      this.app.view.addEventListener('mousemove', (e) => {
        this.mousePosition = {
          x: e.clientX,
          y: e.clientY
        };
      });
      
      // Mouse leave to reset
      this.app.view.addEventListener('mouseleave', () => {
        this.mousePosition = null;
      });
      
      // Detect scroll for wake effect
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
      
      // Window resize handler
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Tab visibility
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
      // Implement scroll-based effects
      // Using a throttled version for performance
      if (!this.scrollTimeout) {
        this.scrollTimeout = setTimeout(() => {
          // Create a subtle wake effect behind scrolling content
          const scrollY = window.scrollY;
          
          // Apply effect based on scroll position
          this.particles.forEach(particle => {
            const distance = Math.abs(particle.sprite.y - scrollY);
            if (distance < 200) {
              // Amplify movement for particles near the scroll position
              particle.turningSpeed *= 1.1;
              
              // Reset after short duration
              setTimeout(() => {
                particle.turningSpeed /= 1.1;
              }, 500);
            }
          });
          
          this.scrollTimeout = null;
        }, 100);
      }
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
      // No need to resize the PixiJS app as it has resizeTo: window
      // But we need to ensure particles are within bounds
      this.particles.forEach(particle => {
        // If particles are outside the screen after resize, reposition them
        if (particle.sprite.x > this.app.screen.width) {
          particle.sprite.x = Math.random() * this.app.screen.width;
        }
        if (particle.sprite.y > this.app.screen.height) {
          particle.sprite.y = Math.random() * this.app.screen.height;
        }
      });
    }
    
    /**
     * Handle visibility change events (tab focus/blur)
     */
    handleVisibilityChange() {
      if (document.hidden) {
        // Pause animations when tab is inactive
        this.isTabActive = false;
        this.app.ticker.maxFPS = 10; // Reduce FPS when tab is inactive
      } else {
        // Resume animations when tab is active
        this.isTabActive = true;
        this.app.ticker.maxFPS = this.deviceCapability.batteryConscious ? 30 : 60;
      }
    }
    
    /**
     * Animate particles
     */
    animate() {
      // Main animation loop
      this.app.ticker.add(() => {
        if (!this.isTabActive) return; // Skip animations when tab is inactive
        
        // Update each particle
        for (let i = 0; i < this.particles.length; i++) {
          const particle = this.particles[i];
          
          // Update position based on direction and speed
          particle.sprite.x += Math.cos(particle.direction) * particle.speed;
          particle.sprite.y += Math.sin(particle.direction) * particle.speed;
          
          // Add a gentle wave motion
          particle.sprite.x += Math.sin(this.app.ticker.lastTime * 0.0001 * particle.amplitude) * 0.2;
          
          // Slowly change direction
          particle.direction += particle.turningSpeed;
          
          // Wrap particles at edges
          this.wrapParticle(particle.sprite);
          
          // Apply proximity effects if mouse is over canvas
          if (this.mousePosition) {
            this.applyProximityEffect(particle.sprite, this.mousePosition);
          }
          
          // Optional: increase density near active content sections
          this.applyScrollSectionEffect(particle);
        }
      });
    }
    
    /**
     * Wrap a particle around screen edges
     * @param {PIXI.Graphics} particle The particle to wrap
     */
    wrapParticle(particle) {
      // Wrap horizontal
      if (particle.x < -10) {
        particle.x = this.app.screen.width + 10;
      } else if (particle.x > this.app.screen.width + 10) {
        particle.x = -10;
      }
      
      // Wrap vertical
      if (particle.y < -10) {
        particle.y = this.app.screen.height + 10;
      } else if (particle.y > this.app.screen.height + 10) {
        particle.y = -10;
      }
    }
    
    /**
     * Apply proximity effect based on mouse position
     * @param {PIXI.Graphics} particle The particle to affect
     * @param {Object} position The mouse position {x, y}
     */
    applyProximityEffect(particle, position) {
      const dx = particle.x - position.x;
      const dy = particle.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only affect particles within range
      if (distance < 100) {
        // Subtle attraction effect
        const angle = Math.atan2(dy, dx);
        const force = (1 - distance / 100) * 0.3;
        
        // Push away gently
        particle.x += Math.cos(angle) * force;
        particle.y += Math.sin(angle) * force;
        
        // Increase alpha slightly when near mouse
        particle.alpha = Math.min(this.config.particleAlpha * 2, 0.3);
      } else {
        // Reset alpha
        particle.alpha = this.config.particleAlpha * (Math.random() * 0.5 + 0.5);
      }
    }
    
    /**
     * Apply effects based on scroll position relative to sections
     * @param {Object} particle The particle object to affect
     */
    applyScrollSectionEffect(particle) {
      // Get visible sections
      const sections = document.querySelectorAll('.section');
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Check each section
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        
        // If section is in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          // Calculate how centered the section is in the viewport
          const centerY = rect.top + rect.height / 2;
          const distanceFromCenter = Math.abs(centerY - windowHeight / 2);
          const inViewportRatio = 1 - (distanceFromCenter / (windowHeight / 2));
          
          // If particle is within the section's horizontal bounds
          if (particle.sprite.x > rect.left && particle.sprite.x < rect.right) {
            // Subtle effect to increase particle density near active sections
            // by slowing down particles in this area
            particle.speed = Math.max(
              this.config.animationSpeed * 0.5,
              particle.speed - (inViewportRatio * 0.01)
            );
          } else {
            // Reset to normal speed if not in an active section
            particle.speed = (Math.random() * 0.5 + 0.5) * this.config.animationSpeed;
          }
        }
      });
    }
    
    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
      // FPS counter and adjustment system
      let frameCount = 0;
      let lastTime = performance.now();
      
      // Check FPS every second
      this.fpsUpdateInterval = setInterval(() => {
        const currentTime = performance.now();
        this.fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        
        // Adjust particle count if FPS is too low
        if (this.fps < 30 && this.particles.length > 50) {
          // Remove 10% of particles
          const removeCount = Math.floor(this.particles.length * 0.1);
          for (let i = 0; i < removeCount; i++) {
            if (this.particles.length > 50) { // Always keep some minimum particles
              const particle = this.particles.pop();
              this.particleContainer.removeChild(particle.sprite);
            }
          }
        }
        
        // Reset counter
        frameCount = 0;
        lastTime = currentTime;
      }, 1000);
      
      // Count frames
      this.app.ticker.add(() => {
        frameCount++;
      });
    }
    
    /**
     * Check battery status and adjust performance
     */
    checkBatteryStatus() {
      if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
          // Set battery conscious mode if battery level is low and not charging
          this.deviceCapability.batteryConscious = battery.level < 0.3 && !battery.charging;
          this.adjustForBattery();
          
          // Monitor battery changes
          battery.addEventListener('levelchange', () => {
            this.deviceCapability.batteryConscious = battery.level < 0.3 && !battery.charging;
            this.adjustForBattery();
          });
          
          battery.addEventListener('chargingchange', () => {
            this.deviceCapability.batteryConscious = battery.level < 0.3 && !battery.charging;
            this.adjustForBattery();
          });
        }).catch(err => {
          console.log('Battery API not available', err);
        });
      }
    }
    
    /**
     * Adjust settings for battery conscious mode
     */
    adjustForBattery() {
      if (this.deviceCapability.batteryConscious) {
        // Reduce animation framerate
        this.app.ticker.maxFPS = 30;
        
        // Make particles move slower
        this.particles.forEach(p => {
          p.speed *= 0.7;
        });
      } else {
        // Restore defaults
        this.app.ticker.maxFPS = 60;
        
        // Reset particle speed
        this.particles.forEach(p => {
          p.speed /= 0.7;
        });
      }
    }
    
    /**
     * Detect device capabilities for adaptive experience
     * @returns {Object} Device capability details
     */
    detectDeviceCapability() {
      // Basic performance detection based on user agent
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent);
      const highPerformance = !isMobile;
      
      // Detect WebGL support
      const hasWebGL = (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
          return false;
        }
      })();
      
      return {
        highPerformance,
        hasWebGL,
        batteryConscious: false, // Will be updated with Battery API if available
        isMobile
      };
    }
    
    /**
     * Set up CSS fallback for devices without WebGL
     */
    setupFallback() {
      // Remove PixiJS canvas if it exists
      if (this.container && this.app && this.app.view.parentNode === this.container) {
        this.container.removeChild(this.app.view);
      }
      
      // Add CSS fallback
      this.container.classList.add('background--fallback');
      
      // Clean up PixiJS resources
      if (this.app) {
        this.app.destroy(true, true);
        this.app = null;
      }
      
      // Clear any intervals
      if (this.fpsUpdateInterval) {
        clearInterval(this.fpsUpdateInterval);
      }
      
      console.log('Using CSS fallback for background effect');
    }
    
    /**
     * Destroy the component and clean up resources
     */
    destroy() {
      // Remove event listeners
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('scroll', this.handleScroll);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      
      // Clean up intervals
      if (this.fpsUpdateInterval) {
        clearInterval(this.fpsUpdateInterval);
      }
      
      // Destroy PixiJS app
      if (this.app) {
        this.app.destroy(true, true);
        this.app = null;
      }
      
      // Clear references
      this.particles = [];
      this.particleContainer = null;
      this.mousePosition = null;
    }
  }
  
  // Initialize the background when document is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Create the digital horizon background
    window.digitalHorizon = new DigitalHorizon();
  });
  
  export default DigitalHorizon;