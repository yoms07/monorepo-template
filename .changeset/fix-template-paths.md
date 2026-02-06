---
"@yoms/create-monorepo": patch
---

Fixed template path resolution when package is installed from npm. Templates are now correctly located relative to the package root instead of the dist directory.
