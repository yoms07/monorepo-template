import path from 'path';
import { fileURLToPath } from 'url';
import { BaseGenerator } from './base.generator.js';
import { copyDirRecursive, ensureDir } from '../utils/file-ops.js';
import { mergeFeature } from '../utils/template-merger.js';
import type { BackendGeneratorOptions } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class BackendGenerator extends BaseGenerator {
  private config: BackendGeneratorOptions['config'];

  constructor(options: BackendGeneratorOptions) {
    super(options);
    this.config = options.config;
  }

  async generate(): Promise<void> {
    const backendDir = path.join(this.options.projectDir, 'packages', 'api');
    await ensureDir(backendDir);

    const tokens = this.getTokens({
      __BACKEND_FRAMEWORK__: this.config.framework,
      __DATABASE_PROVIDER__: this.config.database || 'none',
      __HAS_REDIS__: String(this.config.includeRedis),
      __HAS_SMTP__: String(this.config.includeSmtp),
    });

    // Determine template path based on backend type
    let templatePath: string;
    if (this.config.type === 'web') {
      templatePath = path.join(__dirname, '../../templates', `backend-${this.config.framework}`, 'base');
    } else if (this.config.type === 'worker') {
      templatePath = path.join(__dirname, '../../templates', 'backend-worker', 'base');
    } else {
      templatePath = path.join(__dirname, '../../templates', 'backend-cli', 'base');
    }

    // Copy base template
    await copyDirRecursive(templatePath, backendDir, tokens);

    // Merge features for web backends
    if (this.config.type === 'web') {
      const featuresPath = path.join(__dirname, '../../templates', `backend-${this.config.framework}`, 'features');

      // Add database feature
      if (this.config.database) {
        const dbFeaturePath = path.join(featuresPath, `${this.config.database}-prisma`);
        await mergeFeature(backendDir, dbFeaturePath, tokens);
      }

      // Add Redis feature
      if (this.config.includeRedis) {
        const redisFeaturePath = path.join(featuresPath, 'redis');
        await mergeFeature(backendDir, redisFeaturePath, tokens);
      }

      // Add SMTP feature
      if (this.config.includeSmtp) {
        const smtpFeaturePath = path.join(featuresPath, 'smtp');
        await mergeFeature(backendDir, smtpFeaturePath, tokens);
      }

      // Add Swagger feature
      if (this.config.includeSwagger) {
        const swaggerFeaturePath = path.join(featuresPath, 'swagger');
        await mergeFeature(backendDir, swaggerFeaturePath, tokens);
      }
    }
  }
}
