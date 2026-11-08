# LIMPID — ÉTAT CANONIQUE DE RÉHYDRATATION — 08/11/2026

**Objet :** reprise exhaustive du chantier LIMPID EXPERIENCE / SIGNATURE et LIMPID ✦ CRM après transfert de conversation. Ce document est un repère d'ingénierie versionné avec le code ; il ne se substitue pas aux archives de sources, aux manifests SHA-256 ni aux preuves CI stockées dans le paquet de continuité séparé.

> **CONSigne PRIORITAIRE** : ne JAMAIS toucher au véritable Worker Cloudflare `limpid-site`, au dépôt `BabsouOnTheTrack/limpid-site` (branche `main`), à Web3Forms, à Google Ads, aux Radars et au CRM réel tant que le propriétaire n'autorise pas expressément un déploiement de production, après audit des sauvegardes et plan de retour arrière. Les validations STAGING/PR ne sont PAS des validations PRODUCTION.

## 1. Références canoniques au 08/11/2026

- **Site public actuel** : `https://limpid-nettoyage.fr`, Worker `limpid-site`, dépôt GitHub privé `BabsouOnTheTrack/limpid-site`, `main` au commit `e8b8f513a37753a371da022d781b44f06d97bec9`. Déploiement Cloudflare actif : version UUID `aba7a3ae-a271-40a7-b005-b62d215b6fc3`, Build `#6497772e`, Wrangler 4.156.0. Le journal du build établit l'origine GitHub (commit abrégé `e8b8f51`) et un déploiement réussi. Worker statique sans bindings/variables accessibles à ajouter dans cette configuration.
- **Sauvegarde du site public** : le propriétaire a déclaré `SAUVEGARDE OK` le 08/11/2026 après téléchargement du ZIP du dépôt au SHA susmentionné. Archive **conservée par le propriétaire**, non ouverte/contrôlée par l'assistant ; configuration Cloudflare et identité binaire indépendante non archivées ici.
- **Site SIGNATURE en préproduction** : dépôt `BabsouOnTheTrack/limpid-preprod`, branche `limpid-signature-v126-lab-integration`, PR [#1](https://github.com/BabsouOnTheTrack/limpid-preprod/pull/1) **ouverte en brouillon, non fusionnée**. Direction visuelle SIGNATURE V1.27 validée techniquement sur les récapitulatifs des trois configurateurs spécialisés. Dernier commit avant ce point de sauvegarde : `4a1d45fecc8216234f1daaa133f27b8b9ad6d8de`. Le ZIP de sources GitHub généré par CI constitue la **révision figée la plus récente** du paquet de reprise.
- **Preview Cloudflare** : `https://limpid-signature-v126-lab-integration-limpid-preprod.cabochondreams.workers.dev`. Page générique `/devis/` ; spécialisés `/configurer-devis-menage/`, `/configurer-devis-vitres/`, `/configurer-devis-locaux-professionnels/`. Utiliser `?test=1` uniquement avec données fictives ; ne pas la confondre avec le site public.
- **STAGING d'ingestion** : Worker `limpid-intake-staging`, D1 `limpid-intake-staging`, mécanisme CORS / Turnstile + `LIMPID1` fictif. D1 contrôlée au 08/11 : dernier dossier `LMP-G-261108-F772BC93` en état `importe`, `imported_at` 2026-11-08 16:11:24 UTC ; requête `WHERE ref=... OR etat='nouveau'` ne retourne aucun dossier supplémentaire. Aucune affirmation de l'état courant après ce contrôle.
- **CRM LAB** : tableur Google `LIMPID — LAB SITE-CRM V1.7 — TESTS`, ID `1z8KLlpO1EQ35c6ZBFrtxcYMIO33tXcFEv715lqSmqBQ`. Tests d'inbox et ACK sur copie, références uniques retrouvées dans LAB.
- **CRM réel** : Google Apps Script `LIMPID - CRM V6` visible dans les captures fournies : `Code.gs`, `Devis.html`, `Index.html`, `Limpid_V592_IntegrationCRM.gs`, `Limpid_V571_Synchronisation.gs`, `Limpid_V6712_RegistreDevis.gs` et autres. Projet/déploiement ID exact et code source actif non certifiés. Le tableur central candidat `LIMPID — Base centrale Radar & Prospection V6`, ID `10loSjoDKj_rcPDIr-NVgE8b9b6dyCdoobj2gMhp0d2M`, présente les onglets `CRM_State`, `Devis_CRM`, `Prospects`, `Limpid_Config_V6`. **Aucune modification CRM réel**.

## 2. Livrables GitHub SIGNATURE

- `assets/signature-site.css` : charte premium Limpid, descriptif de marque lisible (11 px 801–1599 px, 12 px ≥1600 px) ; navigation conservée. Test Chromium à 8 largeurs (960/980/1100/1250/1366/1440/1600/1920) : aucune collision/débordement.
- `assets/signature-recap-detail.js` : vue de récapitulatif **pure** basée sur `LimpidMoteur.perimetre(CFG.saisie(R))` et `LimpidMoteur.estimer(CFG.saisie(R))` ; sections « Compris », « Éléments et options », « Retiré à votre demande », « Non compris », durée indicative, aide prix et crédit d'impôt sous conditions pour le ménage. La présentation n'a pas à modifier les calculs métier, ni les données `LIMPID1`.
- `assets/signature-config.css` : carte détaillée responsive ; intégration dans les 3 configurateurs spécialisés, boutons `Modifier` conservés. Récapitulatif général `/devis/` possède son propre modèle détaillé et n'a pas été restructuré.
- `.github/tests/staging-filled-recap-smoke.cjs` : restitue 6 états de demande **fictifs** dans Chromium, 3 services × 390/1280 px, puis teste rubriques, durée calculée et chemin `Modifier` → retour au récapitulatif sans POST réseau ; **6/6 cas PASS**.
- Résultats sur ces fixtures : ménage durée affichée 3 h 53 ; vitres 1 h 26 ; B2B 2 h 13 ; cela ne constitue ni tarif ni durée contractuelle.
- CI `Limpid Staging Guardrails` : 15 tests historiques + 11 tests du prototype d'ingestion V0.2 + 6 tests du contrat CRM + 5 tests du récap = **37 tests Node réussis** au dernier bilan, plus contrat SQLite D1 offline, GET-only Preview, Chromium mobile et desktop ; Cloudflare Workers Builds réussi. Les tests d'écran final généralisé sont simulés, non des envois mobiles réels.

## 3. Liaison Site → D1 → CRM (séparation impérative)

- Le **véritable site public** utilise toujours Web3Forms pour ses 4 demandes : référence unique + `code_import` `LIMPID1` ; `<meta name="limpid-stockage" content="0">` désactive la duplication facultative vers `/api/demandes`. Ne pas l'activer sans backend réel et audit.
- Les tests STAGING ont démontré création D1, récupération LAB et ACK sur dossiers fictifs. Un rejouage HTTP distant anti-doublon avec nouveau jeton Turnstile valide n'a **pas** été indépendamment démontré ; uniquement tests du contrat en mémoire et SQLite.
- **Prototype de récepteur PRODUCTION V0.2** : `.github/prod-readiness/worker-proposal.mjs` (NON DÉPLOYÉ), `.github/prod-readiness/schema.sql` non exécuté, README et 11 tests en mémoire ; refuse STAGING, contrôle origine/Turnstile et SHA, idempotence et ACK.
- Le V0.2 accepte téléphone facultatif sur devis général, `type=rappel` sans e-mail et sans prestation sur les 3 services spécialisés, signal `client.photos=true` pour photos **à transmettre ultérieurement**, sans transfert de pièces jointes. Les formulaires SIGNATURE récents ont retiré le parcours rappel de certaines pages ; vérifier les chemins réellement disponibles avant toute mise en production.
- **Contrat CRM en lecture seule** : `.github/crm-contract/adapter.mjs` et README ; transforme enveloppes `limpid.site-dossier.v2` en candidats validés `limpid.crm-site-candidate.v1`. `planifierSansEcriture` distingue nouveau, identique, doublon et conflit ; **aucune écriture ni ACK**. L'intégration Apps Script réelle reste à concevoir/tester sur copie.
- Réception prod envisagée : Worker HTTPS distinct, D1 prod distincte, Turnstile prod distinct, rétention RGPD, WAF/limites, outbox sécurisée, CRM réel résilient, ACK uniquement après persistance, notifications après import, zéro doublon et conversion GA4 non perturbée.

## 4. Garde-fous métier & design

- Logo Limpid officiel conservé ; palette `#1A56DB`, `#0B2545`, `#4CC9F0`, `#EEF6FB`. Accueil souhaité : « Des locaux impeccables, sans y penser. » Direction cockpit / premium, pas de numérotation décorative, pas de flèches diagonales sur les boutons, pictogrammes cohérents, contrastes forts, textes réellement lisibles.
- Site SIGNATURE : préserver 34 pages historiques/préprod (33 anciennes routes + `/professionnels/`), 4 moteurs de devis et toute la logique de calcul, référentiel, aides visuelles, SEO, tracking, redirections, import `LIMPID1`, anti-sursaut mobile.
- Demande récente validée : récapitulatif détaillé comme le devis général pour ménage/vitres/B2B : Compris par pièce ou élément, options, exclusions, fréquence, durée **indicative**, messages commerciaux. Ne pas inventer de prestations ; utiliser les données moteur réellement calculées.
- CRM V6.7.18 / C15.2.1 en exploitation côté utilisateur (à vérifier avant toute intervention). Préférences : parcours simple, besoin client d'abord, analyse économique étape 1, pas d'« usine à gaz », pas de mention « recette » visible, import `LIMPID1` historique intouchable, devis PDF premium, génération vitres exacte (Velux 2 faces en intérieur).
- Paramètres économiques historiques : objectif CA 6 000 €/mois ; foyer 3 500 €/mois ; cotisations 21,5 % ; frais fixes 340 €/mois et provisions 220 €/mois selon configuration d'octobre. Tout calcul futur doit être recalé sur valeurs réelles à jour.
- Prospection/Radar/Appels d'offres/Google Ads/GGS et ViZiBiLi : systèmes distincts ; **ne pas modifier sans demande explicite**, ne créer aucune tâche planifiée supplémentaire dans la limite existante.

## 5. Documents GitHub d'audit

- `.github/docs/LIMPID_SITE_INVENTAIRE_PRODUCTION_2026-11-08.md` — Git SHA public / Worker version / build / configuration / sauvegarde déclarée par le propriétaire.
- `.github/docs/LIMPID_PRODUCTION_AUDIT_RECEPTION_DEMANDES.md` — Web3Forms actuel, variantes devis/rappel/photos, contraintes de migration.
- `.github/docs/LIMPID_SIGNATURE_V126_PLAN_DEPLOIEMENT_PRODUCTION.md` — conditions NO-GO, sauvegarde, préparation, tests, rollback.
- `.github/prod-readiness/README.md` — prototype HTTP/D1 NON DÉPLOYÉ.
- `.github/crm-contract/README.md` — mapping strictement en mémoire.
- Discussions et preuves CI : PR #1, commentaires du 08/11, GitHub Actions run `42507253506`, artefact `13627743679` (captures et métriques).

## 6. Points non vérifiés / restant ouverts

1. Vérification hors ligne d'empreinte SHA256 et test de restauration du ZIP source `limpid-site` conservé par le propriétaire ; export de réglages Cloudflare, DNS/domaines, rollback technique complet.
2. Validation humaine des 3 récapitulatifs complets V1.27 et lisibilité du menu avant toute promotion du design en prod.
3. Identification du projet Apps Script **réel**, accès en lecture seule à son code et aux fonctions d'import, contrat de migration testé sur une vraie **copie isolée**.
4. Notifications gérant, consentement/rétention/effacement, API réception PROD séparée, intégrité des soumissions, anti-spam/Turnstile, reprise après pannes, monitoring.
5. Compatibilité des prestations `LIMPID1`, téléphone facultatif, photos différées et éventuels rappels ; nouvelle preuve anti-rejeu HTTP avec jeton neuf, sans données réelles.
6. Parcours complet de saisie (sans POST) pour toutes les combinaisons principales, tests SEO/mobile et suivi analytics après nouvelle version.
7. **Autorisation de déploiement spécifique ultérieure** avant modification du vrai `limpid-site`. La PR #1 reste brouillon ; ne pas fusionner automatiquement.

## 7. Procédure de reprise

1. Télécharger le paquet ZIP de réhydratation du 08/11 et le garder **hors ChatGPT**. Lire `00_LIRE_EN_PREMIER.md`, `ETAT_CANONIQUE_2026-11-08.md`, `MANIFESTE_SHA256.csv`, le message de reprise, puis les archives intégrées.
2. Ne jamais traiter le fichier de site public comme si SIGNATURE V1.27 était déjà déployée : **ce sont deux Worker et deux dépôts distincts**.
3. Vérifier l'état réel GitHub/Cloudflare/D1/CRM **avant** de commencer toute nouvelle modification.
4. Continuer à partir du code GitHub source du dernier HEAD figé dans `SOURCES/` ; ancien ZIP V1.26 et archive LAB V1.8 inclus en complément d'historique.
5. Toujours créer une nouvelle sauvegarde de continuité avant chaque grosse opération ou transfert ; ne pas supposer que des liens sandbox d'une ancienne conversation resteront utilisables.
6. Si archives ou données manquent, le signaler. Ne pas déduire de secrets ou de code non observé.

  
## AVENANT 08/11 — Audit approfondi du CRM historique et verrou anti-ACK

Après la sauvegarde initiale V1.27, le fichier ancien `Devis.html` (CRM V6.7.16) a été inspecté en lecture seule. Découverte : le registre `limpid_demandes_importees` repose sur le `localStorage` du navigateur (pas sur Google Sheets), et l'ancien `PATCH` peut être envoyé avant toute preuve de persistance partagée. `Code.gs` refuse aussi l'enregistrement d'un devis partagé `Devis_CRM` si la fiche prospect/appel n'existe pas dans `CRM_State`. L'intégration automatisée devra donc passer par une **inbox CRM indépendante et contrôlée** plutôt que par le simple écran d'import historique.

Durcissement du prototype non déployé : obligation d'un `saisie.type` reconnu dans chaque prestation de devis `LIMPID1` ; validation des devis multi-prestations. Ajout d'un simulateur purement local `.github/crm-contract/ack-safety.mjs` qui garde toujours `autorisationEnvoi:false`, même après simulation de relecture. Aucune écriture ni ACK réelle. La branche GitHub contient les modifications ; le paquet ZIP intégral daté plus tôt dans la journée reste un **point de restauration antérieur** à cet avenant. La prochaine sauvegarde ZIP devra prendre le nouvel HEAD et conserver ce paquet antérieur.

Prochain blocage matériel : obtenir **le code réel actuellement déployé** du projet Apps Script `LIMPID - CRM V6`, en lecture seule / sur copie, pour certifier les fonctions et le rattachement à `CRM_State`. Ne pas installer le prototype dans le CRM réel.

  
## AVENANT 08/11 — Première Inbox Site en LAB (V6.13)

L'export complet du vrai Apps Script CRM V6 est maintenant disponible en archive privée `LIMPID_CRM_V6_EXPORT.zip` (32 fichiers utiles) et a été inspecté en lecture seule. La copie de sources et les études restent distinctes du **déploiement Apps Script actif**, non certifié.

**Résultat matériel** : nouvel onglet LAB `LAB_Inbox_Site_V1_TEST` gid `61130022` créé et relu dans le tableur Google Sheets LAB `1z8KLlpO1EQ35c6ZBFrtxcYMIO33tXcFEv715lqSmqBQ`, avec 16 en-têtes, zéro donnée. Un fichier GAS additionnel `.github/crm-contract/Limpid_V613_Inbox_Site_COPIE.gs`, son guide et 12 tests d'émulation ont été enregistrés sur branche préproduction. Le module refuse les vrais ID script/tableur et les dossiers non `test:true`, et ne possède aucune méthode d'ACK. La CI totalise désormais **58/58 tests Node réussis**.

**À faire** : créer un **NOUVEAU Apps Script vierge** distinct, installer uniquement ce fichier et quatre propriétés TEST/ID explicites, puis y lancer cinq faux dossiers avec diagnostic. Ne jamais recopier l'intégralité du vrai projet vers une copie sans auditer les références de stockage du fichier `Code.js`, qui pointent toujours vers le vrai tableur. Le module n'a pas encore été exécuté à distance. Fichier ZIP et manifeste conservés en bibliothèque `/LIMPID_REHYDRATATION/`. **NO-GO PROD**.
