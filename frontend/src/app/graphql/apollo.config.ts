import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

export function createApollo(httpLink: HttpLink): ApolloClientOptions {
  const http = httpLink.create({ uri: '/graphql' });

  const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new GraphQLWsLink(
    createClient({ url: `${wsProtocol}://${location.host}/graphql` }),
  );

  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    ws,
    http,
  );

  return {
    link: splitLink,
    cache: new InMemoryCache(),
  };
}
