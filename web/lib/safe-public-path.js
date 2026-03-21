import { relative, resolve } from 'node:path';

export function safePublicPath(urlPath, publicRoot) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  } catch {
    return null;
  }
  const pathFromUrl = decoded === '/' ? 'index.html' : decoded.replace(/^\//, '');
  const segments = pathFromUrl.split('/').filter((s) => s !== '' && s !== '.');
  const candidate = resolve(publicRoot, ...segments);
  const rel = relative(publicRoot, candidate);
  if (rel.startsWith('..') || rel === '') {
    return null;
  }
  return candidate;
}
