'use client';

import { useRef } from 'react';
import Stars from './Stars';
import Meteors from './Meteors';
import { useStarrySky } from '@/hooks/useStarrySky';

const StarrySky: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stars, meteors, setMeteorsState } = useStarrySky();

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 overflow-hidden z-[-1]"
      style={{ 
        background: '#000',
        perspective: '1000px',
        willChange: 'transform'
      }}
      data-testid="starry-sky"
      aria-hidden="true"
    >
      {/* 星星 */}
      <Stars stars={stars} />
      
      {/* 流星 */}
      <Meteors meteors={meteors} onMeteorComplete={setMeteorsState} />
    </div>
  );
};

export default StarrySky; 