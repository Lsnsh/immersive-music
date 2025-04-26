'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import songs from '@/data/songs';

interface MusicPlayerProps {
  initialVolume?: number;
  autoplay?: boolean;
}

// 本地存储键
const STORAGE_KEYS = {
  CURRENT_SONG: 'immersive_music_current_song',
  VOLUME: 'immersive_music_volume',
  PLAY_POSITION: 'immersive_music_play_position',
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  initialVolume = 0.5,
  autoplay = true
}) => {
  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [volume, setVolume] = useState(() => {
    // 从本地存储加载音量
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
      return savedVolume ? parseFloat(savedVolume) : initialVolume;
    }
    return initialVolume;
  });
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  
  // 播放列表状态
  const [currentSongIndex, setCurrentSongIndex] = useState(() => {
    // 从本地存储加载当前歌曲索引
    if (typeof window !== 'undefined') {
      const savedIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_SONG);
      return savedIndex ? parseInt(savedIndex, 10) : 0;
    }
    return 0;
  });
  const currentSong = songs[currentSongIndex];
  
  // refs
  const soundRef = useRef<Howl | null>(null);
  const animationRef = useRef<number | null>(null);
  const playerInitialized = useRef(false);
  const audioCache = useRef<Map<string, ArrayBuffer>>(new Map());

  // 保存当前歌曲索引到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SONG, currentSongIndex.toString());
    }
  }, [currentSongIndex]);

  // 保存音量到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    }
  }, [volume]);

  // 保存播放位置到本地存储（定期保存）
  useEffect(() => {
    if (typeof window === 'undefined' || !isPlaying) return;
    
    const saveInterval = setInterval(() => {
      if (soundRef.current) {
        const position = soundRef.current.seek();
        localStorage.setItem(STORAGE_KEYS.PLAY_POSITION, position.toString());
      }
    }, 5000); // 每5秒保存一次
    
    return () => clearInterval(saveInterval);
  }, [isPlaying]);

  // 缓存音频文件
  const cacheAudioFile = useCallback(async (src: string): Promise<ArrayBuffer | null> => {
    // 检查是否已缓存
    if (audioCache.current.has(src)) {
      return audioCache.current.get(src) || null;
    }
    
    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      
      // 存储到内存缓存
      audioCache.current.set(src, arrayBuffer);
      
      // 尝试使用IndexedDB进行持久化存储 (简化处理，实际项目中应完善IndexedDB逻辑)
      try {
        const request = indexedDB.open('AudioCache', 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('audio')) {
            db.createObjectStore('audio');
          }
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['audio'], 'readwrite');
          const store = transaction.objectStore('audio');
          
          // 使用音频URL作为键
          store.put(arrayBuffer, src);
        };
      } catch (error) {
        console.warn('IndexedDB存储失败，回退到内存缓存', error);
      }
      
      return arrayBuffer;
    } catch (error) {
      console.error('音频缓存失败:', error);
      return null;
    }
  }, []);

  // 从缓存加载音频文件
  const loadAudioFromCache = useCallback(async (src: string): Promise<string | null> => {
    // 首先尝试从IndexedDB加载
    try {
      const request = indexedDB.open('AudioCache', 1);
      
      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('audio')) {
            resolve(src); // 如果存储不存在，使用原始URL
            return;
          }
          
          const transaction = db.transaction(['audio'], 'readonly');
          const store = transaction.objectStore('audio');
          const getRequest = store.get(src);
          
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              // 创建Blob URL
              const blob = new Blob([getRequest.result]);
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              // 如果没有找到缓存，使用原始URL并尝试缓存
              cacheAudioFile(src).catch(console.error);
              resolve(src);
            }
          };
          
          getRequest.onerror = () => {
            resolve(src); // 出错时使用原始URL
          };
        };
        
        request.onerror = () => {
          resolve(src); // 出错时使用原始URL
        };
      });
    } catch (error) {
      console.warn('从IndexedDB加载失败，使用原始URL', error);
      return src;
    }
  }, [cacheAudioFile]);

  // 修复音乐文件路径函数
  const getCorrectPath = (path: string): string => {
    // 检查是否在生产环境
    if (process.env.NODE_ENV === 'production') {
      // 为GitHub Pages添加前缀
      if (path.startsWith('/')) {
        return `/immersive-music${path}`;
      }
      return `/immersive-music/${path}`;
    }
    return path;
  };

  // 初始化和卸载音频
  const initializeAudio = useCallback(async (songSrc: string) => {
    // 如果已有实例，先卸载
    if (soundRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      soundRef.current.unload();
      soundRef.current = null;
    }

    // 获取正确的路径
    const correctPath = getCorrectPath(songSrc);
    
    // 尝试从缓存加载音频
    const audioSrc = await loadAudioFromCache(correctPath);
    
    // 创建新的Howl实例
    soundRef.current = new Howl({
      src: [audioSrc || correctPath],
      volume: volume,
      html5: true,
      onload: () => {
        if (soundRef.current) {
          setDuration(soundRef.current.duration());
          
          // 从本地存储恢复播放位置
          const savedPosition = localStorage.getItem(STORAGE_KEYS.PLAY_POSITION);
          if (savedPosition) {
            const position = parseFloat(savedPosition);
            // 仅当保存的是当前歌曲的位置时才恢复
            if (position > 0 && position < soundRef.current.duration()) {
              soundRef.current.seek(position);
              setCurrentTime(position);
            }
          }
          
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
      onloaderror: (_id, error) => {
        console.error('音频加载错误:', error);
        playNextSong(); // 出错时尝试播放下一首
      },
      onseek: () => {
        // 更新当前时间
        if (soundRef.current) {
          setCurrentTime(soundRef.current.seek() as number);
        }
      }
    });

    // 开始预缓存下一首歌
    const nextIndex = (currentSongIndex + 1) % songs.length;
    cacheAudioFile(songs[nextIndex].src).catch(console.error);
  }, [volume, autoplay, loadAudioFromCache, cacheAudioFile, currentSongIndex]);

  // 首次加载时初始化第一首歌
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
    // 打开播放列表时关闭扩展播放器
    if (!showPlaylist && isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* 播放列表 */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-black/80 backdrop-blur-lg p-4 border-t border-white/10 max-h-72 overflow-y-auto rounded-t-xl mx-2 mb-1 shadow-lg"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-base">播放列表</h3>
              <button 
                onClick={() => setShowPlaylist(false)}
                className="text-white/70 hover:text-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {songs.map((song, index) => (
                <div 
                  key={song.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${
                    currentSongIndex === index 
                      ? 'bg-white/20 text-white' 
                      : 'hover:bg-white/10 text-white/70'
                  }`}
                  onClick={() => playSong(index)}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3">
                    {currentSongIndex === index && isPlaying ? (
                      <div className="flex gap-[2px] items-center">
                        <span className="w-[3px] h-6 bg-white/80 animate-music-bar-1"></span>
                        <span className="w-[3px] h-5 bg-white/80 animate-music-bar-2"></span>
                        <span className="w-[3px] h-4 bg-white/80 animate-music-bar-3"></span>
                      </div>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 6L21 12L9 18V6Z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium text-sm truncate">{song.title}</p>
                    <p className="text-xs opacity-80 truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 可展开的播放器 - Apple Music风格 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-lg p-5 border-t border-white/10 rounded-t-xl mx-2 mb-1 shadow-xl"
          >
            {/* 滑块控制 */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-white/80 text-xs font-medium">
                  {formatTime(currentTime)}
                </span>
                <span className="text-white/80 text-xs font-medium">
                  {formatTime(duration)}
                </span>
              </div>
              
              {/* 进度条 - Apple Music风格 */}
              <div className="h-1.5 bg-white/10 rounded-full relative">
                {/* 加载进度 */}
                <div 
                  className="absolute h-full bg-white/20 rounded-full"
                  style={{ width: `${loadedPercentage}%` }}
                />
                
                {/* 播放进度 */}
                <div 
                  className="absolute h-full bg-white rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                
                {/* 可拖动按钮 */}
                <div 
                  className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md top-1/2 -translate-y-1/2 -ml-1.5"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
                
                {/* 可拖动的进度条 */}
                <input 
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  aria-label="调整进度"
                />
              </div>
            </div>
            
            {/* 歌曲信息 */}
            <div className="text-center mb-6">
              <h2 className="text-white text-lg font-bold tracking-tight">{currentSong.title}</h2>
              <p className="text-white/70 text-sm">{currentSong.artist}</p>
            </div>
            
            {/* 控制按钮 */}
            <div className="flex justify-center items-center mb-6 gap-8">
              <button 
                onClick={playPrevSong}
                className="text-white/90 hover:text-white transition-colors"
                aria-label="上一曲"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 20L9 12L19 4V20Z" fill="currentColor"/>
                  <path d="M7 4H5V20H7V4Z" fill="currentColor"/>
                </svg>
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105 active:scale-95"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 8V16M14 8V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
              
              <button 
                onClick={playNextSong}
                className="text-white/90 hover:text-white transition-colors"
                aria-label="下一曲"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 4L15 12L5 20V4Z" fill="currentColor"/>
                  <path d="M17 4H19V20H17V4Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            
            {/* 音量控制 */}
            <div className="flex items-center space-x-2 max-w-sm mx-auto">
              <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                {volume > 0.1 && (
                  <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 12C17.0039 13.3308 16.4774 14.6024 15.54 15.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                )}
                {volume > 0.5 && (
                  <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                aria-label="调整音量"
              />
              
              <span className="text-white/70 text-xs w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 固定控制栏 - Apple Music风格 */}
      <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-t border-white/10 shadow-2xl mx-1 mb-1 rounded-lg">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white text-black shadow-md transition-transform active:scale-95"
            aria-label={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 9V15M14 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L21 12L9 18V6Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          <div className="flex-1 min-w-0 truncate">
            <h3 className="text-white text-sm font-medium truncate">{currentSong.title}</h3>
            <p className="text-white/70 text-xs truncate">{currentSong.artist}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={togglePlaylist}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="播放列表"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8H20M4 16H20M4 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="hidden sm:block w-32 h-1 bg-white/20 rounded-full relative overflow-hidden">
            <div 
              className="absolute h-full bg-white rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label={isExpanded ? "收起" : "展开"}
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
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