/**
 * Navigation — scrolled state, mobile menu and active section highlight.
 */

export function initNavigation() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // ── Scrolled state ─────────────────────────────
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Mobile menu ────────────────────────────────
  const toggle = nav.querySelector('.nav-toggle');
  const menu = nav.querySelector('.nav-menu');
  if (toggle && menu) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      const icon = toggle.querySelector('i');
      if (icon) icon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // ── Active section highlight ───────────────────
  const links = [];
  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    const section = document.getElementById(link.dataset.section);
    if (section) links.push({ link, section });
  });
  if (!links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const { link, section } of links) {
          link.classList.toggle('active', section === entry.target);
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach(({ section }) => observer.observe(section));
}

/**
 * Fade-in elements with `.reveal` as they enter the viewport.
 */
export function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => observer.observe(el));
}
