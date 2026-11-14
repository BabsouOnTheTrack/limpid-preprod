/* Limpid · tunnels Google Ads
   1. Capture des identifiants de clic et des paramètres UTM à l'arrivée,
      conservation pendant la session, injection dans les formulaires dédiés.
   2. Événements de suivi envoyés à GA4 seulement quand la mesure a été
      acceptée. Sans consentement, rien n'est envoyé nulle part.
      Minimisation (22/10/2026) : aucun identifiant publicitaire (gclid,
      gbraid, wbraid...), aucune UTM et aucun numéro de téléphone dans les
      événements. GA4 attribue la visite par lui-même ; ces informations
      restent dans le courriel de demande et le code d'import, pas dans GA4.
      Plus d'écriture dans le dataLayer : seul gtag, chargé après accord.
   Ce fichier ne dépose aucun cookie : sessionStorage seulement, effacé
   à la fermeture de l'onglet. */
(function () {
  "use strict";

  var CLE = "limpid_campagne";
  var CLICS = ["gclid", "gbraid", "wbraid", "msclkid", "fbclid"];
  var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  /* ---------- 1. Capture et conservation ---------- */
  function lire() {
    try { return JSON.parse(sessionStorage.getItem(CLE) || "{}"); }
    catch (e) { return {}; }
  }
  function ecrire(o) {
    try { sessionStorage.setItem(CLE, JSON.stringify(o)); } catch (e) {}
  }

  function capturer() {
    var u;
    try { u = new URLSearchParams(window.location.search); } catch (e) { return lire(); }
    var d = lire();
    var neuf = false;
    CLICS.concat(UTM).forEach(function (k) {
      var v = u.get(k);
      if (v) { d[k] = v.slice(0, 200); neuf = true; }
    });
    /* La première page vue et le référent ne servent qu'au diagnostic
       quand une campagne ne convertit pas comme prévu. */
    if (neuf || !d.arrivee) {
      if (!d.arrivee) d.arrivee = window.location.pathname;
      if (!d.referent) d.referent = document.referrer ? document.referrer.slice(0, 200) : "direct";
      if (!d.date) d.date = new Date().toISOString().slice(0, 16).replace("T", " ");
      ecrire(d);
    }
    return d;
  }

  var donnees = capturer();

  /* Résumé lisible dans le courriel reçu, plutôt qu'une ligne par paramètre. */
  function resume() {
    var p = [];
    CLICS.concat(UTM).forEach(function (k) { if (donnees[k]) p.push(k + "=" + donnees[k]); });
    if (!p.length) return "aucun (visite directe ou naturelle)";
    return p.join(" | ");
  }

  function remplirFormulaires() {
    var fs = document.querySelectorAll("form[data-campagne]");
    for (var i = 0; i < fs.length; i++) {
      var f = fs[i];
      if (f.getAttribute("data-campagne-ok")) continue;
      f.setAttribute("data-campagne-ok", "1");
      ajouter(f, "origine_campagne", resume());
      ajouter(f, "page_arrivee", donnees.arrivee || window.location.pathname);
      ajouter(f, "premiere_visite", donnees.date || "");
      ajouter(f, "referent", donnees.referent || "");
      CLICS.forEach(function (k) { if (donnees[k]) ajouter(f, k, donnees[k]); });
      UTM.forEach(function (k) { if (donnees[k]) ajouter(f, k, donnees[k]); });
    }
  }
  function ajouter(f, nom, val) {
    var e = document.createElement("input");
    e.type = "hidden"; e.name = nom; e.value = val;
    f.appendChild(e);
  }

  /* ---------- 2. Événements ---------- */

  /* Les événements facultatifs ne sont PAS conservés avant consentement.
     Une file peut exister uniquement pour un visiteur ayant déjà accepté,
     lorsque la balise GA4 n'est pas encore prête. */
  var file = [];
  try {
    if (typeof window.limpidConsentement === "function" && window.limpidConsentement() === "oui") {
      file = JSON.parse(sessionStorage.getItem("limpid_file") || "[]");
      if (!Array.isArray(file)) file = [];
    } else { sessionStorage.removeItem("limpid_file"); }
  } catch (e) { file = []; }
  function sauverFile() {
    try { sessionStorage.setItem("limpid_file", JSON.stringify(file.slice(-20))); } catch (e) {}
  }

  function versGA(nom, params) {
    if (typeof window.gtag === "function") { window.gtag("event", nom, params); return true; }
    return false;
  }

  /* Conversions métier réservées au domaine officiel (correctif du 22/10/2026).
     Sur tout autre domaine (préproduction, Worker, *.pages.dev, localhost),
     vitres_lead, menage_lead et b2b_lead ne partent jamais, ni tout de suite,
     ni depuis la file d'attente rejouée après consentement. Les événements
     analytiques (config_*, config_test_lead...) restent envoyés partout. */
  var DOMAINES_OFFICIELS = ["limpid-nettoyage.fr", "www.limpid-nettoyage.fr"];
  var CONVERSIONS_METIER = ["vitres_lead", "menage_lead", "b2b_lead", "configurateur_envoi"];
  function domaineOfficiel() {
    var h = "";
    try { h = String(window.location.hostname || "").toLowerCase(); } catch (e) {}
    return DOMAINES_OFFICIELS.indexOf(h) >= 0;
  }
  function autorise(nom) {
    if (CONVERSIONS_METIER.indexOf(nom) < 0) return true;
    if (domaineOfficiel()) return true;
    try { if (window.console) console.info("[Limpid] " + nom + " bloqué : domaine non officiel (" + window.location.hostname + ")"); } catch (e) {}
    return false;
  }

  /* Paramètres jamais transmis, même si un appelant les fournit. */
  var INTERDITS = CLICS.concat(UTM, ["numero", "telephone", "tel", "email", "nom", "adresse"]);
  function evenement(nom, extra) {
    if (!autorise(nom)) return;
    /* Aucun événement GA4 ni attente de mesure avant un accord valide. */
    if (typeof window.limpidConsentement !== "function" || window.limpidConsentement() !== "oui") return;
    var p = {};
    if (extra) for (var k in extra) { if (INTERDITS.indexOf(k) < 0) p[k] = extra[k]; }
    if (!versGA(nom, p)) { file.push([nom, p]); sauverFile(); }
  }
  window.limpidEvenement = evenement;
  window.limpidViderEvenements = function () {
    file = [];
    try { sessionStorage.removeItem("limpid_file"); } catch (e) {}
  };

  window.limpidRejouer = function () {
    if (typeof window.limpidConsentement !== "function" || window.limpidConsentement() !== "oui") return;
    if (!file.length) return;
    for (var i = 0; i < file.length; i++) { if (autorise(file[i][0])) versGA(file[i][0], file[i][1]); }
    file = []; sauverFile();
  };

  /* Marqueur posé à l'envoi, relu sur la page de remerciement : il
     garantit qu'une conversion n'est comptée qu'après un vrai envoi,
     et une seule fois même si la page est rechargée ou partagée. */
  function marquer(tunnel) {
    try { sessionStorage.setItem("limpid_envoi", JSON.stringify({ tunnel: tunnel, date: Date.now() })); } catch (e) {}
  }
  window.limpidConversion = function (nom) {
    var raw, preuve;
    try { raw = sessionStorage.getItem("limpid_envoi"); } catch (e) { raw = null; }
    if (!raw) return false;
    /* Ne jamais laisser un ancien marqueur ou un autre formulaire déclencher une fausse conversion. */
    try { preuve = JSON.parse(raw); } catch (e) { preuve = null; }
    try { sessionStorage.removeItem("limpid_envoi"); } catch (e) {}
    if (!preuve || typeof preuve !== "object" || !preuve.tunnel ||
        !Number.isFinite(preuve.date) || preuve.date > Date.now() + 60000 ||
        Date.now() - preuve.date > 20 * 60 * 1000) return false;
    var attendu = { menage_lead: "menage", vitres_lead: "vitres", b2b_lead: "b2b" }[nom];
    if (!attendu || preuve.tunnel !== attendu) return false;
    evenement(nom, { tunnel: attendu });
    return true;
  };

  function brancher() {
    remplirFormulaires();

    var fs = document.querySelectorAll("form[data-tunnel]");
    for (var i = 0; i < fs.length; i++) {
      (function (f) {
        f.addEventListener("submit", function () {
          var t = f.getAttribute("data-tunnel") || "b2b";
          marquer(t);
          evenement(t + "_form_submit");
        });
      })(fs[i]);
    }

    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var h = a.getAttribute("href") || "";
      var t = a.getAttribute("data-tunnel") || document.body.getAttribute("data-tunnel") || "";
      var tun = t || "b2b";
      if (h.indexOf("tel:") === 0) {
        evenement(tun + "_phone_click");
      } else if (h.indexOf("wa.me") > -1 || h.indexOf("whatsapp") > -1) {
        evenement(tun + "_whatsapp_click");
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", brancher);
  } else { brancher(); }
})();
