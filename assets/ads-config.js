/* afd-duderstadt.de — EINZIGE Konfigurationsstelle für Werbung (Google AdSense).
   Alle Werte, die nach der Einrichtung im AdSense-Konto eingetragen werden, stehen hier.

   CLIENT       Veröffentlicher-ID, Form ca-pub-<16 Ziffern> (AdSense > Konto > Kontoinformationen).
                Dieselbe ID steht in ads.txt und im Meta-Tag google-adsense-account.
   SLOTS        Anzeigenblock-IDs (Ziffern), je Position: oben = nach dem ersten Absatz, unten = Seitenende.
                Ungültige Werte ("PLATZHALTER") schalten den Platz stumm: keine Anfrage an Google, keine Lücke.
   CONSENT_TAG  Der Tag der Google-Einwilligungsmeldung "Einwilligung afd-duderstadt.de"
                (AdSense > Datenschutz & Mitteilungen > Meldung > Tag). Den <script>-Tag unverändert
                zwischen die Anführungszeichen kopieren.
                LEER  = kein Google-Skript; nur das eigene Cookie-Banner, Werbung erst nach "Werbung erlauben".
                GESETZT = Googles Meldung übernimmt die Einwilligung; Werbung erst nach Einwilligung
                (TCF v2.2: Zweck 1 und Anbieter Google, ID 755). Das eigene Banner erscheint nur als
                Rückfall, wenn Googles Meldung nach 4 Sekunden nicht geladen ist (z. B. Werbeblocker).
                Nur Skripte von den Google-Hosts in ERLAUBTE_HOSTS werden geladen; jeder andere Host
                im Tag wird verworfen und gilt als "nicht gesetzt". */
window.AFD_ADS = {
  CLIENT: 'ca-pub-9559534862346377',
  SLOTS: { oben: '7484974390', unten: 'PLATZHALTER' },
  CONSENT_TAG: '',
  ERLAUBTE_HOSTS: ['fundingchoicesmessages.google.com', 'fundingchoices.google.com',
                   'pagead2.googlesyndication.com', 'www.googletagservices.com']
};

/* Wird vor dem ersten Zeichnen ausgewertet (Skript steht im <head>):
   - html[data-cmp="google"] wenn CONSENT_TAG gültig ist,
   - Höhe der Anzeigenplätze vorab reservieren, wenn dieser Browser schon einmal zugestimmt hat
     (Merker afd-ads-vorab, den consent.js bei erteilter Einwilligung setzt), damit nichts springt. */
(function () {
  var c = window.AFD_ADS;
  var h = document.documentElement;
  var srcs = [];
  var tag = (c.CONSENT_TAG || '').trim();
  if (tag && /<script/i.test(tag)) {
    var ok = true;
    (tag.match(/https?:\/\/[a-z0-9.-]+[^\s"'<>]*/gi) || []).forEach(function (u) {
      var host = u.replace(/^https?:\/\//i, '').split(/[\/?#]/)[0].toLowerCase();
      if (c.ERLAUBTE_HOSTS.indexOf(host) === -1) ok = false; else srcs.push(u);
    });
    if (!ok || !srcs.length) srcs = [];
  }
  c.cmpSrcs = srcs;
  if (!srcs.length) return;
  h.setAttribute('data-cmp', 'google');
  var vorab = false;
  try { vorab = localStorage.getItem('afd-ads-vorab') === '1'; } catch (e) {}
  if (vorab && /^ca-pub-\d{16}$/.test(c.CLIENT || '')) {
    Object.keys(c.SLOTS || {}).forEach(function (pos) {
      if (/^\d{6,15}$/.test(c.SLOTS[pos] || '')) h.setAttribute('data-ads-' + pos, '1');
    });
  }
})();
