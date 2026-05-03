import { useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
import EpisodeLayout from "../components/EpisodeLayout";

type Phase = "inhale_top" | "exhale_right" | "inhale_bottom" | "exhale_left";

const PHASE_CONFIG: Record<Phase, { label: string; duration: number }> = {
  inhale_top: { label: "Breathe In", duration: 2000 },
  exhale_right: { label: "Breathe Out", duration: 4000 },
  inhale_bottom: { label: "Breathe In", duration: 2000 },
  exhale_left: { label: "Breathe Out", duration: 4000 },
};

const PHASE_ORDER: Phase[] = ["inhale_top", "exhale_right", "inhale_bottom", "exhale_left"];

function BreatheBorder({ phase, progress }: { phase: Phase; progress: number }) {
  const getSideDraw = (sidePhase: Phase) => {
    const currentIdx = PHASE_ORDER.indexOf(phase);
    const sideIdx = PHASE_ORDER.indexOf(sidePhase);
    if (sideIdx < currentIdx) return 1;
    if (sideIdx === currentIdx) return progress;
    return 0;
  };

  const glowStyle = "0 0 20px 8px rgba(49,154,80,0.5), 0 0 45px 15px rgba(49,154,80,0.2)";

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {/* Top - Breathe In */}
      <div
        className="absolute top-0 left-0 h-[14px] bg-[#319A50] origin-left"
        style={{ width: `${getSideDraw("inhale_top") * 100}%`, boxShadow: glowStyle }}
      />
      {/* Right - Breathe Out */}
      <div
        className="absolute top-0 right-0 w-[14px] bg-[#319A50] origin-top"
        style={{ height: `${getSideDraw("exhale_right") * 100}%`, boxShadow: glowStyle }}
      />
      {/* Bottom - Breathe In */}
      <div
        className="absolute bottom-0 right-0 h-[14px] bg-[#319A50] origin-right"
        style={{ width: `${getSideDraw("inhale_bottom") * 100}%`, boxShadow: glowStyle }}
      />
      {/* Left - Breathe Out */}
      <div
        className="absolute bottom-0 left-0 w-[14px] bg-[#319A50] origin-bottom"
        style={{ height: `${getSideDraw("exhale_left") * 100}%`, boxShadow: glowStyle }}
      />

      {/* Dot */}
      <DotIndicator phase={phase} progress={progress} />
    </div>
  );
}

function DotIndicator({ phase, progress }: { phase: Phase; progress: number }) {
  const half = 7;
  const base: React.CSSProperties = {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: "50%",
    backgroundColor: "#fff",
    border: "4px solid #319A50",
    boxShadow: "0 0 18px 8px rgba(49,154,80,0.6), 0 0 35px 12px rgba(49,154,80,0.25)",
  };

  let style: React.CSSProperties;
  switch (phase) {
    case "inhale_top":
      style = { ...base, top: half, left: `${progress * 100}%`, transform: "translate(-50%, -50%)" };
      break;
    case "exhale_right":
      style = { ...base, top: `${progress * 100}%`, right: 0, left: "auto", transform: "translate(50%, -50%)" };
      break;
    case "inhale_bottom":
      style = { ...base, bottom: 0, top: "auto", left: `${(1 - progress) * 100}%`, transform: "translate(-50%, 50%)" };
      break;
    case "exhale_left":
      style = { ...base, top: `${(1 - progress) * 100}%`, left: half, transform: "translate(-50%, -50%)" };
      break;
  }

  return <div style={style} />;
}

export default function StepBreathe() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("inhale_top");
  const [progress, setProgress] = useState(0);

  // TTS for phase changes
  const speakPhase = useCallback((p: Phase) => {
    if (!("speechSynthesis" in window)) return;
    // Only speak if not globally muted (layout handles initial, this handles transitions)
    const label = PHASE_CONFIG[p].label;
    const utterance = new SpeechSynthesisUtterance(label);
    utterance.rate = 0.8;
    utterance.lang = "en-AU";
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    let phaseIdx = 0;
    let start = performance.now();
    let currentDuration = PHASE_CONFIG[PHASE_ORDER[0]].duration;

    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const frac = Math.min(elapsed / currentDuration, 1);
      setProgress(frac);

      if (elapsed >= currentDuration) {
        phaseIdx = (phaseIdx + 1) % 4;
        const nextPhase = PHASE_ORDER[phaseIdx];
        currentDuration = PHASE_CONFIG[nextPhase].duration;
        setPhase(nextPhase);
        start = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speakPhase]);

  const isInhale = phase === "inhale_top" || phase === "inhale_bottom";
  const label = PHASE_CONFIG[phase].label;

  return (
    <div className="relative">
      <BreatheBorder phase={phase} progress={progress} />
      <EpisodeLayout
        highlightedFinger={4}
        onNext={() => navigate("/episode/evaluate")}
        onBack={() => navigate("/episode/fan")}
        speakText="Step 4. Breathe. Follow the green line around the screen. Breathe in on the short edges. Breathe out on the long edges."
      >
        <div className="text-center">
          {/* Big phase label */}
          <div className="mb-6">
            <p
              className={`text-[42px] sm:text-[52px] font-bold min-h-[60px] transition-colors duration-300 ${
                isInhale ? "text-[#319A50]" : "text-[#5A8BAF]"
              }`}
            >
              {label}
            </p>
          </div>

          {/* Visual breathing indicator */}
          <div className="flex justify-center items-center mb-6" style={{ height: 140 }}>
            <div
              className="rounded-full"
              style={{
                width: isInhale
                  ? `${40 + progress * 100}px`
                  : `${140 - progress * 100}px`,
                height: isInhale
                  ? `${40 + progress * 100}px`
                  : `${140 - progress * 100}px`,
                backgroundColor: isInhale
                  ? "rgba(49,154,80,0.15)"
                  : "rgba(90,139,175,0.15)",
                border: `3px solid ${isInhale ? "rgba(49,154,80,0.3)" : "rgba(90,139,175,0.3)"}`,
                transition: "background-color 0.5s, border-color 0.5s",
              }}
            />
          </div>

          <p className="text-[20px] text-gray-600">
            Follow the green line around the screen
          </p>
        </div>
      </EpisodeLayout>
    </div>
  );
}