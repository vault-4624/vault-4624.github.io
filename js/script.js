// ==================== 
// BOOT SEQUENCE
// ==================== 

/**
 * Skip the boot animation and hide the boot modal
 */
function skipBoot() {
  const bootModal = document.getElementById('bootModal');
  if (bootModal) {
    bootModal.classList.add('hidden');
    // Remember user preference to skip boot on future visits
    sessionStorage.setItem('skipBoot', 'true');
  }
}

/**
 * Initialize boot sequence behavior
 */
function initBootSequence() {
  // Check if user has already seen the boot sequence this session
  const hasSeenBoot = sessionStorage.getItem('skipBoot') === 'true';
  
  if (hasSeenBoot) {
    // Skip immediately if already seen
    skipBoot();
  } else {
    // Auto-hide boot modal after 2 seconds
    setTimeout(skipBoot, 2000);
    
    // Allow user to skip on any key press or click
    document.addEventListener('keydown', skipBoot, { once: true });
    document.addEventListener('click', skipBoot, { once: true });
  }
}

// ==================== 
// SMOOTH SCROLLING
// ==================== 

/**
 * Enable smooth scrolling for anchor links
 */
function initSmoothScroll() {
  // Get all anchor links that start with #
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      // Get the target element
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      // Scroll to target if it exists
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    });
  });
}

// ==================== 
// ADDITIONAL FEATURES (OPTIONAL)
// ==================== 

/**
 * Add active state to navigation based on scroll position
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Add fade-in animation to cards when they scroll into view
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe all terminal cards
  const cards = document.querySelectorAll('.terminal-card');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

/**
 * Add typing effect to specific elements (optional enhancement)
 */
function addTypingEffect(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

/**
 * Console Easter Egg
 */
function initConsoleEasterEgg() {
  console.log('%c>> VAULT 4624 INITIALIZED', 'color: #4afa9a; font-size: 14px; font-family: monospace;');
  console.log('%c>> Welcome, Vault Dweller', 'color: #4afa9a; font-size: 12px; font-family: monospace;');
  console.log('%c>> System Status: ONLINE', 'color: #4afa9a; font-size: 12px; font-family: monospace;');
  console.log('%c>> Event ID 4624: Access Granted', 'color: #ffcc00; font-size: 12px; font-family: monospace;');
}

// ==================== 
// PHISHING SECTION FEATURES
// ==================== 

/**
 * Mock phishing threats for live feed simulation
 */
const mockThreats = [
  { source: 'PhishTank', url: 'hxxps://secure-microsoft365[.]verify-login[.]xyz' },
  { source: 'URLhaus', url: 'hxxp://urgent-invoice[.]download/payment.exe' },
  { source: 'OpenPhish', url: 'hxxps://apple-id-verification[.]secure[.]com' },
  { source: 'CertStream', url: 'paypal-secure-verification[.]live' },
  { source: 'PhishTank', url: 'hxxps://wellsfargo-security[.]online/verify' },
  { source: 'URLhaus', url: 'hxxps://invoice-2024[.]top/document.docx' },
  { source: 'OpenPhish', url: 'hxxps://google-workspace-auth[.]verify[.]net' },
  { source: 'PhishTank', url: 'hxxps://coinbase-wallet-verify[.]com/security' }
];

/**
 * Generate random timestamp
 */
function getRandomTime() {
  const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const min = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hour}:${min}`;
}

/**
 * Create feed entry HTML
 */
function createFeedEntry(threat) {
  const time = getRandomTime();
  return `
    <div class="feed-line">
      <span class="feed-time">[${time}]</span>
      <span class="feed-src">${threat.source}:</span>
      ${threat.url}
    </div>
  `;
}

/**
 * Initialize live feed with periodic updates
 */
function initLiveFeed() {
  const feedContainer = document.querySelector('.feed-preview');
  if (!feedContainer) return;
  
  // Add new entry every 12-18 seconds
  setInterval(() => {
    const randomThreat = mockThreats[Math.floor(Math.random() * mockThreats.length)];
    const newEntry = createFeedEntry(randomThreat);
    
    // Add to top of feed
    feedContainer.insertAdjacentHTML('afterbegin', newEntry);
    
    // Animate entry
    const firstEntry = feedContainer.firstElementChild;
    firstEntry.style.opacity = '0';
    firstEntry.style.transform = 'translateX(-10px)';
    setTimeout(() => {
      firstEntry.style.transition = 'all 0.5s ease';
      firstEntry.style.opacity = '1';
      firstEntry.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove oldest entry if more than 5
    const entries = feedContainer.querySelectorAll('.feed-line');
    if (entries.length > 5) {
      entries[entries.length - 1].remove();
    }
  }, Math.random() * 6000 + 12000); // Random interval between 12-18 seconds
}

/**
 * Initialize tool handlers
 */
function initToolHandlers() {
  // Minimal handler - can be expanded later if needed
  console.log('Tool handlers initialized');
}

// ==================== 
// INITIALIZATION
// ==================== 

/**
 * Initialize all functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  // Core features
  initBootSequence();
  initSmoothScroll();
  
  // Phishing section features
  initLiveFeed();
  initToolHandlers();
  
  // Optional enhancements (comment out if not needed)
  // initScrollSpy();
  // initScrollAnimations();
  initConsoleEasterEgg();
  
  // Log successful initialization
  console.log('VAULT 4624 Terminal initialized successfully');
});

// ==================== 
// UTILITY FUNCTIONS
// ==================== 

/**
 * Copy text to clipboard (useful for code blocks)
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

/**
 * Format date for display
 */
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString();
}

// Export functions if using modules (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    skipBoot,
    initBootSequence,
    initSmoothScroll,
    copyToClipboard,
    formatDate
  };
}
