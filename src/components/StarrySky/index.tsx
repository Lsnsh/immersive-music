"use client";

import { useRef, memo, useEffect } from "react";
import Stars from "./Stars";
import Meteors from "./Meteors";
import { useStarrySky } from "@/hooks/useStarrySky";

const StarrySky: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stars, meteors, setMeteorsState } = useStarrySky();

  // 开发模式下检查状态
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("StarrySky rendered with stars count:", stars.length);
    }
  }, [stars.length]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #000000, #050523, #090931)",
        perspective: "1000px",
        width: "100vw",
        height: "100vh",
        willChange: "transform",
        backfaceVisibility: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
      data-testid="starry-sky"
      aria-hidden="true"
    >
      {/* 星星容器 */}
      {/* 流星容器 */}
      <div className="absolute top-0 bottom-0 left-0 right-0 inset-0">
        <Stars stars={stars} />
        <Meteors meteors={meteors} onMeteorComplete={setMeteorsState} />
      </div>
    </div>
  );
};

export default memo(StarrySky);
