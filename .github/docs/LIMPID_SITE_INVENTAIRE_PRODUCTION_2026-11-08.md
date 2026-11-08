# LIMPID — INVENTAIRE DU SITE PUBLIC `limpid-site`

**Constat effectué le 08/11/2026 en lecture seule.** Fondé sur 4 captures d'écran Cloudflare fournies par le propriétaire et sur une consultation indépendante de GitHub. L'inventaire est **partiel** : aucun accès d'administration Cloudflare direct ni export binaire de la version active n'a été effectué.

## Identité de l'infrastructure publique
| Élément | Constat vérifié |
|---|---|
| Worker public de production | `limpid-site` |
| Domaine personnalisé | `https://limpid-nettoyage.fr` ; Cloudflare « Custom Domains and Routes » : production |
| Worker.dev public | `https://limpid-site.cabochondreams.workers.dev`, activé |
| URL Preview Worker.dev | `*-limpid-site.cabochondreams.workers.dev`, activée |
| Déploiement actif affiché | identifiant de version **abrégé** `aba7a3ae` ; ligne « Add files via upload » ; indiqué « 7 days ago » sur capture |
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

## Point de restauration de la source Git
- Dépôt : [`limpid-site`](https://github.com/BabsouOnTheTrack/limpid-site)
- `main` observé au commit **`e8b8f513a37753a371da022d781b44f06d97bec9`**, message `Add files via upload`, horodaté **2026-11-01 09:00:10 UTC**.
- Git tree racine : **`60078a6173a547e2dc48c819d60ff0f03e93f3f7`**.
- Arbre complet non tronqué : **142 entrées**, dont **33 fichiers HTML** ; répertoires des 4 configurateurs historiques `devis/`, `configurer-devis-menage/`, `configurer-devis-vitres/`, `configurer-devis-locaux-professionnels/`.
- `_redirects` présent, 26 règles anciennes à code `301`.
- `assets/mesure.js` et `assets/campagne.js` présents. Aucun bridge V1.26 STAGING dans le dépôt principal.
- Aucun `wrangler.jsonc` / `wrangler.toml` ni `.assetsignore` repéré dans l'arbre de ce commit.

**Nuance essentielle :** le commit `main` constitue un point de retour arrière **de la source Git**, et la capture donne un identifiant abrégé du déploiement Cloudflare. Ils paraissent cohérents (libellé, période), mais **aucun hash des fichiers réellement servis par la version active n'a été comparé** ; l'identité exacte source Git ↔ version déployée n'est pas certifiée. Une sauvegarde de code GitHub ne suffit pas à restaurer à elle seule tous les paramètres de domaine, DNS ou données de services.

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

## Séquence de sauvegarde obligatoire avant tout changement
1. Dans Cloudflare **Deployments**, ouvrir le déploiement actif et relever **ID complet de version**, date UTC, configuration Git associée, et les choix de rollback disponibles. Ne pas cliquer sur « rollback ».
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
