import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Meteor } from '@/types/starry-sky';

export const useStarrySky = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const initialized = useRef(false);

  // 生成星星
  useEffect(() => {
    // 确保只初始化一次
    if (initialized.current) return;
    initialized.current = true;
    
    // 立即创建一些星星，无需等待DOM挂载完成
    const generateInitialStars = () => {
      // 使用屏幕尺寸作为初始尺寸
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // 增加星星数量，基于尺寸计算但更密集
      const starCount = Math.floor((width * height) / 600);
      const initialStars: Star[] = [];
      
      for (let i = 0; i < starCount; i++) {
        initialStars.push({
          id: i,
          x: Math.random() * 100, // 使用百分比
          y: Math.random() * 100, // 使用百分比
          size: Math.random() * 2 + 0.5, // 0.5-2.5px
          opacity: Math.random() * 0.5 + 0.5, // 0.5-1
          blinkDuration: Math.random() * 3 + 2, // 2-5秒
        });
      }
      
      setStars(initialStars);
      setDimensions({ width, height });
    };
    
    // 确保在DOM挂载后执行
    if (typeof window !== 'undefined') {
      generateInitialStars();
    }
    
    // 浏览器调整大小时更新星星数量
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      
      // 更新星星数量
      const starCount = Math.floor((width * height) / 600);
      
      // 如果当前星星数不足，添加更多
      if (stars.length < starCount) {
        const newStars = [...stars];
        for (let i = stars.length; i < starCount; i++) {
          newStars.push({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.5,
            blinkDuration: Math.random() * 3 + 2,
          });
        }
        setStars(newStars);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [stars.length]);

  // 生成流星
  useEffect(() => {
    if (dimensions.width === 0 || typeof window === 'undefined') return;
    
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
      // 增加概率到25%
      if (Math.random() < 0.25) {
        triggerMeteor();
      }
    }, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, [dimensions]);

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