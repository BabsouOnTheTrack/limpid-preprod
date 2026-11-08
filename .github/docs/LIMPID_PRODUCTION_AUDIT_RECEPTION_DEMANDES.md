# LIMPID — Audit du circuit des vraies demandes actuellement en production

Date : 08/11/2026. **Lecture seule** du dépôt privé de production `BabsouOnTheTrack/limpid-site` au SHA immuable `e8b8f513a37753a371da022d781b44f06d97bec9`. Aucune vraie demande n'a été envoyée et aucune donnée de client, clé de formulaire ni valeur de secret n'est reproduite.

## Circuit actuellement en place, tel qu'il figure dans le code

Les 4 pages `/devis/`, `/configurer-devis-menage/`, `/configurer-devis-vitres/`, `/configurer-devis-locaux-professionnels/` :

1. Génèrent une référence de dossier et un bloc `code_import` encodé sous la forme `LIMPID1.` à partir des choix, qualification et coordonnées du visiteur.
2. Envoient le formulaire complet par **HTTPS POST vers Web3Forms**, et attendent une réponse JSON contenant `success:true` avant l'écran final « demande enregistrée ».
3. Conservent localement un état de demande et une file de relance en cas d'échec, avec réutilisation de la référence déjà créée. Les conversions sont déclenchées après succès déclaré de Web3Forms et protégées contre le double comptage local.
4. Contiennent une option de duplication vers `/api/demandes` (« Phase C »), mais les quatre pages ont actuellement `<meta name="limpid-stockage" content="0">` : **cette duplication est désactivée**. Ne jamais l'activer sur un Worker statique sans endpoint validé ni garantie d'absence d'effets involontaires.
5. Les photos peuvent être indiquées comme **à transmettre après** la demande, séparément par WhatsApp ou e-mail. Le site n'envoie pas directement le fichier photo dans le `LIMPID1` lors de ce parcours.

Ces points sont des **constats de code**, pas la preuve de réception d'un e-mail dans la boîte du gérant ni une preuve que le prestataire externe est toujours opérationnel.

## Écarts à résoudre avant migration

| Comportement de production à préserver | Constat | Prototype récepteur V0.1 |
|---|---|---|
| Envoi du devis général avec téléphone facultatif | Validation d'e-mail + téléphone facultatif dans `/devis/` | **Bloquant** : vérifie un téléphone non vide |
| Demande de rappel rapide (`type="rappel"`) | Présente sur les 3 parcours spécialisés | **Bloquant** : n'accepte que `type="devis"` |
| Photos souhaitées, envoyées après coup | `client.photos=true` et instructions WhatsApp/e-mail | **Bloquant** : refuse `photos=true` |
| Référence et code `LIMPID1` uniques | Présents sur les 4 parcours | Compatibilité de base en test |
| Confirmation uniquement après acceptation | Web3Forms `success:true` | À basculer vers ACK après persistance D1 et stratégie CRM |
| Réessai après erreur réseau | État local des dossiers et file d'attente | À conserver et tester |
| Conversions Google Ads conditionnelles | Déclenchement métier après Web3Forms confirmé | Ne pas modifier sans audit du routage et de la mesure |

**Attention :** la préproduction V1.26 a volontairement testé **des demandes fictives sans photos et non-rappel**. Ses 4/4 parcours verts ne couvrent pas les cas ci-dessus.

## Architecture conseillée avant remplacement de Web3Forms

- **Phase A — parallèle sans couper le circuit existant :** conserver le chemin de production Web3Forms tel quel ; mettre au point une infrastructure de réception complètement séparée, sans client réel, avec tests des 4 parcours + rappels + photos différées + téléphone absent.
- **Phase B — CRM :** identifier les vrais modules et le tableur CRM de production, définir un mapping `LIMPID1` lecture/écriture, dédoublonnage, notifications, gestion de panne et délais ; aucune écriture dans le CRM réel pour la première validation.
- **Phase C — tests bout-en-bout isolés :** worker/D1 PROD-LIKE distincts de STAGING et du public, faux contacts, confirmation après persistance, reprise, collision, anti-duplication, absence d'e-mails clients et de conversions publicitaires.
- **Phase D — bascule explicitement autorisée :** remplacer l'envoi Web3Forms par la nouvelle API, et **non** ajouter naïvement un second POST produisant deux demandes ou deux conversions. Activer seulement après sauvegarde vérifiée de `limpid-site`, contrôle du CRM, tests SEO/mobile et procédure de retour arrière.
- **Phase E — après mise en service :** supervision des demandes réelles de bout en bout, contrôle manuel initial des messages et des notifications, possibilité de revenir au code Web3Forms antérieur **sans perdre les dossiers stockés dans la D1**.

## Inconnues conservées
- Qualité et fréquence réelles de livraison des e-mails par Web3Forms (non vérifiées).
- Paramétrage réel du CRM de production, Google Apps Script et notifications (non identifié).
- Paramètres DNS externes et archive binaire des assets déployés Cloudflare (non archivés indépendamment).
- Durées de conservation et traitement des données personnelles (à définir).

**Statut : NO-GO pour remplacer Web3Forms ou modifier `limpid-site`.** Le prototype `.github/prod-readiness/worker-proposal.mjs` reste désactivé et non déployé ; ses validations actuelles ne couvrent pas toutes les exigences métier.

## Mise à jour V0.2 — Prototype corrigé, **sans migration réelle** (08/11/2026)

Les trois incompatibilités de la **V0.1** consignées ci-dessus ont été prises en charge **dans le brouillon du récepteur**, pas sur le site actif :

| Cas réel à préserver | État de la V0.2 |
|---|---|
| Devis général : téléphone vide | Accepté et testé en mémoire ; e-mail reste requis |
| Rappel spécialisé : sans e-mail ni liste de prestations | Accepté pour ménage, vitres, B2B ; numéro de téléphone et créneau contrôlés |
| Photos annoncées pour envoi ultérieur | `client.photos=true` accepté comme *métadonnée*, sans transfert de photo ; fichiers, images base64 et URL rejetés |
| Rejeu identique, collision SHA, ACK | Tests de stockage et d'ACK simulés réussis |
| CRM réel, Turnstile réel, notifications | Non connectés et non testés |

La V0.2 enrichit l'outbox de `type: devis|rappel` et `photosAEnvoyer: boolean` tout en conservant `codeImport` et `photos:false` (ce dernier signifie uniquement qu'aucune pièce jointe n'est téléversée).

**Points toujours bloquants :** validation du récepteur avec de vrais jetons dans un environnement de qualification isolé ; compatibilité exacte du CRM réel pour les rappels ; récupération sécurisée et suppression réglementaire ; contrôle de la livraison des notifications ; stratégie d'abandon de Web3Forms sans double envoi ; et accord spécifique avant toute action sur `limpid-site`.

**Version actuellement exploitée par le public :** toujours le circuit Web3Forms du commit de `limpid-site` `e8b8f513a37753a371da022d781b44f06d97bec9`, inchangé pendant la préparation.