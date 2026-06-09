import type { BunBuildOptions } from '@hono/vite-build/bun';
import type { CloudflarePagesBuildOptions } from '@hono/vite-build/cloudflare-pages';
import type { CloudflareWorkersBuildOptions } from '@hono/vite-build/cloudflare-workers';
import type { DenoBuildOptions } from '@hono/vite-build/deno';
import type { NetlifyFunctionsBuildOptions } from '@hono/vite-build/netlify-functions';
import type { NodeBuildOptions } from '@hono/vite-build/node';
import type { VercelBuildOptions } from '@hono/vite-build/vercel';
import type { DevServerOptions } from '@hono/vite-dev-server';
import type { Adapter } from '@hono/vite-dev-server/types';
import type { Env, H, HandlerResponse, Input, IntersectNonAnyTypes } from 'hono/types';
import type { GetPlatformProxyOptions } from 'wrangler';

/**
 * HonoSSRPluginOptions defines the options for the Hono SSR plugin.
 */
export interface HonoSSRPluginOptions<T extends HonoSSRBuildType = HonoSSRBuildType> {
  /**
   * @default 'server/app.ts'
   */
  serverEntry?: string;
  /**
   * @default 'app/entry-client.ts'
   */
  clientEntry?: string;
  fileRoute?: HonoSSRFileRouteOptions;
  devServer?: DevServerOptions;
  /**
   * @default "[/^\/app\/.+/]"
   */
  devServerExclude?: (string | RegExp)[];
  /**
   * adapter: 'cloudflare' | 'node' | 'bun'
   *
   * @default true
   */
  enableDevServerAdapter?: boolean;
  buildType?: T;
  buildOptions?: HonoSSRBuildRecord[T];
  /**
   * platformProxyOptions is the options for the platform proxy in development mode.
   *
   * It is used to proxy the requests to the platform when using the dev server adapter.
   */
  platformProxyOptions?: GetPlatformProxyOptions;
}

export type HonoSSRBuildRecord = {
  node?: NodeBuildOptions;
  bun?: BunBuildOptions;
  deno?: DenoBuildOptions;
  'cloudflare-workers'?: CloudflareWorkersBuildOptions;
  'cloudflare-pages'?: CloudflarePagesBuildOptions;
  vercel?: VercelBuildOptions;
  'netlify-functions'?: NetlifyFunctionsBuildOptions;
};

export type HonoSSRBuildType = keyof HonoSSRBuildRecord;

/**
 * HonoSSRFileRouteOptions defines the options for file-based routing api in Hono SSR.
 */
export interface HonoSSRFileRouteOptions {
  /**
   * scanDirs specifies the directories to scan for route api files.
   *
   * @default "['server/api', 'server/routes']"
   */
  scanDirs?: string[];
  /**
   * ignore specifies the patterns to ignore when scanning for route api files.
   *
   * @default `['**‍/*.test.*', '**‍/*.spec.*', '**‍/__tests__/**‍']`
   */
  ignore?: string[];
}

export type HonoAdapterFactory = () => Promise<Adapter> | Adapter;

export type Awaitable<T> = T | Promise<T>;

export interface ScannedRouteModule {
  source: string;
  scanDir: string;
}

export interface RouteDefinition<Handler, Meta> {
  handlers: Handler;
  meta: Meta & ((update: Meta) => RouteDefinition<Handler, Meta>);
}

export interface DefineRouteInterface<
  E extends Env,
  P extends string,
  Meta extends Record<string, any> = Record<string, any>
