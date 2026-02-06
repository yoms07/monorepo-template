#!/usr/bin/env node

import { cac } from 'cac';
import { createMonorepo } from './commands/create.js';

const cli = cac('create-monorepo');

cli
  .command('[dir]', 'Create a new monorepo project')
  .option('--backend <framework>', 'Backend framework (hono)')
  .option('--database <db>', 'Database (postgres, mongodb, none)')
  .option('--redis', 'Include Redis cache')
  .option('--smtp', 'Include SMTP email')
  .option('--swagger', 'Include Swagger docs')
  .option('--auth', 'Include JWT authentication')
  .option('--frontend', 'Include Next.js frontend')
  .option('--shadcn', 'Include shadcn/ui components')
  .option('--pm <manager>', 'Package manager (pnpm, npm, yarn, bun)')
  .option('--docker', 'Include Docker Compose setup')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-git', 'Skip git initialization')
  .option('-y, --yes', 'Skip all prompts and use defaults')
  .action(async (dir?: string, options?: any) => {
    await createMonorepo(dir, options);
  });

cli.help();
cli.version('1.2.0');

cli.parse();
