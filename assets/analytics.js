/* =====================================================================
   Cookieless page-view analytics (GoatCounter). Loaded on every page.

   OFF until you set GOATCOUNTER_CODE. With it empty, this file does
   nothing and no request leaves the visitor's browser.

   To turn it on:
     1. Sign up at https://www.goatcounter.com/ and pick a site code,
        e.g. "midwestmeshlab" -> https://midwestmeshlab.goatcounter.com
     2. Put that code below and push. That's it.

   Why GoatCounter: no cookies, no localStorage, no fingerprinting, no
   personal data stored. That is why the site has no cookie banner. If
   you ever swap in a tool that sets cookies (Google Analytics etc.),
   you then need a consent banner AND a privacy.html update.

   The CSP in netlify.toml already allows gc.zgo.at (script) and
   *.goatcounter.com (beacon). Keep the two in sync.
   ===================================================================== */
(function () {
  var GOATCOUNTER_CODE = '';               // <- your site code, e.g. 'midwestmeshlab'
  if (!GOATCOUNTER_CODE) return;
  // Respect Do Not Track / Global Privacy Control.
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + GOATCOUNTER_CODE + '.goatcounter.com/count');
  document.head.appendChild(s);
})();
