// next.config.mjs
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false
  },
  // 添加webpack配置来解决依赖问题
  webpack: (config, { dev, isServer }) => {
    // 现有的别名配置
    config.resolve.alias = {
      ...config.resolve.alias,
      // 将@react-native-async-storage/async-storage指向我们的模拟模块
      '@react-native-async-storage/async-storage': path.resolve(__dirname, './src/lib/mocks/async-storage.js'),
    };

    // 添加生产环境下的Lit配置
    if (!dev) {
      // 在生产环境中，确保使用Lit的生产版本
      config.resolve.alias = {
        ...config.resolve.alias,
        'lit': path.resolve(__dirname, 'node_modules/lit/index.js'),
        'lit/': path.resolve(__dirname, 'node_modules/lit/'),
      };

      // 定义生产环境变量，禁用Lit的开发模式
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'globalThis.litIssuedWarnings': JSON.stringify({}),
          'globalThis.litElementVersions': JSON.stringify({}),
        })
      );
    }

    return config;
  },
  // 根据你的需要添加其他配置，如：images, headers, rewrites 等
}

export default nextConfig