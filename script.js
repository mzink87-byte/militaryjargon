console.log("🚀 script.js loaded");
let acronyms = [];

// ---- slug logic: MUST match generate-pages.js ----
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

function normalizeSearchText(text) {
  return (text == null ? '' : String(text))
    .toLowerCase()
    .replace(/[\s\-]+/g, '')
    .replace(/o/g, '0')
    .replace(/i/g, '1');
}

function createSupportSection() {
  const support = document.getElementById("support-area");
  if (!support) return;
  support.innerHTML = `
    <div class="kofi-container">
      <p>☕ This database helps military folks translate the alphabet soup of acronyms</p>
      <a href="https://ko-fi.com/militaryjargon" target="_blank" class="kofi-button">Buy me a coffee</a>
    </div>`;
}
function createStandbyBanner() {
  const footer = document.querySelector("footer");
  if (!footer) return;
  const banner = document.createElement("div");
  banner.className = "coming-soon-banner";
  banner.innerHTML = `
    <div class="banner-content">
      ⏳ Standby to Standby - More Military Branches Coming Soon
      <div class="banner-subtext">Navy • Air Force • Marines • Coast Guard • Space Force</div>
    </div>`;
  footer.appendChild(banner);
}
function submitAcronym() {
  const acronym = document.getElementById('submitAcronym').value.trim();
  const meaning = document.getElementById('submitMeaning').value.trim();
  const description = document.getElementById('submitDescription').value.trim();
  const service = document.getElementById('submitService').value;
  if (!acronym || !meaning || !description || !service) { alert('Please fill in all fields'); return; }
  const subject = encodeURIComponent(`New Acronym Submission: ${acronym}`);
  const body = encodeURIComponent(`New Acronym Submission:\nAcronym: ${acronym}\nMeaning: ${meaning}\nDescription: ${description}\nService Branch: ${service}\nSubmitted from: ${window.location.href}`);
  window.location.href = `mailto:jargonhubs@gmail.com?subject=${subject}&body=${body}`;
  document.getElementById('submitAcronym').value = '';
  document.getElementById('submitMeaning').value = '';
  document.getElementById('submitDescription').value = '';
  document.getElementById('submitService').value = '';
}

const MAX_RESULTS = 150; // ← cap so mobile never tries to draw thousands of cards

function runSearch(query) {
  const q = query.trim();
  const searchInMeanings = document.getElementById('searchInMeanings').checked;
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';
  if (!q) return;
  const normalizedQuery = normalizeSearchText(q);
  const results = acronyms.map(item => {
    let score = 0; let badges = [];
    const normalizedAcronym = normalizeSearchText(item.acronym || '');
    const meaning = (item.meaning || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    if (normalizedAcronym === normalizedQuery) { score += 1000; badges.push("⭐ Exact Match"); }
    else if (normalizedAcronym.startsWith(normalizedQuery)) { score += 500; badges.push("🔵 Starts With"); }
    else if (normalizedAcronym.includes(normalizedQuery)) { score += 200; badges.push("🔍 Contains (Acronym)"); }
    if (searchInMeanings) {
      if (meaning.split(/\W+/).includes(q.toLowerCase())) { score += 80; badges.push("🟢 Word Match (Meaning)"); }
      if (desc.split(/\W+/).includes(q.toLowerCase())) { score += 80; badges.push("🟢 Word Match (Description)"); }
      if (meaning.includes(q.toLowerCase()) && !meaning.split(/\W+/).includes(q.toLowerCase())) { score += 40; badges.push("🔍 Partial Match (Meaning)"); }
      if (desc.includes(q.toLowerCase()) && !desc.split(/\W+/).includes(q.toLowerCase())) { score += 40; badges.push("🔍 Partial Match (Description)"); }
    }
    return { ...item, score, badges };
  })
  .filter(r => r.score > 0)
  .sort((a, b) => (b.score !== a.score) ? b.score - a.score : (a.acronym || '').localeCompare(b.acronym || ''));

  if (results.length === 0) {
    resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
    return;
  }
  const shown = results.slice(0, MAX_RESULTS);
  shown.forEach(item => resultsContainer.appendChild(createCard(item)));
  if (results.length > MAX_RESULTS) {
    const more = document.createElement('p');
    more.style.cssText = 'text-align:center;color:#555;margin:16px 0;font-size:.95rem;';
    more.textContent = `Showing the top ${MAX_RESULTS} of ${results.length} matches — keep typing to narrow it down.`;
    resultsContainer.appendChild(more);
  }
}

function createCard(item) {
  const card = document.createElement("div");
  card.className = "card";
  if (item._slug) {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => { window.location.href = "terms/" + item._slug + ".html"; });
  }
  const title = document.createElement("h2"); title.textContent = item.acronym || ''; card.appendChild(title);
  const meaning = document.createElement("div"); meaning.className = "meaning"; meaning.textContent = item.meaning || ''; card.appendChild(meaning);
  const desc = document.createElement("div"); desc.className = "description"; desc.textContent = item.description || ''; card.appendChild(desc);
  if (item.reference) {
    const refDiv = document.createElement("div"); refDiv.className = "example";
    if (Array.isArray(item.reference)) {
      refDiv.innerHTML = "Reference: " + item.reference.map(r => (typeof r === "object" && r.url) ? `<a href="${r.url}" target="_blank">${r.name}</a>` : (typeof r === "object" && r.name) ? r.name : r).join(" · ");
    } else if (typeof item.reference === "object" && item.reference.url) {
      refDiv.innerHTML = `Reference: <a href="${item.reference.url}" target="_blank">${item.reference.name}</a>`;
    } else if (typeof item.reference === "object" && item.reference.name) {
      refDiv.textContent = `Reference: ${item.reference.name}`;
    } else if (typeof item.reference === "string") {
      refDiv.textContent = `Reference: ${item.reference}`;
    }
    refDiv.addEventListener("click", (e) => e.stopPropagation());
    card.appendChild(refDiv);
  }
  if (item.relatedTerms && item.relatedTerms.length > 0) {
    const relatedDiv = document.createElement("div"); relatedDiv.className = "related-terms"; relatedDiv.innerHTML = "Related: ";
    item.relatedTerms.forEach((term, index) => {
      const termLink = document.createElement("span");
      termLink.className = "related-term-link"; termLink.textContent = term;
      termLink.style.cssText = "cursor:pointer;color:#4a9eff;text-decoration:underline;";
      termLink.addEventListener("click", (e) => {
        e.stopPropagation();
        const searchInput = document.getElementById("searchInput");
        if (searchInput) { searchInput.value = term; runSearch(term); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      });
      relatedDiv.appendChild(termLink);
      if (index < item.relatedTerms.length - 1) relatedDiv.appendChild(document.createTextNode(" · "));
    });
    card.appendChild(relatedDiv);
  }
  if (item.badges && item.badges.length > 0) {
    const badgeDiv = document.createElement("div"); badgeDiv.className = "badges";
    badgeDiv.textContent = "Matches: " + item.badges.join(" · "); card.appendChild(badgeDiv);
  }
  return card;
}

function createStars() {
  const starsContainer = document.getElementById("stars");
  if (!starsContainer) return;
  for (let i = 0; i < 40; i++) {
    const star = document.createElement("div");
    star.className = "star"; star.textContent = "★";
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.animationDuration = (1.5 + Math.random() * 2) + "s";
    starsContainer.appendChild(star);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("results")) {
    createStars(); createSupportSection(); createStandbyBanner();
    const input = document.getElementById("searchInput");
    if (input) input.addEventListener("input", e => runSearch(e.target.value));
  }
});
