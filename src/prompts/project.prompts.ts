import enquirer from 'enquirer';
import type { PackageManager } from '../utils/package-manager.js';

export async function promptProjectName(defaultName: string = 'my-monorepo'): Promise<string> {
  const { projectName } = await enquirer.prompt<{ projectName: string }>({
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    initial: defaultName,
    validate: (input: string) => {
      if (!input.trim()) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(input)) {
        return 'Project name must be lowercase alphanumeric with hyphens only';
      }
      return true;
    },
  });

  return projectName;
}

export async function promptPackageManager(): Promise<PackageManager> {
  const { packageManager } = await enquirer.prompt<{ packageManager: PackageManager }>({
    type: 'select',
    name: 'packageManager',
    message: 'Select package manager:',
    choices: ['pnpm', 'npm', 'yarn', 'bun'],
    initial: 0, // Default to pnpm
  });

  return packageManager;
}

export async function promptIncludeBackend(): Promise<boolean> {
  const { includeBackend } = await enquirer.prompt<{ includeBackend: boolean }>({
    type: 'confirm',
    name: 'includeBackend',
    message: 'Include backend package?',
    initial: true,
  });

  return includeBackend;
}

export async function promptIncludeFrontend(): Promise<boolean> {
  const { includeFrontend } = await enquirer.prompt<{ includeFrontend: boolean }>({
    type: 'confirm',
    name: 'includeFrontend',
    message: 'Include frontend package?',
    initial: true,
  });

  return includeFrontend;
}
