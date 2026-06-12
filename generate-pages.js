// STATIC PAGE GENERATOR FOR JARGON SITES
// Run with Node.js:  node generate-pages.js
//
// Produces one fast, mobile-first static HTML page per acronym in ./terms/,
// plus a sitemap (auto-split if you ever exceed 45,000 terms).
// Each page is fully static: it does NOT load the big acronyms.json, so it
// renders instantly on a phone with no lag.

const fs = require('fs');
const path = require('path');

// ----------------------------------------------------------------------------
// CONFIG  (edit these)
// ----------------------------------------------------------------------------
const CONFIG = {
  domain: 'militaryjargon.com',     // no protocol, no trailing slash
  outputDir: 'terms',
  inputFile: 'acronyms.json',

  // COUNTER / ANALYTICS — fill in ONE of these, or leave both blank to skip.
  // GoatCounter: free, privacy-friendly. Put just your site code (e.g. 'militaryjargon').
  goatCounterCode: 'militaryjargon',
  // Cloudflare Web Analytics: free. Put the token from your CF dashboard.
  cloudflareToken: '',
};

const SITE = `https://${CONFIG.domain}`;
const MAX_URLS_PER_SITEMAP = 45000; // safe margin under the 50,000 hard limit

// Map searchPriority -> sitemap priority (homepage stays at 1.0).
const PRIORITY_MAP = { high: '0.9', medium: '0.7', low: '0.5' };

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function escapeHtml(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function truncate(s, n) {
  s = (s == null ? '' : String(s)).trim();
  return s.length > n ? s.slice(0, n).trim() + '...' : s;
}

function slugify(s) {
  const out = (s == null ? '' : String(s))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return out || 'term';
}

function analyticsSnippet() {
  if (CONFIG.goatCounterCode) {
    return `  <script data-goatcounter="https://${CONFIG.goatCounterCode}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>\n`;
  }
  if (CONFIG.cloudflareToken) {
    return `  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${CONFIG.cloudflareToken}"}'></script>\n`;
  }
  return '';
}

// Critical CSS inlined into every page so it paints before any network CSS.
const CRITICAL_CSS = `
    :root{--maxw:720px;--accent:#1a4f8b;--bg:#fff;--fg:#1a1a1a;--muted:#555;--card:#f5f7fa;--border:#e2e8f0}
    *{box-sizing:border-box}
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:var(--fg);background:var(--bg);font-size:17px;-webkit-text-size-adjust:100%}
    header,main,footer{max-width:var(--maxw);margin:0 auto;padding:0 16px}
    .breadcrumb{font-size:.9rem;padding:14px 16px;color:var(--muted)}
    .breadcrumb a{color:var(--accent);text-decoration:none}
    .term-title{font-size:2.2rem;margin:.2em 0 0;line-height:1.1;word-break:break-word}
    .term-meaning{font-size:1.25rem;color:var(--accent);font-weight:600;margin:.2em 0 1em}
    .term-aliases{color:var(--muted);font-size:.95rem;margin:-.6em 0 1em}
    .term-description{font-size:1.05rem}
    .term-meta{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;margin:24px 0}
    .meta-item{margin:.4em 0}
    .related-terms h3{margin-bottom:.4em}
    .related-links{display:flex;flex-wrap:wrap;gap:8px}
    .related-term{display:inline-block;background:var(--card);border:1px solid var(--border);border-radius:999px;padding:6px 14px;text-decoration:none;color:var(--accent);font-size:.95rem}
    .term-actions{display:flex;flex-wrap:wrap;gap:10px;margin:28px 0}
    .action-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--fg);font-size:1rem;text-decoration:none;cursor:pointer}
    .action-button:active{background:var(--border)}
    footer{margin-top:40px;padding-top:20px;border-top:1px solid var(--border);color:var(--muted);font-size:.9rem;text-align:center}
    .footer-nav a{color:var(--accent);text-decoration:none}
    @media(max-width:480px){.term-title{font-size:1.8rem}.action-button{flex:1 1 auto}}
`;

// ----------------------------------------------------------------------------
// Page template
// ----------------------------------------------------------------------------
function generateTermPage(term, slug, relatedSlug) {
  const acronym = escapeHtml(term.acronym);
  const meaning = escapeHtml(term.meaning || '');
  const description = escapeHtml(term.description || '');
  const url = `${SITE}/${CONFIG.outputDir}/${slug}.html`;

  const metaDesc = escapeAttr(
    truncate(`${term.acronym} (${term.meaning || ''}). ${term.description || ''}`, 155)
  );

  const branches = Array.isArray(term.branches) ? term.branches.join(', ') : null;
  const categories = Array.isArray(term.category)
    ? term.category.join(', ')
    : term.category || 'Uncategorized';

  const aliases = Array.isArray(term.aliases) && term.aliases.length
    ? term.aliases
    : null;

  let referenceLink;
  if (term.reference && term.reference.url) {
    referenceLink = `<a href="${escapeAttr(term.reference.url)}" target="_blank" rel="noopener">${escapeHtml(term.reference.name || term.reference.url)}</a>`;
  } else {
    referenceLink = escapeHtml(
      (term.reference && term.reference.name) || term.reference || 'Not available'
    );
  }

  const relatedLinks = Array.isArray(term.relatedTerms)
    ? term.relatedTerms
        .map((r) => `<a href="/${CONFIG.outputDir}/${relatedSlug(r)}.html" class="related-term">${escapeHtml(r)}</a>`)
        .join('\n          ')
    : '';

  // JSON-LD built as an object then stringified so quotes escape safely.
  // The </ replacement prevents a "</script>" inside data from breaking out.
  const ldObj = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.acronym || '',
    description: term.meaning || term.description || '',
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Military Jargon' },
  };
  if (aliases) ldObj.alternateName = aliases;
  const ld = JSON.stringify(ldObj).replace(/</g, '\\u003c');

  const shareText = escapeAttr(`${term.acronym} - ${term.meaning || ''}`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1a4f8b">
  <title>${acronym} - ${meaning} | Military Jargon</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="${url}">
  <style>${CRITICAL_CSS}</style>
  <link rel="stylesheet" href="/style.css">

  <meta property="og:title" content="${escapeAttr(term.acronym + ' - ' + (term.meaning || ''))}">
  <meta property="og:description" content="${escapeAttr(truncate(term.description, 200))}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">

  <script type="application/ld+json">${ld}</script>
${analyticsSnippet()}</head>
<body>
  <header>
    <nav class="breadcrumb">
      <a href="/">&larr; Back to Search</a> | <a href="/browse.html">Browse</a> | <a href="/submit.html">Submit Term</a>
    </nav>
  </header>

  <main class="term-page">
    <article>
      <h1 class="term-title">${acronym}</h1>
      <p class="term-meaning">${meaning}</p>
      ${aliases ? `<p class="term-aliases">Also known as: ${escapeHtml(aliases.join(', '))}</p>` : ''}

      <div class="term-description">
        <p>${description}</p>
      </div>

      <div class="term-meta">
        <div class="meta-item"><strong>Reference:</strong> ${referenceLink}</div>
        <div class="meta-item"><strong>Category:</strong> ${escapeHtml(categories)}</div>
        ${branches ? `<div class="meta-item"><strong>Used by:</strong> ${escapeHtml(branches)}</div>` : ''}
        ${term.commonality ? `<div class="meta-item"><strong>Commonality:</strong> ${escapeHtml(term.commonality)}</div>` : ''}
      </div>

      ${relatedLinks ? `<div class="related-terms">
        <h3>Related Terms</h3>
        <div class="related-links">
          ${relatedLinks}
        </div>
      </div>` : ''}

      <div class="term-actions">
        <button onclick="copyLink()" class="action-button">Copy Link</button>
        <button class="action-button" data-share-text="${shareText}" onclick="shareX(this)">Share</button>
        <a href="/submit.html?correction=${encodeURIComponent(term.acronym || '')}" class="action-button">Suggest Correction</a>
      </div>
    </article>
  </main>

  <footer>
    <p><strong>Military Jargon.</strong> Clear Terms. Clean Definitions.</p>
    <p><small>Part of the <a href="https://jargonhubs.com">JargonHubs</a> network</small></p>
    <nav class="footer-nav">
      <a href="/about.html">About</a> | <a href="/privacy.html">Privacy</a> | <a href="/submit.html">Submit</a>
    </nav>
  </footer>

  <script>
    function copyLink(){
      navigator.clipboard.writeText(location.href).then(function(){ alert('Link copied to clipboard!'); });
    }
    function shareX(btn){
      var text = encodeURIComponent(btn.getAttribute('data-share-text') || document.title);
      var url = encodeURIComponent(location.href);
      window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank', 'noopener');
    }
  </script>
</body>
</html>`;
}

// ----------------------------------------------------------------------------
// Sitemap(s)
// ----------------------------------------------------------------------------
function staticUrls() {
  return [
    { loc: `${SITE}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE}/browse.html`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE}/submit.html`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${SITE}/about.html`, changefreq: 'monthly', priority: '0.6' },
  ];
}

function urlBlock(u) {
  return `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`;
}

function wrapUrlset(blocks) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.join('\n')}\n</urlset>\n`;
}

