/* Kontaktformular (afd-duderstadt.de): sendet per fetch ausschließlich an die in data-endpoint genannte Adresse
   (Software-Worker der Betreiber), kein Skript und keine Anfrage an Dritte. Ohne Endpunkt bleibt das Formular stumm. */
(function () {
  'use strict';
  var form = document.querySelector('[data-kontaktformular]');
  if (!form) return;
  var status = form.querySelector('[data-status]');
  var button = form.querySelector('button[type="submit"]');

  function say(text, ok) {
    status.textContent = text;
    status.setAttribute('data-state', ok ? 'ok' : 'fehler');
    status.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.hidden = true;
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    if (!/^https:\/\//.test(endpoint)) {
      say('Das Formular ist gerade nicht verfügbar. Bitte schreiben Sie uns direkt per E-Mail.', false);
      return;
    }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var data = {
      email: form.elements.email.value.trim(),
      nachricht: form.elements.nachricht.value.trim(),
      pruefnotiz: form.elements.pruefnotiz.value
    };
    var name = form.elements.name.value.trim();
    if (name) data.name = name;
    button.disabled = true;
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    }).then(function (r) {
      if (r.status === 429) throw new Error('rate');
      if (r.status === 400) throw new Error('eingabe');
      if (r.status === 403) throw new Error('verboten');
      if (r.status === 503) throw new Error('nicht-verfuegbar');
      if (!r.ok) throw new Error('fehler');
      form.reset();
      say('Danke, Ihre Nachricht ist angekommen. Wir antworten in der Regel innerhalb von 2 Werktagen.', true);
    }).catch(function (err) {
      var m = err && err.message;
      say(m === 'rate' ? 'Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es später noch einmal oder schreiben Sie uns per E-Mail.'
        : m === 'eingabe' ? 'Bitte prüfen Sie Ihre Angaben: E-Mail-Adresse und Nachricht.'
        : m === 'nicht-verfuegbar' ? 'Das Formular ist gerade nicht erreichbar. Bitte schreiben Sie uns direkt per E-Mail.'
        : 'Das Senden hat nicht geklappt. Bitte versuchen Sie es noch einmal oder schreiben Sie uns per E-Mail.', false);
    }).then(function () { button.disabled = false; });
  });
})();
