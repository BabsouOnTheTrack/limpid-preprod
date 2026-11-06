(() => {
 const toggle=document.querySelector('.mobile-menu');const menu=document.querySelector('.primary-nav');
 if(toggle && menu){toggle.addEventListener('click',()=>{let open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}})}
 const needs={
 regular:{k:'Une présence fiable',t:'Un entretien qui respecte votre organisation.',d:'Nous préparons les passages autour de vos locaux, de vos horaires d’activité et des tâches à réaliser. L’objectif : une prestation compréhensible, sans complexité inutile.',icon:'calendar',at:'Votre rythme, vos contraintes.',ad:'Accès aux locaux, fréquence souhaitée, zones prioritaires et attentes particulières : les bonnes questions arrivent au bon moment.'},
 replace:{k:'Une alternative sereine',t:'Changer de prestataire, sans bouleverser votre activité.',d:'Vous n’êtes pas pleinement satisfait de votre entretien actuel ? Nous commençons par identifier vos irritants, vos exigences et les conditions d’une reprise possible.',icon:'refresh',at:'Partir de ce qui doit changer.',ad:'Régularité, niveau de finition, horaires, communication : votre expérience actuelle aide à définir une réponse plus adaptée.'},
 once:{k:'Une mission cadrée',t:'Un besoin ponctuel mérite une réponse précise.',d:'Vitres, remise en état, nettoyage approfondi ou demande particulière : chaque chantier nécessite une description fiable avant chiffrage.',icon:'window',at:'Les détails font la différence.',ad:'Surface, accessibilité, état initial et conditions d’intervention sont examinés pour proposer une prestation réaliste.'}
 };
 const tabs=[...document.querySelectorAll('[data-need]')];if(tabs.length){
 const display=(b,focus=false)=>{const d=needs[b.dataset.need];tabs.forEach(x=>{x.setAttribute('aria-selected',String(x===b));x.tabIndex=x===b?0:-1});
 document.getElementById('need-panel').setAttribute('aria-labelledby',b.id);document.getElementById('need-kicker').textContent=d.k;
 document.getElementById('need-title').textContent=d.t;document.getElementById('need-copy').textContent=d.d;
 document.getElementById('need-icon').src='../assets/icons/'+d.icon+'.svg';document.getElementById('need-aside-title').textContent=d.at;
 document.getElementById('need-aside-copy').textContent=d.ad;if(focus)b.focus()};
 tabs.forEach((b,i)=>{b.addEventListener('click',()=>display(b));b.addEventListener('keydown',e=>{let dest=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:null;if(dest!==null){e.preventDefault();display(tabs[dest],true)}})})
 }
})();