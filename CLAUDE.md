# Projet Dufief — Instructions Claude Code

## Règle fondamentale

Toujours lire et appliquer les guidelines correspondantes AVANT de générer du code.

---

## Stack technique — NON NÉGOCIABLE

La stack est figée dans `skills/stack.md`. Toute décision technique doit s'y conformer.

```
Frontend  : Angular 20+ standalone + PWA (@angular/pwa) + Apollo Angular 12+ + Angular Material (MDC)
Backend   : NestJS 11+ + GraphQL code-first (Apollo Server) + graphql-ws + Prisma 7+
Database  : PostgreSQL 18 (source de vérité) + Redis 8+ (pub/sub + cache)
Temps réel: GraphQL Subscriptions via graphql-ws + graphql-redis-subscriptions
Auth      : JWT access (15min) + Refresh token (7j) + Guards par rôle
Registry  : GHCR (GitHub Container Registry)
K8s       : Helm 4 + ArgoCD v3 (GitOps) + Sealed Secrets
CI/CD     : GitHub Actions
```

---

## Routing des guidelines

### Toujours appliquées (tout contexte)
→ Lire `skills/global.md` : Richardson, SOLID, commits, sécurité, tests, git

### Stack complète et versions
→ Lire `skills/stack.md`

### Fichiers backend
**Patterns** : `*.module.ts`, `*.resolver.ts`, `*.service.ts`, `*.repository.ts`, `*.dto.ts`, `*.guard.ts`, `schema.prisma`, `migration`

→ Lire `skills/backend.md`

**Rappels critiques backend :**
- Resolver → Service → Repository (aucune logique dans le resolver)
- Valider toutes les entrées avec `class-validator` sur les `@InputType()`
- DataLoader obligatoire sur les `@ResolveField()` (anti N+1)
- Guards sur chaque mutation/query sensible
- Transactions Prisma pour les opérations multi-tables
- `prisma migrate deploy` via initContainer K8s, jamais dans `onModuleInit`
- Prisma 7 = ESM-only — vérifier la compatibilité avant upgrade
- Erreurs GraphQL : utiliser `GraphQLError` directement (plus `UserInputError` Apollo dépréciée)

### Fichiers frontend
**Patterns** : `*.component.ts`, `*.component.html`, `*.component.scss`, `*.pipe.ts`, `*.directive.ts`, `app.routes.ts`, `*.spec.ts`

→ Lire `skills/frontend.md`

**Rappels critiques frontend :**
- Standalone components UNIQUEMENT (Angular 20+), pas de NgModule
- Signals (`input()`, `output()`, `computed()`, `effect()`) — stables, préférer aux décorateurs `@Input`/`@Output`
- `@if` / `@for` / `@switch` — syntaxe intégrée, pas de `*ngIf` / `*ngFor`
- `track` obligatoire sur chaque `@for`
- `ChangeDetectionStrategy.OnPush` sur les composants sans signals
- Reactive Forms exclusivement (jamais template-driven)
- Lazy loading sur toutes les routes
- Split link Apollo : HTTP queries/mutations, WebSocket subscriptions
- Angular Material MDC uniquement (legacy supprimé depuis Angular 17)

### Fichiers CI/CD
**Patterns** : `.github/workflows/*.yml`, `Dockerfile`, `k8s/`, `helm/`

→ Lire `skills/cicd.md`

**Rappels critiques CI/CD :**
- ESLint 10 : flat config `eslint.config.js` obligatoire (`.eslintrc.*` supprimé)
- Node.js 22 LTS dans les images Docker (Node 20 fin de support avril 2026)
- Tests avec PostgreSQL 18 + Redis 8 de service (pas de mock DB)
- Migrations via initContainer K8s, `prisma generate` avant tests
- Images taguées SHA du commit (jamais seulement `latest`)
- Trivy : figer sur `trivy-action@v0.35.0` — v0.69.4+ compromises (supply chain attack mars 2026)
- Helm 4 (Helm 3 supporté jusqu'en nov 2026 uniquement)
- Ingress nginx : annotations WebSocket obligatoires
- Jamais de secrets en dur — GitHub Environments + Sealed Secrets

---

## Conventions obligatoires

- Commits : Conventional Commits (`feat(scope): description`)
- Branches : `feat/`, `fix/`, `chore/` — PR obligatoire vers `main`
- Nommage : kebab-case fichiers, PascalCase classes, camelCase méthodes, snake_case BDD
- Erreurs GraphQL : `GraphQLError` avec `extensions.code`
- Variables d'env : jamais en dur, toujours via `.env` + validation Joi au démarrage
