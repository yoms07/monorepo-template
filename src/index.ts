#!/usr/bin/env node

import { cac } from 'cac';
import { createMonorepo } from './commands/create.js';

const cli = cac('create-monorepo');

cli.command('[dir]', 'Create a new monorepo project').action(async (dir?: string) => {
  await createMonorepo(dir);
});

cli.help();
cli.version('0.1.0');

cli.parse();
