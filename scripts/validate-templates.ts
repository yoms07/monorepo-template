#!/usr/bin/env tsx
/**
 * Validate that all templates are correctly structured
 * Usage: pnpm test:validate
 */

import fs from 'fs-extra';
import path from 'path';
import picocolors from 'picocolors';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');

interface ValidationError {
  template: string;
  error: string;
}

const errors: ValidationError[] = [];

async function validateTemplate(templatePath: string, templateName: string) {
  console.log(picocolors.blue(`\n📋 Validating ${templateName}...`));

  // Check base directory exists
  const basePath = path.join(templatePath, 'base');
  if (!(await fs.pathExists(basePath))) {
    errors.push({
      template: templateName,
      error: 'Missing base directory',
    });
    console.log(picocolors.red(`  ✗ Missing base directory`));
    return;
  }
  console.log(picocolors.green(`  ✓ base/ exists`));

  // Check package.json exists in base
  const packageJsonPath = path.join(basePath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    errors.push({
      template: templateName,
      error: 'Missing package.json in base',
    });
    console.log(picocolors.red(`  ✗ Missing package.json`));
  } else {
    console.log(picocolors.green(`  ✓ package.json exists`));

    // Validate package.json is valid JSON
    try {
      const packageJson = await fs.readJson(packageJsonPath);
      console.log(picocolors.green(`  ✓ package.json is valid JSON`));

      // Check for required tokens
      const packageContent = JSON.stringify(packageJson);
      if (packageContent.includes('__PACKAGE_SCOPE__')) {
        console.log(picocolors.green(`  ✓ Uses __PACKAGE_SCOPE__ token`));
      }
    } catch (err) {
      errors.push({
        template: templateName,
        error: 'Invalid package.json',
      });
      console.log(picocolors.red(`  ✗ Invalid package.json: ${err}`));
    }
  }

  // Check tsconfig.json exists
  const tsconfigPath = path.join(basePath, 'tsconfig.json');
  if (!(await fs.pathExists(tsconfigPath))) {
    errors.push({
      template: templateName,
      error: 'Missing tsconfig.json in base',
    });
    console.log(picocolors.red(`  ✗ Missing tsconfig.json`));
  } else {
    console.log(picocolors.green(`  ✓ tsconfig.json exists`));

    // Validate tsconfig.json is valid JSON
    try {
      await fs.readJson(tsconfigPath);
      console.log(picocolors.green(`  ✓ tsconfig.json is valid JSON`));
    } catch (err) {
      errors.push({
        template: templateName,
        error: 'Invalid tsconfig.json',
      });
      console.log(picocolors.red(`  ✗ Invalid tsconfig.json: ${err}`));
    }
  }

  // Check for features directory
  const featuresPath = path.join(templatePath, 'features');
  if (await fs.pathExists(featuresPath)) {
    console.log(picocolors.green(`  ✓ features/ exists`));

    const features = await fs.readdir(featuresPath);
    for (const feature of features) {
      const featurePath = path.join(featuresPath, feature);
      const stat = await fs.stat(featurePath);

      if (stat.isDirectory()) {
        console.log(picocolors.blue(`    Checking feature: ${feature}`));

        // Check for package-additions.json
        const packageAdditionsPath = path.join(featurePath, 'package-additions.json');
        if (await fs.pathExists(packageAdditionsPath)) {
          try {
            await fs.readJson(packageAdditionsPath);
            console.log(picocolors.green(`      ✓ package-additions.json is valid`));
          } catch (err) {
            errors.push({
              template: `${templateName}/features/${feature}`,
              error: 'Invalid package-additions.json',
            });
            console.log(picocolors.red(`      ✗ Invalid package-additions.json`));
          }
        }

        // Check for env-additions.txt
        const envAdditionsPath = path.join(featurePath, 'env-additions.txt');
        if (await fs.pathExists(envAdditionsPath)) {
          console.log(picocolors.green(`      ✓ env-additions.txt exists`));
        }

        // Check for src directory
        const srcPath = path.join(featurePath, 'src');
        if (await fs.pathExists(srcPath)) {
          console.log(picocolors.green(`      ✓ src/ exists`));
        }
      }
    }
  }
}

async function main() {
  console.log(picocolors.blue('🔍 Validating templates...\n'));

  // Get all template directories
  const templates = await fs.readdir(TEMPLATES_DIR);

  for (const template of templates) {
    const templatePath = path.join(TEMPLATES_DIR, template);
    const stat = await fs.stat(templatePath);

    if (stat.isDirectory()) {
      await validateTemplate(templatePath, template);
    }
  }

  // Summary
  console.log(picocolors.blue('\n' + '='.repeat(50)));
  if (errors.length === 0) {
    console.log(picocolors.green('\n✅ All templates are valid!\n'));
  } else {
    console.log(picocolors.red(`\n❌ Found ${errors.length} errors:\n`));
    for (const error of errors) {
      console.log(picocolors.red(`  • ${error.template}: ${error.error}`));
    }
    console.log();
    process.exit(1);
  }
}

main();
