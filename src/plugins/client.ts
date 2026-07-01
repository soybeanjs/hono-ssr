import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

const VIRTUAL_MANIFEST_ID = 'virtual:hono-ssr-manifest';
const RESOLVED_VIRTUAL_MANIFEST_ID = `\0${VIRTUAL_MANIFEST_ID}`;

async function hasEntryFile(root: string | undefined, entry: string) {
  try {
    await access(path.resolve(root ?? '', entry));
    return true;
  } catch {
    return false;
  }
}

export function ClientBuild(clientEntry: string): Plugin {
  return {
    name: 'hono-ssr:client-build',
    apply: (_config, { command, mode }) => {
      if (command === 'build' && mode === 'client') {
        return true;
      }
      return false;
    },
    config: async config => {
      if (!(await hasEntryFile(config.root, clientEntry))) {
        return undefined;
      }

      return {
        build: {
          rolldownOptions: {
            input: clientEntry
          },
          manifest: true
        }
      };
    }
  };
}

/**
 * 虚拟模块插件：将 client build 产物 manifest.json 通过 virtual:hono-ssr-manifest 暴露给 SSR 端。
 * 消费方直接 `import { resolveManifest } from 'virtual:hono-ssr-manifest'` 即可。
 * 插件在 load 时根据 config.command 判断 dev/build，直接生成对应代码，
 * 无需 import.meta.env.DEV 或全局变量。
 */
export function ManifestPlugin(clientEntry: string): Plugin {
  let config: ResolvedConfig;
  let clientEntryExists = true;

  return {
    name: 'hono-ssr:manifest',
    async configResolved(resolvedConfig) {
      config = resolvedConfig;
      clientEntryExists = await hasEntryFile(config.root, clientEntry);
    },
    resolveId(id) {
      if (id === VIRTUAL_MANIFEST_ID) {
        return RESOLVED_VIRTUAL_MANIFEST_ID;
      }
      return null;
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_MANIFEST_ID) {
        return null;
      }

      if (!clientEntryExists) {
        return [
          `export function resolveManifest() {`,
          `  return { scripts: '', styles: '' };`,
          `}`,
          '',
          `export default {};`
        ].join('\n');
      }

      // 开发环境：直接使用 clientEntry 生成 script 标签
      if (config.command === 'serve') {
        const entrySrc = clientEntry.startsWith('/') ? clientEntry : `/${clientEntry}`;
        return [
          `export function resolveManifest() {`,
          `  return {`,
          `    scripts: '<script type="module" src="${entrySrc}"></script>',`,
          `    styles: ''`,
          `  };`,
          `}`,
          '',
          `export default {};`
        ].join('\n');
      }

      // 生产构建：读取 client build 生成的 manifest.json
      const manifestPath = path.resolve(config.root, 'dist', '.vite', 'manifest.json');
      let manifestJson = '{}';

      try {
        manifestJson = await readFile(manifestPath, 'utf-8');
        JSON.parse(manifestJson); // 校验 JSON 合法性
      } catch {
        // manifest 不存在时降级为空对象
      }

      return [
        `const __manifest__ = ${manifestJson};`,
        '',
        `export function resolveManifest() {`,
        `  var manifest = __manifest__;`,
        `  if (!manifest) {`,
        `    return { scripts: '', styles: '' };`,
        `  }`,
        '',
        `  var entries = Object.values(manifest);`,
        `  var entry = entries.find(function(m) { return m.isEntry; });`,
        `  var scripts = entry ? '<script type="module" crossorigin src="/' + entry.file + '"></script>' : '';`,
        `  var styles = entry && entry.css ? entry.css.map(function(css) { return '<link rel="stylesheet" crossorigin href="/' + css + '">'; }).join('\\n  ') : '';`,
        '',
        `  return { scripts: scripts, styles: styles };`,
        `}`,
        '',
        `export default __manifest__;`
      ].join('\n');
    }
  };
}
