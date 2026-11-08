import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import worker,{decode,active,hash} from '../prod-readiness/worker-proposal.mjs';

const ORIGIN='https://limpid-nettoyage.fr';
const TEST_SECRET='turnstile-secret-example-only-aaaaaaaaaaaaaaa';
const CRM_SECRET='crm-secret-example-only-bbbbbbbbbbbbbbbbb';
const oldFetch=globalThis.fetch;
globalThis.fetch=async (url,opts)=>{
 assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');
 const token=opts.body.get('response');
 return new Response(JSON.stringify({
   success:String(token).startsWith('valid-'),
   hostname:token==='valid-wrong-host'?'limpid-preprod.cabochondreams.workers.dev':'limpid-nettoyage.fr',
   action:token==='valid-wrong-action'?'other':'limpid_devis'
 }),{status:200,headers:{'Content-Type':'application/json'}});
};
after(()=>{globalThis.fetch=oldFetch;});

function db(){
 const rows=new Map();
 return {rows, prepare(sql){
    return {bind(...args){
       return {
         async run(){
           if(sql.startsWith('INSERT OR IGNORE')){
             const [ref,service,sha256,code,etat]=args;
             if(!rows.has(ref))rows.set(ref,{ref,service,sha256,code,etat,created_at:'2026-11-08T00:00:00Z',imported_at:null});
             return {success:true};
           }
           if(sql.startsWith('UPDATE demandes SET etat=')){
             const [ref,sha256]=args, row=rows.get(ref);
             if(row&&row.sha256===sha256&&row.etat==='nouveau'){row.etat='importe';row.imported_at='2026-11-08T12:00:00Z';}
             return {success:true};
           }
           throw Error('Unknown SQL run: '+sql);
         },
         async first(){
           const row=rows.get(args[0]);
           return row?{...row}:null;
         },
         async all(){
           assert.match(sql,/WHERE etat=\?/);
           return {results:[...rows.values()].filter(x=>x.etat===args[0]).slice(0,25).map(x=>({...x}))};
         }
       };
    }};
 }};
}
function env(database=db()){
 return {DB:database,LIMPID_ENV:'PRODUCTION',DB_INSTANCE_LABEL:'limpid-intake-production',
    ALLOWED_ORIGIN:ORIGIN,TURNSTILE_EXPECTED_HOSTNAME:'limpid-nettoyage.fr',
    TURNSTILE_EXPECTED_ACTION:'limpid_devis',TURNSTILE_SECRET:TEST_SECRET,CRM_SYNC_SECRET:CRM_SECRET};
}
function code(overrides={}){
 const d={v:2,type:'devis',test:false,id:'LMP-V-20261108-FAKE001',
   parcours:'vitres',client:{nom:'Personne Exemple',email:'client@example.org',tel:'0600000000',photos:false},
   demandes:[{offre:'vitres',lib:'Nettoyage des vitres'}],...overrides};
 return 'LIMPID1.'+Buffer.from(JSON.stringify(d),'utf8').toString('base64');
}
function post(data,token='valid-token-1',origin=ORIGIN){
 return new Request('https://api.limpid-nettoyage.fr/api/demandes',{
   method:'POST',headers:{Origin:origin,'Content-Type':'application/json',
     'X-Limpid-Turnstile':token},body:JSON.stringify(data)});
}
function payload(c=code()){return {ref:'LMP-V-20261108-FAKE001',service:'vitres',code:c};}
function admin(path,options={}){
 return new Request('https://api.limpid-nettoyage.fr'+path,{
   method:options.method||'GET',headers:{
    Authorization:'Bearer '+(options.token||CRM_SECRET),
    ...(options.body?{'Content-Type':'application/json'}:{})
   },body:options.body?JSON.stringify(options.body):undefined
 });
}
async function json(r){return {status:r.status,...await r.json()};}

test('Fail closed without exact env, explicit official origin and correct bindings',async()=>{
 const e=env();
 assert.equal(active(e),true);
 for(const [key,value] of [
 ['LIMPID_ENV','TEST_ISOLE'],['DB_INSTANCE_LABEL','limpid-intake-staging'],
 ['ALLOWED_ORIGIN','https://limpid-preprod.cabochondreams.workers.dev'],
 ['TURNSTILE_EXPECTED_HOSTNAME','limpid-preprod.cabochondreams.workers.dev'],
 ['TURNSTILE_EXPECTED_ACTION',''],['CRM_SYNC_SECRET','short'],['DB',undefined]
 ]){
  const result=await worker.fetch(post(payload()),{...e,[key]:value});
  assert.equal(result.status,503,key);
  assert.equal((await result.json()).error,'PRODUCTION_NOT_CONFIGURED');
 }
});

