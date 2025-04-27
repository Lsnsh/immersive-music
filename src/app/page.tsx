'use client';

import { useState, useEffect, useRef } from 'react';
import StarrySky from "@/components/StarrySky";
import MusicPlayer from "@/components/MusicPlayer";

export default function Home() {
  const [showStartButton, setShowStartButton] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const initialized = useRef(false);

  // 确保只在客户端渲染时加载
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // 检查是否可以自动播放
    const checkAutoplay = async () => {
      try {
        // 创建一个测试音频
        const testAudio = new Audio();
        testAudio.volume = 0;
        testAudio.src = '/music/background-music.mp3';
        
        // 尝试播放
        const playPromise = testAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          // 可以自动播放
          setShowStartButton(false);
          testAudio.pause();
          testAudio.remove();
        }
      } catch {
        // 无法自动播放，需要用户交互
        console.log('需要用户交互才能播放音频');
      }
    };
    
    checkAutoplay();
  }, []);

  // 用户交互后开始播放
  const handleStart = () => {
    // 创建AudioContext来解锁自动播放
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const newAudioContext = new AudioContextClass();
      setAudioContext(newAudioContext);
    }

    setShowStartButton(false);
  };

  // 检测是否为移动设备
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* 星空背景 */}
      <StarrySky />
      
      {/* 中央内容 - 使用相对定位避免覆盖背景 */}
      <div className="relative flex flex-col items-center justify-center h-screen p-4 md:p-8">
        {showStartButton ? (
          <button 
            onClick={handleStart}
            className="bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full px-8 py-4 text-lg md:text-xl font-bold transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
          >
            开始体验
          </button>
        ) : (
          <>
            <h1 className="text-white text-3xl md:text-6xl font-bold mb-4 text-center">
              沉浸式音乐体验
            </h1>
            <p className="text-white/80 text-base md:text-xl text-center max-w-lg md:max-w-2xl">
              在星空下，聆听美妙音乐，享受宁静时刻
            </p>
            
            {/* 提示信息 - 仅在移动端显示 */}
            {isMobile && (
              <div className="mt-8 text-white/70 text-xs text-center max-w-xs bg-black/30 p-3 rounded-lg backdrop-blur-sm">
                提示：旋转手机获得更佳体验，或使用耳机聆听
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 音乐播放器 - 只在用户交互后显示 */}
      {!showStartButton && <MusicPlayer initialVolume={0.5} autoplay={true} />}
    </div>
  );
}
