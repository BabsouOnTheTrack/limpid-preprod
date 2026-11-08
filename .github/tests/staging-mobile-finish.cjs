'use strict';
/* CI-only render of post-ACK confirmation states. Never sends requests or contacts intake. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const HOST='limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev';
const BASE='https://'+HOST;
const target=path.join(process.cwd(),'mobile-preview-artifacts');
const routes=[
 {name:'menage',path:'/configurer-devis-menage/?test=1',service:'menage',reference:'LMP-M-CI-FAKE-000001'},
 {name:'vitres',path:'/configurer-devis-vitres/?test=1',service:'vitres',reference:'LMP-V-CI-FAKE-000001'},
 {name:'b2b',path:'/configurer-devis-locaux-professionnels/?test=1',service:'b2b',reference:'LMP-B-CI-FAKE-000001'},
 {name:'general',path:'/devis/?test=1',service:'general',reference:'LMP-G-CI-FAKE-000001'}
];
const chrome=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/opt/google/chrome/chrome'].find(p=>p&&fs.existsSync(p));
if(!chrome)throw Error('No preinstalled Chrome/Chromium found');
(async()=>{
 fs.mkdirSync(target,{recursive:true});
 const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 let results=[];
 try{
  for(const c of routes){
   const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
   let blockedSubmits=0,edits=0,errors=[];
   await context.addInitScript(({service,reference})=>{
     try{
       sessionStorage.setItem('limpid_test',String(Date.now()));
       if(service==='general'){
         window.__LIMPID_CI_ONLY_FINAL_RESTORE__=true;
         sessionStorage.setItem('limpid_cf_v2',JSON.stringify({
           etape:8,serviceIndex:0,cp:'88390',commune:'Darnieulles',adresse:'Adresse fictive',
           profil:'particulier',offres:['regulier'],ss:{regulier:{}},mode:'auto',
           heures:{},priorites:{},contact:{nom:'Client Fictif'},debut:true,envoye:true,
           ref:reference,id:reference
         }));
       } else{
         sessionStorage.setItem('limpid_parcours_'+service+'_v2',JSON.stringify({
           ecran:'fin',id:reference,fin:{id:reference,type:'devis',photos:false,nom:'Client Fictif'},
           r:{types:[]},debut:false,retourRecap:false
         }));
       }
     }catch(e){}
   },{service:c.service,reference:c.reference});
   await context.route('**/*',async route=>{
     const req=route.request(),url=new URL(req.url());
     if(req.method()!=='GET'&&req.method()!=='HEAD'){blockedSubmits++;return route.abort('blockedbyclient');}
     if(url.hostname!==HOST)return route.abort('blockedbyclient');
     if(c.service==='general'&&url.pathname==='/devis/'&&url.searchParams.get('test')==='1'){
       const resp=await route.fetch();
       const html=await resp.text();
       const anchor='if (E.etape === 8) E.etape = 2;';
       assert.equal(html.split(anchor).length-1,1,'General page restart guard differs');
       const second='aller(present?E.etape:2,E.serviceIndex||0);';
       assert.equal(html.split(second).length-1,1,'General page restore guard differs');
       const patched=html
          .replace(anchor,'if (E.etape === 8 && !window.__LIMPID_CI_ONLY_FINAL_RESTORE__) E.etape = 2;')
          .replace(second,'aller(window.__LIMPID_CI_ONLY_FINAL_RESTORE__ && E.etape === 8 ? 8 : (present?E.etape:2),E.serviceIndex||0);');
       edits++;
       return route.fulfill({response:resp,body:patched});
     }
     return route.continue();
   });
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push(String(e.message||e)));
   const response=await page.goto(BASE+c.path,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForTimeout(600);
   const s=await page.evaluate(({service})=>{
     const nav=document.getElementById(service==='general'?'cf-nav':'pc-nav');
     const fin=service==='general'?document.querySelector('.cf-etape[data-etape="8"]'):document.querySelector('.cf-fin');
     const content=fin?.textContent||'';
     return {
       width:window.innerWidth,scrollWidth:document.documentElement.scrollWidth,
       hasFinal:service==='general'?!!fin?.classList.contains('on'):!!fin,
       expectedMessage:content.includes('Dossier fictif enregistré dans Cloudflare STAGING'),
       noCommercialPromise:!content.includes('sous 48 h'),
       navDisplay:nav?getComputedStyle(nav).display:'MISSING',
       referenceVisible:content.includes('CI-FAKE-000001'),
       title:document.querySelector('#pc-titre,.cf-fin h2')?.textContent||'',
       appState:service==='general'?'protected state loaded':window.limpidParcours?.etat()?.ecran||'UNKNOWN'
     };
   },{service:c.service});
   await page.screenshot({path:path.join(target,'finish-'+c.name+'-390px.png'),fullPage:true,animations:'disabled'});
   const record={name:c.name,status:response?.status(),...s,errors,blockedSubmits,modifiedHtmlInMemory:edits};
   results.push(record);
   await context.close();
   if(record.status!==200||!record.hasFinal||!record.expectedMessage||!record.noCommercialPromise||!record.referenceVisible||record.navDisplay!=='none'||record.scrollWidth>record.width+4||errors.length||blockedSubmits) {
     throw Error('Mobile finish validation failed: '+JSON.stringify(record));
   }
  }
 }finally{
   fs.writeFileSync(path.join(target,'finish-summary.json'),JSON.stringify(results,null,2)+'\n');
   await browser.close();
 }
 console.log('READ-ONLY MOBILE FINISH OK (3 genuine state restores; 1 temporary in-memory HTML restart-guard bypass): '+JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
