/**
 * Digital Horizon - Enhanced Background Effect
 * 
 * A PixiJS-powered particle system creating a dynamic digital horizon
 * with interactive elements that respond to user input and page content.
 * 
 * @version 1.0.0
 */

export default class DigitalHorizon {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      containerId: 'background',
      particleCount: 300,
      baseColor: 0x8A5CF7, // Primary purple
      secondaryColor: 0xFFFFFF, // White
      accentColor: 0xB290FF, // Light purple
      particleAlpha: { min: 0.2, max: 0.6 },
      particleMinSize: 1,
      particleMaxSize: 4,
      animationSpeed: { min: 0.2, max: 0.8 },
      interactiveRadius: 150,
      interactiveForce: 1.2,
      connectingLines: true,
      maxConnections: 3,
      maxLineDistance: 120,
      ...options
    };
    
    // Device capability detection
    this.deviceCapability = this.detectDeviceCapability();
    
    // Adjust based on device capability
    this.adjustForDevice();
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Detect device capabilities for performance optimization
   */
  detectDeviceCapability() {
    // Basic performance detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent);
    
    // WebGL support detection
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
      isMobile,
      hasWebGL,
      isHighPerformance: !isMobile,
      batteryConscious: false
    };
  }
  
  /**
   * Adjust settings based on device capability
   */
  adjustForDevice() {
    if (!this.deviceCapability.hasWebGL) {
      console.warn('WebGL not supported, falling back to CSS background');
      return;
    }
    
    if (!this.deviceCapability.isHighPerformance) {
      // Reduce particle count for lower-end devices
      this.config.particleCount = Math.floor(this.config.particleCount * 0.6);
      this.config.connectingLines = this.deviceCapability.isMobile ? false : true;
      this.config.maxConnections = 2;
      this.config.maxLineDistance = 80;
    }
  }
  
  /**
   * Initialize PixiJS application and particle system
   */
  initialize() {
    // Get container
    this.container = document.getElementById(this.config.containerId);
    if (!this.container) {
      console.error(`Container with ID "${this.config.containerId}" not found, creating one`);
      this.container = document.createElement('div');
      this.container.id = this.config.containerId;
      document.body.appendChild(this.container);
    }
    
    // If WebGL is not supported, add CSS fallback and exit
    if (!this.deviceCapability.hasWebGL) {
      this.addCssFallback();
      return;
    }
    
    try {
      // Create PixiJS application
      this.app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: true,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundAlpha: 0
      });
      
      // Add canvas to DOM
      this.container.appendChild(this.app.view);
      
      // Create graphics objects for particles
      this.particles = [];
      this.graphics = new PIXI.Graphics();
      this.app.stage.addChild(this.graphics);
      
      // Create connections graphics if enabled
      if (this.config.connectingLines) {
        this.connections = new PIXI.Graphics();
        this.app.stage.addChild(this.connections);
      }
      
      // Create particles
      this.createParticles();
      
      // Track mouse/touch position
      this.mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start animation
      this.animate();
    } catch (error) {
      console.error('Failed to initialize PixiJS:', error);
      this.addCssFallback();
    }
  }
  
  /**
   * Create particle objects
   */
  createParticles() {
    for (let i = 0; i < this.config.particleCount; i++) {
      // Determine particle properties
      const size = this.config.particleMinSize + Math.random() * 
                  (this.config.particleMaxSize - this.config.particleMinSize);
      
      const alpha = this.config.particleAlpha.min + Math.random() * 
                  (this.config.particleAlpha.max - this.config.particleAlpha.min);
      
      const speed = this.config.animationSpeed.min + Math.random() * 
                  (this.config.animationSpeed.max - this.config.animationSpeed.min);
      
      // Choose color
      const colorRoll = Math.random();
      let color;
      
      if (colorRoll < 0.6) {
        color = this.config.baseColor; // Main color: 60% chance
      } else if (colorRoll < 0.9) {
        color = this.config.accentColor; // Accent color: 30% chance
      } else {
        color = this.config.secondaryColor; // White: 10% chance
      }
      
      // Create particle object
      this.particles.push({
        x: Math.random() * this.app.screen.width,
        y: Math.random() * this.app.screen.height,
        size: size,
        color: color,
        alpha: alpha,
        speed: speed,
        direction: Math.random() * Math.PI * 2,
        turningSpeed: (Math.random() - 0.5) * 0.01,
        connections: 0
      });
    }
  }
  
  /**
   * Set up event listeners for interactivity
   */
  setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Mouse/touch interaction
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    
    // Visibility change to pause when not visible
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.app) return;
    
    // Resize the renderer
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    
    // Adjust particle positions if needed
    this.particles.forEach(particle => {
      // Keep particles within bounds
      if (particle.x > this.app.screen.width) {
        particle.x = Math.random() * this.app.screen.width;
      }
      if (particle.y > this.app.screen.height) {
        particle.y = Math.random() * this.app.screen.height;
      }
    });
  }
  
  /**
   * Handle mouse movement
   */
  handleMouseMove(event) {
    if (!this.app) return;
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }
  
  /**
   * Handle touch movement
   */
  handleTouchMove(event) {
    if (!this.app || !event.touches[0]) return;
    this.mousePosition.x = event.touches[0].clientX;
    this.mousePosition.y = event.touches[0].clientY;
  }
  
  /**
   * Handle visibility change to optimize performance
   */
  handleVisibilityChange() {
    if (!this.app) return;
    
    if (document.hidden) {
      // Pause animation when tab is not visible
      this.app.ticker.stop();
    } else {
      // Resume animation when tab becomes visible
      this.app.ticker.start();
    }
  }
  
  /**
   * Main animation loop
   */
  animate() {
    if (!this.app) return;
    
    // Use ticker for animation
    this.app.ticker.add(() => {
      // Clear previous drawings
      this.graphics.clear();
      
      if (this.config.connectingLines) {
        this.connections.clear();
      }
      
      // Update and draw particles
      this.updateParticles();
      
      // Draw connections if enabled
      if (this.config.connectingLines) {
        this.drawConnections();
      }
    });
  }
  
  /**
   * Update particle positions and draw them
   */
  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Reset connection count
      p.connections = 0;
      
      // Update position
      p.x += Math.cos(p.direction) * p.speed;
      p.y += Math.sin(p.direction) * p.speed;
      
      // Slowly change direction
      p.direction += p.turningSpeed;
      
      // Apply mouse/touch interaction
      if (this.mousePosition) {
        const dx = p.x - this.mousePosition.x;
        const dy = p.y - this.mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.interactiveRadius) {
          // Particles move away from cursor
          const angle = Math.atan2(dy, dx);
          const force = (this.config.interactiveRadius - distance) / this.config.interactiveRadius;
          
          p.x += Math.cos(angle) * force * this.config.interactiveForce;
          p.y += Math.sin(angle) * force * this.config.interactiveForce;
          
          // Increase alpha for interactive particles
          const interactiveAlpha = Math.min(1, p.alpha * 1.5);
          
          // Draw particle with enhanced alpha
          this.graphics.beginFill(p.color, interactiveAlpha);
          this.graphics.drawCircle(p.x, p.y, p.size * (1 + force * 0.3));
          this.graphics.endFill();
        } else {
          // Draw normal particle
          this.graphics.beginFill(p.color, p.alpha);
          this.graphics.drawCircle(p.x, p.y, p.size);
          this.graphics.endFill();
        }
      } else {
        // Draw normal particle
        this.graphics.beginFill(p.color, p.alpha);
        this.graphics.drawCircle(p.x, p.y, p.size);
        this.graphics.endFill();
      }
      
      // Wrap at screen edges
      this.wrapParticle(p);
    }
  }
  
  /**
   * Draw connections between particles
   */
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      
      // Skip if max connections reached
      if (p1.connections >= this.config.maxConnections) continue;
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        
        // Skip if max connections reached
        if (p2.connections >= this.config.maxConnections) continue;
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Connect if within distance
        if (distance < this.config.maxLineDistance) {
          // Calculate opacity based on distance
          const alpha = (1 - distance / this.config.maxLineDistance) * 0.3;
          
          // Draw line
          this.connections.lineStyle(1, this.config.baseColor, alpha);
          this.connections.moveTo(p1.x, p1.y);
          this.connections.lineTo(p2.x, p2.y);
          
          // Increment connection count
          p1.connections++;
          p2.connections++;
          
          // Break if max connections reached
          if (p1.connections >= this.config.maxConnections) break;
        }
      }
    }
  }
  
  /**
   * Wrap particles at screen edges
   */
  wrapParticle(p) {
    // Wrap horizontal
    if (p.x < -50) {
      p.x = this.app.screen.width + 50;
    } else if (p.x > this.app.screen.width + 50) {
      p.x = -50;
    }
    
    // Wrap vertical
    if (p.y < -50) {
      p.y = this.app.screen.height + 50;
    } else if (p.y > this.app.screen.height + 50) {
      p.y = -50;
    }
  }
  
  /**
   * Add CSS fallback for non-WebGL browsers
   */
  addCssFallback() {
    const fallback = document.createElement('div');
    fallback.className = 'digital-horizon-fallback';
    this.container.appendChild(fallback);
  }
}