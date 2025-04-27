'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import songs from '@/data/songs';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import Playlist from './Playlist';

interface MusicPlayerProps {
  initialVolume?: number;
  autoplay?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  initialVolume = 0.5,
  autoplay = true
}) => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const { 
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
  } = useMusicPlayer({ initialVolume, autoplay });

  const currentSong = songs[currentSongIndex];
  
  const togglePlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylist(prev => !prev);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      {/* 播放器主体 - 自适应移动端和桌面 */}
      <div className="bg-black/60 backdrop-blur-lg border-t border-white/10 text-white shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col">
            {/* 主要控制区 */}
            <div className="flex items-center justify-between py-3">
              {/* 播放/暂停按钮 */}
              <button 
                className="flex-none w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-full"
                onClick={togglePlay}
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              {/* 歌曲信息 */}
              <div className="flex-grow mx-3 truncate">
                <div className="font-medium text-sm md:text-base truncate">{currentSong.title}</div>
                <div className="text-xs text-gray-300 truncate">{currentSong.artist}</div>
              </div>
              
              {/* 右侧控制按钮组 */}
              <div className="flex items-center space-x-2">
                {/* 上一首/下一首按钮 - 仅在较大屏幕上显示 */}
                {!isMobile && (
                  <>
                    <button 
                      className="w-8 h-8 flex items-center justify-center text-white"
                      onClick={playPrevSong}
                      aria-label="上一首"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                      </svg>
                    </button>
                    
                    <button 
                      className="w-8 h-8 flex items-center justify-center text-white"
                      onClick={playNextSong}
                      aria-label="下一首"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* 音量控制 - 仅在较大屏幕上显示 */}
                {!isMobile && (
                  <div className="w-20 ml-2">
                    <VolumeControl 
                      volume={volume} 
                      handleVolumeChange={handleVolumeChange} 
                    />
                  </div>
                )}
                
                {/* 播放列表按钮 */}
                <button 
                  className="w-8 h-8 flex items-center justify-center text-white"
                  onClick={togglePlaylist}
                  aria-label="播放列表"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* 进度条 */}
            <ProgressBar 
              currentTime={currentTime}
              duration={duration}
              loadedPercentage={loadedPercentage}
              handleSeek={handleSeek}
              formatTime={formatTime}
              mini={true}
            />
            
            {/* 移动端控制按钮组 - 仅在小屏幕显示 */}
            {isMobile && (
              <div className="flex justify-between items-center py-2 px-2">
                <button 
                  className="w-10 h-10 flex items-center justify-center text-white"
                  onClick={playPrevSong}
                  aria-label="上一首"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                  </svg>
                </button>
                
                <button 
                  className="w-10 h-10 flex items-center justify-center text-white"
                  onClick={playNextSong}
                  aria-label="下一首"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
                  </svg>
                </button>
                
                <div className="w-full max-w-[150px] px-2">
                  <VolumeControl 
                    volume={volume} 
                    handleVolumeChange={handleVolumeChange} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 播放列表弹出层 */}
      <AnimatePresence>
        {showPlaylist && (
          <Playlist 
            songs={songs}
            currentSongIndex={currentSongIndex}
            playSong={playSong}
            onClose={() => setShowPlaylist(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicPlayer; 