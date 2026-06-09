import { createFactory } from 'hono/factory';
import type { Env, MiddlewareHandler } from 'hono/types';
import type { DefineRouteInterface } from './types';

export function createDefineRoute<E extends Env, Meta extends Record<string, any>>() {
  const factory = createFactory<E>();

  const defineRoute = (...handlers: [MiddlewareHandler]) => {
    const container = {
      handlers: factory.createHandlers(...handlers),
      meta: metaFn
    };

    function metaFn(update: Meta) {
      Object.assign(container.meta, update);
      return container;
    }

    return container;
  };

  return defineRoute as DefineRouteInterface<E, string, Meta>;
}
