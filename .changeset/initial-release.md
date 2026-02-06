---
"create-monorepo": minor
---

Initial release of create-monorepo CLI tool

### Features

- 🏗️ **Backend Templates**
  - Hono framework with best-in-class TypeScript support
  - PostgreSQL and MongoDB with Prisma ORM
  - Redis caching with optimized SCAN-based operations
  - SMTP email service
  - Swagger/OpenAPI documentation
  - Complete CRUD service and route examples

- 🎨 **Frontend Templates**
  - Next.js 15 with App Router
  - Tailwind CSS for styling
  - shadcn/ui component library (optional)
  - Type-safe API client

- 📦 **Shared Package**
  - Zod schemas for validation
  - Shared TypeScript types
  - Common utilities and response types

- 🔒 **Production Ready**
  - Standardized error handling with custom error classes
  - Response helpers for consistent API responses
  - Rate limiting middleware (memory-based)
  - Environment variable validation with Zod
  - Structured logging with Winston
  - Docker multi-stage builds with proper workspace support

- 🧪 **Testing Infrastructure**
  - Vitest configuration
  - Example unit tests for routes, middleware, and utilities
  - Coverage reporting

- 📝 **Developer Experience**
  - Interactive CLI prompts
  - Automatic git initialization
  - Package manager detection (pnpm, npm, yarn, bun)
  - Changesets for version management
  - GitHub Actions for automated releases
