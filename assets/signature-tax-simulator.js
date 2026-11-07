/* LIMPID SIGNATURE V1.14 — simulateur fiscal pédagogique en page service.
   Ne transmet aucune donnée et n'intervient pas dans les calculs de devis. */
(function(){
 'use strict';
 function init(){
  var root=document.querySelector('[data-sig-tax-sim]');if(!root)return;
  var heading=root.querySelector('[data-tax-heading]');
  var track=root.querySelector('[data-tax-track]');
  var paid=root.querySelector('[data-tax-paid]');
  var credit=root.querySelector('[data-tax-credit]');
  var explanation=root.querySelector('[data-tax-explanation]');
  var messages={
   classic:{heading:'Vous réglez 100 %',paid:'100 %',credit:'',aria:'Sans avance immédiate : 100 % de la facture sont réglés avant crédit d’impôt',explanation:'Vous payez la totalité de la facture. Le crédit d’impôt de 50 % des dépenses éligibles est ensuite pris en compte lors de votre déclaration fiscale, selon les conditions applicables.'},
   advance:{heading:'Vous réglez 50 %',paid:'50 %',credit:'50 % crédit d’impôt',aria:'Avec avance immédiate : 50 % réglés par le client, 50 % déduits via le crédit d’impôt',explanation:'Si vous êtes éligible et que l’Avance immédiate est activée, vous ne réglez que votre part : 50 % du montant éligible, dans la limite des plafonds et règles applicables.'}
  };
  function render(mode){
   if(!messages[mode])return;
   var item=messages[mode];root.dataset.mode=mode;heading.textContent=item.heading;
   paid.textContent=item.paid;credit.textContent=item.credit;
   credit.hidden=mode!=='advance';track.setAttribute('aria-label',item.aria);explanation.textContent=item.explanation;
   root.querySelectorAll('[data-tax-mode]').forEach(function(button){button.setAttribute('aria-pressed',button.dataset.taxMode===mode?'true':'false');});
  }
  root.querySelectorAll('[data-tax-mode]').forEach(function(button){button.addEventListener('click',function(){render(button.dataset.taxMode);});});
  render('classic');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
