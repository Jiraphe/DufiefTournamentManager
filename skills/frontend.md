# Guidelines Frontend — Angular 20+ + Apollo Angular + PWA

Stack : Angular 20+ standalone / Apollo Angular 12+ / Angular Material (MDC) / @angular/pwa

---

## Règles Angular fondamentales

- **Standalone components UNIQUEMENT** — pas de NgModule
- **Signals** pour la réactivité — `signal()`, `computed()`, `effect()`, `input()`, `output()` sont stables depuis Angular 20
- **`@if` / `@for` / `@switch`** — syntaxe de contrôle de flux intégrée, pas de `*ngIf` / `*ngFor` (dépréciés)
- **`track`** obligatoire sur chaque `@for`
- **Reactive Forms exclusivement** — jamais de template-driven forms
- **Lazy loading** sur toutes les routes
- **`ChangeDetectionStrategy.OnPush`** sur les composants n'utilisant pas encore les signals
- Nommage fichiers : kebab-case (`resource-card.component.ts`)
- Nommage classes : PascalCase (`ResourceCardComponent`)

---

## Structure de composant type (Angular 20 — Signals)

```typescript
@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './resource-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCardComponent {
  // Signal-based inputs (Angular 17.1+, stable en v20)
  resource = input.required<Resource>();

  // Computed signal
  displayLabel = computed(() => `${this.resource().name} — ${this.resource().status}`);
}
```

```html
<!-- Syntaxe de contrôle de flux intégrée (pas de CommonModule requis) -->
@if (resource()) {
  <mat-card>{{ displayLabel() }}</mat-card>
} @else {
  <p>Chargement...</p>
}

@for (item of items(); track item.id) {
  <app-item [item]="item" />
}
```

---

## Apollo Angular 12 — Configuration split link

```typescript
// apollo.config.ts
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

export function createApollo(httpLink: HttpLink): ApolloClientOptions<unknown> {
  const http = httpLink.create({ uri: '/graphql' });

  const ws = new GraphQLWsLink(
    createClient({ url: 'wss://api.example.com/graphql' }),
  );

  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    ws,
    http,
  );

  return { link: splitLink, cache: new InMemoryCache() };
}
```

- HTTP pour queries et mutations
- WebSocket (`graphql-ws`) pour subscriptions — `subscriptions-transport-ws` est déprécié
- Apollo Angular 12 requiert `@apollo/client` v4 et Angular 17+

---

## GraphQL Code Generator — Obligatoire

Ne jamais écrire les types GraphQL manuellement. Générer depuis le schéma :

```yaml
# codegen.yml
generates:
  src/app/graphql/generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-apollo-angular
```

Intégrer `graphql-codegen` dans le script de build et dans la CI.

---

## Routing — Lazy loading obligatoire

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
];
```

---

## Gestion des subscriptions — Prévention des fuites mémoire

```typescript
@Component({ standalone: true, ... })
export class LiveFeedComponent {
  private destroyRef = inject(DestroyRef);

  // Option 1 : takeUntilDestroyed (recommandé Angular 16+)
  readonly data$ = this.myGql.subscribe().pipe(
    takeUntilDestroyed(this.destroyRef),
  );

  // Option 2 : pipe async dans le template (pas de gestion manuelle)
}
```

- Préférer `| async` ou `takeUntilDestroyed()` au `subscribe()` + `ngOnDestroy` manuel
- Ne jamais utiliser `subscribe()` sans mécanisme de désabonnement

---

## Formulaires — Reactive Forms avec signals

```typescript
readonly form = new FormGroup({
  name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
  value: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
});

// Accès au signal de valeur (Angular 17+)
readonly nameValue = toSignal(this.form.controls.name.valueChanges);
```

---

## PWA — @angular/pwa

- `NetworkFirst` pour les requêtes API dynamiques
- `CacheFirst` pour les assets statiques (JS, CSS, images)
- Le Service Worker **ne peut pas intercepter les WebSockets** — les subscriptions GraphQL passent toujours par le réseau
- Si résilience offline requise : queue `IndexedDB` + `Background Sync API` (développement explicite à budgéter)

---

## Angular Material — MDC uniquement

- Les composants legacy (pré-MDC) sont supprimés depuis Angular 17
- Utiliser exclusivement les composants MDC (`mat-mdc-*` en interne)
- Toute personnalisation CSS doit cibler les classes MDC (`mat-mdc-form-field`, etc.)
- Utiliser le schematic de migration officiel si upgrade depuis v16 ou antérieur

---

## Sécurité frontend

- Les guards Angular sont pour l'UX, pas pour la sécurité — le serveur est l'unique source de vérité pour l'autorisation
- Ne jamais stocker les tokens dans `localStorage` — préférer `sessionStorage` ou cookies `httpOnly`
- L'interpolation Angular `{{ }}` sanitise automatiquement le contenu — ne pas bypasser avec `innerHTML` sauf si indispensable et sanitisé manuellement
- Ne jamais mettre de secrets ou de clés API dans le code frontend
