/* afd-duderstadt.de — Cookie-Consent und Werbung (Google AdSense).
   Alle Werbewerte und der Tag der Google-Einwilligungsmeldung stehen in assets/ads-config.js.
   Ohne CONSENT_TAG: eigenes Banner, Werbeskripte laden erst NACH ausdrücklicher Einwilligung.
   Mit CONSENT_TAG (html[data-cmp="google"]): Google fragt und speichert (TCF v2.2); Werbung erst,
   wenn der TCF-String Zweck 1 und den Anbieter Google (ID 755) bestätigt. Das eigene Banner ist dann
   nur Rückfall, wenn window.__tcfapi nach 4 s fehlt (z. B. Werbeblocker).
   Speicherung des eigenen Banners: localStorage + 1st-party-Cookie (12 Monate). */
(function () {
  'use strict';

  var CFG = window.AFD_ADS || {};
  var KEY = 'afd-consent';          // 'accept' | 'reject'
  var VORAB = 'afd-ads-vorab';      // '1' = Werbung war zugestimmt (nur für die Höhenreservierung)
  var MAXAGE = 60 * 60 * 24 * 365;  // 12 Monate
  var GOOGLE_VENDOR = 755;

  var CLIENT_OK = /^ca-pub-\d{16}$/.test(CFG.CLIENT || '');
  var cmpGoogle = document.documentElement.getAttribute('data-cmp') === 'google';

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

  function vorab(an) {
    try { if (an) localStorage.setItem(VORAB, '1'); else localStorage.removeItem(VORAB); } catch (e) {}
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

  function enableMarketing() {
    document.documentElement.setAttribute('data-consent', 'marketing');
    if (renderSlots()) loadSdk();
  }

  function apply(v) {
    if (v === 'accept') enableMarketing();
    else document.documentElement.setAttribute('data-consent', 'essential');
  }

  function choose(v) { set(v); apply(v); closeBanner(); }

  function bindBanner() {
    if (!banner) return;
    var a = banner.querySelector('[data-cc="accept"]');
    var r = banner.querySelector('[data-cc="reject"]');
    if (a) a.addEventListener('click', function () { choose('accept'); });
    if (r) r.addEventListener('click', function () { choose('reject'); });
  }

  /* Googles Meldung laden: nur die geprüften Skript-Adressen aus ads-config.js (Host-Wächter dort),
     dazu das Signal-Iframe, das Googles Meldung erwartet. */
  function ladeGoogleMeldung() {
    (CFG.cmpSrcs || []).forEach(function (src) {
      if (document.querySelector('script[src="' + src.replace(/"/g, '') + '"]')) return;
      var s = document.createElement('script');
      s.async = true;
      s.src = src;
      document.head.appendChild(s);
    });
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

  function tcfGranted(d) {
    if (d && d.gdprApplies === false) return true;
    return !!(d && d.purpose && d.purpose.consents && d.purpose.consents[1] &&
      d.vendor && d.vendor.consents && d.vendor.consents[GOOGLE_VENDOR]);
  }

  function bootGoogle() {
    ladeGoogleMeldung();
    var t0 = Date.now(), done = false;
    function rueckfall() {
      if (done) return;
      done = true;
      var cur = get();
      if (cur === 'accept' || cur === 'reject') apply(cur); else openBanner();
    }
    (function warte() {
      if (typeof window.__tcfapi === 'function') {
        done = true;
        window.__tcfapi('addEventListener', 2, function (d, ok) {
          if (!ok || !d) return;
          if (d.eventStatus === 'tcloaded' || d.eventStatus === 'useractioncomplete') {
            if (tcfGranted(d)) { vorab(true); enableMarketing(); }
            else { vorab(false); document.documentElement.setAttribute('data-consent', 'essential'); }
          }
        });
      } else if (Date.now() - t0 > 4000) rueckfall();
      else setTimeout(warte, 200);
    })();
    Array.prototype.forEach.call(document.querySelectorAll('[data-cookie-settings]'), function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.googlefc && window.googlefc.callbackQueue) {
          window.googlefc.callbackQueue.push({ CONSENT_API_READY: function () {
            if (typeof window.googlefc.showRevocationMessage === 'function') window.googlefc.showRevocationMessage();
          } });
        } else openBanner();
      });
    });
    bindBanner();
  }

  function boot() {
    if (cmpGoogle) {
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      bootGoogle();
      return;
    }
    bindBanner();
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
