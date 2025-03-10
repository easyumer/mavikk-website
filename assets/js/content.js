/**
 * FILE: assets/js/content.js
 * VERSION: v0.01.0
 * DESCRIPTION: Content population for the Mavikk website
 */

/**
 * ContentManager class - Manages dynamic content population
 */
class ContentManager {
    constructor() {
      // Content containers
      this.painPointsContainer = document.querySelector('.pain-points__grid');
      this.servicesContainer = document.querySelector('.services__grid');
      this.clientLogosContainer = document.querySelector('.hero__client-logos');
      
      // Initialize
      this.init();
    }
    
    /**
     * Initialize content population
     */
    init() {
      this.populatePainPoints();
      this.populateServices();
      this.populateClientLogos();
    }
    
    /**
     * Populate pain points section
     */
    populatePainPoints() {
      if (!this.painPointsContainer) return;
      
      // Pain points data
      const painPoints = [
        {
          title: "Ineffective Online Presence",
          description: "A beautiful website is meaningless if it doesn't convert visitors into customers. Most agencies focus on aesthetics while ignoring conversion principles.",
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          severity: 'high',
          testimonial: "We spent thousands on a beautiful website that generated zero leads. Mavikk showed us why and fixed it.",
          author: "Sarah T., Marketing Director"
        },
        {
          title: "Unclear ROI on Marketing",
          description: "Marketing investments should deliver measurable results. Yet many businesses struggle to track performance and understand the real return on their digital spending.",
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18M6 8H5C3.93913 8 2.92172 8.42143 2.17157 9.17157C1.42143 9.92172 1 10.9391 1 12C1 13.0609 1.42143 14.0783 2.17157 14.8284C2.92172 15.5786 3.93913 16 5 16H6M13 6L11 18M3 2V4M21 2V4M3 20V22M21 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          severity: 'high',
          testimonial: "Before Mavikk, we couldn't measure our marketing success. Now we can tie every dollar spent to actual revenue.",
          author: "Michael K., CEO"
        },
        {
          title: "Inconsistent Brand Messaging",
          description: "When your website, social media, and marketing materials lack cohesion, potential customers become confused and trust diminishes.",
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 8H17M7 12H11M12 20L8 16H5C4.46957 16 3.96086 15.7893 3.58579 15.4142C3.21071 15.0391 3 14.5304 3 14V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V14C21 14.5304 20.7893 15.0391 20.4142 15.4142C20.0391 15.7893 19.5304 16 19 16H16L12 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          severity: 'medium',
          testimonial: "Our brand looked different everywhere. Mavikk unified our messaging and our customer trust metrics improved by 37%.",
          author: "Jennifer R., Brand Manager"
        },
        {
          title: "Unreliable Agency Communication",
          description: "Many agencies overpromise and underdeliver, leaving you with missed deadlines, unexpected costs, and frustrated stakeholders.",
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17H20L18 13H15V17ZM15 17H9M15 17V13C15 11.9391 14.5786 10.9217 13.8284 10.1716C13.0783 9.42143 12.0609 9 11 9C9.93913 9 8.92172 9.42143 8.17157 10.1716C7.42143 10.9217 7 11.9391 7 13V17M7 17H4L6 13H9M9 17V13M9 13H15M12 7C11.4696 7 10.9609 6.78929 10.5858 6.41421C10.2107 6.03914 10 5.53043 10 5C10 4.46957 10.2107 3.96086 10.5858 3.58579C10.9609 3.21071 11.4696 3 12 3C12.5304 3 13.0391 3.21071 13.4142 3.58579C13.7893 3.96086 14 4.46957 14 5C14 5.53043 13.7893 6.03914 13.4142 6.41421C13.0391 6.78929 12.5304 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          severity: 'high',
          testimonial: "After three disappointing agency experiences, Mavikk's transparency and reliable communication has been refreshing.",
          author: "David L., Operations Manager"
        }
      ];
      
      // Create and append pain point cards
      painPoints.forEach(point => {
        const card = document.createElement('div');
        card.className = 'pain-point-card';
        
        // Severity indicator
        const severityClass = `pain-point-card__severity--${point.severity}`;
        
        card.innerHTML = `
          <div class="pain-point-card__severity ${severityClass}"></div>
          <div class="pain-point-card__icon">${point.icon}</div>
          <h3 class="pain-point-card__title">${point.title}</h3>
          <p class="pain-point-card__description">${point.description}</p>
          <div class="pain-point-card__testimonial">
            "${point.testimonial}"
            <span class="pain-point-card__testimonial-author">— ${point.author}</span>
          </div>
        `;
        
        this.painPointsContainer.appendChild(card);
      });
    }
    
