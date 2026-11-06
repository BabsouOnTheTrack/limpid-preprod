/* Module Vitres — extrait sans modification du configurateur spécialisé V6.6.5. */
window.LIMPID_PARCOURS = (function () {
  "use strict";
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function n(x) { x = parseFloat(String(x == null ? "" : x).replace(",", ".")); return isFinite(x) && x > 0 ? x : 0; }
  function a(R, k) { return (R[k] || []); }
  function has(R, k, v) { return a(R, k).indexOf(v) >= 0; }

  var TYPES = [
    ["fenetres", "🪟", "Fenêtres classiques", "À compter hors portes-fenêtres."],
    ["baies", "🚪", "Baies et portes-fenêtres", "Portes-fenêtres, baies coulissantes et vitrines."],
    ["veranda", "🌿", "Véranda", "Les parois vitrées, intérieur et extérieur."],
    ["autre", "✏️", "Autre surface vitrée", "Vitrine, porte vitrée, cloison… décrite en quelques mots."]
  ];
  var COTES = [["int_ext", "Intérieur et extérieur"], ["ext", "Extérieur uniquement"], ["int", "Intérieur uniquement"]];
  var FREQ = [["0", "Une seule fois"], ["2", "Deux fois par an"], ["4", "Chaque trimestre"], ["12", "Chaque mois"], ["1", "Une fois par an"]];
  var QUAND = [["asap", "Dès que possible"], ["mois", "Dans le mois"], ["date", "À une date précise"], ["flexible", "Je ne suis pas pressé"]];
  var LOGEMENT = [["maison", "Maison"], ["appartement", "Appartement"], ["autre", "Autre"]];
  var ETAGES = [["rdc", "Rez-de-chaussée"], ["1", "1er étage"], ["2", "2e étage"], ["3", "3e étage ou plus"]];
  var NIVEAUX = [["plainpied", "De plain-pied"], ["etage", "Avec étage"]];
  /* Limite d'intervention de Limpid : échelle et perche possibles ; ni toiture, ni grands velux. */
  var REGLE_ACCES = "Limpid nettoie aussi les vitres en hauteur, à l'échelle ou à la perche. Les toitures et les grands velux ne sont pas pris en charge.";
  function lib(l, v) { for (var i = 0; i < l.length; i++) if (l[i][0] === v) return l[i][1]; return ""; }

  /* ---------- Petits composants ---------- */
  function opts(k, liste, R) {
    return '<div class="pc-choix">' + liste.map(function (o) {
      return '<button type="button" class="pc-opt' + (R[k] === o[0] ? " on" : "") + '" data-choix="' + k + "|" + o[0] + '" aria-pressed="' + (R[k] === o[0]) + '">' + esc(o[1]) + '</button>'; }).join("") + '</div>';
  }
  function multi(k, liste, R) {
    return '<div class="pc-choix">' + liste.map(function (o) {
      var on = has(R, k, o[0]);
      return '<button type="button" class="pc-opt pc-coche' + (on ? " on" : "") + '" data-multi="' + k + "|" + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + '</button>'; }).join("") + '</div>';
  }
  function cpt(k, libelle, aide, R) {
    return '<div class="cf-cpt"><span class="cf-lib">' + esc(libelle) + '</span><span class="cf-pas">' +
      '<button type="button" aria-label="moins" data-pas="' + k + '" data-d="-1">−</button>' +
      '<input type="number" min="0" inputmode="numeric" data-k="' + k + '" value="' + (n(R[k]) || 0) + '" aria-label="' + esc(libelle) + '">' +
      '<button type="button" aria-label="plus" data-pas="' + k + '" data-d="1">+</button></span>' + (aide ? '<small class="cf-aide">' + esc(aide) + '</small>' : '') + '</div>';
  }
  function txt(k, libelle, aide, R, ph, zone) {
    return '<label class="cf-champ">' + esc(libelle) + (aide ? '<small>' + esc(aide) + '</small>' : '') +
      (zone ? '<textarea data-k="' + k + '" rows="3" placeholder="' + esc(ph || "") + '">' + esc(R[k] || "") + '</textarea>'
            : '<input type="text" data-k="' + k + '" value="' + esc(R[k] || "") + '" placeholder="' + esc(ph || "") + '">') + '</label>';
  }

  /* ---------- Conversion en saisie du moteur ---------- */
  function faces(R) {
    var cotes = R.cotes === "int_ext" ? 2 : 1;
    // Un petit Velux basculant : deux faces vitrées nettoyées depuis l'intérieur.
    // Le choix des côtés s'applique aux fenêtres classiques, pas au lieu d'accès du Velux.
    return (n(R.f1) + 2 * n(R.f2)) * cotes + 2 * n(R.fVelux);
  }
  function saisie(R) {
    var fen = has(R, "types", "fenetres"), bai = has(R, "types", "baies"), ver = has(R, "types", "veranda");
    return { type: "vitres", frequence: R.frequence || "0", niveau: 1, hauteur: R.accessible === "oui", travaux: false,
      elements: { faces: fen ? faces(R) : 0, baiesP: bai ? n(R.baiesP) : 0, baies: bai ? n(R.baies) : 0, baiesG: bai ? n(R.baiesG) : 0,
        verandaM2: ver ? n(R.verandaM2) : 0, glissieres: 0, volets: 0 } };
  }

  /* ---------- Écrans ---------- */
  function ecrans() {
    return [
      { id: "quoi", titre: "Que souhaitez-vous faire nettoyer ?", sous: "Plusieurs réponses possibles.",
        rendre: function (R) {
          return '<div class="cf-choix">' + TYPES.map(function (t) {
            var on = has(R, "types", t[0]);
            return '<button type="button" class="cf-carte cf-multi' + (on ? " on" : "") + '" data-multi="types|' + t[0] + '" aria-pressed="' + on + '"><span class="ic">' + t[1] + '</span><span><b>' + esc(t[2]) + '</b><span class="d">' + esc(t[3]) + '</span></span><span class="cf-case" aria-hidden="true"></span></button>'; }).join("") + '</div>' +
            '<div class="cf-alerte bleu" style="font-size:.84rem">' + esc(REGLE_ACCES) + '</div>';
        },
        valider: function (R) { return a(R, "types").length ? "" : "Choisissez au moins une réponse."; } },

      { id: "fenetres", titre: "Combien de fenêtres classiques ?", sous: "Ne comptez pas les portes-fenêtres ici : elles vont dans les baies.", si: function (R) { return has(R, "types", "fenetres"); },
        rendre: function (R) {
          return '<div class="cf-compteurs">' + cpt("f1", "Fenêtres à 1 battant", "Hors portes-fenêtres, à compter dans les baies", R) + cpt("f2", "Fenêtres à 2 battants", "Hors portes-fenêtres, à compter dans les baies", R) +
            cpt("fVelux", "Petits Velux basculants", "2 faces par Velux : intérieure et extérieure, toutes deux nettoyées depuis l'intérieur du logement", R) + '</div>' +
            txt("fDim", "Dimensions particulières", "Facultatif : une très grande fenêtre, des petits carreaux…", R, "Ex. : 2 fenêtres de 2 m de haut");
        },
        valider: function (R) { return (n(R.f1) + n(R.f2) + n(R.fVelux)) ? "" : "Indiquez au moins une fenêtre."; } },

      { id: "baies", titre: "Combien de baies et portes-fenêtres ?", sous: "Comptez chaque porte-fenêtre ou baie une seule fois, hors fenêtres classiques.", si: function (R) { return has(R, "types", "baies"); },
        rendre: function (R) {
          return '<div class="cf-compteurs">' + cpt("baiesP", "Petites baies / portes-fenêtres (1 vantail)", "Comptez une ouverture complète, pas les faces", R) + cpt("baies", "Baies / portes-fenêtres (2 vantaux)", "Une baie ou porte-fenêtre = une ouverture", R) + cpt("baiesG", "Grandes (3 vantaux et +)", "", R) + '</div>' +
            txt("baiesDim", "Dimensions si vous les connaissez", "Facultatif.", R, "Ex. : baie de 3 m de large");
        },
        valider: function (R) { return (n(R.baiesP) + n(R.baies) + n(R.baiesG)) ? "" : "Indiquez au moins une baie."; } },

      { id: "veranda", titre: "Votre véranda", sous: "Nous nettoyons les parois vitrées, à l'intérieur et à l'extérieur. La toiture n'est pas prise en charge.", si: function (R) { return has(R, "types", "veranda"); },
        rendre: function (R) {
          return '<p class="cf-mention">Indiquez une estimation de la surface au sol, sans prendre les dimensions exactes. Les parois vitrées sont comprises, la toiture est exclue.</p>' +
            '<div class="cf-choix">' + [[8,'Petite · environ 8 m²'],[15,'Moyenne · environ 15 m²'],[25,'Grande · environ 25 m²']].map(function(q){return '<button type="button" class="pc-opt' + (n(R.verandaM2)===q[0]?' on':'') + '" data-choix="verandaM2|' + q[0] + '" aria-pressed="' + (n(R.verandaM2)===q[0]) + '">' + q[1] + '</button>';}).join('') + '</div>' +
            '<label class="cf-champ">Ou autre surface estimée (m²)<small>Facultatif si vous avez choisi une taille ci-dessus.</small><input type="number" min="1" inputmode="decimal" data-k="verandaM2" value="' + (R.verandaM2 || "") + '" placeholder="Ex. : 12"></label>';
        },
        valider: function (R) { return n(R.verandaM2) ? "" : "Indiquez la surface au sol de la véranda."; } },

      { id: "particulier", titre: "Décrivez cette surface vitrée", si: function (R) { return has(R, "types", "autre"); },
        rendre: function (R) { return txt("autreTxt", "Votre situation", "Ce qu'il faut nettoyer, combien, et sa taille approximative.", R, "Ex. : une vitrine de 3 m × 2 m, une porte d'entrée vitrée…", true); },
        valider: function (R) { return String(R.autreTxt || "").trim().length < 8 ? "Décrivez la surface vitrée en quelques mots." : ""; } },

      { id: "cotes", titre: "Quelles faces faut-il nettoyer ?", rendre: function (R) { return opts("cotes", COTES, R) +
          (n(R.fVelux) ? '<p class="cf-mention">Pour les petits Velux basculants : les deux faces (intérieure et extérieure) seront nettoyées depuis l’intérieur du logement, sans accès extérieur. Le choix ci-dessus concerne les autres vitrages.</p>' : ''); },
        valider: function (R) { return R.cotes ? "" : "Choisissez une réponse."; } },

      { id: "logement", titre: "Votre logement", rerendre: ["logement", "accessible"],
        rendre: function (R) {
          var h = opts("logement", LOGEMENT, R);
          if (R.logement === "appartement") h += '<p class="cf-sous" style="margin:8px 0 6px">À quel étage ?</p>' + opts("etage", ETAGES, R);
          if (R.logement === "maison") h += '<p class="cf-sous" style="margin:8px 0 6px">Votre maison est…</p>' + opts("niveaux", NIVEAUX, R);
          if (R.logement === "autre") h += txt("logementTxt", "Précisez", "", R, "Ex. : local attenant, atelier…");
          h += '<p class="cf-sous" style="margin:10px 0 6px">Certaines vitres demandent-elles une échelle ou une perche ?</p>' +
            opts("accessible", [["non", "Non, toutes sont à portée de main"], ["oui", "Oui, certaines sont en hauteur"]], R);
          return h;
        },
        valider: function (R) {
          if (!R.logement) return "Indiquez votre type de logement.";
          if (R.logement === "appartement" && !R.etage) return "Indiquez l'étage.";
          if (R.logement === "maison" && !R.niveaux) return "Indiquez si votre maison a un étage.";
          if (!R.accessible) return "Indiquez si certaines vitres sont en hauteur.";
          return "";
        } },

      { id: "quand", titre: "À quel rythme, et pour quand ?", rerendre: ["quand"],
        rendre: function (R) {
          var h = '<p class="cf-sous" style="margin:0 0 6px">Fréquence souhaitée</p>' + opts("frequence", FREQ, R);
          h += '<p class="cf-sous" style="margin:12px 0 6px">Première intervention</p>' + opts("quand", QUAND, R);
          if (R.quand === "date") h += '<label class="cf-champ">Date souhaitée<input type="date" data-k="dateSouhaitee" min="' + new Date().toISOString().slice(0, 10) + '" value="' + esc(R.dateSouhaitee || "") + '"></label>';
          return h;
        },
        valider: function (R) {
          if (!R.frequence) return "Choisissez une fréquence.";
          if (!R.quand) return "Indiquez quand vous souhaitez la première intervention.";
          if (R.quand === "date" && !R.dateSouhaitee) return "Indiquez la date souhaitée.";
          return "";
        } },

      { id: "adresse", titre: "Où se trouve le logement ?", sous: "Dans notre zone d'intervention, le déplacement est compris dans le prix.",
        rendre: function (R) {
          return '<div class="cf-ac"><label class="cf-champ" for="pc-adresse">Adresse <small>Commencez à la taper puis choisissez-la dans la liste : le code postal et la commune se remplissent seuls.</small></label>' +
            '<input type="text" id="pc-adresse" class="cf-ac-champ" data-k="adresse" autocomplete="off" placeholder="Ex. : 5 rue des Sapins, Darnieulles" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="pc-adresse-sug" value="' + esc(R.adresse || "") + '">' +
            '<ul class="cf-sug" id="pc-adresse-sug" role="listbox" hidden></ul></div>' +
            '<div class="cf-duo"><label class="cf-champ">Code postal<input type="text" data-k="cp" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="' + esc(R.cp || "") + '"></label>' +
            '<label class="cf-champ">Commune<input type="text" data-k="commune" autocomplete="address-level2" value="' + esc(R.commune || "") + '"></label></div>';
        },
        valider: function (R) {
          if (String(R.adresse || "").trim().length < 4) return "Indiquez votre adresse : numéro et rue.";
          if (!/^\d{5}$/.test(String(R.cp || ""))) return "Indiquez votre code postal, en cinq chiffres.";
          if (String(R.commune || "").trim().length < 2) return "Indiquez votre commune.";
          return "";
        } },

      { id: "contact", titre: "Vos coordonnées", sous: "Pour vous envoyer votre devis, et vous joindre si un point reste à préciser.",
        rendre: function (R) {
          return '<label class="cf-champ">Nom et prénom<input type="text" data-k="nom" autocomplete="name" value="' + esc(R.nom || "") + '"></label>' +
            '<label class="cf-champ">Téléphone<input type="tel" data-k="tel" autocomplete="tel" inputmode="tel" value="' + esc(R.tel || "") + '"></label>' +
            '<label class="cf-champ">E-mail<input type="email" data-k="email" autocomplete="email" inputmode="email" value="' + esc(R.email || "") + '"></label>' +
            '<div class="cf-champ">Joindre des photos ? <small>Facultatif : elles rendent votre devis plus précis. Vous pourrez nous les envoyer juste après votre demande : deux modes d\'envoi rapide vous seront proposés.</small>' +
            '<div class="cf-seg" style="margin:8px 0 0"><button type="button" class="' + (R.photos === "oui" ? "on" : "") + '" data-photos="oui">Oui, après ma demande</button><button type="button" class="' + (R.photos === "non" ? "on" : "") + '" data-photos="non">Non</button></div></div>' +
            txt("message", "Informations complémentaires", "Facultatif : état des vitres, contraintes d'horaires, présence d'animaux…", R, "", true);
        },
        valider: function (R) {
          if (String(R.nom || "").trim().length < 2) return "Indiquez votre nom.";
          if (String(R.tel || "").replace(/\D/g, "").length < 10) return "Indiquez un numéro de téléphone complet.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(R.email || "").trim())) return "Indiquez une adresse e-mail valide : votre devis y sera envoyé.";
          return "";
        } }
    ];
  }

  /* ---------- Récapitulatif ---------- */
  function lignesQuantites(R) {
    var L = [];
    if (has(R, "types", "fenetres")) L.push("Fenêtres : " + [[R.f1, "à un battant"], [R.f2, "à deux battants"], [R.fVelux, "petit(s) Velux (2 faces, nettoyées depuis l’intérieur)"]].filter(function (x) { return n(x[0]); }).map(function (x) { return n(x[0]) + " " + x[1]; }).join(", "));
    if (R.fDim && has(R, "types", "fenetres")) L.push("Dimensions : " + R.fDim);
    if (has(R, "types", "baies")) L.push("Baies vitrées : " + [[R.baiesP, "petite(s)"], [R.baies, "standard"], [R.baiesG, "grande(s)"]].filter(function (x) { return n(x[0]); }).map(function (x) { return n(x[0]) + " " + x[1]; }).join(", "));
    if (R.baiesDim && has(R, "types", "baies")) L.push("Dimensions des baies : " + R.baiesDim);
    if (has(R, "types", "veranda")) L.push("Véranda : " + n(R.verandaM2) + " m² au sol, parois vitrées");
    if (has(R, "types", "autre")) L.push("Autre surface vitrée : " + (R.autreTxt || ""));
    return L;
  }
  function logementTxt(R) {
    return lib(LOGEMENT, R.logement) + (R.logement === "appartement" && R.etage ? ", " + lib(ETAGES, R.etage).toLowerCase() : "") + (R.logement === "maison" && R.niveaux ? ", " + lib(NIVEAUX, R.niveaux).toLowerCase() : "") + (R.logement === "autre" && R.logementTxt ? " : " + R.logementTxt : "");
  }
  function quandTxt(R) { return R.quand === "date" ? "Le " + (R.dateSouhaitee ? new Date(R.dateSouhaitee + "T12:00:00").toLocaleDateString("fr-FR") : "?") : lib(QUAND, R.quand); }
  function recap(R) {
    return [
      { titre: "Service", ecran: "quoi", lignes: ["Nettoyage de vitres : " + a(R, "types").map(function (t) { return lib(TYPES.map(function (x) { return [x[0], x[2]]; }), t); }).join(", ")] },
      { titre: "Quantités", ecran: visiblePremier(R), lignes: lignesQuantites(R) },
      { titre: "Faces à nettoyer", ecran: "cotes", lignes: [lib(COTES, R.cotes)] },
      { titre: "Logement et accès", ecran: "logement", lignes: [logementTxt(R), R.accessible === "oui" ? "Certaines vitres demandent une échelle ou une perche" : "Toutes les vitres sont à portée de main"] },
      { titre: "Fréquence et date souhaitée", ecran: "quand", lignes: [lib(FREQ, R.frequence), "Première intervention : " + quandTxt(R)] },
      { titre: "Adresse", ecran: "adresse", lignes: [[R.adresse, [R.cp, R.commune].filter(Boolean).join(" ")].filter(Boolean).join(", ")] },
      { titre: "Coordonnées", ecran: "contact", lignes: [R.nom || "", [R.tel, R.email].filter(Boolean).join(" · "), "Photos : " + (R.photos === "oui" ? "oui, après la demande" : "non")].concat(R.message ? ["« " + R.message + " »"] : []) }
    ];
  }
  function visiblePremier(R) { return has(R, "types", "fenetres") ? "fenetres" : has(R, "types", "baies") ? "baies" : has(R, "types", "veranda") ? "veranda" : "particulier"; }

  /* ---------- Dossier « À compléter avant devis » ---------- */
  function aCompleter(R, zone) {
    var l = [];
    if (n(R.fVelux) && R.cotes && R.cotes !== "int_ext") l.push({ client: "le périmètre de nettoyage des Velux", interne: "2 faces par Velux incluses, nettoyage des deux depuis l'intérieur par basculement ; autres vitrages demandés sur un seul côté : confirmer le périmètre des Velux si nécessaire" });
    if (has(R, "types", "autre")) l.push({ client: "la surface vitrée que vous avez décrite", interne: "autre surface vitrée à étudier" });
    if (R.logement === "autre") l.push({ client: "", interne: "logement « autre » : " + (R.logementTxt || "") });
    if (/hors table|au-delà/.test(zone || "")) l.push({ client: "", interne: zone });
    return l;
  }
  function qualification(R) {
    return { types: a(R, "types"), fenetres: { unBattant: n(R.f1), deuxBattants: n(R.f2), velux: n(R.fVelux), dimensions: R.fDim || "" },
      baies: { petites: n(R.baiesP), standard: n(R.baies), grandes: n(R.baiesG), dimensions: R.baiesDim || "" },
      veranda: { m2: n(R.verandaM2), parties: "parois" }, autre: R.autreTxt || "",
      cotes: R.cotes || "", logement: R.logement || "", etage: R.etage || "", niveaux: R.niveaux || "", logementTxt: R.logementTxt || "",
      accessible: R.accessible || "", frequence: R.frequence || "", frequenceLib: lib(FREQ, R.frequence),
      quand: R.quand || "", dateSouhaitee: R.dateSouhaitee || "", quandLib: quandTxt(R) };
  }
  function fiche(R, ac) {
    var L = ["Statut : " + (ac.length ? "À COMPLÉTER AVANT DEVIS" : "complète"), ""];
    recap(R).forEach(function (s) { L.push("■ " + s.titre.toUpperCase()); s.lignes.forEach(function (x) { if (x) L.push(x); }); L.push(""); });
    if (ac.length) { L.push("■ À COMPLÉTER AVANT DEVIS"); ac.forEach(function (x) { L.push("- " + x.interne); }); }
    L.push("", "Faces vitrées calculées pour le chiffrage : " + saisie(R).elements.faces + (R.cotes === "int_ext" ? " (intérieur et extérieur)" : ""));
    return L.join("\n");
  }
  function pret(R) { return ecrans().every(function (e) { return (e.si && !e.si(R)) || !e.valider || !e.valider(R); }); }

  return { service: "vitres", prefixe: "V", conversion: "vitres_lead", offre: "vitres", libOffre: "Lavage de vitres", libCourt: "Vitres",
    aiguillage: { ici: ["Le lavage de vitres", "Fenêtres, baies vitrées, véranda.", "🪟"], autres: [
      { id: "vitres_plus", lib: "Les vitres et une autre prestation", d: "Par exemple les vitres et l'entretien du logement, sur une seule demande.", ic: "➕", offres: ["vitres"] },
      { id: "autre", lib: "Une autre prestation", d: "Ménage, grand ménage, canapés et textiles.", ic: "🏠", offres: [] } ] },
    retour: "/nettoyage-vitres-domicile-epinal/", ecrans: ecrans, recap: recap, aCompleter: aCompleter, qualification: qualification, saisie: saisie, fiche: fiche, pret: pret };
})();
