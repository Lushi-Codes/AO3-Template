
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
          if (screen) {
            screen.classList.add('active');
          } else {
            showToast('App not available');
          }
        }

        function closeApp(appId) {
          const el = document.getElementById(appId);
          if (el) el.classList.remove('active');
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
    document.addEventListener('DOMContentLoaded', function () {
      const lock = document.getElementById('lockScreen');
      const homes = document.querySelector('.homescreen');
      if (lock && homes) {
        // hide homescreen while lock is visible
        homes.style.display = 'none';

        function unlock() {
          lock.style.display = 'none';
          homes.style.display = 'flex';
        }

        lock.addEventListener('click', unlock);
        lock.addEventListener('touchstart', unlock);

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
