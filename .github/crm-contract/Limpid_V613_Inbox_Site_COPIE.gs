/**
 * LIMPID V6 — Inbox des demandes du site : LAB COPIE SEULEMENT.
 * Source additionnelle : NE PAS installer dans le projet Apps Script de production.
 * Ne remplace aucun fichier Code.js, Devis.html, Index.html.
 * Aucun endpoint doGet/doPost ; aucune UrlFetchApp ; aucun ACK vers D1/Cloudflare.
 * Les seules écritures autorisées visent l'onglet LAB_Inbox_Site_V1_TEST d'un tableur LAB.
 * Préconditions de toutes les écritures : Script ID != ID de production,
 * Script ID identique à la propriété autorisée, mode TEST_ISOLE,
 * identifiant de tableur LAB strictement égal à celui ci-dessous et propriété explicite.
 */
var LIMPID_V613_INBOX_COPIE = Object.freeze({
  VERSION:'V6.13-Inbox-Site-LAB-V1',
  PRODUCTION_SCRIPT_ID:'182t33Hy3RxZ7n3V5htxYndKddKdYv2bMqf_AEkjCKAOc5PAdGomUokZI',
  PRODUCTION_SHEET_ID:'10loSjoDKj_rcPDIr-NVgE8b9b6dyCdoobj2gMhp0d2M',
  LAB_SHEET_ID:'1z8KLlpO1EQ35c6ZBFrtxcYMIO33tXcFEv715lqSmqBQ',
  TAB:'LAB_Inbox_Site_V1_TEST',
  MAX_CODE:65000,
  HEADERS:['recu_utc','reference','empreinte_sha256','parcours','type','client_fictif',
    'email_fictif','telephone_fictif','commune','prestations','creneau_rappel',
    'photos_a_transmettre','etat','code_import_limpid1','maj_utc','note_test']
});

