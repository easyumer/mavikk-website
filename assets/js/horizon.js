/**
 * Neural Horizon Background Effect
 * Mavikk Digital Agency
 * 
 * Creates an elegant neural network visualization with mouse interaction
 * Depends on PixiJS 7.3.2 which should be loaded via CDN in the HTML
 */

// IIFE to keep variables scoped
(function() {
    'use strict';
    
    // Configuration options
    const config = {
      targetSelector: '#horizon-background',
      // Neural network
      nodeCount: 100,
      nodeSize: { min: 1, max: 3 },
      nodeOpacity: { min: 0.3, max: 0.8 },
      nodeColors: [0x8A5CF7, 0xB290FF, 0x22D3EE, 0x6E3AD6],
      connectDistance: 150,
      lineOpacity: { min: 0.05, max: 0.2 },
      lineWidth: { min: 0.5, max: 1.5 },
      // Node movement
      nodeSpeed: { min: 0.1, max: 0.4 },
      nodeAmplitude: { min: 10, max: 40 },
      // Mouse interaction
      mouseInfluenceDistance: 200,
      mouseRepelStrength: 0.5,
      mouseConnectDistance: 250,
      mouseConnectOpacity: 0.15,
      mouseLightRadius: 300,
      // Visual effects
      glowStrength: 0.5,
      glowRadius: 15,
      energyPulseFrequency: 10000, // ms between energy pulses
      // Performance settings
      responsive: true,
      performanceMode: true,
      parallaxStrength: 0.03,
      scrollEffectEnabled: true,
      autoReduceOnMobile: true,
    };
    
    // State variables
    let app, bgContainer, nodeContainer, connectionContainer, energyPulseContainer, mouseLayer;
    let nodes = [];
    let energyPulses = [];
    let lastScrollY = 0;
    let mousePosition = { x: 0, y: 0 };
    let isMouseInCanvas = false;
    let animationFrameId;
    let isInViewport = false;
    let viewportObserver;
    let performanceModeActive = false;
    let lastFrameTime = 0;
    let frameTimeAccumulator = 0;
    let frameCount = 0;
    let mouseMoveThrottle = false;
    let lastPulseTime = 0;
    
    /**
     * Initialize the neural horizon effect
     */
    const init = () => {
      // Check if PixiJS is available
      if (typeof PIXI === 'undefined') {
        console.warn('Neural horizon effect requires PixiJS. Make sure it is loaded before initializing.');
        return;
      }
      
      // Find target element
      const targetElement = document.querySelector(config.targetSelector);
      if (!targetElement) {
        console.warn(`Target element "${config.targetSelector}" not found.`);
        return;
      }
      
      // Detect if we should use performance mode (mobile devices or low-end hardware)
      if (config.performanceMode && (isMobileDevice() || isLowEndDevice())) {
        performanceModeActive = true;
        reduceEffectsForPerformance();
      }
      
      // Initialize PixiJS application
      app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: true,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      
      // Add canvas to target element
      targetElement.appendChild(app.view);
      app.renderer.view.style.position = 'fixed';
      app.renderer.view.style.top = '0';
      app.renderer.view.style.left = '0';
      app.renderer.view.style.width = '100%';
      app.renderer.view.style.height = '100%';
      app.renderer.view.style.pointerEvents = 'none';
      
      // Create containers for different layers
      bgContainer = new PIXI.Container();
      connectionContainer = new PIXI.Container();
      nodeContainer = new PIXI.Container();
      energyPulseContainer = new PIXI.Container();
      mouseLayer = new PIXI.Container();
      
      // Add containers to stage in proper order
      app.stage.addChild(bgContainer);
      app.stage.addChild(connectionContainer);
      app.stage.addChild(energyPulseContainer);
      app.stage.addChild(nodeContainer);
      app.stage.addChild(mouseLayer);
      
      // Add subtle background gradient
      createBackgroundGradient();
      
      // Create neural network elements
      createNodes();
      
      // Create a radial light for mouse
      createMouseLight();
      
      // Set up mouse tracking
      setupMouseTracking();
      
      // Set up IntersectionObserver to only animate when in viewport
      setupViewportObserver(targetElement);
      
      // Set up resize handling
      if (config.responsive) {
        window.addEventListener('resize', debounce(handleResize, 250));
      }
      
      // Set up scroll effect
      if (config.scrollEffectEnabled) {
        window.addEventListener('scroll', handleScroll);
      }
      
      // Schedule initial energy pulse
      scheduleNextEnergyPulse();
      
      // Start animation loop for performance monitoring
      requestAnimationFrame(monitorPerformance);
    };
    
    /**
     * Reduce effects for better performance
     */
    const reduceEffectsForPerformance = () => {
      config.nodeCount = Math.floor(config.nodeCount * 0.5);
      config.connectDistance = Math.floor(config.connectDistance * 0.7);
      config.mouseInfluenceDistance = Math.floor(config.mouseInfluenceDistance * 0.7);
      config.mouseLightRadius = Math.floor(config.mouseLightRadius * 0.7);
      config.nodeSpeed.max *= 0.7;
      config.parallaxStrength *= 0.5;
    };
    
    /**
     * Create a subtle background gradient
     */
    const createBackgroundGradient = () => {
      // Create a subtle radial gradient as background
      const bgGraphics = new PIXI.Graphics();
      
      // Radial gradient from dark purple center to darker edges
      const gradientTexture = createGradientTexture(
        [
          { position: 0, color: 0x0F0F15 },
          { position: 0.5, color: 0x08080D },
          { position: 1, color: 0x050508 }
        ],
        app.renderer.width,
        app.renderer.height
      );
      
      bgGraphics.beginTextureFill({ texture: gradientTexture });
      bgGraphics.drawRect(0, 0, app.renderer.width, app.renderer.height);
      bgGraphics.endFill();
      
      bgContainer.addChild(bgGraphics);
    };
    
    /**
     * Create a radial gradient texture
     */
    const createGradientTexture = (colorStops, width, height) => {
      // Create a canvas to draw the gradient
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      
      // Create a radial gradient from center
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(width, height) / 2;
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      // Add color stops
      colorStops.forEach(stop => {
        // Convert hex color to CSS rgb format
        const r = (stop.color >> 16) & 0xFF;
        const g = (stop.color >> 8) & 0xFF;
        const b = stop.color & 0xFF;
        gradient.addColorStop(stop.position, `rgb(${r}, ${g}, ${b})`);
      });
      
      // Fill with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Create a PIXI texture from the canvas
      return PIXI.Texture.from(canvas);
    };
    
    /**
     * Create neural network nodes
     */
    const createNodes = () => {
      // Clear existing nodes
      nodeContainer.removeChildren();
      connectionContainer.removeChildren();
      nodes = [];
      
      // Create new nodes
      for (let i = 0; i < config.nodeCount; i++) {
        const size = randomRange(config.nodeSize.min, config.nodeSize.max);
        const color = config.nodeColors[Math.floor(Math.random() * config.nodeColors.length)];
        const opacity = randomRange(config.nodeOpacity.min, config.nodeOpacity.max);
        
        // Create node graphics
        const nodeGraphics = new PIXI.Graphics();
        nodeGraphics.beginFill(color, opacity);
        nodeGraphics.drawCircle(0, 0, size);
        nodeGraphics.endFill();
        
                // Add bloom/glow effect to some nodes
        if (Math.random() < 0.3) {
          // Using FXAAFilter instead of deprecated BlurFilter
          const blurFilter = new PIXI.FXAAFilter();
          nodeGraphics.filters = [blurFilter];
        }
        
        // Position randomly on screen
        const x = Math.random() * app.renderer.width;
        const y = Math.random() * app.renderer.height;
        nodeGraphics.x = x;
        nodeGraphics.y = y;
        
        // Store node properties for animation
        const node = {
          graphics: nodeGraphics,
          x: x,
          y: y,
          originX: x,
          originY: y,
          size: size,
          color: color,
          opacity: opacity,
          // Movement properties
          speed: randomRange(config.nodeSpeed.min, config.nodeSpeed.max),
          amplitude: randomRange(config.nodeAmplitude.min, config.nodeAmplitude.max),
          angle: Math.random() * Math.PI * 2,
          angleSpeed: randomRange(0.001, 0.004),
          // For parallax effect
          parallaxFactor: randomRange(0.5, 1)
        };
        
        // Add to container and array
        nodeContainer.addChild(nodeGraphics);
        nodes.push(node);
      }
    };
    
    /**
     * Create a radial light effect for mouse interaction
     */
    const createMouseLight = () => {
      // Create a radial gradient for the mouse light
      const mouseLight = new PIXI.Graphics();
      
      // Create a radial gradient for the glow
      const radius = config.mouseLightRadius;
      const glowTexture = createGlowTexture(radius);
      
      mouseLight.beginTextureFill({ texture: glowTexture });
      mouseLight.drawCircle(0, 0, radius);
      mouseLight.endFill();
      
      // Set initial position offscreen
      mouseLight.x = -1000;
      mouseLight.y = -1000;
      mouseLight.alpha = 0.3;
      mouseLight.visible = false;
      
      // Add to mouse layer
      mouseLayer.addChild(mouseLight);
      
      // Store reference to mouse light
      mouseLayer.mouseLight = mouseLight;
    };
    
    /**
     * Create a glow texture for the mouse light
     */
    const createGlowTexture = (radius) => {
      const canvas = document.createElement('canvas');
      canvas.width = radius * 2;
      canvas.height = radius * 2;
      
      const ctx = canvas.getContext('2d');
      
      // Create a radial gradient
      const gradient = ctx.createRadialGradient(
        radius, radius, 0,
        radius, radius, radius
      );
      
      // Add color stops for primary color glow
      gradient.addColorStop(0, 'rgba(138, 92, 247, 0.2)');  // Primary color with some opacity
      gradient.addColorStop(0.5, 'rgba(138, 92, 247, 0.05)');
      gradient.addColorStop(1, 'rgba(138, 92, 247, 0)');    // Fade to transparent
      
      // Fill with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, radius * 2, radius * 2);
      
      // Create a PIXI texture from the canvas
      return PIXI.Texture.from(canvas);
    };
    
    /**
     * Setup mouse tracking for interactive effects
     */
    const setupMouseTracking = () => {
      document.addEventListener('mousemove', (e) => {
        if (mouseMoveThrottle) return;
        mouseMoveThrottle = true;
        
        // Get mouse position relative to canvas
        const rect = app.view.getBoundingClientRect();
        mousePosition.x = e.clientX - rect.left;
        mousePosition.y = e.clientY - rect.top;
        
        // Check if mouse is within canvas
        isMouseInCanvas = (
          mousePosition.x >= 0 && 
          mousePosition.x <= rect.width && 
          mousePosition.y >= 0 && 
          mousePosition.y <= rect.height
        );
        
        // Update mouse light position
        if (mouseLayer.mouseLight) {
          mouseLayer.mouseLight.visible = isMouseInCanvas;
          if (isMouseInCanvas) {
            mouseLayer.mouseLight.x = mousePosition.x;
            mouseLayer.mouseLight.y = mousePosition.y;
          }
        }
        
        setTimeout(() => {
          mouseMoveThrottle = false;
        }, 16); // ~60fps
      });
      
      // Hide mouse light when mouse leaves the window
      document.addEventListener('mouseout', () => {
        isMouseInCanvas = false;
        if (mouseLayer.mouseLight) {
          mouseLayer.mouseLight.visible = false;
        }
      });
    };
    
    /**
     * Create an energy pulse emanating from a random point
     */
    const createEnergyPulse = () => {
      // Select a random node as the origin
      if (nodes.length === 0) return;
      
      const originNode = nodes[Math.floor(Math.random() * nodes.length)];
      const x = originNode.x;
      const y = originNode.y;
      
      // Create pulse graphics
      const pulse = new PIXI.Graphics();
      const color = config.nodeColors[Math.floor(Math.random() * config.nodeColors.length)];
      
      pulse.lineStyle(2, color, 0.5);
      pulse.drawCircle(0, 0, 1);
      pulse.x = x;
      pulse.y = y;
      
      // Use a different filter for glow effect since BlurFilter is deprecated
      const glowFilter = new PIXI.FXAAFilter();
      pulse.filters = [glowFilter];
      
      // Store pulse properties
      const pulseObj = {
        graphics: pulse,
        x: x,
        y: y,
        radius: 1,
        maxRadius: Math.min(app.renderer.width, app.renderer.height) / 2,
        speed: randomRange(1, 2),
        color: color,
        alpha: 0.6
      };
      
      // Add to container and array
      energyPulseContainer.addChild(pulse);
      energyPulses.push(pulseObj);
      
      // Schedule next pulse
      scheduleNextEnergyPulse();
    };
    
    /**
     * Schedule the next energy pulse
     */
    const scheduleNextEnergyPulse = () => {
      const delay = config.energyPulseFrequency + Math.random() * 2000 - 1000;
      setTimeout(createEnergyPulse, delay);
    };
    
    /**
     * Animation loop
     * @param {number} timestamp - Current time from requestAnimationFrame
     */
    const animate = (timestamp) => {
      if (!isInViewport) return;
      
      // Request next frame
      animationFrameId = requestAnimationFrame(animate);
      
      // Monitor performance
      const frameTime = timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      
      if (frameTime > 0) {
        frameTimeAccumulator += frameTime;
        frameCount++;
        
        // Every 60 frames, check performance
        if (frameCount >= 60) {
          const averageFrameTime = frameTimeAccumulator / frameCount;
          
          // If average frame time is > 30ms (less than 33 FPS), switch to performance mode
          if (averageFrameTime > 30 && !performanceModeActive) {
            performanceModeActive = true;
            reduceEffectsForPerformance();
            createNodes(); // Rebuild with fewer nodes
          }
          
          // Reset accumulators
          frameTimeAccumulator = 0;
          frameCount = 0;
        }
      }
      
      // Clear connections
      connectionContainer.removeChildren();
      
      // Update nodes
      updateNodes(timestamp);
      
      // Draw connections between nodes
      drawConnections();
      
      // Draw connections to mouse
      if (isMouseInCanvas) {
        drawMouseConnections();
      }
      
      // Update energy pulses
      updateEnergyPulses();
    };
    
    /**
     * Update node positions and states
     */
    const updateNodes = (timestamp) => {
      nodes.forEach(node => {
        // Oscillating motion
        const time = timestamp * 0.001; // Convert to seconds
        
        // Base oscillating movement
        node.x = node.originX + Math.cos(time * node.speed + node.angle) * node.amplitude;
        node.y = node.originY + Math.sin(time * node.speed + node.angle) * node.amplitude;
        
        // Mouse influence - nodes avoid mouse
        if (isMouseInCanvas) {
          const dx = node.x - mousePosition.x;
          const dy = node.y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.mouseInfluenceDistance) {
            // Calculate repulsion force (stronger when closer)
            const force = (config.mouseInfluenceDistance - distance) / config.mouseInfluenceDistance;
            const repulsionStrength = force * config.mouseRepelStrength;
            
            // Apply repulsion
            node.x += dx * repulsionStrength;
            node.y += dy * repulsionStrength;
          }
        }
        
        // Update node graphics position
        node.graphics.x = node.x;
        node.graphics.y = node.y;
      });
    };
    
    /**
     * Draw connections between nearby nodes
     */
    const drawConnections = () => {
      const connections = new PIXI.Graphics();
      
      // For each pair of nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          
          // Calculate distance between nodes
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Connect if nodes are close enough
          if (distance < config.connectDistance) {
            // Line opacity decreases with distance
            const lineOpacity = mapRange(
              distance, 
              0, 
              config.connectDistance, 
              config.lineOpacity.max, 
              config.lineOpacity.min
            );
            
            // Line width decreases with distance
            const lineWidth = mapRange(
              distance,
              0,
              config.connectDistance,
              config.lineWidth.max,
              config.lineWidth.min
            );
            
            // Line color is gradient between the two node colors
            const colorA = nodeA.color;
            const colorB = nodeB.color;
            
            // Draw line
            connections.lineStyle(lineWidth, colorA, lineOpacity);
            connections.moveTo(nodeA.x, nodeA.y);
            connections.lineTo(nodeB.x, nodeB.y);
          }
        }
      }
      
      connectionContainer.addChild(connections);
    };
    
    /**
     * Draw connections between nodes and mouse position
     */
    const drawMouseConnections = () => {
      const mouseConnections = new PIXI.Graphics();
      
      // Connect to nodes in range
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Calculate distance to mouse
        const dx = node.x - mousePosition.x;
        const dy = node.y - mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Connect if within range
        if (distance < config.mouseConnectDistance) {
          // Line opacity decreases with distance
          const lineOpacity = mapRange(
            distance,
            0,
            config.mouseConnectDistance,
            config.mouseConnectOpacity * 2,
            config.mouseConnectOpacity
          );
          
          // Draw line
          mouseConnections.lineStyle(1, node.color, lineOpacity);
          mouseConnections.moveTo(node.x, node.y);
          mouseConnections.lineTo(mousePosition.x, mousePosition.y);
        }
      }
      
      connectionContainer.addChild(mouseConnections);
    };
    
    /**
     * Update energy pulses
     */
    const updateEnergyPulses = () => {
      // Update each pulse
      for (let i = energyPulses.length - 1; i >= 0; i--) {
        const pulse = energyPulses[i];
        
        // Increase radius
        pulse.radius += pulse.speed;
        
        // Redraw pulse
        pulse.graphics.clear();
        pulse.graphics.lineStyle(2, pulse.color, pulse.alpha * (1 - pulse.radius / pulse.maxRadius));
        pulse.graphics.drawCircle(0, 0, pulse.radius);
        
        // Remove if exceeded max radius
        if (pulse.radius >= pulse.maxRadius) {
          energyPulseContainer.removeChild(pulse.graphics);
          energyPulses.splice(i, 1);
        }
      }
    };
    
    /**
     * Handle scroll events for parallax effects
     */
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      lastScrollY = scrollY;
      
      // Apply parallax to nodes based on scroll
      if (config.scrollEffectEnabled && Math.abs(scrollDelta) > 0) {
        // Parallax effect on nodes
        nodes.forEach(node => {
          // Update origin positions with parallax effect
          const parallaxOffset = scrollDelta * config.parallaxStrength * node.parallaxFactor;
          node.originY -= parallaxOffset;
          
          // Wrap around if needed
          if (node.originY < -50) node.originY = app.renderer.height + 50;
          if (node.originY > app.renderer.height + 50) node.originY = -50;
        });
      }
    };
    
    /**
     * Handle window resize events
     */
    const handleResize = () => {
      if (!app) return;
      
      // Resize renderer
      app.renderer.resize(window.innerWidth, window.innerHeight);
      
      // Update background
      bgContainer.removeChildren();
      createBackgroundGradient();
      
      // Redistribute nodes
      redistributeNodes();
    };
    
    /**
     * Redistribute nodes after resize
     */
    const redistributeNodes = () => {
      // Update node positions based on new dimensions
      nodes.forEach(node => {
        // Keep the relative position
        const relX = node.originX / app.renderer.width;
        const relY = node.originY / app.renderer.height;
        
        // Update origin position
        node.originX = relX * app.renderer.width;
        node.originY = relY * app.renderer.height;
        
        // Update current position to match
        node.x = node.originX;
        node.y = node.originY;
      });
    };
    
    /**
     * Setup IntersectionObserver to only animate when in viewport
     * @param {HTMLElement} element - The element to observe
     */
    const setupViewportObserver = (element) => {
      // Create observer
      viewportObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isInViewport = true;
            lastFrameTime = performance.now();
            animationFrameId = requestAnimationFrame(animate);
          } else {
            isInViewport = false;
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          }
        });
      }, { threshold: 0.1 });
      
      // Start observing
      viewportObserver.observe(element);
    };
    
    /**
     * Performance monitoring function
     * @param {number} timestamp - Current time from requestAnimationFrame
     */
    const monitorPerformance = (timestamp) => {
      // Only run performance monitoring if not animating
      if (isInViewport) return;
      
      // Calculate frame time
      const frameTime = timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      
      if (frameTime > 0) {
        frameTimeAccumulator += frameTime;
        frameCount++;
        
        // Every 10 frames, check performance (when not animating, this is less frequent)
        if (frameCount >= 10) {
          const averageFrameTime = frameTimeAccumulator / frameCount;
          
          // If average frame time is > 30ms (less than 33 FPS), switch to performance mode
          if (averageFrameTime > 30 && !performanceModeActive) {
            performanceModeActive = true;
            reduceEffectsForPerformance();
          }
          
          // Reset accumulators
          frameTimeAccumulator = 0;
          frameCount = 0;
        }
      }
      
      // Continue monitoring performance
      requestAnimationFrame(monitorPerformance);
    };
    
    /**
     * Detect if user is on a mobile device
     * @returns {boolean} True if mobile device detected
     */
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
    };
    
    /**
     * Detect if device is likely low-end hardware
     * @returns {boolean} True if likely low-end device
     */
    const isLowEndDevice = () => {
      // Check for navigator.hardwareConcurrency (CPU cores)
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        return true;
      }
      
      // Use canvas performance test as fallback
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      
      const start = performance.now();
      
      // Draw many circles to test performance
      for (let i = 0; i < 1000; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 500, Math.random() * 500, Math.random() * 30, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const end = performance.now();
      
      // If it took more than 50ms, consider it a low-end device
      return (end - start) > 50;
    };
    
    /**
     * Utility: Generate a random number within a range
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number within range
     */
    const randomRange = (min, max) => {
      return min + Math.random() * (max - min);
    };
    
    /**
     * Utility: Map a value from one range to another
     * @param {number} value - Value to map
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };
    
    /**
     * Utility: Debounce function for resize events
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    const debounce = (func, wait) => {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    };
    
    // Initialize when DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();