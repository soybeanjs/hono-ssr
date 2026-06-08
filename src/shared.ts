import { normalizePath } from 'vite';
import type { Awaitable } from './types';

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
