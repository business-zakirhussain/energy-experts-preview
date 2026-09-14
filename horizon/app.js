(() => {
  'use strict';

  const root = document.documentElement;
  const languageSelect = document.querySelector('#language');
  const projectGrid = document.querySelector('#project-grid');
  const projectCount = document.querySelector('#project-count');
  const menuToggle = document.querySelector('#menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const dialog = document.querySelector('#detail-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  const form = document.querySelector('#contact-form');
  const feedback = document.querySelector('#form-feedback');
  const pageSections = [...document.querySelectorAll('main > section[id]')];
  const menuBackground = [...document.querySelectorAll('main, .site-footer, .concept-bar')];
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  let language = Object.hasOwn(HORIZON_COPY, requestedLanguage) ? requestedLanguage : 'en';
  let activeFilter = 'all';
  let activeDialog = null;
  let dialogTrigger = null;
  let formState = null;

  function copy(key) {
    return HORIZON_COPY[language][key] ?? HORIZON_COPY.en[key] ?? key;
  }

  function putText(element, text) {
    const lines = String(text).split('\n');
    element.replaceChildren();
    lines.forEach((line, index) => {
      if (index > 0) element.append(document.createTextNode(' '), document.createElement('br'));
      element.append(document.createTextNode(line));
    });
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) putText(element, text);
    return element;
  }

  function renderProjects() {
    const projects = HORIZON_PROJECTS.filter(project => activeFilter === 'all' || project.category === activeFilter);
    projectGrid.replaceChildren();
    projects.forEach(project => {
      const translated = project[language];
      const card = makeElement('button', 'project-card');
      card.type = 'button';
      card.dataset.project = project.id;
      card.setAttribute('aria-label', copy('projectOpen') + translated.title);
      const imageBox = makeElement('span', 'project-image');
      const image = makeElement('img');
      image.src = project.image;
      image.alt = translated.alt;
      image.loading = 'lazy';
      image.width = 800;
      image.height = 600;
      const arrow = makeElement('span', 'project-arrow', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      imageBox.append(image, makeElement('span', 'project-tag', translated.category), arrow);
      const meta = makeElement('span', 'project-meta');
      meta.append(makeElement('span', '', translated.location), makeElement('span', '', copy('sampleLabel')));
      card.append(imageBox, meta, makeElement('h3', '', translated.title));
      card.addEventListener('click', () => openDialog({ type: 'project', id: project.id }, card));
      projectGrid.append(card);
    });
    projectCount.textContent = copy('projectCount').replace('{count}', String(projects.length).padStart(2, '0'));
  }

  function renderDialog() {
    dialogContent.replaceChildren();
    if (activeDialog.type === 'project') {
      const project = HORIZON_PROJECTS.find(item => item.id === activeDialog.id);
      const translated = project[language];
      const image = makeElement('img', 'dialog-image');
      image.src = project.image;
      image.alt = translated.alt;
      const body = makeElement('div', 'dialog-body');
      body.append(makeElement('span', 'section-label', translated.category + ' / ' + translated.location));
      const title = makeElement('h2', '', translated.title);
      title.id = 'dialog-title';
      body.append(title, makeElement('p', '', translated.description), makeElement('h3', '', copy('projectScope')));
      const scope = makeElement('ul');
      translated.scope.forEach(item => scope.append(makeElement('li', '', item)));
      body.append(scope, makeElement('p', 'sample-badge', copy('projectDisclaimer')));
      const contactLink = makeElement('a', 'button button-dark');
      contactLink.href = '#contact';
      const arrow = makeElement('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      contactLink.append(makeElement('span', '', copy('projectCta')), arrow);
      contactLink.addEventListener('click', () => {
        document.querySelector('#contact-service').value = project.category;
        closeDialog();
        document.querySelector('#contact-title').setAttribute('tabindex', '-1');
        document.querySelector('#contact-title').focus({ preventScroll: true });
      });
      body.append(contactLink);
      dialogContent.append(image, body);
    } else {
      const type = activeDialog.type;
      const body = makeElement('div', 'dialog-body dialog-legal');
      const title = makeElement('h2', '', copy(type + 'Title'));
      title.id = 'dialog-title';
      body.append(title);
      ['Text', 'Text2', 'Text3'].forEach(suffix => body.append(makeElement('p', '', copy(type + suffix))));
      dialogContent.append(body);
    }
  }

  function openDialog(details, trigger) {
    closeMenu();
    activeDialog = details;
    dialogTrigger = trigger;
    renderDialog();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.scrollTop = 0;
    document.querySelector('#dialog-close').focus({ preventScroll: true });
  }

  function closeDialog() {
    dialog.close();
  }

  function closeMenu(returnFocus = false) {
    if (mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', copy('menuOpen'));
    document.body.classList.remove('menu-open');
    menuBackground.forEach(element => { element.inert = false; });
    if (returnFocus) menuToggle.focus();
  }

  function setLanguage(nextLanguage, updateUrl = true) {
    language = Object.hasOwn(HORIZON_COPY, nextLanguage) ? nextLanguage : 'en';
    root.lang = language;
    languageSelect.value = language;
    document.querySelectorAll('[data-copy]').forEach(element => putText(element, copy(element.dataset.copy)));
    document.querySelectorAll('[data-alt]').forEach(element => { element.alt = copy(element.dataset.alt); });
    document.querySelectorAll('[data-aria]').forEach(element => element.setAttribute('aria-label', copy(element.dataset.aria)));
    document.querySelectorAll('[data-placeholder]').forEach(element => { element.placeholder = copy(element.dataset.placeholder); });
    menuToggle.setAttribute('aria-label', copy(mobileMenu.hidden ? 'menuOpen' : 'menuClose'));
    renderProjects();
    if (dialog.open) renderDialog();
    if (formState) feedback.textContent = copy(formState);
    if (updateUrl) {
      const address = new URL(window.location.href);
      address.searchParams.set('lang', language);
      try { window.history.replaceState(null, '', address); } catch {}
    }
  }

  languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
  window.addEventListener('popstate', () => setLanguage(new URLSearchParams(window.location.search).get('lang'), false));

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      renderProjects();
    });
  });

  menuToggle.addEventListener('click', () => {
    if (!mobileMenu.hidden) {
      closeMenu(true);
      return;
    }
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', copy('menuClose'));
    document.body.classList.add('menu-open');
    menuBackground.forEach(element => { element.inert = true; });
    mobileMenu.querySelector('a').focus();
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }));
  document.querySelector('.site-header .brand').addEventListener('click', () => closeMenu());
  document.addEventListener('keydown', event => {
    if (mobileMenu.hidden) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab') {
      const focusable = [...document.querySelectorAll('.site-header a, .site-header button, .site-header select, .mobile-menu a')].filter(element => element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => openDialog({ type: button.dataset.info }, button)));
  document.querySelector('#dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    activeDialog = null;
    if (dialogTrigger?.isConnected && document.activeElement === document.body) dialogTrigger.focus({ preventScroll: true });
  });

  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    document.querySelector('#contact-service').value = link.dataset.service;
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    const valid = String(values.get('name')).trim().length > 0 && String(values.get('message')).trim().length >= 10;
    formState = valid ? 'formSuccess' : 'formInvalid';
    feedback.textContent = copy(formState);
    feedback.hidden = false;
    if (!valid) form.querySelector('textarea').focus();
  });
  form.addEventListener('input', () => {
    feedback.hidden = true;
    formState = null;
  });

  const header = document.querySelector('.site-header');
  function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window) {
    const navigationObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.desktop-nav a').forEach(link => {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
    pageSections.forEach(section => navigationObserver.observe(section));

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06 });
      document.querySelectorAll('.intro-main, .section-heading, .service-card, .steps li, .about-content, .contact-copy, .contact-form').forEach(element => {
        element.classList.add('reveal');
        revealObserver.observe(element);
      });
      root.classList.add('motion-ready');
    }
  }

  setLanguage(language, false);
})();

