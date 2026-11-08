/**
 * LIMPID — Production Intake PROTOTYPE V0.2 (NON DÉPLOYÉ)
 * File stored inside .github/ to stay excluded by .assetsignore.
 * NO Wrangler production config, NO live site, NO CRM integration.
 * Never copy STAGING secrets, DB or site keys to production.
 */
const REF=/^LMP-[A-Z0-9-]{8,50}$/;
const SHA=/^[a-f0-9]{64}$/;
const SERVICES=new Set(['menage','vitres','b2b','general']);
const RAPPEL_CRENEAUX=new Set(['matin','midi','aprem','soir','indiff']);
const MAX_CODE=49000, MAX_BODY=60000;
const ORIGIN='https://limpid-nettoyage.fr';
const HOST='limpid-nettoyage.fr';
const ACTION='limpid_devis';

function output(body,status=200,origin=''){
  const headers={'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'no-referrer','Vary':'Origin'};
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  return new Response(JSON.stringify(body),{status,headers});
}
function fail(reason,status=400,origin=''){return output({ok:false,error:reason},status,origin);}
function safeEqual(a,b){
  if(typeof a!=='string'||typeof b!=='string')return false;
  let diff=a.length^b.length;
  for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
  return diff===0;
}
function active(env){
  // Fail closed even if this prototype were accidentally copied to a Worker.
  return !!(env&&env.LIMPID_ENV==='PRODUCTION'&&env.DB&&
    env.DB_INSTANCE_LABEL==='limpid-intake-production'&&
    env.ALLOWED_ORIGIN===ORIGIN&&
    env.TURNSTILE_EXPECTED_HOSTNAME===HOST&&
    env.TURNSTILE_EXPECTED_ACTION===ACTION&&
    typeof env.TURNSTILE_SECRET==='string'&&env.TURNSTILE_SECRET.length>=32&&
    typeof env.CRM_SYNC_SECRET==='string'&&env.CRM_SYNC_SECRET.length>=32);
}
function banPhotos(value,parent='',depth=0){
  if(depth>35)throw Error('DEPTH');
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){for(const item of value)banPhotos(item,parent,depth+1);return;}
  for(const [key,child] of Object.entries(value)){
    const name=key.toLowerCase().replace(/-/g,'_');
    if(new Set(['photo','photos','photographies','image','images','image_base64','images_base64',
      'piece_jointe','pieces_jointes','attachments','attachment','fichier','fichiers','files',
      'file','uploads','photo_urls','photo_url']).has(name)){
      /* A boolean here means "photos will be sent separately", never an upload. */
      if(!(parent==='client'&&name==='photos'&&typeof child==='boolean'))throw Error('PHOTOS_NOT_SUPPORTED');
    }else banPhotos(child,name,depth+1);
  }
}
function decode(code){
  if(typeof code!=='string'||code.length>MAX_CODE||!/^LIMPID1\.[A-Za-z0-9+/=]+$/.test(code))
    throw Error('LIMPID1_INVALID');
  let document;
  try{
    const raw=atob(code.slice(8)),bytes=Uint8Array.from(raw,x=>x.charCodeAt(0));
    document=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  }catch{throw Error('LIMPID1_DECODE');}
  if(!document||Array.isArray(document)||document.v!==2||
     !['devis','rappel'].includes(document.type)||document.test!==false||
     !REF.test(document.id||''))throw Error('DOSSIER_INVALID');
  if(!SERVICES.has(document.parcours))throw Error('SERVICE_INVALID');
  if(document.type==='rappel'&&document.parcours==='general')throw Error('RAPPEL_SERVICE_INVALID');
  const c=document.client;
  if(!c||typeof c!=='object'||Array.isArray(c)||typeof c.nom!=='string'||
     c.nom.trim().length<2||c.nom.length>180)throw Error('CONTACT_INVALID');
  const hasEmail=typeof c.email==='string'&&c.email.length>0;
  if(document.type==='devis'&&!hasEmail)throw Error('EMAIL_REQUIRED');
  if(c.email!==undefined&&typeof c.email!=='string')throw Error('EMAIL_INVALID');
  if(hasEmail&&(c.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)||
     c.email.toLowerCase().endsWith('.invalid')))throw Error('EMAIL_INVALID');
  if(typeof c.tel!=='string'||c.tel.length>30)throw Error('PHONE_INVALID');
  const phone=c.tel.trim();
  if((document.type==='rappel'||phone.length>0)&&!(/^[+()\d.\s-]{8,30}$/.test(phone)))
    throw Error('PHONE_INVALID');

  if(!Array.isArray(document.demandes))throw Error('PRESTATIONS_INVALID');
  if(document.type==='rappel'){
    /* The actual three specialist forms send demandes:[] and no email. */
    if(document.demandes.length!==0)throw Error('RAPPEL_MUST_BE_EMPTY');
    if(!document.rappel||Array.isArray(document.rappel)||
       typeof document.rappel!=='object'||!RAPPEL_CRENEAUX.has(document.rappel.creneau))
      throw Error('RAPPEL_INVALID');
    if(c.photos!==undefined)throw Error('RAPPEL_PHOTOS_INVALID');
  }else{
    if(document.rappel!==undefined)throw Error('DEVIS_RAPPEL_UNEXPECTED');
    if(document.demandes.length<1||document.demandes.length>8||
       document.demandes.some(v=>!v||typeof v.offre!=='string'||!v.offre.trim()||v.offre.length>120))
      throw Error('PRESTATIONS_INVALID');
  }
  banPhotos(document); // Only client.photos:boolean; no file, URL or binary accepted
  return document;
}
async function verifyToken(request,env){
  const token=request.headers.get('X-Limpid-Turnstile');
  if(typeof token!=='string'||!token||token.length>2048)return false;
  const p=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});
  const ip=request.headers.get('CF-Connecting-IP');if(ip)p.set('remoteip',ip);
  try{
    const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {method:'POST',body:p});
    if(!response.ok)return false;
    const result=await response.json();
    return result.success===true&&result.hostname===HOST&&result.action===ACTION;
  }catch{return false;}
}
async function hash(code){
  const buffer=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));
  return [...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function authorized(request,env){
  return safeEqual(request.headers.get('Authorization')||'', 'Bearer '+env.CRM_SYNC_SECRET);
}
async function intake(request,env,allowed){
  if(request.method==='OPTIONS')return allowed?new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type, X-Limpid-Turnstile',
      'Access-Control-Max-Age':'300','Vary':'Origin'}}):fail('ORIGIN',403);
  if(request.method!=='POST')return fail('METHOD',405,allowed);
  if(!allowed)return fail('ORIGIN',403);
  if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type')||''))
    return fail('JSON_REQUIRED',415,allowed);
  const sizeHeader=Number(request.headers.get('Content-Length'));
  if(Number.isFinite(sizeHeader)&&sizeHeader>MAX_BODY)return fail('TOO_LARGE',413,allowed);
  let data;
  try{
    const raw=await request.text();
    if(new TextEncoder().encode(raw).length>MAX_BODY)return fail('TOO_LARGE',413,allowed);
    data=JSON.parse(raw);
  }catch{return fail('JSON_INVALID',400,allowed);}
  let d,ref,code,service;
  try{
    if(!data||Array.isArray(data)||typeof data!=='object'||
       Object.keys(data).sort().join(',')!=='code,ref,service')throw Error('REQUEST_SHAPE');
    ref=data.ref;code=data.code;service=data.service;d=decode(code);
    if(ref!==d.id||service!==d.parcours||!SERVICES.has(service))throw Error('REFERENCE_SERVICE');
  }catch(e){return fail(e.message||'DOSSIER_INVALID',422,allowed);}
  if(!await verifyToken(request,env))return fail('TURNSTILE_FAILED',403,allowed);
  const sha=await hash(code);
  try{
    await env.DB.prepare('INSERT OR IGNORE INTO demandes(ref,service,sha256,code,etat) VALUES(?,?,?,?,?)')
      .bind(ref,service,sha,code,'nouveau').run();
    const saved=await env.DB.prepare('SELECT sha256,etat FROM demandes WHERE ref=?').bind(ref).first();
    if(!saved)return fail('PERSISTENCE_NOT_CONFIRMED',503,allowed);
    if(saved.sha256!==sha)return fail('REFERENCE_CONFLICT',409,allowed);
    return output({ok:true,reference:ref,statut:saved.etat==='importe'?'deja_enregistre':'enregistre'},201,allowed);
  }catch{return fail('STORAGE_FAILED',503,allowed);}
}
async function outbox(request,env){
  if(request.method!=='GET')return fail('METHOD',405);
  if(!authorized(request,env))return fail('UNAUTHORIZED',401);
  try{
    const rows=await env.DB.prepare('SELECT ref,service,sha256,code,created_at FROM demandes WHERE etat=? ORDER BY created_at LIMIT 25')
      .bind('nouveau').all();
    return output({schema:'limpid.site-inbox.v1',enveloppes:(rows.results||[]).map(row=>{
      const parsed=decode(row.code);
      return {
        schema:'limpid.site-dossier.v2',reference:row.ref,service:row.service,
        type:parsed.type,sha256:row.sha256,codeImport:row.code,
        photos:false, /* no files or photo URLs are transmitted */
        photosAEnvoyer:parsed.type==='devis'&&parsed.client.photos===true,
        statut:'A_IMPORTER',destination:'CRM_PRODUCTION'
      };
    })});
  }catch{return fail('OUTBOX_FAILED',503);}
}
async function ack(request,env){
  if(request.method!=='POST')return fail('METHOD',405);
  if(!authorized(request,env))return fail('UNAUTHORIZED',401);
  let body;
  try{
    const raw=await request.text();
    if(raw.length>1200)return fail('TOO_LARGE',413);
    body=JSON.parse(raw);
  }catch{return fail('INVALID_JSON',400);}
  if(!body||typeof body!=='object'||Array.isArray(body)||!REF.test(body.ref||'')||
    !SHA.test(body.sha256||'')||Object.keys(body).sort().join(',')!=='ref,sha256')
    return fail('INVALID_ACK',422);
  try{
    const current=await env.DB.prepare('SELECT sha256,etat FROM demandes WHERE ref=?').bind(body.ref).first();
    if(!current)return fail('UNKNOWN_REF',404);
    if(current.sha256!==body.sha256)return fail('ACK_CONFLICT',409);
    if(current.etat==='importe')return output({ok:true,reference:body.ref,statut:'deja_acquitte'});
    if(current.etat!=='nouveau')return fail('ACK_STATE',409);
    await env.DB.prepare("UPDATE demandes SET etat='importe', imported_at=CURRENT_TIMESTAMP WHERE ref=? AND sha256=? AND etat='nouveau'")
      .bind(body.ref,body.sha256).run();
    const check=await env.DB.prepare('SELECT sha256,etat FROM demandes WHERE ref=?').bind(body.ref).first();
    if(!check||check.sha256!==body.sha256||check.etat!=='importe')return fail('ACK_NOT_CONFIRMED',503);
    return output({ok:true,reference:body.ref,statut:'acquitte'});
  }catch{return fail('ACK_STORAGE_FAILED',503);}
}
const handler={async fetch(request,env){
  if(!active(env))return fail('PRODUCTION_NOT_CONFIGURED',503);
  const url=new URL(request.url),path=url.pathname;
  const allowed=request.headers.get('Origin')===ORIGIN?ORIGIN:'';
  if(path==='/api/demandes')return intake(request,env,allowed);
  if(path==='/admin/outbox')return outbox(request,env);
  if(path==='/admin/ack')return ack(request,env);
  return fail('NOT_FOUND',404);
}};
export default handler;
export {decode,active,hash};
