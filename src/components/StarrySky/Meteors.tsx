import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Meteor } from '@/types/starry-sky';

interface MeteorsProps {
  meteors: Meteor[];
  onMeteorComplete: (id: number) => void;
}

const Meteors: React.FC<MeteorsProps> = ({ meteors, onMeteorComplete }) => {
  // 移动端减少流星数量和动画复杂度
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // 筛选活跃的流星，在移动端设备上限制数量
  const visibleMeteors = meteors
    .filter(meteor => meteor.active)
    .slice(0, isMobile ? 2 : 5);
  
  return (
    <>
      {visibleMeteors.map(meteor => (
        <motion.div
          key={`meteor-${meteor.id}`}
          className="absolute"
          style={{
            left: `${meteor.startX}%`,
            top: `${meteor.startY}%`,
            width: '1px',
            height: '1px',
            zIndex: 10,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            x: [`${meteor.startX}%`, `${meteor.endX}%`],
            y: [`${meteor.startY}%`, `${meteor.endY}%`],
          }}
          transition={{ 
            duration: meteor.duration,
            ease: "easeOut",
          }}
          onAnimationComplete={() => {
            onMeteorComplete(meteor.id);
          }}
        >
          <div 
            className="absolute bg-gradient-to-r from-white to-transparent"
            style={{
              width: `${isMobile ? meteor.width * 0.7 : meteor.width}px`,
              height: '2px',
              transformOrigin: 'left center',
              transform: 'rotate(45deg)',
              filter: 'blur(0.5px)',
            }}
          />
        </motion.div>
      ))}
    </>
  );
};

export default memo(Meteors); 