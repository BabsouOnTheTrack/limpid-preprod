# LIMPID Inbox UI V6.14 — 2026-11-08

**Source du résultat :** second journal de l'utilisateur, 20:32 Europe/Paris, cinq `EXISTANT_IDENTIQUE` aux lignes 2–6 avec `ackAutorise:false`. Réinterrogation directe de Google Sheets via le connecteur : l'onglet LAB `LAB_Inbox_Site_V1_TEST` conserve 5 lignes, 5 références différentes et aucun doublon.

Ce commit ajoute UNIQUEMENT sous `.github/` un **fragment HTML/CSS/JS autoportant** destiné à `Index.html` du projet **Apps Script LAB**, plus sa notice et ses tests. Le fragment détecte la navigation CRM existante (`nav.onglets` / `data-section="devis-int"`) et propose une fenêtre « Demandes du site » dans les couleurs historiques Limpid. En Apps Script il appelle seulement `limpidInboxCopie_listerTEST(50)`. Hors Apps Script, il montre 5 **dossiers fictifs** avec un indicateur de démonstration.

La lecture échoue fermée si `ackAutorise!==false` ou si une référence ne contient pas `FICTIF`. Aucune fonction d'écriture, de création de prospect, de reprise dans un devis ou d'acquittement n'est activée. Les boutons métiers restent désactivés.

Tests locaux Chromium (hors Google) : 1280×850 et 390×844, recherche et filtres, 5 cartes, 4 devis / 1 rappel, pas de débordement ni erreur JS, bouton de fermeture/Escape ; simulation du callback Apps Script avec cas incohérents => affichage bloqué. Les tests CI statiques sont ajoutés dans `.github/tests/`.

**Non effectué :** aucune modification de l'`Index.html` du vrai projet Apps Script, aucune édition de Google Sheets par ce fragment, aucun nouveau déploiement Apps Script LAB, aucun changement site public. L'insertion dans le LAB doit être effectuée manuellement par le propriétaire et validée ensuite. NO-GO production.

Archive incrémentale privée : `LIMPID_CRM_INBOX_UI_V614_LAB_CONTINUITE_2026-11-08.zip` (avec preview et captures), distincte du ZIP V6.13 antérieur et du paquet de réhydratation intégral.