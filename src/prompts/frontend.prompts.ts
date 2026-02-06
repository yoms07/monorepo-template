import enquirer from 'enquirer';
import type { FrontendConfig } from '../types/index.js';

export async function promptFrontendConfig(): Promise<FrontendConfig> {
  const { includeShadcn } = await enquirer.prompt<{ includeShadcn: boolean }>({
    type: 'confirm',
    name: 'includeShadcn',
    message: 'Include shadcn/ui components?',
    initial: true,
  });

  const { apiUrl } = await enquirer.prompt<{ apiUrl: string }>({
    type: 'input',
    name: 'apiUrl',
    message: 'API URL for development:',
    initial: 'http://localhost:3001',
    validate: (input: string) => {
      if (!input.trim()) return 'API URL is required';
      try {
        new URL(input);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    },
  });

  return {
    framework: 'nextjs',
    includeShadcn,
    apiUrl,
  };
}
