'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import songs, { Song } from '@/data/songs';

interface MusicPlayerProps {
  initialVolume?: number;
  autoplay?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  initialVolume = 0.5,
  autoplay = true
}) => {
  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  
  // 播放列表状态
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const currentSong = songs[currentSongIndex];
  
  // refs
  const soundRef = useRef<Howl | null>(null);
  const animationRef = useRef<number | null>(null);
  const playerInitialized = useRef(false);

  // 初始化和卸载音频
  const initializeAudio = useCallback((songSrc: string) => {
    // 如果已有实例，先卸载
    if (soundRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      soundRef.current.unload();
      soundRef.current = null;
    }

    // 创建新的Howl实例
    soundRef.current = new Howl({
      src: [songSrc],
      volume: volume,
      html5: true,
      onload: () => {
        if (soundRef.current) {
          setDuration(soundRef.current.duration());
          // 如果设置了自动播放且是初始化
          if (autoplay && !playerInitialized.current) {
            setTimeout(() => {
              if (soundRef.current) {
                soundRef.current.play();
              }
            }, 500);
            playerInitialized.current = true;
          }
        }
      },
      onplay: () => {
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(updateProgress);
      },
      onpause: () => {
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      },
      onend: () => {
        playNextSong();
      },
      onloaderror: (id, error) => {
        console.error('音频加载错误:', error);
        playNextSong(); // 出错时尝试播放下一首
      }
    });
  }, [volume, autoplay]);

  // 首次加载时初始化第一首歌
  useEffect(() => {
    if (!playerInitialized.current) {
      initializeAudio(currentSong.src);
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeAudio, currentSong.src]);

  // 更新进度
  const updateProgress = () => {
    if (soundRef.current) {
      const seek = soundRef.current.seek() || 0;
      setCurrentTime(seek);
      
      // 模拟加载进度
      if (loadedPercentage < 100) {
        setLoadedPercentage(prev => {
          const increment = Math.random() * 5 + 3; // 3-8%
          return Math.min(prev + increment, 100);
        });
      }
      
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  // 控制播放/暂停
  const togglePlay = () => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  // 播放下一首
  const playNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentTime(0);
    setLoadedPercentage(0);
    
    // 初始化新歌曲
    initializeAudio(songs[nextIndex].src);
    
    // 自动播放下一首
    setTimeout(() => {
      if (soundRef.current) {
        soundRef.current.play();
      }
    }, 500);
  };

  // 播放上一首
  const playPrevSong = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    setCurrentTime(0);
    setLoadedPercentage(0);
    
    // 初始化新歌曲
    initializeAudio(songs[prevIndex].src);
    
    // 自动播放上一首
    setTimeout(() => {
      if (soundRef.current) {
        soundRef.current.play();
      }
    }, 500);
  };

  // 播放特定歌曲
  const playSong = (index: number) => {
    if (index === currentSongIndex && isPlaying) {
      return; // 如果是当前正在播放的歌曲，不做任何操作
    }
    
    setCurrentSongIndex(index);
    setCurrentTime(0);
    setLoadedPercentage(0);
    
    // 初始化选择的歌曲
    initializeAudio(songs[index].src);
    
    // 自动播放选择的歌曲
    setTimeout(() => {
      if (soundRef.current) {
        soundRef.current.play();
      }
    }, 500);
    
    // 选择歌曲后关闭播放列表
    setShowPlaylist(false);
  };

  // 控制音量
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
  };

  // 控制进度条
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekPosition = parseFloat(e.target.value);
    setCurrentTime(seekPosition);
    
    if (soundRef.current) {
      soundRef.current.seek(seekPosition);
    }
  };

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 切换播放列表显示
  const togglePlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylist(!showPlaylist);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      {/* 播放列表 */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="bg-black/90 backdrop-blur-lg p-4 border-t border-white/10 max-h-80 overflow-y-auto"
          >
            <h3 className="text-white font-bold text-lg mb-4">播放列表</h3>
            <div className="flex flex-col gap-2">
              {songs.map((song, index) => (
                <div 
                  key={song.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    currentSongIndex === index 
                      ? 'bg-white/20 text-white' 
                      : 'hover:bg-white/10 text-white/70'
                  }`}
                  onClick={() => playSong(index)}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3">
                    {currentSongIndex === index && isPlaying ? (
                      <div className="flex gap-1 items-center">
                        <span className="w-1 h-6 bg-white/80 animate-music-bar-1"></span>
                        <span className="w-1 h-5 bg-white/80 animate-music-bar-2"></span>
                        <span className="w-1 h-4 bg-white/80 animate-music-bar-3"></span>
                      </div>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 6L21 12L9 18V6Z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{song.title}</p>
                    <p className="text-xs opacity-80">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 可展开的播放器 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="bg-black/80 backdrop-blur-md p-4 rounded-t-2xl border-t border-white/10"
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm">
                  {formatTime(currentTime)}
                </span>
                <span className="text-white text-sm">
                  {formatTime(duration)}
                </span>
              </div>
              
              {/* 进度条背景 */}
              <div className="h-1 bg-white/20 rounded-full relative">
                {/* 加载进度 */}
                <div 
                  className="absolute h-full bg-white/30 rounded-full"
                  style={{ width: `${loadedPercentage}%` }}
                />
                
                {/* 播放进度 */}
                <div 
                  className="absolute h-full bg-white rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                
                {/* 可拖动的进度条 */}
                <input 
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            
            {/* 控制按钮 */}
            <div className="flex justify-center items-center mb-4 gap-8">
              <button 
                onClick={playPrevSong}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 20L9 12L19 4V20Z" fill="currentColor"/>
                  <path d="M7 4H5V20H7V4Z" fill="currentColor"/>
                </svg>
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 8V16M14 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
              
              <button 
                onClick={playNextSong}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 4L15 12L5 20V4Z" fill="currentColor"/>
                  <path d="M17 4H19V20H17V4Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            
            {/* 音量控制 */}
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-white mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {volume > 0.1 && (
                  <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 12C17.0039 13.3308 16.4774 14.6024 15.54 15.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                )}
                {volume > 0.5 && (
                  <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                )}
              </svg>
              
              <input 
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              
              <span className="text-white text-xs ml-2 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 控制栏 */}
      <div 
        className="bg-black/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-t border-white/10"
      >
        <div className="flex items-center space-x-3">
          <button 
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 9V15M14 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L21 12L9 18V6Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          <div>
            <h3 className="text-white text-sm font-medium">{currentSong.title}</h3>
            <p className="text-white/70 text-xs">{currentSong.artist}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlaylist}
            className="text-white/80 hover:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8H20M4 16H20M4 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="w-24 h-1 bg-white/20 rounded-full relative overflow-hidden">
            <div 
              className="absolute h-full bg-white rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer; 