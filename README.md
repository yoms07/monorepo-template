# create-monorepo

[![npm version](https://badge.fury.io/js/@yoms%2Fcreate-monorepo.svg)](https://www.npmjs.com/package/@yoms/create-monorepo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool to scaffold monorepo projects from templates with type sharing between packages.

## Features

- 🚀 **Quick Setup** - Generate a fully-configured monorepo in minutes
- 📦 **Type Sharing** - Share Zod schemas and types between backend and frontend
- 🎯 **Best Practices** - Pre-configured with modern tooling and patterns
- 🔧 **Flexible** - Choose only the features you need
- 🐳 **Production Ready** - Includes Docker, logging, error handling

## Installation

You don't need to install anything! Just run:

```bash
# Using npx (recommended)
npx @yoms/create-monorepo my-project

# Using pnpm
pnpm create @yoms/monorepo my-project

# Using yarn
yarn create @yoms/monorepo my-project

# Using npm
npm create @yoms/monorepo my-project
```

## Quick Start

### Interactive Mode (Default)

```bash
# Create a new project with interactive prompts
npx @yoms/create-monorepo my-project

# Navigate to project
cd my-project

# Install dependencies
pnpm install

# Start development
pnpm dev

# Visit:
# - Backend API: http://localhost:3001
# - Frontend: http://localhost:3000
```

### Non-Interactive Mode with CLI Flags

```bash
# Create a project with all features using CLI flags
npx @yoms/create-monorepo my-project \
  --backend hono \
  --database postgres \
  --redis \
  --smtp \
  --swagger \
  --auth \
  --frontend \
  --shadcn \
  --docker \
  --pm pnpm

# Quick start with defaults (skips all prompts)
npx @yoms/create-monorepo my-project --yes
```

## CLI Options

```bash
npx @yoms/create-monorepo [dir] [options]

Options:
  --backend <framework>    Backend framework (hono)
  --database <db>          Database (postgres, mongodb, none)
  --redis                  Include Redis cache
  --smtp                   Include SMTP email
  --swagger                Include Swagger docs
  --auth                   Include JWT authentication
  --frontend               Include Next.js frontend
  --shadcn                 Include shadcn/ui components
  --pm <manager>           Package manager (pnpm, npm, yarn, bun)
  --docker                 Include Docker Compose setup
  --skip-install           Skip dependency installation
  --skip-git               Skip git initialization
  -y, --yes                Skip all prompts and use defaults
  -h, --help               Display help
  -v, --version            Display version
```

## What You Get

### Backend Options

- **Framework**: Hono (recommended) or TSOA
- **Database**: PostgreSQL or MongoDB with Prisma
- **Caching**: Redis with ready-to-use cache service
- **Email**: SMTP with Nodemailer
- **Docs**: Swagger/OpenAPI with Scalar UI
- **Authentication**: JWT with refresh tokens (optional)
- **Logging**: Winston with structured logging
- **Validation**: Zod schemas
- **Error Handling**: Custom error classes and response helpers
- **Rate Limiting**: Memory-based rate limiter with presets
- **Testing**: Vitest with example tests
- **Type Safety**: Full TypeScript with strict mode

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI**: shadcn/ui components (optional)
- **Styling**: Tailwind CSS
- **Type Safety**: Shared types from backend

### Shared Package

- **Zod Schemas**: Single source of truth for validation and types
- **Common Types**: Result, ApiResponse, Pagination, etc.
- **Type Sharing**: Import types directly in backend and frontend

## Project Structure

```
my-project/
├── packages/
│   ├── api/                  # Backend API
│   │   ├── src/
│   │   │   ├── routes/       # API routes
│   │   │   ├── middleware/   # Hono middleware
│   │   │   ├── services/     # Business logic
│   │   │   ├── config/       # Configuration (env, logger, db)
│   │   │   ├── lib/          # Utilities (jwt, errors, response)
│   │   │   └── types/        # TypeScript types
│   │   ├── prisma/           # Database schema (if database selected)
│   │   ├── Dockerfile        # Production container
│   │   └── vitest.config.ts  # Test configuration
│   │
│   ├── web/                  # Next.js frontend
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   └── lib/              # Utilities and API client
│   │
│   └── shared/               # Shared types and schemas
│       └── src/
│           ├── schemas/      # Zod schemas
│           └── types.ts      # Common types
│
├── docker-compose.yml        # Docker services (if --docker)
├── pnpm-workspace.yaml       # Workspace configuration
└── tsconfig.base.json        # Shared TypeScript config
```

## Templates

### Hono Backend

- **Runtime-agnostic**: Works on Node, Bun, Deno, Cloudflare Workers
- **Best TypeScript inference**: Type-safe without code generation
- **Lightweight**: 12KB bundle, ~4x faster than Express
- **Modern API**: Chainable, intuitive routing
- **Built-in middleware**: CORS, compression, JWT, etc.

### Type Sharing Pattern

```typescript
// packages/shared/src/schemas/user.schema.ts
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// packages/api/src/routes/users.ts
import { UserSchema } from '@my-project/shared';
// Use for validation and type inference

// packages/web/lib/api.ts
import type { User } from '@my-project/shared';
// Use for type-safe API calls
```

## Configuration

All configuration is done via environment variables (12-factor app):

```env
# Server
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# Database (if selected)
DATABASE_URL=postgresql://...

# Redis (if selected)
REDIS_URL=redis://localhost:6379

# SMTP (if selected)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# JWT (if --auth selected)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

## Docker Compose

When using the `--docker` flag, a `docker-compose.yml` file is generated with the following services based on your configuration:

- **PostgreSQL**: If `--database postgres` is selected
- **MongoDB**: If `--database mongodb` is selected
- **Redis**: If `--redis` is selected
- **MailHog**: If `--smtp` is selected (SMTP testing server with web UI)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# View MailHog web UI (if SMTP selected)
open http://localhost:8025
```

## Available Scripts

```bash
# Development
pnpm dev              # Start all packages in dev mode
pnpm --filter api dev # Start only backend
pnpm --filter web dev # Start only frontend

# Building
pnpm build            # Build all packages
pnpm typecheck        # Type-check all packages

# Testing
pnpm --filter api test        # Run backend tests
pnpm --filter api test:watch  # Run tests in watch mode

# Database (if Prisma is selected)
pnpm --filter api prisma:generate  # Generate Prisma client
pnpm --filter api prisma:migrate   # Run migrations
pnpm --filter api prisma:studio    # Open Prisma Studio

# Code quality
pnpm lint             # Lint all packages
pnpm format           # Format with Prettier
```

## Authentication (JWT)

When using the `--auth` flag, JWT authentication is set up with the following features:

- **Access tokens**: Short-lived (15 minutes default)
- **Refresh tokens**: Long-lived (7 days default)
- **Password hashing**: bcryptjs with salt rounds
- **Protected routes**: Auth middleware for route protection

### Example Usage

```typescript
// Register a new user
POST /auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Refresh access token
POST /auth/refresh
{
  "refreshToken": "..."
}

// Protected route example
import { authMiddleware } from './middleware/auth.middleware';

app.get('/protected', authMiddleware, (c) => {
  const { userId, email } = c.get('jwtPayload');
  return c.json({ userId, email });
});
```

## Requirements

- Node.js >= 18
- pnpm, npm, yarn, or bun

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes.

## Support

- 📖 [Documentation](https://github.com/yoms07/monorepo-template)
- 🐛 [Issue Tracker](https://github.com/yoms07/monorepo-template/issues)
- 💬 [Discussions](https://github.com/yoms07/monorepo-template/discussions)

## License

MIT © [yoms07](https://github.com/yoms07)
