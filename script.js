let acronyms = [];

// ✅ Load your JSON file (make sure acronyms.json is in the root folder)
fetch('acronyms.json')
  .then(res => res.json())
  .then(data => acronyms = data)
  .catch(err => console.error("Error loading JSON:", err));

function runSearch(query) {
  const q = query.toLowerCase().trim();
  const advanced = document.getElementById('advancedSearch').checked;

  // ✅ In basic mode, require at least 2 characters
  if (!advanced && q.length < 2) {
    document.getElementById('results').innerHTML = '';
    return;
  }

  let results;

  if (advanced) {
    // ✅ Advanced mode: contains search across all fields
    results = acronyms.filter(a => 
      a.acronym.toLowerCase().includes(q) ||
      a.meaning.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  } else {
    // ✅ Basic mode: startsWith on acronym only
    results = acronyms.filter(a => a.acronym.toLowerCase().startsWith(q));
  }

  if (results.length === 0) {
    document.getElementById('results').innerHTML = `<p>No results found for "${query}".</p>`;
    return;
  }

  document.getElementById('results').innerHTML = results.map(r => `
    <div class="result">
      <div class="acronym">${r.acronym}</div>
      <div>${r.meaning}</div>
      <small>${r.description}</small>
    </div>
  `).join('');
}

  // ✅ Render matches
  document.getElementById('results').innerHTML = results.map(r => `
    <div class="result">
      <div class="acronym">${r.acronym}</div>
      <div>${r.meaning}</div>
      <small>${r.description}</small>
    </div>
  `).join('');
}

// ✅ Only trigger on Enter
document.addEventListener('keydown', e => {
  if (e.target.id === 'searchBox' && e.key === 'Enter') {
    runSearch(e.target.value);
  }
});
