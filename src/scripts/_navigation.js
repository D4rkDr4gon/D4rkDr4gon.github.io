/**
 * Navigation — Active section highlight via IntersectionObserver
 *
 * Watches all `<section id="...">` elements and applies
 * `.active` to the corresponding nav link.
 */

export function initNavigation() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  // Map nav links by their data-section attribute
  const linkMap = [];
  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    const id = link.dataset.section;
    const section = document.getElementById(id);
    if (section) {
      linkMap.push({ id, link, section });
    }
  });

  if (!linkMap.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      // Find the section with the highest intersection ratio
      let maxRatio = 0;
      let activeId = linkMap[0]?.id || null;

      for (const entry of entries) {
        if (entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeId = entry.target.id;
        }
      }

      // Toggle `.active` class on nav links
      for (const { id, link } of linkMap) {
        link.classList.toggle('active', id === activeId);
        // Contact button also gets a special class
        if (link.classList.contains('nav-link--contact')) {
          link.classList.toggle('active', id === activeId);
        }
      }
    },
    {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: `-52px 0px 0px 0px`, // account for fixed nav height
    },
  );

  for (const { section } of linkMap) {
    observer.observe(section);
  }
}
