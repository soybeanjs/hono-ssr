import { defineConfig } from 'vite-plus';
import { lint, fmt } from '@soybeanjs/oxc-config';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  fmt,
  lint,
  pack: {
    entry: ['src/index.ts', 'src/route.ts', 'src/vite.ts', 'src/hono-ssr.d.ts'],
    platform: 'neutral',
    deps: {
      neverBundle: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies),
        '@hono/vite-dev-server/cloudflare',
        '@hono/vite-dev-server/bun',
        '@hono/vite-dev-server/node',
        'node:path',
        'node:fs/promises',
        'virtual:hono-file-routes'
      ],
      skipNodeModulesBundle: true
    },
    clean: true,
    dts: true,
    sourcemap: false,
    minify: false
  }
});
