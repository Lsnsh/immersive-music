import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  loadedPercentage: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime?: (time: number) => string;
  mini?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  loadedPercentage,
  handleSeek,
  formatTime,
  mini = false
}) => {
  // 如果没有提供格式化函数，使用默认的
  const formatTimeDefault = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const timeFormatter = formatTime || formatTimeDefault;
  const playbackPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  if (mini) {
    return (
      <div className="h-1 bg-black/50">
        <div 
          className="h-full bg-white/20"
          style={{ width: `${loadedPercentage}%` }}
        />
        <div 
          className="h-full bg-white relative -mt-1"
          style={{ width: `${playbackPercentage}%` }}
        >
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
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-white/80 text-xs font-medium">
          {timeFormatter(currentTime)}
        </span>
        <span className="text-white/80 text-xs font-medium">
          {timeFormatter(duration)}
        </span>
      </div>
      
      <div className="h-1.5 bg-white/10 rounded-full relative">
        {/* 加载进度 */}
        <div 
          className="absolute h-full bg-white/20 rounded-full"
          style={{ width: `${loadedPercentage}%` }}
        />
        
        {/* 播放进度 */}
        <div 
          className="absolute h-full bg-white rounded-full"
          style={{ width: `${playbackPercentage}%` }}
        />
        
        {/* 可拖动按钮 */}
        <div 
          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md top-1/2 -translate-y-1/2 -ml-1.5"
          style={{ left: `${playbackPercentage}%` }}
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
  );
};

export default ProgressBar; 