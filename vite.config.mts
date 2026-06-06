import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: '/sky/',
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(dirname, 'src/assets/svg-icon')],
      // Specify symbolId format
      symbolId: 'svg-icon__[name]',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
      '@packages': path.resolve(dirname, 'packages'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: {
    port: 50014,
  },
});
