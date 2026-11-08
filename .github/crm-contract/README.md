# LIMPID — Contrat d'import CRM V0.1 — étude en lecture seule

**08/11/2026 — AUCUNE ÉCRITURE CRM.** Le futur récepteur HTTP V0.2 reste un prototype privé non déployé. Ce module est situé sous `.github/crm-contract/`, exclu du site public, et ne contient ni ID client, ni secret, ni appel API.

## Structure Google Drive réellement observée
Une recherche sur le Google Drive connecté a trouvé le tableur **« LIMPID — Base centrale Radar & Prospection V6 »**, identifiable par son ID `10loSjoDKj_rcPDIr-NVgE8b9b6dyCdoobj2gMhp0d2M`. **Il est un candidat sérieux pour la base du CRM en production, mais le rattachement du code Apps Script V6.7.18 actif à ce tableur n'est pas certifié.**

Onglets existants observés sans lire les dossiers de clients :
- `CRM_State` : en-têtes `Clé`, `Index`, `Données JSON — ne pas modifier`, `Métadonnée`, `Valeur`. Une clé technique `main` est présente, mais **son JSON n'a pas été lu ni modifié**.
- `Devis_CRM` : `ID prospect`, `Client / entreprise`, `N° devis`, `Montant indicatif €`, `État (Brouillon / Préparé / Envoyé / Accepté / Refusé)`, `État JSON devis (confidentiel)`, `Dernière modification`, `Date envoi confirmée`.
- `Prospects` : table de prospection existante, à préserver.
- `Limpid_Config_V6` : révision, date, JSON de configuration, empreinte.

Un autre tableur `LIMPID — LAB SITE-CRM V1.7 — TESTS` est identifié séparément, avec `LAB_Demandes_Site` et `LAB_Dossiers_Detailles_V111`. Ses champs techniques sont : référence, reçu UTC, parcours, nom/email TEST, commune, prestations, code LIMPID1, empreinte, état.

**Aucun projet Apps Script natif accessible n'a été trouvé via la recherche Drive**. Les noms des fonctions et la structure de stockage interne du CRM réel restent donc inconnus. Les livrables ne supposent pas l'existence d'une fonction d'import compatible.

## Contrat candidat (aucun nouveau tableau créé)
La fonction pure `normaliserEnveloppe` transforme une enveloppe du Worker (`limpid.site-dossier.v2`) en candidat `limpid.crm-site-candidate.v1`, en vérifiant l'empreinte SHA-256, la référence, le type, la prestation et l'indicateur de photos différées.

Elle respecte :
- `type=devis` : téléphone facultatif, email requis et prestations non vides.
- `type=rappel` : téléphone requis, pas d'e-mail ni de prestation obligatoire, créneau conservé.
- `photosAEnvoyer` : vrai uniquement lorsque le client annonce un envoi ultérieur, zéro pièce jointe.
- `codeImport` : chaîne originale intacte, pour la compatibilité future avec l'import historique `LIMPID1`.

`planifierSansEcriture` reçoit une liste de références+empreintes **déjà lues ailleurs** et établit un plan avec les statuts `PROPOSER_INSERTION_SUR_COPIE`, `EXISTANT_IDENTIQUE`, `DOUBLON_LOT` et `CONFLIT_QUARANTAINE`. Son résultat **n'inclut pas les données personnelles, ni `codeImport`**. Ce module n'appelle jamais Google Drive, le CRM ni le Worker et ne peut pas acquitter une demande.

### Séquence d'acceptation avant tout raccordement
1. Identifier le vrai projet Apps Script exécuté pour le CRM en exploitation et vérifier le tableur auquel il est lié. Documenter les fonctions d'import existantes, les verrous, l'organisation `CRM_State`, les migrations et les notifications.
2. Établir un **mapping validé avec le vrai code**, sans écriture directement dans `CRM_State`, `Prospects` ou `Devis_CRM`.
3. Préparer une copie de qualification distincte des données client et tester `LIMPID1` pour devis B2B, ménage, vitres, général et rappels ; comparer les empreintes et les références avant toute insertion.
4. Définir l'acquittement seulement **après preuve de persistance CRM**, et un suivi des échecs / reprises / doublons.
5. Tester des notifications distinctes pour `type=rappel` et `type=devis`, avec contrôle des dates et des délais, sans transmettre de données à un tiers non approuvé.
6. Ne déployer vers `limpid-site` qu'après une autorisation séparée, un mécanisme de retour arrière et la suppression contrôlée de l'ancien circuit Web3Forms.

## Limites
Le code est **un contrat simulé et non un connecteur opérationnel**. Le tableur de production n'a pas été modifié. Aucun envoi ou acquittement n'a été effectué. La reconnaissance du tableur central n'est pas une certification du projet Apps Script.

**Statut : NO-GO production.**

