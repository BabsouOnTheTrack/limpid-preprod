'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const code=fs.readFileSync(path.resolve(__dirname,'../crm-contract/Limpid_V613_Inbox_Site_COPIE.gs'),'utf8');
const PROD_SCRIPT='182t33Hy3RxZ7n3V5htxYndKddKdYv2bMqf_AEkjCKAOc5PAdGomUokZI';
const LAB_SHEET='1z8KLlpO1EQ35c6ZBFrtxcYMIO33tXcFEv715lqSmqBQ';
const HEADERS=['recu_utc','reference','empreinte_sha256','parcours','type','client_fictif','email_fictif','telephone_fictif','commune','prestations','creneau_rappel','photos_a_transmettre','etat','code_import_limpid1','maj_utc','note_test'];
function makeMock(overrides={}){
 const state={scriptId:'SCRIPT_COPIE_ISOLE_123',properties:{
  LIMPID_V613_MODE:'TEST_ISOLE',
  LIMPID_V613_SCRIPT_ID_COPIE:'SCRIPT_COPIE_ISOLE_123',
  LIMPID_V613_TABLEUR_LAB:LAB_SHEET,
  LIMPID_V613_ECRITURE_TEST:'OUI',
 },opened:[],sheets:new Map(),writeCount:0,lockReleased:0,denyLock:false,
 failReadback:false};
 Object.assign(state,overrides);
 const sheetClass={
  getLastRow(){return this.rows.length;},
  getRange(r,c,n=1,m=1){
   const sh=this;
   return {
    getValues(){
     if(state.failReadback&&r>1&&c===2&&m===13) return [Array(13).fill('ALTERE')];
     return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>sh.rows[r-1+i]?.[c-1+j]??''));
    },
    setValues(v){
     state.writeCount++;
     for(let i=0;i<v.length;i++)for(let j=0;j<v[i].length;j++){
      while(sh.rows.length<r+i)sh.rows.push([]);
      sh.rows[r+i-1][c+j-1]=v[i][j];
     }
     return this;
    }
   };
  },
  appendRow(row){state.writeCount++;this.rows.push([...row]);return this;},
  setFrozenRows(n){this.frozen=n;}
 };
 const ss={getSheetByName(n){return state.sheets.get(n)||null;},
  insertSheet(n){state.writeCount++;const sh=Object.assign({rows:[]},sheetClass);state.sheets.set(n,sh);return sh;}};
 const ctx=vm.createContext({
  console,Date,JSON,Number,Boolean,String,Object,Array,RegExp,Math,
  ScriptApp:{getScriptId:()=>state.scriptId},
  PropertiesService:{getScriptProperties:()=>({getProperty:key=>state.properties[key]??null})},
  SpreadsheetApp:{openById(id){state.opened.push(id);return ss;},flush(){state.flushed=true;}},
  LockService:{getScriptLock(){return {tryLock(){return !state.denyLock;},releaseLock(){state.lockReleased++;}}}},
  Utilities:{
    DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'UTF-8'},
    computeDigest(_,text){return [...crypto.createHash('sha256').update(text,'utf8').digest()].map(x=>x>127?x-256:x);},
    base64Decode(b64){return [...Buffer.from(b64,'base64')];},
    newBlob(data){return {getDataAsString:()=>Buffer.from(data).toString('utf8'),getBytes:()=>[...Buffer.from(data,'utf8')]};},
    base64Encode(bytes){return Buffer.from(bytes).toString('base64');}
  }
 });
 vm.runInContext(code,ctx,{filename:'Limpid_V613_Inbox_Site_COPIE.gs'});
 return {ctx,state,ss};
}
const common={v:2,test:true,id:'LMP-G-20261108-FAKETEST1',parcours:'general',type:'devis',
 client:{nom:'CLIENT FICTIF',email:'qa@example.invalid',tel:'',commune:'Golbey',photos:true},
 demandes:[{offre:'grand',lib:'Grand nettoyage',saisie:{type:'grand',surface:70},estimation:{minutes:175}}]};
