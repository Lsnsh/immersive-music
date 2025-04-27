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
  // 默认时间格式化函数
  const defaultFormatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // 使用提供的格式化函数或默认函数
  const format = formatTime || defaultFormatTime;
  
  // 计算进度百分比
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className={`w-full px-2 ${mini ? 'pb-2' : 'pb-4'}`}>
      {/* 带时间显示的进度条 */}
      <div className="flex flex-col">
        {/* 进度条 */}
        <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
          {/* 缓冲条 */}
          <div 
            className="absolute top-0 left-0 h-full bg-white/20"
            style={{ width: `${loadedPercentage}%` }}
          />
          
          {/* 进度条 */}
          <div 
            className="absolute top-0 left-0 h-full bg-white"
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* 滑块输入 */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="进度条"
          />
        </div>
        
        {/* 时间显示 */}
        {!mini && (
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{format(currentTime)}</span>
            <span>{format(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar; 