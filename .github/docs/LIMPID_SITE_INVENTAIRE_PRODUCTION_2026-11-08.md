# LIMPID — INVENTAIRE DU SITE PUBLIC `limpid-site`

**Constat effectué le 08/11/2026 en lecture seule.** Fondé sur 4 captures d'écran Cloudflare fournies par le propriétaire et sur une consultation indépendante de GitHub. L'inventaire est **partiel** : aucun accès d'administration Cloudflare direct ni export binaire de la version active n'a été effectué.

## Identité de l'infrastructure publique
| Élément | Constat vérifié |
|---|---|
| Worker public de production | `limpid-site` |
| Domaine personnalisé | `https://limpid-nettoyage.fr` ; Cloudflare « Custom Domains and Routes » : production |
| Worker.dev public | `https://limpid-site.cabochondreams.workers.dev`, activé |
| URL Preview Worker.dev | `*-limpid-site.cabochondreams.workers.dev`, activée |
| Déploiement actif affiché | **Version ID complet `aba7a3ae-a271-40a7-b005-b62d215b6fc3`**, copié depuis Cloudflare par le propriétaire le 08/11/2026 ; ligne « Add files via upload » ; indiqué « 7 days ago » sur capture |
| Autres versions | visibles dans l'historique Déploiements, mais **pas sauvegardées** ; anciens ID abrégés `5ec8774e`, `750a9c60`... |
| Type de Worker | Static assets only : aucune variable/secret ni binding ajouté dans cette configuration |
| Dépôt Git lié | `BabsouOnTheTrack/limpid-site` (**privé**) |
| Branche de production Cloudflare | `main` |
| Compilation | commande `None` |
| Déploiement | `npx wrangler deploy` |
| Envoi d'une version | `npx wrangler versions upload` |
| Root directory | `/` |
| Builds non-production | activés pour les branches hors `main` |
| Désactivation des builds | OFF : builds automatiques activés |

**Ne pas interpréter la métrique « Traffic % » d'une capture comme un comptage de visites.** L'âge affiché est relatif à l'heure de la capture, pas une preuve de chronologie exacte.

## Preuve supplémentaire — build Cloudflare actif (captures du 08/11/2026)

- Page de build Cloudflare : **Build #6497772e** (identifiant affiché).
- Référentiel affiché : `BabsouOnTheTrack/limpid-site` ; branche **`main`** ; commit abrégé **`e8b8f51`**, description « Add files via upload ».
- Journal final : `Current Version ID: aba7a3ae-a271-40a7-b005-b62d215b6fc3`, puis `Success! Deploy command completed` et `Success! Build completed`.
- Utilitaire : **Wrangler 4.156.0** ; configuration générée à la compilation (`wrangler.jsonc`), `name: limpid-site`, `compatibility_date: 2026-10-23`, `assets.directory: "."`, observabilité activée dans ce fichier généré.
- La compilation crée aussi `.gitignore` et `.assetsignore` dans son environnement temporaire. Ce n'est **pas** une preuve de commit de ces fichiers dans le dépôt Git.
- Journal assets : **187 fichiers parcourus**, puis **4 nouveaux/modifiés téléversés**, précisément `/configurer-devis-locaux-professionnels/index.html`, `/devis/index.html`, `/configurer-devis-vitres/index.html`, `/configurer-devis-menage/index.html`. Il mentionne également **106 assets déjà présents** sur Cloudflare. Ne pas assimiler ce nombre au total de fichiers Git.
- Durées visibles : opération de déploiement de `limpid-site` terminée avec succès ; ce journal correspond à la version déjà active lors du contrôle, **pas à un déploiement nouveau réalisé pendant cet audit**.
- Les valeurs de secrets, jetons ou API token ne sont **pas** reproduites.

**Règle de sauvegarde :** la correspondance GitHub SHA / build / UUID est désormais documentée. Il manque encore une archive autonome du commit fixé, des empreintes vérifiées des fichiers servis, et une sauvegarde des réglages externes utiles à la restauration.