function v613InboxErreur_(code){throw new Error('LIMPID_INBOX_COPIE_'+code);}
function v613InboxNormaliseTexte_(x,max){return String(x == null ? '' : x).trim().slice(0,max || 500);}
function v613InboxCellule_(x){
  var s=v613InboxNormaliseTexte_(x,5000);
  return /^[=+@\-\t\r]/.test(s) ? "'"+s : s;
}
function v613InboxSHA_(code){
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,code,Utilities.Charset.UTF_8)
    .map(function(x){return ('0'+(x & 255).toString(16)).slice(-2);}).join('');
}
function v613InboxDecoder_(code){
  if(typeof code!=='string'||code.length> LIMPID_V613_INBOX_COPIE.MAX_CODE||
    !/^LIMPID1\.[A-Za-z0-9+/=]+$/.test(code))v613InboxErreur_('CODE_INVALIDE');
  var d;
  try{
    var txt=Utilities.newBlob(Utilities.base64Decode(code.slice(8))).getDataAsString('UTF-8');
    d=JSON.parse(txt);
  }catch(e){v613InboxErreur_('DECODAGE_IMPOSSIBLE');}
  if(!d||typeof d!=='object'||Array.isArray(d)||d.v!==2||d.test!==true||
    !/^LMP-[A-Z0-9-]{8,50}$/.test(d.id||'')||
    ['general','menage','vitres','b2b'].indexOf(d.parcours)<0||
    ['devis','rappel'].indexOf(d.type)<0)v613InboxErreur_('TEST_V2_OBLIGATOIRE');
  if(!d.client||typeof d.client!=='object'||Array.isArray(d.client)||
    !/TEST|FICTIF|EXEMPLE/i.test(d.client.nom||''))v613InboxErreur_('IDENTITE_FICTIVE_OBLIGATOIRE');
  var e=v613InboxNormaliseTexte_(d.client.email,254).toLowerCase();
  if(e&&!/^[^\s@]+@(example\.(com|org|net|invalid)|test\.invalid)$/.test(e))
    v613InboxErreur_('EMAIL_REEL_INTERDIT');
  var tel=v613InboxNormaliseTexte_(d.client.tel,40).replace(/\s/g,'');
  if(tel&&!/^(?:\+33[1-9]0{8}|0[1-9]0{8}|0{10})$/.test(tel))
    v613InboxErreur_('TELEPHONE_TEST_OBLIGATOIRE');
  if(!Array.isArray(d.demandes))v613InboxErreur_('PRESTATIONS_INVALIDES');
  if(d.type==='rappel'){
    if(d.parcours==='general'||d.demandes.length!==0||!tel||!d.rappel||
      ['matin','midi','aprem','soir','indiff'].indexOf(d.rappel.creneau)<0)
      v613InboxErreur_('RAPPEL_INVALIDE');
  } else {
    var types={regulier:'menage',grand:'grand',vitres:'vitres',bureaux:'bureaux',textile:'textile'};
    if(!e||d.demandes.length<1||d.demandes.length>8||d.demandes.some(function(x){
      return !x||!Object.prototype.hasOwnProperty.call(types,x.offre)||
        !x.saisie||x.saisie.type!==types[x.offre];
    }))v613InboxErreur_('DEVIS_INIMPORTABLE');
  }
  if(d.client.photos!==undefined&&typeof d.client.photos!=='boolean')v613InboxErreur_('PHOTO_NON_BOOLEENNE');
  // Aucune URL de pièce jointe ni donnée photo encodée n'est acceptée, même en TEST.
  function interdits(node,key,depth){
    if(depth>25)v613InboxErreur_('PROFONDEUR_EXCESSIVE');
    if(Array.isArray(node)){node.forEach(function(x){interdits(x,key,depth+1);});return;}
    if(!node||typeof node!=='object')return;
    Object.keys(node).forEach(function(k){
      if(/^(?:attachments?|pieces?jointes?|images?|files?|photo(?:url|data)?|base64)$/i.test(k) ||
        (/photos/i.test(k)&&!(key==='client'&&k==='photos'&&typeof node[k]==='boolean')))
        v613InboxErreur_('PIECE_JOINTE_NON_ACCEPTEE');
      interdits(node[k],k,depth+1);
    });
  }
  interdits(d,'',0);
  var prestations=d.demandes.map(function(x){return v613InboxNormaliseTexte_(x.lib||x.offre,180);});
  return {dossier:d,reference:d.id,sha256:v613InboxSHA_(code),parcours:d.parcours,
    type:d.type,nom:v613InboxNormaliseTexte_(d.client.nom,180),
    email:e,telephone:tel,commune:v613InboxNormaliseTexte_(d.client.commune,120),
    prestations:prestations,creneau:d.type==='rappel'?d.rappel.creneau:'',
    photosAEnvoyer:d.type==='devis'&&d.client.photos===true,codeImport:code};
}

/** Prévisualisation sans accès à une base, uniquement pour codes fictifs test:true. */
function limpidInboxCopie_previsualiserLIMPID1(code){
  var x=v613InboxDecoder_(code);
  return {ok:true,reference:x.reference,empreinte:x.sha256,type:x.type,
    service:x.parcours,prestations:x.prestations,photosAEnvoyer:x.photosAEnvoyer,
    ecriture:false,ack:false};
}

