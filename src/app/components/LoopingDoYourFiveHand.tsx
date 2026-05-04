import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const HAND_FRAMES = [
  {
    label: "Stop",
    imageSrc: "/do-your-five-loop/stop.png",
  },
  {
    label: "Calm your Thinking",
    imageSrc: "/do-your-five-loop/calm.png",
  },
  {
    label: "Position",
    imageSrc: "/do-your-five-loop/position.png",
  },
  {
    label: "Breathe Out Slowly",
    imageSrc: "/do-your-five-loop/blow-air.png",
  },
  {
    label: "Airflow/Cool",
    imageSrc: "/do-your-five-loop/fan.png",
  },
] as const;

export default function LoopingDoYourFiveHand({
  className = "",
  showLabel = true,
  handClassName = "w-[11.5rem]",
}: {
  className?: string;
  showLabel?: boolean;
  handClassName?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HAND_FRAMES.length);
    }, 1600);

    return () => window.clearInterval(timer);
  }, []);

  const activeFrame = HAND_FRAMES[activeIndex];

  return (
    <div className={className}>
      {showLabel && (
        <div className="mx-auto text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#319A50]">
            Do Your Five
          </p>
        </div>
      )}

      <div
        className={`relative mx-auto ${showLabel ? "mt-3" : ""} ${handClassName}`}
        style={{ aspectRatio: "262 / 378" }}
        aria-label="Animated hand guide cycling through the five steps"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={activeFrame.imageSrc}
            src={activeFrame.imageSrc}
            alt={`${activeFrame.label} hand guide`}
            className="absolute inset-0 h-full w-full object-contain select-none"
            initial={{ opacity: 0, scale: 0.985, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.015, y: -4 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
