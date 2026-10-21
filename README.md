# Site Limpid

## À faire à chaque mise en ligne

1. **Remplacer l'intégralité** du contenu du site par celui de cette archive, et non ajouter par-dessus. Un ajout partiel a déjà laissé une mauvaise page à la racine.
2. **Vider le cache Cloudflare** : Caching → Configuration → Purge Everything. Sans cela, les fichiers de `assets/` continuent d'être servis depuis l'ancienne version. C'est ce qui s'est produit le 4 octobre avec `assets/mesure.js`.
3. **Contrôler en dix secondes** :
   - la page d'accueil affiche « Des locaux impeccables, sans y penser. » ;
   - sur n'importe quelle page, ajouter `?limpid-debug=1` à l'adresse fait apparaître un panneau annonçant **version 2026-10-04**. S'il annonce autre chose ou ne s'affiche pas, le cache n'a pas été purgé.

## Où en est le projet Google Ads

Trois tunnels publicitaires indépendants, tous en `noindex`, hors sitemap et sans lien entrant :

| Campagne | Landing | Page de remerciement | Conversion GA4 |
|---|---|---|---|
| B2B locaux professionnels | `/nettoyage-locaux-professionnels-epinal/` | `/merci-demande-b2b/` | `b2b_lead` |
| Lavage de vitres (particuliers) | `/nettoyage-vitres-domicile-epinal/` | `/merci-devis-vitres/` | `vitres_lead` |
| Ménage à domicile régulier | `/menage-domicile-epinal/` | `/merci-demande-menage/` | `menage_lead` |

Deux fichiers partagés portent toute la mécanique, et aucun autre : `assets/mesure.js` pour le consentement et le chargement de GA4, `assets/campagne.js` pour l'attribution et les événements.

Restant à faire dans vos comptes Google : marquer les trois événements `_lead` comme conversions dans GA4, puis les importer dans Google Ads en créant une action de conversion distincte par campagne.

---

Contenu du dossier : le site complet, prêt pour Cloudflare Pages.
- Pages HTML dans leurs dossiers (URL propres), styles.css, assets/ (images WebP + favicon)
- sitemap.xml et robots.txt à la racine
- _redirects : table des redirections 301 depuis les anciennes URLs WordPress (format Cloudflare Pages, appliquée automatiquement)
Déploiement : déposer l'intégralité de ce dossier dans un dépôt GitHub, puis connecter Cloudflare Pages (voir guide étape 4).

## Mise à jour du 21 septembre 2026
- Nouvelle page : /grand-menage-fin-de-bail-epinal/ (grand ménage, nettoyage de fin de bail, état des lieux de sortie)
- Menu : l'entrée « Particuliers » devient un sous-menu à deux liens, sur les 14 pages
- Pied de page, page d'accueil et page crédit d'impôt : lien vers la nouvelle page
- sitemap.xml : nouvelle URL ajoutée, à renvoyer dans la Search Console après mise en ligne
- Photos avant/après de la nouvelle page : à remplacer par un chantier de fin de bail dès que possible (repère laissé en commentaire dans le fichier)
- Adresse de contact : devis@limpid-nettoyage.fr remplacée par bonjour@limpid-nettoyage.fr sur les 14 pages (pied de page, page devis, mentions légales, confidentialité, données structurées)

## Mise à jour du 26 septembre 2026
### Mesure d'audience Google Analytics 4
- Identifiant : G-SQSB6Y6THZ
- Le code n'est pas collé page par page : tout est dans `assets/mesure.js`, appelé depuis le `<head>` des 14 pages. Pour changer d'identifiant ou retirer la mesure, un seul fichier à toucher.
- Le script gtag n'est chargé qu'après un « Accepter » explicite dans le bandeau. Tant que le visiteur n'a rien choisi, ou s'il refuse, aucun cookie de mesure n'est déposé et aucune requête n'est envoyée à Google. C'est ce que la CNIL attend pour Analytics.
- Le choix est conservé six mois dans le navigateur, puis la question est reposée. Le visiteur peut revenir sur sa décision depuis la page Politique de confidentialité.
- Politique de confidentialité réécrite en conséquence : l'ancienne affirmait qu'aucun traceur n'était déposé, ce qui serait devenu faux.
- À faire dans l'interface Google Analytics après mise en ligne : vérifier la réception des premiers événements, et lier la propriété à la Search Console.

