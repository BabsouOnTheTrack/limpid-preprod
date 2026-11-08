/* LIMPID SIGNATURE — V1.26 | STAGING ONLY | no production CRM/email.
   Public Turnstile site key. Token strictly verified server-side in the V1.24 Worker.
   Never accept real contact information or attachments in this isolated test. */
(function(){'use strict';
  var HOST='limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev';
  var API='https://limpid-intake-staging.cabochondreams.workers.dev/api/demandes';
  var SITEKEY='0x4AAAAAAF4rxBmF28G_sv1f';
  var SERVICES={menage:true,vitres:true,b2b:true,general:true};
  var loading=null,locked=false;
  function fail(text){throw new Error(text);}
  function readCode(code){
    if(typeof code!=='string'||code.length>49000||!/^LIMPID1\.[A-Za-z0-9+/=]+$/.test(code))fail('Le code LIMPID1 est absent ou invalide.');
    var raw;
    try{
      var b=atob(code.slice(8)),bytes=new Uint8Array(b.length);
      for(var i=0;i<b.length;i++)bytes[i]=b.charCodeAt(i);
      raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    }catch(e){fail('Le code LIMPID1 ne peut pas être décodé.');}
    return raw;
  }
  function rejectFiles(value,parent,depth){
    if(depth>35)fail('Structure de dossier non autorisée.');
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){value.forEach(function(x){rejectFiles(x,parent,depth+1);});return;}
    Object.keys(value).forEach(function(k){
      var n=k.toLowerCase().replace(/-/g,'_');
      if(/^(photo|photos|photographies|image|images|image_base64|images_base64|piece_jointe|pieces_jointes|piecesjointes|attachments|attachment|fichier|fichiers|files|file|uploads|photo_urls|photo_url)$/.test(n)){
        if(!(parent==='client'&&n==='photos'&&value[k]===false))fail('Les photographies ne sont pas prises en charge dans ce test.');
      }else rejectFiles(value[k],n,depth+1);
    });
  }
  function check(paquet,service,testMode){
    if(location.protocol!=='https:'||location.hostname!==HOST)fail('Envoi désactivé hors de la préproduction autorisée.');
    if(testMode!==true||!paquet||paquet.test!==true)fail('Activez le mode test avec ?test=1. Aucun dossier réel n’est accepté.');
    if(!SERVICES[service]||!Array.isArray(paquet.entrees))fail('Parcours non reconnu.');
    var codes=paquet.entrees.filter(function(x){return Array.isArray(x)&&x[0]==='code_import';});
    if(codes.length!==1)fail('Code d’import unique manquant.');
    var code=codes[0][1],d=readCode(code),c=d&&d.client;
    if(!d||d.v!==2||d.type!=='devis'||d.test!==true||d.rappel||
       !/^LMP-[A-Z0-9-]{8,50}$/.test(d.id||'')||d.id!==paquet.id||d.parcours!==service)fail('Dossier de test non conforme.');
    if(!c||typeof c!=='object'||Array.isArray(c)||typeof c.nom!=='string'||!/fictif/i.test(c.nom)||
       typeof c.email!=='string'||!/@[a-z0-9.-]+\.invalid$/i.test(c.email)||
       typeof c.tel!=='string'||!['0000000000','0600000000'].includes(c.tel))
       fail('Utilisez exclusivement un nom contenant « fictif », une adresse en .invalid et 0600000000.');
    if(!Array.isArray(d.demandes)||!d.demandes.length||d.demandes.length>8||
       d.demandes.some(function(x){return !x||typeof x.offre!=='string'||!x.offre.trim();}))fail('Prestations de test invalides.');
    if(d.date){var delta=Date.now()-Date.parse(d.date);if(!isFinite(delta)||Math.abs(delta)>48*3600000)fail('Date de dossier incorrecte.');}
    if(window.LimpidIntakeLab&&typeof window.LimpidIntakeLab.selectedCount==='function'&&window.LimpidIntakeLab.selectedCount()>0)
      fail('Retirez les photos : aucun fichier ne doit être envoyé au LAB.');
    rejectFiles(d,'',0);
    return {ref:d.id,service:service,code:code};
  }
  function loadTurnstile(){
    if(window.turnstile&&typeof window.turnstile.render==='function')return Promise.resolve(window.turnstile);
    if(loading)return loading;
    loading=new Promise(function(resolve,reject){
      var tag=document.createElement('script');tag.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      tag.async=true;tag.defer=true;
      tag.onload=function(){
        if(window.turnstile&&typeof window.turnstile.render==='function')resolve(window.turnstile);
        else reject(new Error('Turnstile indisponible.'));
      };
      tag.onerror=function(){reject(new Error('Impossible de charger Turnstile.'));};
      document.head.appendChild(tag);
    }).catch(function(e){loading=null;throw e;});
    return loading;
  }
  function newDialog(){
    var wrap=document.createElement('div');wrap.className='sig-lab-v126-mask';
    wrap.innerHTML='<div class="sig-lab-v126-dialog" role="dialog" aria-modal="true" aria-label="Vérification de dossier fictif">'+
      '<div class="sig-lab-v126-eyebrow">LIMPID · STAGING UNIQUEMENT</div>'+
      '<h2>Vérification de la demande fictive</h2>'+
      '<p>Ce test n’envoie aucun e-mail client et ne crée aucun devis. Aucune photographie n’est transmise.</p>'+
      '<div class="sig-lab-v126-turnstile" aria-label="Contrôle Turnstile"></div>'+
      '<button class="sig-lab-v126-cancel" type="button">Annuler l’essai</button></div>';
    document.body.appendChild(wrap);
    return wrap;
  }
  function challenge(){
    return new Promise(function(resolve,reject){
      var wrap=newDialog(),timer=null,widget=null,done=false,ts=null;
      function end(err,token){
        if(done)return;done=true;
        if(timer!==null)clearTimeout(timer);
        if(ts&&widget!==null&&typeof ts.remove==='function')try{ts.remove(widget);}catch(e){}
        wrap.remove();
        if(err)reject(err);else resolve(token);
      }
      wrap.querySelector('.sig-lab-v126-cancel').addEventListener('click',function(){end(new Error('Vérification annulée.'));});
      timer=setTimeout(function(){end(new Error('Délai Turnstile dépassé. Réessayez.'));},90000);
      loadTurnstile().then(function(api){
        if(done)return;ts=api;
        widget=ts.render(wrap.querySelector('.sig-lab-v126-turnstile'),{
          sitekey:SITEKEY,theme:'light',appearance:'always',
          callback:function(token){if(typeof token==='string'&&token.length>0)end(null,token);else end(new Error('Jeton Turnstile vide.'));},
          'error-callback':function(){end(new Error('Vérification Turnstile impossible.'));},
          'expired-callback':function(){end(new Error('Vérification Turnstile expirée.'));}
        });
        if(widget===undefined||widget===null)end(new Error('Widget Turnstile indisponible.'));
      }).catch(end);
    });
  }
  async function send(paquet,service,testMode){
    if(locked)fail('Un envoi est déjà en cours.');
    var body=check(paquet,service,testMode);
    locked=true;
    try{
      var token=await challenge();
      var r=await fetch(API,{
        method:'POST',mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',
        headers:{'Content-Type':'application/json','X-Limpid-Turnstile':token},body:JSON.stringify(body)
      });
      var response;try{response=await r.json();}catch(e){fail('La passerelle n’a pas renvoyé une confirmation lisible.');}
      if(r.status!==201||!response||response.ok!==true||response.reference!==body.ref||response.statut!=='enregistre_lab'||response.mode!=='TEST_ISOLE')
        fail('Enregistrement non confirmé : '+(response&&typeof response.error==='string'?response.error:'réponse inattendue'));
      return {ok:true,reference:body.ref,statut:response.statut};
    }finally{locked=false;}
  }
  window.LimpidLabV126=Object.freeze({send:send,version:'1.26',mode:'TEST_ISOLE'});
})();
