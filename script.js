/* Half Sword — script.js
   Vanilla JS, loaded with `defer`. No dependencies.
   Modules: header state, mobile nav, smooth anchors, scroll reveals,
   hero video handling, gallery lightbox, footer year. */

(function () {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Marks that JS is running so the CSS can hide [data-reveal] elements
  // until they enter the viewport. Without JS everything stays visible.
  root.classList.add('js');

  /* ------------------------------------------------------------------
     Header: gains a background once the page is scrolled.
     rAF-throttled so the scroll handler never runs more than once per frame.
     ------------------------------------------------------------------ */
  const header = doc.getElementById('site-header');
  let ticking = false;

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();

  /* ------------------------------------------------------------------
     Mobile nav: slide-in overlay with a real button, aria-expanded,
     Escape to close, focus returned to the toggle, body scroll lock.
     ------------------------------------------------------------------ */
  const toggle = doc.querySelector('.nav-toggle');
  const nav = doc.getElementById('site-nav');
  const navItems = nav.querySelectorAll('.site-nav__list li');
  const desktopQuery = window.matchMedia('(min-width: 768px)');

  // Per-item stagger index used by the CSS transition-delay.
  navItems.forEach(function (li, i) { li.style.setProperty('--i', i); });

  function openNav() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    doc.body.classList.add('nav-open');
    const first = nav.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function closeNav(returnFocus) {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    doc.body.classList.remove('nav-open');
    if (returnFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', function () {
    nav.classList.contains('is-open') ? closeNav(true) : openNav();
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav(true);
  });

  // Keep Tab inside the open overlay.
  nav.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !nav.classList.contains('is-open')) return;
    const focusables = nav.querySelectorAll('a[href], button:not([disabled])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); toggle.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); toggle.focus(); }
  });

  // If the viewport grows past the mobile breakpoint while open, reset state.
  desktopQuery.addEventListener('change', function (e) { if (e.matches) closeNav(false); });

  /* ------------------------------------------------------------------
     Anchor links: close the mobile menu, then scroll.
     CSS `scroll-behavior: smooth` does the easing (and is disabled by the
     reduced-motion media query in style.css). We only intervene to keep
     the URL hash in sync and to account for the fixed header on old browsers.
     ------------------------------------------------------------------ */
  doc.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id.length < 2) return;
      const target = doc.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const wasOpen = nav.classList.contains('is-open');
      closeNav(false);
      // Let the overlay finish closing before the page starts to move.
      const delay = wasOpen && !reduceMotion.matches ? 200 : 0;
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', id);
      }, delay);
    });
  });

  /* ------------------------------------------------------------------
     Scroll reveals: IntersectionObserver adds .is-visible once.
     Children of a [data-reveal-group] get a stagger index (--i).
     Transform/opacity only; CSS handles the reduced-motion fallback.
     ------------------------------------------------------------------ */
  doc.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    group.querySelectorAll('[data-reveal]').forEach(function (el, i) {
      el.style.setProperty('--i', i);
    });
  });

  const revealEls = doc.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     Hero video. The <video> in the HTML has no <source>; the file is only
     attached here, and only when it is worth the bytes:
       - viewport >= 768px  (phones get the still + slow zoom instead)
       - no prefers-reduced-motion
       - no Save-Data request header from the browser
     It fades in on the `playing` event, so the still is always what the
     user sees until real frames exist. It is paused while scrolled out of
     view so it doesn't burn CPU under the rest of the page.
     ------------------------------------------------------------------ */
  const heroVideo = doc.querySelector('.hero__video');
  if (heroVideo && heroVideo.dataset.mp4) {
    const wideEnough = window.matchMedia('(min-width: 768px)');
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    let attached = false;
    let inView = true;

    function wantsVideo() {
      return wideEnough.matches && !reduceMotion.matches && !saveData;
    }

    function attach() {
      if (attached) return;
      attached = true;
      // Set muted from script as well as the attribute: browsers only allow autoplay
      // when the element is actually muted, and the attribute alone has been flaky in Chrome.
      heroVideo.muted = true;
      heroVideo.defaultMuted = true;
      if (heroVideo.dataset.webm) {
        const webm = doc.createElement('source');
        webm.src = heroVideo.dataset.webm; webm.type = 'video/webm';
        heroVideo.appendChild(webm);
      }
      const mp4 = doc.createElement('source');
      mp4.src = heroVideo.dataset.mp4; mp4.type = 'video/mp4';
      // A missing or unplayable file fires `error` on the last <source>, not on <video>.
      // The still stays on screen either way; this just makes the cause visible in DevTools.
      mp4.addEventListener('error', function () {
        console.warn('Hero video could not be loaded (check the path and that the file is committed): ' + mp4.src);
      });
      heroVideo.appendChild(mp4);
      heroVideo.load();
    }

    let explained = false;
    function sync() {
      if (wantsVideo()) {
        attach();
        if (inView && heroVideo.paused) {
          heroVideo.play().catch(function () { /* autoplay blocked: the still stays */ });
        }
      } else {
        if (!heroVideo.paused) heroVideo.pause();
        if (!attached && !explained) {
          // Deliberate skip; say why once so "where did the video go?" is a one-line answer.
          explained = true;
          const why = [];
          if (!wideEnough.matches) why.push('viewport narrower than 768px');
          if (reduceMotion.matches) why.push('prefers-reduced-motion is on');
          if (saveData) why.push('browser Data Saver is on');
          console.info('Hero video skipped on purpose: ' + why.join(', ') + '. The still image is shown instead.');
        }
      }
    }

    heroVideo.addEventListener('playing', function () {
      heroVideo.classList.add('is-playing');
    }, { once: true });

    // Pause when the hero leaves the viewport, resume when it returns.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (!inView) { if (!heroVideo.paused) heroVideo.pause(); }
        else sync();
      }, { threshold: 0.05 }).observe(heroVideo);
    }

    wideEnough.addEventListener('change', sync);
    reduceMotion.addEventListener('change', sync);
    sync();
  }

  /* ------------------------------------------------------------------
     Gallery lightbox on <dialog>. Native focus trap + Escape + top layer.
     Arrow keys move between images. Clicking the backdrop closes.
     ------------------------------------------------------------------ */
  const lightbox = doc.getElementById('lightbox');
  const items = Array.prototype.slice.call(doc.querySelectorAll('.gallery__item'));

  if (lightbox && items.length && typeof lightbox.showModal === 'function') {
    const img = lightbox.querySelector('.lightbox__img');
    const caption = lightbox.querySelector('.lightbox__caption');
    let index = 0;
    let opener = null;

    function render(i) {
      index = (i + items.length) % items.length;
      const btn = items[index];
      const thumb = btn.querySelector('img');
      img.src = btn.dataset.full || (thumb ? thumb.currentSrc || thumb.src : '');
      img.alt = thumb ? thumb.alt : '';
      caption.textContent = btn.dataset.caption || '';
    }

    function open(i, sourceEl) {
      opener = sourceEl;
      render(i);
      lightbox.showModal();
      // Next frame so the transition runs from the initial state.
      window.requestAnimationFrame(function () { lightbox.classList.add('is-shown'); });
      lightbox.querySelector('[data-lightbox-close]').focus({ preventScroll: true });
    }

    function close() {
      lightbox.classList.remove('is-shown');
      const finish = function () {
        if (lightbox.open) lightbox.close();
        img.removeAttribute('src');   /* src="" is treated as "this page's URL" by some browsers */
        if (opener) opener.focus({ preventScroll: true });
      };
      reduceMotion.matches ? finish() : window.setTimeout(finish, 240);
    }

    items.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i, btn); });
    });

    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', close);
    lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', function () { render(index - 1); });
    lightbox.querySelector('[data-lightbox-next]').addEventListener('click', function () { render(index + 1); });

    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); render(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); render(index + 1); }
    });

    // Native Escape fires `cancel`; route it through our close so focus returns.
    lightbox.addEventListener('cancel', function (e) { e.preventDefault(); close(); });

    // Click on the backdrop (outside the figure and buttons) closes.
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  const year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