## Projet Apps Script vu dans l'interface (captures du propriétaire, 08/11/2026)

Les captures du projet **« LIMPID - CRM V6 »** montrent une arborescence Apps Script native. Parmi les modules visibles :
- `Code.gs`, `Devis.html`, `Index.html`, `appsscript.json` ;
- `Limpid_V571_Synchronisation.gs`, `Limpid_V592_IntegrationCRM.gs` ;
- `Limpid_V6712_RegistreDevis.gs`, `Limpid_V672_Dispatch.gs`, `Limpid_V670_Calendrier.gs` ;
- autres modules de configuration, d'analyse économique et de suivi de terrain.

Cette observation confirme l'existence d'un projet Apps Script **côté utilisateur**. Elle ne certifie ni l'ID du projet, ni son déploiement actif, ni son rattachement exact au tableur central V6, ni les fonctions internes (les captures n'affichent pas leur code). Il faudra consulter sur une copie, en lecture seule, les fonctions d'import `LIMPID1` de `Devis.html`, `Code.gs`, `Limpid_V592_IntegrationCRM.gs` et le registre des devis, sans modifier la version de production.

Les fichiers de la branche `limpid-preprod` restent des **adaptateurs candidats**, pas des modules à installer dans Apps Script sans revue.

## Vérification du code historique conservé (08/11/2026)

Archive privée inspectée : `LIMPID_CRM_V6716_CODES_COMPLETS_RECETTE.zip` (CRM **V6.7.16**, état plus ancien que le CRM V6.7.18 actuel, dont le code exécuté n'est **pas** certifié).

Le fichier `Devis.html`, lignes 3607–3610, contient la fonction `demandesDe(d)`. Elle ne retient que les éléments `d.demandes` dont `x.saisie.type` est défini. Pour un dossier de devis V2, le récepteur V0.2 précédent vérifiait seulement `offre` et aurait donc pu enregistrer une demande **impossible à importer dans le calculateur**. Cette faille de contrat a été corrigée **dans le prototype GitHub uniquement** : obligation de `saisie.type` compatible avec les offres réelles (`regulier→menage`, `grand→grand`, `bureaux→bureaux`, `vitres→vitres`, `textile→textile`).

Autres constats du CRM V6.7.16 :
- `importerDemande()`, lignes 3612–3629 : décode `LIMPID1`, conserve une trace dans `limpid_demandes_importees`, clôture l'état courant du devis, puis distingue rappel et devis. Le simple registre historique **signale** les doublons ; il ne prouve pas qu'un devis est définitivement enregistré.
- `chargerServeur()`, lignes 3636–3653 : ancien contrat `GET /api/demandes?jours=60` et réponse `{demandes:[...]}`, distinct du prototype V0.2 `GET /admin/outbox` et `{enveloppes:[...]}`.
- `importerServeur()`, lignes 3654–3659 : l'ancien écran appelle ensuite `PATCH ?ref=...` sans attendre de preuve de persistance du devis, ce qui **risquerait un acquittement prématuré**. **Ne jamais relier tel quel ce chemin au nouvel outbox.**
- `afficherRappelImporte()`, lignes 3666–3675 : traite le rappel avec téléphone/créneau sans créer de prix.
- `chargerPrestationImportee()`, lignes 3709–3725 : prend les prestations successives et rappelle les photos à transmettre hors formulaire.
- Les fonctions de vitrages convertissent les faces physiques (Velux = deux faces) et refusent les calculs ambigus ; elles doivent rester inchangées.

### Règle d'intégration

Dans le futur connecteur, **import en mémoire/affichage ne vaut jamais persistance**. Une ACK ne devra être possible qu'après écriture CRM (sur copie d'abord), relecture indépendante de la référence et de l'empreinte, contrôle d'absence de collision, puis journal d'audit. L'UI ancienne n'est pas une API de synchronisation transactionnelle. Aucune modification du vrai Apps Script ne doit être engagée tant que son code V6.7.18 n'est pas lu.
  
## Garde anti-acquittement prématuré — simulation de COPIE seulement

`.github/crm-contract/ack-safety.mjs` est une **fonction pure sans API réseau ni écriture**. Elle ne propose un futur corps `{ref,sha256}` qu'avec deux preuves **fictives concordantes** : journal d'écriture en COPIE puis relecture de la même ligne et du même SHA-256. Même dans ce cas, son résultat garde systématiquement `autorisationEnvoi:false` et `acquittementReel:false`.

Le connecteur CRM réel n'étant pas identifié, ce contrôle ne saurait prouver la persistance dans le CRM V6.7.18 actif. Les tests vérifient surtout l'échec fermé : absence de relecture, référence ou empreinte contradictoire, dossier seulement affiché, écriture non confirmée, mauvais environnement, ou mauvais identifiant de ligne. **Aucune ACK réelle possible depuis ce module.**
