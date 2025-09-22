let acronyms = [];

// ✅ Load acronyms.json
fetch("acronyms.json")
  .then(res => res.json())
  .then(data => (acronyms = data))
  .catch(err => console.error("Error loading JSON:", err));

// ✅ Run search logic
function runSearch(query) {
  const q = query.toLowerCase().trim();
  const searchInMeanings = document.getElementById("searchInMeanings").checked;

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (!q) return;

  // Search logic
  const results = acronyms.filter(a => {
    const inAcronym = a.acronym?.toLowerCase().includes(q);
    const inMeaning = a.meaning?.toLowerCase().includes(q);
    const inDesc = a.description?.toLowerCase().includes(q);
    return inAcronym || (searchInMeanings && (inMeaning || inDesc));
  });

  // Render
  if (results.length === 0) {
    resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
    return;
  }

  results.forEach(r => resultsContainer.appendChild(createCard(r)));
}

// ✅ Render each card
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

  // References (handle nulls, strings, objects, arrays)
  if (item.reference) {
    const refWrap = document.createElement("div");
    refWrap.className = "reference";

    const refs = Array.isArray(item.reference) ? item.reference : [item.reference];
    refs.forEach((ref, i) => {
      if (typeof ref === "string") {
        refWrap.append(`Reference: ${ref}`);
      } else if (ref && ref.url) {
        const a = document.createElement("a");
        a.href = ref.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = i === 0 ? `Reference: ${ref.name}` : ref.name;
        refWrap.appendChild(a);
      } else if (ref && ref.name) {
        refWrap.append(i === 0 ? `Reference: ${ref.name}` : ref.name);
      }
      if (i < refs.length - 1) refWrap.append(" · ");
    });

    card.appendChild(refWrap);
  }

  return card;
}

// ✅ Trigger search as you type
document.getElementById("searchInput").addEventListener("input", e => {
  runSearch(e.target.value);
});

// ⭐ Generate header stars
const starContainer = document.getElementById("stars");
if (starContainer) {
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.textContent = "★";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.fontSize = 6 + Math.random() * 8 + "px";
    starContainer.appendChild(s);
  }
}