## Point de restauration de la source Git
- Dépôt : [`limpid-site`](https://github.com/BabsouOnTheTrack/limpid-site)
- `main` observé au commit **`e8b8f513a37753a371da022d781b44f06d97bec9`**, message `Add files via upload`, horodaté **2026-11-01 09:00:10 UTC**.
- Git tree racine : **`60078a6173a547e2dc48c819d60ff0f03e93f3f7`**.
- Arbre complet non tronqué : **142 entrées**, dont **33 fichiers HTML** ; répertoires des 4 configurateurs historiques `devis/`, `configurer-devis-menage/`, `configurer-devis-vitres/`, `configurer-devis-locaux-professionnels/`.
- `_redirects` présent, 26 règles anciennes à code `301`.
- `assets/mesure.js` et `assets/campagne.js` présents. Aucun bridge V1.26 STAGING dans le dépôt principal.
- Aucun `wrangler.jsonc` / `wrangler.toml` ni `.assetsignore` repéré dans l'arbre de ce commit.

**Traçabilité confirmée par le journal Cloudflare :** le build de la version active est lié au commit GitHub `e8b8f51`, qui correspond au début du SHA complet `e8b8f513a37753a371da022d781b44f06d97bec9`. Le build affiche la version Cloudflare complète `aba7a3ae-a271-40a7-b005-b62d215b6fc3`. **La provenance Git du déploiement est établie**, mais l'équivalence binaire entre les sources Git et tous les fichiers effectivement servis n'a pas été vérifiée par des empreintes indépendantes. Une sauvegarde GitHub ne restaure pas automatiquement paramètres de domaine, DNS ou données externes.

**Alerte configuration GitHub :** la branche `main` est reportée comme **non protégée** par l'API de branches GitHub. Vérifier les règles `Rulesets` indépendantes avant d'en déduire le niveau réel de protection. Les builds Cloudflare sont actifs ; éviter toute mutation dans `limpid-site` pendant cette phase.

## Architecture cible — ne modifier aucune production
```text
limpid-nettoyage.fr
    → Worker actuel limpid-site (static assets et SEO)
    → HTTPS (après validation) vers un Worker intake-produit DISTINCT
       → D1 PRODUCTION distincte de staging
       → synchronisation CRM réel (écriture + dédoublonnage)
       → ACK après persistance
       → notification gérant seulement après succès confirmé
```

**Le prototype de réception ne doit PAS être déployé sur `limpid-site`**, même si le schéma LIMPID1 est identique. En effet `limpid-site` est actuellement un Worker statique et ne peut recevoir les bindings D1 et secrets requis sans changement d'architecture.

## Sauvegarde du dépôt de production — confirmation du propriétaire

Le **08/11/2026**, le propriétaire a confirmé : **« SAUVEGARDE OK »**, après les instructions d'archivage ZIP du dépôt `BabsouOnTheTrack/limpid-site` au commit fixé `e8b8f513a37753a371da022d781b44f06d97bec9`.

**Statut : archive source déclarée conservée par le propriétaire.** L'assistant n'a ni reçu ni ouvert cette archive ZIP et **n'a donc pas vérifié** ses empreintes, sa complétude ni le lieu de stockage. Il reste à réaliser un test de réouverture/restauration hors production et à conserver séparément la configuration Cloudflare et les données des services externes. **La sauvegarde du Worker actif et de toute l'infrastructure ne doit pas encore être qualifiée de complète.**

## Séquence de sauvegarde obligatoire avant tout changement
1. Dans Cloudflare **Deployments**, ouvrir le déploiement actif **`aba7a3ae-a271-40a7-b005-b62d215b6fc3`** et relever date UTC, configuration Git associée, fichiers et choix de rollback disponibles. L'ID complet est désormais acquis ; **ne pas cliquer sur « rollback »**.
2. Conserver une archive ZIP autonome de `limpid-site` **au SHA `e8b8f513a37753a371da022d781b44f06d97bec9`**, indépendamment de la branche mutable `main` (GitHub → commit SHA → archive de code). Contrôler le nombre et les hashes des fichiers critiques : `index.html`, quatre configurateurs, `_redirects`, `robots.txt`, `sitemap.xml`, scripts analytics.
3. Vérifier le domaine `limpid-nettoyage.fr`, éventuellement `www`/règles DNS hors de la liste visible, les redirections, SSL/TLS, cache, méthode de connexion GitHub, accès Cloudflare.
4. Sauvegarder explicitement les réglages de formulaires existants, les éventuels services externes et le chemin réel de réception de demandes client, sans exposer de secrets.
5. Préparer un processus de restauration testé **sur environnement de test** et un contrôle de suivi de vrais dossiers reçu pendant la fenêtre de migration.
6. Aucun déploiement tant que la réception réelle et le CRM réel ne sont pas prêts ; obtenir un accord ultérieur explicite portant sur `limpid-site` et le commit cible.

## Séparation garantie
- **`limpid-site`** / dépôt `limpid-site` `main` : production, **aucune modification réalisée** dans cet audit.
- **`limpid-preprod`** / PR #1 : site SIGNATURE isolé, protocoles LAB fictifs et prototypes non déployés sous `.github/`.
- **`limpid-intake-staging`** et D1 du même nom : exclusivement tests fictifs.
- **CRM LAB Google Sheets** : distinct du CRM en production.

**Statut d'autorisation : PREPARATION UNIQUEMENT — NO-GO pour modification, fusion ou déploiement de production.**
