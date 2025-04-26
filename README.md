# 沉浸式音乐 Immersive Music

一个基于Next.js和Tailwind CSS开发的沉浸式音乐播放器项目。

## 特点

- 美丽的星空背景，含闪烁的星星和随机流星
- 自动播放的音乐，初始音量为50%
- 底部隐藏式音乐播放器控件
- 可展开的播放控制面板，支持音量调节和进度控制
- 响应式设计，适配各种设备

## 技术栈

- Next.js (最新版)
- TypeScript
- Tailwind CSS
- Framer Motion (动画效果)
- Howler.js (音频处理)

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

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

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
