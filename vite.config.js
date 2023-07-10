import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        minify: 'esbuild',
        lib: {
            entry: resolve(__dirname, 'lib/index.js'),
            name: 'algernon',
            fileName: 'algernon',
        }
    },
    test: {
        globals: true,
        benchmark: {
            outputFile: "./bench-results.json"
        }
    }
})