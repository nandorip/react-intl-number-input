import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const npmCli = process.env.npm_execpath;
assert(npmCli, 'Run this check with npm run check:package.');
const scratch = mkdtempSync(join(tmpdir(), 'intl-number-input-package-'));
const npm = (args, cwd) => execFileSync(process.execPath, [npmCli, ...args], {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'],
});

try {
  const packed = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', scratch], root));
  const entry = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];
  assert.equal(entry.version, manifest.version);
  const files = entry.files.map(({ path }) => path);
  for (const required of ['dist/index.js', 'dist/esm/index.js', 'dist/esm/package.json', 'dist/index.d.ts',
    'dist/esm/index.d.ts', 'dist/number.js', 'dist/esm/number.js', 'dist/esm/number.d.ts', 'README.md', 'LICENSE', 'CHANGELOG.md']) {
    assert(files.includes(required), `Missing package file: ${required}`);
  }
  assert(!files.some((path) => /(^src\/|^example\/|\.test\.)/.test(path)), 'Development files leaked into the package.');
  const consumer = join(scratch, 'consumer');
  mkdirSync(consumer);
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  // Install the actual tarball with no lifecycle scripts or peer downloads. The
  // runtime and type fixtures use the versions already installed by the caller.
  npm(['install', '--offline', '--ignore-scripts', '--legacy-peer-deps', '--no-package-lock', '--no-audit', '--no-fund',
    join(scratch, entry.filename)], consumer);
  const modules = join(consumer, 'node_modules');
  for (const name of ['react', 'react-dom', 'jsdom']) {
    symlinkSync(join(root, 'node_modules', name), join(modules, name), 'junction');
  }
  mkdirSync(join(modules, '@types'), { recursive: true });
  symlinkSync(join(root, 'node_modules', '@types', 'react'), join(modules, '@types', 'react'), 'junction');
  writeFileSync(join(consumer, 'usage.tsx'), `
import React from 'react';
import IntlNumberInput, { IntlNumberInputProps, ControlsRenderProps } from 'react-intl-number-input';
const ref = React.createRef<HTMLInputElement>();
const onChange: IntlNumberInputProps['onChange'] = (event, value, masked) => {
  const input: HTMLInputElement = event.target;
  const numeric: number = value;
  const formatted: string = masked;
  input.focus(); void numeric; void formatted;
};
const controls = (props: ControlsRenderProps) => <button disabled={props.disabled || props.readOnly}
  onClick={() => props.increment()}>{props.formattedValue}</button>;
export const legacy = <IntlNumberInput ref={ref} value="1234" precision={2} onChange={onChange} renderControls={controls} />;
export const strict = <IntlNumberInput controlled value={12.34} onChange={onChange} />;
`);
  for (const [module, moduleResolution] of [['NodeNext', 'NodeNext'], ['ESNext', 'Bundler']]) {
    writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { target: 'ES2018', module, moduleResolution, jsx: 'react', strict: true,
        noEmit: true, skipLibCheck: true, esModuleInterop: true }, include: ['usage.tsx'],
    }));
    execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(consumer, 'tsconfig.json')],
      { stdio: 'inherit' });
  }
  writeFileSync(join(consumer, 'smoke.cjs'), `
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<div id="root"></div>');
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const ReactDOM = require('react-dom');
const act = React.act || require('react-dom/test-utils').act;
const { renderToStaticMarkup } = require('react-dom/server');
const Component = require('react-intl-number-input').default;
assert.match(renderToStaticMarkup(React.createElement(Component, {value: 12.34, locale: 'pt-BR', prefix: 'R$ '})), /R\\$ 12,34/);
const container = document.getElementById('root');
let root;
function mount(props) {
  act(() => {
    const element = React.createElement(Component, props);
    if (Number(React.version.split('.')[0]) >= 18) {
      root ||= require('react-dom/client').createRoot(container);
      root.render(element);
    } else ReactDOM.render(element, container);
  });
}
let changes = [];
mount({value: 0, showStepButtons: true, onChange: (event, value) => {
  assert.equal(event.target, container.querySelector('input')); changes.push(value);
}});
for (let i = 0; i < 10; i++) act(() => container.querySelector('[aria-label="Increase value"]').click());
assert.equal(changes[9], 0.1);
assert.equal(container.querySelector('input').value, '0.10');
mount({value: 10, controlled: true, showStepButtons: true});
act(() => container.querySelector('[aria-label="Increase value"]').click());
assert.equal(container.querySelector('input').value, '10.00');
mount({value: 12.34, locale: 'zh-Hans-CN-u-nu-hanidec', readOnly: true, showStepButtons: true});
assert.equal(container.querySelector('input').value, '一二.三四');
assert.equal(container.querySelector('button').disabled, true);
act(() => { if (root) root.unmount(); else ReactDOM.unmountComponentAtNode(container); });
console.log('CJS, SSR and DOM checks passed with React ' + React.version);
dom.window.close();
`);
  execFileSync(process.execPath, ['smoke.cjs'], { cwd: consumer, stdio: 'inherit' });
  execFileSync(process.execPath, ['--input-type=module', '-e', `
import assert from 'node:assert/strict';
import React from 'react';
import { createRequire } from 'node:module';
const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server');
import Component from 'react-intl-number-input';
assert.match(renderToStaticMarkup(React.createElement(Component, { value: 12.34 })), /12.34/);
console.log('ESM package import passed');
`], { cwd: consumer, stdio: 'inherit' });
  console.log(`Validated ${entry.filename}: runtime entry points, declarations, SSR and DOM interactions.`);
} finally {
  // scratch is created by mkdtemp above; never remove a caller-supplied path.
  rmSync(scratch, { recursive: true, force: true });
}
