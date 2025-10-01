// ✅ Run search logic (on index.html) with grouping
function runSearch(query) {
  const q = query.toLowerCase().trim();
  const searchInMeanings = document.getElementById('searchInMeanings').checked;
  const resultsContainer = document.getElementById('results');

  resultsContainer.innerHTML = '';
  if (!q) return;

  // Step 1: Build results with scores
  const grouped = {};
  acronyms.forEach(item => {
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

    if (score > 0) {
      if (!grouped[item.acronym]) grouped[item.acronym] = [];
      grouped[item.acronym].push({ ...item, score, badges });
    }
  });

  // Step 2: Turn into array + sort groups
  let groupArray = Object.entries(grouped).map(([acro, items]) => {
    items.sort((a,b) => b.score - a.score);
    return { acronym: acro, items, topScore: items[0].score };
  });
  groupArray.sort((a,b) => b.topScore - a.topScore);

  // Step 3: Display grouped results
  if (groupArray.length === 0) {
    resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
    return;
  }

  groupArray.forEach(group => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "card";

    const title = document.createElement("h2");
    title.textContent = group.acronym;
    groupDiv.appendChild(title);

    const list = document.createElement("ul");
    group.items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.meaning}</strong>: ${item.description}`;
      if (item.badges && item.badges.length > 0) {
        li.innerHTML += `<div class="badges">Matches: ${item.badges.join(" · ")}</div>`;
      }
      list.appendChild(li);
    });
    groupDiv.appendChild(list);

    resultsContainer.appendChild(groupDiv);
  });
}
