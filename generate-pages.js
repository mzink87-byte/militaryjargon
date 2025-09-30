// STATIC PAGE GENERATOR FOR JARGON SITES
// Run this with Node.js: node generate-pages.js

const fs = require('fs');
const path = require('path');

// Load your acronyms data
const acronyms = JSON.parse(fs.readFileSync('acronyms.json', 'utf8'));

// Create output directory for generated pages
const outputDir = 'terms';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// HTML template for individual term pages
function generateTermPage(term) {
  const relatedLinks = term.relatedTerms 
    ? term.relatedTerms.map(related => 
        `<a href="/terms/${related.toLowerCase()}.html" class="related-term">${related}</a>`
      ).join(' ')
    : '';

  const branches = term.branches 
    ? term.branches.join(', ')
    : 'Not specified';

  const categories = Array.isArray(term.category) 
    ? term.category.join(', ')
    : term.category || 'Uncategorized';

  const referenceLink = term.reference && term.reference.url
    ? `<a href="${term.reference.url}" target="_blank" rel="noopener">${term.reference.name}</a>`
    : term.reference?.name || term.reference || 'Not available';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${term.acronym} - ${term.meaning} | Military Jargon</title>
  <meta name="description" content="${term.acronym} (${term.meaning}) - ${term.description.substring(0, 150)}...">
  <link rel="canonical" href="https://militaryjargon.com/terms/${term.acronym.toLowerCase()}.html">
  <link rel="stylesheet" href="../style.css">
  
  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="${term.acronym} - ${term.meaning}">
  <meta property="og:description" content="${term.description.substring(0, 200)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://militaryjargon.com/terms/${term.acronym.toLowerCase()}.html">
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "${term.acronym}",
    "description": "${term.meaning}",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Military Jargon"
    }
  }
  </script>
</head>
<body>
  <header>
    <nav class="breadcrumb">
      <a href="/">← Back to Search</a> | <a href="/browse.html">Browse</a> | <a href="/submit.html">Submit Term</a>
    </nav>
  </header>

  <main class="term-page">
    <article>
      <h1 class="term-title">${term.acronym}</h1>
      <p class="term-meaning">${term.meaning}</p>
      
      <div class="term-description">
        <p>${term.description}</p>
      </div>

      <div class="term-meta">
        <div class="meta-item">
          <strong>📚 Reference:</strong> ${referenceLink}
        </div>
        
        <div class="meta-item">
          <strong>🏷️ Category:</strong> ${categories}
        </div>
        
        ${term.branches ? `
        <div class="meta-item">
          <strong>🌐 Used by:</strong> ${branches}
        </div>
        ` : ''}

        ${term.commonality ? `
        <div class="meta-item">
          <strong>📊 Commonality:</strong> ${term.commonality}
        </div>
        ` : ''}
      </div>

      ${relatedLinks ? `
      <div class="related-terms">
        <h3>📎 Related Terms:</h3>
        <div class="related-links">
          ${relatedLinks}
        </div>
      </div>
      ` : ''}

      <div class="term-actions">
        <button onclick="copyLink()" class="action-button">📋 Copy Link</button>
        <button onclick="shareTwitter()" class="action-button">🐦 Share</button>
        <a href="/submit.html?correction=${encodeURIComponent(term.acronym)}" class="action-button">✏️ Suggest Correction</a>
      </div>
    </article>
  </main>

  <footer>
    <p><strong>Military Jargon</strong> – Clear Terms. Clean Definitions.</p>
    <p><small>Part of the <a href="https://jargonhubs.com">JargonHubs</a> network</small></p>
    <nav class="footer-nav">
      <a href="/about.html">About</a> | 
      <a href="/privacy.html">Privacy</a> | 
      <a href="/terms.html">Terms</a> | 
      <a href="/submit.html">Submit</a>
    </nav>
  </footer>

  <script>
    function copyLink() {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }

    function shareTwitter() {
      const text = encodeURIComponent('${term.acronym} - ${term.meaning}');
      const url = encodeURIComponent(window.location.href);
      window.open(\`https://twitter.com/intent/tweet?text=\${text}&url=\${url}\`, '_blank');
    }
  </script>
</body>
</html>`;
}

// Generate pages for all terms
console.log('🚀 Starting page generation...');
console.log(`📊 Found ${acronyms.length} terms to process`);

let successCount = 0;
let errorCount = 0;

acronyms.forEach((term, index) => {
  try {
    const filename = `${term.acronym.toLowerCase()}.html`;
    const filepath = path.join(outputDir, filename);
    const html = generateTermPage(term);
    
    fs.writeFileSync(filepath, html);
    successCount++;
    
    if ((index + 1) % 100 === 0) {
      console.log(`✅ Generated ${index + 1}/${acronyms.length} pages...`);
    }
  } catch (error) {
    console.error(`❌ Error generating page for ${term.acronym}:`, error.message);
    errorCount++;
  }
});

console.log('\n🎉 Generation complete!');
console.log(`✅ Successfully generated: ${successCount} pages`);
console.log(`❌ Errors: ${errorCount} pages`);
console.log(`📁 Pages saved to: ./${outputDir}/`);

// Generate sitemap
console.log('\n🗺️ Generating sitemap...');
const sitemap = generateSitemap(acronyms);
fs.writeFileSync('sitemap.xml', sitemap);
console.log('✅ Sitemap generated: sitemap.xml');

function generateSitemap(terms) {
  const urls = terms.map(term => {
    const slug = term.acronym.toLowerCase();
    return `  <url>
    <loc>https://militaryjargon.com/terms/${slug}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://militaryjargon.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://militaryjargon.com/browse.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://militaryjargon.com/submit.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://militaryjargon.com/about.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
${urls}
</urlset>`;
}

console.log('\n✨ All done! Next steps:');
console.log('1. Review generated pages in ./terms/ directory');
console.log('2. Push to GitHub');
console.log('3. Submit sitemap.xml to Google Search Console');
