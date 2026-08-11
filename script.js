

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
        dp.innerHTML = '<div style="font-weight:700; margin-bottom:6px;"></div>';
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
      if (homes) {
        homes.style.display = 'flex';
      }
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

        // Click anywhere on lock screen to unlock
        lock.addEventListener('click', (e) => {
          e.stopPropagation();
          unlock();
        });

        lock.addEventListener('touchstart', unlock);

        // Keyboard shortcuts to unlock
        document.addEventListener('keydown', (e) => {
          if (lock.style.display !== 'none' && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
            e.preventDefault();
            unlock();
          }
        });

        lock.addEventListener('dblclick', unlock);

        // Emergency unlock button
        const ubtn = document.getElementById('unlockBtn');
        if (ubtn) {
          ubtn.addEventListener('click', (e) => {
            e.stopPropagation();
            forceUnlock();
          });
        }

        // initialize analog clock and date
        function updateAnalogClock() {
          const now = new Date();
          const secs = now.getSeconds();
          const mins = now.getMinutes();
          const hrs = now.getHours();

          const secDeg = secs * 6;
          const minDeg = mins * 6 + secs * 0.1;
          const hourDeg = (hrs % 12) * 30 + mins * 0.5;

          const s = document.getElementById('secondHand');
          const m = document.getElementById('minuteHand');
          const h = document.getElementById('hourHand');

          if (s) s.style.transform = `translate(-50%, -100%) rotate(${secDeg}deg)`;
          if (m) m.style.transform = `translate(-50%, -100%) rotate(${minDeg}deg)`;
          if (h) h.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;

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
          if (toShow) {
            toShow.style.display = 'block';
            // If showing keypad, move focus there so keyboard input works immediately
            if (tab === 'keypad') {
              const kp = document.getElementById('phoneKeypad');
              const focusTarget = (kp && (kp.querySelector('.phone-keypad-wrapper') || kp.querySelector('.keypad'))) || kp;
              if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
            }
          }
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
                const rows = Array.from(existingRows);
                // Sort alphabetically by contact name
                rows.sort((a, b) => {
                  const nameA = a.querySelector('.contact-name')?.textContent?.trim() || '';
                  const nameB = b.querySelector('.contact-name')?.textContent?.trim() || '';
                  return nameA.localeCompare(nameB);
                });
                rows.forEach(r => {
                  const clone = r.cloneNode(true);
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
                container.innerHTML = '';
                const contactsData = [];
                items.forEach(it => {
                  const nameEl = it.querySelector('.contact-name');
                  const numEl = it.querySelector('.contact-num');
                  const name = nameEl ? nameEl.textContent.trim() : 'Unknown';
                  const num = numEl ? numEl.textContent.trim() : '';
                  contactsData.push({ name, num });
                });
                // Sort alphabetically by name
                contactsData.sort((a, b) => a.name.localeCompare(b.name));
                contactsData.forEach(contact => {
                  const avatar = initialsFromName(contact.name);
                  const row = document.createElement('div');
                  row.className = 'contact-row';
                  row.tabIndex = 0;
                  row.dataset.number = contact.num;
                  row.innerHTML = `<div class="contact-avatar">${escapeHtml(avatar)}</div>` +
                    `<div class="contact-main">` +
                    `<div class="contact-name">${escapeHtml(contact.name)}</div>` +
                    `<div class="contact-details">` +
                    `<div class="contact-number">${escapeHtml(contact.num)}</div>` +
                    `<div class="contact-actions">` +
                    `<button class="action-btn action-call" title="Call">📞</button>` +
                    `<button class="action-btn action-msg" title="Message">💬</button>` +
                    `<button class="action-btn action-info" title="Info">ℹ️</button>` +
                    `</div></div></div>`;
                  container.appendChild(row);
                });
                return;
              }

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
          if (!container) {
            console.warn('Fragment container not found:', selector);
            return Promise.resolve('');
          }
          console.log('Loading fragment:', fileName, 'into', selector);
          return fetch(fileName)
            .then(r => { if (!r.ok) throw new Error('Failed to load ' + fileName); return r.text(); })
            .then(html => {
              console.log('Fragment loaded:', fileName);
              container.innerHTML = html.trim();
              console.log('Fragment inserted into DOM:', selector);
              return html;
            })
            .catch(err => {
              console.error('Fragment load error:', fileName, err);
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

        // Fragment initializers (for fragments that include their own scripts or when scripts
        // don't execute via innerHTML). Keep these in script.js so they always run.
        function initializeKeypad() {
          console.log('initializeKeypad called');
          try {
            const container = document.getElementById('phoneKeypad') || document.querySelector('.phone-keypad-wrapper');
            console.log('Keypad container:', container ? 'found' : 'NOT FOUND');
            if (!container) return;

            if (container._keypadInitialized) {
              console.log('Keypad already initialized, skipping');
              return;
            }
            container._keypadInitialized = true;

            const display = container.querySelector('.dial-display');
            const keypad = container.querySelector('.keypad');
            console.log('Keypad display:', display ? 'found' : 'NOT FOUND');
            console.log('Keypad grid:', keypad ? 'found' : 'NOT FOUND');

            if (!display) return;
            if (!keypad) return;

            // Initialize display to 0
            if (display.tagName === 'INPUT') display.value = '0';
            else display.textContent = '0';
            console.log('Keypad initialized successfully');

            const backspaceBtn = container.querySelector('.backspace-btn');
            const clearBtn = container.querySelector('.clear-btn');
            const callBtn = container.querySelector('.call-btn');

            function getDisplay() {
              return (display.tagName === 'INPUT' || display.tagName === 'TEXTAREA') ? display.value : display.textContent;
            }
            function setDisplay(v) {
              v = String(v || '0');
              if (display.tagName === 'INPUT' || display.tagName === 'TEXTAREA') display.value = v;
              else display.textContent = v;
            }

            // Use event delegation on keypad grid
            keypad.addEventListener('click', (e) => {
              const key = e.target.closest('.key');
              if (!key) return;
              const d = key.dataset.digit;
              if (d !== undefined) {
                const current = getDisplay();
                if (current === '0' && d !== '.') setDisplay(d);
                else setDisplay(current + d);
              }
            });

            if (backspaceBtn) {
              backspaceBtn.addEventListener('click', () => {
                const val = getDisplay();
                setDisplay(val.slice(0, -1) || '0');
              });
            }

            if (clearBtn) {
              clearBtn.addEventListener('click', () => {
                setDisplay('0');
              });
            }

            if (callBtn) {
              callBtn.addEventListener('click', () => {
                const n = (getDisplay() || '').trim();
                if (!n) { showToast && showToast('Enter number', 1200); return; }
                const norm = (n.startsWith('+') ? '+' : '') + n.replace(/[^\d]/g, '');
                if (norm) window.location.href = 'tel:' + norm;
              });
            }

            // keyboard: only accept digits and dial symbols when focused
            container.addEventListener('keydown', (e) => {
              if (/^[0-9*#+]$/.test(e.key)) {
                e.preventDefault();
                const current = getDisplay();
                if (current === '0' && /[0-9]/.test(e.key)) setDisplay(e.key);
                else setDisplay(current + e.key);
              } else if (e.key === 'Backspace') {
                e.preventDefault();
                setDisplay(getDisplay().slice(0, -1) || '0');
              }
            });
            if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '0');
          } catch(e) {
            console.error('initializeKeypad error:', e);
          }
        }

        function initializeCalculator(){
          console.log('initializeCalculator called');
          try{
            const container = document.querySelector('#app-calculator .screen-body') || document.querySelector('.calculator');
            console.log('Calculator container:', container ? 'found' : 'NOT FOUND');
            if (!container) return;

            if (container._calcInitialized) {
              console.log('Calculator already initialized, skipping');
              return;
            }
            container._calcInitialized = true;

            const display = container.querySelector('.calc-display');
            const grid = container.querySelector('.calc-grid');
            console.log('Calculator display:', display ? 'found' : 'NOT FOUND');
            console.log('Calculator grid:', grid ? 'found' : 'NOT FOUND');

            if (!display) return;
            if (!grid) return;

            console.log('Calculator initialized successfully');
            let expr = '';

            function set(val){
              val = String(val || '0');
              display.value = val;
            }
            function append(v){
              expr += String(v);
              set(expr);
            }
            function clearAll(){ expr = ''; set('0'); }
            function back(){ expr = expr.slice(0,-1); set(expr || '0'); }
            function toggleNeg(){
              if(!expr) return;
              if(expr.charAt(0)==='-') expr = expr.slice(1);
              else expr = '-' + expr;
              set(expr);
            }
            function percent(){
              try{
                const v = parseFloat(expr || '0');
                expr = String(v/100);
                set(expr);
              }catch(e){}
            }
            function evaluate(){
              try{
                const s = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
                const safe = s.replace(/[^0-9+\-*/(). %]/g,'');
                if (!safe) { expr = ''; set('0'); return; }
                const fn = new Function('return ' + safe);
                const res = fn();
                expr = (res===undefined||res===null)?'':String(res);
                set(expr || '0');
              }catch(e){
                set('Error');
                expr = '';
              }
            }

            // Use event delegation on grid
            grid.addEventListener('click', (e)=>{
              const btn = e.target.closest('button');
              if(!btn) return;

              const d = btn.dataset.digit;
              const op = btn.dataset.op;
              const action = btn.dataset.action;

              if(d !== undefined) {
                if(d==='%') percent();
                else append(d);
              } else if(op) {
                append(' ' + op + ' ');
              } else if(action) {
                if(action==='clear') clearAll();
                else if(action==='back') back();
                else if(action==='neg') toggleNeg();
                else if(action==='equals') evaluate();
              }
            });

            // Keyboard support
            container.addEventListener('keydown', (e)=>{
              if(/^[0-9]$/.test(e.key)) { e.preventDefault(); append(e.key); }
              else if('+-*/'.includes(e.key)) { e.preventDefault(); append(' '+e.key+' '); }
              else if(e.key==='Enter' || e.key==='=') { e.preventDefault(); evaluate(); }
              else if(e.key==='Backspace') { e.preventDefault(); back(); }
              else if(e.key==='Escape') { e.preventDefault(); clearAll(); }
              else if(e.key==='.') { e.preventDefault(); append('.'); }
            });

            if(!container.hasAttribute('tabindex')) container.setAttribute('tabindex','0');

            clearAll();
          }catch(e){ console.error('initializeCalculator error:', e); }
        }

        function initializeCalendar(){
          try{
            const container = document.querySelector('#app-calendar .screen-body') || document.querySelector('.calendar-app');
            if (!container) return;
            if (container._calendarInitialized) return;
            container._calendarInitialized = true;

            const STORAGE_KEY = 'calendar_events_v1';
            let currentDate = new Date();
            let selectedDate = new Date();
            let editingEvent = null;

            function loadEvents() {
              try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
              catch(e) { return []; }
            }

            function saveEvents(events) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
            }

            function getEventsForDate(date) {
              const dateStr = date.toISOString().split('T')[0];
              return loadEvents().filter(e => e.date === dateStr);
            }

            function formatDateForDisplay(date) {
              const month = date.toLocaleString('default', { month: 'short' });
              const day = date.getDate();
              return month + ' ' + day;
            }

            function renderCalendar() {
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              const monthName = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
              document.getElementById('cal-month').textContent = monthName;

              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const daysInPrevMonth = new Date(year, month, 0).getDate();

              const grid = document.getElementById('cal-days');
              if (!grid) return;
              grid.innerHTML = '';

              for (let i = firstDay - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const dateObj = new Date(year, month - 1, day);
                grid.appendChild(createDayElement(dateObj, true));
              }

              for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(year, month, day);
                grid.appendChild(createDayElement(dateObj, false));
              }

              const totalCells = grid.children.length;
              const remainingCells = 42 - totalCells;
              for (let day = 1; day <= remainingCells; day++) {
                const dateObj = new Date(year, month + 1, day);
                grid.appendChild(createDayElement(dateObj, true));
              }
            }

            function createDayElement(dateObj, isOtherMonth) {
              const dayEl = document.createElement('div');
              dayEl.className = 'cal-day';
              dayEl.dataset.date = dateObj.toISOString().split('T')[0];

              if (isOtherMonth) {
                dayEl.classList.add('other-month');
              } else {
                dayEl.classList.add('current-month');
              }

              if (new Date().toDateString() === dateObj.toDateString()) dayEl.classList.add('today');
              if (selectedDate.toDateString() === dateObj.toDateString()) dayEl.classList.add('selected');

              const dayNum = document.createElement('div');
              dayNum.className = 'cal-day-num';
              dayNum.textContent = dateObj.getDate();
              dayEl.appendChild(dayNum);

              const events = getEventsForDate(dateObj);
              if (events.length > 0) {
                const eventsDiv = document.createElement('div');
                eventsDiv.className = 'cal-day-events';
                eventsDiv.textContent = events[0].title.substring(0, 8) + (events.length > 1 ? '...' : '');
                dayEl.appendChild(eventsDiv);
              }

              dayEl.addEventListener('click', () => {
                selectedDate = new Date(dateObj);
                const events = getEventsForDate(selectedDate);
                showDayView(selectedDate, events);
              });
              return dayEl;
            }

          function updateAddButton() {
              const dateSpan = document.getElementById('cal-add-date');
              if (dateSpan) dateSpan.textContent = formatDateForDisplay(selectedDate);
            }

            const PERMANENT_EVENTS = ['2026-09-09', '2026-10-10'];

            function isPermanentEvent(event) {
              if (!event || !event.date) return false;
              return PERMANENT_EVENTS.includes(event.date);
            }

            function showDayView(dateObj, events) {
              const dayView = document.getElementById('cal-day-view');
              const dateTitle = document.getElementById('day-view-date');
              const dayname = document.getElementById('day-view-dayname');
              const container = document.getElementById('day-events-container');

              const dayNum = dateObj.getDate();
              const dayNameStr = dateObj.toLocaleString('default', { weekday: 'long' });
              dateTitle.textContent = dayNum;
              dayname.textContent = dayNameStr;

              container.innerHTML = '';
              events.forEach(event => {
                const card = document.createElement('div');
                card.className = 'cal-event-card';
                const isPerm = isPermanentEvent(event);
                if (isPerm) card.classList.add('permanent');

                let html = '<div class="cal-event-icon">📅</div>';
                html += '<div class="cal-event-title">' + event.title + '</div>';
                if (event.time) html += '<div class="cal-event-time">' + event.time + '</div>';
                if (event.description) html += '<div class="cal-event-description">' + event.description + '</div>';

                card.innerHTML = html;
                if (!isPerm) {
                  card.addEventListener('click', () => openModal(event));
                }
                container.appendChild(card);
              });

              const dayAddBtn = document.getElementById('day-add-event');
              if (dayAddBtn) {
                dayAddBtn.addEventListener('click', () => {
                  closeDayView();
                  openModal(null);
                });
              }

              dayView.classList.add('active');
            }

            function closeDayView() {
              const dayView = document.getElementById('cal-day-view');
              dayView.classList.remove('active');
            }


            function openModal(event) {
              if (event && isPermanentEvent(event)) return;
              editingEvent = event;
              const modal = document.getElementById('cal-modal');
              const titleEl = document.getElementById('modal-title');
              const titleInput = document.getElementById('event-title');
              const timeInput = document.getElementById('event-time');
              const descInput = document.getElementById('event-desc');
              const deleteBtn = document.getElementById('btn-delete-event');

              if (event) {
                titleEl.textContent = 'Edit Event';
                titleInput.value = event.title || '';
                timeInput.value = event.time || '';
                descInput.value = event.description || '';
                deleteBtn.style.display = 'block';
              } else {
                titleEl.textContent = 'Add Event';
                titleInput.value = '';
                timeInput.value = '';
                descInput.value = '';
                deleteBtn.style.display = 'none';
              }

              modal.classList.add('active');
              titleInput.focus();
            }

            function closeModal() {
              const modal = document.getElementById('cal-modal');
              modal.classList.remove('active');
              editingEvent = null;
            }

            function saveEvent() {
              const title = document.getElementById('event-title').value.trim();
              const time = document.getElementById('event-time').value;
              const description = document.getElementById('event-desc').value.trim();

              if (!title) { alert('Please enter event title'); return; }

              const events = loadEvents();
              const dateStr = selectedDate.toISOString().split('T')[0];

              if (editingEvent) {
                const idx = events.findIndex(e => e.date === editingEvent.date && e.id === editingEvent.id);
                if (idx >= 0) {
                  events[idx] = { id: editingEvent.id, date: dateStr, title, time, description };
                }
              } else {
                const event = { id: Date.now(), date: dateStr, title, time, description };
                events.push(event);
              }

              saveEvents(events);
              renderCalendar();
              closeModal();
            }

            function deleteEvent() {
              if (!editingEvent) return;
              if (!confirm('Delete this event?')) return;

              const events = loadEvents();
              const filtered = events.filter(e => !(e.date === editingEvent.date && e.id === editingEvent.id));
              saveEvents(filtered);
              renderCalendar();
              closeModal();
            }

            const addBtn = document.getElementById('cal-add-event');
            const saveBtn = document.getElementById('btn-save-event');
            const cancelBtn = document.getElementById('btn-cancel-event');
            const deleteBtn = document.getElementById('btn-delete-event');
            const monthBtn = document.getElementById('cal-month');
            const prevBtn = document.getElementById('cal-prev-month');
            const nextBtn = document.getElementById('cal-next-month');
            const todayBtn = document.getElementById('cal-today');
            const modal = document.getElementById('cal-modal');
            const dayView = document.getElementById('cal-day-view');
            const dayViewClose = document.getElementById('day-view-close');

            if (addBtn) addBtn.addEventListener('click', () => openModal(null));
            if (saveBtn) saveBtn.addEventListener('click', saveEvent);
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
            if (deleteBtn) deleteBtn.addEventListener('click', deleteEvent);
            if (monthBtn) monthBtn.addEventListener('click', () => {
              currentDate = new Date();
              selectedDate = new Date();
              renderCalendar();
              updateAddButton();
            });
            if (prevBtn) prevBtn.addEventListener('click', () => {
              currentDate.setMonth(currentDate.getMonth() - 1);
              renderCalendar();
            });
            if (nextBtn) nextBtn.addEventListener('click', () => {
              currentDate.setMonth(currentDate.getMonth() + 1);
              renderCalendar();
            });
            if (todayBtn) todayBtn.addEventListener('click', () => {
              currentDate = new Date();
              selectedDate = new Date();
              renderCalendar();
              updateAddButton();
            });
            if (dayViewClose) dayViewClose.addEventListener('click', closeDayView);
            if (dayView) dayView.addEventListener('click', (e) => {
              if (e.target.id === 'cal-day-view') closeDayView();
            });
            if (modal) modal.addEventListener('click', (e) => {
              if (e.target.id === 'cal-modal') closeModal();
            });

            renderCalendar();
            updateAddButton();
          }catch(e){ console.error('initializeCalendar error:', e); }
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
          console.log('Starting loadAppFragments...');
          const mappings = [
            { file: 'Apps/Notes.html', selector: '#app-notes .notes-list' },
            { file: 'Apps/Messages.html', selector: '#app-messages .message-list' },
            { file: 'Apps/Soccer.html', selector: '#soccerBody' },
            { file: 'Apps/Gallery.html', selector: '#app-gallery .screen-body' },
            { file: 'Apps/Calls.html', selector: '#phoneRecents .recents-list' },
            { file: 'Apps/Keypad.html', selector: '#phoneKeypad' },
            { file: 'Apps/Calculator.html', selector: '#app-calculator .screen-body' },
            { file: 'Apps/Calendar.html', selector: '#app-calendar .screen-body' },
          ];

          const promises = mappings.map(map => loadFragmentTo(map.selector, map.file));
          return Promise.all(promises).then(() => {
            console.log('All fragments loaded');
            setupMessagesList();
            setupMessagesConversationControls();
            // initialize fragments that need JS (keypad, calculator, calendar)
            console.log('Initializing keypad...');
            if (typeof initializeKeypad === 'function') initializeKeypad();
            else console.warn('initializeKeypad not defined');

            console.log('Initializing calculator...');
            if (typeof initializeCalculator === 'function') initializeCalculator();
            else console.warn('initializeCalculator not defined');

            console.log('Initializing calendar...');
            if (typeof initializeCalendar === 'function') initializeCalendar();
            else console.warn('initializeCalendar not defined');
          });
        }

        // Initialize app fragments after load
        document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('.app-screen').forEach(s => { if (!s.classList.contains('active')) s.style.display = 'none'; });
          loadAppFragments().then(() => {
            // Give a tiny delay to ensure DOM is fully updated
            setTimeout(() => {
              if (typeof initializeKeypad === 'function') initializeKeypad();
              if (typeof initializeCalculator === 'function') initializeCalculator();
              if (typeof initializeCalendar === 'function') initializeCalendar();
            }, 100);
          });
        });

        // Auto-initialize when apps are opened if not already initialized
        const originalOpenApp = window.openApp;
        window.openApp = function(appId, el) {
          originalOpenApp(appId, el);
          setTimeout(() => {
            if (appId === 'app-phone' && typeof initializeKeypad === 'function') initializeKeypad();
            if (appId === 'app-calculator' && typeof initializeCalculator === 'function') initializeCalculator();
          }, 50);
        };


        // Expose fragment initializers so fragment files could optionally call them
        // (define placeholders to be implemented below)
        
