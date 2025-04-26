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

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* 星空背景 */}
      <StarrySky />
      
      {/* 中央内容 */}
      <div className="relative z-[1] flex flex-col items-center justify-center h-screen p-8">
        {showStartButton ? (
          <button 
            onClick={handleStart}
            className="bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full px-10 py-4 text-xl font-bold transition-all hover:bg-white/20"
          >
            开始体验
          </button>
        ) : (
          <>
            <h1 className="text-white text-4xl md:text-6xl font-bold mb-4 text-center">
              沉浸式音乐体验
            </h1>
            <p className="text-white/80 text-lg md:text-xl text-center max-w-2xl">
              在星空下，聆听美妙音乐，享受宁静时刻
            </p>
          </>
        )}
      </div>
      
      {/* 音乐播放器 - 只在用户交互后显示 */}
      {!showStartButton && <MusicPlayer initialVolume={0.5} autoplay={true} />}
    </div>
  );
}