test('CORS preflight permits exact official site only',async()=>{
 const e=env();
 const req=origin=>new Request('https://api.limpid-nettoyage.fr/api/demandes',{
   method:'OPTIONS',headers:{Origin:origin}
 });
 const accepted=await worker.fetch(req(ORIGIN),e);
 assert.equal(accepted.status,204);
 assert.equal(accepted.headers.get('Access-Control-Allow-Origin'),ORIGIN);
 const denied=await worker.fetch(req('https://limpid-preprod.cabochondreams.workers.dev'),e);
 assert.equal(denied.status,403);
 assert.equal(denied.headers.get('Access-Control-Allow-Origin'),null);
});

test('Production receiver rejects staging packets, forged origins and photos',async()=>{
 const e=env();
 for(const p of [
 payload(code({test:true})),
 payload(code({client:{nom:'Personne Exemple',email:'x@example.invalid',tel:'0600000000',photos:false}})),
 payload(code({client:{nom:'Personne Exemple',email:'client@example.org',tel:'0600000000',photos:true}})),
 {...payload(),service:'menage'},
 ]){
  const result=await worker.fetch(post(p),e);
  assert.equal(result.status,422);
 }
 assert.equal((await worker.fetch(post(payload(),'valid-token-2','https://evil.example'),e)).status,403);
 assert.equal((await worker.fetch(post(payload(),'invalid-token'),e)).status,403);
 assert.equal((await worker.fetch(post(payload(),'valid-wrong-host'),e)).status,403);
 assert.equal((await worker.fetch(post(payload(),'valid-wrong-action'),e)).status,403);
 assert.equal(e.DB.rows.size,0);
});

test('Idempotent D1 insert, mismatch 409 and replay after ACK does not reopen outbox',async()=>{
 const e=env(),c=code(),ref=payload(c).ref;
 const first=await json(await worker.fetch(post(payload(c),'valid-1'),e));
 assert.equal(first.status,201);assert.equal(first.statut,'enregistre');
 assert.equal(e.DB.rows.size,1);
 const replay=await json(await worker.fetch(post(payload(c),'valid-2'),e));
 assert.equal(replay.status,201);assert.equal(e.DB.rows.size,1);
 const changed=code({client:{nom:'Personne Exemple 2',email:'client@example.org',tel:'0600000000',photos:false}});
 const conflict=await json(await worker.fetch(post(payload(changed),'valid-3'),e));
 assert.equal(conflict.status,409);assert.equal(conflict.error,'REFERENCE_CONFLICT');
 assert.equal(e.DB.rows.size,1);
 const unauthorized=await worker.fetch(new Request('https://api.limpid-nettoyage.fr/admin/outbox'),e);
 assert.equal(unauthorized.status,401);
 const inbox=await json(await worker.fetch(admin('/admin/outbox'),e));
 assert.equal(inbox.enveloppes.length,1);
 assert.equal(inbox.enveloppes[0].reference,ref);
 assert.equal(inbox.enveloppes[0].codeImport,c);
 assert.equal(inbox.enveloppes[0].sha256,await hash(c));
 const wrong=await json(await worker.fetch(admin('/admin/ack',{method:'POST',body:{ref,sha256:'0'.repeat(64)}}),e));
 assert.equal(wrong.status,409);assert.equal(e.DB.rows.get(ref).etat,'nouveau');
 const ackPayload={ref,sha256:await hash(c)};
 const ack=await json(await worker.fetch(admin('/admin/ack',{method:'POST',body:ackPayload}),e));
 assert.equal(ack.status,200);assert.equal(ack.statut,'acquitte');
 const ackAgain=await json(await worker.fetch(admin('/admin/ack',{method:'POST',body:ackPayload}),e));
 assert.equal(ackAgain.statut,'deja_acquitte');
 const after=await json(await worker.fetch(admin('/admin/outbox'),e));
 assert.equal(after.enveloppes.length,0);
 const later=await json(await worker.fetch(post(payload(c),'valid-4'),e));
 assert.equal(later.status,201);
 assert.equal(later.statut,'deja_enregistre');
 assert.equal(e.DB.rows.size,1);assert.equal(e.DB.rows.get(ref).etat,'importe');
});

test('No accidental cache, PII or secret echo in error responses',async()=>{
 const e=env(),result=await worker.fetch(post(payload(),'invalid'),e);
 const body=await result.text();
 assert.equal(result.headers.get('Cache-Control'),'no-store');
 assert.ok(!body.includes(CRM_SECRET)&&!body.includes(TEST_SECRET));
 assert.ok(!body.includes('client@example.org'));
 assert.equal(result.headers.get('X-Content-Type-Options'),'nosniff');
});

test('Malformed/oversized inputs fail before DB writes',async()=>{
 const e=env();
 const wrong=new Request('https://api.limpid-nettoyage.fr/api/demandes',
  {method:'POST',headers:{Origin:ORIGIN,'Content-Type':'text/plain'},body:'oops'});
 assert.equal((await worker.fetch(wrong,e)).status,415);
 const huge=post({...payload(),code:'X'.repeat(60001)});
 assert.equal((await worker.fetch(huge,e)).status,413);
 assert.equal(e.DB.rows.size,0);
});
