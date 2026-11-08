'use strict';
/**
 * Real browser rendering of *restored* fictional filled recap states.
 * Read only: no submission, no Cloudflare D1 calls, no Web3Forms, no CRM.
 * All addresses, contact details and references below are purely invented.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const HOST='limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev';
const ROOT='https://'+HOST;
const ARTIFACT=path.join(process.cwd(),'mobile-preview-artifacts');
const chrome=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/opt/google/chrome/chrome'].find(x=>x&&fs.existsSync(x));
if(!chrome)throw Error('Chrome/Chromium executable required');
const tests=[
 {service:'menage',route:'/configurer-devis-menage/?test=1',expected:['Compris','Non compris','Éléments et options','crédit d’impôt'],
  r:{besoin:'ici',logement:'maison',niveaux:'plainpied',surface:75,chambres:2,sdb:1,wc:1,cuisine:1,bureau:1,
     frequence:'4.33',options:['opt_lit','opt_four'],vitresOn:true,v660Comptage:'ouvertures',v660F1:1,v660F2:1,v660Cotes:'interieur',
     animaux:'non',fumeur:'non',acces:'present',quand:'asap',creneaux:['matin'],
     adresse:'18 rue des Exemples',cp:'88390',commune:'Darnieulles',
     nom:'Client Exemple',tel:'0600000000',email:'fictif@example.invalid'}},
 {service:'vitres',route:'/configurer-devis-vitres/?test=1',expected:['Compris','Non compris'],
  r:{besoin:'ici',types:['fenetres','baies'],f1:4,f2:2,fVelux:1,baiesP:1,baies:1,baiesG:0,
     cotes:'int_ext',logement:'maison',niveaux:'plainpied',accessible:'non',
     frequence:'0',quand:'asap',
     adresse:'18 rue des Exemples',cp:'88390',commune:'Darnieulles',
     nom:'Client Exemple',tel:'0600000000',email:'fictif@example.invalid'}},
 {service:'b2b',route:'/configurer-devis-locaux-professionnels/?test=1',expected:['Compris','Non compris'],
  r:{besoin:'ici',activite:'bureaux',surface:'50a100',surfaceExacte:85,
     frequence:'1',prestations:['sols','surfaces','sanitaires','communes','corbeilles'],
     postes:5,sanitaires:1,reunion:1,coinCuisine:1,
     horaires:'hors',acces:['cle'],jours:['mar'],quand:'asap',prestataire:'non',visite:'non',
     adresse:'18 rue des Exemples',cp:'88390',commune:'Darnieulles',
     entreprise:'ENTREPRISE FICTIVE',nom:'Contact Exemple',tel:'0600000000',email:'fictif@example.invalid'}}
];
(async()=>{
 fs.mkdirSync(ARTIFACT,{recursive:true});
 /* Make sure the revision with the reusable detailed recap is actually served. */
 let published=false;
 for(let i=0;i<15;i++){
   try{
     const response=await fetch(ROOT+'/assets/signature-recap-detail.js?verify=filled-recap-'+i,{cache:'no-store',signal:AbortSignal.timeout(10000)});
     if(response.ok&&(await response.text()).includes('SIGNATURE V1.27')){published=true;break;}
   }catch(e){}
   await new Promise(resolve=>setTimeout(resolve,4500));
 }
 if(!published)throw Error('V1.27 recap asset not yet published in this branch Preview');
 const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const summary=[];
 try{
  for(const t of tests){
   for(const width of [390,1280]){
    const ctx=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,
      isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
    let blocked=0,errors=[];
    await ctx.addInitScript(arg=>{
      sessionStorage.setItem('limpid_test',String(Date.now()));
      sessionStorage.setItem('limpid_parcours_'+arg.service+'_v2',JSON.stringify({
        ecran:'recap',id:'LMP-'+arg.service.toUpperCase()+'-FICTIF-00000001',
        r:arg.r,retourRecap:false,debut:true
      }));
    },{service:t.service,r:t.r});
    await ctx.route('**/*',route=>{
      const request=route.request(),url=new URL(request.url());
      if(!['GET','HEAD'].includes(request.method())){blocked++;return route.abort('blockedbyclient');}
      if(url.hostname!==HOST)return route.abort('blockedbyclient');
      return route.continue();
    });
    const page=await ctx.newPage();
    page.on('pageerror',error=>errors.push(String(error.message||error)));
    const res=await page.goto(ROOT+t.route,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(450);
    const metrics=await page.evaluate(()=>{
      const panel=document.querySelector('.sig-recap-detail');
      const scope=document.querySelector('#pc-app');
      const heading=document.querySelector('#pc-titre');
      const duration=panel?.querySelector('.sig-recap-duration');
      const sectionTitles=[...(panel?.querySelectorAll('h4')||[])].map(e=>e.textContent.trim());
      return {
        title:heading?.textContent||'',panelVisible:!!panel&&getComputedStyle(panel).display!=='none',
        includedCount:panel?.querySelectorAll('ul.sig-recap-list:not(.none) li').length||0,
        sectionTitles,duration:duration?.textContent.trim()||'',
        width:innerWidth,documentWidth:document.documentElement.scrollWidth,
        editButtons:scope?.querySelectorAll('button.pc-modif').length||0,
        text:panel?.innerText||''
      };
    });
    const pic='filled-recap-'+t.service+'-'+width+'px.png';
    await page.screenshot({path:path.join(ARTIFACT,pic),fullPage:true,animations:'disabled'});
    const entry={service:t.service,width,status:res?.status(),...metrics,blocked,errors,screenshot:pic};
    summary.push({...entry,text:undefined});
    assert.equal(entry.status,200,'HTTP '+t.service);
    assert.equal(entry.panelVisible,true,'detail missing '+t.service);
    assert.ok(entry.editButtons>=5,'Modify buttons missing '+t.service);
    assert.ok(entry.sectionTitles.includes('Compris'),'Compris missing '+t.service);
    assert.ok(entry.includedCount>0,'No tasks rendered '+t.service);
    assert.ok(entry.duration.includes('min')||entry.duration.includes(' h '),'Duration absent '+t.service);
    for(const phrase of t.expected){
      assert.ok(entry.text.includes(phrase),'Missing '+phrase+' '+t.service);
    }
    assert.ok(entry.documentWidth<=entry.width+4,'Overflow '+t.service+' '+width);
    assert.equal(errors.length,0,'JS errors '+t.service+': '+errors.join(','));
    assert.equal(blocked,0,'Unexpected POST '+t.service);

    /* Important: every existing "Modifier" must still open the original form step. */
    const first=page.locator('button.pc-modif').first();
    await first.click();
    const edit=await page.evaluate(()=>document.getElementById('pc-titre')?.textContent||'');
    assert.notEqual(edit,'Vérifiez votre demande','Modifier button does not open step '+t.service);
    const back=page.locator('#pc-retour');
    await back.click();
    await page.waitForTimeout(50);
    const after=await page.evaluate(()=>({title:document.getElementById('pc-titre')?.textContent||'',detail:!!document.querySelector('.sig-recap-detail')}));
    assert.equal(after.title,'Vérifiez votre demande','Back to recap failed '+t.service);
    assert.equal(after.detail,true,'Detail lost after edit '+t.service);
    await ctx.close();
   }
  }
 }finally{
   fs.writeFileSync(path.join(ARTIFACT,'filled-recap-summary.json'),JSON.stringify(summary,null,2)+'\n');
   await browser.close();
 }
 console.log('FILLED RECAP 3 SERVICES x 2 WIDTHS OK; EDIT-BACK OK; 0 POST: '+JSON.stringify(summary.map(x=>({
    service:x.service,width:x.width,status:x.status,sections:x.sectionTitles,
    duration:x.duration,scrollWidth:x.documentWidth,edits:x.editButtons,errors:x.errors.length}))));
})().catch(error=>{console.error('FILLED RECAP AUDIT FAILED:',error);process.exitCode=1;});
