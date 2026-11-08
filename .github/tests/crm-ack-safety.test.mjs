import test from 'node:test';
import assert from 'node:assert/strict';
import {simulerAcquittementApresRelecture as verifier} from '../crm-contract/ack-safety.mjs';
const h='a'.repeat(64),ref='LMP-G-20261108-ACKTEST1';
const candidate={schema:'limpid.crm-site-candidate.v1',reference:ref,empreinte:h,
  importAutorise:false,ackAutorise:false};
const write={environnement:'COPIE_ISOLEE',reference:ref,empreinte:h,
  etat:'PERSISTE',identifiantLigne:9,journalTransaction:'TX-FICTIF-001'};
const read={environnement:'COPIE_ISOLEE',reference:ref,empreinte:h,
  etat:'RELUE',identifiantLigne:9};
function deny(result,reason){
 assert.equal(result.autorisationEnvoi,false);
 assert.equal(result.acquittementReel,false);
 assert.equal(result.etat,'ACK_INTERDIT');
 assert.equal(result.raison,reason);
 assert.equal(result.proposition,null);
}
test('Aucun ACK possible depuis le seul écran ou registre local',()=>{
 deny(verifier(candidate,null,null),'PREUVE_ABSENTE');
 deny(verifier(candidate,{...write,etat:'AFFICHE'},null),'PREUVE_ABSENTE');
});
test('Refuse origine non isolée, même si les autres champs correspondent',()=>{
 deny(verifier(candidate,{...write,environnement:'CRM_PRODUCTION'},read),'HORS_COPIE_ISOLEE');
 deny(verifier(candidate,write,{...read,environnement:'CRM_PRODUCTION'}),'HORS_COPIE_ISOLEE');
});
test('Refuse référence et empreinte incohérentes',()=>{
 deny(verifier(candidate,{...write,empreinte:'b'.repeat(64)},read),'REFERENCE_OU_EMPREINTE_INCOHERENTE');
 deny(verifier(candidate,write,{...read,reference:'LMP-G-20261108-OTHER'},),'REFERENCE_OU_EMPREINTE_INCOHERENTE');
});
test('Refuse simple tentative écriture / absence journal transaction',()=>{
 deny(verifier(candidate,{...write,etat:'COMMENCE'},read),'ECRITURE_NON_CONFIRMEE');
 deny(verifier(candidate,{...write,journalTransaction:''},read),'ECRITURE_NON_CONFIRMEE');
});
test('Refuse relecture échouée, invalide, ou autre ligne',()=>{
 deny(verifier(candidate,write,{...read,etat:'NON_TROUVEE'}),'RELECTURE_NON_CONFIRMEE');
 deny(verifier(candidate,write,{...read,identifiantLigne:0}),'RELECTURE_NON_CONFIRMEE');
 deny(verifier(candidate,write,{...read,identifiantLigne:12}),'LIGNE_NON_CONCORDANTE');
});
test('Simulation positive propose seulement une ACK non émissible',()=>{
 const r=verifier(candidate,write,read);
 assert.equal(r.etat,'PREUVE_SIMULEE_CONCORDANTE');
 assert.equal(r.autorisationEnvoi,false);
 assert.equal(r.acquittementReel,false);
 assert.deepEqual(r.proposition,{ref,sha256:h});
 assert.ok(!JSON.stringify(r).includes('Client'));
});
test('Une référence déjà identique doit aussi avoir une relecture vérifiable',()=>{
 const r=verifier(candidate,{...write,etat:'EXISTANT_IDENTIQUE'},read);
 assert.equal(r.etat,'PREUVE_SIMULEE_CONCORDANTE');
 deny(verifier(candidate,{...write,etat:'EXISTANT_IDENTIQUE'},null),'PREUVE_ABSENTE');
});
