# Contributing

Thank you for your interest in contributing to `react-intl-number-input`.

## Requirements

- Node.js 20+ (recommended: current Active LTS)
- npm 10+

These versions are required to build and test the library. Consumers of the published npm package are not constrained by this.

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
| `npm run build:lib` | Compile `src/` to CommonJS and types in `dist/` |
| `npm run build` | Build the demo bundle in `example/dist` |
| `npm run publish-demo` | Build and deploy the demo to GitHub Pages |

## Project structure

```
src/           Library source (TypeScript)
dist/          Published build output (generated, not committed)
example/       Demo app and GitHub Pages bundle
```

The npm package ships only `dist/`, `README.md`, and `LICENSE` (see `files` in `package.json`).

## Testing

Run the full test suite before opening a pull request:

```bash
npm test
```

Tests live alongside the source in `src/index.test.tsx`.

## Building the library

To produce the publishable artifacts locally:

```bash
npm run build:lib
```

This generates:

- `dist/index.js` — CommonJS build (`tsc`)
- `dist/index.d.ts` — TypeScript declarations

## Publishing to npm

### Prerequisites

- npm account with publish access to `react-intl-number-input`
- logged in: `npm login`

### Release checklist

1. Update `CHANGELOG.md` with the new version and changes.
2. Bump the version in `package.json` following [semver](https://semver.org/):
   ```bash
   npm version patch   # 0.7.0 → 0.7.1
   npm version minor   # 0.7.0 → 0.8.0
   npm version major   # 0.7.0 → 1.0.0
   ```
3. Publish:
   ```bash
   npm publish
   ```

The `prepublishOnly` script runs automatically before publish:

```
npm test → npm run build:lib
```

Do not commit `dist/` — it is built during publish and excluded via `.gitignore`.

### Deploying the demo

To update the live demo on GitHub Pages:

```bash
npm run publish-demo
```

## Pull requests

1. Fork the repository and create a feature branch.
2. Make your changes with tests where applicable.
3. Run `npm test` and ensure it passes.
4. Open a pull request with a clear description of the change.

## Reporting issues

Open an issue at [github.com/nandorip/react-intl-number-input/issues](https://github.com/nandorip/react-intl-number-input/issues).