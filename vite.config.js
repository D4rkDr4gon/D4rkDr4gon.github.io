import { defineConfig } from 'vite';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, relative, extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Helpers ───────────────────────────────────────────────

/**
 * Recursively find all HTML files in a directory.
 */
function findHtmlFiles(dir, base = dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      entries.push(...findHtmlFiles(full, base));
    } else if (stat.isFile() && name.endsWith('.html')) {
      // Entry key = relative path without extension
      const relPath = relative(base, full);
      const key = relPath.replace(/\.html$/, '');
      entries.push({ key, path: full });
    }
  }
  return entries;
}

// ── Multi-page entries ────────────────────────────────────
// Portfolio root + all blog pages + posts
const htmlEntries = {
  // main portfolio page
  'index': resolve(__dirname, 'index.html'),
};

// Add blog listing + all blog posts
const docsDir = resolve(__dirname, 'docs');
const blogFiles = findHtmlFiles(docsDir);
for (const { key, path } of blogFiles) {
  htmlEntries[`docs/${key}`] = path;
}

console.log(`[vite] Multi-page entries: ${Object.keys(htmlEntries).length}`);
console.log(`[vite]   main: index.html`);
blogFiles.forEach(({ key }) => console.log(`[vite]   docs/${key}.html`));

// ── Plugin: HTML partial includes ─────────────────────────
function htmlInclude() {
  return {
    name: 'html-include',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!-- @include: (.+?) -->/g, (_match, filepath) => {
          const fullPath = resolve(__dirname, filepath.trim());
          try {
            return readFileSync(fullPath, 'utf-8');
          } catch (err) {
            console.warn(`[html-include] File not found: ${fullPath}`);
            return `<!-- Include not found: ${filepath} -->`;
          }
        });
      },
    },
  };
}

// ── Vite Config ───────────────────────────────────────────
export default defineConfig({
  plugins: [htmlInclude()],

  publicDir: 'public',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssMinify: 'esbuild',
    rollupOptions: {
      input: htmlEntries,
    },
  },

  server: {
    port: 8080,
    host: true,
  },
});
