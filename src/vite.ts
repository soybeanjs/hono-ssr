import type { Plugin } from 'vite';
import DevServer, { defaultOptions } from '@hono/vite-dev-server';
import type { Adapter } from '@hono/vite-dev-server/types';
import { interopDefault } from './shared';
import { ClientBuild, ManifestPlugin } from './plugins/client';
import { FileRoutesPlugin } from './plugins/file-route';
import type { HonoSSRPluginOptions, HonoSSRPlatform, HonoAdapterFactory } from './types';

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
    FileRoutesPlugin(fileRoute),
    ManifestPlugin(clientEntry),
    DevServer({
      ...defaultOptions,
      entry: serverEntry,
      injectClientScript: false,
      adapter: getHonoAdapter,
      ...devServer,
      exclude: [...defaultOptions.exclude, ...(devServerExclude ?? []), ...(devServer?.exclude ?? [])]
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
