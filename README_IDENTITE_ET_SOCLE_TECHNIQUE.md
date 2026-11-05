# LIMPID EXPERIENCE V1.1 — identité d'origine & technique préservée

## Statut
Prototype haute fidélité NON DÉPLOYÉ. Ne pas le mettre en production sans recette intégrale.

## Identité Limpid (inchangée)
- **Logo original** : `assets/logo-limpid.webp`, byte pour byte identique à l'archive utilisateur.
- Palette officielle : bleu `#1A56DB`, bleu nuit `#0B2545`, cyan `#4CC9F0`, fond glacé `#EEF6FB`.
- Typographies d'origine : **Nunito** et **Public Sans**.
- Les effets premium et les animations portent sur l'expérience, pas sur l'identité de marque.

## Périmètre des changements
- `index.html` : page d'accueil du prototype V1, avec logo d'origine et direction artistique cohérente.
- `experience/experience.css` : harmonisation couleurs et typographie + adaptation du logo sur ordinateur/mobile.
- **`experience/experience.js` inchangé** : aucune modification du moteur de navigation ni des interactions V1.
- Les autres pages et fichiers source fournis restent inchangés, y compris les configurateurs.
- La page d'accueil originale reste disponible sous `index-original.html`.

## Règle de non-régression des configurateurs
Sont conservés byte pour byte par rapport à `limpid-site.zip` :
- `configurer-devis-menage/` ; `configurer-devis-vitres/` ; `configurer-devis-locaux-professionnels/` ; `devis/` ;
- les fichiers `assets/*.js`, `assets/*.json`, les aides visuelles, les autres pages, les formulaires, contenus et redirections.

Cela **prouve la conservation du code fourni**, mais ne constitue pas un test des intégrations externes en production.

L'assistant du prototype est une porte d'entrée distincte : il oriente vers les configurateurs **tels quels**, ne recalcule aucun tarif, et ne transmet aucune donnée. Il ne remplace ni l'import LIMPID1, ni les règles économiques ou les intégrations métier.

## Avant toute mise en production
1. Site de préproduction et comparatif exhaustif avec l'archive originale.
2. Test réel de chaque configurateur (validation, sauvegarde, retour, import, envoi et éventuels webhooks).
3. SEO, consentement, mesure conversions, sécurité, redirections et accessibilité.
4. Validation du rendu sur mobiles réels et différentes tailles d'écran.
5. Déploiement avec sauvegarde et option de retour arrière.

## Demo autonome
Le fichier `LIMPID_EXPERIENCE_V11_DEMO_AUTONOME.html` permet de découvrir la nouvelle page d'accueil, mais les liens vers les configurateurs mènent au site actuellement en ligne et non à des formulaires embarqués dans la démo.
