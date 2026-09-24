document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('hamburgerBtn');
  var menu = document.getElementById('mobileMenu');
  var closeBtn = document.getElementById('mobileMenuClose');
  if (!btn || !menu) return;

  // Geschlossen ist das Menü nicht fokussierbar (inert) — sonst landet die Tastatur in einem unsichtbaren Overlay.
  function open() {
    menu.inert = false;
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    var warOffen = menu.classList.contains('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.inert = true;
    // Fokus zurück auf den Knopf, der das Menü geöffnet hat (nur wenn es wirklich offen war)
    if (warOffen && btn.offsetParent !== null) btn.focus();
  }
  menu.inert = true;

  btn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  // Overlay schließt sich auch, wenn der Bildschirm wieder breiter wird (z. B. Tablet-Rotation)
  window.addEventListener('resize', function () { if (window.innerWidth > 640) close(); });
});
