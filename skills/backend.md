# Guidelines Backend — NestJS + GraphQL + Prisma

Stack : NestJS 11+ / Apollo Server code-first / graphql-ws / Prisma 7+ / PostgreSQL 18 / Redis 8+

---

## Architecture obligatoire

```
Resolver → Service → Repository
```

- **Aucune logique métier dans le Resolver** — délègue uniquement au Service
- **Aucun accès Prisma direct dans le Service** — passe par le Repository
- Le Repository est le seul point d'accès à Prisma

### Structure de module type

```
src/
  <domain>/
    <domain>.module.ts
    <domain>.resolver.ts      # @Query, @Mutation, @Subscription, @ResolveField
    <domain>.service.ts       # logique métier
    <domain>.repository.ts    # accès Prisma exclusivement
    dto/
      create-<domain>.input.ts   # @InputType() + class-validator
      <domain>.model.ts          # @ObjectType()
```

---

## GraphQL — Règles

### InputType : validation obligatoire avec class-validator

```typescript
@InputType()
export class CreateResourceInput {
  @Field()
  @IsUUID()
  parentId: string;

  @Field()
  @IsString()
  @MaxLength(255)
  name: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```

### ResolveField : DataLoader obligatoire (anti N+1)

```typescript
@ResolveField(() => RelatedType)
async related(
  @Parent() entity: Entity,
  @Context() { loaders }: GqlContext,
) {
  return loaders.related.load(entity.relatedId);
}
```

Ne jamais appeler un `findUnique` dans un `@ResolveField` sans DataLoader.

### Subscriptions — Redis PubSub

```typescript
// pubsub.provider.ts
import { RedisPubSub } from 'graphql-redis-subscriptions';

export const PubSubProvider = {
  provide: 'PUB_SUB',
  useFactory: () => new RedisPubSub({
    connection: process.env.REDIS_URL,
  }),
};
```

Un seul `PubSubProvider` partagé entre tous les resolvers via injection de dépendance.

### Erreurs GraphQL — toujours typées

```typescript
import { GraphQLError } from 'graphql';

throw new GraphQLError('Resource not available', {
  extensions: { code: 'RESOURCE_UNAVAILABLE', resourceId }
});
```

Ne pas utiliser les helpers dépréciés `UserInputError` / `ForbiddenError` de `apollo-server-core` (supprimés dans Apollo v4+). Utiliser `GraphQLError` directement.

---

## Guards — sur chaque mutation et query sensible

```typescript
@Mutation(() => ResourceModel)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async createResource(@Args('input') input: CreateResourceInput) {
  return this.resourceService.create(input);
}
```

---

## Prisma 7 — Règles

### ESM-only

Prisma 7 est distribué en ESM uniquement. Vérifier que `package.json` contient `"type": "module"` ou configurer le projet en conséquence avant d'upgrader depuis Prisma 5/6.

### Transactions pour les opérations multi-tables

```typescript
await this.prisma.$transaction(async (tx) => {
  const resource = await tx.resource.create({ data: resourceData });
  await tx.relatedEntity.update({
    where: { id: input.relatedId },
    data: { resourceId: resource.id },
  });
  return resource;
});
```

### Pool de connexions

Prisma 7 délègue la gestion du pool de connexions au driver sous-jacent. Les valeurs par défaut ont changé par rapport à Prisma 5/6 — vérifier et configurer explicitement `connection_limit` dans la `DATABASE_URL` si nécessaire.

### Migrations en K8s

`prisma migrate deploy` s'exécute via un **initContainer Kubernetes**, jamais dans `onModuleInit` ou au démarrage de l'app. Voir `skills/cicd.md`.

### generate dans la CI

Toujours exécuter `npx prisma generate` avant les tests et avant le build dans la pipeline CI.

---

## Configuration GraphQL module

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  sortSchema: true,
  subscriptions: {
    'graphql-ws': true,
  },
  formatError: (error) => ({
    message: error.message,
    code: error.extensions?.code,
    // Pas de stacktrace en production
  }),
})
```

`subscriptions-transport-ws` est déprécié et non maintenu — utiliser exclusivement `graphql-ws`.

---

## Sécurité backend

- Bcrypt minimum 12 rounds pour les mots de passe
- `@nestjs/throttler` avec store Redis pour le rate limiting inter-pods (shared state en K8s)
- Validation Joi des variables d'environnement au démarrage via `@nestjs/config`
- Ne jamais logger les tokens, mots de passe ou données PII
- `formatError` en production : `message` + `code` uniquement, jamais de `stacktrace`
- Refresh token : rotation à chaque usage + révocation via blacklist Redis
