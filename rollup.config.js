import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json' assert { type: 'json' };
import postcssConfig from './postcss.config.mjs';

const BUILD_FILENAME = 'datepicker';

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: 'src/index.css',
    output: { file: `dist/${BUILD_FILENAME}.css` },
    plugins: [
      postcss({
        include: '**/*.css',
        extract: true,
        plugins: postcssConfig.plugins,
        minimize: false,
      }),
    ],
  },
  {
    input: './src/index.js',
    output: { file: `dist/${BUILD_FILENAME}.d.ts` },
    plugins: [dts()],
  },
  {
    input: './src/index.js',
    output: { file: pkg.main, format: 'cjs', sourcemap: false },
    plugins: [
      terser(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              useBuiltIns: 'usage',
              corejs: '3.34.0',
              targets: '> 0.3%, defaults, not IE < 11',
            },
          ],
        ],
        exclude: 'node_modules/**',
        include: 'src/**/*.js',
      }),
    ],
  },
];
