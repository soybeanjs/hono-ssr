# @soybeanjs/hono-ssr

<p align="center">
  <strong>Hono SSR Vite 插件 — 开箱即用的全栈 SSR 方案</strong>
</p>

<p align="center">
  文件路由 · 类型安全 · 多平台部署 · 开发体验优先
</p>

---

中文 | [English](./README.en.md)

## 简介

`@soybeanjs/hono-ssr` 是一个为 [Hono](https://hono.dev) 框架设计的 Vite SSR 插件，提供开箱即用的全栈开发体验。它整合了 **文件路由**、**客户端构建**、**SSR Manifest 管理**、**多平台部署适配** 等能力，让你可以专注于业务逻辑而非构建配置。

### 特性

- 🗂️ **文件路由** — 基于文件系统的 API 路由，自动扫描 `server/api/` 和 `server/routes/` 目录
- 🔒 **类型安全路由定义** — 通过 `createDefineRoute()` 获得完整的类型推断和校验
- 🏗️ **客户端/服务端双构建** — 自动处理 client bundle 和 server bundle，生成 manifest.json
- 🎯 **虚拟模块 Manifest** — `virtual:hono-ssr-manifest` 在构建时内联资源清单，开发/生产环境自动切换
- ☁️ **多平台支持** — Cloudflare Workers / Pages、Node.js、Bun、Deno、Vercel、Netlify
- 🔥 **HMR 开发服务器** — 基于 `@hono/vite-dev-server`，支持 Cloudflare 绑定模拟

### 安装

```bash
pnpm add @soybeanjs/hono-ssr
```

需要安装 peer dependencies：

```bash
pnpm add hono vite
```

### 快速开始

#### 1. 配置 Vite 插件

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { HonoSSR } from '@soybeanjs/hono-ssr/vite';

export default defineConfig({
  plugins: [
    HonoSSR({
      serverEntry: 'server/app.ts', // 服务端入口（默认）
      clientEntry: 'app/entry-client.ts', // 客户端入口（默认）
      buildType: 'cloudflare-workers' // 部署目标
    })
  ]
});
```

#### 2. 编写服务端入口

```ts
// server/app.ts
import { Hono } from 'hono';
import { setupFileRoutes } from '@soybeanjs/hono-ssr';
import { resolveManifest } from 'virtual:hono-ssr-manifest';

const app = new Hono();

// 注册文件路由
setupFileRoutes({
  prefix: '/api',
  onRouteRegister: route => {
    app.on(route.method, route.path, ...route.handlers);
  }
});

// 根据路由元数据进行文件路由注册
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

// SSR 渲染
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

#### 3. 创建 API 路由

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
      // ... 创建用户
      return c.json({ id: 1, name }, 201);
    }
  ]
});
```

#### 4. 创建客户端入口

```ts
// app/entry-client.ts
import { createApp } from './main';

const app = createApp();
app.mount('#app');
```

### 导出路径

| 路径                        | 说明                                                          |
| --------------------------- | ------------------------------------------------------------- |
| `@soybeanjs/hono-ssr`       | 主入口：`setupFileRoutes`、`getFilesRoutes`、类型定义         |
| `@soybeanjs/hono-ssr/route` | 路由工具：`createDefineRoute`（**路由文件中必须使用此路径**） |
| `@soybeanjs/hono-ssr/vite`  | Vite 插件：`HonoSSR`                                          |
| `@soybeanjs/hono-ssr/types` | TypeScript 类型声明                                           |

> **注意**：`createDefineRoute` 必须从 `@soybeanjs/hono-ssr/route` 导入，**不要**从主入口导入，否则会产生循环依赖导致 SSR 报错 `Cannot access '__vite_ssr_import_1__' before initialization`。

### API 参考

#### `HonoSSR(options)`

Vite 插件工厂函数。

```ts
interface HonoSSRPluginOptions<T extends HonoSSRBuildType = HonoSSRBuildType> {
  /** 服务端入口文件 @default 'server/app.ts' */
  serverEntry?: string;
  /** 客户端入口文件 @default 'app/entry-client.ts' */
  clientEntry?: string;
  /** 文件路由配置 */
  fileRoute?: HonoSSRFileRouteOptions;
  /** @hono/vite-dev-server 的配置 */
  devServer?: DevServerOptions;
  /** Dev Server 排除模式 @default [/^\/app\/.+/] */
  devServerExclude?: (string | RegExp)[];
  /** 部署目标 */
  buildType?: 'cloudflare-workers' | 'cloudflare-pages' | 'node' | 'bun' | 'deno' | 'vercel' | 'netlify-functions';
  /** 传递给 @hono/vite-build 的构建配置 */
  buildOptions?: NodeBuildOptions | BunBuildOptions | CloudflareWorkersBuildOptions | ...;
  /** Cloudflare Platform Proxy 配置（开发模式模拟绑定） */
  platformProxyOptions?: GetPlatformProxyOptions;
}
```

#### `setupFileRoutes(options?, onRouteRegister?)`

扫描并返回文件路由记录。

```ts
function setupFileRoutes<Meta = RouteMeta>(
  options?: SetupFileRoutesOptions,
  onRouteRegister?: (route: RouteRecord<Meta>) => void
): RouteRecord<Meta>[];
```

#### `createDefineRoute<Env, Meta>()`

创建类型安全的路由定义器。

```ts
const defineRoute = createDefineRoute<{ Bindings: Env }>();

// 支持 1–7 个中间件处理函数
export const GET = defineRoute({
  handlers: [middleware1, middleware2, handler],
  meta: { description: 'Get user list' }
});
```

#### 虚拟模块

| 模块 ID                     | 导出                           | 说明                                                      |
| --------------------------- | ------------------------------ | --------------------------------------------------------- |
| `virtual:hono-file-routes`  | `scannedRouteModules`          | 文件路由扫描结果                                          |
| `virtual:hono-ssr-manifest` | `resolveManifest()`, `default` | SSR 资源清单，dev 返回 client 入口，prod 返回构建产物路径 |

### 项目结构建议

```
project/
├── app/                    # 客户端代码
│   ├── entry-client.ts     # 客户端入口
│   ├── main.ts             # 应用工厂
│   └── App.vue             # 根组件
├── server/                 # 服务端代码
│   ├── app.ts              # Hono 服务端入口
│   ├── api/                # API 路由（自动扫描）
│   │   ├── users.ts
│   │   └── posts.ts
│   └── routes/             # 页面路由（自动扫描）
│       └── index.tsx
├── vite.config.ts
├── tsconfig.json
└── wrangler.toml           # Cloudflare 配置
```

### 开发

```bash
# 构建
pnpm build

# 类型检查
pnpm typecheck

# 代码检查与格式化
pnpm lint
pnpm fmt
```

### License

[MIT](./LICENSE)
