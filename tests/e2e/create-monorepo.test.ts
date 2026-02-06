import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

describe('create-monorepo CLI', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    testDir = path.join(os.tmpdir(), `create-monorepo-test-${Date.now()}`);
    await fs.ensureDir(testDir);

    // Get the path to the CLI (assumes we're running from package root)
    cliPath = path.join(process.cwd(), 'dist', 'index.js');
  });

  afterEach(async () => {
    // Clean up test directory
    if (testDir && (await fs.pathExists(testDir))) {
      await fs.remove(testDir);
    }
  });

  it('should create a basic monorepo with backend and frontend', async () => {
    const projectName = 'test-project';
    const projectPath = path.join(testDir, projectName);

    await execa('node', [cliPath, projectName, '--yes', '--skip-install', '--skip-git'], {
      cwd: testDir,
    });

    // Check that the project was created
    expect(await fs.pathExists(projectPath)).toBe(true);

    // Check root files
    expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'pnpm-workspace.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, '.gitignore'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'README.md'))).toBe(true);

    // Check packages directory
    expect(await fs.pathExists(path.join(projectPath, 'packages'))).toBe(true);

    // Check backend package (default includes backend)
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'api'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'api', 'package.json'))).toBe(true);

    // Check frontend package (default includes frontend)
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'web'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'web', 'package.json'))).toBe(true);

    // Check shared package (included when both backend and frontend)
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'shared'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'shared', 'package.json'))).toBe(true);
  });

  it('should create a backend-only monorepo', async () => {
    const projectName = 'backend-only';
    const projectPath = path.join(testDir, projectName);

    await execa(
      'node',
      [cliPath, projectName, '--yes', '--backend', 'hono', '--skip-install', '--skip-git'],
      {
        cwd: testDir,
      }
    );

    expect(await fs.pathExists(projectPath)).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'api'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'web'))).toBe(false);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'shared'))).toBe(false);
  });

  it('should create a monorepo with PostgreSQL database', async () => {
    const projectName = 'postgres-project';
    const projectPath = path.join(testDir, projectName);

    await execa(
      'node',
      [
        cliPath,
        projectName,
        '--yes',
        '--backend',
        'hono',
        '--database',
        'postgres',
        '--skip-install',
        '--skip-git',
      ],
      {
        cwd: testDir,
      }
    );

    expect(await fs.pathExists(projectPath)).toBe(true);

    // Check for Prisma schema
    const prismaSchemaPath = path.join(projectPath, 'packages', 'api', 'prisma', 'schema.prisma');
    expect(await fs.pathExists(prismaSchemaPath)).toBe(true);

    const schema = await fs.readFile(prismaSchemaPath, 'utf-8');
    expect(schema).toContain('provider = "postgresql"');

    // Check for database config
    const dbConfigPath = path.join(projectPath, 'packages', 'api', 'src', 'config', 'database.ts');
    expect(await fs.pathExists(dbConfigPath)).toBe(true);

    // Check .env.example has database URL
    const envPath = path.join(projectPath, 'packages', 'api', '.env.example');
    const envContent = await fs.readFile(envPath, 'utf-8');
    expect(envContent).toContain('DATABASE_URL');
  });

  it('should create a monorepo with Redis', async () => {
    const projectName = 'redis-project';
    const projectPath = path.join(testDir, projectName);

    await execa('node', [cliPath, projectName, '--yes', '--redis', '--skip-install', '--skip-git'], {
      cwd: testDir,
    });

    expect(await fs.pathExists(projectPath)).toBe(true);

    // Check for Redis config
    const redisConfigPath = path.join(projectPath, 'packages', 'api', 'src', 'config', 'redis.ts');
    expect(await fs.pathExists(redisConfigPath)).toBe(true);

    // Check for cache service
    const cacheServicePath = path.join(projectPath, 'packages', 'api', 'src', 'services', 'cache.service.ts');
    expect(await fs.pathExists(cacheServicePath)).toBe(true);
  });

  it('should create a monorepo with Docker Compose', async () => {
    const projectName = 'docker-project';
    const projectPath = path.join(testDir, projectName);

    await execa(
      'node',
      [
        cliPath,
        projectName,
        '--yes',
        '--docker',
        '--database',
        'postgres',
        '--redis',
        '--skip-install',
        '--skip-git',
      ],
      {
        cwd: testDir,
      }
    );

    expect(await fs.pathExists(projectPath)).toBe(true);

    // Check for docker-compose.yml
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml');
    expect(await fs.pathExists(dockerComposePath)).toBe(true);

    const dockerCompose = await fs.readFile(dockerComposePath, 'utf-8');
    expect(dockerCompose).toContain('postgres:');
    expect(dockerCompose).toContain('redis:');
  });

  it('should create a monorepo with JWT authentication', async () => {
    const projectName = 'auth-project';
    const projectPath = path.join(testDir, projectName);

    await execa('node', [cliPath, projectName, '--yes', '--auth', '--skip-install', '--skip-git'], {
      cwd: testDir,
    });

    expect(await fs.pathExists(projectPath)).toBe(true);

    // Check for JWT library
    const jwtLibPath = path.join(projectPath, 'packages', 'api', 'src', 'lib', 'jwt.ts');
    expect(await fs.pathExists(jwtLibPath)).toBe(true);

    // Check for auth middleware
    const authMiddlewarePath = path.join(projectPath, 'packages', 'api', 'src', 'middleware', 'auth.middleware.ts');
    expect(await fs.pathExists(authMiddlewarePath)).toBe(true);

    // Check for auth routes
    const authRoutePath = path.join(projectPath, 'packages', 'api', 'src', 'routes', 'auth.route.ts');
    expect(await fs.pathExists(authRoutePath)).toBe(true);

    // Check .env.example has JWT secrets
    const envPath = path.join(projectPath, 'packages', 'api', '.env.example');
    const envContent = await fs.readFile(envPath, 'utf-8');
    expect(envContent).toContain('JWT_SECRET');
    expect(envContent).toContain('JWT_REFRESH_SECRET');
  });

  it('should create a monorepo with all features', async () => {
    const projectName = 'full-project';
    const projectPath = path.join(testDir, projectName);

    await execa(
      'node',
      [
        cliPath,
        projectName,
        '--yes',
        '--backend',
        'hono',
        '--database',
        'postgres',
        '--redis',
        '--smtp',
        '--swagger',
        '--auth',
        '--frontend',
        '--shadcn',
        '--docker',
        '--skip-install',
        '--skip-git',
      ],
      {
        cwd: testDir,
      }
    );

    expect(await fs.pathExists(projectPath)).toBe(true);

    // Check all packages exist
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'api'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'web'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'packages', 'shared'))).toBe(true);

    // Check docker-compose
    expect(await fs.pathExists(path.join(projectPath, 'docker-compose.yml'))).toBe(true);

    // Verify package.json has correct dependencies
    const apiPackageJson = await fs.readJson(path.join(projectPath, 'packages', 'api', 'package.json'));
    expect(apiPackageJson.dependencies).toHaveProperty('hono');
    expect(apiPackageJson.dependencies).toHaveProperty('@prisma/client');
    expect(apiPackageJson.dependencies).toHaveProperty('ioredis');
    expect(apiPackageJson.dependencies).toHaveProperty('nodemailer');
    expect(apiPackageJson.dependencies).toHaveProperty('jsonwebtoken');

    const webPackageJson = await fs.readJson(path.join(projectPath, 'packages', 'web', 'package.json'));
    expect(webPackageJson.dependencies).toHaveProperty('next');
  });

  it('should fail when directory is not empty', async () => {
    const projectName = 'non-empty-test';
    const projectPath = path.join(testDir, projectName);

    // Create directory with a file
    await fs.ensureDir(projectPath);
    await fs.writeFile(path.join(projectPath, 'existing-file.txt'), 'content');

    // Try to create project in non-empty directory
    await expect(
      execa('node', [cliPath, projectName, '--yes', '--skip-install', '--skip-git'], {
        cwd: testDir,
      })
    ).rejects.toThrow();
  });

  it('should respect --skip-install flag', async () => {
    const projectName = 'skip-install-test';
    const projectPath = path.join(testDir, projectName);

    await execa('node', [cliPath, projectName, '--yes', '--skip-install', '--skip-git'], {
      cwd: testDir,
    });

    // node_modules should not exist
    expect(await fs.pathExists(path.join(projectPath, 'node_modules'))).toBe(false);
  });
});
