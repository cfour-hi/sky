import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import viteSvgIcons from 'vite-plugin-svg-icons';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/sky/',
  plugins: [
    vue(),
    viteSvgIcons({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve('src/assets/svg-icon')],
      // Specify symbolId format
      symbolId: 'svg-icon__[name]',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve('src'),
      '@packages': path.resolve('packages'),
    },
  },
});
