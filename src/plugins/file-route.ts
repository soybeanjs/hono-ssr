import { extname, relative } from 'node:path';
import { normalizePath } from 'vite';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { glob } from 'tinyglobby';
import { normalizeDirs } from '../shared';
import type { HonoSSRFileRouteOptions, ScannedRouteModule } from '../types';

const DEFAULT_FILE_ROUTE_SCAN_DIRS = ['server/api', 'server/routes'] as const;

const DEFAULT_IGNORE = ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'];

const VIRTUAL_FILE_ROUTES_MODULE_ID = 'virtual:hono-file-routes';

const RESOLVED_VIRTUAL_FILE_ROUTES_MODULE_ID = `\0${VIRTUAL_FILE_ROUTES_MODULE_ID}`;

const ROUTE_FILE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.tsx', '.jsx']);

const ROUTE_FILE_GLOB = '**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}';

export function FileRoutesPlugin(options?: HonoSSRFileRouteOptions): Plugin {
  const { ignore = [] } = options || {};

  const scanDirs = normalizeDirs(options?.scanDirs ?? [...DEFAULT_FILE_ROUTE_SCAN_DIRS]);

  let config: ResolvedConfig;

  return {
    name: 'hono-ssr:file-routes',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    resolveId(id) {
      if (id === VIRTUAL_FILE_ROUTES_MODULE_ID) {
        return RESOLVED_VIRTUAL_FILE_ROUTES_MODULE_ID;
      }

      return null;
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_FILE_ROUTES_MODULE_ID) {
        return null;
      }

      const files = await scanRouteModules(config.root, scanDirs, ignore);

      return generateRouteModule(files);
    },
    handleHotUpdate(ctx) {
      if (!isScannedRouteFile(ctx.file, config.root, scanDirs)) {
        return;
      }

      invalidateRouteModule(ctx.server);
    }
  };
}

async function scanRouteModules(root: string, scanDirs: string[], ignore: string[]): Promise<ScannedRouteModule[]> {
  const patterns = scanDirs.map(scanDir => `${scanDir}/${ROUTE_FILE_GLOB}`);
  const sources = await glob(patterns, {
    cwd: root,
    ignore: [...DEFAULT_IGNORE, ...ignore],
    onlyFiles: true
  });

  return [...new Set(sources.map(source => normalizePath(source)))]
    .sort((a, b) => a.localeCompare(b))
    .map(source => ({
      source,
      scanDir: resolveScanDir(source, scanDirs)
    }));
}

function resolveScanDir(source: string, scanDirs: string[]) {
  const matchedScanDirs = scanDirs.filter(scanDir => source === scanDir || source.startsWith(`${scanDir}/`));

  if (!matchedScanDirs.length) {
    throw new Error(`Scanned route source "${source}" does not match any configured scan dir.`);
  }

  return matchedScanDirs.sort((a, b) => b.length - a.length)[0];
}

function generateRouteModule(files: ScannedRouteModule[]) {
  if (!files.length) {
    return 'export const scannedRouteModules = [];\n';
  }

  const imports = files
    .map((file, index) => `import * as routeModule${index} from ${JSON.stringify(`/${file.source}`)};`)
    .join('\n');

  const records = files
    .map(
      (file, index) =>
        `  { source: ${JSON.stringify(file.source)}, scanDir: ${JSON.stringify(file.scanDir)}, module: routeModule${index} }`
    )
    .join(',\n');

  return `${imports}\n\nexport const scannedRouteModules = [\n${records}\n];\n`;
}

function hasRouteFileExtension(file: string) {
  return ROUTE_FILE_EXTENSIONS.has(extname(file));
}

function isScannedRouteFile(file: string, root: string, scanDirs: string[]) {
  if (!hasRouteFileExtension(file)) {
    return false;
  }

  const relativeFile = normalizePath(relative(root, file));

  return scanDirs.some(scanDir => relativeFile === scanDir || relativeFile.startsWith(`${scanDir}/`));
}

function invalidateRouteModule(server: ViteDevServer) {
  const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_FILE_ROUTES_MODULE_ID);

  if (module) {
    server.moduleGraph.invalidateModule(module);
  }
}