/* ============================================================
   ADDED: theme toggle + storage consent + language persistence.
   Kept as a separate module so the original Horizon code is
   untouched. Nothing is written to the browser until the visitor
   chooses "Remember my choices"; until then the theme follows the
   operating system and resets when the tab closes.
   ============================================================ */
(() => {
  'use strict';
  const root = document.documentElement;
  const KEY_T = 'horizon-theme', KEY_L = 'horizon-lang', KEY_C = 'horizon-storage';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* private mode */ } }
  };
  const copy = key => (HORIZON_COPY[root.lang] || HORIZON_COPY.en)[key] || '';

  let consent = store.get(KEY_C);                     // 'yes' | 'no' | null
  const toggles = [...document.querySelectorAll('#theme-toggle, #theme-toggle-menu')];
  const banner = document.querySelector('#consent');
  const languageSelect = document.querySelector('#language');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------- theme ---------- */
  let theme = consent === 'yes' ? store.get(KEY_T) : null;
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);

  function currentTheme() {
    return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
  }
  function setTheme(next) {
    root.setAttribute('data-theme', next);
    if (consent === 'yes') store.set(KEY_T, next);
    syncLabels();
  }
  toggles.forEach(button => button.addEventListener('click', () => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }));
  systemDark.addEventListener('change', () => { if (!root.hasAttribute('data-theme')) syncLabels(); });

  /* ---------- language persistence ---------- */
  const askedFor = new URLSearchParams(window.location.search).get('lang');
  if (!askedFor && consent === 'yes') {
    const saved = store.get(KEY_L);
    if (saved && saved !== languageSelect.value && Object.hasOwn(HORIZON_COPY, saved)) {
      languageSelect.value = saved;
      languageSelect.dispatchEvent(new Event('change'));
    }
  }
  languageSelect.addEventListener('change', () => {
    if (consent === 'yes') store.set(KEY_L, languageSelect.value);
    syncLabels();
  });

  /* ---------- consent ---------- */
  function syncLabels() {
    const state = consent === 'yes' ? copy('consentSavedOn') : copy('consentSavedOff');
    document.querySelectorAll('#storage-state-menu').forEach(el => { el.textContent = state; });
    toggles.forEach(button => {
      const label = copy('themeToggle');
      if (label) button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
    });
  }
  function decide(answer) {
    consent = answer;
    store.set(KEY_C, answer);
    if (answer === 'yes') {
      store.set(KEY_T, currentTheme());
      store.set(KEY_L, languageSelect.value);
    } else {
      store.del(KEY_T); store.del(KEY_L);
    }
    banner.classList.remove('is-open');
    setTimeout(() => { banner.hidden = true; }, 500);
    syncLabels();
  }
  document.querySelector('#consent-accept').addEventListener('click', () => decide('yes'));
  document.querySelector('#consent-reject').addEventListener('click', () => decide('no'));

  if (!consent) {
    banner.hidden = false;
    requestAnimationFrame(() => setTimeout(() => banner.classList.add('is-open'), 700));
  }
  syncLabels();
  /* the main module re-renders [data-copy] on language change; refresh ours after it */
  languageSelect.addEventListener('change', () => setTimeout(syncLabels, 0));
})();
