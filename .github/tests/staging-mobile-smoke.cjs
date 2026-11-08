'use strict';
/* Read-only, no submit, no credentials: collect mobile screenshots and viewport overflow. */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
const base='https://limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev';
const routes=[
  ['general','/devis/?test=1'],
  ['menage','/configurer-devis-menage/?test=1'],
  ['vitres','/configurer-devis-vitres/?test=1'],
  ['b2b','/configurer-devis-locaux-professionnels/?test=1']
];
const executable=[
 process.env.CHROME_PATH,
 '/usr/bin/google-chrome',
 '/usr/bin/google-chrome-stable',
 '/usr/bin/chromium',
 '/opt/google/chrome/chrome'
].find(p=>p&&fs.existsSync(p));
if(!executable)throw Error('No preinstalled Chrome/Chromium executable found');
(async()=>{
 const browser=await chromium.launch({executablePath:executable,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const target=path.join(process.cwd(),'mobile-preview-artifacts');
 fs.mkdirSync(target,{recursive:true});
 const checks=[];
 try{
  for(const [slug,route] of routes){
   const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
   await context.route('**/*',async request=>{
     const url=new URL(request.request().url());
     if(url.hostname==='limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev'){
       return request.continue();
     }
     return request.abort('blockedbyclient');
   });
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e.message||e)));
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForTimeout(500);
   const values=await page.evaluate(()=>({
     title:document.title,
     innerWidth:window.innerWidth,
     scrollWidth:document.documentElement.scrollWidth,
     hasVisiblePage:!!document.querySelector('main'),
     hasModeTestBanner:!!document.querySelector('.cf-test:not([hidden]), .pc-test:not([hidden]), .signature-preview-banner'),
     bodyHeight:document.body.scrollHeight
   }));
   const file=path.join(target,slug+'-390px.png');
   await page.screenshot({path:file,fullPage:true,animations:'disabled'});
   checks.push({name:slug,status:response?.status(),...values,errors,screenshot:path.basename(file)});
   await context.close();
  }
  fs.writeFileSync(path.join(target,'summary.json'),JSON.stringify(checks,null,2)+'\n');
  console.log(JSON.stringify(checks,null,2));
  const bad=checks.filter(x=>x.status!==200||!x.hasVisiblePage||x.scrollWidth>x.innerWidth+4||x.errors.length);
  if(bad.length)throw Error('Mobile smoke failed: '+bad.map(x=>x.name+': status='+x.status+', overflow='+ (x.scrollWidth-x.innerWidth)+', jsErrors='+x.errors.join(';')).join(' | '));
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
