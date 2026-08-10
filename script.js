
    // Debug panel initialization (visible on-page to help diagnose JS/load errors)
    (function initDebugPanel(){
      try {
        const existing = document.getElementById('debugPanel');
        if (existing) return;
        const dp = document.createElement('div');
        dp.id = 'debugPanel';
        dp.style.position = 'fixed';
        dp.style.right = '12px';
        dp.style.bottom = '12px';
        dp.style.width = '320px';
        dp.style.maxHeight = '220px';
        dp.style.overflow = 'auto';
        dp.style.background = 'rgba(0,0,0,0.75)';
        dp.style.color = '#9ff';
        dp.style.fontSize = '12px';
        dp.style.padding = '8px';
        dp.style.borderRadius = '8px';
        dp.style.zIndex = 9999;
        dp.style.boxShadow = '0 6px 18px rgba(0,0,0,0.6)';
        dp.innerHTML = '<div style="font-weight:700; margin-bottom:6px;">DEBUG PANEL</div>';
        document.addEventListener('DOMContentLoaded', () => { document.body.appendChild(dp); });

        window.debug = function (msg) {
          try {
            const el = document.getElementById('debugPanel');
            if (!el) return;
            const row = document.createElement('div');
            row.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
            el.appendChild(row);
            while (el.childElementCount > 18) el.removeChild(el.children[1]);
          } catch (e) { /* ignore */ }
        };

        window.addEventListener('error', function (ev) {
          debug('ERROR: ' + ev.message + ' @ ' + (ev.filename || '') + ':' + (ev.lineno || '') );
        });
        window.addEventListener('unhandledrejection', function (ev) {
          try { debug('UNHANDLED PROMISE REJECTION: ' + (ev.reason && ev.reason.message ? ev.reason.message : JSON.stringify(ev.reason))); } catch(e){}
        });
      } catch (e) { /* ignore */ }
    })();

    function openApp(appId, el) {
  // If caller passed the icon element, use it to check lock state
  if (el && el.classList && el.classList.contains('locked')) {
    showToast('App is locked');
    return;
  }

  // fallback: if no element passed, attempt to find corresponding icon by data-app
  if (!el) {
    const icon = document.querySelector('[data-app]');
    if (icon && icon.classList && icon.classList.contains('locked')) {
      showToast('App is locked');
      return;
    }
  }

  const screen = document.getElementById(appId);
  if (!screen) {
    showToast('App not available');
    return;
  }

  // Close any other open screens so only one app is visible at a time
  // Use all .app-screen to be robust in case classes are out-of-sync
  const others = document.querySelectorAll('.app-screen');
  console.log('openApp: requested', appId, 'current active:', Array.from(document.querySelectorAll('.app-screen.active')).map(x=>x.id));
  others.forEach(s => {
    if (s !== screen) {
      s.classList.remove('active');
      // hide via inline style as a robust fallback
      s.style.display = 'none';
    }
  });

  // Ensure the screen has a visible loading placeholder if empty while fragments load
  const body = screen.querySelector('.screen-body') || screen;
  const hasContent = body.querySelector('*') || (body.innerText && body.innerText.trim().length > 0);
  if (!hasContent) {
    body.innerHTML = '<div class="loading">Loading…</div>';
  }

  // Open requested screen
  screen.style.display = 'flex';
  screen.classList.add('active');
  console.log('openApp: after open active:', Array.from(document.querySelectorAll('.app-screen.active')).map(x=>x.id));

  // For accessibility, move focus into the opened screen
  const focusTarget = screen.querySelector('button, a, [tabindex]') || screen.querySelector('.screen-body');
  if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
}

        function closeApp(appId) {
          const el = document.getElementById(appId);
          if (el) {
            el.classList.remove('active');
            el.style.display = 'none';
          }
        }

        // small toast helper for feedback
        function showToast(message, duration = 1200) {
          let t = document.querySelector('.toast');
          if (!t) {
            t = document.createElement('div');
            t.className = 'toast';
            document.querySelector('.phone-frame').appendChild(t);
          }
          t.textContent = message;
          t.style.display = 'block';
          setTimeout(() => { t.style.display = 'none'; }, duration);
        }


    // Lock screen unlock behavior
    function forceUnlock() {
      const lock = document.getElementById('lockScreen');
      const homes = document.querySelector('.homescreen');
      if (lock) {
        lock.style.display = 'none';
        lock.classList.remove('is-active');
      }
      if (homes) homes.style.display = 'flex';
    }

    document.addEventListener('DOMContentLoaded', function () {
      const lock = document.getElementById('lockScreen');
      const homes = document.querySelector('.homescreen');
      if (lock && homes) {
        // hide homescreen while lock is visible
        homes.style.display = 'none';

        function unlock() {
          forceUnlock();
        }

        lock.addEventListener('click', unlock);
        lock.addEventListener('touchstart', unlock);

        // make it possible to unlock with keyboard or double-click if clicks aren't reaching
        document.addEventListener('keydown', (e) => {
          if (lock.style.display !== 'none' && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
            unlock();
          }
        });
        lock.addEventListener('dblclick', unlock);

        // also wire the emergency unlock button if present
        const ubtn = document.getElementById('unlockBtn');
        if (ubtn) ubtn.addEventListener('click', forceUnlock);

        // initialize analog clock and date
        function updateAnalogClock() {
          const now = new Date();
          const secs = now.getSeconds();
          const mins = now.getMinutes();
          const hrs = now.getHours();

          const secDeg = secs * 6; // 360/60
          const minDeg = mins * 6 + secs * 0.1; // 360/60 + progress
          const hourDeg = (hrs % 12) * 30 + mins * 0.5; // 360/12 + progress

          const s = document.getElementById('secondHand');
          const m = document.getElementById('minuteHand');
          const h = document.getElementById('hourHand');

          if (s) s.style.transform = `translate(-50%, -100%) rotate(${secDeg}deg)`;
          if (m) m.style.transform = `translate(-50%, -100%) rotate(${minDeg}deg)`;
          if (h) h.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;

          // update date text
          const dateEl = document.getElementById('lockDate');
          if (dateEl) {
            const opts = { weekday: 'short', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString(undefined, opts);
          }
        }

        updateAnalogClock();
        setInterval(updateAnalogClock, 1000);
      }
    });

        // Phone tab switching
        function phoneSwitchTab(tab, btn) {
          // update active button
          document.querySelectorAll('.phone-tab').forEach(b => b.classList.remove('active'));
          if (btn) btn.classList.add('active');

          // show views
          const views = { keypad: 'phoneKeypad', recents: 'phoneRecents', contacts: 'phoneContacts' };
          Object.values(views).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });
          const toShow = document.getElementById(views[tab]);
          if (toShow) toShow.style.display = 'block';
        }

        // Soft key behavior
        function softBack() {
          // close topmost active app-screen
          const actives = Array.from(document.querySelectorAll('.app-screen.active'));
          if (actives.length) {
            const top = actives[actives.length - 1];
            top.classList.remove('active');
            return;
          }
          // if none open, show toast
          showToast('Nothing to go back to');
        }

        function softHome() {
          // close all app screens
          document.querySelectorAll('.app-screen.active').forEach(el => el.classList.remove('active'));
          // ensure homescreen visible
          const homes = document.getElementById('homescreen');
          if (homes) homes.style.display = 'flex';
        }

        function softApps() {
          // toggle folders row visibility as a simple app drawer
          const folders = document.querySelector('.folders-row');
          if (!folders) { showToast('No app drawer'); return; }
          folders.style.display = (folders.style.display === 'none' || !folders.style.display) ? 'grid' : 'none';
        }

        // Load contacts from Apps/Contacts.html and attach expand/action behavior
        document.addEventListener('DOMContentLoaded', () => {
          const contactsList = document.getElementById('contactsList') || document.querySelector('.contacts-list');
          if (!contactsList) return;

          // populate from fragment file (Apps/Contacts.html)
          loadContactsFromFile(contactsList);

          // delegate clicks on rows (ignore clicks on action buttons)
          contactsList.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (btn) { handleContactAction(btn); return; }
            const row = e.target.closest('.contact-row');
            if (!row) return;
            toggleContactRow(row);
          });

          // keyboard support: Enter or Space toggles a focused row
          contactsList.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const row = e.target.closest('.contact-row');
              if (row) { e.preventDefault(); toggleContactRow(row); }
            }
          });
        });

        function loadContactsFromFile(container) {
          fetch('Apps/Contacts.html')
            .then(r => { if (!r.ok) throw new Error('Failed to load contacts'); return r.text(); })
            .then(html => {
              const tmp = document.createElement('div');
              tmp.innerHTML = html;

              // If the fragment already contains fully-formed .contact-row entries, use them directly
              const existingRows = tmp.querySelectorAll('.contact-row');
              if (existingRows.length) {
                container.innerHTML = '';
                existingRows.forEach(r => {
                  const clone = r.cloneNode(true);
                  // ensure dataset.number is present
                  if (!clone.dataset.number) {
                    const num = clone.querySelector('.contact-number')?.textContent?.trim();
                    if (num) clone.dataset.number = num;
                  }
                  clone.tabIndex = 0;
                  container.appendChild(clone);
                });
                return;
              }

              // Older fragment format: .contact-item with .contact-name and .contact-num
              const items = tmp.querySelectorAll('.contact-item');
              if (items.length) {
                container.innerHTML = ''; // clear loader
                items.forEach(it => {
                  const nameEl = it.querySelector('.contact-name');
                  const numEl = it.querySelector('.contact-num');
                  const name = nameEl ? nameEl.textContent.trim() : 'Unknown';
                  const num = numEl ? numEl.textContent.trim() : '';
                  const avatar = initialsFromName(name);
                  const row = document.createElement('div');
                  row.className = 'contact-row';
                  row.tabIndex = 0;
                  row.dataset.number = num;
                  row.innerHTML = `<div class="contact-avatar">${escapeHtml(avatar)}</div>` +
                    `<div class="contact-main">` +
                    `<div class="contact-name">${escapeHtml(name)}</div>` +
                    `<div class="contact-details">` +
                    `<div class="contact-number">${escapeHtml(num)}</div>` +
                    `<div class="contact-actions">` +
                    `<button class="action-btn action-call" title="Call">📞</button>` +
                    `<button class="action-btn action-msg" title="Message">💬</button>` +
                    `<button class="action-btn action-info" title="Info">ℹ️</button>` +
                    `</div></div></div>`;
                  container.appendChild(row);
                });
                return;
              }

              // Nothing recognizable — show helpful message
              container.innerHTML = '<div class="loading">No contacts found in Apps/Contacts.html</div>';
            })
            .catch(err => { console.error(err); container.innerHTML = '<div class="loading">Unable to load contacts</div>'; });
        }

        function initialsFromName(name) {
          const parts = name.split(/\s+/).filter(Boolean);
          if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
          return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
        }

        function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

        function normalizeNumber(n) {
  let s = String(n || '').trim();
  if (!s) return '';
  const hasPlus = s.startsWith('+');
  // remove all non-digit characters
  s = s.replace(/[^\d]/g, '');
  return hasPlus ? ('+' + s) : s;
}

        function toggleContactRow(row) {
          // close other expanded rows
          document.querySelectorAll('.contact-row.expanded').forEach(r => { if (r !== row) r.classList.remove('expanded'); });
          row.classList.toggle('expanded');
        }

        function handleContactAction(btn) {
          const row = btn.closest('.contact-row');
          if (!row) return;
          const number = row.dataset.number || row.querySelector('.contact-number')?.textContent || '';
          const norm = normalizeNumber(number);
          if (btn.classList.contains('action-call')) {
            showToast('Calling ' + number, 1200);
            if (norm) window.location.href = 'tel:' + norm;
            return;
          }
          if (btn.classList.contains('action-msg')) {
            showToast('Opening SMS to ' + number, 1200);
            if (norm) window.location.href = 'sms:' + norm;
            return;
          }
          if (btn.classList.contains('action-info')) {
            showToast('Info for ' + row.querySelector('.contact-name')?.textContent.trim(), 1200);
            return;
          }
        }

        // Load other app fragments using a single unified loader
        function loadFragmentTo(selector, fileName) {
          const container = document.querySelector(selector);
          if (!container) return Promise.resolve('');
          return fetch(fileName)
            .then(r => { if (!r.ok) throw new Error('Failed to load ' + fileName); return r.text(); })
            .then(html => {
              container.innerHTML = html.trim();
              return html;
            })
            .catch(err => {
              console.error(err);
              container.innerHTML = '<div class="loading">Unable to load ' + fileName + '</div>';
              return '';
            });
        }

        function slugify(text) {
          return String(text || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-_]/g, '')
            .replace(/-+/g, '-');
        }

        function setupMessagesList() {
          const msgList = document.querySelector('#app-messages .message-list');
          if (!msgList) return;
          window.__messagesStore = window.__messagesStore || {};
          const items = Array.from(msgList.querySelectorAll('.message-item'));
          if (!items.length) {
            msgList.innerHTML = '<div class="loading">No messages available</div>';
            return;
          }

          items.forEach(item => {
            const id = item.dataset.id || slugify(item.querySelector('.message-name')?.textContent || 'chat');
            const name = item.querySelector('.message-name')?.textContent.trim() || 'Chat';
            const snippet = item.querySelector('.message-snippet')?.textContent.trim() || '';
            item.dataset.id = id;
            if (!window.__messagesStore[id] || !window.__messagesStore[id].length) {
              window.__messagesStore[id] = [{ from: 'them', text: snippet, time: new Date().toISOString() }];
            }
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
              openApp('app-messages');
              openConversation(id, name);
            });
          });
        }

        function setupMessagesConversationControls() {
          const screen = document.getElementById('app-messages');
          if (!screen) return;
          const back = screen.querySelector('.conv-back');
          const input = screen.querySelector('.conv-input');
          const send = screen.querySelector('.conv-send');

          if (back) back.addEventListener('click', closeConversation);
          if (input) {
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendCurrentMessage();
              }
            });
          }
          if (send) send.addEventListener('click', sendCurrentMessage);
        }

        function renderConversation(id) {
          const convScroll = document.querySelector('#app-messages .conversation-scroll');
          if (!convScroll) return;
          convScroll.innerHTML = '';
          const msgs = window.__messagesStore[id] || [];
          msgs.forEach(m => {
            const bubble = document.createElement('div');
            bubble.className = 'conv-bubble ' + (m.from === 'me' ? 'me' : 'them');
            bubble.innerHTML = '<div class="conv-text">' + escapeHtml(m.text) + '</div>' +
              '<div class="conv-time">' + new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</div>';
            convScroll.appendChild(bubble);
          });
          convScroll.scrollTop = convScroll.scrollHeight;
        }

        function openConversation(id, name) {
          const screen = document.getElementById('app-messages');
          if (!screen) return;
          const title = screen.querySelector('.screen-title');
          if (title) title.textContent = name;
          const list = screen.querySelector('.message-list');
          const conv = screen.querySelector('.conversation-container');
          if (list) list.style.display = 'none';
          if (conv) conv.style.display = 'flex';

          window.__messagesStore = window.__messagesStore || {};
          window.__messagesStore[id] = window.__messagesStore[id] || [];
          screen.dataset.currentConversation = id;
          renderConversation(id);

          const input = screen.querySelector('.conv-input');
          if (input) input.focus();
        }

        function closeConversation() {
          const screen = document.getElementById('app-messages');
          if (!screen) return;
          const title = screen.querySelector('.screen-title');
          if (title) title.textContent = 'Messages';
          const list = screen.querySelector('.message-list');
          const conv = screen.querySelector('.conversation-container');
          if (conv) conv.style.display = 'none';
          if (list) list.style.display = 'flex';
          screen.dataset.currentConversation = '';
        }

        function sendCurrentMessage() {
          const screen = document.getElementById('app-messages');
          if (!screen) return;
          const id = screen.dataset.currentConversation;
          if (!id) return;
          const input = screen.querySelector('.conv-input');
          if (!input) return;
          const text = input.value.trim();
          if (!text) return;
          const msg = { from: 'me', text: text, time: new Date().toISOString() };
          window.__messagesStore = window.__messagesStore || {};
          window.__messagesStore[id] = window.__messagesStore[id] || [];
          window.__messagesStore[id].push(msg);
          renderConversation(id);
          input.value = '';
        }

        function loadAppFragments() {
          const mappings = [
            { file: 'Apps/Notes.html', selector: '#app-notes .notes-list' },
            { file: 'Apps/Messages.html', selector: '#app-messages .message-list' },
            { file: 'Apps/Soccer.html', selector: '#soccerBody' },
            { file: 'Apps/Gallery.html', selector: '#app-gallery .screen-body' },
            { file: 'Apps/Calls.html', selector: '#phoneRecents .recents-list' },
          ];

          const promises = mappings.map(map => loadFragmentTo(map.selector, map.file));
          return Promise.all(promises).then(() => {
            setupMessagesList();
            setupMessagesConversationControls();
          });
        }

        document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('.app-screen').forEach(s => { if (!s.classList.contains('active')) s.style.display = 'none'; });
          loadAppFragments();
        });

