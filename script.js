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

  // ✅ Fixed line
  results.forEach(item => resultsContainer.appendChild(createCard(item)));
}
