# Stack technique

Stack figée le 2026-03-27. À modifier uniquement sur décision explicite.

---

## Frontend

| Couche | Technologie | Version cible |
|---|---|---|
| Framework | Angular standalone | 20+ |
| Mobile / PWA | `@angular/pwa` | — |
| UI components | Angular Material (MDC) | 20+ |
| GraphQL client | Apollo Angular | 12+ |
| State management | Apollo Cache + Signals | — |

---

## Backend

| Couche | Technologie | Version cible |
|---|---|---|
| Framework | NestJS | 11+ |
| GraphQL | Apollo Server code-first + `graphql-ws` | — |
| ORM | Prisma | 7+ |
| Authentification | JWT access (15min) + Refresh token (7j) | — |
| Guards | `GqlAuthGuard` + `RolesGuard` | — |

---

## Infrastructure

| Couche | Technologie | Notes |
|---|---|---|
| Base de données | PostgreSQL | 18 — source de vérité |
| Broker pub/sub + cache | Redis | 8+ — modules intégrés (RedisJSON, RediSearch built-in) |
| Registry Docker | GHCR | Tag : `sha-<commit>` CI, `vX.Y.Z` release |
| Orchestration | Kubernetes + Helm | 4+ |
| GitOps | ArgoCD | v3+ — ApplicationSet intégré |
| Secrets K8s | Sealed Secrets | kubeseal CLI |
| Conteneurs | Docker multi-stage | node:22-alpine build → node:22-alpine runtime (backend), nginx:alpine runtime (frontend) |

---

## Temps réel

- GraphQL Subscriptions via WebSocket (`graphql-ws`)
- `graphql-redis-subscriptions` comme PubSubEngine (scalabilité multi-pods K8s)
- Ingress K8s : proxy WebSocket obligatoire (`Upgrade`, `Connection` headers + timeouts)

---

## CI/CD

| Outil | Rôle |
|---|---|
| GitHub Actions | Pipeline CI/CD |
| ESLint 10 (flat config) + Prettier | Lint et formatage |
| Husky + lint-staged | Blocage local pré-commit |
| Jest | Tests unitaires et intégration |
| Playwright | Tests E2E |
| SonarCloud | Qualité, couverture, duplications |
| CodeQL | Analyse sécurité statique |
| Trivy ≤ v0.69.3 | Scan CVE images Docker |

---

## Points critiques à ne jamais oublier

1. **Redis obligatoire** pour les subscriptions GraphQL en K8s multi-replicas — sans broker pub/sub, les événements ne sont reçus que par le pod émetteur.
2. **Ingress WebSocket** — annotations nginx `proxy-read-timeout`, `proxy-send-timeout`, headers `Upgrade` et `Connection` obligatoires.
3. **Migrations Prisma** — via `initContainer` K8s uniquement, jamais dans le code applicatif.
4. **Prisma 7 = ESM-only** — vérifier la compatibilité de l'environnement d'exécution avant upgrade.
5. **Trivy** — ne pas utiliser v0.69.4+ (supply chain attack confirmée). Rester sur ≤ v0.69.3.
6. **ESLint 10** — flat config `eslint.config.js` obligatoire, `.eslintrc.*` supprimé.
