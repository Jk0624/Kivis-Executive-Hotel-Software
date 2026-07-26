import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const cpanelHtaccess = (): Plugin => ({
  name: 'cpanel-htaccess',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: '.htaccess',
      source: `DirectoryIndex index.html

AddType application/javascript .js .mjs
AddType text/css .css
AddType image/svg+xml .svg
AddType application/wasm .wasm

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
`,
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cpanelHtaccess(),
  ],
})