import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { generateTokens, verifyRefreshToken } from '../lib/jwt.js';
import { success, created } from '../lib/response.js';
import { UnauthorizedError, ConflictError } from '../lib/errors.js';

// NOTE: This is a basic example. In a real application, you would:
// 1. Store users in a database
// 2. Store refresh tokens in a database or Redis for invalidation
// 3. Add email verification
// 4. Add password reset functionality
// 5. Add rate limiting on auth endpoints
// 6. Add account lockout after failed attempts

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// In-memory user store (replace with database in production)
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

const users: Map<string, User> = new Map();

/**
 * POST /auth/register
 * Register a new user
 */
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');

  // Check if user already exists
  const existingUser = Array.from(users.values()).find((u) => u.email === email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const userId = crypto.randomUUID();
  const user: User = {
    id: userId,
    email,
    password: hashedPassword,
    name,
    createdAt: new Date(),
  };

  users.set(userId, user);

  // Generate tokens
  const tokens = generateTokens(userId, email);

  return created(c, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    ...tokens,
  });
});

/**
 * POST /auth/login
 * Login with email and password
 */
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  // Find user
  const user = Array.from(users.values()).find((u) => u.email === email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokens(user.id, user.email);

  return success(c, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    ...tokens,
  });
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
auth.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');

  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);

  // Get user
  const user = users.get(payload.userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Generate new tokens
  const tokens = generateTokens(user.id, user.email);

  return success(c, tokens);
});

/**
 * POST /auth/logout
 * Logout (client should discard tokens)
 * In a real app, you would invalidate the refresh token in the database
 */
auth.post('/logout', async (c) => {
  // In a real application, you would:
  // 1. Get refresh token from request
  // 2. Delete it from database/Redis
  // 3. Optionally blacklist the access token until it expires

  return success(c, { message: 'Logged out successfully' });
});

export default auth;