    /**
     * Populate services section
     */
    populateServices() {
      if (!this.servicesContainer) return;
      
      // Services data
      const services = [
        {
          title: "Website Design & Development",
          description: "Conversion-focused websites that transform visitors into customers through strategic design and seamless functionality.",
          icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4H21C21.5304 4 22.0391 4.21071 22.4142 4.58579C22.7893 4.96086 23 5.46957 23 6V18C23 18.5304 22.7893 19.0391 22.4142 19.4142C22.0391 19.7893 21.5304 20 21 20H3C2.46957 20 1.96086 19.7893 1.58579 19.4142C1.21071 19.0391 1 18.5304 1 18V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 10H23M8 16H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          benefits: [
            "37% average conversion rate increase",
            "SEO-optimized architecture",
            "Mobile-first responsive design",
            "Conversion tracking implementation"
          ],
          process: [
            "Discovery & Strategy",
            "UX Wireframing",
            "UI Design & Prototyping",
            "Development & Testing",
            "Launch & Optimization"
          ]
        },
        {
          title: "Branding & Graphics Design",
          description: "Strategic brand identity development that differentiates your business and creates meaningful connections with your target audience.",
          icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 3H15M9 3V9M15 3H19C20.1046 3 21 3.89543 21 5V9M15 3V9M21 9V15M21 9H15M21 15V19C21 20.1046 20.1046 21 19 21H15M21 15H15M15 21H9M15 21V15M9 21H5C3.89543 21 3 20.1046 3 19V15M9 21V15M3 15V9M3 15H9M9 9H15M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          benefits: [
            "Differentiated market positioning",
            "Consistent visual identity system",
            "Brand message clarification",
            "Comprehensive brand guidelines"
          ],
          process: [
            "Brand Discovery",
            "Market & Competitor Analysis",
            "Identity Concept Development",
            "Refinement & System Design",
            "Guidelines & Asset Creation"
          ]
        },
        {
          title: "Digital Marketing",
          description: "Data-driven marketing strategies that generate measurable ROI through targeted campaigns, analytics, and continuous optimization.",
          icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8.00002L18 10M12 12.0001L14 14.0001M8 16.0001L10 18.0001M2 22.0001L22 2.00012M6.58579 13.9999L12 19.414L13.4142 18.0001M7.5 8.00002H11.5C12.0304 8.00002 12.5391 7.78931 12.9142 7.41423C13.2893 7.03916 13.5 6.53045 13.5 6.00002V2.00012M10.5 2.00012H2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          benefits: [
            "ROI-focused campaign strategy",
            "Multi-channel integration",
            "Advanced tracking & attribution",
            "Ongoing optimization & scaling"
          ],
          process: [
            "Marketing Audit",
            "Strategy Development",
            "Channel Selection & Setup",
            "Campaign Launch",
            "Performance Analysis & Optimization"
          ]
        }
      ];
      
      // Create and append service cards
      services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        // Create benefits list HTML
        const benefitsList = service.benefits.map(benefit => 
          `<div class="service-card__benefit">
            <div class="service-card__benefit-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="service-card__benefit-text">${benefit}</div>
          </div>`
        ).join('');
        
        // Create process steps HTML
        const processList = service.process.map((step, index) => 
          `<div class="service-card__process-step">
            <div class="service-card__process-step-number">${index + 1}</div>
            <div class="service-card__process-step-text">${step}</div>
          </div>`
        ).join('');
        
        card.innerHTML = `
          <div class="service-card__content">
            <div class="service-card__icon">${service.icon}</div>
            <h3 class="service-card__title">${service.title}</h3>
            <p class="service-card__description">${service.description}</p>
            
            <div class="service-card__benefits">
              ${benefitsList}
            </div>
            
            <div class="service-card__details">
              <div class="service-card__process">
                <h4 class="service-card__process-title">Our Process</h4>
                <div class="service-card__process-steps">
                  ${processList}
                </div>
              </div>
            </div>
            
            <div class="service-card__footer">
              <button class="service-card__toggle" aria-expanded="false">
                <span>Learn More</span>
                <div class="service-card__toggle-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        `;
        
        this.servicesContainer.appendChild(card);
      });
    }
    
    /**
     * Populate client logos in hero section
     */
    populateClientLogos() {
      if (!this.clientLogosContainer) return;
      
      // Client logos data - using company names as placeholders
      // In production these would be actual image paths
      const clientLogos = [
        { name: "TechCorp", alt: "TechCorp logo" },
        { name: "GlobalMedia", alt: "GlobalMedia logo" },
        { name: "InnovateCo", alt: "InnovateCo logo" },
        { name: "EcoSolutions", alt: "EcoSolutions logo" },
        { name: "FinanceHub", alt: "FinanceHub logo" }
      ];
      
      // Create and append client logos
      clientLogos.forEach(client => {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'hero__client-logo';
        
        // In a real implementation, these would be img elements with src attributes
        // For now we'll just use text placeholders
        logoDiv.textContent = client.name;
        
        this.clientLogosContainer.appendChild(logoDiv);
      });
    }
  }
  
  // Initialize the content manager when document is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Create content manager instance
    window.contentManager = new ContentManager();
  });
  
  export default ContentManager;