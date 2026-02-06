# Development Quick Reference

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo>
cd create-monorepo
pnpm install

# Test locally (no build needed!)
pnpm dev my-test-project
```

## 📝 Common Tasks

### Testing Changes Locally

**Method 1: Direct execution (fastest for development)**
```bash
pnpm dev test-project
# Edit files, no rebuild needed
```

**Method 2: npm link (test like end user)**
```bash
pnpm build
npm link
create-monorepo my-test
npm unlink -g create-monorepo  # cleanup
```

**Method 3: Automated test**
```bash
pnpm test:generate              # Generate and validate
pnpm test:generate -- --build   # Also install and build
```

### Validate Templates

```bash
pnpm test:validate  # Check all templates are properly structured
```

### Adding a New Feature

Example: Add a JWT authentication feature

```bash
# 1. Create feature directory
mkdir -p templates/backend-hono/features/jwt-auth/src/{middleware,services,config}

# 2. Add files
# - src/middleware/auth.middleware.ts
# - src/config/jwt.ts
# - package-additions.json (add jsonwebtoken, @types/jsonwebtoken)
# - env-additions.txt (add JWT_SECRET)

# 3. Update prompts
vim src/prompts/backend.prompts.ts
# Add: const { includeJwt } = await enquirer.prompt(...)

# 4. Update types
vim src/types/index.ts
# Add: includeJwt: boolean to BackendConfig

# 5. Update generator (it auto-merges if feature exists)
# No code changes needed if you follow the convention!

# 6. Test it
pnpm dev test-jwt
```

### Modifying Existing Templates

```bash
# Edit template files directly
vim templates/backend-hono/base/src/index.ts

# Test immediately (no rebuild!)
pnpm dev test-project

# Validate structure
pnpm test:validate
```

## 📦 Publishing to npm

### First time setup
```bash
npm login
```

### Publishing workflow

```bash
# 1. Update version
npm version patch  # 0.1.0 -> 0.1.1
# or
npm version minor  # 0.1.0 -> 0.2.0

# 2. Test with npm link
pnpm build
npm link
create-monorepo test-before-publish
cd test-before-publish && pnpm install && pnpm build
cd ..
npm unlink -g create-monorepo

# 3. Publish
npm publish

# For beta releases
npm publish --tag beta
```

### Automated publishing (recommended)

Setup GitHub Action (see CONTRIBUTING.md), then:
```bash
git tag v0.1.0
git push origin v0.1.0
# GitHub Action automatically publishes to npm
```

## 🎯 Project Structure

```
create-monorepo/
├── src/                       # CLI source code
│   ├── commands/create.ts     # Main command logic
│   ├── generators/            # Template generators
│   │   ├── backend.generator.ts
│   │   ├── frontend.generator.ts
│   │   ├── shared.generator.ts
│   │   └── monorepo.generator.ts
│   ├── prompts/               # User prompts
│   │   ├── project.prompts.ts
│   │   ├── backend.prompts.ts
│   │   └── frontend.prompts.ts
│   ├── utils/                 # Utilities
│   │   ├── file-ops.ts        # File operations
│   │   ├── template-merger.ts # Feature composition
│   │   └── package-manager.ts # PM detection
│   └── types/                 # TypeScript types
│
├── templates/                 # Template files
│   ├── backend-hono/
│   │   ├── base/              # Always included
│   │   └── features/          # Conditionally merged
│   │       ├── postgres-prisma/
│   │       ├── mongodb-prisma/
│   │       ├── redis/
│   │       ├── smtp/
│   │       └── swagger/
│   ├── frontend-nextjs/
│   │   └── base/
│   └── shared/
│       └── base/
│
├── scripts/                   # Development scripts
│   ├── test-generate.ts       # Generate and validate
│   └── validate-templates.ts  # Template validation
│
└── dist/                      # Build output (gitignored)
```

## 🔧 How It Works

### Template Composition

1. **Base Template**: Always copied first
   ```
   templates/backend-hono/base/ → packages/api/
   ```

2. **Feature Merging**: Conditionally merged on top
   ```
   templates/backend-hono/features/postgres-prisma/
   ├── src/config/database.ts    → Merged into packages/api/src/config/
   ├── prisma/schema.prisma      → Merged into packages/api/prisma/
   ├── package-additions.json    → Merged into packages/api/package.json
   └── env-additions.txt         → Appended to packages/api/.env.example
   ```

3. **Token Replacement**: During copy
   ```
   __PROJECT_NAME__ → my-project
   __PACKAGE_SCOPE__ → @my-project
   __API_PORT__ → 3001
   ```

### Feature Structure Convention

```
features/my-feature/
├── src/                       # Code files (merged)
├── package-additions.json     # Dependencies to add
└── env-additions.txt          # Env vars to append
```

## 💡 Tips

1. **Templates are just files** - Edit them like any other code
2. **No build step for testing** - Use `pnpm dev` for instant feedback
3. **Validate often** - Run `pnpm test:validate` before committing
4. **Test the generated project** - Always `pnpm install && pnpm build` the output
5. **Use tokens consistently** - Always `__UPPER_SNAKE__` format
6. **Keep features independent** - Each feature should work standalone

## 🐛 Troubleshooting

**CLI not working after changes?**
```bash
# Rebuild
pnpm build
# Or use dev mode
pnpm dev test-project
```

**Template validation fails?**
```bash
pnpm test:validate
# Fix reported issues
```

**Generated project doesn't work?**
```bash
# Test the full workflow
pnpm test:generate -- --build
# Check the generated project at /tmp/create-monorepo-test/test-project
```

**Want to test like a user?**
```bash
pnpm build
npm link
create-monorepo test-as-user
npm unlink -g create-monorepo
```

## 📚 See Also

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Detailed contribution guide
- [README.md](./README.md) - User-facing documentation
