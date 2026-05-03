import { useEffect, useState, type CSSProperties } from "react";

type Phase = "inhale_top" | "exhale_right" | "inhale_bottom" | "exhale_left";

const PHASE_CONFIG: Record<Phase, { label: string; duration: number }> = {
  inhale_top: { label: "Breathe In", duration: 2000 },
  exhale_right: { label: "Breathe Out", duration: 4000 },
  inhale_bottom: { label: "Breathe In", duration: 2000 },
  exhale_left: { label: "Breathe Out", duration: 4000 },
};

const PHASE_ORDER: Phase[] = ["inhale_top", "exhale_right", "inhale_bottom", "exhale_left"];

function EdgeGuideOverlay({ phase, progress }: { phase: Phase; progress: number }) {
  const getSideDraw = (sidePhase: Phase) => {
    const currentIndex = PHASE_ORDER.indexOf(phase);
    const sideIndex = PHASE_ORDER.indexOf(sidePhase);

    if (sideIndex < currentIndex) return 1;
    if (sideIndex === currentIndex) return progress;
    return 0;
  };

  const glowStyle = "0 0 20px 8px rgba(49,154,80,0.52), 0 0 45px 15px rgba(49,154,80,0.18)";

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex justify-center">
      <div className="relative h-[100dvh] w-full max-w-md">
        <div
          className="absolute left-0 top-0 h-[12px] bg-[#319A50]"
          style={{ width: `${getSideDraw("inhale_top") * 100}%`, boxShadow: glowStyle }}
        />
        <div
          className="absolute right-0 top-0 w-[12px] bg-[#319A50]"
          style={{ height: `${getSideDraw("exhale_right") * 100}%`, boxShadow: glowStyle }}
        />
        <div
          className="absolute bottom-0 right-0 h-[12px] bg-[#319A50]"
          style={{ width: `${getSideDraw("inhale_bottom") * 100}%`, boxShadow: glowStyle }}
        />
        <div
          className="absolute bottom-0 left-0 w-[12px] bg-[#319A50]"
          style={{ height: `${getSideDraw("exhale_left") * 100}%`, boxShadow: glowStyle }}
        />

        <MovingDot phase={phase} progress={progress} />
      </div>
    </div>
  );
}

function MovingDot({ phase, progress }: { phase: Phase; progress: number }) {
  const edgeOffset = 6;
  const base: CSSProperties = {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: "999px",
    backgroundColor: "#ffffff",
    border: "4px solid #319A50",
    boxShadow: "0 0 18px 8px rgba(49,154,80,0.55), 0 0 35px 12px rgba(49,154,80,0.18)",
  };

  let style: CSSProperties;

  switch (phase) {
    case "inhale_top":
      style = { ...base, top: edgeOffset, left: `${progress * 100}%`, transform: "translate(-50%, -50%)" };
      break;
    case "exhale_right":
      style = { ...base, top: `${progress * 100}%`, right: 0, left: "auto", transform: "translate(50%, -50%)" };
      break;
    case "inhale_bottom":
      style = { ...base, bottom: 0, top: "auto", left: `${(1 - progress) * 100}%`, transform: "translate(-50%, 50%)" };
      break;
    case "exhale_left":
      style = { ...base, top: `${(1 - progress) * 100}%`, left: edgeOffset, transform: "translate(-50%, -50%)" };
      break;
  }

  return <div style={style} />;
}

export default function BoxBreathingGuide({ compact = false }: { compact?: boolean }) {
  const [phase, setPhase] = useState<Phase>("inhale_top");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let phaseIndex = 0;
    let startedAt = performance.now();
    let duration = PHASE_CONFIG[PHASE_ORDER[0]].duration;

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const fraction = Math.min(elapsed / duration, 1);
      setProgress(fraction);

      if (elapsed >= duration) {
        phaseIndex = (phaseIndex + 1) % PHASE_ORDER.length;
        const nextPhase = PHASE_ORDER[phaseIndex];
        duration = PHASE_CONFIG[nextPhase].duration;
        startedAt = now;
        setPhase(nextPhase);
        setProgress(0);
      }

      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isInhale = phase === "inhale_top" || phase === "inhale_bottom";
  const minDiameter = compact ? 40 : 48;
  const maxGrowth = compact ? 68 : 88;
  const maxDiameter = minDiameter + maxGrowth;
  const diameter = isInhale ? minDiameter + progress * maxGrowth : maxDiameter - progress * maxGrowth;
  const labelClassName = compact
    ? "min-h-[2.75rem] text-[2rem] font-bold leading-[1.02]"
    : "min-h-[3.5rem] text-[2.6rem] font-bold leading-[1.02]";
  const orbHeight = compact ? 112 : 144;
  const orbBorderWidth = compact ? 2.5 : 3;

  return (
    <>
      <EdgeGuideOverlay phase={phase} progress={progress} />

      <div className="relative z-20 text-center">
        <p
          className={`${labelClassName} transition-colors ${
            isInhale ? "text-[#319A50]" : "text-[#5A8BAF]"
          }`}
        >
          {PHASE_CONFIG[phase].label}
        </p>

        <div className={compact ? "mt-4 flex items-center justify-center" : "mt-6 flex items-center justify-center"} style={{ height: orbHeight }}>
          <div
            className="rounded-full"
            style={{
              width: `${diameter}px`,
              height: `${diameter}px`,
              backgroundColor: isInhale ? "rgba(49,154,80,0.14)" : "rgba(90,139,175,0.14)",
              border: `${orbBorderWidth}px solid ${isInhale ? "rgba(49,154,80,0.28)" : "rgba(90,139,175,0.28)"}`,
              transition: "background-color 300ms ease, border-color 300ms ease",
            }}
          />
        </div>
      </div>
    </>
  );
}
