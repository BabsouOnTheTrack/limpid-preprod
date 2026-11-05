/* Limpid vivant v1 (05/11/2026)
   Couche d'animation progressive : barre de lecture, apparitions au défilement,
   « coup de raclette » sur les photos, parcours en étapes avec étoile qui avance,
   reflet sur le héros.
   Aucun texte n'est ajouté ni retiré : sans JavaScript, la page est identique.
   Rien n'est modifié dans ce qui est déjà visible au chargement (aucun décalage). */
(function () {
  "use strict";
  var VERSION = "20261105";
  var doc = document.documentElement;
  var calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || !document.querySelector) return;
  doc.classList.add("lv");

  /* La feuille de style n'est demandée qu'une fois la page chargée : elle ne
     concurrence jamais l'image principale ni le texte du haut de page. */
  function feuille() {
    if (document.getElementById("lv-css")) return;
    var l = document.createElement("link");
    l.id = "lv-css"; l.rel = "stylesheet"; l.href = "/assets/limpid-vivant.css?v=" + VERSION;
    l.onload = function () { if (window.__lvTout) window.__lvTout(); };
    document.head.appendChild(l);
  }
  if (document.readyState === "complete") feuille();
  else window.addEventListener("load", feuille);

  var ETOILE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c1.2 6.8 4 9.6 12 12-8 2.4-10.8 5.2-12 12-1.2-6.8-4-9.6-12-12 8-2.4 10.8-5.2 12-12z"/></svg>';
  function ico(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; }
  var I = {
    ecrit: ico('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    tel: ico('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>'),
    maison: ico('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>'),
    devis: ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>'),
    agenda: ico('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')
  };
  function iconePour(t, dernier) {
    t = (t || "").toLowerCase();
    if (dernier || /interv|démarre|entretien|arrivons/.test(t)) return ETOILE;
    if (/appelez/.test(t)) return I.tel;
    if (/décri|demande|formulaire|configurateur/.test(t)) return I.ecrit;
    if (/devis|proposition|tarif/.test(t)) return I.devis;
    if (/visite|sur place|passons/.test(t)) return I.maison;
    if (/rappel|appel/.test(t)) return I.tel;
    if (/rythme|valid|date|créneau/.test(t)) return I.agenda;
    return I.ecrit;
  }
  function horsEcran(el) { return el.getBoundingClientRect().top > window.innerHeight; }

  /* ---------- Barre de lecture ---------- */
  var barre = document.createElement("div");
  barre.className = "lv-prog";
  barre.setAttribute("aria-hidden", "true");
  barre.style.cssText = "position:fixed;top:0;left:0;right:0;height:3px;transform:scaleX(0)";
  document.body.appendChild(barre);

  /* ---------- Reflet et étoiles sur les héros sombres ---------- */
  if (!calme) {
    Array.prototype.forEach.call(document.querySelectorAll(".hero"), function (h) {
      var c = getComputedStyle(h).color.match(/\d+/g);
      if (!c || +c[0] < 200) return; /* héros clair : rien */
      if (getComputedStyle(h).position === "static") h.style.position = "relative";
      h.classList.add("lv-reflet");
      [[8, 22, 0], [88, 30, 1.1], [80, 74, 2.2], [14, 70, 1.6]].forEach(function (p) {
        var e = document.createElement("span");
        e.className = "lv-eclat";
        e.setAttribute("aria-hidden", "true");
        /* styles en ligne : aucun décalage même si la feuille de style arrive après */
        e.style.cssText = "position:absolute;width:22px;height:22px;left:" + p[0] + "%;top:" + p[1] + "%;animation-delay:" + p[2] + "s";
        e.innerHTML = ETOILE;
        h.appendChild(e);
      });
    });
  }

  /* ---------- Parcours en étapes ---------- */
  var parcours = [];
  Array.prototype.forEach.call(document.querySelectorAll(".eyebrow"), function (ey) {
    if (!/comment ça (se passe|marche)/i.test(ey.textContent)) return;
    var bloc = ey.parentNode, cible = null, n = ey.nextElementSibling;
    while (n && !cible) {
      if (n.matches("ul,ol") || (n.classList.contains("g3") && n.querySelector(".carte"))) cible = n;
      n = n.nextElementSibling;
    }
    if (!cible || cible.closest("form") || !horsEcran(cible)) return;
    var items = Array.prototype.filter.call(cible.children, function (c) { return c.matches("li,.carte"); });
    if (items.length < 3 || items.length > 6) return;
    cible.classList.add("lv-parcours");
    items.forEach(function (it, k) {
      var dernier = k === items.length - 1;
      var num = document.createElement("span");
      num.className = "lv-num";
      num.setAttribute("aria-hidden", "true");
      num.innerHTML = iconePour(it.textContent, dernier);
      if (it.matches("li")) {
        var txt = document.createElement("div");
        txt.className = "lv-txt";
        while (it.firstChild) txt.appendChild(it.firstChild);
        it.appendChild(num);
        it.appendChild(txt);
      } else {
        it.insertBefore(num, it.firstChild);
      }
      if (dernier) {
        it.classList.add("lv-fin");
        var cf = document.createElement("span");
        cf.className = "lv-confettis";
        cf.setAttribute("aria-hidden", "true");
        var h = "";
        for (var j = 0; j < 14; j++) {
          var a = (j / 14) * 6.283, r = 40 + (j % 3) * 18;
          h += '<i style="--x:' + Math.round(Math.cos(a) * r) + "px;--y:" + Math.round(Math.sin(a) * r) + "px;--r:" + (j * 47) + 'deg"></i>';
        }
        cf.innerHTML = h;
        num.appendChild(cf);
      }
    });
    var piste = document.createElement("span");
    piste.className = "lv-piste";
    piste.setAttribute("aria-hidden", "true");
    piste.innerHTML = "<i></i>";
    var pion = document.createElement("span");
    pion.className = "lv-pion";
    pion.setAttribute("aria-hidden", "true");
    pion.innerHTML = ETOILE;
    cible.appendChild(piste);
    cible.appendChild(pion);
    parcours.push({ el: cible, items: items, piste: piste, pion: pion, fete: false });
  });

  function geometrie(p) {
    /* offsetLeft/offsetTop ignorent les transformations : les apparitions en
       cours ne faussent pas la position de la piste */
    var c = p.items.map(function (it) {
      var n = it.querySelector(".lv-num"), x = n.offsetWidth / 2, y = n.offsetHeight / 2, e = n;
      while (e && e !== p.el) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
      return { x: x, y: y };
    });
    var a = c[0], z = c[c.length - 1];
    p.h = Math.abs(z.x - a.x) > Math.abs(z.y - a.y);
    p.el.classList.toggle("lv-h", p.h);
    p.el.classList.toggle("lv-v", !p.h);
    p.a = a; p.z = z; p.c = c;
    var s = p.piste.style;
    if (p.h) { s.left = a.x + "px"; s.width = (z.x - a.x) + "px"; s.top = (a.y - 1.5) + "px"; s.height = "3px"; }
    else { s.top = a.y + "px"; s.height = (z.y - a.y) + "px"; s.left = (a.x - 1.5) + "px"; s.width = "3px"; }
  }
  function avance(p) {
    var r = p.el.getBoundingClientRect(), vh = window.innerHeight;
    /* horizontal : de 80 % à 35 % de l'écran ; vertical : l'étoile suit une ligne de lecture à 60 % */
    var v = p.h ? (vh * 0.8 - r.top) / (vh * 0.45) : (vh * 0.6 - r.top - p.a.y) / Math.max(1, p.z.y - p.a.y);
    v = Math.max(0, Math.min(1, calme ? 1 : v));
    p.el.style.setProperty("--lv-p", v.toFixed(3));
    var x = p.a.x + (p.z.x - p.a.x) * v, y = p.a.y + (p.z.y - p.a.y) * v;
    p.pion.style.left = x + "px";
    p.pion.style.top = y + "px";
    p.pion.style.opacity = v > 0.98 ? "0" : "1";
    p.items.forEach(function (it, k) {
      var pt = p.c[k], seuil = p.h ? (pt.x - p.a.x) / Math.max(1, p.z.x - p.a.x) : (pt.y - p.a.y) / Math.max(1, p.z.y - p.a.y);
      it.classList.toggle("lv-atteint", v >= seuil - 0.01);
    });
    if (v >= 0.99 && !p.fete) { p.fete = true; p.el.classList.add("lv-fete"); }
  }

  /* ---------- Apparitions au défilement (seulement sous la ligne de flottaison) ---------- */
  var SEL = ["main section h2", ".garantie .item", ".carte", ".avis", "details.faq", ".cta-final", "figure.photo", ".lv-parcours > li", ".tableau", ".carte-guide", ".rf-carte", ".rf-eng", ".rf-facteur", ".rf-zone", ".rf-jauge", ".rf-plan-bloc", ".rf-pieces", ".rf-sceau"];
  var vus = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vu"); vus.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  if (!calme) {
    var freres = new Map();
    Array.prototype.forEach.call(document.querySelectorAll(SEL.join(",")), function (el) {
      if (el.closest("form, .cf-zone, .cf-etape, header, footer, .appel-mobile")) return;
      if (el.classList.contains("rv") || !horsEcran(el)) return;
      var parent = el.parentNode, k = freres.get(parent) || 0;
      freres.set(parent, k + 1);
      el.style.setProperty("--i", Math.min(k, 5));
      el.classList.add("rv");
      vus.observe(el);
    });
  }

  /* ---------- Configurateurs : animation à chaque changement d'étape ----------
     Observation seule : aucune modification de la logique, des champs ni de l'envoi. */
  function animer(el) {
    if (calme || !el) return;
    el.classList.remove("lv-pas"); void el.offsetWidth; el.classList.add("lv-pas");
    clearTimeout(el.__lvT); el.__lvT = setTimeout(function () { el.classList.remove("lv-pas"); }, 800);
  }
  var corps = document.getElementById("pc-corps");
  if (corps && "MutationObserver" in window) {
    var titre = (corps.querySelector("h2") || {}).textContent;
    new MutationObserver(function () {
      var t = (corps.querySelector("h2") || {}).textContent;
      if (t !== titre) { titre = t; animer(corps); }
    }).observe(corps, { childList: true });
  }
  var etapes = document.querySelectorAll(".cf-etape");
  if (etapes.length && "MutationObserver" in window) {
    var mo = new MutationObserver(function (ms) {
      ms.forEach(function (m) { if (m.target.classList.contains("on") && m.oldValue && !/(^|\s)on(\s|$)/.test(m.oldValue)) animer(m.target); });
    });
    Array.prototype.forEach.call(etapes, function (e) { mo.observe(e, { attributes: true, attributeFilter: ["class"], attributeOldValue: true }); });
  }

  /* ---------- Boucle de défilement ---------- */
  var attente = false;
  function maj() {
    attente = false;
    var h = doc.scrollHeight - window.innerHeight;
    barre.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
    parcours.forEach(avance);
  }
  function demande() { if (!attente) { attente = true; requestAnimationFrame(maj); } }
  function tout() { parcours.forEach(geometrie); demande(); }
  window.__lvTout = tout;
  window.addEventListener("scroll", demande, { passive: true });
  window.addEventListener("resize", tout);
  window.addEventListener("load", tout);
  tout();
})();
