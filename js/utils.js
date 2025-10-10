// ==================== 
// SECURITY UTILITIES
// ==================== 

const SecurityUtils = {
  sanitize: function(dirty) {
    if (typeof dirty !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = dirty;
    return div.innerHTML;
  },
  
  sanitizeURL: function(url) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return this.sanitize(url);
    } catch (e) {
      return this.sanitize(url);
    }
  }
};

const StorageUtils = {
  MAX_SIZE: 5000000,
  
  setItem: function(key, value) {
    try {
      const serialized = JSON.stringify(value);
      
      if (serialized.length > this.MAX_SIZE) {
        console.warn(`Data for ${key} exceeds ${this.MAX_SIZE} bytes`);
        return false;
      }
      
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Clearing old cache...');
        this.clearOldCache();
        
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e2) {
          console.error('Still failed after clearing cache');
          return false;
        }
      }
      console.error('Storage error:', e);
      return false;
    }
  },
  
  getItem: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error parsing ${key} from storage:`, e);
      return null;
    }
  },
  
  clearOldCache: function() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    
    keys.forEach(key => {
      if (key.endsWith('_updated')) {
        const timestamp = parseInt(localStorage.getItem(key));
        if (now - timestamp > maxAge) {
          const dataKey = key.replace('_updated', '_data');
          localStorage.removeItem(key);
          localStorage.removeItem(dataKey);
          console.log(`Cleared old cache: ${dataKey}`);
        }
      }
    });
  }
};

const APIUtils = {
  fetchWithRetry: async function(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
          if (rateLimitRemaining === '0') {
            const resetTime = parseInt(response.headers.get('X-RateLimit-Reset')) * 1000;
            const waitTime = resetTime - Date.now();
            
            if (waitTime > 0 && waitTime < 60000) {
              console.log(`Rate limited. Waiting ${Math.round(waitTime/1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            } else {
              throw new Error(`Rate limited. Reset at ${new Date(resetTime).toLocaleTimeString()}`);
            }
          }
        }
        
        if (!response.ok && i < maxRetries - 1) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },
  
  fetchWithCORS: async function(url) {
    const allowedDomains = [
      'raw.githubusercontent.com',
      'api.github.com'
    ];
    
    const urlObj = new URL(url);
if (!allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain))) {
  throw new Error('CORS proxy only allowed for GitHub domains');
}
    
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (e) {
      console.log('Direct fetch failed, trying proxies...');
    }
    
    const proxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?'
    ];
    
    let lastError;
    for (const proxy of proxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(url));
        if (response.ok) return response;
      } catch (error) {
        lastError = error;
      }
    }
    
    throw lastError || new Error('All CORS proxies failed');
  }
};

const UIUtils = {
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  validateNumericInput: function(input, min, max) {
    if (!input) return;
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      const value = parseInt(e.target.value) || min;
      e.target.value = Math.min(Math.max(value, min), max);
    });
  },
  
  showToast: function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 'rgba(74, 250, 154, 0.9)'};
      color: ${type === 'error' ? '#fff' : '#0a0e0a'};
      border: 1px solid ${type === 'error' ? '#ff4444' : '#4afa9a'};
      z-index: 10000;
      font-family: 'VT323', monospace;
      font-size: 1.1em;
      max-width: 400px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

const CleanupUtils = {
  intervals: [],
  timeouts: [],
  
  registerInterval: function(id) {
    this.intervals.push(id);
    return id;
  },
  
  registerTimeout: function(id) {
    this.timeouts.push(id);
    return id;
  },
  
  clearAll: function() {
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.forEach(id => clearTimeout(id));
    this.intervals = [];
    this.timeouts = [];
  }
};

window.addEventListener('beforeunload', () => {
  CleanupUtils.clearAll();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const statusElement = document.getElementById('status-text');
  if (statusElement) {
    statusElement.textContent = 'ERROR - CHECK CONSOLE';
    statusElement.style.color = '#ff4444';
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  UIUtils.showToast('An error occurred. Check console for details.', 'error');
});
