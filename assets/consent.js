/* afd-duderstadt.de — Cookie-Consent und Werbung (Google AdSense).
   Alle Werbewerte stehen in assets/ads-config.js (einzige Konfigurationsstelle).
   Modus 'eigen': Werbeskripte laden erst NACH ausdrücklicher Einwilligung im eigenen Banner.
   Modus 'tcf':   Google Funding Choices (TCF v2.2) übernimmt die Einwilligung, das eigene Banner bleibt aus.
   Speicherung im Modus 'eigen': localStorage + 1st-party-Cookie (12 Monate). */
(function () {
  'use strict';

  var CFG = window.AFD_ADS || {};
  var KEY = 'afd-consent';          // 'accept' | 'reject'
  var MAXAGE = 60 * 60 * 24 * 365;  // 12 Monate

  var CLIENT_OK = /^ca-pub-\d{16}$/.test(CFG.CLIENT || '');
  var TCF = CFG.MODUS === 'tcf' && CLIENT_OK;

  function slotId(pos) {
    var s = (CFG.SLOTS || {})[pos];
    return /^\d{6,15}$/.test(s || '') ? s : null;
  }

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

  /* Anzeigenplätze befüllen: je Position ein <ins>, Werte nur aus ads-config.js. */
  function renderSlots() {
    if (!CLIENT_OK) return false;
    var any = false;
    Array.prototype.forEach.call(document.querySelectorAll('[data-ad-position]'), function (box) {
      var id = slotId(box.getAttribute('data-ad-position'));
      if (!id || box.querySelector('ins.adsbygoogle')) return;
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.setAttribute('data-ad-client', CFG.CLIENT);
      ins.setAttribute('data-ad-slot', id);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      box.appendChild(ins);
      box.hidden = false;
      any = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
    return any;
  }

  function loadSdk() {
    if (!CLIENT_OK || document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(CFG.CLIENT);
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  /* Modus 'tcf': Funding-Choices-Skript plus Signal-Iframe (Googles Standardeinbindung). */
  function ladeFundingChoices() {
    if (document.querySelector('script[src*="fundingchoicesmessages.google.com/i/"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://fundingchoicesmessages.google.com/i/' + encodeURIComponent(CFG.CLIENT.replace(/^ca-/, '')) + '?ers=1';
    document.head.appendChild(s);
    (function signal() {
      if (window.frames['googlefcPresent']) return;
      if (document.body) {
        var f = document.createElement('iframe');
        f.style.cssText = 'width:0;height:0;border:none;position:absolute;left:-1000px;top:-1000px;display:none';
        f.name = 'googlefcPresent';
        f.setAttribute('aria-hidden', 'true');
        f.tabIndex = -1;
        document.body.appendChild(f);
      } else { setTimeout(signal, 0); }
    })();
  }

  function zeigeWerbung() {
    document.documentElement.setAttribute('data-consent', 'marketing');
    if (renderSlots()) loadSdk();
  }

  function apply(v) {
    if (v === 'accept') zeigeWerbung();
    else document.documentElement.setAttribute('data-consent', 'essential');
  }

  function choose(v) { set(v); apply(v); closeBanner(); }

  function boot() {
    if (TCF) {
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      Array.prototype.forEach.call(document.querySelectorAll('[data-cookie-settings]'), function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault();
          window.googlefc.callbackQueue.push({ CONSENT_API_READY: function () { window.googlefc.showRevocationMessage(); } });
        });
      });
      ladeFundingChoices();
      zeigeWerbung();
      return;
    }

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
