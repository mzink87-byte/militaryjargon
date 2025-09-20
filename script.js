let acronyms = [];

// ✅ Load your JSON file (same folder as index.html)
fetch('acronyms.json')
  .then(res => res.json())
  .then(data => acronyms = data);

document.addEventListener('input', e => {
  if (e.target.id === 'searchBox') {
    const query = e.target.value.toLowerCase();

    // ✅ Search across acronym, meaning, and description
    const results = acronyms.filter(a => 
      a.acronym.toLowerCase().includes(query) ||
      a.meaning.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    );

    // ✅ Show results
    document.getElementById('results').innerHTML = results.map(r => `
      <div class="result">
        <div class="acronym">${r.acronym}</div>
        <div>${r.meaning}</div>
        <small>${r.description}</small>
      </div>
    `).join('');
  }
});
