# LIMPID SIGNATURE V1.26 — Préparation de mise en production (NON AUTORISÉE)
État du 8 novembre 2026. Document de continuité technique ; **aucun déploiement ne doit découler automatiquement de ce plan**.

## Périmètre et composants canoniques
| Élément | Rôle | Droit d'action pendant cette phase |
|---|---|---|
| Worker Cloudflare **limpid-site** | **Site public de production** | Aucun changement sans décision séparée |
| Worker Cloudflare limpid-preprod | Site SIGNATURE de test | GitHub PR #1, branche isolée |
| Worker Cloudflare limpid-intake-staging | Réception **fictive uniquement** | Ne pas reconfigurer comme production |
| D1 limpid-intake-staging | Enregistrements de test | Lecture SQL contrôlée |
| Google Sheets LIMPID — LAB SITE-CRM V1.7 — TESTS | Copie CRM isolée | Aucun effet sur CRM réel |
| Dépôt GitHub BabsouOnTheTrack/limpid-preprod | Source actuellement auditée | PR #1 brouillon, pas de fusion automatique |

Le nom d'un dépôt GitHub ne garantit pas l'identité d'un Worker. Vérifier les liaisons Cloudflare *Builds* et les routes/domains avant toute action.

## Ce qui est prouvé (préproduction seulement)
- Quatre parcours (vitres, ménage, B2B, devis général) ont généré des références fictives reconnues par l'interface et retrouvées dans D1 et la COPIE Google Sheets. ACK D1 confirmé sur captures ou déclaré validé par le propriétaire, outbox finalement vide.
- Contrôle préflight CORS 204 depuis la Preview ; Turnstile / STAGING fonctionnels sur les essais effectués.
- Tests CI : contrats statiques des quatre moteurs, refus de données non fictives et photos au niveau bridge, isolement GA4 des domaines de Preview, 26 redirections historiques sans cible locale absente, 1 redirection HTTP 301 vérifiée en ligne.
- Mobile Chromium 390 px : 4 pages d'entrée et 4 confirmations **simulées**, aucun débordement horizontal ni erreur JS dans les parcours testés. Pour le devis général, le harnais désactive localement la remise à zéro d'une session close, sans changer le site.
- Anti-doublon : contrôle SQL SQLite hors ligne et lecture source du Worker STAGING. **Aucun rejeu POST distant identique n'a encore été prouvé**.

