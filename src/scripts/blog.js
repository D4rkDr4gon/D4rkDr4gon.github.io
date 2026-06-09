/**
 * lcampassi.com — Blog Entry Point
 *
 * Shared by blog listing page and individual posts.
 */

import { initBlogSearch } from './blog-search.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Search is only on the listing page
  if (document.getElementById('searchInput')) {
    initBlogSearch();
  }

  console.log('✓ blog — initialized');
}
