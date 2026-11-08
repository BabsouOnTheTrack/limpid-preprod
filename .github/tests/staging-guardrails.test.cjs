'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..', '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const PREVIEW='limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev';
const DIRECT='limpid-preprod.cabochondreams.workers.dev';
const PUBLIC='limpid-nettoyage.fr';
const pages=['devis/index.html','configurer-devis-menage/index.html','configurer-devis-vitres/index.html','configurer-devis-locaux-professionnels/index.html'];

function testContext(hostname) {
  const scripts=[];
  const listeners={};
  const mem = new Map();
  const storage={
    getItem: k => mem.has(k) ? mem.get(k) : null,
    setItem: (k,v) => mem.set(k,String(v)),
    removeItem: k => mem.delete(k)
  };
  const window={
    location:{hostname,search:'',pathname:'/devis/'},
    dataLayer:null
  };
  const document={
    readyState:'loading',
    referrer:'',
    head:{appendChild: elem => scripts.push(elem)},
    addEventListener: (name,cb) => (listeners[name]=cb),
    querySelectorAll:()=>[],
    createElement: tag => ({tagName:tag})
  };
  const ctx=vm.createContext({window, document, localStorage:storage,sessionStorage:storage,URLSearchParams,Date,JSON,console});
  return {window,document,scripts,listeners,storage,ctx};
}
function run(ctx, file) { vm.runInContext(read(file),ctx,{filename:file,timeout:1000}); }

test('Preview branch : aucune initialisation GA ni mesure',()=>{
  const c=testContext(PREVIEW);
  run(c.ctx,'assets/mesure.js');
  run(c.ctx,'assets/campagne.js');
  assert.equal(c.window.gtag,undefined);
  assert.equal(typeof c.window.limpidCookies,'function');
  assert.equal(c.scripts.length,0);
  assert.equal(c.listeners.DOMContentLoaded,undefined);
  assert.equal(typeof c.window.limpidEvenement,'function');
  c.window.limpidEvenement('b2b_lead',{type:'devis'});
  c.window.limpidEvenement('config_step_view',{step:'recap'});
  assert.equal(c.storage.getItem('limpid_file'),null);
  assert.equal(c.window.limpidConversion('b2b_lead'),false);
});

test('Preview direct : même isolement GA',()=>{
  const c=testContext(DIRECT);
  run(c.ctx,'assets/mesure.js');
  run(c.ctx,'assets/campagne.js');
  assert.equal(c.window.gtag,undefined);
  assert.equal(c.listeners.DOMContentLoaded,undefined);
  assert.equal(c.scripts.length,0);
});

test('Production : fonctions de consentement et mesure conservées',()=>{
  const c=testContext(PUBLIC);
  run(c.ctx,'assets/mesure.js');
  run(c.ctx,'assets/campagne.js');
  assert.equal(typeof c.window.limpidCookies,'function');
  assert.equal(typeof c.window.limpidEvenement,'function');
  assert.equal(typeof c.window.limpidRejouer,'function');
  assert.equal(typeof c.listeners.DOMContentLoaded,'function');
  const events=[];
  c.window.gtag=(...args)=>events.push(args);
  c.window.limpidEvenement('vitres_lead',{type:'devis',email:'nepastransmettre@example.invalid'});
  assert.equal(events.length,1);
  assert.equal(events[0][1],'vitres_lead');
  assert.equal(events[0][2].email,undefined);
});

test('Seuls les 4 tunnels LAB envoient au bridge et exigent un ACK',()=>{
  pages.forEach(p=>{
    const source=read(p);
    assert.ok(source.includes('window.LimpidLabV126.send('),p);
    assert.ok(source.includes('"code_import"'),p);
    assert.ok(source.includes('receipt.reference!==paquet.id'),p);
    assert.ok(source.includes('Aucune demande n’a été confirmée.'),p);
    assert.ok(!source.includes('fetch("https://api.web3forms.com/submit"'),p);
    assert.ok(source.includes('Dossier fictif enregistré dans Cloudflare STAGING'),p);
  });
});

test('Devis général : navigation de confirmation et texte forcés en staging',()=>{
 const s=read('devis/index.html');
 assert.ok(s.includes('navFin.style.setProperty("display", "none", "important")'));
 assert.ok(s.includes('Aucun e-mail client ni devis n’est envoyé'));
 assert.ok(!s.includes('$("cf-confirmation").textContent = cfg().textes.confirmation;'));
});

test('Configuration Cloudflare : Preview isolée et redirections conservées',()=>{
 const j=JSON.parse(read('wrangler.jsonc'));
 assert.equal(j.name,'limpid-preprod');
 assert.equal(j.assets.directory,'./');
 assert.ok(j.previews && typeof j.previews==='object');
 const ignore=read('.assetsignore').split(/\r?\n/).map(x=>x.trim());
 assert.ok(ignore.includes('.github'));
 assert.ok(!ignore.includes('_redirects'));
 assert.ok(read('_redirects').includes(' 301'));
});

