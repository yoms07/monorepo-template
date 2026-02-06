import path from 'path';
import { fileURLToPath } from 'url';
import { BaseGenerator } from './base.generator.js';
import { copyDirRecursive, ensureDir } from '../utils/file-ops.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get package root directory (works both in dev and when published)
const getPackageRoot = () => {
  // In production (npm): __dirname is /path/to/node_modules/@yoms/create-monorepo/dist
  // In dev: __dirname is /path/to/project/dist
  const dirname = __dirname;

  // Go up from dist/ to package root
  return path.resolve(dirname, '..');
};

export class SharedGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const sharedDir = path.join(this.options.projectDir, 'packages', 'shared');
    await ensureDir(sharedDir);

    const tokens = this.getTokens();
    const packageRoot = getPackageRoot();
    const templatePath = path.join(packageRoot, 'templates', 'shared', 'base');

    // Copy base template
    await copyDirRecursive(templatePath, sharedDir, tokens);
  }
}
