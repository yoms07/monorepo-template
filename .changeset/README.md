# Changesets

This directory contains changeset files for managing versions and changelogs.

## How to use

### Creating a changeset

When you make changes that should be included in the next release:

```bash
pnpm changeset
```

This will prompt you to:
1. Select the type of change (major, minor, patch)
2. Provide a description of the changes

### Versioning

To bump versions and update changelogs based on changesets:

```bash
pnpm version
```

This will:
1. Update the version in package.json
2. Update CHANGELOG.md
3. Delete the changeset files that were processed

### Publishing

This project uses **tag-based releases**. To publish:

1. Create and push a version tag:
```bash
npm version patch  # or minor, major
git push origin main
git push origin --tags
```

2. GitHub Actions will automatically:
   - Build the package
   - Run type checking
   - Publish to npm
   - Create a GitHub release

## CI/CD

The `.github/workflows/release.yml` workflow triggers on tag pushes (`v*`) and automatically publishes to npm.

See [PUBLISHING.md](../PUBLISHING.md) for detailed publishing instructions.
