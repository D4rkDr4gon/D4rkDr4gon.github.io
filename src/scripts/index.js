/**
 * lcampassi.com — Landing entry point (ES + EN)
 */

import { initNavigation, initReveal } from './_navigation.js';
import { initTheme } from './theme.js';

function init() {
  initTheme();
  initNavigation();
  initReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
