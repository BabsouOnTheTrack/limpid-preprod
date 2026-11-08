'use strict';
/* GET-only smoke test of the exact Cloudflare branch Preview. Never POST or follow off-host redirects. */
const assert = require('node:assert/strict');
const HOST='limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev';
const BASE='https://'+HOST;
const FAIL_AFTER=15;
const DELAY=6000;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(path){
 const uri=new URL(path,BASE);
 assert.equal(uri.hostname,HOST);
 const response=await fetch(uri.href,{
   method:'GET',
   redirect:'manual',
   cache:'no-store',
   headers:{'User-Agent':'LimpidStagingReadOnlySmoke/1.0'},
   signal:AbortSignal.timeout(12000)
 });
 return {status:response.status,headers:response.headers,text:await response.text()};
}
async function check(){
 const root=await get('/devis/?test=1');
 assert.equal(root.status,200,'devis root status');
 assert.match(root.text,/PRÉPRODUCTION SIGNATURE V1\.26/);
 assert.match(root.text,/Envois fictifs uniquement en mode TEST/);
 assert.doesNotMatch(root.text,/Les envois de demandes sont volontairement désactivés/);
 const paths=['/configurer-devis-menage/','/configurer-devis-vitres/','/configurer-devis-locaux-professionnels/'];
 for(const path of paths){
   const r=await get(path+'?test=1');
   assert.equal(r.status,200,path);
   assert.match(r.text,/Envois fictifs uniquement en mode TEST/,path);
 }
 const bridge=await get('/assets/signature-lab-v126-bridge.js');
 assert.equal(bridge.status,200);
 assert.ok(bridge.text.includes("var HOST='"+HOST+"'"));
 const red=await get('/about/');
 assert.equal(red.status,301,'/about/ legacy redirect');
 const to=red.headers.get('location')||'';
 assert.equal(new URL(to,BASE).pathname,'/references/');
 const config=await get('/wrangler.jsonc');
 assert.notEqual(config.status,200,'configuration must not be public asset');
 console.log('PREVIEW READ-ONLY SMOKE OK: four HTML routes, lab bridge, legacy 301, config hidden');
}
(async()=>{
 for(let i=1;i<=FAIL_AFTER;i++){
   try{await check();return;}
   catch(e){
     console.error('Preview check '+i+'/'+FAIL_AFTER+': '+String(e.message||e));
     if(i===FAIL_AFTER)throw e;
     await sleep(DELAY);
   }
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
