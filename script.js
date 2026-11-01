(() => {
  const menuButton = document.querySelector('.mobile-menu-toggle');
  const navigation = document.querySelector('#primary-navigation');
  const navLinks = [...document.querySelectorAll('.primary-navigation a')];
  const progressBar = document.querySelector('#scroll-progress-bar');
  const checklist = document.querySelector('#prep-checklist');
  const checklistCount = document.querySelector('#checklist-count');
  const checklistFill = document.querySelector('#checklist-progress-fill');

  // Mobile navigation: close on selection, Escape, or outside click.
  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
      navigation.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    navLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (menuButton.getAttribute('aria-expanded') === 'true' &&
          !navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  // Reading progress indicator.
  let ticking = false;
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }, { passive: true });
  updateScrollProgress();

  // Highlight the navigation item for the section currently in view.
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
          link.classList.toggle('active', active);
        });
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Interactive first-night checklist.
  if (checklist && checklistCount && checklistFill) {
    const checkboxes = [...checklist.querySelectorAll('input[type="checkbox"]')];
    const updateChecklist = () => {
      const checked = checkboxes.filter(input => input.checked).length;
      checklistCount.textContent = `${checked} из ${checkboxes.length} готово`;
      checklistFill.style.width = `${checkboxes.length ? (checked / checkboxes.length) * 100 : 0}%`;
      checklist.setAttribute('aria-label', `Подготовка к наблюдению: выполнено ${checked} из ${checkboxes.length} пунктов`);
    };
    checkboxes.forEach(input => input.addEventListener('change', updateChecklist));
    updateChecklist();
  }
})();
