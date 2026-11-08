/**
 * LIMPID — Projet de contrat d'import CRM en LECTURE SEULE.
 * Aucun appel Google, CRM, Worker, D1, Web3Forms, ni ACK.
 * Ne pas publier ce module (il reste sous .github/).
 */
import {decode,hash} from '../prod-readiness/worker-proposal.mjs';

const SCHEMA='limpid.crm-site-candidate.v1';
const SOURCE='SITE_INTAKE_CANDIDATE';
const KNOWN=new Set(['menage','vitres','b2b','general']);
const FINGERPRINT=/^[a-f0-9]{64}$/;

export async function normaliserEnveloppe(enveloppe){
  if(!enveloppe||typeof enveloppe!=='object'||Array.isArray(enveloppe)||
    enveloppe.schema!=='limpid.site-dossier.v2'||
    enveloppe.statut!=='A_IMPORTER'||enveloppe.destination!=='CRM_PRODUCTION'||
    typeof enveloppe.reference!=='string'||typeof enveloppe.codeImport!=='string'||
    !FINGERPRINT.test(enveloppe.sha256||'')||!KNOWN.has(enveloppe.service)||
    !['rappel','devis'].includes(enveloppe.type)||
    typeof enveloppe.photosAEnvoyer!=='boolean'||enveloppe.photos!==false)
    throw new Error('ENVELOPPE_INCOMPATIBLE');
  const dossier=decode(enveloppe.codeImport);
  if(dossier.id!==enveloppe.reference||dossier.parcours!==enveloppe.service||
    dossier.type!==enveloppe.type)throw new Error('DOSSIER_REFERENCE_TYPE_INCOHERENT');
  const fingerprint=await hash(enveloppe.codeImport);
  if(fingerprint!==enveloppe.sha256)throw new Error('EMPREINTE_INVALIDE');
  const attentePhotos=dossier.type==='devis'&&dossier.client.photos===true;
  if(attentePhotos!==enveloppe.photosAEnvoyer)throw new Error('PHOTO_STATUT_INCOHERENT');

  const c=dossier.client;
  const devis=dossier.type==='devis';
  return {
    schema:SCHEMA,
    source:SOURCE,
    reference:dossier.id,
    empreinte:fingerprint,
    service:dossier.parcours,
    type:dossier.type,
    // Champs uniquement envisagés pour une future inbox technique isolée.
    // Aucun nom de table CRM PRODUCTION n'est présumé.
    contact:{
      nom:c.nom.trim(),
      entreprise:typeof c.entreprise==='string'?c.entreprise:'',
      email:typeof c.email==='string'&&c.email?c.email:null,
      telephone:c.tel.trim()||null,
      commune:typeof c.commune==='string'?c.commune:'',
      adresse:typeof c.adresse==='string'?c.adresse:'',
      message:typeof c.message==='string'?c.message:''
    },
    rappel:devis?null:{creneau:dossier.rappel.creneau},
    prestations:devis?dossier.demandes.map(d=>({offre:d.offre,lib:typeof d.lib==='string'?d.lib:d.offre})):[],
    photosAEnvoyer:attentePhotos,
    piecesJointes:0,
    codeImport:enveloppe.codeImport,
    traitement:'EN_ATTENTE_DE_QUALIFICATION',
    importAutorise:false,
    ackAutorise:false
  };
}
export function planifierSansEcriture(candidats,existants=[]){
  if(!Array.isArray(candidats)||!Array.isArray(existants))throw new Error('PLAN_INVALIDE');
  const connu=new Map();
  for(const e of existants){
    if(!e||typeof e.reference!=='string'||!FINGERPRINT.test(e.empreinte||''))throw new Error('INDEX_INVALIDE');
    const before=connu.get(e.reference);
    if(before&&before!==e.empreinte)throw new Error('INDEX_REFERENCE_CONFLIT');
    connu.set(e.reference,e.empreinte);
  }
  const operations=[];
  const seen=new Map();
  for(const c of candidats){
    if(!c||c.schema!==SCHEMA||typeof c.reference!=='string'||
      !FINGERPRINT.test(c.empreinte||'')||c.importAutorise!==false||c.ackAutorise!==false)
      throw new Error('CANDIDAT_INVALIDE');
    const already=seen.get(c.reference);
    if(already){
      operations.push({reference:c.reference,decision:already===c.empreinte?'DOUBLON_LOT':'CONFLIT_QUARANTAINE'});
      continue;
    }
    seen.set(c.reference,c.empreinte);
    const exists=connu.get(c.reference);
    const decision=!exists?'PROPOSER_INSERTION_SUR_COPIE':exists===c.empreinte?'EXISTANT_IDENTIQUE':'CONFLIT_QUARANTAINE';
    operations.push({reference:c.reference,decision});
  }
  return {
    schema:'limpid.crm-import-plan.v1',
    lectureSeule:true,
    ecriture:false,
    acquittement:false,
    // Ne contient ni coordonnées de clients, ni code LIMPID1.
    operations
  };
}
