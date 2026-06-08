import type { Plugin } from 'vite';
import DevServer, { defaultOptions } from '@hono/vite-dev-server';
import type { Adapter } from '@hono/vite-dev-server/types';
import { interopDefault } from './shared';
import { ClientBuild, ManifestPlugin } from './plugins/client';
import { FileRoutesPlugin } from './plugins/file-route';
import type { HonoSSRPluginOptions, HonoSSRBuildType, HonoAdapterFactory } from './types';

export async function HonoSSR<T extends HonoSSRBuildType = HonoSSRBuildType>(options: HonoSSRPluginOptions<T>) {
  const {
    serverEntry = 'server/app.ts',
    clientEntry = 'app/entry-client.ts',
    fileRoute,
    devServer,
    devServerExclude = [/^\/app\/.+/],
    buildType,
    buildOptions,
    platformProxyOptions = {}
  } = options;

  const HonoBuild = buildType
    ? await interopDefault<(options: any) => Plugin>(import(`@hono/vite-build/${buildType}`))
    : undefined;

  let HonoAdapter: HonoAdapterFactory | undefined;

  if (buildType === 'cloudflare-workers' || buildType === 'cloudflare-pages') {
    const cfAdapter = await interopDefault(import('@hono/vite-dev-server/cloudflare'));
    HonoAdapter = () =>
      cfAdapter({
        proxy: platformProxyOptions
      });
  } else if (buildType === 'bun') {
    HonoAdapter = await interopDefault(import('@hono/vite-dev-server/bun'));
  } else if (buildType === 'node') {
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
