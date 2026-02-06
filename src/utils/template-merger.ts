import fs from 'fs-extra';
import path from 'path';
import { copyDirRecursive, writeFile, readFile } from './file-ops.js';

export interface FeatureAdditions {
  packageAdditions?: Record<string, string>;
  envAdditions?: string[];
}

export async function mergeFeature(
  baseDir: string,
  featurePath: string,
  tokens?: Record<string, string>
): Promise<void> {
  const featureSrcPath = path.join(featurePath, 'src');
  const featurePrismaPath = path.join(featurePath, 'prisma');

  // Copy feature source files
  if (await fs.pathExists(featureSrcPath)) {
    await copyDirRecursive(featureSrcPath, path.join(baseDir, 'src'), tokens);
  }

  // Copy Prisma files if they exist
  if (await fs.pathExists(featurePrismaPath)) {
    await copyDirRecursive(featurePrismaPath, path.join(baseDir, 'prisma'), tokens);
  }

  // Merge package.json additions
  const packageAdditionsPath = path.join(featurePath, 'package-additions.json');
  if (await fs.pathExists(packageAdditionsPath)) {
    await mergePackageJson(baseDir, packageAdditionsPath);
  }

  // Merge .env additions
  const envAdditionsPath = path.join(featurePath, 'env-additions.txt');
  if (await fs.pathExists(envAdditionsPath)) {
    await mergeEnvFile(baseDir, envAdditionsPath);
  }
}

async function mergePackageJson(baseDir: string, additionsPath: string): Promise<void> {
  const packageJsonPath = path.join(baseDir, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath));
  const additions = JSON.parse(await readFile(additionsPath));

  // Merge dependencies
  if (additions.dependencies) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...additions.dependencies,
    };
  }

  // Merge devDependencies
  if (additions.devDependencies) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...additions.devDependencies,
    };
  }

  // Merge scripts
  if (additions.scripts) {
    packageJson.scripts = {
      ...packageJson.scripts,
      ...additions.scripts,
    };
  }

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function mergeEnvFile(baseDir: string, additionsPath: string): Promise<void> {
  const envPath = path.join(baseDir, '.env.example');
  let envContent = '';

  if (await fs.pathExists(envPath)) {
    envContent = await readFile(envPath);
    if (!envContent.endsWith('\n')) {
      envContent += '\n';
    }
  }

  const additions = await readFile(additionsPath);
  envContent += '\n' + additions;

  await writeFile(envPath, envContent);
}
