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
  // 检测是否为移动设备
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-black/80 backdrop-blur-lg border border-white/10 rounded-t-xl md:rounded-xl w-full md:w-auto md:max-w-lg max-h-[70vh] overflow-hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-white font-medium">播放列表</h3>
          <button 
            className="text-white/70 hover:text-white"
            onClick={onClose}
            aria-label="关闭播放列表"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* 歌曲列表 */}
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          <ul className="divide-y divide-white/10">
            {songs.map((song, index) => (
              <li 
                key={song.id}
                className={`px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors ${index === currentSongIndex ? 'bg-white/10' : ''}`}
                onClick={() => {
                  playSong(index);
                  if (isMobile) onClose(); // 在移动端点击后自动关闭
                }}
              >
                <div className="flex items-center">
                  {/* 播放状态指示器 */}
                  <div className="flex-none w-8 h-8 flex items-center justify-center">
                    {index === currentSongIndex ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
                      </svg>
                    ) : (
                      <span className="text-white/50">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* 歌曲信息 */}
                  <div className="ml-2 flex-grow">
                    <div className="text-white font-medium text-sm">{song.title}</div>
                    <div className="text-white/60 text-xs">{song.artist}</div>
                  </div>
                  
                  {/* 时长（如果有） */}
                  {song.duration && (
                    <div className="text-white/60 text-xs">
                      {Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Playlist; 