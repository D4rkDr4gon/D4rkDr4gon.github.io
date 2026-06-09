/**
 * lcampassi.com — Main Entry Point
 *
 * Imports and initializes all JavaScript modules.
 * Vite bundles and treeshakes automatically.
 */

import { initNavigation } from './_navigation.js';

// ── Init on DOM ready ──────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  initNavigation();
  console.log('✓ lcampassi.com — initialized');
}
