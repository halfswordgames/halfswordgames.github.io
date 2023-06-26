document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Adjusted scrollIntoView options for better mobile view
    // Close the navigation menu on mobile devices after clicking a link
    const nav = document.querySelector('nav ul');
    nav.classList.remove('active');
  });
});

// Toggle navigation menu on mobile devices
document.querySelector('nav ul').addEventListener('click', function() {
  this.classList.toggle('active');
});

// Add class to header on scroll
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (window.scrollY > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
