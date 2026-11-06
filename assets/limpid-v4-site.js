/* LIMPID V4: presentation only. No submit, billing, quote or CRM API. */
(function(){'use strict';function boot(){
var e=document.querySelector('[data-v4-orient]');
if(!e)return;
var routes={
pro:['VOTRE PARCOURS · PROFESSIONNELS','Un entretien pensé autour de votre activité.','Bureaux, commerces et copropriétés : nous tenons compte de vos espaces, de vos horaires et de vos priorités.','Décrire mes locaux','/configurer-devis-locaux-professionnels/'],
change:['VOTRE PARCOURS · TRANSITION PROFESSIONNELLE','Envisager un autre prestataire, sereinement.','Décrivez votre organisation actuelle et ce que vous aimeriez améliorer. Limpid examine la faisabilité avant toute proposition.','Étudier une transition','/nettoyage-locaux-professionnels-epinal/#demande'],
dom:['VOTRE PARCOURS · DOMICILE','Votre intérieur, votre rythme.','Pour un entretien régulier, un grand ménage ou une intervention à domicile, décrivez votre logement et vos attentes.','Configurer mon ménage','/configurer-devis-menage/'],
precis:['VOTRE PARCOURS · INTERVENTION PONCTUELLE','Une demande précise, sans détour.','Vitres, vitrines, textiles et grand nettoyage : choisissez la bonne prestation et complétez les informations utiles.','Décrire ma demande','/devis/']
};
function set(key,btn){var p=routes[key];if(!p)return;
e.querySelectorAll('button.choice').forEach(function(b){var yes=b===btn;b.classList.toggle('active',yes);b.setAttribute('aria-selected',yes?'true':'false');b.tabIndex=yes?0:-1});
var m={'#type-label':p[0],'#path-title':p[1],'#path-desc':p[2],'#path-link':p[3]};Object.keys(m).forEach(function(k){var node=e.querySelector(k);if(node)node.textContent=m[k]});var a=e.querySelector('#path-link');if(a)a.href=p[4];}
e.querySelectorAll('button.choice').forEach(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-target'),b)})});
var tabs=[].slice.call(e.querySelectorAll('button.choice'));tabs.forEach(function(b,i){b.addEventListener('keydown',function(evt){if(evt.key!=='ArrowDown'&&evt.key!=='ArrowUp'&&evt.key!=='Home'&&evt.key!=='End')return;evt.preventDefault();var n=evt.key==='Home'?0:evt.key==='End'?tabs.length-1:(i+(evt.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length;tabs[n].focus();set(tabs[n].getAttribute('data-target'),tabs[n]);})});
set('pro',e.querySelector('button.choice[data-target="pro"]'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();})();
