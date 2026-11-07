/* LIMPID SIGNATURE — Entrée directe dans les questions.
   Ne modifie aucun calcul ni l'état métier, passe par le bouton moteur existant. */
(function(){
  'use strict';
  function start(){
    if(new URLSearchParams(window.location.search).get('presentation')==='1')return;
    const landing=document.getElementById('pc-accueil');
    const wizard=document.getElementById('pc-app');
    if(!landing||!wizard||landing.hidden||!wizard.hidden)return;
    const button=landing.querySelector('button[data-pc-demarrer]');
    if(!button)return;
    button.click();
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',start,{once:true});}
  else{start();}
})();
