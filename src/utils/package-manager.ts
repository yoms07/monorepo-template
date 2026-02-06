import { execa } from 'execa';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export function normalizePackageManager(input?: string): PackageManager | undefined {
  if (!input) return undefined;
  if (['npm', 'pnpm', 'yarn', 'bun'].includes(input)) {
    return input as PackageManager;
  }
  return undefined;
}

export async function detectPackageManager(): Promise<PackageManager> {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.includes('pnpm')) return 'pnpm';
    if (userAgent.includes('yarn')) return 'yarn';
    if (userAgent.includes('bun')) return 'bun';
  }

  // Default to pnpm for monorepos
  return 'pnpm';
}

export async function installDependencies(cwd: string, pm: PackageManager): Promise<void> {
  await execa(pm, ['install'], { cwd, stdio: 'inherit' });
}

export function getInstallCommand(pm: PackageManager): string {
  return `${pm} install`;
}

export function getDevCommand(pm: PackageManager): string {
  return `${pm} dev`;
}

export function getBuildCommand(pm: PackageManager): string {
  return `${pm} build`;
}
