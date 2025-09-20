let acronyms = [];

// ✅ Load your JSON file (make sure acronyms.json is in the root folder)
fetch('acronyms.json')
  .then(res => res.json())
  .then(data => acronyms = data);

function runSearch(query) {
  const q = query.toLowerCase().trim();

  if (!q) {
    document.getElementById('results').innerHTML = '';
    return;
  }

  const advanced = document.getElementById('advancedSearch').checked;

  let results;

  if (advanced) {
    // ✅ Advanced mode: search everything
    results = acronyms.filter(a => 
      a.acronym.toLowerCase().includes(q) ||
      a.meaning.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  } else {
    // ✅ Basic mode: search acronym only
    results = acronyms.filter(a => a.acronym.toLowerCase().includes(q));
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

// ✅ Trigger on typing
document.addEventListener('input', e => {
  if (e.target.id === 'searchBox') {
    runSearch(e.target.value);
  }
});

// ✅ Trigger on Enter key
document.addEventListener('keydown', e => {
  if (e.target.id === 'searchBox' && e.key === 'Enter') {
    runSearch(e.target.value);
  }
});
