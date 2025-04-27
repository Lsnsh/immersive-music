import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Star } from '@/types/starry-sky';

interface StarsProps {
  stars: Star[];
}

const Stars: React.FC<StarsProps> = ({ stars }) => {
  // 限制星星数量，确保移动端性能
  const maxStars = typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 200;
  const visibleStars = stars.slice(0, maxStars);
  
  return (
    <>
      {visibleStars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white shadow-glow"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            willChange: 'opacity',
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.8})`,
            zIndex: 5
          }}
          initial={{ opacity: star.opacity }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
          }}
          transition={{
            duration: star.blinkDuration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop"
          }}
        />
      ))}
    </>
  );
};

export default memo(Stars); 