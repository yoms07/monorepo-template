import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { execa } from 'execa';
import enquirer from 'enquirer';
import { isDirEmpty } from '../utils/file-ops.js';
import { logger } from '../utils/logger.js';
import { installDependencies, detectPackageManager } from '../utils/package-manager.js';
import {
  promptProjectName,
  promptPackageManager,
  promptIncludeBackend,
  promptIncludeFrontend,
} from '../prompts/project.prompts.js';
import { promptBackendConfig } from '../prompts/backend.prompts.js';
import { promptFrontendConfig } from '../prompts/frontend.prompts.js';
import { MonorepoGenerator } from '../generators/monorepo.generator.js';
import { BackendGenerator } from '../generators/backend.generator.js';
import { FrontendGenerator } from '../generators/frontend.generator.js';
import { SharedGenerator } from '../generators/shared.generator.js';
import type { ProjectConfig } from '../types/index.js';
import type { PackageManager } from '../utils/package-manager.js';

interface CliOptions {
  backend?: string;
  database?: string;
  redis?: boolean;
  smtp?: boolean;
  swagger?: boolean;
  auth?: boolean;
  frontend?: boolean;
  shadcn?: boolean;
  pm?: string;
  docker?: boolean;
  skipInstall?: boolean;
  skipGit?: boolean;
  yes?: boolean;
}

function showPreview(config: ProjectConfig): void {
  console.log('');
  console.log(chalk.bold('📦 Project Preview:'));
  console.log('');
  console.log(chalk.cyan(`${config.projectName}/`));
  console.log(chalk.gray('├── packages/'));

  if (config.includeBackend && config.backend) {
    const features = [];
    if (config.backend.database) features.push(config.backend.database.toUpperCase());
    if (config.backend.includeRedis) features.push('Redis');
    if (config.backend.includeSmtp) features.push('SMTP');
    if (config.backend.includeSwagger) features.push('Swagger');
    if (config.backend.includeAuth) features.push('JWT Auth');

    const featureStr = features.length > 0 ? chalk.gray(` (${features.join(', ')})`) : '';
    console.log(chalk.gray(`│   ├── api/`) + chalk.yellow(` ${config.backend.framework}`) + featureStr);
  }

  if (config.includeFrontend && config.frontend) {
    const features = [];
    if (config.frontend.includeShadcn) features.push('shadcn/ui');
    const featureStr = features.length > 0 ? chalk.gray(` (${features.join(', ')})`) : '';
    console.log(chalk.gray(`│   ├── web/`) + chalk.yellow(` Next.js 15`) + featureStr);
  }

  if (config.includeBackend && config.includeFrontend) {
    console.log(chalk.gray(`│   └── shared/`) + chalk.yellow(` Zod schemas + types`));
  }

  console.log(chalk.gray('├── pnpm-workspace.yaml'));
  console.log(chalk.gray('├── package.json'));
  if (config.includeDocker) {
    console.log(chalk.gray('├── docker-compose.yml') + chalk.yellow(' ⚡'));
  }
  console.log(chalk.gray('└── ...'));
  console.log('');
}

async function confirmPreview(): Promise<boolean> {
  const { confirm } = await enquirer.prompt<{ confirm: boolean }>({
    type: 'confirm',
    name: 'confirm',
    message: 'Does this look good?',
    initial: true,
  });
  return confirm;
}

