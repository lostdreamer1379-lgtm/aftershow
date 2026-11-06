// Vercel serverless entry point.
//
// This imports the ALREADY-COMPILED app from dist/ (produced by the
// "vercel-build" script in package.json: prisma generate -> tsc -> tsc-alias)
// rather than the TypeScript source in src/. That's deliberate: src/app.ts
// and everything it imports use the project's "@/" path alias
// (tsconfig.json's "paths"), which plain `tsc` does not rewrite into
// real paths in its output — tsc-alias does that rewrite as a build step.
// By the time Vercel bundles this file, dist/app.js already has normal
// relative imports with no aliases left to resolve, so this file works
// regardless of whether Vercel's own bundler understands our tsconfig paths.
//
// This file is intentionally outside src/ and outside the backend
// tsconfig's "include" — it's deployment infrastructure, not part of the
// type-checked application code, and Vercel compiles it independently.
import app from '../dist/app.js'

export default app
