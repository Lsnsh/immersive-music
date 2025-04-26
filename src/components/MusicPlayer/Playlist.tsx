import React from 'react';
import { motion } from 'framer-motion';
import { Song } from '@/data/songs';

interface PlaylistProps {
  songs: Song[];
  currentSongIndex: number;
  playSong: (index: number) => void;
  onClose: () => void;
}

const Playlist: React.FC<PlaylistProps> = ({ songs, currentSongIndex, playSong, onClose }) => {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-16 left-0 right-0 z-30 bg-black/80 backdrop-blur-lg p-4 border-t border-white/10 max-h-72 overflow-y-auto rounded-t-xl mx-2 mb-1 shadow-lg"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-base">播放列表</h3>
        <button 
          onClick={onClose}
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
              {currentSongIndex === index ? (
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
  );
};

export default Playlist; 