"use client";

import { useRef, memo, useEffect, useState } from "react";
import Stars from "./Stars";
import Meteors from "./Meteors";
import { useStarrySky } from "@/hooks/useStarrySky";

const StarrySky: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stars, meteors, setMeteorsState } = useStarrySky();
  const [isVisible, setIsVisible] = useState(true);

  // 检测可见性，提高性能
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // 适配移动端和桌面端
  const bgStyle = {
    background: "linear-gradient(to bottom, #000000, #050523, #090931)",
    perspective: "1000px",
    width: "100vw",
    height: "100vh",
    willChange: "transform",
    backfaceVisibility: "hidden" as const,
    zIndex: 0,
    pointerEvents: "none" as const,
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowX: "hidden" as const,
    overflowY: "hidden" as const,
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={bgStyle}
      data-testid="starry-sky"
      aria-hidden="true"
    >
      {/* 仅在可见时渲染星星和流星，优化性能 */}
      {isVisible && (
        <div className="absolute inset-0">
          <Stars stars={stars} />
          <Meteors meteors={meteors} onMeteorComplete={setMeteorsState} />
        </div>
      )}
    </div>
  );
};

export default memo(StarrySky);
