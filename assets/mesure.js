/* Limpid · mesure d'audience et mesure publicitaire, sous consentement
   Identifiant GA4 : G-SQSB6Y6THZ
   Mode de consentement retenu : « basic consent mode ». Le script Google
   n'est pas chargé du tout tant que le visiteur n'a pas accepté. Aucun
   ping, aucun cookie, aucune requête. C'est la lecture la plus stricte
   des règles de la CNIL, et celle qui se défend sans discussion.
   Choix conservé 6 mois, modifiable à tout moment via limpidCookies(). */
(function () {
  "use strict";
  var ID = "G-SQSB6Y6THZ";
  var CLE = "limpid_consent";
  var DUREE = 182 * 24 * 60 * 60 * 1000; /* 6 mois */

  function lire() {
    try {
      var v = JSON.parse(localStorage.getItem(CLE) || "null");
      if (!v || !v.d || Date.now() - v.d > DUREE) return null;
      return v.c;
    } catch (e) { return null; }
  }
  function ecrire(c) {
    try { localStorage.setItem(CLE, JSON.stringify({ c: c, d: Date.now() })); } catch (e) {}
  }

  var charge = false;
  function demarrerGA() {
    if (charge) return;
    charge = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    /* Consent Mode v2 : on déclare l'état refusé, puis on l'accorde
       immédiatement, puisque ce code ne s'exécute qu'après acceptation. */
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted"
    });
    gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    });
    gtag("config", ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
    document.head.appendChild(s);
    /* Les événements mis en file avant l'acceptation partent maintenant. */
    if (typeof window.limpidRejouer === "function") window.limpidRejouer();
  }

  var css = '#limpid-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
    'background:#fff;color:#0B2545;border:1px solid #CFE3F1;border-radius:14px;' +
    'box-shadow:0 10px 36px rgba(11,37,69,.18);padding:16px 18px;max-width:560px;' +
    "margin:0 auto;font-family:'Public Sans',system-ui,sans-serif;font-size:.93rem;line-height:1.55}" +
    '#limpid-cookies p{margin:0 0 12px}' +
    '#limpid-cookies a{color:#1A56DB}' +
    '#limpid-cookies .b{display:flex;gap:9px;flex-wrap:wrap}' +
    '#limpid-cookies button{font-family:inherit;font-size:.9rem;font-weight:700;cursor:pointer;' +
    'border-radius:99px;padding:11px 20px;min-height:44px;border:1px solid #CFE3F1;background:#fff;color:#0B2545}' +
    '#limpid-cookies button.oui{background:#1A56DB;border-color:#1A56DB;color:#fff}' +
    '#limpid-cookies button:hover{filter:brightness(.95)}' +
    '@media(max-width:820px){#limpid-cookies{bottom:74px}}';

  function banniere() {
    if (document.getElementById("limpid-cookies")) return;
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    var d = document.createElement("div");
    d.id = "limpid-cookies";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Mesure d'audience et de publicité");
    d.innerHTML =
      '<p>Nous aimerions mesurer la fréquentation de ce site et savoir quelles annonces ' +
      'vous y ont amené, pour l\'améliorer et ne pas dépenser en publicité inutilement. ' +
      'Cela dépose des cookies de mesure. Aucun profilage, aucune revente de données. ' +
      '<a href="/politique-confidentialite/">En savoir plus</a></p>' +
      '<div class="b"><button type="button" class="oui" id="lc-oui">Accepter</button>' +
      '<button type="button" id="lc-non">Refuser</button></div>';
    document.body.appendChild(d);
    document.getElementById("lc-oui").addEventListener("click", function () {
      ecrire("oui"); d.remove(); demarrerGA();
    });
    document.getElementById("lc-non").addEventListener("click", function () {
      ecrire("non"); d.remove();
    });
  }

  window.limpidCookies = function () {
    try { localStorage.removeItem(CLE); } catch (e) {}
    var e = document.getElementById("limpid-cookies");
    if (e) e.remove();
    banniere();
  };
  window.limpidConsentement = function () { return lire(); };


  /* ─── Diagnostic de terrain ───────────────────────────────────────────
     Quand GA4 n'affiche rien, trois causes possibles : le consentement est
     sur « non », le fichier servi est une vieille version en cache, ou le
     navigateur bloque Google. Cette fonction tranche en trois secondes.
     Depuis la console : limpidTest()
     Depuis un téléphone : ajouter ?limpid-debug=1 à l'adresse de la page. */
  var VERSION = "2026-10-04";

  function joindre(url) {
    try {
      return fetch(url, { mode: "no-cors", cache: "no-store" })
        .then(function () { return true; })
        .catch(function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  function etatBase() {
    var brut = null;
    try { brut = localStorage.getItem(CLE); } catch (e) {}
    var balise = null;
    for (var i = 0; i < document.scripts.length; i++) {
      if (/googletagmanager\.com\/gtag\/js/.test(document.scripts[i].src)) balise = document.scripts[i].src;
    }
    return {
      version: VERSION,
      choix: lire() || "aucun (le bandeau devrait s'afficher)",
      brut: brut,
      balise: balise || "AUCUNE",
      gtag: typeof window.gtag === "function",
      identifiant: ID
    };
  }
  window.limpidEtat = function () {
    var e = etatBase();
    if (window.console && console.table) console.table(e); else if (window.console) console.log(e);
    return e;
  };

  window.limpidTest = function () {
    var e = etatBase();
    return Promise.all([
      joindre("https://www.googletagmanager.com/gtag/js?id=" + ID + "&_t=" + Date.now()),
      joindre("https://www.google-analytics.com/g/collect?v=2&tid=" + ID + "&_t=" + Date.now())
    ]).then(function (r) {
      e["googletagmanager joignable"] = r[0];
      e["google-analytics joignable"] = r[1];
      var verdict;
      if (!r[0] || !r[1]) verdict = "BLOQUÉ par le navigateur (bloqueur de publicité, protection anti-pistage ou VPN). Testez en navigation privée sans extension.";
      else if (e.choix === "non") verdict = "Le consentement est sur REFUS : rien ne part. Tapez limpidCookies() puis acceptez.";
      else if (e.choix.indexOf("aucun") === 0) verdict = "Aucun choix enregistré : le bandeau doit s'afficher, acceptez-le.";
      else if (e.balise === "AUCUNE") verdict = "Consentement accepté mais la balise n'est pas chargée : rechargez la page.";
      else verdict = "Tout est bon côté site. Si GA4 n'affiche rien, regardez du côté de la propriété : filtre de trafic interne actif, ou mauvaise propriété ouverte.";
      e.verdict = verdict;
      if (window.console) { if (console.table) console.table(e); console.log(verdict); }
      return e;
    });
  };

  /* Panneau visible, pour diagnostiquer depuis un téléphone sans console. */
  function panneauDebug() {
    var d = document.createElement("div");
    d.setAttribute("style", "position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#0B2545;color:#EAF4FA;" +
      "font:13px/1.5 system-ui,sans-serif;padding:14px 16px;border-radius:12px;box-shadow:0 10px 36px rgba(0,0,0,.35);max-width:520px;margin:0 auto");
    d.innerHTML = "<b>Diagnostic Limpid</b><br>Test en cours…";
    document.body.appendChild(d);
    window.limpidTest().then(function (e) {
      d.innerHTML = "<b>Diagnostic Limpid</b> · version " + e.version +
        "<br>Consentement : <b>" + e.choix + "</b>" +
        "<br>Balise dans la page : <b>" + (e.balise === "AUCUNE" ? "AUCUNE" : "oui") + "</b>" +
        "<br>googletagmanager joignable : <b>" + (e["googletagmanager joignable"] ? "oui" : "NON") + "</b>" +
        "<br>google-analytics joignable : <b>" + (e["google-analytics joignable"] ? "oui" : "NON") + "</b>" +
        "<br><br>" + e.verdict +
        "<br><br><button type=\"button\" style=\"font:inherit;padding:8px 14px;border-radius:99px;border:0;background:#4CC9F0;color:#0B2545;font-weight:700\" onclick=\"this.closest('div').remove()\">Fermer</button>";
    });
  }

  function init() {
    try {
      if (/[?&]limpid-debug=1/.test(window.location.search)) setTimeout(panneauDebug, 400);
    } catch (e) {}
    var c = lire();
    if (c === "oui") { demarrerGA(); return; }
    if (c === "non") return;
    banniere();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
