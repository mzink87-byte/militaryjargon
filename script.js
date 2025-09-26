console.log("🚀 script.js loaded");

// ✅ Global acronyms
let acronyms = [];

// ✅ Load JSON file (only if results div exists)
if (document.getElementById("results")) {
  fetch("acronyms.json")
    .then(res => res.json())
    .then(data => acronyms = data)
    .catch(err => {
      console.error("Error loading JSON:", err);
      document.getElementById("results").innerHTML =
        `<p style="color:red;">⚠️ Failed to load acronyms database.</p>`;
    });
}

// ✅ Support section (Ko-fi + Standby)
function createSupportSection() {
  const support = document.getElementById("support-area");
  if (!support) return;

  support.innerHTML = `
    <div class="kofi-container">
      <p>☕ This database helps military folks translate the alphabet soup of acronyms</p>
      <a href="https://ko-fi.com/YOURUSERNAME" target="_blank" class="kofi-button">
        Buy me a coffee
      </a>
    </div>
    <div class="coming-soon-banner">
      <div class="banner-content">
        <span class="standby-text">⏳ Standby to Standby - More Military Branches Coming Soon</span>
        <div class="banner-subtext">Navy • Air Force • Marines • Coast Guard • Space Force</div>
      </div>
    </div>
  `;
  console.log("☕ Ko-fi + ⏳ banner added");
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

// ✅ Run search logic (on index.html)
function runSearch(query) {
  const q = query.toLowerCase().trim();
  const searchInMeanings = document.getElementById('searchInMeanings').checked;
  const resultsContainer = document.getElementById('results');

  resultsContainer.innerHTML = '';
  if (!q) return;

  const results = acronyms.map(item => {
    let score = 0;
    let badges = [];

    const acronym = item.acronym.toLowerCase();
    const meaning = item.meaning.toLowerCase();
    const desc = item.description.toLowerCase();

    if (acronym === q) {
      score += 100;
      badges.push("⭐ Exact Match");
    }
    if (searchInMeanings) {
      if (meaning.split(/\W+/).includes(q)) {
        score += 80;
        badges.push("🟢 Word Match (Meaning)");
      }
      if (desc.split(/\W+/).includes(q)) {
        score += 80;
        badges.push("🟢 Word Match (Description)");
      }
    }
    if (acronym.includes(q) && acronym !== q) {
      score += 40;
      badges.push("🔍 Partial Match (Acronym)");
    }
    if (searchInMeanings) {
      if (meaning.includes(q) && !meaning.split(/\W+/).includes(q)) {
        score += 40;
        badges.push("🔍 Partial Match (Meaning)");
      }
      if (desc.includes(q) && !desc.split(/\W+/).includes(q)) {
        score += 40;
        badges.push("🔍 Partial Match (Description)");
      }
    }

    return { ...item, score, badges };
  })
  .filter(r => r.score > 0)
  .sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
    return;
  }

  results.forEach(item => resultsContainer.appendChild(createCard(item)));
}

// ✅ Build card
function createCard(item) {
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h2");
  title.textContent = item.acronym;
  card.appendChild(title);

  const meaning = document.createElement("div");
  meaning.className = "meaning";
  meaning.textContent = item.meaning;
  card.appendChild(meaning);

  const desc = document.createElement("div");
  desc.className = "description";
  desc.textContent = item.description;
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
    } else {
      refDiv.textContent = `Reference: ${item.reference}`;
    }

    card.appendChild(refDiv);
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
  // If we're on the search page
  if (document.getElementById("results")) {
    createStars();
    createSupportSection();

    const input = document.getElementById("searchInput");
    if (input) {
      input.addEventListener("input", e => runSearch(e.target.value));
    }
  }

  // If we're on the submit page
  if (document.querySelector(".submit-form")) {
    console.log("📝 Submit form active");
  }
});
