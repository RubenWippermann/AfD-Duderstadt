document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('hamburgerBtn');
  var menu = document.getElementById('mobileMenu');
  var closeBtn = document.getElementById('mobileMenuClose');
  if (!btn || !menu) return;

  function open() {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }
  function close() {
    menu.classList.remove('open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  // Overlay schließt sich auch, wenn der Bildschirm wieder breiter wird (z. B. Tablet-Rotation)
  window.addEventListener('resize', function () { if (window.innerWidth > 640) close(); });
});
