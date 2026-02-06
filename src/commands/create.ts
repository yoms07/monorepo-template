import path from 'path';
import ora from 'ora';
import { execa } from 'execa';
import { isDirEmpty } from '../utils/file-ops.js';
import { logger } from '../utils/logger.js';
import { installDependencies } from '../utils/package-manager.js';
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

export async function createMonorepo(targetDir?: string): Promise<void> {
  console.log('');
  logger.info('Welcome to create-monorepo!');
  console.log('');

  // Gather project configuration
  const projectName = await promptProjectName(targetDir ? path.basename(targetDir) : undefined);
  const projectDir = path.resolve(process.cwd(), targetDir || projectName);

  // Check if directory is empty
  if (!(await isDirEmpty(projectDir))) {
    logger.error(`Directory "${projectDir}" is not empty. Please choose an empty directory.`);
    process.exit(1);
  }

  const packageManager = await promptPackageManager();
  const includeBackend = await promptIncludeBackend();
  const includeFrontend = await promptIncludeFrontend();

  if (!includeBackend && !includeFrontend) {
    logger.error('You must include at least one package (backend or frontend).');
    process.exit(1);
  }

  const config: ProjectConfig = {
    projectName,
    packageManager,
    includeBackend,
    includeFrontend,
  };

  // Get backend configuration if needed
  if (includeBackend) {
    console.log('');
    logger.info('Configure backend package:');
    config.backend = await promptBackendConfig();
  }

  // Get frontend configuration if needed
  if (includeFrontend) {
    console.log('');
    logger.info('Configure frontend package:');
    config.frontend = await promptFrontendConfig();
  }

  console.log('');
  logger.info('Generating project...');

  try {
    // Generate monorepo structure
    const monorepoGenerator = new MonorepoGenerator({
      projectName,
      projectDir,
      packageManager,
    });

    const spinner = ora('Creating monorepo structure...').start();
    await monorepoGenerator.generate(config);
    spinner.succeed('Monorepo structure created');

    // Generate shared package if both backend and frontend are included
    if (includeBackend && includeFrontend) {
      spinner.start('Generating shared package...');
      const sharedGenerator = new SharedGenerator({
        projectName,
        projectDir,
        packageManager,
      });
      await sharedGenerator.generate();
      spinner.succeed('Shared package generated');
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
      spinner.succeed('Backend package generated');
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
      spinner.succeed('Frontend package generated');
    }

    // Install dependencies
    spinner.start('Installing dependencies...');
    await installDependencies(projectDir, packageManager);
    spinner.succeed('Dependencies installed');

    // Initialize git
    spinner.start('Initializing git repository...');
    await execa('git', ['init'], { cwd: projectDir });
    await execa('git', ['add', '.'], { cwd: projectDir });
    await execa('git', ['commit', '-m', 'Initial commit from create-monorepo'], { cwd: projectDir });
    spinner.succeed('Git repository initialized');

    console.log('');
    logger.success(`Project "${projectName}" created successfully!`);
    console.log('');
    logger.info('Next steps:');
    console.log(`  cd ${targetDir || projectName}`);
    console.log(`  ${packageManager} dev`);
    console.log('');
  } catch (error) {
    logger.error(`Failed to create project: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
