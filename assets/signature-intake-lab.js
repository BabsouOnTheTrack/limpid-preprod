/* LIMPID SIGNATURE V1.3 — DEMO FRONTEND INTAKE, ZERO TRANSFER.
   4 original engines stay untouched. No PII is written to storage or log.
   True end-to-end reception requires a secured server gateway and CRM lab integration. */
(function(){'use strict';
if(!document.querySelector('.signature-preview-banner'))return;
var general=!!document.getElementById('f-form');
var specialized=!!document.getElementById('pc-corps');
if(!general&&!specialized)return;
var selected=[],last=null,scheduled=false,MAX_FILES=6,MAX_FILE_BYTES=5*1024*1024,MAX_TOTAL=20*1024*1024;
var types={'image/jpeg':1,'image/png':1,'image/webp':1};
var accepted='image/jpeg,image/png,image/webp';
function elt(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
function announce(txt){var s=document.querySelector('#signature-pj-status');if(s)s.textContent=txt;}
function photoPanel(){
 var box=elt('section','signature-pj');box.id='signature-pj-panel';box.setAttribute('aria-label','Photos du chantier');
 var heading=elt('strong','', 'Photographies du chantier (facultatif)');
 var detail=elt('p','','Ajoutez vos photos ici, avec votre configuration : aucune application ni message séparé. En préproduction, les fichiers restent sur cet appareil et ne sont pas transmis.');
 var input=elt('input');input.type='file';input.id='signature-pj-files';input.multiple=true;input.accept=accepted;
 input.setAttribute('aria-label','Ajouter des photographies au dossier');
 var list=elt('ul');list.id='signature-pj-list';list.setAttribute('aria-label','Photographies sélectionnées');
 var status=elt('p','signature-pj-status','6 photos maximum, 5 Mo par photo, 20 Mo au total. JPEG, PNG ou WebP.');status.id='signature-pj-status';
 box.append(heading,detail,input,list,status);
 input.addEventListener('change',function(){
   var items=Array.from(input.files||[]),errors=[];
   items.forEach(function(f){
     if(!types[f.type]){errors.push('Type refusé : '+f.name);return;}
     if(f.size<=0||f.size>MAX_FILE_BYTES){errors.push('Photo trop volumineuse : '+f.name);return;}
     if(selected.length>=MAX_FILES || selected.reduce(function(s,x){return s+x.file.size;},0)+f.size>MAX_TOTAL){errors.push('Limite du dossier atteinte.');return;}
     // Never persist image bytes in localStorage, sessionStorage or URLs sent to backend.
     var url=URL.createObjectURL(f);selected.push({file:f,url:url});
   });input.value='';renderPhotos();announce(errors.join(' ')||(selected.length+' photo(s) préparée(s) pour le dossier de test — non transmises.'));
 });
 return box;
}
function renderPhotos(){
 var l=document.getElementById('signature-pj-list');if(!l)return;
 while(l.firstChild)l.removeChild(l.firstChild);
 selected.forEach(function(x,i){
  var li=elt('li');var img=elt('img');img.src=x.url;img.alt='Aperçu photo '+(i+1);img.loading='lazy';
  var name=elt('span','',x.file.name);var b=elt('button','','×');b.type='button';b.setAttribute('aria-label','Retirer '+x.file.name);
  b.addEventListener('click',function(){URL.revokeObjectURL(x.url);selected.splice(i,1);renderPhotos();announce(selected.length+' photo(s) préparée(s) — non transmises.');});
  li.append(img,name,b);l.append(li);
 });
}
function mount(){
 if(document.getElementById('signature-pj-panel'))return;
 var place=null;
 if(general){
  var form=document.getElementById('f-form');if(!form)return;
  place=form; // Photo block must be before contact form, same request flow.
  var legacy=document.getElementById('f-photos');
  if(legacy){var ancestor=legacy.closest('.cf-champ');if(ancestor)ancestor.hidden=true;else legacy.hidden=true;}
 }else{
  var body=document.getElementById('pc-corps');if(!body)return;
  // All three specialized wizards render the contact screen with data-k=nom/email;
  // only vitres also has legacy [data-photos]. Never show this block on a callback screen.
  var email=body.querySelector('input[data-k="email"]');
  var nom=body.querySelector('input[data-k="nom"]');
  if(!email||!nom)return;
  var old=body.querySelector('[data-photos]');
  var parent=old&&old.closest('.cf-champ');
  if(parent)parent.hidden=true;
  // Append within this contact step; photos are linked to the same folder, never a second request.
  place=body;
 }
 if(place){if(general)place.insertAdjacentElement('beforebegin',photoPanel());else place.append(photoPanel());renderPhotos();}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;mount();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){mount();observe();});else {mount();observe();}
function observe(){if(!specialized)return;var root=document.getElementById('pc-corps');if(root){new MutationObserver(schedule).observe(root,{childList:true,subtree:true});}}
function decodeLimpid(code){
 if(typeof code!=='string'||code.length>170000||!code.startsWith('LIMPID1.'))throw Error('Code de dossier absent/invalide');
 var s=code.slice(8),decoded=atob(s),raw=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;i++)raw[i]=decoded.charCodeAt(i);
 var data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));
 if(!data||data.v!==2||typeof data.id!=='string'||!/^LMP-[A-Z0-9-]{8,50}$/.test(data.id)||!data.client||!Array.isArray(data.demandes))
   throw Error('Dossier LIMPID1 incohérent');
 return data;
}
function inform(message,reference){
 var prev=document.querySelector('.signature-intake-indicator');if(prev)prev.remove();
 var div=elt('div','signature-intake-indicator');div.setAttribute('role','status');
 div.append(elt('strong','',message),elt('p','','Référence '+(reference||'non déterminée')+'. Les données et photos ne sont pas envoyées au CRM depuis cette préproduction.'));
 var close=elt('button','','Fermer');close.type='button';close.addEventListener('click',function(){div.remove();});div.append(close);document.body.append(div);
}
function capture(form){
 if(!(form instanceof FormData))return null;
 var code=form.get('code_import'),data;
 try{data=decodeLimpid(code);}catch(e){inform('Dossier de test incomplet','');return null;}
 var meta=selected.map(function(x,i){return {position:i+1,nom:x.file.name,type:x.file.type,octets:x.file.size};});
 // No bytes or identity placed in storage, analytics or logs.
 last={schema:'limpid.site-dossier.v1',reference:data.id,parcours:data.parcours||'',codeImport:code,
   demande:data,photos:meta,statut:'NON_TRANSMIS_PREPRODUCTION',creeeLe:new Date().toISOString()};
 inform('Dossier structuré prêt en préproduction',data.id);
 return {reference:data.id,photos:meta.length,statut:last.statut};
}
// Test hooks are RAM-only; in production the server confirms successful ingestion and file attachment.
window.LimpidIntakeLab={capture:capture,read:function(){return last;},files:function(){return selected.map(function(x){return x.file;});},markLabReceipt:function(ref){inform('Réception confirmée dans le laboratoire local (aucun envoi CRM)',ref);announce(selected.length+' photo(s) enregistrée(s) sur cet ordinateur de test.');},selectedCount:function(){return selected.length;},schema:'limpid.site-dossier.v1'};
})();
