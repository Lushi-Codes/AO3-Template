// AO3 Template Security System
(function() {
  'use strict';

  // Simple encryption for sensitive localStorage data
  const StorageEncryption = {
    key: 'AO3_SECURITY_KEY_2026',

    encrypt: function(data) {
      const str = JSON.stringify(data);
      let encrypted = '';
      for (let i = 0; i < str.length; i++) {
        encrypted += String.fromCharCode(str.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length));
      }
      return btoa(encrypted);
    },

    decrypt: function(encoded) {
      try {
        const encrypted = atob(encoded);
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
          decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length));
        }
        return JSON.parse(decrypted);
      } catch (e) {
        return null;
      }
    }
  };

  // Protect localStorage operations with encryption
  const OriginalSetItem = Storage.prototype.setItem;
  const OriginalGetItem = Storage.prototype.getItem;

  Storage.prototype.setItem = function(key, value) {
    // Encrypt sensitive storage keys
    if (key.startsWith('AO3_') || key === 'calendar_events_v1' || key === 'notes_storage') {
      try {
        const encrypted = StorageEncryption.encrypt(JSON.parse(value));
        return OriginalSetItem.call(this, key, encrypted);
      } catch (e) {
        return OriginalSetItem.call(this, key, value);
      }
    }
    return OriginalSetItem.call(this, key, value);
  };

  Storage.prototype.getItem = function(key) {
    const encrypted = OriginalGetItem.call(this, key);
    if (!encrypted) return null;
    if (key.startsWith('AO3_') || key === 'calendar_events_v1' || key === 'notes_storage') {
      const decrypted = StorageEncryption.decrypt(encrypted);
      return decrypted ? JSON.stringify(decrypted) : encrypted;
    }
    return encrypted;
  };

  // DevTools detection (warning only, not blocking)
  let devToolsOpen = false;
  const checkDevTools = () => {
    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.warn('⚠️ Developer Tools detected. Direct data manipulation may be restricted.');
      }
    } else {
      devToolsOpen = false;
    }
  };

  setInterval(checkDevTools, 1000);

  // Block dangerous keyboard shortcuts (F12, DevTools, etc.)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
      e.preventDefault();
      return false;
    }
  }, true);

  // Disable context menu (right-click)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, true);

  // Monitor for suspicious DOM modifications
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SCRIPT' && node.src && !node.src.includes('security.js') && !node.src.includes('script.js')) {
              console.warn('⚠️ External script injection attempt detected');
            }
            if (node.tagName === 'LINK' && node.href && node.rel === 'stylesheet' && !node.href.includes('style.css')) {
              console.warn('⚠️ External stylesheet injection attempt detected');
            }
          }
        });
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Provide security utilities
  window.AO3Security = {
    isDevToolsOpen: () => devToolsOpen,
    encrypt: (data) => StorageEncryption.encrypt(data),
    decrypt: (encoded) => StorageEncryption.decrypt(encoded),
    protectFunction: function(fn) {
      return Object.freeze(Object.seal(fn));
    }
  };

  console.log('🔒 AO3 Template Security System initialized');
})();
