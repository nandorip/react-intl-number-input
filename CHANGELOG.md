# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- TypeScript source and published type declarations (`IntlNumberInputProps`)
- `forwardRef` support for the underlying `<input>`
- Standard HTML input attribute passthrough (`onFocus`, `aria-*`, `data-*`, `autoComplete`, etc.)
- Step buttons (`showStepButtons`, `step`)
- `minValue` / `maxValue` constraints
- `onBlur` callback
- `inputMode` prop
- Prefix/suffix HTML sanitization

### Changed

- Migrated from JSX to TypeScript
- Removed runtime `prop-types` dependency (TypeScript types are the source of truth)
- `onBlur` now returns clamped numeric values consistent with `onChange`
- Prefix/suffix sanitization is SSR-safe (no `document` access)
- `peerDependencies` now require only `react` (not `react-dom`)

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

[Unreleased]: https://github.com/nandorip/react-intl-number-input/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/nandorip/react-intl-number-input/releases/tag/v0.6.0