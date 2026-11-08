# Comment essayer l'Inbox sur une copie SANS risque pour le CRM réel

**Ne pas ouvrir le projet « LIMPID - CRM V6 » de production pour y coller le module.** Il contient des fonctions existantes, dont `Code.js`, avec une référence directe au tableur central. Créer un **projet Apps Script complètement vierge** depuis https://script.google.com/home/projects/create sous le compte Google habituel.

## A — Projet isolé

1. Créer un nouveau projet Apps Script intitulé `LIMPID — LAB Inbox Site V613 TEST ISOLÉ`.
2. Dans le nouvel éditeur, remplacer le `Code.gs` vide par **le seul contenu** de `SOURCE/Limpid_V613_Inbox_Site_COPIE.gs`, ou ajouter ce contenu dans un fichier distinct `.gs` du nouveau projet. Ne pas copier `Code.js`, `Devis.html` ou `Index.html` du CRM réel.
3. Dans *Paramètres du projet*, copier l'**ID du nouveau script**, différent de celui du CRM réellement exploité.
4. Dans **Propriétés de script**, ajouter exactement ces quatre couples :

   - `LIMPID_V613_MODE` = `TEST_ISOLE`
   - `LIMPID_V613_SCRIPT_ID_COPIE` = **identifiant du NOUVEAU script**
   - `LIMPID_V613_TABLEUR_LAB` = `1z8KLlpO1EQ35c6ZBFrtxcYMIO33tXcFEv715lqSmqBQ`
   - `LIMPID_V613_ECRITURE_TEST` = `OUI`

5. Sauvegarder. Ne faire **aucun déploiement web** ; exécuter uniquement les fonctions de test indiquées ci-dessous via le menu déroulant de fonctions Apps Script. Les permissions Google Sheet seront requises pour accéder au tableur LAB.

## B — Test de diagnostic, lecture seule

Sélectionner `limpidInboxCopie_diagnostic` puis **Exécuter**. Le résultat doit indiquer :
`scriptIsProduction:false`, `modeOK:true`, `scriptCopieAutorise:true`, `tableurLabOK:true`, `ecritureTestOK:true`, `aucuneACK:true`.

Tout autre résultat : **ne pas tenter d'import**, revenir aux propriétés et à l'ID du projet de copie. Ne jamais forcer ou supprimer les protections.

## C — Peupler le LAB avec cinq demandes fictives

1. Vérifier dans le tableur LAB que l'onglet `LAB_Inbox_Site_V1_TEST` existe, avec **16 en-têtes et aucune ligne de données**.
2. Exécuter `limpidInboxCopie_importer5ExemplesTEST` dans le **nouveau projet**. Attendu : cinq retours `INSERE_TEST`.
3. Ouvrir [l'Inbox LAB](https://docs.google.com/spreadsheets/d/1z8KLlpO1EQ35c6ZBFrtxcYMIO33tXcFEv715lqSmqBQ/edit#gid=61130022). Vérifier cinq lignes : ménage, vitres, B2B, multi-prestations, rappel ; aucun client réel ; statut `A_QUALIFIER_TEST`.
4. Exécuter une seconde fois `limpidInboxCopie_importer5ExemplesTEST`. Attendu : cinq retours `EXISTANT_IDENTIQUE`, **aucune nouvelle ligne**.
5. Exécuter `limpidInboxCopie_listerTEST` : liste des références et statuts, sans coordonnées ni codes complets.
6. Exécuter `limpidInboxCopie_simulerACK` : retour `ackAutorise:false`. Ce module n'émet jamais d'ACK D1.

**Arrêter si un test ne correspond pas**. Ne pas tenter d'importer de vrais dossiers, même pour « voir si ça marche ».

## D — Détails techniques

- Seule la feuille dédiée du LAB est modifiée par les fonctions d'import. Elles ne créent ni prospect ni devis et ne touchent jamais `CRM_State` / `Devis_CRM`.
- Des lignes de test peuvent rester dans le LAB ; ne pas effacer ou renommer les onglets des essais antérieurs.
- Le hash SHA-256 et la référence rendent les réessais idempotents. Une même référence avec une empreinte différente est renvoyée en `CONFLIT_QUARANTAINE`, **sans écriture**.
- L'absence de succès de relecture génère une erreur et n'autorise aucune ACK ; il peut toutefois rester une ligne physiquement écrite dans le LAB qui devra être réconciliée par relecture au prochain essai.
- La seule preuve de persistance ici concerne **l'Inbox LAB**, pas le CRM partagé de production.

## E — Retour arrière

Ne plus exécuter les fonctions du projet isolé, puis, si souhaité, supprimer **seulement** le nouvel onglet `LAB_Inbox_Site_V1_TEST` et le **nouveau projet Apps Script isolé** après vérification de leur identité. Ne pas toucher au projet original ni à ses onglets.

## Non couvert

Turnstile réel, Worker D1, transport HTTPS automatisé, notifications, affichage dans le CRM V6, migration Web3Forms, rotation des secrets, RGPD et déploiement. Toutes ces étapes restent bloquées jusqu'à validations séparées.