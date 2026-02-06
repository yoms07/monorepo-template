import type { Context, Next } from 'hono';
import { verifyAccessToken } from '../lib/jwt.js';
import { UnauthorizedError } from '../lib/errors.js';

/**
 * Middleware to authenticate requests using JWT
 * Extracts and verifies the JWT token from the Authorization header
 * and attaches the decoded payload to c.get('jwtPayload')
 */
export async function authMiddleware(c: Context, next: Next): Promise<void> {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    throw new UnauthorizedError('No authorization header');
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedError('Invalid authorization header format');
  }

  const payload = verifyAccessToken(token);
  c.set('jwtPayload', payload);

  await next();
}

/**
 * Optional authentication middleware
 * Similar to authMiddleware but doesn't throw if no token is present
 * Use this for routes that work for both authenticated and unauthenticated users
 */
export async function optionalAuthMiddleware(c: Context, next: Next): Promise<void> {
  const authHeader = c.req.header('Authorization');

  if (authHeader) {
    try {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        const payload = verifyAccessToken(token);
        c.set('jwtPayload', payload);
      }
    } catch {
      // Silently ignore invalid tokens for optional auth
    }
  }

  await next();
}
