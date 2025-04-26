# 沉浸式音乐 Immersive Music

一个基于Next.js和Tailwind CSS开发的沉浸式音乐播放器项目。点击这里体验 [在线演示](https://lsnsh.github.io/immersive-music/)

## 特点

- 美丽的星空背景，含闪烁的星星和随机流星
- 自动播放的音乐，初始音量为50%
- 底部隐藏式音乐播放器控件（Apple Music风格）
- 可展开的播放控制面板，支持音量调节和进度控制
- 响应式设计，适配各种设备
- 本地缓存音乐文件，优化加载性能

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS 4
- Framer Motion (动画效果)
- Howler.js (音频处理)
- IndexedDB (音频文件本地缓存)

## 当前场景

- 星空场景：深黑色背景中的星星与流星

## 计划

- 添加更多沉浸式场景背景
- 支持多首音乐切换
- 添加可视化音频效果
- 增加更多交互元素

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start
```

## 部署到GitHub Pages

项目已配置好GitHub Pages部署流程，可以使用以下命令进行部署：

```bash
# 安装依赖
npm install

# 部署到GitHub Pages
npm run deploy
```

这会自动构建项目并将生成的静态文件部署到gh-pages分支。

## 性能优化

项目实现了以下性能优化措施：

1. **音频文件缓存**：使用IndexedDB将音频文件缓存到本地，减少重复下载
2. **播放位置记忆**：记住用户上次播放的位置，下次访问时恢复
3. **音量设置保存**：保存用户设置的音量，提供一致的用户体验
4. **预加载下一首歌曲**：当播放当前歌曲时，自动预加载下一首歌曲
5. **性能优化**：使用will-change和其他CSS优化提高动画性能

## 目录结构

```
/
├── public/              # 静态资源
│   └── music/           # 音乐文件
├── src/                 # 源代码
│   ├── app/             # 应用主目录
│   ├── components/      # 组件
│   │   ├── MusicPlayer/ # 音乐播放器组件
│   │   └── StarrySky/   # 星空背景组件
│   ├── data/            # 数据文件
│   └── types/           # 类型定义
└── package.json         # 项目配置
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
