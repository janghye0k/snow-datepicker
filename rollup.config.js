const path = require('path');
const babelPlugin = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const { dts } = require('rollup-plugin-dts');
const resolve = require('@rollup/plugin-node-resolve');
const { default: esbuild } = require('rollup-plugin-esbuild');
const createBabelConfig = require('./babel.config.js');
const pkg = require('./package.json');
const postcss = require('rollup-plugin-postcss');
const postcssConfig = require('./postcss.config.js');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const aliasPlugin = require('@rollup/plugin-alias');
const { aliasOptions } = require('./options.js');

const extensions = ['.js', '.ts', '.json'];

const alias = aliasPlugin({
  entries: aliasOptions,
});

const banner =
  `// ${pkg.name.toUpperCase()} v${pkg.version}\n` +
  `// ${pkg.repository.url}\n` +
  `// (c) 2023 - ${new Date().getFullYear()} ${pkg.author}\n` +
  '// Doumi may be freely distributed under the MIT license.\n';

function createCSSConfig(input, output) {
  return {
    input,
    output: {
      file: `${output}.css`,
    },
    plugins: [
      postcss({
        include: '**/*.css',
        extract: true,
        plugins: postcssConfig.plugins,
        minimize: true,
      }),
    ],
  };
}

function getBabelOptions() {
  return {
    ...createBabelConfig(
      { env: (env) => env === 'build' },
      '> 0.2%, defaults, not IE < 11'
    ),
    extensions,
    comments: false,
    babelHelpers: 'bundled',
  };
}

function getEsbuild(target, env = 'development') {
  return esbuild({
    minify: env === 'production',
    target,
    tsconfig: path.resolve('./tsconfig.json'),
  });
}

function createDeclarationConfig(input, output) {
  return {
    input,
    output: {
      dir: output,
    },
    plugins: [alias, dts()],
  };
}

function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'esm', banner },
    plugins: [
      alias,
      json(),
      commonjs(),
      resolve({ extensions }),
      getEsbuild('node12'),
    ],
  };
}

/**
 *
 * @param {string} input
 * @param {string} output
 * @param {'development' | 'production'} env
 */
function createUMDConfig(input, output, env) {
  const capitalize = (s) => s.slice(0, 1).toUpperCase() + s.slice(1);
  let name = pkg.name;
  const splited = output.slice('dist/'.length).split('/');
  for (let i = splited.length - 1; i >= 0; i -= 1) {
    if (!['index', pkg.name].includes(splited[i])) {
      name += capitalize(splited[i]);
      break;
    }
  }
  return {
    input,
    output: {
      file: `${output}${env === 'production' ? '.min' : ''}.js`,
      format: 'umd',
      name,
      banner,
    },
    plugins: [
      alias,
      json(),
      commonjs(),
      resolve({ extensions }),
      babelPlugin({ ...getBabelOptions(), comments: true }),
      ...(env === 'production' ? [terser()] : []),
    ],
  };
}

const entry = 'src/index.ts';
const BUILD_FILENAME = 'datepicker';

module.exports = [
  createCSSConfig('src/styles/index.css', `dist/${BUILD_FILENAME}`),
  createCSSConfig('src/styles/dark.css', `dist/${BUILD_FILENAME}-dark`),
  createDeclarationConfig(entry, 'dist/'),
  createESMConfig(entry, 'dist/index.esm.js'),
  createUMDConfig(entry, `dist/${BUILD_FILENAME}`, 'development'),
  createUMDConfig(entry, `dist/${BUILD_FILENAME}`, 'production'),
];
