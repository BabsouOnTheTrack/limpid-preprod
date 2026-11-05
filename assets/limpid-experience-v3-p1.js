/* LIMPID EXPERIENCE V3 — phase 1. PRESENTATION ONLY.
   No business fields, form submission, analytics, cookies, CRM, location or storage. */
(()=>{'use strict';
const context={
  pro:{tag:'Professionnels · entretien',title:'Des locaux entretenus selon votre activité.',text:'Nous adaptons la proposition à vos espaces, à votre rythme d’activité et à vos contraintes d’accès. Une demande courte ou un parcours détaillé : vous choisissez.',benefits:['Organisation adaptée','Demande sans engagement','Contact direct'],short:'/nettoyage-locaux-professionnels-epinal/#demande',shortText:'Demande rapide',full:'/configurer-devis-locaux-professionnels/',fullText:'Décrire mes locaux'},
  changer:{tag:'Professionnels · transition',title:'Étudier une alternative à votre prestataire.',text:'Vous disposez déjà d’une organisation ? Vous pouvez faire examiner vos besoins sans présumer des problèmes avec votre prestataire actuel ni engager une intervention.',benefits:['Étude du besoin','Prestataire actuel pris en compte','Transition à définir'],short:'/nettoyage-locaux-professionnels-epinal/#demande',shortText:'Demande rapide',full:'/configurer-devis-locaux-professionnels/',fullText:'Préparer mon cahier des charges'},
  domicile:{tag:'Particuliers · entretien',title:'Un entretien pensé pour votre domicile.',text:'Indiquez les pièces, le rythme et les tâches prioritaires. Les aides visuelles vous accompagnent pour décrire le logement sans vocabulaire technique.',benefits:['Aides illustrées','Prestations précisées','Étude personnalisée'],short:'/menage-domicile-epinal/',shortText:'Voir le ménage à domicile',full:'/configurer-devis-menage/',fullText:'Configurer ma demande'},
  specifique:{tag:'Vitres · grand nettoyage · textiles',title:'Une prestation précise, sans approximation.',text:'Distinguez les fenêtres des baies, précisez les surfaces et les particularités. Des illustrations expliquent ce qui est compté et les besoins complexes sont étudiés.',benefits:['Unités expliquées','44 aides illustrées','Évaluation humaine'],short:'/configurer-devis-vitres/',shortText:'Configurer les vitres',full:'/devis/',fullText:'Voir toutes les prestations'}
};
const home=document.querySelector('[data-lx3-hub]');
if(home){
  const buttons=[...home.querySelectorAll('[data-lx3-context]')];
  const set=(key)=>{const c=context[key];if(!c)return;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lx3Context===key)));
    const put=(selector,value)=>{const el=home.querySelector(selector);if(el)el.textContent=value;};
    put('[data-lx3-tag]',c.tag);put('[data-lx3-title]',c.title);put('[data-lx3-text]',c.text);
    const benefits=home.querySelector('[data-lx3-benefits]');if(benefits){benefits.replaceChildren();c.benefits.forEach(value=>{const li=document.createElement('li');li.textContent=value;benefits.appendChild(li);});}
    const a=home.querySelector('[data-lx3-short]'), b=home.querySelector('[data-lx3-full]');
    if(a){a.setAttribute('href',c.short);a.textContent=c.shortText+'  ↗';}
    if(b){b.setAttribute('href',c.full);b.textContent=c.fullText+'  →';}
  };
  buttons.forEach(button=>button.addEventListener('click',()=>set(button.dataset.lx3Context)));
  set('pro');
}
const b2b=document.querySelector('[data-lx3-b2b]');
if(b2b){
  const configs={
    nouveau:{title:'Mettre en place un entretien adapté.',text:'Précisez la nature des locaux et le niveau de service attendu. Une visite éventuelle et le tarif sont confirmés après examen de votre demande.',short:'/nettoyage-locaux-professionnels-epinal/#demande',shortText:'Faire une demande courte',detail:'/configurer-devis-locaux-professionnels/',detailText:'Décrire mon besoin en détail'},
    transition:{title:'Préparer une transition sereine.',text:'Décrivez votre fonctionnement actuel et ce que vous souhaitez faire évoluer. Aucun jugement ni promesse sur un prestataire existant.',short:'/nettoyage-locaux-professionnels-epinal/#demande',shortText:'Faire une demande courte',detail:'/configurer-devis-locaux-professionnels/',detailText:'Décrire mon besoin en détail'},
    ponctuel:{title:'Faire étudier une intervention spécifique.',text:'Pour des vitres, textiles, remises en état ou besoins combinés, le configurateur multi-prestations permet de préciser les éléments utiles.',short:'/devis/',shortText:'Préciser mon besoin',detail:'/configurer-devis-vitres/',detailText:'Configurer les vitres'}
  };
  const buttons=[...b2b.querySelectorAll('[data-lx3-scenario]')];
  const set=k=>{const c=configs[k];if(!c)return;
    buttons.forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.lx3Scenario===k)));
    const title=b2b.querySelector('[data-lx3-btitle]'),text=b2b.querySelector('[data-lx3-btext]'),detail=b2b.querySelector('[data-lx3-bdetail]'),short=b2b.querySelector('[data-lx3-bshort]');
    if(title)title.textContent=c.title;if(text)text.textContent=c.text;if(detail){detail.href=c.detail;detail.textContent=c.detailText+' →';}if(short){short.href=c.short;short.textContent=c.shortText+' ↗';}
  };
  buttons.forEach(x=>x.addEventListener('click',()=>set(x.dataset.lx3Scenario)));
  set('nouveau');
}
})();
