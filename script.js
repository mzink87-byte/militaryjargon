function runSearch(query) {
  const q = query.toLowerCase().trim();

  // ✅ If empty, clear results
  if (!q) {
    document.getElementById('results').innerHTML = '';
    return;
  }

  // ✅ Search normally
  const results = acronyms.filter(a => 
    a.acronym.toLowerCase().includes(q) ||
    a.meaning.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q)
  );

  // ✅ If no matches
  if (results.length === 0) {
    document.getElementById('results').innerHTML = `<p>No results found for "${query}".</p>`;
    return;
  }

  // ✅ Render only matches
  document.getElementById('results').innerHTML = results.map(r => `
    <div class="result">
      <div class="acronym">${r.acronym}</div>
      <div>${r.meaning}</div>
      <small>${r.description}</small>
    </div>
  `).join('');
}
