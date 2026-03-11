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

    // Create CLAUDE.md (guidance for Claude Code)
    const tokens = this.getTokens();
    const pm = this.options.packageManager;
    const hasBackend = config.includeBackend;
    const hasFrontend = config.includeFrontend;
    const hasShared = hasBackend && hasFrontend;
    const db = config.backend?.database;
    const hasAuth = config.backend?.includeAuth;
    const hasRedis = config.backend?.includeRedis;

    const claudeMdContent = `# CLAUDE.md — ${tokens.__PROJECT_NAME__}

This file provides guidance to Claude Code when working in this monorepo.

## Project Overview

**${tokens.__PROJECT_NAME__}** is a TypeScript monorepo generated with create-monorepo.

Packages:
${hasBackend ? `- \`packages/api/\` — Hono backend API (port ${tokens.__API_PORT__})\n` : ''}${hasFrontend ? `- \`packages/web/\` — Next.js frontend (port ${tokens.__WEB_PORT__})\n` : ''}${hasShared ? `- \`packages/shared/\` — Shared Zod schemas and TypeScript types\n` : ''}
## Stack

${hasBackend ? `- **Backend**: Hono, TypeScript, Zod${db ? `, Prisma (${db})` : ''}${hasAuth ? ', better-auth' : ''}${hasRedis ? ', Redis' : ''}\n` : ''}${hasFrontend ? `- **Frontend**: Next.js 15 App Router, TanStack Query, Tailwind CSS, shadcn/ui${hasAuth ? ', better-auth client' : ''}\n` : ''}${hasShared ? `- **Shared**: Zod schemas, inferred TypeScript types\n` : ''}- **Package Manager**: ${pm}
- **Monorepo**: pnpm workspaces

## Development Commands

\`\`\`bash
# Run everything
${pm} dev                         # Start all packages in parallel

# Individual packages
${pm} --filter api dev            # Backend only
${pm} --filter web dev            # Frontend only

# Build
${pm} build                       # Build all packages
${pm} --filter shared build       # Build shared first if types changed

# Quality
${pm} typecheck                   # Type-check all packages
${pm} lint                        # Lint all packages
${pm} format                      # Format all packages
\`\`\`

## Package Dependency

\`\`\`
${hasShared ? `packages/shared  ←  packages/api\n                  ←  packages/web` : hasBackend ? 'packages/api' : 'packages/web'}
\`\`\`

${hasShared ? `> Always build \`packages/shared\` first after schema changes: \`${pm} --filter shared build\`\n` : ''}${db ? `\n## Database\n\n- **Provider**: ${db === 'postgres' ? 'PostgreSQL' : 'MongoDB'} via Prisma\n- Schema: \`packages/api/prisma/schema.prisma\`\n\n\`\`\`bash\n${pm} --filter api prisma:generate   # Regenerate Prisma client\n${pm} --filter api prisma:migrate    # Run migrations\n${pm} --filter api prisma:studio     # Open Prisma Studio\n\`\`\`\n` : ''}${hasAuth ? `\n## Authentication\n\nPowered by [better-auth](https://better-auth.com).\n\n- Sessions stored in database, sent as HTTP-only cookies\n- Auth routes handled at \`/api/auth/**\` on the backend\n- Frontend uses \`lib/auth-client.ts\` — no manual token management\n- Required env vars: \`BETTER_AUTH_SECRET\`, \`BETTER_AUTH_URL\`\n\nSee \`packages/api/CLAUDE.md\` for protecting routes.\nSee \`packages/web/CLAUDE.md\` for frontend usage.\n` : ''}
## Environment Setup

\`\`\`bash
cp packages/api/.env.example packages/api/.env
${hasFrontend ? `cp packages/web/.env.example packages/web/.env\n` : ''}\`\`\`

Edit the \`.env\` files before running \`${pm} dev\`.

## Key Files

${hasBackend ? `- \`packages/api/src/index.ts\` — Hono app entry point\n- \`packages/api/src/lib/errors.ts\` — Custom error classes\n- \`packages/api/src/lib/response.ts\` — Response helpers\n` : ''}${hasFrontend ? `- \`packages/web/services/api/client.ts\` — HTTP client\n- \`packages/web/services/api/endpoints.ts\` — API endpoint constants\n- \`packages/web/lib/auth-client.ts\` — better-auth client\n` : ''}${hasShared ? `- \`packages/shared/src/index.ts\` — All shared type exports\n` : ''}
## Per-Package Guidance

Each package has its own \`CLAUDE.md\` with detailed patterns:
${hasBackend ? `- \`packages/api/CLAUDE.md\` — routes, services, middleware, error handling\n` : ''}${hasFrontend ? `- \`packages/web/CLAUDE.md\` — services, hooks, auth, components\n` : ''}${hasShared ? `- \`packages/shared/CLAUDE.md\` — adding schemas and types\n` : ''}`;

    await writeFile(path.join(this.options.projectDir, 'CLAUDE.md'), claudeMdContent);

    // Create README.md
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
