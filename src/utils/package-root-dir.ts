import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getPackageRootDir() {
  if (typeof __dirname !== 'undefined') {
    return path.resolve(__dirname, '..');
  }

  const __filename = fileURLToPath(import.meta.url);
  const metaDirname = path.dirname(__filename);
  return path.resolve(metaDirname, '..');
}
