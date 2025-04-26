'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import Playlist from './Playlist';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import songs from '@/data/songs';

interface MusicPlayerProps {
  initialVolume?: number;
  autoplay?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  initialVolume = 0.5,
  autoplay = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
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
    <>
      {/* 迷你播放器（底部固定） */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-t border-white/10 text-white z-10"
        animate={{ y: isExpanded ? '100%' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="container mx-auto p-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center">
            <button 
              className="w-8 h-8 flex items-center justify-center text-white mr-3"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <div>
              <div className="font-medium">{currentSong.title}</div>
              <div className="text-xs text-gray-300">{currentSong.artist}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              className="w-8 h-8 flex items-center justify-center text-white mx-1"
              onClick={togglePlaylist}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </button>
            
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white mx-1">
              <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* 进度条 */}
        <ProgressBar 
          currentTime={currentTime}
          duration={duration}
          loadedPercentage={loadedPercentage}
          handleSeek={handleSeek}
          mini={true}
        />
      </motion.div>
      
      {/* 扩展播放器 */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/70 backdrop-blur-lg text-white p-6 pt-10 z-20 overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: isExpanded ? 0 : '100%' }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto max-w-4xl">
          {/* 关闭按钮 */}
          <button 
            className="absolute top-4 right-6 text-white opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => setIsExpanded(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* 歌曲信息 */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-1">{currentSong.title}</h3>
            <p className="text-gray-300">{currentSong.artist}</p>
          </div>
          
          {/* 进度和控制 */}
          <div className="mb-6">
            <ProgressBar 
              currentTime={currentTime}
              duration={duration}
              loadedPercentage={loadedPercentage}
              handleSeek={handleSeek}
              formatTime={formatTime}
              mini={false}
            />
          </div>
          
          {/* 播放控制 */}
          <PlayerControls 
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            playNextSong={playNextSong}
            playPrevSong={playPrevSong}
          />
          
          {/* 音量控制 */}
          <VolumeControl 
            volume={volume} 
            handleVolumeChange={handleVolumeChange} 
          />
        </div>
      </motion.div>
      
      {/* 播放列表 */}
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
    </>
  );
};

export default MusicPlayer; 