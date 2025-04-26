import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import songs from '@/data/songs';

interface MusicPlayerOptions {
  initialVolume?: number;
  autoplay?: boolean;
}

// 本地存储键
const STORAGE_KEYS = {
  CURRENT_SONG: 'immersive_music_current_song',
  VOLUME: 'immersive_music_volume',
  PLAY_POSITION: 'immersive_music_play_position',
};

export const useMusicPlayer = ({ initialVolume = 0.5, autoplay = true }: MusicPlayerOptions) => {
  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
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
      
      // 尝试使用IndexedDB进行持久化存储
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
    
    const currentSong = songs[currentSongIndex];
    if (!playerInitialized.current && currentSong) {
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
  }, [initializeAudio, currentSongIndex]);

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

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    loadedPercentage,
    currentSongIndex,
    togglePlay,
    playNextSong,
    playPrevSong,
    playSong,
    handleVolumeChange,
    handleSeek,
    formatTime
  };
}; 