/**
 * LIMPID — garde théorique d'acquittement, simulation COPIE uniquement.
 *
 * AUCUN appel réseau, aucune écriture CRM, aucune méthode d'ACK.
 * Ce module ne peut PAS authentifier une transaction du CRM réel.
 * Même en cas de simulation réussie, autorisationEnvoi reste false.
 */
const SHA=/^[0-9a-f]{64}$/;
const REF=/^LMP-[A-Z0-9-]{8,50}$/;
function refOK(r,h){return typeof r==='string'&&REF.test(r)&&typeof h==='string'&&SHA.test(h);}
const no=(reason)=>Object.freeze({
  schema:'limpid.crm-ack-simulation.v1',
  environnement:'COPIE_ISOLEE',
  autorisationEnvoi:false,
  acquittementReel:false,
  etat:'ACK_INTERDIT',
  raison:reason,
  proposition:null
});
export function simulerAcquittementApresRelecture(candidat,ecriture,relecture){
  if(!candidat||candidat.schema!=='limpid.crm-site-candidate.v1'||
    !refOK(candidat.reference,candidat.empreinte)||
    candidat.importAutorise!==false||candidat.ackAutorise!==false)
    return no('CANDIDAT_NON_VERIFIE');
  if(!ecriture||!relecture)return no('PREUVE_ABSENTE');
  if(ecriture.environnement!=='COPIE_ISOLEE'||relecture.environnement!=='COPIE_ISOLEE')
    return no('HORS_COPIE_ISOLEE');
  if(!refOK(ecriture.reference,ecriture.empreinte)||
    !refOK(relecture.reference,relecture.empreinte)||
    candidat.reference!==ecriture.reference||
    candidat.reference!==relecture.reference||
    candidat.empreinte!==ecriture.empreinte||
    candidat.empreinte!==relecture.empreinte)
    return no('REFERENCE_OU_EMPREINTE_INCOHERENTE');
  if(!['PERSISTE','EXISTANT_IDENTIQUE'].includes(ecriture.etat)||
    typeof ecriture.journalTransaction!=='string'||ecriture.journalTransaction.length<8)
    return no('ECRITURE_NON_CONFIRMEE');
  if(relecture.etat!=='RELUE'||!Number.isSafeInteger(relecture.identifiantLigne)||relecture.identifiantLigne<=0)
    return no('RELECTURE_NON_CONFIRMEE');
  if(ecriture.identifiantLigne!==relecture.identifiantLigne)
    return no('LIGNE_NON_CONCORDANTE');
  // This is a non-executable suggestion for a future reviewed Apps Script connector.
  // The real implementation must authenticate both proofs and handle atomicity.
  return Object.freeze({
    schema:'limpid.crm-ack-simulation.v1',
    environnement:'COPIE_ISOLEE',
    autorisationEnvoi:false,
    acquittementReel:false,
    etat:'PREUVE_SIMULEE_CONCORDANTE',
    raison:null,
    proposition:{ref:candidat.reference,sha256:candidat.empreinte}
  });
}
