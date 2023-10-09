document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nav = document.querySelector('nav ul');
    nav.classList.remove('active');
  });
});

document.querySelector('nav ul').addEventListener('click', function() {
  this.classList.toggle('active');
});
