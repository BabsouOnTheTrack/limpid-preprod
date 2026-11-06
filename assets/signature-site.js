/* SIGNATURE preproduction safety gate. Remove only during an explicit validated production transition. */
(function(){'use strict';
var stage=document.querySelector('.signature-preview-banner'); if(!stage)return;
// Existing business scripts stay unchanged. This gate is limited to form/network submits in preview.
document.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();window.alert('Préproduction SIGNATURE : cette demande n’a pas été envoyée. Les envois seront testés lors de la recette technique.');},true);
if(typeof window.fetch==='function'){
 var previousFetch=window.fetch.bind(window);
 window.fetch=function(resource,init){
  var u=typeof resource==='string'?resource:(resource&&resource.url)||'';
  if(/api\.web3forms\.com|script\.google\.com\/macros\//i.test(u))return Promise.resolve(new Response(JSON.stringify({success:false,message:'Préproduction : envoi désactivé'}),{status:403,headers:{'Content-Type':'application/json'}}));
  return previousFetch(resource,init);
 };
}
})();
(function(){'use strict';var imgs=document.querySelectorAll('.lx-beforeafter input[type="range"]');imgs.forEach(function(input){var root=input.closest('.lx-beforeafter');if(!root)return;var render=function(){root.style.setProperty('--lx-compare',input.value+'%')};input.addEventListener('input',render);render()})})();
