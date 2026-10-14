# Contributing

Thank you for your interest in contributing to `react-intl-number-input`.

## Requirements

- Node.js 20+ (recommended: current Active LTS)
- npm 10+

The package declares Node.js 20+ in `engines`. The runtime component executes in browsers; Node.js is used for installation, builds, tests and publication.

## Getting started

```bash
git clone https://github.com/nandorip/react-intl-number-input.git
cd react-intl-number-input
npm install
```

## Local development

Start the demo app with live rebuild:

```bash
npm start
```

Open [http://localhost:3001](http://localhost:3001). The demo lives in `example/` and imports the component from `src/`.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | esbuild dev server for the demo |
| `npm test` | Run unit tests with Jest |
| `npm run typecheck` | Check library and demo types |
| `npm run check` | Tests, type checking, library builds and installed-tarball validation |
| `npm run check:package` | Validate the built npm tarball: CJS, ESM, types, SSR and DOM interactions |
| `npm run build:lib` | Compile `src/` to CommonJS, ESM, and types in `dist/` |
| `npm run build` | Build the demo bundle in `example/dist` |
| `npm run publish-demo` | Build and deploy the demo to GitHub Pages |

## Project structure

```
src/           Library source (TypeScript)
dist/          Published build output (generated, not committed)
example/       Demo app and GitHub Pages bundle
```

The npm package ships `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `CONTRIBUTING.md` (see `files` in `package.json`).

## Testing

Run the full test suite before opening a pull request:

```bash
npm run check
```

Tests live alongside the source in `src/index.test.tsx` and `src/regressions.test.tsx`. CI also checks the installed package with React 16.8, 17, 18 and 19, and runs the full checks on Node.js 20 and 24.

## Building the library

To produce the publishable artifacts locally:

```bash
npm run build:lib
```

This generates:

- `dist/index.js` — CommonJS build (`tsc`)
- `dist/esm/index.js` — ESM build (`tsc`)
- `dist/index.d.ts` — TypeScript declarations

## Publishing to npm

### Prerequisites

- npm account with publish access to `react-intl-number-input`
- logged in: `npm login`

### Release checklist

1. Run `npm run check` and `npm run build`, and review the resulting demo changes.
2. Update `CHANGELOG.md` with the new version and changes.
3. Bump the version in `package.json` following [semver](https://semver.org/), keeping `package-lock.json` and the demo's version metadata in sync:
   ```bash
   npm version patch   # 0.7.0 → 0.7.1
   npm version minor   # 0.7.0 → 0.8.0
   npm version major   # 0.7.0 → 1.0.0
   ```
4. Inspect `npm pack --dry-run` to confirm the published files.
5. Publish:
   ```bash
   npm publish
   ```

The `prepublishOnly` script runs automatically before publish:

```
npm run check
```

Do not commit `dist/` — it is built during publish and excluded via `.gitignore`.

`prepack` also builds the library, so `npm pack` and installs from the repository cannot package stale build output. `check:package` packs with scripts disabled, installs the tarball offline in a temporary directory, checks CJS/ESM imports and TypeScript consumer fixtures, exercises SSR and browser DOM controls, then removes its temporary files.

The compatible default preserves optimistic `value` editing, callback signatures, implied-decimal string parsing, scaled `step`, zero on clearing, affix sanitization and DOM layout. New strict controlled behavior is opt-in through `controlled`. Avoid changing these defaults in a maintenance release.

### Deploying the demo

To update the live demo on GitHub Pages:

```bash
npm run publish-demo
```

## Pull requests

1. Fork the repository and create a feature branch.
2. Make your changes with tests where applicable.
3. Run `npm run check` and ensure it passes.
4. Open a pull request with a clear description of the change.

## Reporting issues

Open an issue at [github.com/nandorip/react-intl-number-input/issues](https://github.com/nandorip/react-intl-number-input/issues).