function bridgeCase(host=PREVIEW, reply=null) {
 const calls=[];
 const win={location:{hostname:host},turnstile:{render:(node,opts)=>{opts.callback('turnstile-test-token');return 'widget-1';},remove:()=>{}}};
 const fake={remove:()=>{},querySelector:()=>({addEventListener:()=>{}})};
 const doc={createElement:()=>Object.assign({},fake),body:{appendChild:()=>{}}};
 const location={protocol:'https:',hostname:host};
 const ctx=vm.createContext({
   window:win,document:doc,location,console,Date,JSON,TextDecoder,Uint8Array,atob,
   setTimeout,clearTimeout,fetch:async (uri,options)=>{
     calls.push({uri,options});
     if (reply==='NETWORK') throw new TypeError('Failed to fetch');
     const ref=JSON.parse(options.body).ref;
     return {status:reply?.status??201,json:async()=>reply?.body??{ok:true,reference:ref,statut:'enregistre_lab',mode:'TEST_ISOLE'}};
   }
 });
 vm.runInContext(read('assets/signature-lab-v126-bridge.js'),ctx,{filename:'bridge.js',timeout:1000});
 function packet(overrides={}) {
   const d={v:2,type:'devis',test:true,id:'LMP-V-TEST-12345678',parcours:'vitres',
      client:{nom:'Client Fictif',email:'qa@example.invalid',tel:'0600000000'},
      demandes:[{offre:'Lavage de vitres'}],...overrides};
   const code='LIMPID1.'+Buffer.from(JSON.stringify(d),'utf8').toString('base64');
   return {id:d.id,test:true,entrees:[['code_import',code]]};
 }
 return {send:win.LimpidLabV126.send,calls,packet,window:win};
}

test('Bridge: un dossier fictif avec ACK 201 est confirmé, sans identifiants réels',async()=>{
 const b=bridgeCase();
 const result=await b.send(b.packet(),'vitres',true);
 assert.equal(result.ok,true);
 assert.equal(result.reference,'LMP-V-TEST-12345678');
 assert.equal(b.calls.length,1);
 assert.equal(b.calls[0].options.method,'POST');
 assert.equal(b.calls[0].options.credentials,'omit');
 assert.equal(b.calls[0].options.headers['X-Limpid-Turnstile'],'turnstile-test-token');
 assert.equal(b.calls[0].options.redirect,'error');
});

test('Bridge: autre domaine, hors-test et identité réelle refusés avant tout POST',async()=>{
 const foreign=bridgeCase('limpid-nettoyage.fr');
 await assert.rejects(foreign.send(foreign.packet(),'vitres',true),/préproduction autorisée/);
 assert.equal(foreign.calls.length,0);
 const staging=bridgeCase();
 await assert.rejects(staging.send(staging.packet(),'vitres',false),/mode test/);
 await assert.rejects(staging.send(staging.packet({client:{nom:'Personne Réelle',email:'real@example.com',tel:'0611111111'}}),'vitres',true),/exclusivement/);
 assert.equal(staging.calls.length,0);
});

test('Bridge: photo et fichier interdits rejetés avant tout POST',async()=>{
 const b=bridgeCase();
 await assert.rejects(b.send(b.packet({photos:[{name:'test.jpg'}]}),'vitres',true),/photographies/);
 assert.equal(b.calls.length,0);
});

test('Bridge: 201 sur mauvaise référence ou réponse D1 non confirmée = échec',async()=>{
 const b=bridgeCase(PREVIEW,{status:201,body:{ok:true,reference:'LMP-V-OTHER',statut:'enregistre_lab',mode:'TEST_ISOLE'}});
 await assert.rejects(b.send(b.packet(),'vitres',true),/Enregistrement non confirmé/);
 assert.equal(b.calls.length,1);
 const c=bridgeCase(PREVIEW,{status:409,body:{ok:false,error:'REFERENCE_CONFLICT'}});
 await assert.rejects(c.send(c.packet(),'vitres',true),/REFERENCE_CONFLICT/);
 assert.equal(c.calls.length,1);
});

test('Bridge: échec réseau ne fabrique pas de succès et déverrouille le prochain essai',async()=>{
 const b=bridgeCase(PREVIEW,'NETWORK');
 await assert.rejects(b.send(b.packet(),'vitres',true),/Failed to fetch/);
 await assert.rejects(b.send(b.packet(),'vitres',true),/Failed to fetch/);
 assert.equal(b.calls.length,2);
});

test('Devis général : en mode test, bandeau et intro n’annoncent aucun délai de devis',()=>{
 const s=read('devis/index.html');
 assert.ok(s.includes('badgeDevis.textContent = "PRÉPRODUCTION · DEMANDE FICTIVE"'));
 assert.ok(s.includes('Ceci est un essai fictif : aucun devis ni e-mail client ne sera envoyé.'));
 assert.ok(s.includes('nom: "Ménage à domicile"')); // libellé de la prestation choisie conservé
 assert.ok(s.includes('Limpid vous répond par e-mail sous 48 h.')); // mode métier préservé
});

test('Bandeau des 4 configurateurs : seuls les dossiers fictifs sont annoncés',()=>{
 pages.forEach(p=>{
   const s=read(p);
   assert.ok(s.includes('Envois fictifs uniquement en mode TEST · Aucun devis ni e-mail client'),p);
   assert.ok(!s.includes('Les envois de demandes sont volontairement désactivés'),p);
 });
});

test('26 redirections historiques 301 : sources uniques et destinations présentes',()=>{
 const lines=read('_redirects').split(/\r?\n/).map(s=>s.trim()).filter(s=>s && !s.startsWith('#'));
 assert.equal(lines.length,26);
 const seen=new Set();
 for(const line of lines){
   const parts=line.split(/\s+/);
   assert.equal(parts.length,3,line);
   const [from,to,status]=parts;
   assert.equal(status,'301',line);
   assert.ok(!seen.has(from),'Redirection source dupliquée : '+from);
   seen.add(from);
   assert.ok(from.startsWith('/')&&to.startsWith('/'),line);
   const relative=to.slice(1);
   const local=to==='/'?'index.html':path.posix.join(relative,'index.html');
   assert.ok(fs.existsSync(path.join(root,local)),'Cible absente : '+to);
 }
});
