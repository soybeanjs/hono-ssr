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

export interface RouteDefinition<T, S extends Record<string, any> = Record<string, any>> {
  handlers: T;
  meta?: S;
}

export interface DefineRouteInterface<
  E extends Env,
  P extends string,
  S extends Record<string, any> = Record<string, any>
> {
  <I extends Input = {}, R extends HandlerResponse<any> = any, E2 extends Env = E>(
    definition: RouteDefinition<H<E2, P, I, R>, S>
  ): RouteDefinition<[H<E2, P, I, R>], S>;
  <I extends Input = {}, R extends HandlerResponse<any> = any, E2 extends Env = E>(
    definition: RouteDefinition<[H<E2, P, I, R>]>
  ): RouteDefinition<[H<E2, P, I, R>]>;
  <
    I extends Input = {},
    I2 extends Input = I,
    R extends HandlerResponse<any> = any,
    R2 extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>
  >(
    definition: RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>], S>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>], S>;
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
    definition: RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>], S>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>], S>;
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
    definition: RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>], S>
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>], S>;
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
    definition: RouteDefinition<
      [H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>, H<E6, P, I5, R5>],
      S
    >
  ): RouteDefinition<[H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>, H<E6, P, I5, R5>], S>;
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
    definition: RouteDefinition<
      [H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>, H<E6, P, I5, R5>, H<E7, P, I6, R6>],
      S
    >
  ): RouteDefinition<
    [H<E2, P, I, R>, H<E3, P, I2, R2>, H<E4, P, I3, R3>, H<E5, P, I4, R4>, H<E6, P, I5, R5>, H<E7, P, I6, R6>],
    S
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
    definition: RouteDefinition<
      [
        H<E2, P, I, R>,
        H<E3, P, I2, R2>,
        H<E4, P, I3, R3>,
        H<E5, P, I4, R4>,
        H<E6, P, I5, R5>,
        H<E7, P, I6, R6>,
        H<E8, P, I7, R7>
      ],
      S
    >
  ): RouteDefinition<
    [
      H<E2, P, I, R>,
      H<E3, P, I2, R2>,
      H<E4, P, I3, R3>,
      H<E5, P, I4, R4>,
      H<E6, P, I5, R5>,
      H<E7, P, I6, R6>,
      H<E8, P, I7, R7>
    ],
    S
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
    definition: RouteDefinition<
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
      S
    >
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
    S
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
    definition: RouteDefinition<
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
      S
    >
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
    S
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
    definition: RouteDefinition<
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
      S
    >
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
    S
  >;
}
