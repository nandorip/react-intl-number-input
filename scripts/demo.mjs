import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(root, 'example', 'dist');
const production = process.argv.includes('--production');

mkdirSync(outdir, { recursive: true });
copyFileSync(join(root, 'example', 'index.html'), join(outdir, 'index.html'));

const options = {
  entryPoints: [join(root, 'example', 'index.tsx')],
  bundle: true,
  outfile: join(outdir, 'bundle.js'),
  jsx: 'automatic',
  loader: { '.tsx': 'tsx' },
  minify: production,
  sourcemap: !production,
  logLevel: 'info',
};

if (production) {
  await esbuild.build(options);
} else {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { host, port } = await ctx.serve({ servedir: outdir, port: 3001 });
  console.log(`Demo: http://${host}:${port}`);
}
