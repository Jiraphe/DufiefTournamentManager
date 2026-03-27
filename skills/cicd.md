# Guidelines CI/CD — GitHub Actions + Docker + Kubernetes + ArgoCD

Stack : GitHub Actions / GHCR / Docker multi-stage / Helm 4 / ArgoCD v3 / Sealed Secrets

---

## Pipeline GitHub Actions — Ordre strict

```yaml
jobs:
  lint:
    # ESLint 10 (flat config) + Prettier check — backend + frontend

  test-backend:
    needs: [lint]
    # Jest NestJS — unitaires + intégration
    # Services PostgreSQL 18 + Redis 8 déclarés dans le job
    # npx prisma generate avant les tests

  test-frontend:
    needs: [lint]
    # Jest + Angular Testing Library

  sonar:
    needs: [test-backend, test-frontend]
    # SonarCloud — qualité, couverture, duplications

  trivy:
    needs: [lint]
    # Scan CVE de l'image Docker
    # Fixer la version : aquasecurity/trivy-action@v0.35.0 (≤ v0.69.3 du binaire)

  build-push:
    needs: [sonar, trivy]
    # Build Docker multi-stage + push GHCR
    # Tag : sha-${{ github.sha }}

  deploy-staging:
    needs: [build-push]
    if: github.ref == 'refs/heads/main'
    # Update values.yaml staging avec le nouveau tag image
    # ArgoCD détecte le changement et déploie

  e2e:
    needs: [deploy-staging]
    # Playwright contre l'environnement staging déployé

  deploy-prod:
    needs: [e2e]
    if: startsWith(github.ref, 'refs/tags/v')
    # Update values.yaml production — déploiement manuel uniquement
```

---

## Docker — Multi-stage obligatoire

### Backend NestJS

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
# Copier uniquement ce qui est nécessaire à l'exécution
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
# Exécuter en tant qu'utilisateur non-root
RUN addgroup -S app && adduser -S app -G app
USER app
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Frontend Angular

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine AS runtime
COPY --from=builder /app/dist/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Règles Docker :**
- Image de base : `node:22-alpine` (LTS actuel — Node 20 fin de support avril 2026)
- Utiliser `.dockerignore` : exclure `.git`, `node_modules`, `*.md`, `.env*`, fichiers de test
- Toujours exécuter en utilisateur non-root
- COPY (pas ADD) pour les transferts entre stages

---

## Tagging des images

```
# Builds CI (branches / PRs)
ghcr.io/<org>/<app>-backend:sha-a1b2c3d4
ghcr.io/<org>/<app>-frontend:sha-a1b2c3d4

# Releases production
ghcr.io/<org>/<app>-backend:v1.2.3
ghcr.io/<org>/<app>-frontend:v1.2.3
```

**Jamais de tag `latest` seul en production.**

---

## Helm 4 — Structure

Helm 4 est la version actuelle (sorti novembre 2025). Helm 3 reste supporté jusqu'en novembre 2026 (sécurité uniquement).

```
k8s/
  charts/
    backend/
      Chart.yaml
      values.yaml            # valeurs par défaut
      templates/
        deployment.yaml      # initContainer migrations DB + readinessProbe
        service.yaml
        ingress.yaml         # annotations WebSocket obligatoires
        hpa.yaml
        sealed-secret.yaml
    frontend/
      Chart.yaml
      values.yaml
      templates/
        deployment.yaml
        service.yaml
        ingress.yaml
  environments/
    staging/
      backend-values.yaml    # override : tag image, replicas, env vars
      frontend-values.yaml
    production/
      backend-values.yaml
      frontend-values.yaml
```

---

## Ingress WebSocket — Annotations obligatoires

```yaml
# templates/ingress.yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
  nginx.ingress.kubernetes.io/proxy-http-version: "1.1"
  nginx.ingress.kubernetes.io/configuration-snippet: |
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
```

Sans ces annotations, les subscriptions GraphQL (WebSocket) échouent silencieusement derrière l'Ingress.

---

## Migrations DB — initContainer K8s

```yaml
# Dans templates/deployment.yaml du backend
initContainers:
  - name: db-migrate
    image: ghcr.io/<org>/<app>-backend:{{ .Values.image.tag }}
    command: ["npx", "prisma", "migrate", "deploy"]
    env:
      - name: DATABASE_URL
        valueFrom:
          secretKeyRef:
            name: <app>-secrets
            key: DATABASE_URL
```

**Ne jamais exécuter les migrations dans le code applicatif** (`onModuleInit`, démarrage, etc.).

---

## ArgoCD v3 — GitOps

```
GitHub Actions → update values.yaml (tag image) → git push k8s/
                                                        ↓
                                              ArgoCD détecte le changement
                                                        ↓
                                              helm upgrade (staging ou prod)
```

- ArgoCD v3 intègre ApplicationSet nativement (pas d'installation séparée)
- Sync **automatique** sur staging, **manuel** sur production
- Rollback : `argocd app rollback <app> <revision>` ou via UI
- La pipeline GitHub Actions ne se connecte jamais directement au cluster K8s

---

## Secrets — Sealed Secrets

```bash
# Chiffrer un secret pour K8s (commitable dans Git)
kubeseal --format yaml < secret.yaml > sealed-secret.yaml
git add sealed-secret.yaml
```

- Secrets K8s chiffrés avec la clé publique du controller en cluster
- Secrets pipeline CI : GitHub Environments (jamais dans le code)
- Ne jamais commiter de fichier `.env` ou de secret en clair

---

## ESLint 10 — Flat Config obligatoire

```javascript
// eslint.config.js (remplace .eslintrc.* — supprimé dans ESLint 10)
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // Config Angular si frontend
  ...angular.configs.tsRecommended,
);
```

- `.eslintrc.json`, `.eslintrc.js`, `.eslintignore` sont supprimés dans ESLint 10
- Ignorer les fichiers via `globalIgnores()` dans `eslint.config.js`

---

## Trivy — Version figée

```yaml
# Dans le job trivy de la pipeline
- uses: aquasecurity/trivy-action@v0.35.0  # ≤ v0.69.3 du binaire
  with:
    image-ref: ghcr.io/<org>/<app>-backend:sha-${{ github.sha }}
    format: sarif
    output: trivy-results.sarif
    severity: CRITICAL,HIGH
```

**ALERTE SÉCURITÉ** : Trivy v0.69.4, v0.69.5, v0.69.6 sont compromises (supply chain attack confirmée mars 2026). Rester sur `trivy-action@v0.35.0` ou une version antérieure jusqu'à la publication d'une version saine.

---

## Tests dans la pipeline

```yaml
# Services PostgreSQL + Redis dans le job de test backend
services:
  postgres:
    image: postgres:18-alpine
    env:
      POSTGRES_DB: test_db
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    options: >-
      --health-cmd pg_isready
      --health-interval 5s
      --health-timeout 5s
      --health-retries 5

  redis:
    image: redis:8-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 5s
```

- Pas de mock DB dans les tests d'intégration — PostgreSQL réel obligatoire
- `npx prisma generate` avant les tests backend
- `npx prisma migrate deploy` sur la base de test avant le suite de tests
- Tests E2E Playwright : toujours contre staging déployé, pas contre localhost
- Coverage minimum dans `jest.config.ts` — job échoue si seuil non atteint
