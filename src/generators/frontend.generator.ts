import path from 'path';
import { fileURLToPath } from 'url';
import { BaseGenerator } from './base.generator.js';
import { copyDirRecursive, ensureDir } from '../utils/file-ops.js';
import type { FrontendGeneratorOptions } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get package root directory (works both in dev and when published)
const getPackageRoot = () => {
  const dirname = __dirname;
  return path.resolve(dirname, '..');
};

export class FrontendGenerator extends BaseGenerator {
  private config: FrontendGeneratorOptions['config'];

  constructor(options: FrontendGeneratorOptions) {
    super(options);
    this.config = options.config;
  }

  async generate(): Promise<void> {
    const frontendDir = path.join(this.options.projectDir, 'packages', 'web');
    await ensureDir(frontendDir);

    const tokens = this.getTokens({
      __API_URL__: this.config.apiUrl,
    });

    const packageRoot = getPackageRoot();
    const templatePath = path.join(packageRoot, 'templates', 'frontend-nextjs', 'base');

    // Copy base template
    await copyDirRecursive(templatePath, frontendDir, tokens);

    // TODO: In Phase 5, add shadcn component installation if config.includeShadcn
  }
}