## Bloqueurs explicites (NO-GO production)
1. Le bridge actuel est **strictement STAGING** : hostname Preview autorisé, coordonnées fictives exigées, jeton Turnstile STAGING, endpoint \`limpid-intake-staging\`. **Ne jamais l'expédier en production tel quel.**
2. Le circuit de réception CRM réel n'est pas construit / vérifié comme l'est le LAB : pas de preuve de notification gérant, écriture CRM réel, gestion RGPD (rétention/effacement), politique d'échec, traitement de vraies photos, garantie de non-perte de données.
3. Les appels réels et les conversions Google Ads / GA4 nécessitent une validation séparée. L'isolement de la Preview ne doit pas être répercuté sans discernement au domaine de production.
4. Reste le rejeu HTTP réel idempotent avec nouveau token légitime, et un contrôle de la confirmation mobile sur un véritable POST fictif, si requis pour l'acceptation finale.
5. Inventaire et sauvegarde intégrale de **limpid-site** non réalisés dans cette PR.

## Étapes préparatoires (AUCUNE n'est lancée automatiquement)
### A. Sauvegarde préalable indépendante
- Exporter la **version exécutable** du Worker \`limpid-site\` et les assets du site public ; relever les routes et domaines, configuration Cloudflare, variables (noms uniquement, jamais les valeurs), D1/KV/R2/Secrets/bindings, règles de cache, DNS et entêtes.
- Conserver un manifeste horodaté (hashes de fichiers, version, commit si relié, procédure de retour arrière et vérification des formulaires de production existants).
- Consolider la sauvegarde de continuité LAB, GitHub PR SHA et tests verts, sans copier de secrets dans GitHub.

### B. Récepteur de production distinct
- Concevoir et faire auditer un Worker de réception **prod distinct** (ou réviser le mécanisme de réception existant) : origin officiel explicite, Turnstile de production, contraintes sur dossiers *réels*, schéma LIMPID1 compatible, anti-spam/limites, CORS restrictif, gestion des photos si autorisée, stockage et rétention définis.
- Définir D1 dédiée à la production si pertinent, clés uniquement via Cloudflare Secrets, **aucune réutilisation** des secrets / D1 de STAGING.
- Valider synchronisation CRM réelle, accusés après persistance, doublons et récupération après panne ; notifications gérant sans promesses non tenues au client.
- Consigner la base légale, la durée de conservation, les mesures de sécurité et le traitement des demandes de suppression.

### C. Prévisualisation et validation commerciale
- Faire valider le design SIGNATURE, les quatre tunnels et tous les anciens chemins sur un domaine de prévisualisation privé et correctement identifié.
- Prouver : soumission réelle contrôlée, réception en CRM réel de test et notification, déduplication / ACK, aucune conversion lors des tests, conformité SEO et données structurées, consentement, accessibilité et mobile.
- Prévoir tests de non-régression métier (quantités de vitres/faces, Velux, tarifs et champs, import LIMPID1, devis et historique).

### D. Déploiement maîtrisé de \`limpid-site\` (accord explicite supplémentaire requis)
- Demander une autorisation de lancement séparée, identifiant le **Worker de production \`limpid-site\`**, le commit exact, l'heure, le plan de retour arrière et le résultat des tests.
- Déployer avec une configuration Wrangler **dédiée à \`limpid-site\`**, jamais par simple réutilisation de \`wrangler.jsonc\` (qui cible \`limpid-preprod\`).
- Prévoir un créneau de changement, sauvegarde préalable, vérification des routes / domaine / HTTPS, tests smoke immédiats, suivi des conversions et des demandes, et possibilité de rollback rapide.

### E. Retour arrière
- Restaurer l'ancien Worker \`limpid-site\` et ses assets/bindings/route sur la version sauvegardée, sans supprimer ni écraser les demandes reçues pendant la fenêtre de changement.
- Vérifier le site public, le fonctionnement des formulaires existants, les redirections essentielles, les journaux et l'absence de conversions de test.
- Documenter le résultat et conserver la copie SIGNATURE isolée pour diagnostic.

## Règle finale
**Statut : NO-GO PRODUCTION jusqu'à validation des bloqueurs, des sauvegardes et autorisation explicite du propriétaire.**

## Jalon V0.2 — contrat métier du récepteur (08/11/2026)

Prototype dans `.github/prod-readiness/worker-proposal.mjs` uniquement. Tests unitaires en mémoire : devis général avec téléphone vide, rappel sans e-mail et sans prestation pour les trois services spécialisés, photo annoncée sans téléversement, rejet des pièces jointes, contrôle de duplication et ACK. Ces tests **ne créent pas** de Worker, D1 ni secret de production et ne touchent pas Web3Forms.

À vérifier impérativement avant la bascule :
- L'import CRM doit distinguer `type=rappel` de `type=devis`, sans exiger une prestation ou un e-mail pour le rappel.
- Le signal `photosAEnvoyer=true` doit préserver l'intention du client, sans prétendre qu'une photo est jointe.
- Les notifications du gérant doivent être testées sur chaque parcours et dédoublonnées ; aucune ACK ne doit intervenir avant la persistance vérifiée.
- La configuration de prod doit rester séparée de STAGING : pas de copie du Worker STAGING ni de ses secrets.
- Le récepteur V0.2 **n'est pas encore déployable** : la politique RGPD, le WAF/Rate Limit, les flux CRM, les images différées et les tests en environnement isolé restent ouverts.