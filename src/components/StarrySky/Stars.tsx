import React from 'react';
import { motion } from 'framer-motion';
import { Star } from '@/types/starry-sky';

interface StarsProps {
  stars: Star[];
}

const Stars: React.FC<StarsProps> = ({ stars }) => {
  return (
    <>
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white will-change-transform"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
          }}
          transition={{
            duration: star.blinkDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};

export default Stars; 