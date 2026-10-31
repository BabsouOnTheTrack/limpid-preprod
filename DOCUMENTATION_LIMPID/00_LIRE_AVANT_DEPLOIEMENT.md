# LIMPID V6.5.9 — Aides visuelles dans les configurateurs du site

## État
**Version de recette à vérifier avant mise en production.** Basée uniquement sur `limpid-site-main.zip` fourni par le fondateur (snapshot du 30 octobre 2026). Aucun déploiement n'a été effectué.

## Modifications exactes
Le projet d'origine compte 4 pages de formulaire ; elles ont été modifiées seulement par l'ajout des références suivantes :

- Avant `</head>` : `<link rel="stylesheet" href="/assets/aide-visuelle.css">`
- Avant `</body>` : `<script defer src="/assets/aide-visuelle.js"></script>`

Pages :
- `configurer-devis-menage/index.html`
- `configurer-devis-vitres/index.html`
- `configurer-devis-locaux-professionnels/index.html`
- `devis/index.html`

Fichiers nouveaux :
- `assets/aide-visuelle.css` : styles adaptatifs.
- `assets/aide-visuelle.js` : insertion contextuelle et fenêtre illustrée, sans modification des saisies.
- `assets/guides/*.webp` : 44 images de catégories et 5 planches complètes pour le réemploi ultérieur (environ 1 Mo au total).
- `assets/guides/guides-manifest.json` : inventaire des illustrations.

## Fonctionnement
- Les étapes du devis vitres affichent les exemples adaptés aux fenêtres, baies, petits Velux accessibles, vérandas et faces intérieur/extérieur.
- Les étapes ménage montrent des visuels du logement, des pièces, de la surface, du rythme, des particularités et des prestations supplémentaires.
- Les étapes locaux professionnels montrent la surface, les zones, sanitaires, salle de pause, accès, etc.
- Le formulaire général `/devis/` montre des repères pour **ménage courant, grand ménage, vitres, bureaux et textiles**, avec choix du groupe dans le guide en cas de prestations multiples.
- Chaque aide inclut de petites images accessibles sur place et un bouton « Voir le guide complet ». Ce bouton ouvre une fenêtre modale et n'efface pas la saisie du client.
- La fenêtre est fermable par la croix, la touche Échap et un clic sur le fond.

## Sécurité et limites fonctionnelles
1. **Aucun changement** dans `assets/configurateur.json`, le moteur JavaScript de chiffrage des pages, le code d'import `LIMPID1`, les conditions tarifaires, les destinataires et les événements de conversion.
2. **Pas de modification des unités :** le configurateur vitres spécialisé compte les ouvertures ; le configurateur ménage et le formulaire général peuvent encore utiliser des `faces vitrées`. Les aides l'indiquent expressément. Une conversion unique des unités reste un chantier séparé, à valider avec le moteur CRM.
3. **Petits Velux :** seule la possibilité d'un nettoyage intégral depuis l'intérieur en sécurité est décrite. Les grands Velux et accès complexes ne sont pas promis.
4. **Vérandas :** l'illustration aide à repérer la structure ; **toiture exclue**, parois vitrées uniquement, surface au sol selon le formulaire.
5. **Grand ménage :** surfaces accessibles, sans intérieur de placards/réfrigérateurs ni travaux lourds.
6. **Textiles :** photos et matériaux délicats peuvent nécessiter une vérification préalable.
7. Les illustrations sont pédagogiques et n'engagent pas automatiquement la prestation ; le devis validé reste déterminant.
8. Les tests navigateur ont été réalisés sur un **environnement isolé reproduisant les conteneurs de parcours**. La navigation sur le site complet a été empêchée par la politique réseau de l'environnement de test ; valider le site complet en recette avant publication.

## Installation recommandée
1. Faire une sauvegarde du déploiement actuel.
2. Décompresser le **pack complet de recette**, qui contient `index.html` à la racine comme sur un hébergement statique. Ou utiliser le **pack différentiel** et ne remplacer que les 4 fichiers HTML listés, puis ajouter les nouveaux éléments de `assets/`.
3. Tester chaque configurateur sur mobile et ordinateur ; parcourir au moins une fois chaque écran, cliquer sur « Voir le guide complet » puis fermer et continuer.
4. Faire un test de demande **avec marqueur TEST** selon le mode test déjà prévu, vérifier les quantités, prix estimés, e-mails et le code LIMPID1 côté CRM sans déclencher de vrai lead commercial.
5. Comparer les performances et le responsive ; vérifier qu'aucune image ne revient en erreur 404.
6. **Publier seulement après validation des tests de recette.** Aucun actif en ligne n'a été modifié ici.

## Retour arrière
Remettre les quatre fichiers HTML de l'archive d'origine. Les fichiers `assets/aide-visuelle.*` et `assets/guides` ne seront alors plus chargés et pourront être supprimés si souhaité. Aucun changement de données à annuler.
