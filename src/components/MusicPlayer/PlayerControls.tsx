import React from 'react';

interface PlayerControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  playNextSong: () => void;
  playPrevSong: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  togglePlay,
  playNextSong,
  playPrevSong
}) => {
  return (
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
  );
};

export default PlayerControls; 