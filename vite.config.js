import { defineConfig } from 'vite';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, relative, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

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
  // main portfolio page (English, default)
  'index': resolve(__dirname, 'index.html'),
  // Spanish version of the landing
  'es/index': resolve(__dirname, 'es/index.html'),
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

// ── Plugin: Content-Security-Policy ───────────────────────
// GitHub Pages can't send response headers, so the CSP goes in a <meta>.
// Inline <script> blocks (the theme bootstrap) are allowed by SHA-256 hash,
// computed per page at build time; JSON-LD isn't executed, so it needs none.
// Build only: the dev server injects inline styles/scripts for HMR.
function csp() {
  return {
    name: 'csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const hashes = new Set();
        for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
          if (/\bsrc=/.test(attrs) || /application\/ld\+json/.test(attrs) || !body.trim()) continue;
          hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
        }
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${[...hashes].join(' ')}`.trim(),
          "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
          "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
          "img-src 'self' data:",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'none'",
          'upgrade-insecure-requests',
        ].join('; ');
        const tags = [
          { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' },
          { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head-prepend' },
        ];
        return { html, tags };
      },
    },
  };
}

// ── Plugin: sitemap.xml ───────────────────────────────────
// Emits dist/sitemap.xml with the landing (EN at /, ES at /es/) and every blog page.
const SITE_URL = 'https://lcampassi.com';

function sitemap() {
  return {
    name: 'sitemap',
    apply: 'build',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = [
        { loc: `${SITE_URL}/`, priority: '1.0', alt: true },
        { loc: `${SITE_URL}/es/`, priority: '0.9', alt: true },
      ];
      for (const { key } of blogFiles) {
        const path = key === 'index' ? 'docs/' : `docs/${key}.html`;
        const date = key.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
        urls.push({ loc: `${SITE_URL}/${path}`, priority: key === 'index' ? '0.8' : '0.6', lastmod: date });
      }
      const alternates =
        `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/"/>\n` +
        `    <xhtml:link rel="alternate" hreflang="es" href="${SITE_URL}/es/"/>\n` +
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>\n`;
      const body = urls
        .map(
          (u) =>
            `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n` +
            `    <priority>${u.priority}</priority>\n${u.alt ? alternates : ''}  </url>`,
        )
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
          body +
          '\n</urlset>\n',
      });
    },
  };
}

// ── Vite Config ───────────────────────────────────────────
export default defineConfig({
  plugins: [htmlInclude(), sitemap(), csp()],

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
  },
});
