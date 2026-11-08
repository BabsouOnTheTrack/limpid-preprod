'use strict';
/* Visual/geometry contract for brand descriptor + main menu. Zero form submissions. */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
const HOST='limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev';
const target=path.join(process.cwd(),'mobile-preview-artifacts');
const chrome=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/opt/google/chrome/chrome'].find(x=>x&&fs.existsSync(x));
if(!chrome)throw new Error('Chrome unavailable');
(async()=>{
 const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report=[];
 fs.mkdirSync(target,{recursive:true});
 try{
  for(const width of [960,980,1100,1250,1366,1440,1600,1920]){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
   await context.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(!['GET','HEAD'].includes(route.request().method()))return route.abort('blockedbyclient');
    return u.hostname===HOST?route.continue():route.abort('blockedbyclient');
   });
   const page=await context.newPage();
   const res=await page.goto('https://'+HOST+'/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForTimeout(250);
   const m=await page.evaluate(()=>{
    function metrics(sel){
     const el=document.querySelector(sel);
     if(!el)return null;
     const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
     return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,display:cs.display,fontSize:cs.fontSize};
    }
    return {vw:innerWidth,sw:document.documentElement.scrollWidth,
      brand:metrics('.site-header .brand'),
      descriptor:metrics('.limpid-brand-descriptor'),
      nav:metrics('.site-header .primary-nav'),
      cta:metrics('.site-header .header-cta'),
      mobile:metrics('.site-header .mobile-menu')
    };
   });
   await page.screenshot({path:path.join(target,'header-'+width+'px.png'),animations:'disabled'});
   const validMenu=m.nav?.display!=='none';
   const collision=validMenu&&(
      m.brand.right>m.nav.left+2||
      m.nav.right>m.cta.left+2
   );
   const lineSize=m.descriptor&&m.descriptor.display!=='none'?parseFloat(m.descriptor.fontSize):null;
   report.push({width,status:res?.status(),...m,collision,lineSize});
   if(res?.status()!==200||m.sw>m.vw+4||collision||(width>=801&&(!lineSize||lineSize<10.5))){
     throw new Error('Header layout failed '+JSON.stringify(report.at(-1)));
   }
   await context.close();
  }
 }finally{
   fs.writeFileSync(path.join(target,'header-summary.json'),JSON.stringify(report,null,2)+'\n');
   await browser.close();
 }
 console.log('HEADER LAYOUT 6 WIDTHS PASS '+JSON.stringify(report.map(x=>({width:x.width,font:x.lineSize,scroll:x.sw,collision:x.collision}))));
})().catch(e=>{console.error(e);process.exitCode=1;});
