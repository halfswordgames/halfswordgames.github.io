document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();

    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
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

// Customize game trailer section
const gameTrailer = document.getElementById('game-trailer');
gameTrailer.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

// Customize screenshot showcase section
const screenshotShowcase = document.getElementById('screenshot-showcase');
for (let i = 1; i <= 6; i++) {
  const screenshot = document.createElement('img');
  screenshot.src = `screenshots/screenshot${i}.jpg`;
  screenshot.alt = `Screenshot ${i}`;
  screenshotShowcase.appendChild(screenshot);
}

// Customize concept art section
const conceptArt = document.getElementById('concept-art');
for (let i = 1; i <= 4; i++) {
  const artPiece = document.createElement('img');
  artPiece.src = `concept-art/art${i}.jpg`;
  artPiece.alt = `Concept Art ${i}`;
  conceptArt.appendChild(artPiece);
}
