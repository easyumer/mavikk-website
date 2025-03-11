/**
 * Form Validation Module
 * Mavikk Digital Agency
 * 
 * Handles form validation and submission
 */

// IIFE to avoid global scope pollution
(function() {
    'use strict';
    
    // Forms to validate
    const forms = document.querySelectorAll('form.validate-form');
    
    /**
     * Initialize form validation
     */
    function init() {
      if (forms.length === 0) return;
      
      forms.forEach(form => {
        setupFormValidation(form);
      });
    }
    
    /**
     * Set up validation for a specific form
     * @param {HTMLFormElement} form - The form to validate
     */
    function setupFormValidation(form) {
      // Add novalidate to disable browser's native validation UI
      form.setAttribute('novalidate', true);
      
      // Add field validation event listeners
      setupFieldValidation(form);
      
      // Handle form submission
      form.addEventListener('submit', handleSubmit);
    }
    
    /**
     * Set up validation for individual form fields
     * @param {HTMLFormElement} form - The form containing the fields
     */
    function setupFieldValidation(form) {
      // Get all input, textarea, and select elements
      const fields = form.querySelectorAll('input, textarea, select');
      
      fields.forEach(field => {
        // Validate on blur (when user leaves the field)
        field.addEventListener('blur', () => {
          validateField(field);
        });
        
        // Clear error on input (as user types)
        field.addEventListener('input', () => {
          if (field.value.trim()) {
            // Only clear error if there's a value
            clearError(field);
          }
        });
      });
    }
    
    /**
     * Validate a single form field
     * @param {HTMLElement} field - The field to validate
     * @returns {boolean} Whether the field is valid
     */
    function validateField(field) {
      // Skip disabled and non-required fields without value
      if (field.disabled || (!field.required && !field.value.trim())) {
        clearError(field);
        return true;
      }
      
      // Handle different input types
      switch (field.type) {
        case 'email':
          return validateEmail(field);
        
        case 'tel':
          return validatePhone(field);
          
        case 'radio':
        case 'checkbox':
          return validateCheckable(field);
          
        case 'select-one':
        case 'select-multiple':
          return validateSelect(field);
          
        default:
          return validateText(field);
      }
    }
    
    /**
     * Validate a text input or textarea
     * @param {HTMLInputElement|HTMLTextAreaElement} field - The field to validate
     * @returns {boolean} Whether the field is valid
     */
    function validateText(field) {
      if (!field.required && !field.value.trim()) {
        clearError(field);
        return true;
      }
      
      if (!field.value.trim()) {
        showError(field, 'This field is required');
        return false;
      }
      
      // Check min length if specified
      if (field.minLength && field.value.length < field.minLength) {
        showError(field, `Please enter at least ${field.minLength} characters`);
        return false;
      }
      
      // Check max length if specified
      if (field.maxLength && field.value.length > field.maxLength) {
        showError(field, `Please enter no more than ${field.maxLength} characters`);
        return false;
      }
      
      // If we get here, the field is valid
      clearError(field);
      return true;
    }
    
    /**
     * Validate an email field
     * @param {HTMLInputElement} field - The email field to validate
     * @returns {boolean} Whether the field is valid
     */
    function validateEmail(field) {
      if (!field.required && !field.value.trim()) {
        clearError(field);
        return true;
      }
      
      if (!field.value.trim()) {
        showError(field, 'Email address is required');
        return false;
      }
      
      // Simple email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        showError(field, 'Please enter a valid email address');
        return false;
      }
      
      clearError(field);
      return true;
    }
    
    /**
     * Validate a phone field
     * @param {HTMLInputElement} field - The phone field to validate
     * @returns {boolean} Whether the field is valid
     */
    function validatePhone(field) {
      if (!field.required && !field.value.trim()) {
        clearError(field);
        return true;
      }
      
      if (!field.value.trim()) {
        showError(field, 'Phone number is required');
        return false;
      }
      
      // Basic phone format check (allows various formats)
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
        showError(field, 'Please enter a valid phone number');
        return false;
      }
      
      clearError(field);
      return true;
    }
    
    /**
     * Validate checkboxes and radio buttons
     * @param {HTMLInputElement} field - The field to validate
     * @returns {boolean} Whether the field is valid
     */
    function validateCheckable(field) {
      if (!field.required) {
        clearError(field);
        return true;
      }
      
      // For radio buttons and checkboxes, we need to check if any in the group is checked
      const name = field.name;
      const form = field.form;
      const group = form.querySelectorAll(`input[name="${name}"]`);
      const checked = Array.from(group).some(input => input.checked);
      
      if (!checked) {
        // Use the group's parent container for the error
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('form-group--error');
        
        // Create or update error message
        let errorElement = formGroup.querySelector('.form-error');
        if (!errorElement) {
          errorElement = document.createElement('p');
          errorElement.className = 'form-error';
          formGroup.appendChild(errorElement);
        }
        errorElement.textContent = 'Please select an option';
        
        return false;
      }
      
      // Clear error on the group's parent container
      const formGroup = field.closest('.form-group');
      formGroup.classList.remove('form-group--error');
      
      const errorElement = formGroup.querySelector('.form-error');
      if (errorElement) {
        errorElement.remove();
      }
      
      return true;
    }
    
    /**
     * Validate a select field
     * @param {HTMLSelectElement} field - The select field to validate
     * @returns {boolean} Whether the field is valid
     */
    function validateSelect(field) {
      if (!field.required) {
        clearError(field);
        return true;
      }
      
      if (field.value === '') {
        showError(field, 'Please select an option');
        return false;
      }
      
      clearError(field);
      return true;
    }
    
    /**
     * Display an error message for a field
     * @param {HTMLElement} field - The field with an error
     * @param {string} message - The error message to display
     */
    function showError(field, message) {
      const formGroup = field.closest('.form-group');
      formGroup.classList.add('form-group--error');
      field.classList.add('form-input--error');
      
      // Create or update error message
      let errorElement = formGroup.querySelector('.form-error');
      if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'form-error';
        
        // Insert after form hint if it exists, otherwise append to form group
        const hint = formGroup.querySelector('.form-hint');
        if (hint) {
          hint.insertAdjacentElement('afterend', errorElement);
        } else {
          formGroup.appendChild(errorElement);
        }
      }
      errorElement.textContent = message;
      
      // Add subtle shake animation to indicate error
      field.classList.add('shake-animation');
      setTimeout(() => {
        field.classList.remove('shake-animation');
      }, 500);
    }
    
    /**
     * Clear error state and message for a field
     * @param {HTMLElement} field - The field to clear errors for
     */
    function clearError(field) {
      const formGroup = field.closest('.form-group');
      formGroup.classList.remove('form-group--error');
      field.classList.remove('form-input--error');
      
      const errorElement = formGroup.querySelector('.form-error');
      if (errorElement) {
        errorElement.remove();
      }
    }
    
    /**
     * Handle form submission
     * @param {Event} e - The submit event
     */
    function handleSubmit(e) {
      e.preventDefault();
      
      const form = e.target;
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      
      // Validate all fields
      fields.forEach(field => {
        // Skip fields in fieldsets that are hidden/disabled
        if (field.closest('fieldset') && field.closest('fieldset').disabled) {
          return;
        }
        
        // For radio buttons and checkboxes, only validate one in the group
        if ((field.type === 'radio' || field.type === 'checkbox') && 
            fields.find(f => f.name === field.name && f !== field)) {
          return;
        }
        
        const fieldValid = validateField(field);
        isValid = isValid && fieldValid;
      });
      
      // If validation passed, submit the form
      if (isValid) {
        // Show loading state
        form.classList.add('form-loading');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          
          // Store original text
          const originalText = submitBtn.innerHTML;
          
          // Change to loading state
          submitBtn.innerHTML = '<span class="btn__text">Processing...</span>';
          
          // Simulate form submission (replace with actual AJAX submission in production)
          setTimeout(() => {
            // Show success message
            showSuccessMessage(form);
            
            // Reset form
            form.reset();
            
            // Remove loading state
            form.classList.remove('form-loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 1500);
        }
      } else {
        // Focus the first field with an error
        const firstError = form.querySelector('.form-input--error');
        if (firstError) {
          firstError.focus();
        }
      }
    }
    
    /**
     * Show a success message after form submission
     * @param {HTMLFormElement} form - The form that was submitted
     */
    function showSuccessMessage(form) {
      // Create success message container if it doesn't exist
      let successContainer = document.querySelector('.form-success');
      if (!successContainer) {
        successContainer = document.createElement('div');
        successContainer.className = 'form-success';
        
        // Add success content
        successContainer.innerHTML = `
          <div class="form-success__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 class="form-success__title">Message Sent Successfully</h3>
          <p class="form-success__message">Thank you for contacting us. We'll be in touch within 24 hours to schedule your strategy session.</p>
          <button class="btn btn--primary form-success__close">
            <span class="btn__text">Close</span>
          </button>
        `;
        
        // Add to page
        document.body.appendChild(successContainer);
        
        // Add close button functionality
        const closeBtn = successContainer.querySelector('.form-success__close');
        closeBtn.addEventListener('click', () => {
          successContainer.classList.remove('is-visible');
          setTimeout(() => {
            successContainer.remove();
          }, 300);
        });
      }
      
      // Show success message with animation
      requestAnimationFrame(() => {
        successContainer.classList.add('is-visible');
      });
      
      // Set a timer to automatically remove the success message
      setTimeout(() => {
        if (document.body.contains(successContainer)) {
          successContainer.classList.remove('is-visible');
          setTimeout(() => {
            if (document.body.contains(successContainer)) {
              successContainer.remove();
            }
          }, 300);
        }
      }, 5000);
    }
    
    // Add shake animation CSS
    function addAnimationStyles() {
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @keyframes shakeAnimation {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        
        .shake-animation {
          animation: shakeAnimation 0.5s ease;
        }
        
        .form-success {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          background-color: rgba(22, 22, 30, 0.97);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          z-index: 2000;
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          max-width: 90%;
          width: 400px;
        }
        
        .form-success.is-visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        
        .form-success__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #10B981;
          color: white;
          margin-bottom: 1rem;
        }
        
        .form-success__icon svg {
          width: 32px;
          height: 32px;
        }
        
        .form-success__title {
          margin-bottom: 1rem;
        }
        
        .form-success__message {
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .form-loading {
          position: relative;
        }
        
        .form-loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          border-radius: 1rem;
          z-index: 1;
        }
        
        .form-loading::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 3px solid rgba(138, 92, 247, 0.3);
          border-top-color: #8A5CF7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          z-index: 2;
        }
        
        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Add animation styles and initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      addAnimationStyles();
      init();
    });
  })();