# Contributing to create-monorepo

## Development Workflow

### Setup

```bash
git clone <repo>
cd create-monorepo
pnpm install
```

### Local Development

#### Method 1: Direct execution with tsx (Recommended for development)

```bash
pnpm dev test-project
```

This runs the CLI directly without building, making iteration faster.

#### Method 2: npm link (Recommended for testing the actual package)

```bash
# In create-monorepo directory
pnpm build
npm link

# Now you can run it anywhere
create-monorepo my-test-project

# When done testing
npm unlink -g create-monorepo
```

#### Method 3: Use node directly

```bash
pnpm build
node dist/index.js test-project
```

### Quick Test Script

We provide a test script that generates a project and validates it:

```bash
# Generate a test project with all features
pnpm test:generate

# Generate with specific features
pnpm test:generate -- --backend --frontend --database postgres
```

This creates a project in `/tmp/create-monorepo-test` and runs basic validation.

### Testing Changes

#### 1. Template Changes

When you modify a template:

```bash
# Edit template files
vim templates/backend-hono/base/src/index.ts

# Test immediately without rebuilding
pnpm dev my-test-project

# Or use the test script
pnpm test:generate
```

#### 2. Adding a New Feature

Example: Adding a GraphQL feature

```bash
# Create feature directory
mkdir -p templates/backend-hono/features/graphql

# Add files
templates/backend-hono/features/graphql/
├── src/
│   ├── config/
│   │   └── graphql.ts
│   └── schema/
│       └── schema.graphql
├── package-additions.json
└── env-additions.txt

# Update prompts to include the new feature
vim src/prompts/backend.prompts.ts

# Test it
pnpm dev test-graphql
```

#### 3. Modifying Generators

```bash
# Edit generator logic
vim src/generators/backend.generator.ts

# Test without rebuilding
pnpm dev my-test
```

### Validation Checklist

Before committing:

- [ ] Templates have no syntax errors
- [ ] Token replacements work (`__PROJECT_NAME__`, etc.)
- [ ] Generated project installs successfully
- [ ] Generated project builds successfully
- [ ] TypeScript compilation passes
- [ ] All scripts in package.json work

### Testing the Generated Project

```bash
# Generate a test project
pnpm dev test-project
cd test-project

# Verify installation
pnpm install

# Verify TypeScript
pnpm typecheck

# Verify backend builds
pnpm --filter api build

# Verify frontend builds (if included)
pnpm --filter web build

# Verify backend runs
pnpm --filter api dev
# Visit http://localhost:3001/health

# Verify frontend runs (if included)
pnpm --filter web dev
# Visit http://localhost:3000
```

## Publishing to npm

### Pre-publish Checklist

1. **Update version** in `package.json`
2. **Test the package** end-to-end
3. **Build the package**: `pnpm build`
4. **Test the build**: `npm link` and test globally
5. **Update CHANGELOG.md** (if you create one)

### Publishing Steps

```bash
# Ensure you're logged in to npm
npm login

# Bump version (patch/minor/major)
npm version patch  # 0.1.0 -> 0.1.1
# or
npm version minor  # 0.1.0 -> 0.2.0
# or
npm version major  # 0.1.0 -> 1.0.0

# Build
pnpm build

# Publish
npm publish

# Or publish with a tag (for pre-releases)
npm publish --tag beta
```

### Automated Publishing (Recommended)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

Then publish by creating a tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Project Structure

```
create-monorepo/
├── src/                      # Source code
│   ├── commands/             # CLI commands
│   ├── generators/           # Template generators
│   ├── prompts/              # User prompts
│   ├── utils/                # Utilities
│   └── types/                # TypeScript types
├── templates/                # Template files (the actual content)
│   ├── backend-hono/
│   │   ├── base/             # Base template (always included)
│   │   └── features/         # Optional features (conditionally merged)
│   ├── frontend-nextjs/
│   └── shared/
├── dist/                     # Built output (gitignored)
└── package.json
```

## Adding a New Backend Framework

Example: Adding Fastify

1. **Create template structure**:
```bash
mkdir -p templates/backend-fastify/{base,features}
```

2. **Copy and modify from Hono template**:
```bash
cp -r templates/backend-hono/base templates/backend-fastify/base
# Modify files for Fastify
```

3. **Update prompts**:
```typescript
// src/prompts/backend.prompts.ts
choices: [
  { name: 'hono', message: 'Hono' },
  { name: 'fastify', message: 'Fastify' },
  // ...
]
```

4. **Update backend generator**:
```typescript
// src/generators/backend.generator.ts
templatePath = path.join(__dirname, '../../templates', `backend-${this.config.framework}`, 'base');
```

5. **Test it**:
```bash
pnpm dev test-fastify
# Select Fastify when prompted
```

## Tips

1. **Keep templates simple** - Don't over-engineer template code
2. **Use token replacement consistently** - Always use `__PROJECT_NAME__` style
3. **Test on a clean install** - Generated projects should work with just `pnpm install`
4. **Version dependencies carefully** - Use specific versions in templates
5. **Document env vars** - Always update `.env.example` files

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Include reproduction steps for bugs
