import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';


export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/pages': path.resolve(__dirname, './src/pages'),
    },
  },

  // 開発サーバー設定
  server: {
    port: 3000,
    host: '0.0.0.0', // Docker対応
    strictPort: true, // ポート競合時のエラー
    open: false, // ブラウザ自動起動無効
    cors: true, // CORS有効化

    // TODO(human)
    // バックエンドAPIプロキシ設定をDocker環境対応に調整
    // target を 'http://backend:8000' に変更してDocker内部通信を有効化
    proxy: {
      '/api': {
        target: 'http://backend:8000', // バックエンドサーバー
        changeOrigin: true, // Originヘッダー変更
        secure: false, // HTTPS検証無効
        ws: true, // WebSocket対応
        timeout: 30000, // 30秒タイムアウト
      },
    },
  },

  // ビルド設定（MVP最適化）
  build: {
    target: 'es2020', // モダンブラウザ対応
    outDir: 'dist', // 出力ディレクトリ
    assetsDir: 'assets', // アセットディレクトリ
    sourcemap: true, // ソースマップ生成
    minify: 'esbuild', // 高速minify

    // チャンク分割最適化
    rollupOptions: {
      output: {
        // ベンダーライブラリの分離
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          http: ['axios'],
        },

        // ファイル名のハッシュ化
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // バンドルサイズ警告しきい値
    chunkSizeWarningLimit: 1000,
  },

  // TypeScript設定
  esbuild: {
    target: 'es2020', // コンパイルターゲット
    logOverride: {
      'this-is-undefined-in-esm': 'silent', // ESMでのthis警告を抑制
    },
  },

  // 最適化設定
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      '@hookform/resolvers/yup',
      'axios',
      'yup',
    ],
    exclude: [
      // 開発時に最適化から除外するパッケージ
    ],
  },

  // 環境変数設定
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },

  // CSS設定
  css: {
    devSourcemap: true, // CSS開発時ソースマップ
    modules: {
      // CSS Modules設定（必要に応じて）
      localsConvention: 'camelCase',
    },
  },

  // プレビューサーバー設定（ビルド後の確認用）
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
  },
}); 