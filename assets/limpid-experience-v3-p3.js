/* LIMPID EXPERIENCE V3-P3: couche d'accompagnement non métier.
   Ne modifie jamais les champs, leurs données, les moteurs ou les envois. */
(function(){'use strict';
function node(tag,cl,txt){var el=document.createElement(tag);if(cl)el.className=cl;if(txt!=null)el.textContent=txt;return el;}
function init(){
 var host=document.body.classList.contains('lx--config')?document.getElementById('pc-app'):document.body.classList.contains('lx--general-devis')?document.getElementById('cf'):null;
 if(!host||host.querySelector('.lx3p3-rail'))return;
 var kind=document.body.getAttribute('data-tunnel')||'general';
 var setups={vitres:['VITRES & VITRAGES','Des vitrages bien identifiés. Un devis plus juste.','Décrivez vos ouvertures grâce aux exemples visuels, puis vérifiez votre demande.','/assets/vitres-domicile-apres.webp'],menage:['ENTRETIEN DU DOMICILE','Votre intérieur. Votre rythme.','Précisez vos espaces et vos priorités ; chaque choix reste modifiable.','/assets/remise-en-etat-apres.webp'],bureaux:['ENTRETIEN PROFESSIONNEL','Des locaux qui travaillent aussi bien que vous.','Décrivez vos espaces, les contraintes et le rythme souhaité.','/assets/vitrine-boutique-darnieulles.webp'],general:['DEVIS MULTI-PRESTATIONS','Les bons besoins. Les bonnes précisions.','Rassemblez plusieurs prestations dans une demande cohérente.','/assets/hero-baies-vitrees-propres.webp']};
 // Le tunnel "locaux professionnels" a un attribut interne qui peut varier selon les exports.
 if(!setups[kind]&&document.body.classList.contains('lx--config'))kind='bureaux';
 var p=setups[kind]||setups.general;
 var aside=node('aside','lx3p3-rail');aside.setAttribute('aria-label','Informations sur votre parcours');
 var inr=node('div','lx3p3-railinner');aside.appendChild(inr);
 var brand=node('div','lx3p3-mini');brand.appendChild(node('span','lx3p3-dot'));brand.appendChild(node('span',null,'LIMPID EXPERIENCE'));inr.appendChild(brand);
 inr.appendChild(node('p','lx3p3-hero',p[1]));inr.appendChild(node('p','lx3p3-lead',p[2]));
 inr.appendChild(node('div','lx3p3-railrule'));
 inr.appendChild(node('p','lx3p3-trailtitle','Votre parcours, simplement'));
 var list=node('ol','lx3p3-trail');[['01','Décrivez votre besoin'],['02','Précisez les quantités'],['03','Relisez vos choix'],['04','Transmettez votre demande']].forEach(function(a){var li=node('li');li.appendChild(node('b',null,a[0]));li.appendChild(node('span',null,a[1]));list.appendChild(li)});inr.appendChild(list);
 inr.appendChild(node('div','lx3p3-railrule'));
 var indicator=node('div','lx3p3-progresslabel');indicator.appendChild(node('span',null,'Avancement du formulaire'));var val=node('strong',null,'—');indicator.appendChild(val);inr.appendChild(indicator);
 var progress=node('div','lx3p3-meter');progress.setAttribute('aria-hidden','true');var bar=node('i');progress.appendChild(bar);inr.appendChild(progress);
 inr.appendChild(node('p','lx3p3-helper','La demande reste à vérifier et à confirmer par Limpid avant tout engagement.'));
 var visual=node('div','lx3p3-visual'),photo=node('img');photo.src=p[3];photo.alt='';photo.loading='lazy';visual.appendChild(photo);visual.appendChild(node('span','lx3p3-photochip',p[0]));aside.appendChild(visual);
 host.insertBefore(aside,host.firstChild);
 var prog=document.getElementById('pc-barre')||host.querySelector('.cf-prog .cf-barre i');
 var scheduled=false;function sync(){scheduled=false;if(!prog)return;var n=parseFloat(prog.style.width);if(!Number.isFinite(n))return;n=Math.max(0,Math.min(100,n));bar.style.width=n+'%';val.textContent=Math.round(n)+' %';}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync);}
 if(prog)new MutationObserver(schedule).observe(prog,{attributes:true,attributeFilter:['style']});sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
