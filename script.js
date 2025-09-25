console.log("🚀 script.js loaded");

// ✅ Global acronyms
let acronyms = [];

// ✅ Load JSON file
fetch('acronyms.json')
  .then(res => res.json())
  .then(data => acronyms = data)
  .catch(err => console.error("Error loading JSON:", err));

// ✅ Create banner for coming soon content
function createComingSoonBanner() {
  const banner = document.createElement("div");
  banner.className = "coming-soon-banner";
  banner.innerHTML = `
    <div class="banner-content">
      <span class="standby-text">⏳ Standby to Standby - More Military Branches Coming Soon</span>
      <div class="banner-subtext">Navy • Air Force • Marines • Coast Guard • Space Force</div>
    </div>
  `;

  // Insert after header but before search bar
  const header = document.querySelector('header');
  const searchContainer = document.querySelector('.search-container');
  if (header && searchContainer) {
    header.parentNode.insertBefore(banner, searchContainer);
    console.log("⏳ Coming Soon banner added");
  }
}

// ✅ Create submit acronym section
function createSubmitForm() {
  const submitSection = document.createElement("div");
  submitSection.className = "submit-section";
  submitSection.innerHTML = `
    <div class="submit-container">
      <h3>📝 Submit an Acronym</h3>
      <p>Know a military acronym we're missing? Help us build the database!</p>
      <div class="submit-form">
        <input type="text" id="submitAcronym" placeholder="Acronym (e.g., FUBAR)" maxlength="20">
        <input type="text" id="submitMeaning" placeholder="Meaning" maxlength="100">
        <textarea id="submitDescription" placeholder="Description/Context" maxlength="300"></textarea>
        <select id="submitService">
          <option value="">Select Service Branch</option>
          <option value="Army">Army</option>
          <option value="Navy">Navy</option>
          <option value="Air Force">Air Force</option>
          <option value="Marines">Marines</option>
          <option value="Coast Guard">Coast Guard</option>
          <option value="Space Force">Space Force</option>
          <option value="Joint">Joint/All Services</option>
        </select>
        <div class="opsec-warning">
          ⚠️ <strong>OPSEC Reminder:</strong> Do not submit classified, sensitive, or operational security information
        </div>
        <button type="button" onclick="submitAcronym()">Submit Acronym</button>
      </div>
    </div>
  `;

  // Insert before results section
  const resultsSection = document.getElementById('results');
  if (resultsSection) {
    resultsSection.parentNode.insertBefore(submitSection, resultsSection);
    console.log("📝 Submit form added");
  }
}

// ✅ Handle acronym submission
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

  const mailtoLink = `mailto:your-email@domain.com?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;

  // Clear form
  document.getElementById('submitAcronym').value = '';
  document.getElementById('submitMeaning').value = '';
  document.getElementById('submitDescription').value = '';
  document.getElementById('submitService').value = '';
}

// ✅ Create Ko-fi button
function createKofiButton() {
  const kofiSection = document.createElement("div");
  kofiSection.className = "support-section";
  kofiSection.innerHTML = `
    <div class="kofi-container">
      <p>☕ This database helps military folks translate the alphabet soup of acronyms</p>
      <a href="https://ko-fi.com/yourusername" target="_blank" class="kofi-button">
        Buy me a coffee
      </a>
    </div>
  `;

  document.body.appendChild(kofiSection);
  console.log("☕ Ko-fi section added");
}

// ✅ Run search logic (unchanged)
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

// ✅ Input listener
document.getElementById("searchInput").addEventListener("input", e => {
  runSearch(e.target.value);
});

// ✅ Stars
function createStars() {
  const starsContainer = document.getElementById("stars");
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
document.addEventListener('DOMContentLoaded', function() {
  createStars();
  createComingSoonBanner();
  createSubmitForm();
  createKofiButton();
});
