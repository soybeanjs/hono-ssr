import { createFactory } from 'hono/factory';
import type { Env, MiddlewareHandler } from 'hono/types';
import type { DefineRouteInterface, RouteDefinition } from './types';

export function createDefineRoute<E extends Env, Meta extends Record<string, any>>() {
  const factory = createFactory<E>();

  const defineRoute = ({ handlers, meta }: RouteDefinition<MiddlewareHandler, Meta>) => {
    const $handlers = (Array.isArray(handlers) ? handlers : [handlers]) as unknown as [MiddlewareHandler];

    return {
      handlers: factory.createHandlers(...$handlers),
      meta
    };
  };

  return defineRoute as DefineRouteInterface<E, string, Meta>;
}
