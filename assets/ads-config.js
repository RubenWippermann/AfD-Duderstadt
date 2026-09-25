/* afd-duderstadt.de — EINZIGE Konfigurationsstelle für Werbung (Google AdSense).
   Hier stehen alle Werte, die nach der Einrichtung im AdSense-Konto eingetragen werden.
   Anzeigen erscheinen nur, wenn die Werte gültig sind; Platzhalter ("PLATZHALTER")
   schalten den jeweiligen Platz stumm, es gibt dann keine Anfrage an Google und keine Lücke.

   MODUS
     'eigen' = eigenes Cookie-Banner, AdSense lädt erst nach "Werbung erlauben" (bisheriges Verhalten).
               Achtung: Google liefert im EWR/UK/CH Anzeigen nur mit einer TCF-v2.2-zertifizierten
               Einwilligungslösung aus. Mit 'eigen' ist daher mit leeren Anzeigenplätzen zu rechnen.
     'tcf'   = Google Funding Choices (kostenlose, von Google zertifizierte TCF-v2.2-Einwilligungslösung).
               Voraussetzung: im AdSense-Konto unter "Datenschutz & Mitteilungen" ist die
               Einwilligungsnachricht für diese Website veröffentlicht (siehe AFD-ADSENSE-PRUEFLISTE).
               Dann ersetzt Googles Nachricht das eigene Banner; "Cookie-Einstellungen" im Fuß öffnet sie erneut.

   CLIENT  Veröffentlicher-ID, Form ca-pub-<16 Ziffern> (AdSense > Konto > Kontoinformationen).
           Derselbe Wert steht in ads.txt (google.com, pub-<16 Ziffern>, DIRECT, f08c47fec0942fa0).
   SLOTS   Anzeigenblock-IDs (10 Ziffern), je Position: oben = nach dem ersten Absatz, unten = Seitenende. */
window.AFD_ADS = {
  MODUS: 'eigen',
  CLIENT: 'ca-pub-9559534862346377',
  SLOTS: { oben: '7484974390', unten: 'PLATZHALTER' }
};

/* Höhe schon vor dem Laden reservieren (kein Layoutsprung), aber nur im Modus 'tcf':
   dort erscheinen die Plätze ohne Klick. Im Modus 'eigen' übernimmt das consent.js nach der Wahl. */
(function () {
  var c = window.AFD_ADS;
  if (c && c.MODUS === 'tcf' && /^ca-pub-\d{16}$/.test(c.CLIENT || '')) {
    var h = document.documentElement;
    h.setAttribute('data-ads', 'tcf');
    Object.keys(c.SLOTS || {}).forEach(function (pos) {
      if (/^\d{6,15}$/.test(c.SLOTS[pos] || '')) h.setAttribute('data-ads-' + pos, '1');
    });
  }
})();