function limpid(d){return 'LIMPID1.'+Buffer.from(JSON.stringify(d),'utf8').toString('base64');}
function call(c,method,arg){return c[method](arg);}
function throws(x,re){assert.throws(x,re);}
test('Previsualisation fictive ne lit ni n’écrit aucun tableur',()=>{
 const {ctx,state}=makeMock();
 const result=call(ctx,'limpidInboxCopie_previsualiserLIMPID1',limpid(common));
 assert.equal(result.ok,true);assert.equal(result.ecriture,false);assert.equal(result.ack,false);
 assert.equal(result.photosAEnvoyer,true);assert.equal(state.writeCount,0);assert.equal(state.opened.length,0);
});
test('Devis général sans téléphone : copie persistée et relue sans ACK',()=>{
 const {ctx,state}=makeMock(); const original=limpid(common);
 const r=call(ctx,'limpidInboxCopie_importerLIMPID1TEST',original);
 assert.equal(r.etat,'INSERE_TEST');assert.equal(r.preuve,'LAB_RELU');assert.equal(r.ackAutorise,false);
 assert.deepEqual(state.opened,[LAB_SHEET,LAB_SHEET]);
 const row=state.sheets.get('LAB_Inbox_Site_V1_TEST').rows[1];
 assert.equal(row[1],common.id);assert.equal(row[2],crypto.createHash('sha256').update(original).digest('hex'));
 assert.equal(row[5],'CLIENT FICTIF');assert.equal(row[7],'');assert.equal(row[11],'OUI');
 assert.equal(row[12],'A_QUALIFIER_TEST');assert.equal(row[13],original);
 assert.equal(state.lockReleased,1);
});
test('Idempotence : même référence et SHA = pas de nouvelle ligne',()=>{
 const {ctx,state}=makeMock(),src=limpid(common);
 const first=call(ctx,'limpidInboxCopie_importerLIMPID1TEST',src);
 const second=call(ctx,'limpidInboxCopie_importerLIMPID1TEST',src);
 assert.equal(first.etat,'INSERE_TEST');assert.equal(second.etat,'EXISTANT_IDENTIQUE');
 assert.equal(state.sheets.get('LAB_Inbox_Site_V1_TEST').rows.length,2);
});
test('Conflit référence SHA : quarantaine et aucune seconde ligne',()=>{
 const {ctx,state}=makeMock();
 call(ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(common));
 const change=limpid({...common,demandes:[{offre:'grand',saisie:{type:'grand',surface:90}}]});
 const response=call(ctx,'limpidInboxCopie_importerLIMPID1TEST',change);
 assert.equal(response.etat,'CONFLIT_QUARANTAINE');assert.equal(response.ok,false);
 assert.equal(state.sheets.get('LAB_Inbox_Site_V1_TEST').rows.length,2);
});
test('Tous les 4 parcours et rappel sans email conservent leurs propriétés',()=>{
 const {ctx,state}=makeMock();
 const variants=[
  {...common,id:'LMP-M-20261108-FAKE0001',parcours:'menage',demandes:[{offre:'regulier',saisie:{type:'menage',surface:60}}],client:{nom:'CLIENT TEST',email:'qa@example.org',tel:'0600000000',photos:false}},
  {...common,id:'LMP-V-20261108-FAKE0001',parcours:'vitres',demandes:[{offre:'vitres',saisie:{type:'vitres',elements:{faces:10}}}]},
  {...common,id:'LMP-B-20261108-FAKE0001',parcours:'b2b',demandes:[{offre:'bureaux',saisie:{type:'bureaux',surface:85}}]},
  {...common,id:'LMP-G-20261108-FAKEMULTI',demandes:[{offre:'grand',saisie:{type:'grand'}},{offre:'textile',saisie:{type:'textile'}}]},
  {...common,id:'LMP-M-20261108-FAKECALL',parcours:'menage',type:'rappel',client:{nom:'CLIENT TEST',tel:'0600000000'},demandes:[],rappel:{creneau:'aprem'}}
 ];
 for(const v of variants) assert.equal(call(ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(v)).etat,'INSERE_TEST');
 const list=call(ctx,'limpidInboxCopie_listerTEST',20);
 assert.equal(list.dossiers.length,5);assert.equal(list.ackAutorise,false);
 assert.equal(list.dossiers.at(-1).type,'rappel');
 assert.ok(!JSON.stringify(list).includes('qa@example.org'));
 assert.ok(!JSON.stringify(list).includes('LIMPID1.'));
});
test('PROD script ID bloque toute écriture même en présence de propriétés',()=>{
 const {ctx,state}=makeMock({scriptId:PROD_SCRIPT});
 state.properties.LIMPID_V613_SCRIPT_ID_COPIE=PROD_SCRIPT;
 throws(()=>call(ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(common)),/SCRIPT_PRODUCTION_BLOQUE/);
 assert.equal(state.writeCount,0);assert.equal(state.opened.length,0);
});
test('Mode manquant et tableur incorrect = aucune écriture',()=>{
 const e=makeMock();e.state.properties.LIMPID_V613_MODE='PRODUCTION';
 throws(()=>call(e.ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(common)),/VERROUS_COPIE_FERMES/);
 assert.equal(e.state.writeCount,0);
 const f=makeMock();f.state.properties.LIMPID_V613_TABLEUR_LAB='10loSjoDKj_rcPDIr-NVgE8b9b6dyCdoobj2gMhp0d2M';
 throws(()=>call(f.ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(common)),/VERROUS_COPIE_FERMES/);
 assert.equal(f.state.opened.length,0);
});
test('Aucun dossier réel ou photo jointe n’entre dans le LAB',()=>{
 for(const v of [
  {...common,test:false},
  {...common,client:{...common.client,email:'contact@vraientreprise.fr'}},
  {...common,client:{...common.client,nom:'Jean Martin'}},
  {...common,client:{...common.client,tel:'0612345678'}},
  {...common,client:{...common.client,photos:'data:image/png;base64,...'}},
  {...common,attachments:[{filename:'client.jpg'}]},
  {...common,demandes:[{offre:'vitres',saisie:{type:'grand'}}]}
 ]){
  const {ctx,state}=makeMock();
  throws(()=>call(ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(v)),/LIMPID_INBOX_COPIE_/);
  assert.equal(state.writeCount,0);
 }
});
test('Relecture de persistance échouée : signale erreur, jamais ACK',()=>{
 const {ctx,state}=makeMock({failReadback:true});
 throws(()=>call(ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(common)),/RELECTURE_PERSISTANCE_ECHEC/);
 assert.equal(state.lockReleased,1);
 assert.equal(call(ctx,'limpidInboxCopie_simulerACK',{}).ackAutorise,false);
});
test('Verrou indisponible : aucune insertion et aucun ACK',()=>{
 const {ctx,state}=makeMock({denyLock:true});
 throws(()=>call(ctx,'limpidInboxCopie_importerLIMPID1TEST',limpid(common)),/VERROU_OCCUPE/);
 assert.equal(state.writeCount,0);
});
test('Aucune API publique de mutation ni émission réseau dans le module',()=>{
 for(const phrase of ['function doPost(', 'function doGet(', 'UrlFetchApp.fetch(', 'google.script.run', 'fetch(', 'crmSyncSecret'])
  assert.ok(!code.includes(phrase),'phrase dangereuse '+phrase);
});

test('Cinq dossiers de démonstration préchargent seulement le LAB, rappel sans devis',()=>{
 const {ctx,state}=makeMock();
 const a=call(ctx,'limpidInboxCopie_importer5ExemplesTEST');
 assert.equal(a.length,5);assert.equal(a.filter(x=>x.etat==='INSERE_TEST').length,5);
 const list=call(ctx,'limpidInboxCopie_listerTEST',20);
 assert.equal(list.total,5);assert.deepEqual([...list.dossiers].map(x=>x.type).sort(),['devis','devis','devis','devis','rappel']);
 const twice=call(ctx,'limpidInboxCopie_importer5ExemplesTEST');
 assert.equal(twice.filter(x=>x.etat==='EXISTANT_IDENTIQUE').length,5);
 assert.equal(state.sheets.get('LAB_Inbox_Site_V1_TEST').rows.length,6);
});