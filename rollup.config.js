const babelPlugin = require('@rollup/plugin-babel');
const fs = require('fs');
const terser = require('@rollup/plugin-terser');
const { dts } = require('rollup-plugin-dts');
const path = require('path');
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
const localeMap = require('./src/locale.json');
const { keys } = require('doumi');
const { capitalize } = require('doumi');

const extensions = ['.js', '.ts', '.json'];

const alias = aliasPlugin({
  entries: aliasOptions,
});

const banner =
  `// ${pkg.name} v${pkg.version}\n` +
  `// ${pkg.repository.url}\n` +
  `// (c) 2023 - ${new Date().getFullYear()} ${pkg.author}\n` +
  `// ${pkg.name} may be freely distributed under the MIT license.\n`;

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

function createDeclarationConfig(input, output) {
  return {
    input,
    output: {
      dir: output,
    },
    plugins: [alias, dts()],
  };
}

function getEsbuild(target, env = 'development') {
  return esbuild({
    minify: env === 'production',
    target,
    tsconfig: path.resolve('./tsconfig.json'),
  });
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
  return {
    input,
    output: {
      file: `${output}${env === 'production' ? '.min' : ''}.js`,
      format: 'umd',
      name: 'DatePicker',
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

function createLocaleConfigs() {
  const localeList = keys(localeMap);
  const configs = [];
  localeList.forEach((locale) => {
    const input = `src/locale/${locale}.js`;
    const output = `dist/locale/${locale}`;
    const name = `Locale${capitalize(locale)}`;
    configs.push({
      input,
      output: {
        file: `${output}.js`,
        format: 'es',
      },
    });
    fs.mkdirSync('dist/locale/', { recursive: true });
    fs.writeFileSync(
      path.join(output + '.d.ts'),
      [
        `declare module '${pkg.name}/locale/${locale}'{`,
        `\timport { Locale } from '${pkg.name}';`,
        `\tconst ${name}: Locale;`,
        `\texport default ${name}`,
        '}',
      ].join('\n')
    );
  });
  return configs;
}

const entry = 'src/index.ts';
const BUILD_FILENAME = 'datepicker';

module.exports = [
  createCSSConfig('src/styles/index.css', `dist/${BUILD_FILENAME}`),
  createDeclarationConfig(entry, 'dist/'),
  createESMConfig(entry, 'dist/index.esm.js'),
  createUMDConfig(entry, `dist/${BUILD_FILENAME}`, 'development'),
  createUMDConfig(entry, `dist/${BUILD_FILENAME}`, 'production'),
  ...createLocaleConfigs(),
];
