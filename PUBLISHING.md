# Publishing Guide

This document explains how to publish new versions of create-monorepo to npm.

## Prerequisites

1. **npm Account**: You need an npm account with publish access
2. **npm Token**: Create an npm access token at https://www.npmjs.com/settings/yoms07/tokens
3. **GitHub Secret**: Add the npm token as `NPM_TOKEN` in GitHub repository secrets

## Publishing Workflow

This package uses **tag-based releases**. Publishing to npm happens automatically when you push a version tag.

### Step 1: Make Your Changes

```bash
# Make your changes to the code
git add .
git commit -m "feat: your feature description"
```

### Step 2: Create a Changeset (Optional)

Changesets help track changes and generate changelogs:

```bash
pnpm changeset
```

This will prompt you to:
- Select the type of change (major, minor, patch)
- Describe the changes

The changeset file will be created in `.changeset/` directory.

### Step 3: Update Version

Update the version in `package.json` manually or use npm version:

```bash
# For patch release (0.1.0 -> 0.1.1)
npm version patch

# For minor release (0.1.0 -> 0.2.0)
npm version minor

# For major release (0.1.0 -> 1.0.0)
npm version major
```

Or manually edit `package.json` and update CHANGELOG.md.

### Step 4: Process Changesets (If Used)

If you created changesets in step 2:

```bash
pnpm version
```

This will:
- Update version in package.json
- Update CHANGELOG.md
- Delete processed changeset files

### Step 5: Commit Version Changes

```bash
git add .
git commit -m "chore: bump version to v0.1.1"
```

### Step 6: Create and Push Tag

```bash
# Create a git tag
git tag v0.1.1

# Push commits and tag
git push origin main
git push origin v0.1.1
```

### Step 7: Automated Publishing

When you push the tag, GitHub Actions will automatically:
1. ✅ Checkout the code
2. ✅ Setup Node.js and pnpm
3. ✅ Install dependencies
4. ✅ Run type checking
5. ✅ Build the package
6. ✅ Publish to npm
7. ✅ Create a GitHub release

You can monitor the progress at:
https://github.com/yoms07/monorepo-template/actions

## Manual Publishing (Alternative)

If you prefer to publish manually without GitHub Actions:

```bash
# 1. Build the package
pnpm build

# 2. Test locally
pnpm test:generate
pnpm test:validate

# 3. Login to npm (if not already)
npm login

# 4. Publish
npm publish
```

## Pre-release Versions

To publish a pre-release version (beta, alpha, rc):

```bash
# Update version to pre-release
npm version prerelease --preid=beta
# Results in: 0.1.1-beta.0

# Create and push tag
git add .
git commit -m "chore: bump version to v0.1.1-beta.0"
git tag v0.1.1-beta.0
git push origin main
git push origin v0.1.1-beta.0
```

Or publish manually with a tag:

```bash
npm publish --tag beta
```

Users can install it with:
```bash
npm install create-monorepo@beta
```

## Troubleshooting

### Publishing Fails

If GitHub Actions fails to publish:

1. Check that `NPM_TOKEN` secret is set correctly in GitHub
2. Verify the npm token has publish permissions
3. Check the action logs for specific errors

### Version Already Exists

If you try to publish a version that already exists on npm:

```bash
# Check current version on npm
npm view create-monorepo version

# Bump to a new version
npm version patch
git tag v0.1.2
git push origin main --tags
```

### Testing Before Publishing

Always test the package locally before publishing:

```bash
# Build
pnpm build

# Test with npm link
npm link
create-monorepo test-project

# Or test with npx from local
npx . test-project

# Clean up
npm unlink -g create-monorepo
```

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Checklist Before Publishing

- [ ] All tests pass locally
- [ ] Code is built successfully
- [ ] CHANGELOG.md is updated
- [ ] Version is bumped in package.json
- [ ] Changes are committed
- [ ] Tag is created and pushed
- [ ] GitHub Actions workflow completes successfully
- [ ] Package appears on npm
- [ ] Test installation: `npx create-monorepo@latest test-project`
