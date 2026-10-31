# Tests — LIMPID V6.5.9

## Tests exécutés
- Contrôle JS : `node --check assets/aide-visuelle.js` : **OK**.
- Contrôle différentiel par rapport au ZIP source : les seuls fichiers originaux modifiés sont **quatre `index.html`** ; chacun contient uniquement un import CSS et un import JS. Tous les autres fichiers d'origine sont identiques octet par octet, notamment `assets/configurateur.json` : **OK**.
- Nombre de visuels optimisés : **44 vignettes WebP et 5 planches WebP**, ~1,0 Mo : **OK**.
- Simulation DOM Chromium des écrans dynamiques (vrais titres d'étapes et conteneurs `pc-corps` et `f-description`) : **15 étapes** sur 3 configurateurs : **OK**.
- Changement d'étape, remplacement du DOM et réinsertion d'une aide unique : **OK**.
- Ouverture du guide modal, changement de prestation, fermeture : **OK**.
- Formulaire général avec deux prestations et changement de groupe sans toucher au champ de saisie : **OK**.
- Mobile 390px : insertion et absence de débordement horizontal dans la fixture : **OK**.

## Non vérifié ici
- Test navigateur du site **complet** : accès `localhost` et `file://` bloqué par politique réseau d'exécution. Seuls des tests de composants DOM réels mais isolés ont pu être menés.
- Envoi complet d'un code LIMPID1 réel vers le CRM : **non réalisé** (moteur inchangé, à recetter sur le site).
- Temps de chargement réels, analytics et déploiement Netlify/production : **non réalisés**.

## Tests utilisateur recommandés
1. `configurer-devis-vitres/` : étapes fenêtres, baies, petit Velux, véranda et côtés.
2. `configurer-devis-menage/` : surface et pièces, option vitres et véranda, vérifier le libellé `faces`.
3. `configurer-devis-locaux-professionnels/` : surfaces, prestations, contraintes.
4. `devis/` : sélectionner séparément grand ménage, textiles, vitres, bureaux puis sélectionner deux prestations simultanément.
5. Mobile et desktop : ouvrir/fermer le guide, continuer et revenir en arrière ; vérifier la persistance du brouillon.
6. Mode TEST du site : créer une demande complète, comparer les champs du code LIMPID1 avant/après sur le même scénario.