export async function createMonorepo(targetDir?: string, options: CliOptions = {}): Promise<void> {
  console.log('');
  logger.info('Welcome to create-monorepo!');
  console.log('');

  const isInteractive = !options.yes && process.stdin.isTTY;

  try {
    // Gather project configuration
    const projectName = isInteractive
      ? await promptProjectName(targetDir ? path.basename(targetDir) : undefined)
      : targetDir ? path.basename(targetDir) : 'my-monorepo';

    const projectDir = path.resolve(process.cwd(), targetDir || projectName);

    // Check if directory is empty
    if (!(await isDirEmpty(projectDir))) {
      throw new Error(`Directory "${projectDir}" is not empty. Please choose an empty directory.`);
    }

    // Determine package manager
    let packageManager: PackageManager;
    if (options.pm) {
      packageManager = options.pm as PackageManager;
    } else if (isInteractive) {
      packageManager = await promptPackageManager();
    } else {
      packageManager = await detectPackageManager();
    }

    // Determine what to include
    let includeBackend: boolean;
    let includeFrontend: boolean;

    if (options.yes) {
      // Defaults for --yes flag
      includeBackend = options.backend !== undefined || options.database !== undefined;
      includeFrontend = options.frontend === true;

      // If nothing specified, include both
      if (!includeBackend && !includeFrontend) {
        includeBackend = true;
        includeFrontend = true;
      }
    } else if (isInteractive) {
      includeBackend = await promptIncludeBackend();
      includeFrontend = await promptIncludeFrontend();
    } else {
      // Non-interactive but no --yes, include both
      includeBackend = true;
      includeFrontend = true;
    }

    if (!includeBackend && !includeFrontend) {
      throw new Error('You must include at least one package (backend or frontend).');
    }

    const config: ProjectConfig = {
      projectName,
      packageManager,
      includeBackend,
      includeFrontend,
      includeDocker: options.docker,
    };

    // Get backend configuration
    if (includeBackend) {
      if (options.yes || !isInteractive) {
        // Use CLI options or defaults
        config.backend = {
          type: 'web',
          framework: (options.backend as any) || 'hono',
          database: options.database as any,
          includeRedis: options.redis || false,
          includeSmtp: options.smtp || false,
          includeSwagger: options.swagger || false,
          includeAuth: options.auth || false,
        };
      } else {
        console.log('');
        logger.info('Configure backend package:');
        config.backend = await promptBackendConfig();
      }
    }

    // Get frontend configuration
    if (includeFrontend) {
      if (options.yes || !isInteractive) {
        config.frontend = {
          framework: 'nextjs',
          includeShadcn: options.shadcn || false,
          apiUrl: 'http://localhost:3001',
        };
      } else {
        console.log('');
        logger.info('Configure frontend package:');
        config.frontend = await promptFrontendConfig();
      }
    }

    // Show preview if interactive
    if (isInteractive) {
      showPreview(config);
      const confirmed = await confirmPreview();
      if (!confirmed) {
        console.log('');
        logger.info('Cancelled. No files were created.');
        return;
      }
    }

    console.log('');
    logger.info('Generating project...');
    console.log('');

    const spinner = ora();

    // Generate monorepo structure
    spinner.start('Creating monorepo structure...');
    const monorepoGenerator = new MonorepoGenerator({
      projectName,
      projectDir,
      packageManager,
    });
    await monorepoGenerator.generate(config);
    spinner.succeed(chalk.green('Monorepo structure created'));

    // Generate shared package if both backend and frontend are included
    if (includeBackend && includeFrontend) {
      spinner.start('Generating shared package...');
      const sharedGenerator = new SharedGenerator({
        projectName,
        projectDir,
        packageManager,
      });
      await sharedGenerator.generate();
      spinner.succeed(chalk.green('Shared package generated'));
    }

    // Generate backend package
    if (includeBackend && config.backend) {
      spinner.start('Generating backend package...');
      const backendGenerator = new BackendGenerator({
        projectName,
        projectDir,
        packageManager,
        config: config.backend,
      });
      await backendGenerator.generate();
      spinner.succeed(chalk.green(`Backend package generated (${config.backend.framework})`));
    }

    // Generate frontend package
    if (includeFrontend && config.frontend) {
      spinner.start('Generating frontend package...');
      const frontendGenerator = new FrontendGenerator({
        projectName,
        projectDir,
        packageManager,
        config: config.frontend,
      });
      await frontendGenerator.generate();
      spinner.succeed(chalk.green('Frontend package generated (Next.js 15)'));
    }

    // Install dependencies
    if (!options.skipInstall) {
      spinner.start(`Installing dependencies with ${packageManager}...`);
      spinner.text = `Installing dependencies... ${chalk.gray('(this may take a minute)')}`;
      await installDependencies(projectDir, packageManager);
      spinner.succeed(chalk.green('Dependencies installed'));
    } else {
      logger.info(chalk.yellow('⚠ Skipped dependency installation'));
    }

    // Initialize git
    if (!options.skipGit) {
      spinner.start('Initializing git repository...');
      await execa('git', ['init'], { cwd: projectDir });
      await execa('git', ['add', '.'], { cwd: projectDir });
      await execa('git', ['commit', '-m', 'Initial commit from create-monorepo'], { cwd: projectDir });
      spinner.succeed(chalk.green('Git repository initialized'));
    } else {
      logger.info(chalk.yellow('⚠ Skipped git initialization'));
    }

    console.log('');
    logger.success(`${chalk.bold('✨ Project "')}${chalk.bold.cyan(projectName)}${chalk.bold('" created successfully!')}`);
    console.log('');
    logger.info(chalk.bold('Next steps:'));
    console.log(chalk.gray('  $ ') + chalk.cyan(`cd ${targetDir || projectName}`));

    if (options.skipInstall) {
      console.log(chalk.gray('  $ ') + chalk.cyan(`${packageManager} install`));
    }

    console.log(chalk.gray('  $ ') + chalk.cyan(`${packageManager} dev`));
    console.log('');

    if (config.includeDocker) {
      logger.info(chalk.bold('🐳 Docker Compose:'));
      console.log(chalk.gray('  $ ') + chalk.cyan('docker-compose up -d'));
      console.log('');
    }

  } catch (error) {
    console.log('');
    if (error instanceof Error) {
      logger.error(chalk.red(`✖ ${error.message}`));
      if (error.stack && process.env.DEBUG) {
        console.log('');
        console.log(chalk.gray(error.stack));
      }
    } else {
      logger.error(chalk.red(`✖ Failed to create project: ${String(error)}`));
    }
    console.log('');
    process.exit(1);
  }
}
