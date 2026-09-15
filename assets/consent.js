/* afd-duderstadt.de — Cookie-Consent (essenziell vs. Marketing).
   Marketing-/Werbeskripte (AdSense) werden erst NACH ausdrücklicher Einwilligung geladen.
   Speicherung: localStorage + 1st-party-Cookie (12 Monate). Muster von erstehilfekurse.online. */
(function () {
  'use strict';

  var KEY = 'afd-consent';          // 'accept' | 'reject'
  var MAXAGE = 60 * 60 * 24 * 365;  // 12 Monate

  /* AD_NETWORK_AKTIV: harter Schalter, unabhängig vom Consent-Status. Solange false,
     lädt das AdSense-SDK NIE, egal was der Besucher wählt — auch bei "Werbung erlauben".
     Wird erst auf true gesetzt, wenn die rechtliche Prüfung für diese politische Domain
     abgeschlossen ist (Jurist-Session, Stand 15.09.: noch offen). Muster wie
     erstehilfekurse.online. */
  var AD_NETWORK_AKTIV = false;

  function get() {
    try { return localStorage.getItem(KEY); } catch (e) {}
    var m = /(?:^|;\s*)afd_consent=([^;]+)/.exec(document.cookie);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function set(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    document.cookie = 'afd_consent=' + encodeURIComponent(v) + ';max-age=' + MAXAGE +
      ';path=/;samesite=lax';
  }

  var banner = document.querySelector('[data-cc-banner]');

  function openBanner() { if (banner) { banner.hidden = false; document.body.classList.add('cc-open'); } }
  function closeBanner() { if (banner) { banner.hidden = true; document.body.classList.remove('cc-open'); } }

  function enableMarketing() {
    document.documentElement.setAttribute('data-consent', 'marketing');
    var slots = document.querySelectorAll('[data-ad-consent]');
    Array.prototype.forEach.call(slots, function (el) {
      el.classList.add('consented');
    });
    if (AD_NETWORK_AKTIV && slots.length && !document.querySelector('script[data-adsense-sdk]')) {
      var ins = document.querySelector('ins.adsbygoogle[data-ad-client]');
      var client = ins && ins.getAttribute('data-ad-client');
      if (client) {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client);
        s.crossOrigin = 'anonymous';
        s.setAttribute('data-adsense-sdk', '1');
        document.head.appendChild(s);
      }
    }
  }

  function apply(v) {
    if (v === 'accept') enableMarketing();
    else document.documentElement.setAttribute('data-consent', 'essential');
  }

  function choose(v) { set(v); apply(v); closeBanner(); }

  function boot() {
    if (banner) {
      var a = banner.querySelector('[data-cc="accept"]');
      var r = banner.querySelector('[data-cc="reject"]');
      if (a) a.addEventListener('click', function () { choose('accept'); });
      if (r) r.addEventListener('click', function () { choose('reject'); });
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-cookie-settings]'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); openBanner(); });
    });

    var cur = get();
    if (cur === 'accept' || cur === 'reject') { apply(cur); }
    else { openBanner(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
