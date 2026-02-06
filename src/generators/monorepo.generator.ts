import path from 'path';
import { fileURLToPath } from 'url';
import { BaseGenerator } from './base.generator.js';
import { ensureDir, writeFile, readFile } from '../utils/file-ops.js';
import type { ProjectConfig } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getPackageRoot = () => {
  const dirname = __dirname;
  return path.resolve(dirname, '..');
};

export class MonorepoGenerator extends BaseGenerator {
  async generate(config: ProjectConfig): Promise<void> {
    await ensureDir(this.options.projectDir);
    await this.createRootFiles(config);
    await this.createPackagesDirectory();

    if (config.includeDocker) {
      await this.createDockerCompose(config);
    }
  }

  private async createRootFiles(config: ProjectConfig): Promise<void> {
    // Create pnpm-workspace.yaml
    const workspaceContent = `packages:
  - 'packages/*'
`;
    await writeFile(path.join(this.options.projectDir, 'pnpm-workspace.yaml'), workspaceContent);

    // Create root package.json
    const packageJson = {
      name: this.options.projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: `${this.options.packageManager} --parallel -r dev`,
        build: `${this.options.packageManager} --parallel -r build`,
        typecheck: `${this.options.packageManager} --parallel -r typecheck`,
        lint: `${this.options.packageManager} --parallel -r lint`,
        format: `${this.options.packageManager} --parallel -r format`,
      },
      devDependencies: {
        typescript: '^5.7.2',
        prettier: '^3.4.2',
      },
    };

    await writeFile(
      path.join(this.options.projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create .gitignore
    const gitignoreContent = `# Dependencies
node_modules/
pnpm-lock.yaml
yarn.lock
package-lock.json

# Build outputs
dist/
.next/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Testing
coverage/

# Misc
.cache/
temp/
tmp/
`;
    await writeFile(path.join(this.options.projectDir, '.gitignore'), gitignoreContent);

    // Create README.md
    const tokens = this.getTokens();
    const readmeContent = `# ${tokens.__PROJECT_NAME__}

Generated with create-monorepo.

## Getting Started

Install dependencies:

\`\`\`bash
${this.options.packageManager} install
\`\`\`

Run in development mode:

\`\`\`bash
${this.options.packageManager} dev
\`\`\`

Build for production:

\`\`\`bash
${this.options.packageManager} build
\`\`\`

## Project Structure

\`\`\`
${tokens.__PROJECT_NAME__}/
├── packages/
${config.includeBackend ? '│   ├── api/         # Backend API\n' : ''}${config.includeFrontend ? '│   ├── web/         # Frontend application\n' : ''}${config.includeBackend && config.includeFrontend ? '│   └── shared/      # Shared types and utilities\n' : ''}└── ...
\`\`\`

## Available Scripts

- \`${this.options.packageManager} dev\` - Start all packages in development mode
- \`${this.options.packageManager} build\` - Build all packages
- \`${this.options.packageManager} typecheck\` - Type-check all packages
- \`${this.options.packageManager} lint\` - Lint all packages
- \`${this.options.packageManager} format\` - Format all packages with Prettier
`;
    await writeFile(path.join(this.options.projectDir, 'README.md'), readmeContent);

    // Create tsconfig.base.json
    const tsconfigBase = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022'],
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        allowJs: true,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
      },
    };

    await writeFile(
      path.join(this.options.projectDir, 'tsconfig.base.json'),
      JSON.stringify(tsconfigBase, null, 2)
    );
  }

  private async createPackagesDirectory(): Promise<void> {
    await ensureDir(path.join(this.options.projectDir, 'packages'));
  }

  private async createDockerCompose(config: ProjectConfig): Promise<void> {
    const packageRoot = getPackageRoot();
    const templatePath = path.join(packageRoot, 'templates', 'docker-compose.yml');
    const template = await readFile(templatePath);

    // Determine which services to include
    const hasPostgres = config.backend?.database === 'postgres';
    const hasMongodb = config.backend?.database === 'mongodb';
    const hasRedis = config.backend?.includeRedis || false;
    const hasSmtp = config.backend?.includeSmtp || false;

    // Process conditional lines
    let content = template
      .split('\n')
      .filter((line) => {
        if (line.includes('__IF_POSTGRES__')) return hasPostgres;
        if (line.includes('__IF_MONGODB__')) return hasMongodb;
        if (line.includes('__IF_REDIS__')) return hasRedis;
        if (line.includes('__IF_SMTP__')) return hasSmtp;
        return true;
      })
      .map((line) => {
        return line
          .replace(/__IF_POSTGRES__/g, '')
          .replace(/__IF_MONGODB__/g, '')
          .replace(/__IF_REDIS__/g, '')
          .replace(/__IF_SMTP__/g, '');
      })
      .join('\n');

    // Replace tokens
    const tokens = this.getTokens();
    for (const [token, value] of Object.entries(tokens)) {
      content = content.replace(new RegExp(token, 'g'), value);
    }

    await writeFile(path.join(this.options.projectDir, 'docker-compose.yml'), content);
  }
}
