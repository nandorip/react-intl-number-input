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

### Ownership & Accounts

The package is published under the npm account **`wipmob`** (`nandorip@live.com`).

> **Tip (Co-Maintainer):** To allow publishing from the `nandorip` account as well, add it via npm CLI or web interface:
> ```bash
> npm owner add nandorip react-intl-number-input
> ```
> Or manage collaborators at [npmjs.com/package/react-intl-number-input/access](https://www.npmjs.com/package/react-intl-number-input/access).

### Method 1: Automated Release via GitHub Actions (Recommended)

This repository includes an automated workflow ([`.github/workflows/publish.yml`](.github/workflows/publish.yml)) with npm provenance attestations. This avoids local 2FA prompts and terminal issues.

1. **One-time setup:**
   - In your npm account (**`wipmob`**), generate an **Automation Token** or **Granular Access Token** with *Read and write* permissions for `react-intl-number-input`.
   - In GitHub, go to **Settings > Secrets and variables > Actions** and add `NPM_TOKEN` with your token.
2. **Publishing a release:**
   - Create a new Release on GitHub (e.g. `v0.9.0`), or trigger the workflow manually under **Actions > Publish to npm > Run workflow**.
   - GitHub Actions will run all checks, build, verify the tarball, and publish with `--provenance` automatically.

### Method 2: Local CLI Release (`npm run release`)

A release helper script is available to validate requirements, run the test suite, and publish:

1. **Verify login:**
   ```bash
   npm whoami   # Should return 'wipmob' (or 'nandorip' if added as owner)
   ```
   If not logged in: `npm login`.
2. **Bump version (if not already done):**
   ```bash
   npm version patch   # or minor / major
   ```
3. **Execute release:**
   ```bash
   npm run release
   ```
   If your account requires 2FA and you are in a non-interactive shell, pass the OTP directly:
   ```bash
   npm run release -- --otp=123456
   ```

The script automatically:
- Confirms the active npm user.
- Runs `npm run check` (Jest tests, TypeScript, library builds, tarball verification).
- Runs `npm publish`.
- Creates and pushes the git tag `v<version>`.

### Deploying the demo

To update the live demo on GitHub Pages independently:

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
