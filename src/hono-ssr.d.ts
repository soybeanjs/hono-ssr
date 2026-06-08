declare module 'virtual:hono-file-routes' {
  export interface ScannedRouteModule {
    source: string;
    scanDir: string;
    module: Record<string, unknown>;
  }

  export const scannedRouteModules: ScannedRouteModule[];
}

declare module 'virtual:hono-ssr-manifest' {
  interface ManifestEntry {
    file: string;
    css?: string[];
    isEntry?: boolean;
  }

  export function resolveManifest(): { scripts: string; styles: string };

  const manifest: Record<string, ManifestEntry>;
  export default manifest;
}
