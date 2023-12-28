import { defineConfig } from 'vite';
import { resolve } from 'path';
import postcss from './postcss.config.mjs';

export default defineConfig(() => {
  return {
    root: 'dev',
    resolve: {
      alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
    },
    css: {
      postcss,
    },
  };
});
