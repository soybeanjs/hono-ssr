import path from 'node:path';
import type { Awaitable } from './types';

const isWindows: boolean = typeof process !== 'undefined' && process.platform === 'win32';

const windowsSlashRE = /\\/g;
export function slash(p: string): string {
  return isWindows ? p.replace(windowsSlashRE, '/') : p;
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

export async function interopDefault<T>(m: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m;
  return (resolved as any).default || resolved;
}

export function normalizeDirs(dirs: string[]) {
  return [...new Set(dirs.map(dir => trimSlashes(normalizePath(dir))).filter(Boolean))];
}

export function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}
