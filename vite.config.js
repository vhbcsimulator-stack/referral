import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devRewritePlugin = {
  name: 'dev-rewrite',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/info' || req.url === '/info/') {
        req.url = '/landing/info/index.html';
      } else if (req.url.startsWith('/assets/')) {
        req.url = '/landing/info' + req.url;
      } else if (req.url.startsWith('/info/assets/')) {
        req.url = req.url.replace('/info/assets/', '/landing/info/assets/');
      }
      next();
    });
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devRewritePlugin],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        info: resolve(__dirname, 'landing/info/index.html'),
      },
    },
  },
})
