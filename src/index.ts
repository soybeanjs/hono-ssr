import type { MiddlewareHandler } from 'hono';
import { scannedRouteModules } from 'virtual:hono-file-routes';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'ALL'] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

export type RouteHandlers = [MiddlewareHandler, ...MiddlewareHandler[]];

export interface RouteMeta {
  [key: string]: any;
}

export interface RouteDefinition<Meta = RouteMeta> {
  handlers: RouteHandlers;
  meta?: Meta;
}

export interface RouteRecord<Meta = RouteMeta> {
  method: HttpMethod;
  path: string;
  source: string;
  group?: string[];
  handlers: RouteHandlers;
  meta?: Meta;
}

export interface SetupFileRoutesOptions<Meta = RouteMeta> {
  /**
   * prefix specifies the prefix for the file-based routes. It is useful when you want to group the file-based routes under a specific path.
   *
   * @default '/api'
   */
  prefix?: string;
  onRouteRegister?: (route: RouteRecord<Meta>) => void;
}

/**
 * setupFileRoutes sets up the file-based routes for Hono SSR. It scans the specified directories for route files and returns the route records.
 * @param options
 * @param onRouteRegister
 */
export function setupFileRoutes<Meta = RouteMeta>(options: SetupFileRoutesOptions<Meta> = {}) {
  const routes = getFilesRoutes<Meta>(options.prefix);

  if (options?.onRouteRegister) {
    for (const route of routes) {
      options.onRouteRegister(route);
    }
  }

  return routes;
}

export function getFilesRoutes<Meta = RouteMeta>($prefix = '/api'): RouteRecord<Meta>[] {
  const routes: RouteRecord<Meta>[] = [];
  const prefix = normalizeRoutePrefix($prefix);

  for (const scannedRoute of scannedRouteModules) {
    const { path, group } = normalizeRoutePath(scannedRoute.source, scannedRoute.scanDir, prefix);

    for (const method of HTTP_METHODS) {
      if (!Object.prototype.hasOwnProperty.call(scannedRoute.module, method)) {
        continue;
      }

      const route = scannedRoute.module[method];

      const { handlers, meta } = resolveRouteDefinition<Meta>(route, {
        method,
        source: scannedRoute.source
      });

      routes.push({
        method,
        path,
        source: scannedRoute.source,
        group,
        handlers,
        meta
      });
    }
  }

  assertNoRouteConflicts(routes);

  return sortRoutes(routes);
}

function sortRoutes<Meta>(routes: RouteRecord<Meta>[]): RouteRecord<Meta>[] {
  return routes.sort((a, b) => {
    // 先按照字母排序, 再按照静态路径优先于动态路径
    if (a.path === b.path) {
      return 0;
    }

    const aSegments = a.path.split('/').filter(Boolean);
    const bSegments = b.path.split('/').filter(Boolean);

    for (let i = 0; i < Math.min(aSegments.length, bSegments.length); i++) {
      const aSegment = aSegments[i];
      const bSegment = bSegments[i];

      const aRank = getSegmentRank(aSegment);
      const bRank = getSegmentRank(bSegment);

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      if (aSegment !== bSegment) {
        return aSegment.localeCompare(bSegment);
      }
    }

    return aSegments.length - bSegments.length;
  });
}

function getSegmentRank(segment: string) {
  if (segment === '*') {
    return 2;
  }

  if (segment.startsWith(':')) {
    return 1;
  }

  return 0;
}

function isRouteDefinition<Meta>(obj: any): obj is RouteDefinition<Meta> {
  return obj && typeof obj === 'object' && isRouteHandlers(obj.handlers);
}

function isRouteHandlers(obj: any): obj is RouteHandlers {
  return Array.isArray(obj) && obj.length > 0;
}

interface RouteExportContext {
  method: HttpMethod;
  source: string;
}

function resolveRouteDefinition<Meta = RouteMeta>(
  exported: RouteDefinition<Meta> | MiddlewareHandler[] | unknown,
  context: RouteExportContext
): RouteDefinition<Meta> {
  if (isRouteDefinition(exported)) {
    return exported as RouteDefinition<Meta>;
  }

  if (isRouteHandlers(exported)) {
    return { handlers: exported };
  }

  throw new TypeError(
    `Invalid route export "${context.method}" in "${context.source}". Expected MiddlewareHandler[] or RouteDefinition.`
  );
}

function assertNoRouteConflicts<Meta>(routes: RouteRecord<Meta>[]) {
  const routeMap = new Map<string, RouteRecord<Meta>>();

  for (const route of routes) {
    const routeKey = `${route.method} ${route.path}`;
    const existingRoute = routeMap.get(routeKey);

    if (existingRoute) {
      throw new Error(
        `Conflicting file routes for "${route.method} ${route.path}": "${existingRoute.source}" and "${route.source}".`
      );
    }

    routeMap.set(routeKey, route);
  }
}

function normalizeRoutePath(source: string, scanDir: string, prefix: string) {
  const relativeSource = getRelativeSource(source, scanDir);
  const sourceWithoutExtension = relativeSource.replace(/\.[^.]+$/, '');
  const rawSegments = sourceWithoutExtension.split('/').filter(Boolean);
  const group: string[] = [];
  const pathSegments = rawSegments.slice(0, -1).flatMap(segment => {
    const matchedGroup = segment.match(/^\(([^/()]+)\)$/);

    if (!matchedGroup) {
      return [segment];
    }

    group.push(matchedGroup[1]);

    return [];
  });
  const fileSegment = rawSegments.at(-1);

  if (fileSegment) {
    pathSegments.push(fileSegment);
  }

  if (pathSegments[pathSegments.length - 1] === 'index') {
    pathSegments.pop();
  }

  const normalizedPath = pathSegments.map(normalizeRouteSegment);
  const routePath = normalizedPath.length ? `/${normalizedPath.join('/')}` : '/';

  return {
    path: joinRoutePath(prefix, routePath),
    group: group.length ? group : undefined
  };
}

function getRelativeSource(source: string, scanDir: string) {
  const prefix = `${scanDir}/`;

  if (source.startsWith(prefix)) {
    return source.slice(prefix.length);
  }

  if (source === scanDir) {
    return '';
  }

  throw new Error(`Scanned route source "${source}" does not match scan dir "${scanDir}".`);
}

function normalizeRouteSegment(segment: string) {
  if (/^\[\[\.\.\..+\]\]$/.test(segment)) {
    return '*';
  }

  if (/^\[\.\.\..+\]$/.test(segment)) {
    return '*';
  }

  return segment.replace(/^\[(.+)\]$/, ':$1');
}

function normalizeRoutePrefix(prefix?: string) {
  if (!prefix || prefix === '/') {
    return '';
  }

  const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;

  return normalizedPrefix.endsWith('/') ? normalizedPrefix.slice(0, -1) : normalizedPrefix;
}

function joinRoutePath(prefix: string, path: string) {
  if (!prefix) {
    return path;
  }

  if (path === '/') {
    return prefix;
  }

  return `${prefix}${path}`;
}
