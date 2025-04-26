/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 静态导出，适用于GitHub Pages
  trailingSlash: true,  // 为URL添加尾部斜杠，防止GitHub Pages路径问题
  images: {
    unoptimized: true,  // 静态导出时需要禁用图像优化
  },
  // 基本路径，当部署到子目录时需要设置
  basePath: process.env.NODE_ENV === 'production' ? '/immersive-music' : '',
  // 资源前缀，确保GitHub Pages上的资源路径正确
  assetPrefix: process.env.NODE_ENV === 'production' ? '/immersive-music/' : '',
  // 确保音乐文件能够被正确处理
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          publicPath: `_next/static/media/`,
          outputPath: 'static/media',
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig; 