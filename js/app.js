(function () {
  const i18n = {
    uk: {
      subtitle: 'Браузерний лаунчер · BYO ISO',
      title: 'Запуск у браузері з вашої копії',
      lead: 'Ця сторінка не містить і не завантажує файли гри. Виберіть власний легально отриманий образ PSP (<code>.iso</code>, <code>.cso</code>, <code>.pbp</code>) — він обробляється локально у вашому браузері через емулятор PPSSPP (WebAssembly).',
      legal_title: 'Важливо',
      legal_body: 'Використовуйте лише власну легальну копію гри. Проєкт не афілійований із Bugbear/Empire Interactive/Sony та не розповсюджує захищений контент.',
      pick: 'Вибрати ISO / CSO / PBP',
      start: 'Запустити',
      stop: 'Зупинити',
      status_idle: 'Оберіть файл гри, щоб почати.',
      status_selected: 'Файл вибрано. Натисніть «Запустити».',
      status_loading: 'Завантаження емулятора та підготовка файлу… Це може зайняти час.',
      status_running: 'Емулятор запущено. Керування — у вікні емулятора/налаштуваннях.',
      status_stopped: 'Сесію зупинено. Щоб запустити іншу гру, оновіть сторінку або виберіть файл і натисніть «Запустити».',
      help_title: 'Поради',
      help_1: 'PSP-емуляція в браузері вимоглива. Для кращої продуктивності використовуйте настільний браузер (Chrome/Edge), закрийте зайві вкладки та підключіть живлення.',
      help_2: 'Потрібна підтримка <code>SharedArrayBuffer</code> (COOP/COEP). На GitHub Pages сторінка використовує service worker — при першому відкритті може знадобитися автоматичне перезавантаження.',
      help_3: 'Якщо гра працює повільно або з графічними артефактами, це обмеження браузерного емулятора. Найстабільніший варіант — офіційний PPSSPP на ПК/пристрої з вашою копією.',
      help_4: 'Збереження створюються емулятором локально в браузері (сховище сайту). Очищення даних сайту може видалити збереження.',
      placeholder: 'Емулятор з’явиться тут після запуску.',
      footer: 'Емулятор: <a href="https://www.emulatorjs.org/" target="_blank" rel="noopener noreferrer">EmulatorJS</a> / PPSSPP core. Файли гри не надаються.',
      compat_no_sab: 'У цьому контексті <code>SharedArrayBuffer</code> недоступний. PPSSPP core потребує COOP/COEP. Спробуйте оновити сторінку (service worker має увімкнути ізоляцію) або відкрийте сайт через хостинг із правильними заголовками.',
      compat_reloading: 'Увімкнення COOP/COEP для емулятора… сторінка може перезавантажитися один раз.',
      file_none: 'Файл не вибрано.',
    },
    en: {
      subtitle: 'Browser launcher · BYO ISO',
      title: 'Run in your browser with your own copy',
      lead: 'This page does not include or download game files. Select your own legally obtained PSP image (<code>.iso</code>, <code>.cso</code>, <code>.pbp</code>) — it is processed locally in your browser via the PPSSPP (WebAssembly) emulator.',
      legal_title: 'Important',
      legal_body: 'Use only your own legally obtained copy of the game. This project is not affiliated with Bugbear/Empire Interactive/Sony and does not distribute copyrighted content.',
      pick: 'Choose ISO / CSO / PBP',
      start: 'Start',
      stop: 'Stop',
      status_idle: 'Choose a game file to begin.',
      status_selected: 'File selected. Click Start.',
      status_loading: 'Loading the emulator and preparing the file… this may take a while.',
      status_running: 'Emulator started. Use the emulator window/settings for controls.',
      status_stopped: 'Session stopped. Refresh the page or choose a file and click Start to run again.',
      help_title: 'Tips',
      help_1: 'PSP emulation in a browser is demanding. For better performance use a desktop browser (Chrome/Edge), close other tabs, and keep the device plugged in.',
      help_2: '<code>SharedArrayBuffer</code> (COOP/COEP) is required. On GitHub Pages this page uses a service worker — the first load may trigger one automatic reload.',
      help_3: 'If the game runs slowly or has graphics issues, that is a browser emulator limitation. The most stable option is official PPSSPP on a PC/device with your own copy.',
      help_4: 'Saves are created locally by the emulator in your browser storage. Clearing site data may remove saves.',
      placeholder: 'The emulator will appear here after you start.',
      footer: 'Emulator: <a href="https://www.emulatorjs.org/" target="_blank" rel="noopener noreferrer">EmulatorJS</a> / PPSSPP core. No game files are provided.',
      compat_no_sab: '<code>SharedArrayBuffer</code> is unavailable in this context. The PPSSPP core needs COOP/COEP. Try refreshing (the service worker should enable isolation) or use hosting with the correct headers.',
      compat_reloading: 'Enabling COOP/COEP for the emulator… the page may reload once.',
      file_none: 'No file selected.',
    },
  };

  let lang = localStorage.getItem('foh.lang') || 'uk';
  if (!i18n[lang]) lang = 'uk';
  let selectedFile = null;
  let started = false;
  let objectUrl = null;

  const $ = (s) => document.querySelector(s);
  const romInput = $('#rom');
  const startBtn = $('#start');
  const stopBtn = $('#stop');
  const statusEl = $('#status');
  const fileInfoEl = $('#file-info');
  const compatEl = $('#compat');
  const gameEl = $('#game');
  const placeholderEl = $('#placeholder');

  function t(key) { return (i18n[lang] && i18n[lang][key]) || i18n.uk[key] || key; }

  function applyI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && t(key) != null) el.innerHTML = t(key);
    });
    document.querySelectorAll('.lang').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });
    localStorage.setItem('foh.lang', lang);
    renderFileInfo();
    if (!selectedFile && !started) statusEl.innerHTML = t('status_idle');
  }

  function setStatus(keyOrHtml, raw) {
    statusEl.innerHTML = raw ? keyOrHtml : t(keyOrHtml);
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0, n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
  }

  function renderFileInfo() {
    if (!selectedFile) { fileInfoEl.textContent = t('file_none'); return; }
    fileInfoEl.textContent = `${selectedFile.name} · ${formatBytes(selectedFile.size)}`;
  }

  function checkCompat() {
    if (window.crossOriginIsolated) {
      compatEl.classList.add('hidden');
      return true;
    }
    if ('serviceWorker' in navigator && !sessionStorage.getItem('coiReloadedBySelf')) {
      compatEl.innerHTML = t('compat_reloading');
      compatEl.classList.remove('hidden');
    } else if (typeof SharedArrayBuffer === 'undefined') {
      compatEl.innerHTML = t('compat_no_sab');
      compatEl.classList.remove('hidden');
    } else {
      compatEl.classList.add('hidden');
    }
    return !!window.crossOriginIsolated;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(s);
    });
  }

  async function start() {
    if (!selectedFile || started) return;
    if (!window.crossOriginIsolated && typeof SharedArrayBuffer === 'undefined') {
      setStatus('compat_no_sab');
      checkCompat();
      return;
    }
    started = true;
    startBtn.disabled = true;
    romInput.disabled = true;
    stopBtn.disabled = false;
    placeholderEl.classList.add('hidden');
    gameEl.classList.remove('hidden');
    setStatus('status_loading');

    if (objectUrl) try { URL.revokeObjectURL(objectUrl); } catch {}
    objectUrl = URL.createObjectURL(selectedFile);

    // EmulatorJS configuration (global). No game files are hosted by this page.
    window.EJS_player = '#game';
    window.EJS_core = 'ppsspp';
    window.EJS_threads = true;
    window.EJS_gameUrl = objectUrl;
    window.EJS_gameName = 'FlatOut Head On';
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    window.EJS_disableDatabases = false;

    try {
      await loadScript(window.EJS_pathtodata + 'loader.js');
      setStatus('status_running');
    } catch (err) {
      console.error(err);
      setStatus('Failed to load EmulatorJS. Check your network connection and that the CDN is reachable. ' + (err && err.message ? err.message : ''), true);
      started = false;
      startBtn.disabled = false;
      romInput.disabled = false;
      stopBtn.disabled = true;
    }
  }

  function stop() {
    // EmulatorJS/PPSSPP does not expose a reliable full teardown here; reload is safest.
    setStatus('status_stopped');
    location.reload();
  }

  romInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    selectedFile = f || null;
    renderFileInfo();
    startBtn.disabled = !selectedFile || started;
    if (selectedFile && !started) setStatus('status_selected');
  });
  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', stop);
  document.querySelectorAll('.lang').forEach((btn) => btn.addEventListener('click', () => {
    lang = btn.getAttribute('data-lang') || 'uk';
    applyI18n();
  }));

  applyI18n();
  checkCompat();
  window.addEventListener('load', () => setTimeout(checkCompat, 1200));
})();
