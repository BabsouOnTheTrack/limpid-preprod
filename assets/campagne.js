/* Limpid · tunnels Google Ads
   1. Capture des identifiants de clic et des paramètres UTM à l'arrivée,
      conservation pendant la session, injection dans les formulaires dédiés.
   2. Événements de suivi envoyés au dataLayer et à GA4 quand la mesure
      a été acceptée. Sans consentement, rien n'est envoyé nulle part.
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
  window.dataLayer = window.dataLayer || [];

  /* Un visiteur venu d'une annonce peut envoyer le formulaire avant
     d'avoir répondu au bandeau. L'événement est alors mis de côté et
     part si la mesure est acceptée ensuite, dans la même session. */
  var file = [];
  try {
    file = JSON.parse(sessionStorage.getItem("limpid_file") || "[]");
  } catch (e) { file = []; }
  function sauverFile() {
    try { sessionStorage.setItem("limpid_file", JSON.stringify(file.slice(-20))); } catch (e) {}
  }

  function versGA(nom, params) {
    if (typeof window.gtag === "function") { window.gtag("event", nom, params); return true; }
    return false;
  }

  function evenement(nom, extra) {
    var d = { event: nom };
    if (extra) for (var k in extra) d[k] = extra[k];
    CLICS.forEach(function (k) { if (donnees[k]) d[k] = donnees[k]; });
    if (donnees.utm_campaign) d.utm_campaign = donnees.utm_campaign;
    if (donnees.utm_source) d.utm_source = donnees.utm_source;
    window.dataLayer.push(d);
    var p = {};
    for (var j in d) { if (j !== "event") p[j] = d[j]; }
    if (!versGA(nom, p)) { file.push([nom, p]); sauverFile(); }
  }
  window.limpidEvenement = evenement;

  window.limpidRejouer = function () {
    if (!file.length) return;
    for (var i = 0; i < file.length; i++) versGA(file[i][0], file[i][1]);
    file = []; sauverFile();
  };

  /* Marqueur posé à l'envoi, relu sur la page de remerciement : il
     garantit qu'une conversion n'est comptée qu'après un vrai envoi,
     et une seule fois même si la page est rechargée ou partagée. */
  function marquer(tunnel) {
    try { sessionStorage.setItem("limpid_envoi", tunnel); } catch (e) {}
  }
  window.limpidConversion = function (nom) {
    var t;
    try { t = sessionStorage.getItem("limpid_envoi"); } catch (e) { t = null; }
    if (!t) return false;
    try { sessionStorage.removeItem("limpid_envoi"); } catch (e) {}
    evenement(nom, { tunnel: t });
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
        evenement(tun + "_phone_click", { numero: h.replace("tel:", "") });
      } else if (h.indexOf("wa.me") > -1 || h.indexOf("whatsapp") > -1) {
        evenement(tun + "_whatsapp_click");
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", brancher);
  } else { brancher(); }
})();
