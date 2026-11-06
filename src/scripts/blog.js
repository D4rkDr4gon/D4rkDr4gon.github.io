/**
 * lcampassi.com — Blog Entry Point
 *
 * Shared by the blog listing page and individual posts.
 */

import { initBlogSearch } from './blog-search.js';
import { initTheme } from './theme.js';

function init() {
  initTheme();

  // Search is only on the listing page
  if (document.getElementById('searchInput')) {
    initBlogSearch();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
