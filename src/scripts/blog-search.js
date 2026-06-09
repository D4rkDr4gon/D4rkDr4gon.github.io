/**
 * Blog — Search / Filter functionality
 *
 * Filters post cards by title, excerpt, tag, and date.
 */

export function initBlogSearch() {
  const input = document.getElementById('searchInput');
  const cards = document.querySelectorAll('.post-card');
  const noResults = document.getElementById('noResults');

  if (!input || !cards.length || !noResults) {
    console.warn('[blog-search] missing elements');
    return;
  }

  function filter() {
    const q = input.value.toLowerCase().trim();
    let visible = 0;

    for (const card of cards) {
      const title = card.querySelector('h2');
      const excerpt = card.querySelector('.post-excerpt');
      const tag = card.querySelector('.tag');
      const dateSpan = card.querySelector('.post-meta span:first-child');

      if (!title || !excerpt) continue;

      const text = [title, excerpt, tag, dateSpan]
        .map((el) => el?.textContent || '')
        .join(' ')
        .toLowerCase();

      const match = !q || text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    }

    noResults.style.display = q && visible === 0 ? 'block' : 'none';
  }

  input.addEventListener('input', filter);
  input.addEventListener('search', filter);
}
