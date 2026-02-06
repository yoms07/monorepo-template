import path from 'path';
import { fileURLToPath } from 'url';
import { BaseGenerator } from './base.generator.js';
import { copyDirRecursive, ensureDir } from '../utils/file-ops.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class SharedGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const sharedDir = path.join(this.options.projectDir, 'packages', 'shared');
    await ensureDir(sharedDir);

    const tokens = this.getTokens();
    const templatePath = path.join(__dirname, '../../templates', 'shared', 'base');

    // Copy base template
    await copyDirRecursive(templatePath, sharedDir, tokens);
  }
}
