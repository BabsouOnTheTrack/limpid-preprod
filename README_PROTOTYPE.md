# LIMPID EXPERIENCE — prototype V1 (5 novembre 2026)

## Statut
Prototype haute fidélité de la nouvelle page d'accueil, pour démonstration et validation graphique uniquement.
**NE PAS METTRE EN PRODUCTION TEL QUEL.** Le site actuel et les demandes restent inchangés.

## Ce qui est prêt
- Nouvelle page d'accueil responsive avec design « transparence en mouvement ».
- Rubriques et carte des prestations adaptatives Professionnel / Particulier.
- Comparaison avant/après interactive sur de vraies photos présentes dans le site source.
- Galerie de réalisations et présentation des engagements et de l'entreprise.
- Assistant d'orientation à 3 étapes (univers, besoin, commune) qui conduit vers le **configurateur existant** adapté.
- Navigation mobile en panneau, FAQ, boutons de contact et liens vers les pages existantes.
- Animations discrètes, prise en charge de prefers-reduced-motion et visibilité de la navigation au clavier.

## Important : ce qui n'est pas encore connecté
- L'assistant de l'accueil n'envoie **aucun formulaire** et ne transmet pas ses choix aux configurateurs. Les formulaires originaux restent sur leurs pages d'origine.
- Aucun suivi d'une demande, état CRM, agenda, prix dynamique, authentification ou notification n'a été connecté.
- L'accueil de démonstration n'embarque pas encore le dispositif complet de suivi de conversion, consentement, balisage SEO ou scripts marketing de l'accueil d'origine.
- Les autres pages sont les originaux fournis, non refondus. La cohérence visuelle de tout le site sera l'objet des phases suivantes.
- L'en-tête est volontairement en `noindex,nofollow` pendant l'étape de prototype.
- Les photos proviennent de l'archive source. Pas de photos IA, pas de chiffres inventés.
- La couverture par commune dans l'assistant est indicative à partir des listes du site source ; la faisabilité réelle doit être confirmée.

## Pour explorer
Option A : ouvrir le fichier autonome `LIMPID_EXPERIENCE_V1_DEMO_AUTONOME.html` dans un navigateur.
Option B : décompresser l'archive, puis ouvrir `index.html`. Les pages originales sont incluses dans leurs dossiers pour naviguer dans les configurateurs. Certaines dépendances serveur peuvent exiger un hébergement local.

## Fichiers principaux
- `index.html` : nouvelle page d'accueil
- `experience/experience.css` : styles
- `experience/experience.js` : interactions
- `index-original.html` : page d'accueil du site de départ
- `assets/` : médias originaux

## Validation recommandée avant toute mise en ligne
1. Ajustements visuels sur ordinateur et mobile réels.
2. Tests exhaustifs des parcours devis, import `LIMPID1`, formulaires, réponses et tracking.
3. Consentement des cookies et sécurité des données, SEO et redirections.
4. Audit d'accessibilité, performances (Lighthouse / Core Web Vitals), appareils réels.
5. Vérification des coordonnées, avis, contenus et éventuelles revendications commerciales.
6. Mise en préproduction puis déploiement progressif avec possibilité de retour arrière.

## Tests locaux réalisés
- Rendu Chromium headless desktop 1440 px, tablette 768 px, mobile 390 px.
- Pas de débordement horizontal constaté sur ces trois tailles.
- Sélecteur pro / particulier, cartes associées, étape d'orientation, commune, curseur avant/après et ouverture du menu mobile validés par simulations.
- JS sans erreurs de syntaxe ni erreurs d'exécution observées dans ces scénarios.
- Les intégrations réelles et la performance en production ne sont pas testées.
