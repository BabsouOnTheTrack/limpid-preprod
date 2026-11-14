/* Limpid · Consentement SIGNATURE — correctif ciblé sur la base de production.
   Basic Consent Mode : aucun chargement GA4 sans accord explicite.
   Une seule catégorie facultative réellement présente : mesure GA4 du site/campagnes.
   Les choix historiques {c:"oui"|"non",d:timestamp} restent compatibles.
   Le retrait est disponible depuis les pieds de page sans modifier les formulaires. */
(function () {
  "use strict";
  var ID = "G-SQSB6Y6THZ";
  var CLE = "limpid_consent";
  var DUREE = 182 * 24 * 60 * 60 * 1000; /* ~6 mois */
  var charge = false;
  var stAjoute = false;
  /* Le panneau peut être testé sur un aperçu ; la mesure GA4 ne quitte jamais
     un hébergement de préproduction ni un fichier local. */
  function domaineOfficiel() {
    return window.location.protocol === "https:" &&
      ["limpid-nettoyage.fr", "www.limpid-nettoyage.fr"].indexOf(String(window.location.hostname || "").toLowerCase()) >= 0;
  }

  function lire() {
    try {
      var v = JSON.parse(localStorage.getItem(CLE) || "null");
      if (!v || typeof v.d !== "number" || v.d > Date.now() + 60000 || Date.now() - v.d > DUREE) return null;
      return v.c === "oui" || v.c === "non" ? v.c : null;
    } catch (e) { return null; }
  }
  function ecrire(c) {
    try { localStorage.setItem(CLE, JSON.stringify({ c: c, d: Date.now() })); } catch (e) {}
  }

  /* Les 4 paramètres Google sont définis AVANT tout gtag config/event.
     Pas de tag Ads/GTM distinct détecté dans les fichiers de cette version. */
  var etatRefus = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  };
  var etatAccord = {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "denied", /* aucun ciblage personnalisé proposé */
    analytics_storage: "granted"
  };
  function demarrerGA() {
    if (lire() !== "oui" || !domaineOfficiel()) return;
    if (charge) {
      if (typeof window.gtag === "function") window.gtag("consent", "update", etatAccord);
      return;
    }
    charge = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", Object.assign({
      functionality_storage: "granted", security_storage: "granted"
    }, etatRefus));
    window.gtag("consent", "update", etatAccord);
    window.gtag("js", new Date());
    window.gtag("config", ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
    document.head.appendChild(s);
    if (typeof window.limpidRejouer === "function") window.limpidRejouer();
  }

  function supprimerCookiesGA() {
    /* Effacement au mieux des cookies GA first-party accessibles sur ce domaine.
       L'effacement des données déjà transmises relève de la politique de confidentialité. */
    try {
      var host = location.hostname;
      var domaines = ["", "domain=" + host + ";", "domain=." + host + ";"];
      document.cookie.split(";").forEach(function (kv) {
        var nom = kv.split("=")[0].trim();
        if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(nom)) return;
        domaines.forEach(function (d) {
          document.cookie = nom + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;" + d + "SameSite=Lax";
        });
      });
    } catch (e) {}
  }

  function appliquer(c) {
    if (c !== "oui" && c !== "non") return;
    ecrire(c);
    if (c === "oui") {
      demarrerGA();
    } else {
      /* Le refus n'envoie pas les événements précédemment mis en attente. */
      if (typeof window.limpidViderEvenements === "function") window.limpidViderEvenements();
      var avaitCharge = charge;
      if (avaitCharge && typeof window.gtag === "function") window.gtag("consent", "update", etatRefus);
      supprimerCookiesGA();
      /* La suppression d'une balise déjà exécutée n'arrête pas son code.
         Un seul rechargement la retire réellement et respecte le choix enregistré. */
      if (avaitCharge && domaineOfficiel()) {
        window.location.reload();
        return;
      }
    }
    var panel = document.getElementById("limpid-cookies");
    if (panel) panel.remove();
  }

  var css = `
#limpid-cookies{box-sizing:border-box;position:fixed;z-index:9999;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));bottom:calc(12px + env(safe-area-inset-bottom));width:auto;max-width:1180px;margin-inline:auto;padding:15px 18px;background:#fff;color:#0B2545;border:1px solid #BBD6E9;border-radius:18px;box-shadow:0 12px 42px rgba(11,37,69,.18);font:400 13px/1.45 'Public Sans',system-ui,sans-serif;animation:limpidCookieIn .26s ease-out;max-height:calc(100dvh - 24px);overflow-y:auto;overscroll-behavior:contain}
#limpid-cookies *,#limpid-cookies *:before,#limpid-cookies *:after{box-sizing:border-box}
#limpid-cookies .lc-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,365px);gap:24px;align-items:center}
#limpid-cookies .lc-heading{font-size:16px;font-weight:800;letter-spacing:-.02em;margin:0 0 5px;color:#0B2545;line-height:1.25}
#limpid-cookies .lc-text{font-size:12.5px;line-height:1.55;color:#364C60;margin:0;max-width:650px}
#limpid-cookies .lc-buttons{display:grid;grid-template-columns:1fr 1.35fr;gap:8px;align-items:stretch}
#limpid-cookies button{font:700 12px/1.25 'Public Sans',system-ui,sans-serif;min-height:44px;border-radius:10px;padding:9px 10px;cursor:pointer;transition:background-color .16s,border-color .16s,color .16s,box-shadow .16s}
#limpid-cookies .lc-yes{background:#1A56DB;border:2px solid #1A56DB;color:#fff}
#limpid-cookies .lc-no{background:#EEF6FB;border:2px solid #1A56DB;color:#0B2545}
#limpid-cookies .lc-yes:hover{background:#0D45BD;border-color:#0D45BD}
#limpid-cookies .lc-no:hover{background:#DDEFFB}
#limpid-cookies .lc-customize{grid-column:1/-1;min-height:30px;padding:4px 6px;border:0;background:transparent;color:#1754B8;text-decoration:underline;text-underline-offset:3px;font-size:12px}
#limpid-cookies button:focus-visible,#limpid-cookies a:focus-visible,#limpid-cookies input:focus-visible{outline:3px solid #4CC9F0;outline-offset:2px}
#limpid-cookies .lc-preferences[hidden]{display:none!important}
#limpid-cookies .lc-preferences{border-top:1px solid #D3E5EF;margin-top:12px;padding-top:12px}
#limpid-cookies .lc-prefs-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#limpid-cookies .lc-pref{background:#F4F9FC;border:1px solid #D7EAF5;border-radius:12px;padding:11px 13px}
#limpid-cookies .lc-pref-head{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:800}
#limpid-cookies .lc-pref input{width:18px;height:18px;accent-color:#1A56DB;flex:none;margin:0}
#limpid-cookies .lc-pref p{font-size:11.7px;line-height:1.45;color:#364C60;margin:6px 0 0}
#limpid-cookies .lc-necessary{font-size:11px;font-weight:800;color:#16459A;margin-left:auto}
#limpid-cookies .lc-pref-actions{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:10px}
#limpid-cookies .lc-save{background:#0B2545;border:1px solid #0B2545;color:#fff;min-height:40px}
#limpid-cookies .lc-prefs-note{font-size:11px;color:#52687D;margin:0 auto 0 0}
#limpid-cookies a{color:#1A56DB}
@keyframes limpidCookieIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:800px){#limpid-cookies{left:max(9px,env(safe-area-inset-left));right:max(9px,env(safe-area-inset-right));bottom:calc(76px + env(safe-area-inset-bottom));max-width:485px;padding:12px 13px;border-radius:14px;max-height:min(48dvh,340px)}#limpid-cookies .lc-top{grid-template-columns:1fr;gap:10px}#limpid-cookies .lc-heading{font-size:14px;margin-bottom:4px}#limpid-cookies .lc-text{font-size:11.4px;line-height:1.45}#limpid-cookies .lc-buttons{gap:7px}#limpid-cookies button{font-size:11px;min-height:43px;padding:7px 6px}#limpid-cookies .lc-customize{min-height:26px;padding:1px 4px}#limpid-cookies .lc-prefs-grid{grid-template-columns:1fr;gap:8px}#limpid-cookies .lc-pref{padding:8px 10px}#limpid-cookies .lc-pref-actions{flex-wrap:wrap}#limpid-cookies .lc-prefs-note{width:100%}}
@media(max-height:540px){#limpid-cookies{max-height:calc(100dvh - 100px)}}
@media(prefers-reduced-motion:reduce){#limpid-cookies{animation:none}#limpid-cookies button{transition:none}}
`;

  function banniere(preferences) {
    if (!document.body) return;
    var existant = document.getElementById("limpid-cookies");
    if (existant) existant.remove();
    if (!stAjoute) {
      var st = document.createElement("style");
      st.id = "limpid-cookies-style";
      st.textContent = css;
      document.head.appendChild(st);
      stAjoute = true;
    }
    var d = document.createElement("section");
    d.id = "limpid-cookies";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-modal", "false");
    d.setAttribute("aria-label", "Vos choix concernant les cookies");
    d.innerHTML =
      '<div class="lc-top">' +
        '<div class="lc-content"><h2 class="lc-heading">Améliorons votre expérience</h2>' +
        '<p class="lc-text">Avec votre accord, nous utilisons des cookies pour comprendre comment notre site est utilisé et mesurer l’efficacité de nos campagnes. Votre choix n’empêche pas de demander un devis. <a href="/politique-confidentialite/">En savoir plus</a></p></div>' +
        '<div class="lc-buttons">' +
          '<button type="button" class="lc-yes" id="lc-oui">J’accepte</button>' +
          '<button type="button" class="lc-no" id="lc-non">Continuer sans accepter</button>' +
          '<button type="button" class="lc-customize" id="lc-custom" aria-expanded="false" aria-controls="lc-preferences">Personnaliser mes choix</button>' +
        '</div>' +
      '</div>' +
      '<div class="lc-preferences" id="lc-preferences" hidden>' +
        '<div class="lc-prefs-grid">' +
          '<div class="lc-pref"><div class="lc-pref-head">Cookies nécessaires <span class="lc-necessary">Toujours actifs</span></div>' +
            '<p>Ils permettent le fonctionnement du site et l’envoi de votre demande de devis. Ils ne servent pas à mesurer votre navigation.</p></div>' +
          '<div class="lc-pref"><label class="lc-pref-head" for="lc-mesure"><input type="checkbox" id="lc-mesure">Mesure d’audience et des campagnes</label>' +
            '<p>Google Analytics 4 mesure les visites et certaines étapes des configurateurs. La mesure Google liée aux campagnes n’est autorisée que si vous cochez cette option.</p></div>' +
        '</div><div class="lc-pref-actions">' +
          '<p class="lc-prefs-note">Vous pouvez modifier votre décision à tout moment via le pied de page.</p>' +
          '<button type="button" class="lc-save" id="lc-save">Enregistrer mes choix</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(d);
    var pref = d.querySelector("#lc-preferences");
    var choix = d.querySelector("#lc-mesure");
    var toggle = d.querySelector("#lc-custom");
    choix.checked = lire() === "oui";
    function afficherPreference(open) {
      pref.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) choix.focus({preventScroll:true});
    }
    d.querySelector("#lc-oui").addEventListener("click", function () { appliquer("oui"); });
    d.querySelector("#lc-non").addEventListener("click", function () { appliquer("non"); });
    d.querySelector("#lc-save").addEventListener("click", function () { appliquer(choix.checked ? "oui" : "non"); });
    toggle.addEventListener("click", function () { afficherPreference(pref.hidden); });
    if (preferences) afficherPreference(true);
  }

  /* API historique maintenue, mais ouvrir les préférences ne réinitialise plus
     le choix enregistré. Elle est utilisée par les liens du footer existants. */
  window.limpidCookies = function () { banniere(true); };
  window.limpidConsentement = function () {
    return domaineOfficiel() ? lire() : null;
  };

  /* ─── Diagnostic de terrain ───────────────────────────────────────────
     Quand GA4 n'affiche rien, trois causes possibles : le consentement est
     sur « non », le fichier servi est une vieille version en cache, ou le
     navigateur bloque Google. Cette fonction tranche en trois secondes.
     Depuis la console : limpidTest()
     Depuis un téléphone : ajouter ?limpid-debug=1 à l'adresse de la page. */
  var VERSION = "SIGNATURE-COOKIES-2026-11-10";

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
    /* Sans consentement accordé, le diagnostic ne contacte jamais Google. */
    if (!domaineOfficiel() || lire() !== "oui") {
      e["googletagmanager joignable"] = "non testé";
      e["google-analytics joignable"] = "non testé";
      e.verdict = e.choix === "non"
        ? "Le consentement est sur REFUS : rien ne part, et le test réseau n'est pas fait. Tapez limpidCookies() puis acceptez pour tester."
        : "Aucun choix enregistré : acceptez le bandeau pour lancer le test réseau. Aucun contact avec Google sans accord.";
      if (window.console) { if (console.table) console.table(e); console.log(e.verdict); }
      return Promise.resolve(e);
    }
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
        "<br>googletagmanager joignable : <b>" + (e["googletagmanager joignable"] === "non testé" ? "non testé" : e["googletagmanager joignable"] ? "oui" : "NON") + "</b>" +
        "<br>google-analytics joignable : <b>" + (e["google-analytics joignable"] === "non testé" ? "non testé" : e["google-analytics joignable"] ? "oui" : "NON") + "</b>" +
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
    banniere(false);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
