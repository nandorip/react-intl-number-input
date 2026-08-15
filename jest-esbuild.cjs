const esbuild = require('esbuild');

const loaders = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
};

module.exports = {
  process(source, filename) {
    const ext = filename.slice(filename.lastIndexOf('.'));
    const result = esbuild.transformSync(source, {
      loader: loaders[ext] || 'tsx',
      format: 'cjs',
      target: 'es2018',
      sourcemap: 'inline',
      jsx: 'transform',
      sourcefile: filename,
    });

    return { code: result.code, map: result.map };
  },
};
