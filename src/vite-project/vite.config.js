import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
//export default defineConfig({
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // CHANGED/ADDED - START
  build: {
    outDir: '../../dist/vite-project',
    emptyOutDir: true
  },
  // the following seems to fix the reload problem in development mode,
  // but why is this needed? And proxying is still not working...
  base: mode === 'production' ? '/vite-project/' : '/v/',
  //base: '/vite-project/',
  define: {
    'process.env.VUE_ROUTER_BASE': '"/v/"'
  },
  server: {
    // open: '/v/',
    open: true,
    proxy: {
      // this works, but what if you have hundreds of different backend URLs?
      // '/api': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true
      // }
      // first try like in vue.config.js - destroys live reload!
      '/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: false,
        bypass: function (req /*, res, options */) {
          if (req.url.startsWith('/v/')) {
            return req.url
          }
        }
      }
      // second try - does also not work:
      // '^^(?!/v/).*$': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true
      //   ws: false,
      // }
    }
  }
  // CHANGED/ADDED - END
  //}) // closing export default defineConfig({
})) // closing export default defineConfig(({ mode }) => ({
