const page = document.body.dataset.page;

/* Guest-only logic */
if (page === 'guest') {
  document.querySelectorAll('pre').forEach(block => {
    block.addEventListener('dblclick', () => {
      navigator.clipboard.writeText(block.innerText);
    });
  });
}

/* Auth-only logic */
if (page === 'auth') {
  console.log('Dashboard loaded');
}
