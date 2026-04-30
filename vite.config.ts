import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base =
  process.env.GITHUB_ACTIONS === 'true' && repositoryName ? `/${repositoryName}/` : '/'

export default defineConfig({
  base,
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 4173
  }
})
