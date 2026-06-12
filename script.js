console.log("🚀 script.js loaded");
// ✅ Global acronyms
let acronyms = [];

// ---- slug logic: MUST match generate-pages.js exactly so card links hit the right page ----
function slugify(s) {
  const out = (s == null ? '' : String(s))
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return out || 'term';
}
function assignSlugs(list) {
  const used = new Map();
  list.forEach((term) => {
    const base = slugify(term && term.acronym);
    let slug = base;
    if (used.has(slug)) { const c = used.get(slug) + 1; used.set(slug, c); slug = base + '-' + c; }
    else { used.set(slug, 1); }
    term._slug = slug;
  });
}

// ✅ Load JSON file (only if results div exists)
if (document.getElementById("results")) {
  fetch("acronyms.json")
    .then(res => res.json())
    .then(data => { acronyms = data; assignSlugs(acronyms); })
    .catch(err => {
      console.error("Error loading JSON:", err);
      document.getElementById("results").innerHTML =
        `<p style="color:red;">⚠️ Failed to load acronyms database.</p>`;
    });
}
// ========== NORMALIZATION FUNCTION ==========
function normalizeSearchText(text) {
  return (text == null ? '' : String(text))
    .toLowerCase()
    .replace(/[\s\-]+/g, '')
    .replace(/o/g, '0')
    .replace(/i/g, '1');
}
// ========== END NORMALIZATION FUNCTION ==========
// ✅ Support section (Ko-fi only, mid-page)
function createSupportSection() {
  const support = document.getElementById("support-area");
  if (!support) {
    console.error("❌ No #support-area found in DOM");
    return;
  }
  support.innerHTML = `
    <div class="kofi-container">
      <p>☕ This database helps military folks translate the alphabet soup of acronyms</p>
      <a href="https://ko-fi.com/militaryjargon" target="_blank" class="kofi-button">
        Buy me a coffee
      </a>
    </div>
  `;
  console.log("☕ Ko-fi added");
}
// ✅ Standby banner at bottom/footer
function createStandbyBanner() {
  const footer = document.querySelector("footer");
  if (!footer) {
    console.error("❌ No <footer> found in DOM");
    return;
  }
  const banner = document.createElement("div");
  banner.className = "coming-soon-banner";
  banner.innerHTML = `
    <div class="banner-content">
      ⏳ Standby to Standby - More Military Branches Coming Soon
      <div class="banner-subtext">Navy • Air Force • Marines • Coast Guard • Space Force</div>
    </div>
  `;
  footer.appendChild(banner);
  console.log("⏳ Standby banner added at footer");
}
// ✅ Handle acronym submission (on submit.html)
function submitAcronym() {
  const acronym = document.getElementById('submitAcronym').value.trim();
  const meaning = document.getElementById('submitMeaning').value.trim();
  const description = document.getElementById('submitDescription').value.trim();
  const service = document.getElementById('submitService').value;
  if (!acronym || !meaning || !description || !service) {
    alert('Please fill in all fields');
    return;
  }
  const subject = encodeURIComponent(`New Acronym Submission: ${acronym}`);
  const body = encodeURIComponent(`
New Acronym Submission:
Acronym: ${acronym}
Meaning: ${meaning}
Description: ${description}
Service Branch: ${service}
Submitted from: ${window.location.href}
Please verify this information before adding to the database.
  `);
  const mailtoLink = `mailto:jargonhubs@gmail.com?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;
  // Clear form
  document.getElementById('submitAcronym').value = '';
  document.getElementById('submitMeaning').value = '';
  document.getElementById('submitDescription').value = '';
  document.getElementById('submitService').value = '';
}
// ========== SEARCH FUNCTION ==========
function runSearch(query) {
  const q = query.trim();
  const searchInMeanings = document.getElementById('searchInMeanings').checked;
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';
  if (!q) return;
  const normalizedQuery = normalizeSearchText(q);
  const results = acronyms.map(item => {
    let score = 0;
    let badges = [];
    const normalizedAcronym = normalizeSearchText(item.acronym || '');
    const meaning = (item.meaning || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    if (normalizedAcronym === normalizedQuery) {
      score += 1000;
      badges.push("⭐ Exact Match");
    }
    else if (normalizedAcronym.startsWith(normalizedQuery)) {
      score += 500;
      badges.push("🔵 Starts With");
    }
    else if (normalizedAcronym.includes(normalizedQuery)) {
      score += 200;
      badges.push("🔍 Contains (Acronym)");
    }
    if (searchInMeanings) {
      if (meaning.split(/\W+/).includes(q.toLowerCase())) {
        score += 80;
        badges.push("🟢 Word Match (Meaning)");
      }
      if (desc.split(/\W+/).includes(q.toLowerCase())) {
        score += 80;
        badges.push("🟢 Word Match (Description)");
      }
    }
    if (searchInMeanings) {
      if (meaning.includes(q.toLowerCase()) && !meaning.split(/\W+/).includes(q.toLowerCase())) {
        score += 40;
        badges.push("🔍 Partial Match (Meaning)");
      }
      if (desc.includes(q.toLowerCase()) && !desc.split(/\W+/).includes(q.toLowerCase())) {
        score += 40;
        badges.push("🔍 Partial Match (Description)");
      }
    }
    return { ...item, score, badges };
  })
  .filter(r => r.score > 0)
  .sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.acronym || '').localeCompare(b.acronym || '');
  });
  if (results.length === 0) {
    resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
    return;
  }
  results.forEach(item => resultsContainer.appendChild(createCard(item)));
}
// ========== END SEARCH FUNCTION ==========
// ✅ Build card  (now clickable -> opens the term's own page)
function createCard(item) {
  const card = document.createElement("div");
  card.className = "card";

  // Whole card is clickable to its dedicated page
  if (item._slug) {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = "terms/" + item._slug + ".html";
    });
  }

  const title = document.createElement("h2");
  title.textContent = item.acronym || '';
  card.appendChild(title);
  const meaning = document.createElement("div");
  meaning.className = "meaning";
  meaning.textContent = item.meaning || '';
  card.appendChild(meaning);
  const desc = document.createElement("div");
  desc.className = "description";
  desc.textContent = item.description || '';
  card.appendChild(desc);
  if (item.reference) {
    const refDiv = document.createElement("div");
    refDiv.className = "example";
    if (Array.isArray(item.reference)) {
      refDiv.innerHTML = "Reference: " + item.reference.map(r => {
        if (typeof r === "object" && r.url) {
          return `<a href="${r.url}" target="_blank">${r.name}</a>`;
        } else if (typeof r === "object" && r.name) {
          return r.name;
        } else {
          return r;
        }
      }).join(" · ");
    } else if (typeof item.reference === "object" && item.reference.url) {
      refDiv.innerHTML = `Reference: <a href="${item.reference.url}" target="_blank">${item.reference.name}</a>`;
    } else if (typeof item.reference === "object" && item.reference.name) {
      refDiv.textContent = `Reference: ${item.reference.name}`;
    } else if (typeof item.reference === "string") {
      refDiv.textContent = `Reference: ${item.reference}`;
    } else {
      refDiv.textContent = `Reference: ${JSON.stringify(item.reference)}`;
    }
    // don't trigger the card's page navigation when clicking a reference link
    refDiv.addEventListener("click", (e) => e.stopPropagation());
    card.appendChild(refDiv);
  }
  // ✅ ADD RELATED TERMS (clickable, in-page search)
  if (item.relatedTerms && item.relatedTerms.length > 0) {
    const relatedDiv = document.createElement("div");
    relatedDiv.className = "related-terms";
    relatedDiv.innerHTML = "Related: ";
    item.relatedTerms.forEach((term, index) => {
      const termLink = document.createElement("span");
      termLink.className = "related-term-link";
      termLink.textContent = term;
      termLink.style.cursor = "pointer";
      termLink.style.color = "#4a9eff";
      termLink.style.textDecoration = "underline";
      termLink.addEventListener("click", (e) => {
        e.stopPropagation(); // don't open the card's page
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
          searchInput.value = term;
          runSearch(term);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      relatedDiv.appendChild(termLink);
      if (index < item.relatedTerms.length - 1) {
        relatedDiv.appendChild(document.createTextNode(" · "));
      }
    });
    card.appendChild(relatedDiv);
  }
  if (item.badges && item.badges.length > 0) {
    const badgeDiv = document.createElement("div");
    badgeDiv.className = "badges";
    badgeDiv.textContent = "Matches: " + item.badges.join(" · ");
    card.appendChild(badgeDiv);
  }
  return card;
}
// ✅ Stars (background effect)
function createStars() {
  const starsContainer = document.getElementById("stars");
  if (!starsContainer) return;
  const numStars = 40;
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.textContent = "★";
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.animationDuration = (1.5 + Math.random() * 2) + "s";
    starsContainer.appendChild(star);
  }
}
// ✅ Init
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("results")) {
    createStars();
    createSupportSection();
    createStandbyBanner();
    const input = document.getElementById("searchInput");
    if (input) {
      input.addEventListener("input", e => runSearch(e.target.value));
    }
  }
  if (document.querySelector(".submit-form")) {
    console.log("📝 Submit form active");
  }
});
