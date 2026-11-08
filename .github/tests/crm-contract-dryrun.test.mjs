import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../prod-readiness/worker-proposal.mjs';
import {normaliserEnveloppe,planifierSansEcriture} from '../crm-contract/adapter.mjs';

function fixture(overrides={}){
 const base={v:2,id:'LMP-G-20261108-CRMLAB01',parcours:'general',
   type:'devis',test:false,client:{nom:'CLIENT FICTIF',email:'qa@example.org',tel:'',photos:true,
   commune:'Darnieulles',message:'TEST'},demandes:[{offre:'grand',lib:'Grand nettoyage',saisie:{type:'grand',surface:45}}]};
 return {...base,...overrides};
}
async function envelope(d,more={}){
 const codeImport='LIMPID1.'+Buffer.from(JSON.stringify(d),'utf8').toString('base64');
 return {schema:'limpid.site-dossier.v2',reference:d.id,service:d.parcours,type:d.type,
   sha256:await hash(codeImport),codeImport,photos:false,
   photosAEnvoyer:d.type==='devis'&&d.client.photos===true,
   statut:'A_IMPORTER',destination:'CRM_PRODUCTION',...more};
}
test('Devis général sans téléphone conservé, photos ultérieures signalées',async()=>{
 const c=await normaliserEnveloppe(await envelope(fixture()));
 assert.equal(c.schema,'limpid.crm-site-candidate.v1');
 assert.equal(c.type,'devis');assert.equal(c.contact.telephone,null);
 assert.equal(c.contact.email,'qa@example.org');
 assert.equal(c.photosAEnvoyer,true);
 assert.equal(c.piecesJointes,0);assert.equal(c.prestations.length,1);
 assert.equal(c.importAutorise,false);assert.equal(c.ackAutorise,false);
});
test('Rappels sur les trois parcours : e-mail non requis, aucune prestation',async()=>{
 for(const [service,letter] of [['menage','M'],['vitres','V'],['b2b','B']]){
   const d=fixture({id:'LMP-'+letter+'-20261108-CALLCRM',parcours:service,type:'rappel',
     client:{nom:'CLIENT FICTIF',tel:'0600000000',commune:'Épinal'},rappel:{creneau:'aprem'},demandes:[]});
   const c=await normaliserEnveloppe(await envelope(d));
   assert.equal(c.type,'rappel');
   assert.equal(c.contact.email,null);
   assert.equal(c.contact.telephone,'0600000000');
   assert.equal(c.rappel.creneau,'aprem');
   assert.equal(c.prestations.length,0);
   assert.equal(c.photosAEnvoyer,false);
 }
});
test('Mismatch source, hash, service, type et photo : rejet avant plan',async()=>{
 const d=fixture(),e=await envelope(d);
 for(const corrupt of [
   {...e,sha256:'0'.repeat(64)}, {...e,reference:'LMP-G-OTHER'},
   {...e,service:'b2b'}, {...e,type:'rappel'},
   {...e,photosAEnvoyer:false},{...e,statut:'importe'},
   {...e,destination:'CRM_LAB'}, {...e,photos:true}
 ]){
   await assert.rejects(normaliserEnveloppe(corrupt));
 }
});
test('Plan lecture seule : insertion proposée, répétition identique évitée',async()=>{
 const c=await normaliserEnveloppe(await envelope(fixture()));
 const p=planifierSansEcriture([c,c],[]);
 assert.equal(p.lectureSeule,true);
 assert.equal(p.ecriture,false);assert.equal(p.acquittement,false);
 assert.deepEqual(p.operations.map(x=>x.decision),['PROPOSER_INSERTION_SUR_COPIE','DOUBLON_LOT']);
 assert.ok(!JSON.stringify(p).includes('qa@example.org'));
 assert.ok(!JSON.stringify(p).includes('LIMPID1.'));
});
test('Enregistrement existant identique ou référence en conflit : pas écriture',async()=>{
 const c=await normaliserEnveloppe(await envelope(fixture()));
 const identical=planifierSansEcriture([c],[{reference:c.reference,empreinte:c.empreinte}]);
 assert.equal(identical.operations[0].decision,'EXISTANT_IDENTIQUE');
 const conflict=planifierSansEcriture([c],[{reference:c.reference,empreinte:'a'.repeat(64)}]);
 assert.equal(conflict.operations[0].decision,'CONFLIT_QUARANTAINE');
 assert.equal(conflict.acquittement,false);
});
test('Un conflit intralot et index incohérent sont signalés',async()=>{
 const c=await normaliserEnveloppe(await envelope(fixture()));
 const clash={...c,empreinte:'1'.repeat(64)};
 const p=planifierSansEcriture([c,clash]);
 assert.equal(p.operations[1].decision,'CONFLIT_QUARANTAINE');
 assert.throws(()=>planifierSansEcriture([c],[{reference:'x',empreinte:'oops'}]),/INDEX_INVALIDE/);
});