> {
  <I extends Input = {}, R extends HandlerResponse<any> = any, E2 extends Env = E>(
    handler1: H<E2, P, I, R>
  ): RouteDefinition<[H<E2, P, I, R>], Meta>;
  <
    I extends Input = {},
    I2 extends Input = I,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>], Meta>;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>], Meta>;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    R4 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>,
    handler4: H<E5, P, I4, R4>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>], Meta>;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    R4 extends HandlerResponse<any> = any,
    R5 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>,
    handler4: H<E5, P, I4, R4>,
    handler5: H<E6, P, I5, R5>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>, H<E6, P, I5, R5>], Meta>;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    R4 extends HandlerResponse<any> = any,
    R5 extends HandlerResponse<any> = any,
    R6 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>,
    handler4: H<E5, P, I4, R4>,
    handler5: H<E6, P, I5, R5>,
    handler6: H<E7, P, I6, R6>
  ): RouteDefinition<
    [H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>, H<E6, P, I5, R5>, H<E7, P, I6, R6>],
    Meta
  >;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    R4 extends HandlerResponse<any> = any,
    R5 extends HandlerResponse<any> = any,
    R6 extends HandlerResponse<any> = any,
    R7 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>,
    handler4: H<E5, P, I4, R4>,
    handler5: H<E6, P, I5, R5>,
    handler6: H<E7, P, I6, R6>,
    handler7: H<E8, P, I7, R7>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>, H<E6, P, I5, R5>], Meta>;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    R4 extends HandlerResponse<any> = any,
    R5 extends HandlerResponse<any> = any,
    R6 extends HandlerResponse<any> = any,
    R7 extends HandlerResponse<any> = any,
    R8 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>,
    handler4: H<E5, P, I4, R4>,
    handler5: H<E6, P, I5, R5>,
    handler6: H<E7, P, I6, R6>,
    handler7: H<E8, P, I7, R7>,
    handler8: H<E9, P, I8, R8>
  ): RouteDefinition<
    [
      H<E2, P, I, R>,
      H<E3, P, I2, R2>,
      H<E4, P, I3, R3>,
      H<E5, P, I4, R4>,
      H<E6, P, I5, R5>,
      H<E7, P, I6, R6>,
      H<E8, P, I7, R7>,
      H<E9, P, I8, R8>
    ],
    Meta
  >;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    R4 extends HandlerResponse<any> = any,
    R5 extends HandlerResponse<any> = any,
    R6 extends HandlerResponse<any> = any,
    R7 extends HandlerResponse<any> = any,
    R8 extends HandlerResponse<any> = any,
    R9 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>,
    handler4: H<E5, P, I4, R4>,
    handler5: H<E6, P, I5, R5>,
    handler6: H<E7, P, I6, R6>,
    handler7: H<E8, P, I7, R7>,
    handler8: H<E9, P, I8, R8>,
    handler9: H<E10, P, I9, R9>
  ): RouteDefinition<
    [
      H<E2, P, I, R>,
      H<E3, P, I2, R2>,
      H<E4, P, I3, R3>,
      H<E5, P, I4, R4>,
      H<E6, P, I5, R5>,
      H<E7, P, I6, R6>,
      H<E8, P, I7, R7>,
      H<E9, P, I8, R8>,
      H<E10, P, I9, R9>
    ],
    Meta
  >;
  <
    I extends Input = {},
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    I10 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8 & I9,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    R3 extends HandlerResponse<any> = any,
    R4 extends HandlerResponse<any> = any,
    R5 extends HandlerResponse<any> = any,
    R6 extends HandlerResponse<any> = any,
    R7 extends HandlerResponse<any> = any,
    R8 extends HandlerResponse<any> = any,
    R9 extends HandlerResponse<any> = any,
    R10 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
    E11 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10]>
  >(
    handler1: H<E2, P, I, R>,
    handler2: H<E3, P, I2, R2>,
    handler3: H<E4, P, I3, R3>,
    handler4: H<E5, P, I4, R4>,
    handler5: H<E6, P, I5, R5>,
    handler6: H<E7, P, I6, R6>,
    handler7: H<E8, P, I7, R7>,
    handler8: H<E9, P, I8, R8>,
    handler9: H<E10, P, I9, R9>,
    handler10: H<E11, P, I10, R10>
  ): RouteDefinition<
    [
      H<E2, P, I, R>,
      H<E3, P, I2, R2>,
      H<E4, P, I3, R3>,
      H<E5, P, I4, R4>,
      H<E6, P, I5, R5>,
      H<E7, P, I6, R6>,
      H<E8, P, I7, R7>,
      H<E9, P, I8, R8>,
      H<E10, P, I9, R9>,
      H<E11, P, I10, R10>
    ],
    Meta
  >;
}