/** Double verrou explicite : impossible d'écrire dans le vrai projet exporté. */
function v613InboxVerifierCopie_(){
  var c=LIMPID_V613_INBOX_COPIE,p=PropertiesService.getScriptProperties(),sid=ScriptApp.getScriptId();
  if(!sid||sid===c.PRODUCTION_SCRIPT_ID)v613InboxErreur_('SCRIPT_PRODUCTION_BLOQUE');
  if(p.getProperty('LIMPID_V613_MODE')!=='TEST_ISOLE'||
     p.getProperty('LIMPID_V613_SCRIPT_ID_COPIE')!==sid||
     p.getProperty('LIMPID_V613_TABLEUR_LAB')!==c.LAB_SHEET_ID||
     p.getProperty('LIMPID_V613_ECRITURE_TEST')!=='OUI')v613InboxErreur_('VERROUS_COPIE_FERMES');
  if(p.getProperty('LIMPID_V613_TABLEUR_LAB')===c.PRODUCTION_SHEET_ID)
    v613InboxErreur_('TABLEUR_PRODUCTION_INTERDIT');
  return SpreadsheetApp.openById(c.LAB_SHEET_ID);
}
function limpidInboxCopie_diagnostic(){
  var c=LIMPID_V613_INBOX_COPIE,p=PropertiesService.getScriptProperties(),sid=ScriptApp.getScriptId();
  return {version:c.VERSION,scriptIsProduction:sid===c.PRODUCTION_SCRIPT_ID,
    scriptIdentifie:!!sid,modeOK:p.getProperty('LIMPID_V613_MODE')==='TEST_ISOLE',
    scriptCopieAutorise:!!sid&&sid!==c.PRODUCTION_SCRIPT_ID&&p.getProperty('LIMPID_V613_SCRIPT_ID_COPIE')===sid,
    tableurLabOK:p.getProperty('LIMPID_V613_TABLEUR_LAB')===c.LAB_SHEET_ID,
    ecritureTestOK:p.getProperty('LIMPID_V613_ECRITURE_TEST')==='OUI',
    destination:c.TAB,aucuneACK:true};
}
function v613InboxOnglet_(ss){
  var c=LIMPID_V613_INBOX_COPIE,sh=ss.getSheetByName(c.TAB);
  if(!sh){sh=ss.insertSheet(c.TAB);sh.getRange(1,1,1,c.HEADERS.length).setValues([c.HEADERS]);
    sh.setFrozenRows(1);return sh;}
  var h=sh.getRange(1,1,1,c.HEADERS.length).getValues()[0];
  if(JSON.stringify(h)!==JSON.stringify(c.HEADERS))v613InboxErreur_('COLONNES_NON_CONFORMES');
  return sh;
}
function v613InboxTrouver_(sh,ref){
  var last=sh.getLastRow(),found=[];
  if(last<=1)return found;
  if(last>5001)v613InboxErreur_('LIMITE_LIGNES_TEST');
  var vals=sh.getRange(2,2,last-1,2).getValues();
  for(var i=0;i<vals.length;i++)if(String(vals[i][0])===ref)found.push({ligne:i+2,sha:String(vals[i][1])});
  return found;
}
/** Écrit exclusivement dans le tableur LAB, jamais dans la base CRM centrale.
 * La réussite ne déclenche jamais un ACK : elle signifie uniquement « inbox fictive persistée ».
 */
function limpidInboxCopie_importerLIMPID1TEST(code){
  var d=v613InboxDecoder_(code),ss=v613InboxVerifierCopie_();
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(15000))v613InboxErreur_('VERROU_OCCUPE');
  try{
    // Vérifier à nouveau les propriétés après acquisition du verrou.
    v613InboxVerifierCopie_();
    var sh=v613InboxOnglet_(ss),existing=v613InboxTrouver_(sh,d.reference);
    if(existing.length){
      if(existing.length!==1||existing[0].sha!==d.sha256)
        return {ok:false,etat:'CONFLIT_QUARANTAINE',reference:d.reference,ackAutorise:false};
      var row=sh.getRange(existing[0].ligne,2,1,3).getValues()[0];
      if(String(row[0])!==d.reference||String(row[1])!==d.sha256)
        v613InboxErreur_('RELECTURE_DUPLICAT_INCOHERENTE');
      return {ok:true,etat:'EXISTANT_IDENTIQUE',reference:d.reference,ligne:existing[0].ligne,
        sha256:d.sha256,ackAutorise:false};
    }
    var stamp=new Date().toISOString(),r=[stamp,d.reference,d.sha256,d.parcours,d.type,
      v613InboxCellule_(d.nom),v613InboxCellule_(d.email),v613InboxCellule_(d.telephone),
      v613InboxCellule_(d.commune),v613InboxCellule_(d.prestations.join(' / ')),
      d.creneau,d.photosAEnvoyer?'OUI':'NON','A_QUALIFIER_TEST',d.codeImport,stamp,
      'Simulation exclusivement : ne pas créer de prospect/devis et ne pas acquitter D1'];
    sh.appendRow(r);
    SpreadsheetApp.flush();
    var line=sh.getLastRow();
    var verify=sh.getRange(line,2,1,13).getValues()[0];
    if(String(verify[0])!==d.reference||String(verify[1])!==d.sha256||
      String(verify[12])!==d.codeImport || String(verify[11])!=='A_QUALIFIER_TEST')
      v613InboxErreur_('RELECTURE_PERSISTANCE_ECHEC');
    return {ok:true,etat:'INSERE_TEST',reference:d.reference,sha256:d.sha256,
      ligne:line,preuve:'LAB_RELU',ackAutorise:false};
  }finally{lock.releaseLock();}
}

