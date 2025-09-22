let acronyms = [];

// ✅ Load JSON file
fetch('acronyms.json')
  .then(res => res.json())
  .then(data => acronyms = data)
  .catch(err => console.error("Error loading JSON:", err));

// ✅ Run search logic
function runSearch(query) {
  const q = query.toLowerCase().trim();
  const searchInMeanings = document.getElementById('searchInMeanings').checked;

  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (!q) return;

  const results = acronyms.filter(item => {
    const inAcronym = item.acronym.toLowerCase().includes(q);
    const inMeaning = item.meaning.toLowerCase().includes(q);
    const inDesc = item.description.toLowerCase().includes(q);
    return inAcronym || (searchInMeanings && (inMeaning || inDesc));
  });

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

  // Acronym
  const title = document.createElement("h2");
  title.textContent = item.acronym;
  card.appendChild(title);

  // Meaning
  const meaning = document.createElement("div");
  meaning.className = "meaning";
  meaning.textContent = item.meaning;
  card.appendChild(meaning);

  // Description
  const desc = document.createElement("div");
  desc.className = "description";
  desc.textContent = item.description;
  card.appendChild(desc);

  // Reference
  if (item.reference) {
    const refDiv = document.createElement("div");
    refDiv.className = "example";

    if (Array.isArray(item.reference)) {
      // multiple refs
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
      // single object
      refDiv.innerHTML = `Reference: <a href="${item.reference.url}" target="_blank">${item.reference.name}</a>`;
    } else {
      // plain string
      refDiv.textContent = `Reference: ${item.reference}`;
    }

    card.appendChild(refDiv);
  }

  return card;
}

// ✅ Input listener
document.getElementById("searchInput").addEventListener("input", e => {
  runSearch(e.target.value);
});

// ✅ Generate random stars in header
function createStars() {
  const starsContainer = document.getElementById("stars");
  const numStars = 40;

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.textContent = "★";

    // random position
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";

    // random twinkle speed
    star.style.animationDuration = (1.5 + Math.random() * 2) + "s";

    starsContainer.appendChild(star);
  }
}

createStars();
