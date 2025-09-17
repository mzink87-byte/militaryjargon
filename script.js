let acronyms = [];
fetch('data/acronyms.json')
  .then(res => res.json())
  .then(data => acronyms = data);

document.addEventListener('input', e => {
  if (e.target.id === 'searchBox') {
    const query = e.target.value.toUpperCase();
    const results = acronyms.filter(a => a.acronym.includes(query));
    document.getElementById('results').innerHTML = results.map(r => `
      <div class="result">
        <div id="acronym">${r.acronym}</div>
        <div>${r.meaning}</div>
        <small>${r.description}</small>
      </div>
    `).join('');
  }
});