/** Liste restreinte : pas de code d'import, pas de coordonnées personnelles. */
function limpidInboxCopie_listerTEST(limit){
  var ss=v613InboxVerifierCopie_(),sh=ss.getSheetByName(LIMPID_V613_INBOX_COPIE.TAB);
  if(!sh)return {ok:true,total:0,dossiers:[],ackAutorise:false};
  var last=sh.getLastRow();if(last<=1)return {ok:true,total:0,dossiers:[],ackAutorise:false};
  var n=Math.min(Math.max(1,Number(limit)||20),50,last-1),start=last-n+1;
  var rows=sh.getRange(start,1,n,13).getValues();
  return {ok:true,total:last-1,dossiers:rows.map(function(r){return {
    reference:String(r[1]),empreinte:String(r[2]),parcours:String(r[3]),
    type:String(r[4]),photosAEnvoyer:r[11]==='OUI',etat:String(r[12])};}),
    ackAutorise:false};
}

/** Jamais utilisé côté serveur pour un ACK réelle. */
function limpidInboxCopie_simulerACK(){
  return {ok:false,ackAutorise:false,raison:'MODE_COPIE_INTERDIT_TOUT_ACK_D1'};
}

/**
 * Permet un test du LAB par un propriétaire de copie sans manipulation de codes longs.
 * 5 dossiers entièrement fictifs, aucun secret, téléphone de démonstration 0600000000.
 * L'appel reste soumis à TOUS les verrous ci-dessus ; il ne touche pas au CRM réel.
 */
function limpidInboxCopie_importer5ExemplesTEST(){
  v613InboxVerifierCopie_();
  var date='261108';
  var client={nom:'CLIENT FICTIF',email:'qa@example.invalid',tel:'0600000000',commune:'Darnieulles',photos:false};
  var ex=[
    {v:2,test:true,id:'LMP-M-'+date+'-FICTIF001',parcours:'menage',type:'devis',
      client:client,demandes:[{offre:'regulier',lib:'Entretien régulier du logement',saisie:{type:'menage',surface:65,frequence:'4.33'}}]},
    {v:2,test:true,id:'LMP-V-'+date+'-FICTIF002',parcours:'vitres',type:'devis',
      client:{nom:'CLIENT FICTIF',email:'qa@example.invalid',tel:'',commune:'Golbey',photos:true},
      demandes:[{offre:'vitres',lib:'Lavage de vitres',saisie:{type:'vitres',elements:{faces:12}}}]},
    {v:2,test:true,id:'LMP-B-'+date+'-FICTIF003',parcours:'b2b',type:'devis',
      client:{nom:'ENTREPRISE TEST',email:'qa@example.invalid',tel:'',commune:'Épinal',photos:false},
      demandes:[{offre:'bureaux',lib:'Entretien bureaux',saisie:{type:'bureaux',elements:{surface:85}}}]},
    {v:2,test:true,id:'LMP-G-'+date+'-FICTIF004',parcours:'general',type:'devis',client:client,
      demandes:[{offre:'grand',lib:'Grand nettoyage',saisie:{type:'grand',surface:70}},
        {offre:'textile',lib:'Nettoyage de fauteuil',saisie:{type:'textile',elements:{fauteuils:1}}}]},
    {v:2,test:true,id:'LMP-M-'+date+'-FICTIF005',parcours:'menage',type:'rappel',
      client:{nom:'CLIENT TEST',tel:'0600000000',commune:'Darnieulles'},
      demandes:[],rappel:{creneau:'aprem'}}
  ];
  return ex.map(function(d){
    var code='LIMPID1.'+Utilities.base64Encode(Utilities.newBlob(JSON.stringify(d)).getBytes());
    return limpidInboxCopie_importerLIMPID1TEST(code);
  });
}