# @soybeanjs/hono-ssr

<p align="center">
  <strong>Hono SSR Vite Plugin — Batteries-included Full-stack SSR</strong>
</p>

<p align="center">
  File-based Routing · Type-safe · Multi-platform · Developer Experience First
</p>

---

[中文](./README.md) | English

## Overview

`@soybeanjs/hono-ssr` is a Vite SSR plugin for [Hono](https://hono.dev), delivering a batteries-included full-stack development experience. It integrates **file-based routing**, **client & server builds**, **SSR manifest management**, and **multi-platform deployment adapters** — so you can focus on building your application, not configuring build tools.

## Features

- 🗂️ **File-based Routing** — Auto-scan `server/api/` and `server/routes/` for API endpoints
- 🔒 **Type-safe Route Definitions** — Full type inference and validation via `createDefineRoute()`
- 🏗️ **Dual Build Pipeline** — Handles client and server bundles with automatic manifest generation
- 🎯 **Virtual Module Manifest** — `virtual:hono-ssr-manifest` inlines the asset manifest at build time, with automatic dev/prod switching
- ☁️ **Multi-platform** — Cloudflare Workers / Pages, Node.js, Bun, Deno, Vercel, Netlify
- 🔥 **HMR Dev Server** — Powered by `@hono/vite-dev-server` with Cloudflare bindings simulation

## Installation

```bash
pnpm add @soybeanjs/hono-ssr
```

Peer dependencies:

```bash
pnpm add hono vite
```

## Quick Start

### 1. Configure the Vite Plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { HonoSSR } from '@soybeanjs/hono-ssr/vite';

export default defineConfig({
  plugins: [
    HonoSSR({
      serverEntry: 'server/app.ts',
      clientEntry: 'app/entry-client.ts',
      buildType: 'cloudflare-workers'
    })
  ]
});
```

### 2. Server Entry

```ts
// server/app.ts
import { Hono } from 'hono';
import { setupFileRoutes } from '@soybeanjs/hono-ssr';
import { resolveManifest } from 'virtual:hono-ssr-manifest';

const app = new Hono();

// Register file-based routes
setupFileRoutes({
  prefix: '/api',
  onRouteRegister: route => {
    app.on(route.method, route.path, ...route.handlers);
  }
});

// Register file-based routes with auth middleware example
setupFileRoutes({
  prefix: '/api',
  onRouteRegister: route => {
    if (route.meta?.requiresAuth) {
      app.on(route.method, route.path, authMiddleware, ...route.handlers);
    } else {
      app.on(route.method, route.path, ...route.handlers);
    }
  }
});

// SSR rendering
app.get('*', async c => {
  const { scripts, styles } = resolveManifest();
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>${styles}</head>
      <body>
        <div id="app"></div>
        ${scripts}
      </body>
    </html>
  `);
});

export default app;
```

### 3. Define API Routes

```ts
// server/api/users.ts
import { createDefineRoute } from '@soybeanjs/hono-ssr/route';
import { z } from 'zod';

const defineRoute = createDefineRoute<{ Bindings: { DB: D1Database } }>();

export const GET = defineRoute({
  handlers: [
    async c => {
      const users = await c.env.DB.prepare('SELECT * FROM users').all();
      return c.json(users.results);
    }
  ]
});

export const POST = defineRoute({
  handlers: [
    zValidator('json', z.object({ name: z.string() })),
    async c => {
      const { name } = c.req.valid('json');
      return c.json({ id: 1, name }, 201);
    }
  ]
});
```

### 4. Client Entry

```ts
// app/entry-client.ts
import { createApp } from './main';

const app = createApp();
app.mount('#app');
```

## Export Paths

| Path                        | Description                                                                  |
| --------------------------- | ---------------------------------------------------------------------------- |
| `@soybeanjs/hono-ssr`       | Main entry: `setupFileRoutes`, `getFilesRoutes`, type definitions            |
| `@soybeanjs/hono-ssr/route` | Route utilities: `createDefineRoute` (**must use this path in route files**) |
| `@soybeanjs/hono-ssr/vite`  | Vite plugin: `HonoSSR`                                                       |
| `@soybeanjs/hono-ssr/types` | TypeScript type declarations                                                 |

> **Important**: `createDefineRoute` must be imported from `@soybeanjs/hono-ssr/route`, **not** from the main entry. Importing from the main entry causes a circular dependency that leads to the SSR error `Cannot access '__vite_ssr_import_1__' before initialization`.

## API Reference

### `HonoSSR(options)`

Vite plugin factory.

```ts
interface HonoSSRPluginOptions<T extends HonoSSRBuildType = HonoSSRBuildType> {
  /** Server entry file @default 'server/app.ts' */
  serverEntry?: string;
  /** Client entry file @default 'app/entry-client.ts' */
  clientEntry?: string;
  /** File-based routing options */
  fileRoute?: HonoSSRFileRouteOptions;
  /** @hono/vite-dev-server options */
  devServer?: DevServerOptions;
  /** Dev server exclude patterns @default [/^\/app\/.+/] */
  devServerExclude?: (string | RegExp)[];
  /** Deployment target */
  buildType?: 'cloudflare-workers' | 'cloudflare-pages' | 'node' | 'bun' | 'deno' | 'vercel' | 'netlify-functions';
  /** Build options forwarded to @hono/vite-build */
  buildOptions?: NodeBuildOptions | BunBuildOptions | CloudflareWorkersBuildOptions | ...;
  /** Cloudflare Platform Proxy options (simulate bindings in dev) */
  platformProxyOptions?: GetPlatformProxyOptions;
}
```

### `setupFileRoutes(options?, onRouteRegister?)`

Scans file-based routes and returns route records.

```ts
function setupFileRoutes<Meta = RouteMeta>(
  options?: SetupFileRoutesOptions,
  onRouteRegister?: (route: RouteRecord<Meta>) => void
): RouteRecord<Meta>[];
```

### `createDefineRoute<Env, Meta>()`

Creates a type-safe route definer.

```ts
const defineRoute = createDefineRoute<{ Bindings: Env }>();

// Supports 1–7 middleware/handler functions
export const GET = defineRoute({
  handlers: [middleware1, middleware2, handler],
  meta: { description: 'Get user list' }
});
```

### Virtual Modules

| Module ID                   | Exports                        | Description                                                                       |
| --------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| `virtual:hono-file-routes`  | `scannedRouteModules`          | File-based route scan results                                                     |
| `virtual:hono-ssr-manifest` | `resolveManifest()`, `default` | SSR asset manifest — returns client entry path in dev, hashed build paths in prod |

## Recommended Project Structure

```
project/
├── app/                    # Client code
│   ├── entry-client.ts     # Client entry
│   ├── main.ts             # App factory
│   └── App.vue             # Root component
├── server/                 # Server code
│   ├── app.ts              # Hono server entry
│   ├── api/                # API routes (auto-scanned)
│   │   ├── users.ts
│   │   └── posts.ts
│   └── routes/             # Page routes (auto-scanned)
│       └── index.tsx
├── vite.config.ts
├── tsconfig.json
└── wrangler.toml           # Cloudflare config
```

## Development

```bash
# Build
pnpm build

# Type check
pnpm typecheck

# Lint & format
pnpm lint
pnpm fmt
```

## License

[MIT](./LICENSE)
