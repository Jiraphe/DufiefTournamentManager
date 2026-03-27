# Skills Globales — Bonnes pratiques transverses

---

## 1. Modèle de maturité de Richardson (REST Maturity Model)

Applicable aux webhooks, endpoints REST internes et intégrations tierces (même si l'API principale est GraphQL).

### Niveau 2 — HTTP Verbs (minimum acceptable)

```
GET    /resources          # liste
GET    /resources/:id      # détail
POST   /resources          # création
PATCH  /resources/:id      # mise à jour partielle
PUT    /resources/:id      # remplacement complet
DELETE /resources/:id      # suppression
```

- Ne jamais utiliser POST pour tout
- PATCH pour mise à jour partielle, PUT pour remplacement complet

> **Cible** : Niveau 2 pour les endpoints REST auxiliaires.

---

## 2. Principes SOLID

- **Single Responsibility** : un service = une responsabilité. Ne pas mélanger les domaines dans un même service.
- **Open/Closed** : étendre par composition, pas par modification. Préférer guards et interceptors à la modification des services existants.
- **Liskov Substitution** : les sous-types doivent respecter le contrat de leur type parent sans surprise.
- **Interface Segregation** : plusieurs petites interfaces plutôt qu'une grosse interface générale.
- **Dependency Inversion** : dépendre des abstractions, injecter via DI (NestJS / Angular).

---

## 3. Convention de commits (Conventional Commits)

```
<type>(<scope>): <description courte>

[body optionnel]

[footer optionnel : BREAKING CHANGE / closes #issue]
```

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactoring sans changement de comportement |
| `test` | Ajout ou modification de tests |
| `chore` | Maintenance, dépendances, config |
| `docs` | Documentation uniquement |
| `perf` | Amélioration de performance |

---

## 4. Gestion des erreurs

### Codes HTTP standards

| Code | Usage |
|---|---|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Données invalides (validation échouée) |
| `401` | Non authentifié |
| `403` | Authentifié mais non autorisé |
| `404` | Ressource introuvable |
| `409` | Conflit d'état (doublon, ressource déjà existante) |
| `422` | Règle métier violée |
| `500` | Erreur serveur interne |

### Erreurs GraphQL — toujours typées avec `extensions.code`

```typescript
throw new GraphQLError('Resource not available', {
  extensions: { code: 'RESOURCE_UNAVAILABLE' }
});
```

Ne jamais exposer les stack traces en production.

---

## 5. Tests — Pyramide

```
       /E2E\         (Playwright — parcours critiques)
      /------\
     /Intégr. \      (Jest — modules, API GraphQL, vraie BDD)
    /----------\
   / Unitaires  \    (Jest — services, logique métier pure)
  /--------------\
```

- Nommage : `should [action] when [condition]`
- Tests d'intégration : base de données réelle (PostgreSQL), jamais de mock DB
- Coverage minimum configurable dans `jest.config.ts` — le job CI échoue si non atteint

---

## 6. Sécurité

- Mots de passe : `bcrypt`, minimum 12 rounds
- JWT : access token 15min + refresh token 7j avec rotation
- Valider toutes les entrées côté serveur (`class-validator`)
- Rate limiting sur les endpoints et mutations sensibles
- Variables d'environnement pour tous les secrets — jamais de valeur en dur dans le code
- CORS explicite — pas de `*` en production
- Ne jamais logger les tokens, mots de passe ou données sensibles

---

## 7. Variables d'environnement

```bash
# .env.example (commité dans Git)
DATABASE_URL=postgresql://user:password@localhost:5432/db
REDIS_URL=redis://localhost:6379
JWT_SECRET=changeme
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3000

# .env (jamais commité — dans .gitignore)
```

Validation Joi des variables d'environnement au démarrage NestJS via `@nestjs/config`.

---

## 8. Git workflow

```
main      → production (déploiement ArgoCD sur tag vX.Y.Z)
  └── develop → intégration (merge après review)
        ├── feat/<feature-name>
        ├── fix/<bug-name>
        └── chore/<task-name>
```

- PR obligatoire pour merger sur `main`
- Au moins 1 reviewer
- Tests CI doivent passer avant merge
- Squash merge pour un historique propre
