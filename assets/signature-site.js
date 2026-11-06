/* SIGNATURE preproduction safety gate. Remove only during an explicit validated production transition. */
(function(){'use strict';
var stage=document.querySelector('.signature-preview-banner'); if(!stage)return;
if(stage.querySelector('strong'))stage.querySelector('strong').textContent='PRÉPRODUCTION SIGNATURE V1.4';
// A receipt from the local test server is NEVER a receipt from the Limpid CRM.
if(location.hostname==='127.0.0.1'){
 try{var lastLab=sessionStorage.getItem('limpid_last_local_lab');
   if(lastLab && /^LMP-[A-Z0-9-]{8,50}$/.test(lastLab))stage.textContent='ESSAI LOCAL UNIQUEMENT : '+lastLab+' — aucun dossier transmis au CRM de production.';
 }catch(e){}
}
// Existing business scripts stay unchanged. This gate is limited to form/network submits in preview.
document.addEventListener('submit',function(e){if(e.target&&e.target.id==='f-form')return;e.preventDefault();e.stopImmediatePropagation();window.alert('Préproduction SIGNATURE : cette demande n’a pas été envoyée. Les envois seront testés lors de la recette technique.');},true);
if(typeof window.fetch==='function'){
 var previousFetch=window.fetch.bind(window);
 window.fetch=function(resource,init){
  var u=typeof resource==='string'?resource:(resource&&resource.url)||'';
  if(/api\.web3forms\.com|script\.google\.com\/macros\//i.test(u)){
   var isLab = location.hostname === '127.0.0.1' && location.port === '8765'
      && new URLSearchParams(location.search).get('bridge_lab') === '1'
      && new URLSearchParams(location.search).get('test') === '1';
   var caseData = null;
   if(window.LimpidIntakeLab && init && init.body instanceof FormData){caseData=window.LimpidIntakeLab.capture(init.body);}
   if(isLab && caseData && init.body && init.body.get('code_import')){
      var payload = new FormData();
      payload.append('code_import', String(init.body.get('code_import')));
      window.LimpidIntakeLab.files().forEach(function(file){payload.append('photos',file,file.name);});
      return previousFetch('/__lab/api/demandes',{method:'POST',body:payload,credentials:'same-origin'})
       .then(function(r){return r.json().then(function(data){
          if(r.ok && data.ok && data.statut==='RECU_LAB'){
             var banner=document.querySelector('.signature-preview-banner');
             if(banner){banner.textContent='LABORATOIRE LOCAL UNIQUEMENT — dossier '+data.reference+' enregistré ici, NON reçu dans le CRM Limpid.';}
             try{sessionStorage.setItem('limpid_last_local_lab',data.reference);}catch(e){}
             if(window.LimpidIntakeLab.markLabReceipt)window.LimpidIntakeLab.markLabReceipt(data.reference);
             return new Response(JSON.stringify({success:true,lab:true,reference:data.reference}),{status:200,headers:{'Content-Type':'application/json'}});
          }
          return new Response(JSON.stringify({success:false,message:'Laboratoire local : '+(data.erreur||'reception refusee')}),{status:r.status,headers:{'Content-Type':'application/json'}});
       });});
   }
   return Promise.resolve(new Response(JSON.stringify({success:false,message:'Préproduction : aucun envoi autorisé'}),{status:403,headers:{'Content-Type':'application/json'}}));
  }
  return previousFetch(resource,init);
 };
}
})();
(function(){'use strict';var imgs=document.querySelectorAll('.lx-beforeafter input[type="range"]');imgs.forEach(function(input){var root=input.closest('.lx-beforeafter');if(!root)return;var render=function(){root.style.setProperty('--lx-compare',input.value+'%')};input.addEventListener('input',render);render()})})();
