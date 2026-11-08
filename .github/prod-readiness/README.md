# LIMPID — Liaison PRODUCTION V0.1 | Prototype non déployé

**Statut : conception en GitHub uniquement — NO-GO production.** Les fichiers de ce dossier sont sous \`.github/prod-readiness/\`, exclus des assets par \`.assetsignore\`. Aucun Wrangler de production, aucun secret et aucune route Cloudflare de production ne sont créés par ces fichiers.

## Pourquoi ce prototype
Les 4 formulaires SIGNATURE fabriquent déjà un dossier \`LIMPID1\` version 2, comprenant \`test:false\` hors laboratoire et \`client.photos:false\`. Le bridge V1.26 actuellement en ligne n'accepte **que les données fictives** et pointe sur \`limpid-intake-staging\` ; il ne doit jamais être utilisé tel quel sur \`limpid-site\`.

## Contrat de réception proposé
1. HTTPS \`POST /api/demandes\` depuis l'origine exacte \`https://limpid-nettoyage.fr\` avec \`Content-Type: application/json\`, \`X-Limpid-Turnstile\` et corps \`{ "ref":"...", "service":"menage|vitres|b2b|general", "code":"LIMPID1...." }\`.
2. Ref unique, \`LIMPID1\` cohérent avec service, dossier réel \`test:false\`, coordonnées de contact valides, **aucune photo en ligne pour cette version** (rejet explicite, pas de perte silencieuse).
3. Validation serveur Siteverify Turnstile, hostname strict \`limpid-nettoyage.fr\` et action \`limpid_devis\`. Token à usage unique ; chaque tentative de rejeu authentique demande un nouveau token.
4. D1 production **distincte de D1 STAGING** : \`INSERT OR IGNORE\` par \`ref\` + hash SHA-256 identique pour un rejeu. Même référence avec contenu divergent : HTTP 409.
5. HTTP 201 seulement après relecture de D1. Réponse JSON \`{ok,reference,statut}\`, statut \`enregistre\` ou \`deja_enregistre\`.
6. \`GET /admin/outbox\` : accès serveur à serveur par Bearer secret distinct ; extrait uniquement les dossiers \`nouveau\`, limite 25, code LIMPID1 déjà stocké, aucun cache.
7. Le CRM réel doit écrire **une seule fois**, puis \`POST /admin/ack\` avec \`ref,sha256\` après validation transactionnelle. En cas d'échec CRM, aucune ACK : dossier reste en outbox.
8. La notification gérant est déclenchée **après import CRM confirmé** via mécanisme à définir et dédoublonnée par référence. Aucun mail commercial n'est envoyé par ce prototype.

## Verrouillage fail-closed
Le prototype exige simultanément \`LIMPID_ENV=PRODUCTION\`, une D1 liée sous \`DB\`, le label \`DB_INSTANCE_LABEL=limpid-intake-production\`, \`ALLOWED_ORIGIN=https://limpid-nettoyage.fr\`, \`TURNSTILE_EXPECTED_HOSTNAME=limpid-nettoyage.fr\`, \`TURNSTILE_EXPECTED_ACTION=limpid_devis\`, deux secrets longs (Turnstile et CRM). En l'absence d'un seul élément, **HTTP 503**. Le label seul ne prouve pas l'identité de D1 : vérifier séparément son **ID de base** dans le dashboard avant tout activation.

IMPORTANT : un en-tête Origin peut être fabriqué par un client hors navigateur et n'est pas un mécanisme d'authentification ; le contrôle Turnstile côté serveur, l'anti-abus WAF et la validation stricte des entrées restent indispensables.

## Empêchements à lever avant activation
- Inventaire / export de la version réellement en service de **\`limpid-site\`**, et contrôle des routes/domaines et des anciennes soumissions. Ne jamais l'écraser en créant un nouveau Worker de réception.
- Projet Apps Script et schéma CRM de **PRODUCTION** à identifier et auditer ; mapping LIMPID1, écritures transactionnelles, notifications, vérification d'absence de doublon, gestion des erreurs.
- Choix confirmé pour les **photos** : actuellement le \`LIMPID1\` est \`photos:false\` et la page propose aussi des canaux annexes de partage ; aucun upload R2 n'est prêt. Si photos en ligne demandées, prévoir R2 sécurisé, limites, scan, durée, accès et liens temporaires, puis tester.
- Vérification des clés Turnstile dédiées à la production et du bon \`action\` de widget ; aucun secret réutilisé depuis STAGING.
- Définir et documenter la **durée de conservation** de D1, les règles d'effacement et d'archivage, la politique de confidentialité, les droits des personnes, accès du personnel et journaux sans contenu personnel. **Ne pas appliquer mécaniquement un délai CNIL de prospection marketing à la gestion d'un devis.**
- Mettre en place une protection contre le flood (Cloudflare WAF/Rate Limiting), monitoring des erreurs, file de reprise, sauvegardes indépendantes des déploiements.
- Préparer le bridge **de production** après stabilisation du mécanisme de réception, en conservant analytics/GA4 et les obligations légales du site public.
- Rejouer en environnement **isolé mais réaliste** : création → D1 → lecture CRM → écriture unique → ACK ; collision SHA, timeout Turnstile, 409, pannes, mobile.
- Accord explicite séparé sur le Worker public \`limpid-site\`, le commit et le plan de retour arrière.

## Contrôles présents
Tests Node 22 dans \`.github/tests/prod-receiver-draft.test.mjs\` : refus d'activation incomplète, origin incorrecte, test fake, photos, token invalide, référentiel D1, rejeu identique, collision de référence, outbox et ACK, et fuite de secrets. Les tests utilisent de la mémoire et un Siteverify simulé, **aucun POST distant**.

## Références
- Turnstile : https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Rollback Workers : https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/
- D1 Time Travel : https://developers.cloudflare.com/d1/reference/time-travel/
- CNIL : https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees

**Jamais déployer ce brouillon sur \`limpid-site\` ni utiliser une base D1 réelle avant les validations indiquées ci-dessus.**
