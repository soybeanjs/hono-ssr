import { access } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import DevServer, { defaultOptions } from '@hono/vite-dev-server';
import type { Adapter } from '@hono/vite-dev-server/types';
import { interopDefault } from './shared';
import { ClientBuild, ManifestPlugin } from './plugins/client';
import { FileRoutesPlugin } from './plugins/file-route';
import type { HonoSSRDevServerOptions, HonoSSRPluginOptions, HonoSSRPlatform, HonoAdapterFactory } from './types';

export async function HonoSSR<T extends HonoSSRPlatform = HonoSSRPlatform>(options: HonoSSRPluginOptions<T>) {
  const {
    serverEntry = 'server/app.ts',
    clientEntry = 'app/entry-client.ts',
    fileRoute,
    devServer,
    devServerExclude = [/^\/app\/.+/],
    platform,
    buildOptions,
    platformProxyOptions = {}
  } = options;
  const { onServerStart, ...resolvedDevServerOptions } = devServer ?? {};

  const HonoBuild = platform
    ? await interopDefault<(options: any) => Plugin>(import(`@hono/vite-build/${platform}`))
    : undefined;

  let HonoAdapter: HonoAdapterFactory | undefined;

  if (platform === 'cloudflare-workers' || platform === 'cloudflare-pages') {
    const cfAdapter = await interopDefault(import('@hono/vite-dev-server/cloudflare'));
    HonoAdapter = () =>
      cfAdapter({
        proxy: platformProxyOptions
      });
  } else if (platform === 'bun') {
    HonoAdapter = await interopDefault(import('@hono/vite-dev-server/bun'));
  } else if (platform === 'node') {
    HonoAdapter = await interopDefault(import('@hono/vite-dev-server/node'));
  }

  let honoAdapterPromise: Promise<Adapter> | Adapter | undefined;
  function getHonoAdapter(): Adapter | Promise<Adapter> {
    honoAdapterPromise ??= HonoAdapter?.();
    return honoAdapterPromise!;
  }

  const plugins: Plugin[] = [
    ValidateServerEntry(serverEntry),
    FileRoutesPlugin(fileRoute),
    ManifestPlugin(clientEntry),
    DevServer({
      ...defaultOptions,
      entry: serverEntry,
      injectClientScript: false,
      adapter: getHonoAdapter,
      ...resolvedDevServerOptions,
      exclude: [...defaultOptions.exclude, ...(devServerExclude ?? []), ...(resolvedDevServerOptions.exclude ?? [])]
    }),
    DevServerStartPlugin({
      serverEntry,
      platform,
      onServerStart
    }),
    ClientBuild(clientEntry)
  ];

  if (HonoBuild) {
    plugins.push(
      HonoBuild({
        entry: serverEntry,
        ...buildOptions
      })
    );
  }

  return plugins;
}

function resolveEntryPath(root: string, entry: string) {
  return path.resolve(root, entry);
}

function DevServerStartPlugin<T extends HonoSSRPlatform = HonoSSRPlatform>(options: {
  serverEntry: string;
  platform?: T;
  onServerStart?: HonoSSRDevServerOptions<T>['onServerStart'];
}): Plugin {
  return {
    name: 'hono-ssr:dev-server-start',
    configureServer(server) {
      if (!options.onServerStart) {
        return;
      }

      let called = false;

      const invoke = () => {
        if (called) {
          return;
        }

        called = true;

        queueMicrotask(() => {
          void options.onServerStart?.({
            server,
            resolvedUrls: server.resolvedUrls,
            serverEntry: options.serverEntry,
            platform: options.platform
          });
        });
      };

      if (server.httpServer?.listening) {
        invoke();
        return;
      }

      server.httpServer?.once('listening', invoke);
    }
  };
}

function ValidateServerEntry(serverEntry: string): Plugin {
  return {
    name: 'hono-ssr:validate-server-entry',
    enforce: 'pre',
    async configResolved(config) {
      const serverEntryPath = resolveEntryPath(config.root, serverEntry);

      try {
        await access(serverEntryPath);
      } catch {
        throw new Error(`[hono-ssr] serverEntry "${serverEntry}" was not found: ${serverEntryPath}`);
      }
    }
  };
}
