import { defineConfig } from 'vite';
import { aliasOptions } from './options.js';
import postcss from './postcss.config.js';

export default defineConfig(() => {
  return {
    root: 'src/_dev',
    resolve: {
      alias: aliasOptions,
    },
    css: {
      postcss,
    },
  };
});
