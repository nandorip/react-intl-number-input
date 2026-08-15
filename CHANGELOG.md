# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.2] - 2026-08-15

This is a maintainer/toolchain release. The published component API, peer dependency (`react >=16.8.0 <20`), and CommonJS entry are unchanged.

### Security

- Pinned transitive `js-yaml` to `4.3.1` ([GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj))

### Changed

- Replaced the Babel + Webpack toolchain with TypeScript (`tsc`) for the library and esbuild for the demo
- Dropped the `fast-uri` override (it only existed for webpack-dev-server)
- Contributor Node.js requirement is now 20+ (no longer tied to Babel 8)

## [0.8.1] - 2026-08-13

### Changed

- Updated development dependencies: React `19.2.8`, webpack `5.109.2`, webpack-cli `7.2.2`, html-webpack-plugin `5.6.8`, `@types/react` `19.2.18`
- Upgraded `@testing-library/jest-dom` from `6.9.1` to `7.0.1`

## [0.8.0] - 2026-07-27

### Added

- `renderControls` render prop with exported `ControlsRenderProps` for custom stepper UI (`increment`, `decrement`, `setValue`, bounds, and formatted value)

### Changed

- Step increments now use display units: `step={1}` with `precision={2}` adds `0.01` (previously added `100` to the numeric value)
- `renderControls` renders the input and controls as siblings without an opinionated wrapper — layout is controlled by the consumer
- When both `renderControls` and `showStepButtons` are set, `renderControls` takes precedence
- Development toolchain upgraded: Babel 8, TypeScript 7, Webpack 5.108, webpack-cli 7.2, webpack-dev-server 6
- Babel config updated for Babel 8 defaults (`modules: "commonjs"`, classic JSX runtime) so the published CJS build remains compatible with React 16.8+
- Contributor Node.js requirement updated to `^22.18.0 || >=24.11.0` (Babel 8)

### Fixed

- Step buttons and custom controls now read the numeric value from an internal ref instead of re-parsing the masked string (fixes incorrect steps with prefix/suffix or locale formatting)
- Controlled `value` prop updates now apply `minValue`/`maxValue` clamping before formatting
- Resolved transitive security advisories in the dev dependency tree (`npm audit` clean)

## [0.7.0] - 2026-06-20

### Added

- TypeScript source and published type declarations (`IntlNumberInputProps`)
- `forwardRef` support for the underlying `<input>`
- Standard HTML input attribute passthrough (`onFocus`, `aria-*`, `data-*`, `autoComplete`, etc.)
- Step buttons (`showStepButtons`, `step`)
- `minValue` / `maxValue` constraints
- `onBlur` callback
- `inputMode` prop
- Prefix/suffix HTML sanitization
- Redesigned interactive demo page with labeled examples and independent state
- `CONTRIBUTING.md` and `CHANGELOG.md` documentation

### Changed

- Migrated from JSX to TypeScript
- Removed runtime `prop-types` dependency (TypeScript types are the source of truth)
- `onBlur` now returns clamped numeric values consistent with `onChange`
- Prefix/suffix sanitization is SSR-safe (no `document` access)
- `peerDependencies` now require only `react` (not `react-dom`)
- Split consumer and maintainer documentation (`README.md`, `CONTRIBUTING.md`)

### Fixed

- SSR crash when rendering on the server
- `onBlur` returning unclamped values while display was clamped

## [0.6.0] - 2025

### Changed

- Updated build toolchain to Babel 7 and Webpack 5
- Added Jest test suite
- Updated demo to React 19
- Security updates for vulnerable dependencies

## [0.5.0] and earlier

See [git history](https://github.com/nandorip/react-intl-number-input/commits/master) for changes prior to 0.6.0.

[Unreleased]: https://github.com/nandorip/react-intl-number-input/compare/v0.8.2...HEAD
[0.8.2]: https://github.com/nandorip/react-intl-number-input/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/nandorip/react-intl-number-input/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/nandorip/react-intl-number-input/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/nandorip/react-intl-number-input/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/nandorip/react-intl-number-input/releases/tag/v0.6.0
