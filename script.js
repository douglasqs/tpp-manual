(() => {
  'use strict';

  const root = document.documentElement;
  const sidebar = document.querySelector('.sidebar');
  const nav = sidebar.querySelector('nav');
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const toggle = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  const backdrop = document.querySelector('.menu-backdrop');
  const main = document.querySelector('main');
  const header = document.querySelector('.topbar');
  const progress = document.querySelector('.progress-value');
  const mobile = window.matchMedia('(max-width: 960px)');
  let menuOpen = false;
  let scheduled = false;

  function setMenu(open, restoreFocus = true) {
    menuOpen = open && mobile.matches;
    document.body.classList.toggle('menu-open', menuOpen);
    toggle.setAttribute('aria-expanded', String(menuOpen));
    backdrop.hidden = !menuOpen;
    main.inert = menuOpen;
    header.inert = menuOpen;
    sidebar.inert = mobile.matches && !menuOpen;

    if (menuOpen) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
      sidebar.setAttribute('aria-labelledby', 'index-title');
      close.focus({ preventScroll: true });
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      sidebar.removeAttribute('aria-labelledby');
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }
  }

  function updateReading() {
    scheduled = false;
    const threshold = header.getBoundingClientRect().height + 48;
    const scrollable = root.scrollHeight - window.innerHeight;
    const fraction = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    let current = 0;

    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= threshold) current = index;
    });
    if (scrollable > 0 && window.scrollY >= scrollable - 2) current = sections.length - 1;

    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    nav.style.setProperty('--active-top', `${links[current].offsetTop}px`);
    nav.style.setProperty('--active-height', `${links[current].offsetHeight}px`);
    root.style.setProperty('--reading-progress', String(fraction));
    progress.textContent = `${Math.round(fraction * 100)}%`;
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateReading);
  }

  toggle.addEventListener('click', () => setMenu(!menuOpen));
  close.addEventListener('click', () => setMenu(false));
  backdrop.addEventListener('click', () => setMenu(false));
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (!menuOpen) return;
      setMenu(false, false);
      const heading = document.querySelector(link.hash).querySelector('h1, h2');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
    });
  });

  document.addEventListener('keydown', event => {
    if (!menuOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
    }
    if (event.key === 'Tab') {
      const first = close;
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  mobile.addEventListener('change', () => {
    const focusWasInside = sidebar.contains(document.activeElement);
    const focusWasClose = document.activeElement === close;
    setMenu(false, false);
    if (mobile.matches && focusWasInside) toggle.focus({ preventScroll: true });
    else if (!mobile.matches && focusWasClose) links[0].focus({ preventScroll: true });
    scheduleUpdate();
  });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(main);

  root.classList.add('enhanced');
  document.querySelector('.sidebar-progress').hidden = false;
  setMenu(false, false);
  updateReading();
})();

// Carrega o contador apenas no site publicado, sem contar prévias locais.
(() => {
  const { protocol, hostname, pathname } = window.location;
  const publishedPaths = ['/tpp-manual', '/tpp-manual/', '/tpp-manual/index.html'];
  if (protocol !== 'https:' || hostname !== 'douglasqs.github.io' || !publishedPaths.includes(pathname)) return;

  const counter = document.querySelector('.visit-counter');
  if (!counter) return;
  const image = counter.querySelector('img');
  image.addEventListener('load', () => { counter.hidden = false; }, { once: true });
  image.addEventListener('error', () => { counter.hidden = true; }, { once: true });
  image.src = image.dataset.src;
})();
