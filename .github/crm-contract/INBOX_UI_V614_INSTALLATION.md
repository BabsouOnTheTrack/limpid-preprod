# LIMPID V6.14 — Panneau « Demandes du site » — INSTALLATION LAB UNIQUEMENT

## État
- Les cinq codes LIMPID1 fictifs ont été importés dans l'onglet LAB `LAB_Inbox_Site_V1_TEST` du Google Sheet `1z8KLlpO1EQ35c6ZBFrtxcYMIO33tXcFEv715lqSmqBQ`.
- Rejeu du 8 novembre 2026, 20h32 Europe/Paris : cinq `EXISTANT_IDENTIQUE`, zéro doublon, ACK false. Vérification indépendante : cinq lignes réelles dans LAB.
- Le module V6.13 est actif **uniquement dans le projet Apps Script de LAB** contrôlé par propriétés ; le CRM réel ne doit jamais être modifié.

## Préparation de l'interface V6.14

Un fichier additionnel `Limpid_V614_INBOX_UI_LAB_FRAGMENT.html` contient **tout** le code de l'interface (CSS et JavaScript). Il ne modifie ni `LIMPID1`, ni les moteurs du devis, ni `CRM_State`, ni `Devis_CRM`.

**Pour l'intégrer à la COPIE UNIQUEMENT**, ouvrir `Index.html` dans le projet LAB Apps Script et coller le fragment **juste avant** sa dernière balise `</body>` (copie intégrale du texte du fragment, sans créer de fichier HtmlService supplémentaire). Enregistrer puis **prévisualiser la Web App du LAB**, pas celle du CRM de production.

Ne JAMAIS remplacer `Index.html` par celui de la sauvegarde historique : risque d'effacer les ajouts présents dans le LAB. Toujours faire une copie de sauvegarde locale de `Index.html` avant insertion et garder l'original dans son état en cas de rollback.

Si le projet LAB ne dispose pas d'un `Index.html` qui affiche `nav.onglets` avec `data-section="devis-int"`, le lanceur se place en bas à droite pour ne pas modifier la navigation ; son comportement peut alors être différent du concept ciblé. S'il n'y a pas de Web App LAB publiée et autorisée, **ne pas créer de déploiement par défaut** ; attendre la validation de l'URL et des droits d'accès.

## Fonctionnalités préparées
- Bouton « Demandes site » inséré après « Devis » dans la barre existante lorsqu'elle est présente ; modal HTML Lab autonome et réversible.
- Lecture via `google.script.run.limpidInboxCopie_listerTEST(50)`, méthode déjà présente et validée, qui renvoie uniquement les informations non personnelles des demandes TEST.
- Total, compte devis/rappels, recherche référence, filtres type/service, actualisation, lien Google Sheet Lab.
- Tous les boutons « Reprendre dans le devis » sont **désactivés** ; aucune écriture ni création de fiche. Aucun acquittement vers Cloudflare.
- Hors Apps Script, aperçu local basé sur **cinq références de démonstration** explicitement identifiées comme démo.

## Vérification pré-installation
- Prototype généré avec `build_preview.py` + tests de navigateur Chromium offline, sans accès Apps Script.
- La validation réelle de l'affichage dans la Web App du projet LAB requiert une installation MANUELLE sur cette COPIE et un nouveau test utilisateur.
- Aucun changement n'a été apporté au projet Apps Script productif par l'assistant.

## Retour arrière
Supprimer uniquement le fragment dont les IDs sont préfixés `limpid-v614-`, sans toucher aux autres scripts. Ou restaurer le fichier `Index.html` sauvegardé dans le LAB.