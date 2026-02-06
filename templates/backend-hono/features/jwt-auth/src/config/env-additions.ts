// Add these to your env schema validation

import { z } from 'zod';

export const jwtEnvSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// Merge this with your existing env schema:
// const envSchema = z.object({
//   ...existingFields,
//   ...jwtEnvSchema.shape,
// });
