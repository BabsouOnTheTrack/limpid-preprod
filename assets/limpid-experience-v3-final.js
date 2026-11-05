/* LIMPID EXPERIENCE V3 candidate — strictly decorative & existing-link UI
   No requests, tracking, field writes, service calls or modifications to quote state. */
(function(){'use strict';
var d=document,b=d.body;if(!b||!b.classList.contains('lx4'))return;
function make(n,cls,txt){var el=d.createElement(n);if(cls)el.className=cls;if(txt!=null)el.textContent=txt;return el;}
function init(){
 var family=b.getAttribute('data-lx4-family')||'professionnels';
 var examples={
  professionnels:['/assets/hero-baies-vitrees-propres.webp','/assets/vitrine-boutique-darnieulles.webp','Réalisations locales','Épinal & alentours'],
  vitres:['/assets/hero-baies-vitrees-propres.webp','/assets/vitres-domicile-apres.webp','Vitres et vitrines','Précision du détail'],
  domicile:['/assets/remise-en-etat-apres.webp','/assets/vitres-domicile-apres.webp','Entretien du domicile','Une intervention adaptée'],
  textile:['/assets/guides/textile-poster.webp','/assets/guides/textile-01.webp','Guide illustré','Identifier les tissus'],
  guides:['/assets/hero-baies-vitrees-propres.webp','/assets/remise-en-etat-apres.webp','Conseils de terrain','Méthodes & savoir-faire'],
  references:['/assets/vitrine-boutique-darnieulles.webp','/assets/vitrine-pizzeria-casa-familia-epinal.webp','Réalisations locales','Photos de prestations']
 };
 var p=examples[family]||examples.professionnels;
 var hero=b.classList.contains('lx4--home')||b.classList.contains('lx4--split-hero')||b.classList.contains('lx4--editorial-hero')?d.querySelector('main>.hero'):null;
 if(hero&&!hero.querySelector('.lx4-hero-media')){
  var m=make('div','lx4-hero-media');m.setAttribute('aria-hidden','true');
  var img=make('img','lx4-hero-main');img.src=p[0];img.alt='';img.loading='eager';img.decoding='async';m.appendChild(img);
  var dimg=make('img','lx4-hero-detail');dimg.src=p[1];dimg.alt='';dimg.loading='lazy';dimg.decoding='async';m.appendChild(dimg);
  // Keep the images; omit slide-like decorative labels and counters.
  hero.appendChild(m);
 }
 // Editorial numbering omitted at user request; headings and native structures remain untouched.
 // A discreet conversion reminder, only after reading the page, no automatic action.
 if(b.classList.contains('lx4--service')||b.classList.contains('lx4--editorial')){
  var target=b.getAttribute('data-lx4-target')||'/devis/';
  var dock=make('div','lx4-help-dock');dock.setAttribute('role','region');dock.setAttribute('aria-label','Accès rapide au devis');
  var copy=make('div');copy.appendChild(make('strong',null,'Votre demande, simplement.'));copy.appendChild(make('small',null,'Un échange direct avec Limpid.'));dock.appendChild(copy);
  var a=make('a',null,'Demander un devis');a.href=target;dock.appendChild(a);
  var close=make('button','lx4-help-close','×');close.type='button';close.setAttribute('aria-label','Masquer ce raccourci');dock.appendChild(close);
  var disabled=false;close.addEventListener('click',function(){disabled=true;dock.classList.remove('lx4-visible')});
  d.body.appendChild(dock);var assess=function(){if(disabled)return;dock.classList.toggle('lx4-visible',window.scrollY>1000)};
  window.addEventListener('scroll',assess,{passive:true});assess();
 }
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
