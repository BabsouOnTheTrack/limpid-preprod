/* LIMPID SIGNATURE V1.27 — lecture des périmètres, présentation uniquement.
   Fonction pure : ne change aucune sélection, estimation, formule ou donnée transmise. */
(function (root) {
  "use strict";
  function esc(v) {
    return String(v === null || v === undefined ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function list(items) {
    return '<ul class="sig-recap-list">' +
      items.map(function (value) { return '<li>' + esc(value) + '</li>'; }).join("") + '</ul>';
  }
  function render(perimetre, estimation, service, isTest) {
    var p = perimetre && typeof perimetre === "object" ? perimetre : {};
    var includes = Array.isArray(p.inclus) ? p.inclus : [];
    var options = Array.isArray(p.options) ? p.options : [];
    var excludes = Array.isArray(p.exclus) ? p.exclus : [];
    var removed = Array.isArray(p.retires) ? p.retires : [];
    var minutes = Number(estimation && estimation.minutes);
    var h = '<section class="sig-recap-detail" aria-label="Détail de la prestation">' +
      '<h3 class="sig-recap-detail-title">Le détail de votre prestation</h3>';
    if (Number.isFinite(minutes) && minutes > 0) {
      var m = Math.round(minutes), hours = Math.floor(m / 60), rest = m % 60;
      h += '<div class="sig-recap-duration"><strong>Durée indicative</strong><span>' +
        esc((hours ? hours + " h " : "") + String(rest).padStart(2, "0") + " min (estimée)") +
        '</span></div>';
    }
    if (includes.length) {
      h += '<h4>Compris</h4><ul class="sig-recap-list">';
      includes.forEach(function (line) {
        if (!line || !Array.isArray(line.taches) || !line.taches.length) return;
        h += '<li>' + (line.piece ? '<strong>' + esc(line.piece) + ' :</strong> ' : '') +
          esc(line.taches.join(", ")) + (line.note ? ' <span class="sig-recap-note">' + esc(line.note) + '</span>' : '') + '</li>';
      });
      h += '</ul>';
    }
    if (options.length) h += '<h4>Éléments et options</h4>' + list(options);
    if (removed.length) h += '<h4>Retiré à votre demande</h4>' + list(removed);
    if (excludes.length) h += '<div class="sig-recap-exclusions"><h4>Non compris</h4>' + list(excludes) + '</div>';
    if (service === "menage") {
      h += '<p class="sig-recap-tax">Les prestations à domicile des particuliers peuvent ouvrir droit à un crédit d’impôt de 50 %, sous réserve d’éligibilité et des conditions légales. Le devis précisera les prestations concernées.</p>';
    }
    h += '<p class="sig-recap-price"><strong>Et le prix ?</strong> ' +
      (isTest ? 'Préproduction : aucun devis commercial n’est envoyé.' :
       'Le prix sera communiqué dans votre devis personnalisé après étude de la demande.') + '</p>';
    h += '<p class="sig-recap-disclaimer">La durée indicative est à confirmer par Limpid et ne constitue pas un engagement.</p></section>';
    return h;
  }
  var api = Object.freeze({render:render});
  root.LimpidSignatureRecap = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