function writeSitemaps(termMeta) {
  const all = staticUrls().concat(
    termMeta.map((t) => ({
      loc: `${SITE}/${CONFIG.outputDir}/${t.slug}.html`,
      changefreq: 'monthly',
      priority: t.priority,
    }))
  );

  if (all.length <= MAX_URLS_PER_SITEMAP) {
    fs.writeFileSync('sitemap.xml', wrapUrlset(all.map(urlBlock)));
    console.log('Sitemap generated: sitemap.xml (' + all.length + ' urls)');
    return;
  }

  const files = [];
  for (let i = 0; i < all.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = all.slice(i, i + MAX_URLS_PER_SITEMAP);
    const name = `sitemap-${files.length + 1}.xml`;
    fs.writeFileSync(name, wrapUrlset(chunk.map(urlBlock)));
    files.push(name);
  }
  const index =
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    files.map((f) => `  <sitemap>\n    <loc>${SITE}/${f}</loc>\n  </sitemap>`).join('\n') +
    `\n</sitemapindex>\n`;
  fs.writeFileSync('sitemap.xml', index);
  console.log('Sitemap index generated: sitemap.xml -> ' + files.length + ' files (' + all.length + ' urls)');
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
console.log('Starting page generation...');

const acronyms = JSON.parse(fs.readFileSync(CONFIG.inputFile, 'utf8'));
if (!Array.isArray(acronyms)) {
  throw new Error(CONFIG.inputFile + ' did not parse to an array.');
}
console.log('Found ' + acronyms.length + ' terms to process');

if (!fs.existsSync(CONFIG.outputDir)) fs.mkdirSync(CONFIG.outputDir, { recursive: true });

// Pass 1: assign a unique slug to every term, remember the first slug per
// acronym (for related links), and capture sitemap priority.
const usedSlugs = new Map();
const termMeta = [];            // [{ slug, priority }]
const acronymToSlug = new Map();

acronyms.forEach((term) => {
  const base = slugify(term && term.acronym);
  let slug = base;
  if (usedSlugs.has(slug)) {
    const c = usedSlugs.get(slug) + 1;
    usedSlugs.set(slug, c);
    slug = base + '-' + c;
  } else {
    usedSlugs.set(slug, 1);
  }
  const priority = PRIORITY_MAP[(term && term.searchPriority) || ''] || '0.6';
  termMeta.push({ slug, priority });
  if (!acronymToSlug.has(base)) acronymToSlug.set(base, slug);
});

function relatedSlug(acronymText) {
  const key = slugify(acronymText);
  return acronymToSlug.get(key) || key;
}

// Pass 2: write the pages.
let ok = 0;
let errors = 0;

acronyms.forEach((term, i) => {
  try {
    if (!term || !term.acronym) throw new Error('missing acronym');
    const slug = termMeta[i].slug;
    const html = generateTermPage(term, slug, relatedSlug);
    fs.writeFileSync(path.join(CONFIG.outputDir, slug + '.html'), html);
    ok++;
    if ((i + 1) % 500 === 0) console.log('Generated ' + (i + 1) + '/' + acronyms.length + '...');
  } catch (e) {
    errors++;
    console.error('Error on index ' + i + ' (' + (term && term.acronym) + '): ' + e.message);
  }
});

console.log('\nGeneration complete.');
console.log('Success: ' + ok + ' pages');
console.log('Errors:  ' + errors + ' pages');

writeSitemaps(termMeta);

console.log('\nNext steps:');
console.log('1. Spot check a few files in ./' + CONFIG.outputDir + '/');
console.log('2. Commit and push to GitHub');
console.log('3. Submit sitemap.xml in Google Search Console');
