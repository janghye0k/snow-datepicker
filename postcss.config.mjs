import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcssImport from 'postcss-import';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    postcssImport,
    postcssPresetEnv({
      browsers: '> 0.2%, defaults, not IE < 11',
    }),
    autoprefixer,
    cssnano,
  ],
};

export default config;