### Nouvelles photos
- `vitrine-pizza-y-olo-uxegney.webp` : Pizza 'Y' Olo, Uxegney. Page Références.
- `baies-vitrees-restaurant-calmosiens-darnieulles.webp` et `enseigne-restaurant-calmosiens-darnieulles.webp` : restaurant Les Calmosiens, Darnieulles. Page Références.
- `vitrine-limpid-darnieulles.webp` : la vitrine de Limpid au 5 rue des Sapins. Page d'accueil (bloc « Notre adresse ») et page Références.
- Toutes recadrées et compressées en WebP entre 85 et 170 Ko, avec attributs width/height pour éviter les sauts de mise en page.
- Page Références : titre et description mis à jour pour couvrir Uxegney et les restaurants.

### Réparation de la racine du site (26 septembre 2026)
Le fichier `index.html` déployé à la racine servait le contenu de la page crédit d'impôt : la page d'accueil était donc inaccessible, et sa balise canonique annonçait à Google `/credit-impot-menage-vosges/`. Toutes les autres pages étaient intactes.

Le `index.html` de cette archive est la vraie page d'accueil. Repères pour vérifier après mise en ligne, sur `https://limpid-nettoyage.fr/` :
- titre de l'onglet : « Entreprise de nettoyage à Épinal et dans les Vosges | Limpid »
- premier titre de la page : « Des locaux impeccables, sans y penser. »
- balise canonique : `https://limpid-nettoyage.fr/`

Si l'un des trois ne correspond pas, la racine n'a pas été remplacée.

