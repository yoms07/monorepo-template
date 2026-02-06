import type { PackageManager } from '../utils/package-manager.js';

export interface ProjectConfig {
  projectName: string;
  packageManager: PackageManager;
  includeBackend: boolean;
  includeFrontend: boolean;
  backend?: BackendConfig;
  frontend?: FrontendConfig;
}

export interface BackendConfig {
  type: 'web' | 'worker' | 'cli';
  framework: 'hono' | 'tsoa';
  database?: 'postgres' | 'mongodb' | 'none';
  includeRedis: boolean;
  includeSmtp: boolean;
  includeSwagger: boolean;
}

export interface FrontendConfig {
  framework: 'nextjs';
  includeShadcn: boolean;
  apiUrl: string;
}

export interface GeneratorOptions {
  projectName: string;
  projectDir: string;
  packageManager: PackageManager;
}

export interface BackendGeneratorOptions extends GeneratorOptions {
  config: BackendConfig;
}

export interface FrontendGeneratorOptions extends GeneratorOptions {
  config: FrontendConfig;
}

export interface TemplateTokens {
  __PROJECT_NAME__: string;
  __PACKAGE_SCOPE__: string;
  __DATABASE_PROVIDER__: string;
  __HAS_REDIS__: string;
  __HAS_SMTP__: string;
  __API_PORT__: string;
  __WEB_PORT__: string;
  __BACKEND_FRAMEWORK__: string;
  __API_URL__: string;
  [key: string]: string;
}
