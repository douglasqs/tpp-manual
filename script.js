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
  const companyList = document.querySelector('.company-list');
  const companySearch = document.querySelector('#company-search');
  const companies = (window.integratedCompanies || []).filter(company => company.integration.trim().toLocaleUpperCase('pt-BR') === 'SIM');
  const mobile = window.matchMedia('(max-width: 960px)');
  let menuOpen = false;
  let scheduled = false;

  function renderCompanies(query = '') {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    const matching = companies.filter(company => `${company.name} ${company.legalName}`.toLocaleLowerCase('pt-BR').includes(normalized));
    document.querySelector('.company-count').textContent = `(${matching.length})`;
    companyList.replaceChildren();

    if (!matching.length) {
      const empty = document.createElement('p');
      empty.className = 'company-empty';
      empty.textContent = 'Nenhuma empresa encontrada.';
      companyList.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    matching.forEach(company => {
      const item = document.createElement('details');
      item.className = 'company-item';
      const summary = document.createElement('summary');
      summary.textContent = company.name;
      const content = document.createElement('div');
      content.className = 'company-details';

      if (company.legalName) {
        const legalName = document.createElement('p');
        legalName.innerHTML = '<strong>Razão social:</strong> ';
        legalName.append(document.createTextNode(company.legalName));
        content.append(legalName);
      }
      const status = document.createElement('p');
      status.innerHTML = '<strong>Integração:</strong> ';
      status.append(document.createTextNode(company.integration || 'Não informado'));
      status.append(document.createTextNode(' · '));
      status.append(document.createTextNode(`Portal TPP: ${company.portal || 'Não informado'}`));
      content.append(status);

      const productsTitle = document.createElement('p');
      productsTitle.className = 'company-products-title';
      productsTitle.textContent = company.products.length ? 'Produtos homologados' : 'Nenhum produto listado, confirmar diretamente com a empresa ou suporte técnico.';
      content.append(productsTitle);
      if (company.products.length) {
        const products = document.createElement('ul');
        company.products.forEach(product => {
          const row = document.createElement('li');
          const name = typeof product === 'string' ? product : product.name;
          if (typeof product?.url === 'string' && /^https:\/\//i.test(product.url)) {
            const link = document.createElement('a');
            link.href = product.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = name;
            row.append(link);
          } else {
            row.textContent = name;
          }
          products.append(row);
        });
        content.append(products);
      }
      item.append(summary, content);
      fragment.append(item);
    });
    companyList.append(fragment);
  }

  renderCompanies();
  companySearch.addEventListener('input', () => renderCompanies(companySearch.value));

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
      const focusable = [...sidebar.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), summary')]
        .filter(element => element.offsetParent !== null);
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
