import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'lottie-react': path.resolve(__dirname, './node_modules/lottie-react/build/index.js'),
    },
  },
  server: {
    proxy: {
      '/appstorys-users': {
        target: 'https://users.appstorys.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/appstorys-users/, ''),
        secure: false,
      },
      '/appstorys-tracking': {
        target: 'https://tracking.appstorys.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/appstorys-tracking/, ''),
        secure: false,
      },
      '/appstorys-campaigns': {
        target: 'https://dev-cdn-campaign-appstorys.s3.ap-south-1.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/appstorys-campaigns/, ''),
        secure: false,
      },
      '/appstorys-media': {
        target: 'https://appstorysmediabucketdev.s3.ap-south-1.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/appstorys-media/, ''),
        secure: false,
      }
    }
  }
})