Après correction, demander une réindexation de `https://limpid-nettoyage.fr/` dans la Search Console (Inspection de l'URL, puis « Demander une indexation »). Sans cela, Google peut mettre plusieurs semaines à revenir sur sa conclusion que la page d'accueil était un doublon.

## Tunnels Google Ads (27 septembre 2026)

### Ce qui a été créé
| Rôle | URL |
|---|---|
| Landing page Ads B2B | `/nettoyage-locaux-professionnels-epinal/` |
| Remerciement B2B | `/merci-demande-b2b/` |
| Landing page Ads Vitres | `/nettoyage-vitres-domicile-epinal/` |
| Remerciement Vitres | `/merci-devis-vitres/` |
| Capture des paramètres et événements | `assets/campagne.js` |

Les pages existantes n'ont pas été touchées, à l'exception de la politique de confidentialité, que l'activation de la publicité rendait inexacte.

### Choix structurants
- **Les quatre pages sont en `noindex`**, absentes du sitemap et sans aucun lien entrant depuis le site. Sans cela, `/nettoyage-locaux-professionnels-epinal/` entrerait en concurrence avec `/nettoyage-bureaux-epinal/` et `/nettoyage-vitres-domicile-epinal/` avec `/credit-impot-menage-vosges/` : Google aurait choisi lui-même laquelle afficher, et probablement pas la bonne. `noindex` n'empêche pas Google Ads de diffuser ; un blocage dans `robots.txt`, lui, l'empêcherait, donc `robots.txt` reste inchangé.
- **Aucune navigation sur les landing pages.** Logo, numéro de téléphone, contenu, formulaire. Les seuls liens sortants sont les mentions légales et la politique de confidentialité, obligatoires.
- **Formulaires distincts** du formulaire général, avec des objets d'email préfixés `[ADS B2B]` et `[ADS VITRES]` pour être triés d'un coup d'œil dans la boîte de réception.
- **Envoi de photos par WhatsApp** plutôt que pièce jointe : l'envoi de fichiers n'est pas disponible sur la formule Web3Forms utilisée, et sur mobile le partage WhatsApp est de toute façon plus rapide que la sélection de fichiers.

### Événements envoyés
`b2b_form_submit`, `b2b_phone_click`, `vitres_form_submit`, `vitres_whatsapp_click`, `vitres_phone_click`, puis `b2b_lead` et `vitres_lead` sur les pages de remerciement.

Ils partent à la fois dans `dataLayer` (utilisable tel quel si Google Tag Manager est installé plus tard) et dans GA4 via gtag.

Les deux `_lead` ne se déclenchent que si un marqueur a été posé à l'envoi du formulaire, marqueur consommé à la lecture. Conséquence : un rechargement de la page de remerciement, un partage du lien ou une visite directe ne créent pas de fausse conversion. Ce sont ces deux événements qu'il faut importer comme conversions dans Google Ads, pas les `form_submit`.

### À faire dans les comptes Google avant de lancer
1. **GA4** : Administration → Événements, marquer `b2b_lead` et `vitres_lead` comme conversions. Attendre de les voir remonter en temps réel avant d'aller plus loin.
2. **Google Ads** : Objectifs → Conversions → Importer → Google Analytics 4, puis importer ces deux événements. Créer une action de conversion distincte par campagne pour que les enchères s'optimisent séparément.
3. **Lier GA4 et Google Ads** dans les deux sens, sinon l'import n'apparaît pas.
4. **Vérifier que WhatsApp est actif** sur le 06 26 55 65 69 : le bouton pointe vers `wa.me/33626556569`. Si la ligne n'a pas WhatsApp, le visiteur tombe sur une page d'erreur Google, ce qui est pire que pas de bouton du tout.
5. **Tester le parcours complet en conditions réelles** une fois en ligne : arriver sur la landing page avec `?gclid=TEST`, accepter le bandeau, envoyer le formulaire, vérifier l'email reçu (il contient une ligne « origine_campagne ») et la conversion dans GA4 en temps réel.

### Le point sur le consentement
Le suivi reste en « basic consent mode » : rien ne part tant que le visiteur n'a pas accepté. C'est la lecture la plus stricte des règles CNIL, celle qui se défend sans discussion, mais elle a un coût : les visiteurs qui refusent ne sont jamais comptés, et le taux de conversion mesuré dans Google Ads sera inférieur au réel.

Pour limiter la perte, un visiteur qui envoie le formulaire avant d'avoir répondu au bandeau voit son événement mis en attente ; il part si la mesure est acceptée ensuite dans la même session.

### Ce qui reste à décider
La page `/devis/` continue de servir le trafic naturel, comme demandé. Si les campagnes tournent, il faudra à terme vérifier qu'elle ne capte pas une partie du trafic publicitaire par les liens de site Google Ads : ne renseigner que les URLs des landing pages dans les extensions.

## Page de contenu : nettoyer un canapé à domicile (27 septembre 2026)

**URL :** `/nettoyer-un-canape-a-domicile-epinal/` — indexable, dans le sitemap, reliée au reste du site.

### Pourquoi cette URL et pas une autre
La page de service `/nettoyage-canapes-tapis-textiles-vosges/` vise la requête transactionnelle. Ce guide vise l'intention informationnelle (« comment nettoyer un canapé », « vapeur ou injection-extraction », « prix nettoyage canapé »). Deux URLs, deux intentions, aucune concurrence entre elles. Un lien contextuel a été ajouté depuis la page de service vers le guide : sans lui, la page serait orpheline et mettrait des mois à se positionner.

### Ce qui a été fait pour ne dégrader aucun indicateur
- La page est construite sur le **socle exact** d'une page existante : même CSS, même en-tête, même pied de page, même mode de chargement des polices. Aucune bibliothèque, aucun script, aucune police supplémentaires.
- **Aucune image** en dehors du logo déjà chargé partout. Le poids réseau ajouté est donc nul.
- Les tableaux comparatifs défilent horizontalement sur mobile dans un conteneur dédié, avec des ombres de défilement en CSS pur : pas une ligne de JavaScript.
- Mesuré au navigateur, en 390 px et en 1280 px : **CLS à 0**, aucun débordement latéral, aucune erreur console. Les 18 pages du site repassent au vert après l'ajout.

### Données structurées
Quatre blocs : `LocalBusiness` (identique aux autres pages), `Article`, `FAQPage` (6 questions) et `BreadcrumbList` à trois niveaux. Tous validés au parsing JSON.

### Un écart volontaire avec le document source
Le PDF fourni écrit « agréé services à la personne ». La page dit **« déclarée »**. L'agrément et la déclaration sont deux statuts distincts : la déclaration suffit pour ouvrir droit au crédit d'impôt, l'agrément n'est exigé que pour les publics fragiles. Annoncer un agrément que l'entreprise n'a pas serait une déclaration inexacte. À corriger si Limpid détient bien un agrément.

### Après mise en ligne
Soumettre `/nettoyer-un-canape-a-domicile-epinal/` à l'indexation dans la Search Console, et renvoyer le sitemap.

## Tunnel Google Ads « Ménage à domicile régulier » (4 octobre 2026)

| Rôle | URL |
|---|---|
| Landing Ads | `/menage-domicile-epinal/` |
| Remerciement | `/merci-demande-menage/` |

Troisième tunnel, construit sur l'architecture déjà validée. Aucun nouveau tag, aucune duplication GA4 : `assets/mesure.js` et `assets/campagne.js` sont réutilisés tels quels.

### Une seule modification de l'existant
`assets/campagne.js` construisait les noms d'événements en dur (`t === "b2b" ? "b2b_form_submit" : "vitres_form_submit"`). Il les déduit désormais de l'attribut `data-tunnel`. Les noms produits pour B2B et Vitres sont strictement identiques à avant, et un quatrième tunnel n'exigera plus de toucher à ce fichier.

Les boutons du bandeau de consentement passent de 36 à 44 px de haut, seuil recommandé pour une cible tactile. Bénéficie aux trois tunnels.

### Événements
`menage_form_submit`, `menage_lead`, `menage_phone_click`. Le `_lead` reste conditionné à un envoi réel et consommé à la lecture : un rechargement de la page merci ne le recompte pas.

### GATE B — résultats des tests réels

**Technique.** `noindex` sur les deux pages, absentes du sitemap, aucun lien entrant depuis le site, aucun lien sortant hors mentions légales et confidentialité. `robots.txt` inchangé, donc les robots Google Ads passent.

**Consentement.** Zéro requête vers Google avant acceptation. Après acceptation : `gtag/js?id=G-SQSB6Y6THZ`, l'identifiant existant. Le lien « Cookies » du pied de page rouvre le choix.

**Formulaire.** Objet `[ADS MENAGE]` confirmé dans le POST. Les douze champs de campagne demandés sont transmis individuellement : `gclid`, `gbraid`, `wbraid`, les cinq UTM, `page_arrivee`, `premiere_visite`, `referent`, `origine_campagne`.

**GA4.** `menage_form_submit` = 1, `menage_lead` = 1, puis `menage_lead` = 1 après rechargement de la page merci. Les trois tunnels repassent au vert sans régression.

**Mobile 390 px.** H1, bloc fiscal et CTA visibles sans défilement, le bandeau cookies ne recouvre pas le CTA, aucune cible tactile sous 44 px, pas de débordement latéral, CLS à 0.

**Commercial.** Les quatorze points de la section 12 du brief sont vérifiés automatiquement : tarif, hebdomadaire prioritaire, quinzaine, 2 h minimum, absence de mensuel vendu, sans engagement, rappel 48 h, zone, nuance d'éligibilité, exclusion des vitres et du grand ménage, absence de toute mention B2B.

### Ce qui reste à faire côté comptes Google
GA4 : marquer `menage_lead` comme conversion. Google Ads : l'importer et lui créer une action de conversion distincte, pour que les trois campagnes s'optimisent séparément.
