import Redis from 'ioredis';
import { z } from 'zod';
import { logger } from './logger.js';

// Validate Redis environment variables
const redisEnvSchema = z.object({
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

const redisEnv = redisEnvSchema.parse(process.env);

export const redis = new Redis(redisEnv.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
  logger.info('Redis disconnected');
});
