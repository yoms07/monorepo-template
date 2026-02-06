import enquirer from 'enquirer';
import type { BackendConfig } from '../types/index.js';

export async function promptBackendConfig(): Promise<BackendConfig> {
  const { backendType } = await enquirer.prompt<{ backendType: 'web' | 'worker' | 'cli' }>({
    type: 'select',
    name: 'backendType',
    message: 'Backend type:',
    choices: [
      { name: 'web', message: 'Web API (REST/HTTP)' },
      { name: 'worker', message: 'Background Worker' },
      { name: 'cli', message: 'CLI Tool' },
    ],
    initial: 0,
  });

  let framework: 'hono' | 'tsoa' = 'hono';
  if (backendType === 'web') {
    const { selectedFramework } = await enquirer.prompt<{ selectedFramework: 'hono' | 'tsoa' }>({
      type: 'select',
      name: 'selectedFramework',
      message: 'Backend framework:',
      choices: [
        { name: 'hono', message: 'Hono (Recommended - Best TypeScript inference)' },
        { name: 'tsoa', message: 'TSOA (OpenAPI-first with code generation)' },
      ],
      initial: 0,
    });
    framework = selectedFramework;
  }

  const { database } = await enquirer.prompt<{ database: 'postgres' | 'mongodb' | 'none' }>({
    type: 'select',
    name: 'database',
    message: 'Database:',
    choices: [
      { name: 'postgres', message: 'PostgreSQL with Prisma' },
      { name: 'mongodb', message: 'MongoDB with Prisma' },
      { name: 'none', message: 'None' },
    ],
    initial: 0,
  });

  const { includeRedis } = await enquirer.prompt<{ includeRedis: boolean }>({
    type: 'confirm',
    name: 'includeRedis',
    message: 'Include Redis caching?',
    initial: false,
  });

  const { includeSmtp } = await enquirer.prompt<{ includeSmtp: boolean }>({
    type: 'confirm',
    name: 'includeSmtp',
    message: 'Include SMTP email service?',
    initial: false,
  });

  let includeSwagger = false;
  if (backendType === 'web' && framework === 'hono') {
    const { swagger } = await enquirer.prompt<{ swagger: boolean }>({
      type: 'confirm',
      name: 'swagger',
      message: 'Include Swagger/OpenAPI documentation?',
      initial: false,
    });
    includeSwagger = swagger;
  }

  return {
    type: backendType,
    framework,
    database: database === 'none' ? undefined : database,
    includeRedis,
    includeSmtp,
    includeSwagger,
  };
}
