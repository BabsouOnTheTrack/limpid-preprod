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
  assert.equal(c.window.limpidCookies,undefined);
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
