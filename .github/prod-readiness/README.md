# LIMPID — Récepteur de production V0.2 (prototype non déployé)

**État : NO-GO PRODUCTION.** Fichiers conservés dans \`.github/prod-readiness/\` uniquement, exclus des fichiers du site public. Aucun Worker, D1, secret, API CRM ni domaine de production n'a été modifié.

## Compatibilité avec les quatre formulaires du site en service

Le contrat HTTP proposé est \`POST /api/demandes\` avec \`{ref,service,code}\`, code de type \`LIMPID1\`. Les quatre services reconnus sont \`menage\`, \`vitres\`, \`b2b\`, \`general\`.

| Variante | Récepteur V0.2 |
|---|---|
| Devis spécialisé | E-mail obligatoire ; téléphone facultatif ; au moins une prestation |
| Devis général | E-mail obligatoire ; **téléphone facultatif** |
| Rappel ménage / vitres / B2B | \`type=rappel\`, pas d'e-mail requis, **téléphone obligatoire**, \`demandes=[]\`, créneau parmi \`matin/midi/aprem/soir/indiff\` |
| Rappel général | Refusé : le configurateur général ne produit pas ce parcours |
| Photos ultérieures | \`client.photos=true\` accepté comme **indicateur seulement**, zéro photo téléchargée |
| Fichiers, URL d'image, base64 en PJ | Refusés (422), même si les photos sont annoncées ultérieurement |
| Test/staging \`test=true\` | Refusé ; aucun accès vers D1 STAGING |

**Point de vigilance :** les photos annoncées sont transmises par le client *après* la demande, via WhatsApp ou e-mail conformément au parcours actuel. L'indicateur \`photosAEnvoyer=true\` est ajouté à l'enveloppe d'outbox ; \`photos=false\` signifie **aucun fichier téléversé**. Il ne faut surtout pas interpréter ce booléen comme « aucun souhait de photo ».

## Contrats de sécurité proposés (non validés à distance)

- Verrouillage \`LIMPID_ENV=PRODUCTION\`, label D1 dédié, origine officielle exacte, Turnstile avec action/hostname vérifiés et deux secrets indépendants.
- Attention : un nom de label ne prouve pas l'identité réelle de la base D1 liée ; vérifier l'ID dans Cloudflare avant tout raccordement.
- Origin seul n'est pas une authentification ; validation Turnstile serveur, WAF/rate limiting, CORS restrictif, rejets JSON et taille maximale sont nécessaires.
- Référence unique en D1, empreinte SHA-256 pour repérer les divergences, succès seulement après relecture D1.
- Endpoint administratif protégé par secret : \`GET /admin/outbox\` ne retourne que les états \`nouveau\` ; enveloppe enrichie des champs \`type\` et \`photosAEnvoyer\`, le code complet \`LIMPID1\` reste disponible.
- Après import CRM confirmé, \`POST /admin/ack\` : une ACK répétée est idempotente ; aucun dossier ne revient dans l'outbox.
- Éviter de consigner les codes LIMPID1, les coordonnées personnelles ou les secrets en clair dans les journaux.
- Aucune e-mail client ou conversion publicitaire n'est envoyée par ce prototype. Les conversions existantes du site public ne doivent pas être touchées sans recette dédiée.

## Bloqueurs avant mise en production

1. Vérifier la sauvegarde ZIP conservée par le propriétaire au commit \`e8b8f513a37753a371da022d781b44f06d97bec9\` et les réglages Cloudflare du Worker public \`limpid-site\`.
2. Identifier réellement le CRM de production (et les scripts associés), préserver l'import \`LIMPID1\`, intégrer les demandes de rappel et les indicateurs de photos différées.
3. Tester un circuit entièrement isolé, y compris faux dossiers de rappel, collision SHA et réessai, puis panne côté CRM (aucune ACK prématurée).
4. Définir règles RGPD de conservation, accès gérant, suppression/export et sécurisation des données D1.
5. Prévoir une configuration Turnstile de production distincte des tests ainsi qu'une protection anti-abus/rate limiting.
6. Concevoir le remplacement de Web3Forms **sans double envoi ni rupture de service** ; garder le circuit existant jusqu'à accord distinct de bascule. Le Worker public actuel est un Worker statique, le futur récepteur sera séparé.
7. **Le rejeu HTTP distant avec de vrais jetons Turnstile et l'interopérabilité CRM de production ne sont pas démontrés.**

## Tests intégrés

\`.github/tests/prod-receiver-draft.test.mjs\` : tests Node sur données entièrement synthétiques, environnement et Siteverify simulés. Contrôle d'origines, idempotence, ACK, callbacks, téléphone vide, photos différées et rejet des fichiers.

**Ne jamais publier ce prototype tel quel. Aucune migration ni fusion autorisée automatiquement.**
