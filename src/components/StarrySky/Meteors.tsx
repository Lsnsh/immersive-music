import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Meteor } from '@/types/starry-sky';

interface MeteorsProps {
  meteors: Meteor[];
  onMeteorComplete: (id: number) => void;
}

const Meteors: React.FC<MeteorsProps> = ({ meteors, onMeteorComplete }) => {
  return (
    <>
      {meteors.map(meteor => (
        meteor.active && (
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
                width: `${meteor.width}px`,
                height: '2px',
                transformOrigin: 'left center',
                transform: 'rotate(45deg)',
                filter: 'blur(0.5px)',
              }}
            />
          </motion.div>
        )
      ))}
    </>
  );
};

export default memo(Meteors); 