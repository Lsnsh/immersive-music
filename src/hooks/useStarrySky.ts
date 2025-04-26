import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Meteor } from '@/types/starry-sky';

export const useStarrySky = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  }));
  const initialized = useRef(false);

  // 生成星星
  useEffect(() => {
    // 确保只初始化一次
    if (initialized.current) return;
    initialized.current = true;
    
    // 立即创建一些星星
    const generateInitialStars = () => {
      // 使用当前dimensions值
      const { width, height } = dimensions;
      
      // 增加星星数量，让星空更密集
      const starCount = Math.floor((width * height) / 600);
      const initialStars: Star[] = [];
      
      for (let i = 0; i < starCount; i++) {
        initialStars.push({
          id: i,
          x: Math.random() * 100, // 使用百分比
          y: Math.random() * 100, // 使用百分比
          size: Math.random() * 2 + 0.8, // 0.8-2.8px，增加大小
          opacity: Math.random() * 0.5 + 0.5, // 0.5-1
          blinkDuration: Math.random() * 3 + 2, // 2-5秒
        });
      }
      
      setStars(initialStars);
    };
    
    // 确保在DOM挂载后立即执行
    if (typeof window !== 'undefined') {
      // 使用setTimeout确保DOM已经挂载
      setTimeout(generateInitialStars, 0);
    }
    
    // 浏览器调整大小时更新星星数量
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      
      // 更新星星数量，保证在任何屏幕尺寸上都有足够的星星
      const starCount = Math.floor((width * height) / 600);
      
      setStars(prevStars => {
        if (prevStars.length < starCount) {
          // 如果当前星星数不足，添加更多
          const newStars = [...prevStars];
          for (let i = prevStars.length; i < starCount; i++) {
            newStars.push({
              id: i,
              x: Math.random() * 100,
              y: Math.random() * 100,
              size: Math.random() * 2 + 0.8,
              opacity: Math.random() * 0.5 + 0.5,
              blinkDuration: Math.random() * 3 + 2,
            });
          }
          return newStars;
        } else if (prevStars.length > starCount * 1.5) {
          // 如果星星太多，减少一些
          return prevStars.slice(0, starCount);
        }
        return prevStars;
      });
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [dimensions]);

  // 生成流星
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 初始化流星数组
    const initialMeteors: Meteor[] = Array(5).fill(null).map((_, i) => ({
      id: i,
      startX: 0,
      startY: 0, 
      endX: 0,
      endY: 0,
      duration: 0,
      width: 0,
      active: false
    }));
    
    setMeteors(initialMeteors);
    
    // 随机触发流星
    const triggerMeteor = () => {
      setMeteors(prev => {
        // 找到一个非活动的流星
        const inactiveMeteorIndex = prev.findIndex(m => !m.active);
        if (inactiveMeteorIndex === -1) return prev;
        
        const newMeteors = [...prev];
        const startX = Math.random() * 30 + 10; // 10%-40%位置
        const startY = Math.random() * 20; // 0-20%位置
        const distance = Math.random() * 40 + 20; // 移动距离 20-60
        const angle = Math.PI / 4 + (Math.random() * Math.PI / 4); // 45-90度角
        
        newMeteors[inactiveMeteorIndex] = {
          ...newMeteors[inactiveMeteorIndex],
          startX,
          startY,
          endX: startX + distance * Math.cos(angle),
          endY: startY + distance * Math.sin(angle),
          duration: Math.random() * 1 + 0.5, // 0.5-1.5秒
          width: Math.random() * 100 + 50, // 流星长度
          active: true
        };
        
        return newMeteors;
      });
    };
    
    // 定时触发流星
    const interval = setInterval(() => {
      // 20%概率触发流星，优化性能
      if (Math.random() < 0.2) {
        triggerMeteor();
      }
    }, 3000); // 延长间隔提高性能
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // 处理流星完成动画
  const setMeteorsState = useCallback((meteorId: number) => {
    setMeteors(prev => 
      prev.map(m => m.id === meteorId ? { ...m, active: false } : m)
    );
  }, []);

  return {
    stars,
    meteors,
    dimensions,
    setMeteorsState
  };
}; 