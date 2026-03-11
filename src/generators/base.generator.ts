import type { GeneratorOptions, TemplateTokens } from '../types/index.js';

export abstract class BaseGenerator {
  protected options: GeneratorOptions;

  constructor(options: GeneratorOptions) {
    this.options = options;
  }

  protected getTokens(additionalTokens?: Partial<TemplateTokens>): TemplateTokens {
    const defaultTokens: TemplateTokens = {
      __PROJECT_NAME__: this.options.projectName,
      __PACKAGE_SCOPE__: `@${this.options.projectName}`,
      __DATABASE_PROVIDER__: 'none',
      __PRISMA_PROVIDER__: 'postgresql',
      __HAS_REDIS__: 'false',
      __HAS_SMTP__: 'false',
      __API_PORT__: '3001',
      __WEB_PORT__: '3000',
      __BACKEND_FRAMEWORK__: 'hono',
      __API_URL__: 'http://localhost:3001',
    };

    return { ...defaultTokens, ...additionalTokens } as TemplateTokens;
  }

  abstract generate(...args: any[]): Promise<void>;
}
