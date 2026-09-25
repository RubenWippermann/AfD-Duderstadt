/* afd-duderstadt.de — Bewegung: Scroll-Reveal (260 ms) und Hero-Video.
   Ohne JavaScript oder bei "Bewegung reduzieren" bleibt alles sichtbar (Poster statt Video). */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero-Video: Schalter HERO_VIDEO in assets/hero-config.js (false, solange media/hero-afd.mp4 fehlt) */
  var cfg = window.AFD_HERO || {};
  var video = document.querySelector('video.hero-video');
  if (video && cfg.video === true && !reduced) {
    var conn = navigator.connection || {};
    if (!conn.saveData) {
      var src = document.createElement('source');
      src.src = video.getAttribute('data-src');
      src.type = 'video/mp4';
      video.appendChild(src);
      video.addEventListener('canplay', function () { video.classList.add('on'); video.play().catch(function () {}); }, { once: true });
      video.load();
    }
  }

  /* Scroll-Reveal: Karten, Reihen, Abschnittsköpfe blenden beim Einscrollen ein */
  var sel = '.reveal, .section-head, .reason-row, .party-card, .teaser-card, .place-chip, .shop-box';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (reduced || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var t = e.target;
        t.classList.add('in');
        io.unobserve(t);
        /* nach dem Einblenden die Reveal-Klassen wieder entfernen: Hover-Übergänge der Karten bleiben unverzögert */
        t.addEventListener('transitionend', function done(ev) {
          if (ev.propertyName !== 'opacity') return;
          t.removeEventListener('transitionend', done);
          t.classList.remove('reveal', 'in');
          t.style.removeProperty('--d');
        });
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  /* Sicherheitsnetz: Inhalt nie dauerhaft unsichtbar lassen */
  setTimeout(function () { els.forEach(function (el) { if (el.classList.contains('reveal')) el.classList.add('in'); }); }, 2500);
  els.forEach(function (el, i) {
    if (el.classList.contains('in')) return;
    var parent = el.parentElement;
    var idx = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
    el.style.setProperty('--d', Math.min(idx, 3) * 60 + 'ms');
    el.classList.add('reveal');
    io.observe(el);
  });
})();
