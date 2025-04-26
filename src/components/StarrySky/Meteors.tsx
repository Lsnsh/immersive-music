import React from 'react';
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
            className="absolute will-change-transform"
            style={{
              left: `${meteor.startX}%`,
              top: `${meteor.startY}%`,
              width: '1px',
              height: '1px',
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
              }}
            />
          </motion.div>
        )
      ))}
    </>
  );
};

export default Meteors; 