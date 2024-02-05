const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const postcssPresetEnv = require('postcss-preset-env');
const postcssImport = require('postcss-import');

/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: [
    postcssImport,
    postcssPresetEnv({
      browsers: '> 0.2%, defaults, not IE < 11',
    }),
    autoprefixer,
    cssnano,
  ],
};
