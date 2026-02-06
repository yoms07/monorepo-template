#!/usr/bin/env tsx
/**
 * Test script to generate a project and validate it works
 * Usage: pnpm test:generate
 */

import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import picocolors from 'picocolors';

const TEST_DIR = '/tmp/create-monorepo-test';
const CLI_PATH = path.join(process.cwd(), 'src/index.ts');

async function main() {
  console.log(picocolors.blue('🧪 Testing create-monorepo CLI\n'));

  // Clean up previous test
  if (await fs.pathExists(TEST_DIR)) {
    console.log(picocolors.gray('Cleaning up previous test...'));
    await fs.remove(TEST_DIR);
  }

  // Create test directory
  await fs.ensureDir(TEST_DIR);

  console.log(picocolors.yellow('📦 Generating test project...'));
  console.log(picocolors.gray(`Directory: ${TEST_DIR}\n`));

  try {
    // Run the CLI (this will prompt for input in interactive mode)
    // For automated testing, you'd need to provide inputs programmatically
    await execa('tsx', [CLI_PATH, 'test-project'], {
      cwd: TEST_DIR,
      stdio: 'inherit',
    });

    console.log(picocolors.green('\n✅ Project generated successfully!\n'));

    const projectDir = path.join(TEST_DIR, 'test-project');

    // Validate the generated project
    console.log(picocolors.yellow('🔍 Validating generated project...\n'));

    // Check if key files exist
    const requiredFiles = [
      'package.json',
      'pnpm-workspace.yaml',
      'tsconfig.base.json',
      '.gitignore',
      'README.md',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(projectDir, file);
      if (!(await fs.pathExists(filePath))) {
        throw new Error(`Missing required file: ${file}`);
      }
      console.log(picocolors.green(`✓ ${file}`));
    }

    // Check packages directory
    const packagesDir = path.join(projectDir, 'packages');
    if (!(await fs.pathExists(packagesDir))) {
      throw new Error('Missing packages directory');
    }
    console.log(picocolors.green('✓ packages/'));

    const packages = await fs.readdir(packagesDir);
    for (const pkg of packages) {
      console.log(picocolors.green(`  ✓ packages/${pkg}/`));
    }

    console.log(picocolors.green('\n✅ All validations passed!\n'));

    // Optional: Try to install and build (uncomment to test)
    const shouldBuild = process.argv.includes('--build');
    if (shouldBuild) {
      console.log(picocolors.yellow('📦 Installing dependencies...\n'));
      await execa('pnpm', ['install'], {
        cwd: projectDir,
        stdio: 'inherit',
      });

      console.log(picocolors.yellow('\n🔨 Building project...\n'));
      await execa('pnpm', ['build'], {
        cwd: projectDir,
        stdio: 'inherit',
      });

      console.log(picocolors.green('\n✅ Build successful!\n'));
    } else {
      console.log(picocolors.gray('💡 Tip: Run with --build to test installation and build\n'));
    }

    console.log(picocolors.blue('📁 Test project location:'));
    console.log(picocolors.gray(`   ${projectDir}\n`));

    console.log(picocolors.green('✨ All tests passed!\n'));
  } catch (error) {
    console.error(picocolors.red('\n❌ Test failed:'), error);
    process.exit(1);
  }
}

main();
