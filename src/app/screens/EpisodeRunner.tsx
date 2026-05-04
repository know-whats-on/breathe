import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleAlert, RotateCcw } from "lucide-react";
import {
  BUCKET_COPY,
  DO_YOUR_FIVE_STEP_TITLES,
  STRATEGY_LIBRARY,
  THINK_ROTATING_QUOTES,
} from "../content/planContent";
import type { StrategyOption } from "../content/planContent";
import { AppFrame, PrimaryButton, SecondaryButton, Surface } from "../components/AppChrome";
import BoxBreathingGuide from "../components/BoxBreathingGuide";
import DoYourFiveHandImage from "../components/DoYourFiveHandImage";
import PositionVisualGuide, { getPositionTabDefinition, type PositionTabId } from "../components/PositionVisualGuide";
import { formatElapsedFrom } from "../lib/format";
import type {
  SelfChecklistItem,
  StrategyBucketType,
  ThinkSelfCheckAnswerValue,
  ThinkSelfCheckEntry,
} from "../model/types";
import { useAppState } from "../state/AppState";

const STOP_ICON_SRC = "/recovery-step-icons/stop-naked.svg";
const THINK_ICON_SRC = "/recovery-step-icons/think-naked.svg";
const AIRFLOW_ICON_SRC = "/recovery-step-icons/fan-naked.svg";
const ACTUAL_FAN_HANDLE_SRC = "/recovery-step-icons/actual-fan-handle.png";
const ACTUAL_FAN_BLADES_SRC = "/recovery-step-icons/actual-fan-blades.png";
const THINK_QUOTE_INTERVAL_MS = 2200;
const THINK_QUOTE_TRANSITION_SECONDS = 0.24;
const DEFAULT_BREATHE_OUT_PILLS = [
  "Focus on the out-breaths",
  "Breathe around a rectangle",
  "Use pursed-lip breathing",
] as const;
const BREATHE_OUT_RECTANGLE_HELPER =
  "Try to match your breathing to the moving rectangle. If you feel it’s too fast, trace finger around the rectangle with the pace that feels most comfortable to you. Focus on the out-breaths, the in breaths will take care of themselves!";
const AIRFLOW_PILLS = [
  "Use a handheld fan",
  "Use the air conditioning",
  "Use a fan",
  "Go outside",
  "Open a door/window",
  "Wipe a damp cloth on your face",
  "Put a damp cloth around your neck",
] as const;
const DEFAULT_WARNING_SELF_CHECK_IDS = new Set([
  "different-breathlessness",
  "phlegm-change",
  "ankle-swelling",
  "chest-pain",
]);
const SUPPORT_ASSIST_COPY: Record<
  StrategyBucketType,
  { title: string; paragraphs: readonly string[] }
> = {
  STOP: {
    title: "Stop",
    paragraphs: [
      "Don't panic, the person is simply experiencing breathlessness.",
      "They shall let you know if they need assistance.",
    ],
  },
  THINK: {
    title: "Think",
    paragraphs: [
      "Help someone manage their thinking during a breathlessness episode in these ways:",
      "Write a checklist of things you can do to help and go through it with them.",
      "Don’t dismiss how they feel – breathlessness can be truly horrible. Instead, provide reassurance that they will recover.",
      "Ask the person if they want you to provide a back, arm or hand massage",
      "Talk them through a happy and relaxing memory you share or you know they cherish.",
      "Model a breathing technique (see ‘Manage Your Breathing’ section) and have them follow along.",
      "Just sit quietly as someone who cares and is not panicking.",
      "Try and be a calming presence and don’t get frustrated or frightened yourself.",
      "Remember to follow the lead of the person with breathlessness. When they recover, ask if they want you to do anything differently next time.",
    ],
  },
  POSITION: {
    title: "Position",
    paragraphs: [
      "You can help someone adjust their position during a breathlessness episode:",
      "Lead the person to a chair and help them sit down. This also reminds them to stop what they’re doing.",
      "If their shoulders are up, remind them to drop their shoulders by gently touching them.",
      "Remember to follow the lead of the person with breathlessness. When they recover, ask how you can help more next time.",
    ],
  },
  BREATHE_OUT_SLOWLY: {
    title: "Breathe Out Slowly",
    paragraphs: [
      "You can help someone during their breathlessness episode in the following ways:",
      "Know where they keep their handheld fan and bring it to them.",
      "Make sure their handheld fan is always charged or has batteries.",
      "Open the door to the room they are in to promote a breeze.",
      "Open a window for the person, if it is okay to do.",
      "Put on the air conditioning or fan, if it is okay to do.",
      "Get the person a damp cloth to cool their face or neck with.",
      "Help them get outside slowly and make sure there’s somewhere for them to sit down.",
      "Remember to discuss what works best for someone after they recover. They may not be able to tell you in-the-moment.",
    ],
  },
  AIRFLOW_COOL: {
    title: "Airflow",
    paragraphs: [
      "You can help someone during their breathlessness episode in the following ways:",
      "Know where they keep their handheld fan and bring it to them.",
      "Make sure their handheld fan is always charged or has batteries.",
      "Open the door to the room they are in to promote a breeze.",
      "Open a window for the person, if it is okay to do.",
      "Put on the air conditioning or fan, if it is okay to do.",
      "Get the person a damp cloth to cool their face or neck with.",
      "Help them get outside slowly and make sure there’s somewhere for them to sit down.",
      "Remember to discuss what works best for someone after they recover. They may not be able to tell you in-the-moment.",
    ],
  },
};
const STOP_STOMP_CYCLE_SECONDS = 2.8;
const STOP_STOMP_IMPACT_DELAY_SECONDS = 0.08;
const STOP_RIPPLE_RING_LAYERS = [
  {
    id: "ring-1",
    size: 108,
    borderWidth: 3,
    borderColor: "rgba(49, 154, 80, 0.38)",
    delay: 0,
    scale: [0.16, 0.16, 0.16, 1, 4.6, 7.1],
    opacity: [0, 0, 0, 0.5, 0.18, 0],
  },
  {
    id: "ring-2",
    size: 116,
    borderWidth: 2.5,
    borderColor: "rgba(49, 154, 80, 0.33)",
    delay: 0.14,
    scale: [0.15, 0.15, 0.15, 1, 5.2, 8],
    opacity: [0, 0, 0, 0.42, 0.15, 0],
  },
  {
    id: "ring-3",
    size: 124,
    borderWidth: 2,
    borderColor: "rgba(49, 154, 80, 0.28)",
    delay: 0.28,
    scale: [0.14, 0.14, 0.14, 1, 5.9, 8.9],
    opacity: [0, 0, 0, 0.34, 0.13, 0],
  },
  {
    id: "ring-4",
    size: 132,
    borderWidth: 2,
    borderColor: "rgba(49, 154, 80, 0.22)",
    delay: 0.42,
    scale: [0.13, 0.13, 0.13, 1, 6.8, 10.1],
    opacity: [0, 0, 0, 0.28, 0.1, 0],
  },
  {
    id: "ring-5",
    size: 140,
    borderWidth: 1.5,
    borderColor: "rgba(49, 154, 80, 0.18)",
    delay: 0.56,
    scale: [0.12, 0.12, 0.12, 1, 7.8, 11.4],
    opacity: [0, 0, 0, 0.22, 0.08, 0],
  },
  {
    id: "ring-6",
    size: 148,
    borderWidth: 1.5,
    borderColor: "rgba(49, 154, 80, 0.14)",
    delay: 0.7,
    scale: [0.12, 0.12, 0.12, 1, 8.8, 12.8],
    opacity: [0, 0, 0, 0.18, 0.06, 0],
  },
] as const;
const STOP_RIPPLE_GLOW_LAYERS = [
  {
    id: "glow-1",
    size: 224,
    delay: 0.02,
    scale: [0.24, 0.24, 1, 1.95],
    opacity: [0, 0, 0.34, 0],
    background:
      "radial-gradient(circle, rgba(49, 154, 80, 0.2) 0%, rgba(49, 154, 80, 0.1) 28%, rgba(49, 154, 80, 0) 72%)",
  },
  {
    id: "glow-2",
    size: 284,
    delay: 0.22,
    scale: [0.18, 0.18, 1, 1.78],
    opacity: [0, 0, 0.22, 0],
    background:
      "radial-gradient(circle, rgba(49, 154, 80, 0.14) 0%, rgba(49, 154, 80, 0.06) 38%, rgba(49, 154, 80, 0) 76%)",
  },
] as const;

type ThinkSelfCheckDraft = Record<string, ThinkSelfCheckAnswerValue | null>;
type RippleOrigin = {
  x: number;
  y: number;
};

function createEmptyThinkSelfCheckDraft(items: SelfChecklistItem[]): ThinkSelfCheckDraft {
  return Object.fromEntries(items.map((item) => [item.id, null]));
}

function createThinkSelfCheckDraft(
  items: SelfChecklistItem[],
  entry?: ThinkSelfCheckEntry | null
): ThinkSelfCheckDraft {
  const draft = createEmptyThinkSelfCheckDraft(items);

  if (!entry) return draft;

  for (const response of entry.responses) {
    if (!(response.id in draft)) continue;
    draft[response.id] = response.answer;
  }

  return draft;
}

function isThinkSelfCheckComplete(items: SelfChecklistItem[], draft: ThinkSelfCheckDraft) {
  return items.every((item) => draft[item.id] !== null);
}

function buildThinkSelfCheckEntry(items: SelfChecklistItem[], draft: ThinkSelfCheckDraft): ThinkSelfCheckEntry {
  return {
    completedAt: new Date().toISOString(),
    responses: items.map((item) => ({
      id: item.id,
      prompt: item.prompt,
      answer: draft[item.id] as ThinkSelfCheckAnswerValue,
    })),
  };
}

function InfoPill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-[#319A50]/16 bg-white/90 px-3 py-2 text-[0.8rem] font-semibold leading-tight text-slate-700 shadow-[0_16px_36px_-30px_rgba(31,41,55,0.35)] ring-1 ring-black/5">
      {children}
    </span>
  );
}

function ThinkActionPill({
  completed,
  onClick,
}: {
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.84rem] font-semibold transition active:scale-[0.98] ${
        completed
          ? "bg-[#23683A] text-white shadow-[0_18px_40px_-26px_rgba(35,104,58,0.85)]"
          : "bg-[#319A50] text-white shadow-[0_18px_40px_-26px_rgba(49,154,80,0.7)]"
      }`}
    >
      {completed && <Check className="h-4 w-4" />}
      <span>Conduct Self-checkin</span>
    </button>
  );
}

function BinaryChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: "Yes" | "No";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[5.2rem] rounded-full border px-4 py-2.5 text-[0.94rem] font-semibold transition active:scale-[0.98] ${
        active
          ? "border-[#319A50] bg-[#319A50] text-white shadow-[0_14px_34px_-24px_rgba(49,154,80,0.75)]"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function StopScene({
  onIconAnchorChange,
  selectedStrategies,
  onActionRoute,
}: {
  onIconAnchorChange: (node: HTMLDivElement | null) => void;
  selectedStrategies: StrategyOption[];
  onActionRoute: (route: string) => void;
}) {
  const strategySignature = selectedStrategies.map((strategy) => strategy.id).join("|");
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(selectedStrategies[0]?.id ?? null);
  const activeStrategy =
    selectedStrategies.find((strategy) => strategy.id === activeStrategyId) ?? selectedStrategies[0] ?? null;

  useEffect(() => {
    if (selectedStrategies.length === 0) {
      setActiveStrategyId(null);
      return;
    }

    setActiveStrategyId((current) =>
      current && selectedStrategies.some((strategy) => strategy.id === current)
        ? current
        : selectedStrategies[0].id
    );
  }, [strategySignature]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start overflow-y-auto overscroll-contain py-2 text-center">
      <div className="relative flex h-[11rem] w-full items-end justify-center">
        <div ref={onIconAnchorChange} className="h-[8.5rem] w-[8.5rem]">
          <motion.div
            className="relative z-10 flex h-full w-full items-center justify-center rounded-[2.5rem]"
            animate={{
              y: [0, -10, -24, 14, 4, 0],
              scale: [1, 1.01, 1.02, 0.94, 0.985, 1],
            }}
            transition={{
              duration: STOP_STOMP_CYCLE_SECONDS,
              repeat: Infinity,
              times: [0, 0.14, 0.3, 0.44, 0.58, 1],
              ease: "easeInOut",
            }}
          >
            <img
              src={STOP_ICON_SRC}
              alt="Stop recovery icon"
              className="h-[7.3rem] w-[7.3rem] object-contain"
              loading="eager"
              decoding="async"
            />
          </motion.div>
        </div>
      </div>

      <h1 className="mt-3 text-[clamp(2rem,8vw,2.55rem)] font-bold leading-[0.94] text-slate-900">
        {DO_YOUR_FIVE_STEP_TITLES.STOP}
      </h1>

      <div className="mt-4 flex w-full max-w-[20rem] flex-col items-center gap-3">
        {activeStrategy ? (
          <>
            <Surface className="w-full p-3.5 text-left">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#319A50]">
                {activeStrategy.label}
              </p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-slate-600">
                {activeStrategy.detail.trim() || "Use this part of your Stop step."}
              </p>
              {activeStrategy.action && (
                <button
                  type="button"
                  onClick={() => onActionRoute(activeStrategy.action!.route)}
                  className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-full border border-[#319A50]/20 bg-[#EAF6EE] px-4 text-[0.88rem] font-semibold text-[#23683A] shadow-[0_16px_34px_-30px_rgba(31,41,55,0.35)] transition active:scale-[0.98]"
                >
                  {activeStrategy.action.label}
                </button>
              )}
            </Surface>

            <div className="flex w-full flex-wrap justify-center gap-2">
              {selectedStrategies.map((strategy) => {
                const isActive = strategy.id === activeStrategy.id;

                return (
                  <button
                    key={strategy.id}
                    type="button"
                    onClick={() => setActiveStrategyId(strategy.id)}
                    aria-pressed={isActive}
                    className={`rounded-full px-3.5 py-2 text-[0.86rem] font-semibold leading-tight transition active:scale-[0.98] ${
                      isActive
                        ? "bg-[#319A50] text-white shadow-[0_16px_36px_-28px_rgba(49,154,80,0.8)]"
                        : "border border-[#319A50]/16 bg-white/92 text-slate-700 ring-1 ring-black/5"
                    }`}
                  >
                    {strategy.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <Surface className="p-3 text-left">
            <p className="text-[0.95rem] font-semibold leading-snug text-slate-900">Use your Stop step.</p>
            <p className="mt-1 text-[0.86rem] leading-relaxed text-slate-500">
              You can personalise this later in My Plan.
            </p>
          </Surface>
        )}
      </div>
    </div>
  );
}

function StopBackgroundRipple({
  origin,
}: {
  origin: RippleOrigin | null;
}) {
  const rippleOriginStyle = origin
    ? {
        left: `${origin.x}px`,
        top: `${origin.y}px`,
      }
    : {
        left: "50%",
        top: "50%",
      };

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {STOP_RIPPLE_GLOW_LAYERS.map((layer) => (
        <motion.div
          key={layer.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            ...rippleOriginStyle,
            width: layer.size,
            height: layer.size,
            background: layer.background,
          }}
          animate={{
            scale: layer.scale,
            opacity: layer.opacity,
          }}
          transition={{
            duration: STOP_STOMP_CYCLE_SECONDS,
            repeat: Infinity,
            times: [0, 0.12, 0.28, 1],
            ease: "easeOut",
            delay: STOP_STOMP_IMPACT_DELAY_SECONDS + layer.delay,
          }}
        />
      ))}

      {STOP_RIPPLE_RING_LAYERS.map((layer) => (
        <motion.div
          key={layer.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            ...rippleOriginStyle,
            width: layer.size,
            height: layer.size,
            borderWidth: layer.borderWidth,
            borderStyle: "solid",
            borderColor: layer.borderColor,
          }}
          animate={{
            scale: layer.scale,
            opacity: layer.opacity,
          }}
          transition={{
            duration: STOP_STOMP_CYCLE_SECONDS,
            repeat: Infinity,
            times: [0, 0.14, 0.18, 0.42, 1],
            ease: "easeOut",
            delay: STOP_STOMP_IMPACT_DELAY_SECONDS + layer.delay,
          }}
        />
      ))}
    </div>
  );
}

function ThinkScene({
  quote,
  selfCheckComplete,
  showSelfCheck,
  onOpenSelfCheck,
}: {
  quote: string;
  selfCheckComplete: boolean;
  showSelfCheck: boolean;
  onOpenSelfCheck: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="relative flex h-[9rem] w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="flex h-[7.75rem] w-[7.75rem] items-center justify-center rounded-[2.5rem]"
        >
          <img
            src={THINK_ICON_SRC}
            alt="Calm your thinking recovery icon"
            className="h-[6.7rem] w-[6.7rem] object-contain"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      </div>

      <h1 className="mt-2 text-[clamp(2rem,8vw,2.5rem)] font-bold leading-[0.95] text-slate-900">
        {DO_YOUR_FIVE_STEP_TITLES.THINK}
      </h1>

      <div className="mt-3 flex min-h-[3.25rem] w-full max-w-[18rem] items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={quote}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: THINK_QUOTE_TRANSITION_SECONDS, ease: "easeOut" }}
            className="text-[1rem] font-semibold leading-snug text-[#23683A]"
          >
            {quote}
          </motion.p>
        </AnimatePresence>
      </div>

      {showSelfCheck && (
        <div className="mt-4 flex max-w-[18rem] flex-wrap justify-center gap-2">
          <ThinkActionPill completed={selfCheckComplete} onClick={onOpenSelfCheck} />
        </div>
      )}
    </div>
  );
}

function PositionScene({
  activeTabId,
  imageIndex,
  onTabChange,
}: {
  activeTabId: PositionTabId;
  imageIndex: number;
  onTabChange: (tabId: PositionTabId) => void;
}) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start overflow-y-auto overscroll-contain py-2 text-center">
      <div className="sticky top-0 z-10 w-full bg-[rgba(247,251,248,0.94)] pb-2 pt-1 backdrop-blur-sm">
        <h1 className="text-[clamp(1.8rem,7vw,2.35rem)] font-bold leading-[0.95] text-slate-900">
          {DO_YOUR_FIVE_STEP_TITLES.POSITION}
        </h1>
      </div>

      <PositionVisualGuide
        activeTabId={activeTabId}
        imageIndex={imageIndex}
        onTabChange={onTabChange}
        showTitle={false}
        className="w-full pb-2"
      />
    </div>
  );
}

function ActualFanVisual() {
  return (
    <div className="relative h-[10.5rem] w-[8.5rem]" aria-hidden="true">
      <img
        src={ACTUAL_FAN_HANDLE_SRC}
        alt=""
        className="absolute bottom-0 left-1/2 h-[8.25rem] w-auto -translate-x-1/2 object-contain drop-shadow-[0_18px_28px_rgba(49,154,80,0.18)]"
        loading="eager"
        decoding="async"
      />
      <div className="absolute left-1/2 top-0 h-[5.55rem] w-[5.55rem] -translate-x-1/2">
        <motion.img
          src={ACTUAL_FAN_BLADES_SRC}
          alt=""
          className="h-full w-full object-contain drop-shadow-[0_14px_24px_rgba(49,154,80,0.16)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50% 50%" }}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}

function AirflowScene() {
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center">
      <div className="relative flex w-full items-center justify-center">
        <ActualFanVisual />
      </div>

      <h1 className="mt-1 max-w-full px-2 text-center text-[1.8rem] font-bold leading-[0.98] text-slate-900 sm:text-[2.25rem]">
        <span className="block">Airflow /</span>
        <span className="block">Cool</span>
      </h1>

      <div className="mt-4 flex w-full max-w-[18rem] flex-wrap justify-center gap-2 px-1">
        {AIRFLOW_PILLS.map((pill) => (
          <InfoPill key={pill}>{pill}</InfoPill>
        ))}
      </div>
    </div>
  );
}

function SupportAssistScene({
  title,
  paragraphs,
  iconSrc,
  bucket,
  rotateIcon = false,
}: {
  title: string;
  paragraphs: readonly string[];
  iconSrc?: string;
  bucket?: StrategyBucketType;
  rotateIcon?: boolean;
}) {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-start py-2 text-center">
      {bucket ? (
        <div className="mb-2 flex justify-center">
          <DoYourFiveHandImage bucket={bucket} className="h-32 w-auto object-contain" />
        </div>
      ) : iconSrc ? (
        <div className="relative flex h-[9rem] w-full items-center justify-center">
          <motion.div
            className="flex h-[7.8rem] w-[7.8rem] items-center justify-center rounded-[2.5rem]"
            initial={{ opacity: 0, y: 18 }}
            animate={rotateIcon ? { opacity: 1, y: 0, rotate: 360 } : { opacity: 1, y: 0 }}
            transition={
              rotateIcon
                ? {
                    opacity: { duration: 0.32 },
                    y: { duration: 0.32 },
                    rotate: { duration: 6.5, repeat: Infinity, ease: "linear" },
                  }
                : { duration: 0.32, ease: "easeOut" }
            }
          >
            <img
              src={iconSrc}
              alt=""
              className="h-[6.8rem] w-[6.8rem] object-contain"
              loading="eager"
              decoding="async"
            />
          </motion.div>
        </div>
      ) : null}

      <p className="mt-2 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
        Support guide
      </p>
      <h1 className="mt-2 text-[clamp(2rem,8vw,2.45rem)] font-bold leading-[0.95] text-slate-900">
        {title}
      </h1>

      <Surface className="mt-5 max-w-[21rem] bg-white/95 p-4 text-left">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${title}-${index}`}
            className={`${index === 0 ? "" : "mt-3"} text-[1rem] leading-relaxed text-slate-700`}
          >
            {paragraph}
          </p>
        ))}
      </Surface>
    </div>
  );
}

function SupportAssistBreathingScene({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: readonly string[];
}) {
  return (
    <div className="flex min-h-full w-full flex-col justify-start py-2">
      <div className="text-center">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
          Support guide
        </p>
        <h1 className="mt-2 text-[clamp(2rem,8vw,2.45rem)] font-bold leading-[0.95] text-slate-900">
          {title}
        </h1>
      </div>

      <div className="mt-5">
        <BoxBreathingGuide compact />
      </div>

      <div className="mt-6 flex justify-center">
        <Surface className="max-w-[21rem] bg-white/95 p-4 text-left">
          {paragraphs.map((paragraph, index) => (
            <p
              key={`${title}-${index}`}
              className={`${index === 0 ? "" : "mt-3"} text-[1rem] leading-relaxed text-slate-700`}
            >
              {paragraph}
            </p>
          ))}
        </Surface>
      </div>
    </div>
  );
}

function GenericScene({
  currentBucket,
  title,
  eyebrow,
  description,
  selectedStrategies,
  customNote,
}: {
  currentBucket: "STOP" | "THINK" | "POSITION" | "BREATHE_OUT_SLOWLY" | "AIRFLOW_COOL";
  title: string;
  eyebrow: string;
  description: string;
  selectedStrategies: Array<{ id: string; label: string; detail: string } | undefined>;
  customNote: string;
}) {
  return (
    <>
      <div className="mb-4 flex justify-center">
        <DoYourFiveHandImage bucket={currentBucket} className="h-28 w-auto object-contain" />
      </div>
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.2em] text-[#319A50]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[clamp(2rem,8vw,2.5rem)] font-bold leading-[0.95] text-slate-900">{title}</h1>
      <p className="mt-3 max-w-[18rem] text-[0.98rem] leading-relaxed text-slate-500">{description}</p>

      <div className="mt-5 space-y-2.5">
        {selectedStrategies.length > 0 ? (
          selectedStrategies.map((strategy) => (
            <Surface key={strategy?.id} className="p-3.5">
              <p className="text-[0.95rem] font-semibold text-slate-900">{strategy?.label}</p>
              {strategy?.detail.trim() && (
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-slate-500">{strategy.detail}</p>
              )}
            </Surface>
          ))
        ) : (
          <Surface className="p-3.5">
            <p className="text-[0.95rem] font-semibold text-slate-900">Use the guide in the way that works for you.</p>
            <p className="mt-1.5 text-[0.88rem] leading-relaxed text-slate-500">
              You can personalise this step later in My Plan by choosing strategies from the booklet.
            </p>
          </Surface>
        )}

        {customNote.trim() && (
          <Surface className="border border-[#319A50]/15 bg-[#F5FBF6] p-3.5">
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">My note</p>
            <p className="mt-1.5 text-[0.92rem] leading-relaxed text-slate-700">{customNote}</p>
          </Surface>
        )}
      </div>
    </>
  );
}

function ThinkSelfCheckDialog({
  open,
  onOpenChange,
  items,
  draft,
  onAnswerChange,
  onSave,
  canSave,
  isPracticeMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SelfChecklistItem[];
  draft: ThinkSelfCheckDraft;
  onAnswerChange: (id: string, answer: ThinkSelfCheckAnswerValue) => void;
  onSave: () => void;
  canSave: boolean;
  isPracticeMode: boolean;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/32 px-3 py-3 backdrop-blur-[2px] sm:px-4 sm:py-4"
    >
      <div className="flex max-h-full w-full max-w-[28rem] flex-col overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,_rgba(241,248,243,1)_0%,_rgba(255,255,255,1)_46%,_rgba(245,248,246,1)_100%)] shadow-[0_36px_90px_-34px_rgba(15,23,42,0.42)] ring-1 ring-black/5 sm:rounded-[1.75rem]">
        <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="relative pr-12 text-left">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
              Think self-check
            </p>
            <h2 className="mt-2 text-[2rem] font-semibold leading-[0.98] text-slate-900">
              Conduct Self-checkin
            </h2>
            <p className="mt-3 text-[0.96rem] leading-relaxed text-slate-500">
              {isPracticeMode
                ? "These answers stay inside this practice session and return you to the Think step."
                : "These answers are saved to this live session straight away, then you return to the Think step."}
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-black/5 transition hover:text-slate-700 active:scale-[0.97]"
              aria-label="Close self-check"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[1.35rem] bg-white/92 px-4 py-4 shadow-[0_20px_44px_-34px_rgba(31,41,55,0.3)] ring-1 ring-black/5"
              >
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-[#319A50]/78">
                  Question {index + 1}
                </p>
                <p className="mt-2 text-[1rem] font-semibold leading-relaxed text-slate-900">
                  {item.prompt}
                </p>
                <div className="mt-4 flex gap-2">
                  <BinaryChoiceButton
                    active={draft[item.id] === "yes"}
                    label="Yes"
                    onClick={() => onAnswerChange(item.id, "yes")}
                  />
                  <BinaryChoiceButton
                    active={draft[item.id] === "no"}
                    label="No"
                    onClick={() => onAnswerChange(item.id, "no")}
                  />
                </div>
                {DEFAULT_WARNING_SELF_CHECK_IDS.has(item.id) && draft[item.id] === "yes" && (
                  <p className="mt-3 rounded-[0.9rem] bg-[#FFF6E8] px-3 py-2 text-[0.9rem] font-semibold leading-relaxed text-[#8A4B12]">
                    Consider speaking to your doctor about this.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <SecondaryButton type="button" className="w-full sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="button" className="w-full sm:flex-1" onClick={onSave} disabled={!canSave}>
              Save self-check
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EpisodeRunner() {
  const navigate = useNavigate();
  const { data, actions } = useAppState();
  const runnerRef = useRef<HTMLDivElement | null>(null);
  const [tick, setTick] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [positionTab, setPositionTab] = useState<PositionTabId>("standing");
  const [positionImageIndex, setPositionImageIndex] = useState(0);
  const [practiceThinkSelfCheck, setPracticeThinkSelfCheck] = useState<ThinkSelfCheckEntry | null>(null);
  const [thinkSelfCheckOpen, setThinkSelfCheckOpen] = useState(false);
  const [stopIconAnchor, setStopIconAnchor] = useState<HTMLDivElement | null>(null);
  const [stopRippleOrigin, setStopRippleOrigin] = useState<RippleOrigin | null>(null);
  const [draftThinkSelfCheck, setDraftThinkSelfCheck] = useState<ThinkSelfCheckDraft>(
    () => createEmptyThinkSelfCheckDraft(data.recoveryPlan.selfChecklistItems)
  );

  useEffect(() => {
    if (!data.episodeRuntime) actions.startEpisode();
  }, [actions, data.episodeRuntime]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const runtime = data.episodeRuntime;
  const currentIndex = runtime?.currentIndex ?? 0;
  const isPracticeMode = runtime?.mode === "practice";
  const isSupportAssistMode = runtime?.guideVariant === "support_assist";
  const currentBucket = data.recoveryPlan.order[currentIndex] ?? data.recoveryPlan.order[0] ?? "STOP";
  const supportAssistCopy = SUPPORT_ASSIST_COPY[currentBucket];
  const selfChecklistItems = data.recoveryPlan.selfChecklistItems;
  const copy = BUCKET_COPY[currentBucket];
  const isBreathingStep = currentBucket === "BREATHE_OUT_SLOWLY";
  const selectedStrategies = data.recoveryPlan.buckets[currentBucket].selectedStrategyIds
    .map((id) => STRATEGY_LIBRARY[currentBucket].find((option) => option.id === id))
    .filter((strategy): strategy is StrategyOption => Boolean(strategy));
  const selectedThinkStrategies =
    currentBucket === "THINK" ? selectedStrategies.filter((strategy) => strategy.id !== "think-self-check") : [];
  const selectedThinkQuotes =
    selectedThinkStrategies.length > 0 ? selectedThinkStrategies.map((strategy) => strategy.label) : THINK_ROTATING_QUOTES;
  const selectedThinkQuoteSignature = selectedThinkQuotes.join("||");
  const activeThinkQuote = selectedThinkQuotes[quoteIndex % selectedThinkQuotes.length] ?? THINK_ROTATING_QUOTES[0];
  const selectedBreatheOutStrategies = currentBucket === "BREATHE_OUT_SLOWLY" ? selectedStrategies : [];
  const breatheOutPills =
    selectedBreatheOutStrategies.length > 0
      ? selectedBreatheOutStrategies.map((strategy) => strategy.label)
      : DEFAULT_BREATHE_OUT_PILLS;
  const showThinkSelfCheck =
    currentBucket === "THINK" && data.recoveryPlan.buckets.THINK.selectedStrategyIds.includes("think-self-check");
  const activeLog = runtime?.logId
    ? data.episodeLogs.find((log) => log.id === runtime.logId)
    : undefined;
  const currentThinkSelfCheck = isPracticeMode
    ? practiceThinkSelfCheck
    : activeLog?.thinkSelfCheck ?? null;
  const activePositionTab = getPositionTabDefinition(positionTab);
  const isFinalStep = runtime ? runtime.currentIndex === data.recoveryPlan.order.length - 1 : false;

  useEffect(() => {
    if (currentBucket !== "THINK" || isSupportAssistMode) {
      setThinkSelfCheckOpen(false);
      return;
    }

    setQuoteIndex(0);
    const timer = window.setInterval(() => {
      setQuoteIndex((value) => (value + 1) % selectedThinkQuotes.length);
    }, THINK_QUOTE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [currentBucket, isSupportAssistMode, selectedThinkQuoteSignature, selectedThinkQuotes.length]);

  useEffect(() => {
    setPositionImageIndex(0);
  }, [positionTab]);

  useEffect(() => {
    if (currentBucket !== "POSITION") return;

    const timer = window.setInterval(() => {
      setPositionImageIndex((value) => (value + 1) % activePositionTab.images.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [activePositionTab, currentBucket]);

  useEffect(() => {
    if (currentBucket !== "STOP" || !runnerRef.current || !stopIconAnchor) {
      setStopRippleOrigin(null);
      return;
    }

    const updateRippleOrigin = () => {
      if (!runnerRef.current || !stopIconAnchor) return;

      const runnerRect = runnerRef.current.getBoundingClientRect();
      const anchorRect = stopIconAnchor.getBoundingClientRect();

      setStopRippleOrigin({
        x: anchorRect.left - runnerRect.left + anchorRect.width / 2,
        y: anchorRect.top - runnerRect.top + anchorRect.height / 2,
      });
    };

    updateRippleOrigin();

    const resizeObserver = new ResizeObserver(updateRippleOrigin);
    resizeObserver.observe(runnerRef.current);
    resizeObserver.observe(stopIconAnchor);
    window.addEventListener("resize", updateRippleOrigin);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRippleOrigin);
    };
  }, [currentBucket, stopIconAnchor]);

  if (!runtime) {
    return (
      <AppFrame tone="focus" scrollable={false} contentClassName="pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex min-h-0 flex-1 items-center justify-center text-center">
          <p className="text-[1rem] font-semibold text-slate-600">Preparing your recovery plan...</p>
        </div>
      </AppFrame>
    );
  }

  const handleStopIconAnchorChange = (node: HTMLDivElement | null) => {
    setStopIconAnchor(node);
  };

  const onNext = () => {
    if (isFinalStep) return;
    actions.setEpisodeIndex(runtime.currentIndex + 1);
  };

  const restartEpisodeFlow = () => {
    setThinkSelfCheckOpen(false);
    setQuoteIndex(0);
    setPositionTab("standing");
    setPositionImageIndex(0);
    actions.setEpisodeIndex(0);
  };

  const abandonEpisodeFlow = () => {
    actions.clearEpisode();
    navigate("/");
  };

  const finishOrExitRecoveryPlan = () => {
    if (isPracticeMode) {
      abandonEpisodeFlow();
      return;
    }

    actions.setEpisodeStage("next_steps");
    navigate("/next-steps");
  };

  const onBack = () => {
    if (runtime.currentIndex <= 0) {
      abandonEpisodeFlow();
      return;
    }
    actions.setEpisodeIndex(runtime.currentIndex - 1);
  };

  const openThinkSelfCheck = () => {
    setDraftThinkSelfCheck(createThinkSelfCheckDraft(selfChecklistItems, currentThinkSelfCheck));
    setThinkSelfCheckOpen(true);
  };

  const updateDraftAnswer = (id: string, answer: ThinkSelfCheckAnswerValue) => {
    setDraftThinkSelfCheck((current) => ({
      ...current,
      [id]: answer,
    }));
  };

  const saveThinkSelfCheck = () => {
    if (!isThinkSelfCheckComplete(selfChecklistItems, draftThinkSelfCheck)) return;

    const entry = buildThinkSelfCheckEntry(selfChecklistItems, draftThinkSelfCheck);

    if (isPracticeMode) {
      setPracticeThinkSelfCheck(entry);
    } else {
      actions.patchActiveEpisodeLog({ thinkSelfCheck: entry });
    }

    setThinkSelfCheckOpen(false);
  };

  return (
    <AppFrame tone="focus" scrollable={false} contentClassName="pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div ref={runnerRef} className="relative flex min-h-0 flex-1 flex-col gap-3">
        {currentBucket === "STOP" && <StopBackgroundRipple origin={stopRippleOrigin} />}

        <div className="relative z-20 flex shrink-0 items-center justify-between gap-3">
          <button
            onClick={abandonEpisodeFlow}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-slate-700 ring-1 ring-black/5"
            aria-label="Return home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
              {isPracticeMode ? "Practice My Plan" : isSupportAssistMode ? "Support or Assistance" : "Do Your Five"}
            </p>
            <p className="mt-0.5 text-[0.88rem] text-slate-500">
              Step {runtime.currentIndex + 1} of {data.recoveryPlan.order.length}
            </p>
            {isPracticeMode ? (
              <p className="mt-1 text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#319A50]/80">
                Practice Mode
              </p>
            ) : isSupportAssistMode ? (
              <p className="mt-1 text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#319A50]/80">
                Support-assisted guide
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl bg-white/85 px-3 py-1.5 text-[0.9rem] font-semibold text-slate-700 ring-1 ring-black/5">
            {formatElapsedFrom(runtime.startedAt)}
            <span className="sr-only">{tick}</span>
          </div>
        </div>

        <div
          className={`relative z-20 flex min-h-0 flex-1 overflow-y-auto overscroll-contain ${
            currentBucket === "POSITION" || isBreathingStep
              ? "items-stretch justify-stretch"
              : "items-stretch justify-center"
          }`}
        >
          {isSupportAssistMode ? (
            currentBucket === "STOP" ? (
              <SupportAssistScene
                title={supportAssistCopy.title}
                paragraphs={supportAssistCopy.paragraphs}
                iconSrc={STOP_ICON_SRC}
              />
            ) : currentBucket === "THINK" ? (
              <SupportAssistScene
                title={supportAssistCopy.title}
                paragraphs={supportAssistCopy.paragraphs}
                iconSrc={THINK_ICON_SRC}
              />
            ) : currentBucket === "POSITION" ? (
              <SupportAssistScene
                title={supportAssistCopy.title}
                paragraphs={supportAssistCopy.paragraphs}
                bucket={currentBucket}
              />
            ) : currentBucket === "BREATHE_OUT_SLOWLY" ? (
              <SupportAssistBreathingScene
                title={supportAssistCopy.title}
                paragraphs={supportAssistCopy.paragraphs}
              />
            ) : (
              <SupportAssistScene
                title={supportAssistCopy.title}
                paragraphs={supportAssistCopy.paragraphs}
                iconSrc={AIRFLOW_ICON_SRC}
                rotateIcon
              />
            )
          ) : isBreathingStep ? (
            <div className="flex min-h-full w-full flex-col items-center justify-start pb-10 pt-2">
              <BoxBreathingGuide compact />

              <div className="mt-5 space-y-2.5">
                <p className="mx-auto max-w-[20rem] text-center text-[0.9rem] leading-relaxed text-slate-600">
                  {BREATHE_OUT_RECTANGLE_HELPER}
                </p>
                <div className="flex justify-center">
                  <div className="flex max-w-[18rem] flex-wrap justify-center gap-2">
                    {breatheOutPills.map((pill) => (
                      <InfoPill key={pill}>{pill}</InfoPill>
                    ))}
                  </div>
                </div>

                {data.recoveryPlan.buckets[currentBucket].customNote.trim() && (
                  <Surface className="border border-[#319A50]/15 bg-[#F5FBF6] p-3.5">
                    <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">My note</p>
                    <p className="mt-1.5 text-[0.92rem] leading-relaxed text-slate-700">
                      {data.recoveryPlan.buckets[currentBucket].customNote}
                    </p>
                  </Surface>
                )}
              </div>
            </div>
          ) : currentBucket === "STOP" ? (
            <StopScene
              onIconAnchorChange={handleStopIconAnchorChange}
              selectedStrategies={selectedStrategies}
              onActionRoute={navigate}
            />
          ) : currentBucket === "THINK" ? (
            <ThinkScene
              quote={activeThinkQuote}
              selfCheckComplete={Boolean(currentThinkSelfCheck)}
              showSelfCheck={showThinkSelfCheck}
              onOpenSelfCheck={openThinkSelfCheck}
            />
          ) : currentBucket === "POSITION" ? (
            <PositionScene
              activeTabId={positionTab}
              imageIndex={positionImageIndex}
              onTabChange={setPositionTab}
            />
          ) : currentBucket === "AIRFLOW_COOL" ? (
            <AirflowScene />
          ) : (
            <GenericScene
              currentBucket={currentBucket}
              title={copy.title}
              eyebrow={copy.eyebrow}
              description={copy.description}
              selectedStrategies={selectedStrategies}
              customNote={data.recoveryPlan.buckets[currentBucket].customNote}
            />
          )}
        </div>

        {isPracticeMode && (
          <Surface className="relative z-20 shrink-0 bg-[#FFF8F1] p-3.5">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 text-[#E88C5D]" />
              <p className="text-[0.88rem] leading-relaxed text-slate-600">
                This is a practice simulation. It will not be added to your Episode Diary.
              </p>
            </div>
          </Surface>
        )}

        <div className="relative z-20 shrink-0 grid grid-cols-2 gap-3">
          <SecondaryButton onClick={onBack} className="h-[52px] min-h-[52px] px-4 py-3 text-[0.95rem]">
            Back
          </SecondaryButton>
          {isFinalStep ? (
            isPracticeMode ? (
              <div aria-hidden className="h-[52px] min-h-[52px] w-full" />
            ) : (
              <PrimaryButton
                onClick={restartEpisodeFlow}
                className="h-[52px] min-h-[52px] justify-between bg-[#C84A4A] px-4 py-3 text-[0.95rem] shadow-[0_18px_40px_-26px_rgba(200,74,74,0.72)] hover:bg-[#B94242]"
              >
                <span className="whitespace-nowrap text-center leading-tight">Restart</span>
                <RotateCcw className="h-5 w-5 shrink-0" />
              </PrimaryButton>
            )
          ) : (
            <PrimaryButton onClick={onNext} className="h-[52px] min-h-[52px] justify-between px-4 py-3 text-[0.95rem]">
              <span className="whitespace-nowrap text-center leading-tight">Next step</span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </PrimaryButton>
          )}
        </div>

        {isPracticeMode ? (
          <button
            onClick={abandonEpisodeFlow}
            className="relative z-20 shrink-0 pt-0.5 text-center text-[0.92rem] font-semibold text-[#319A50]"
          >
            End practice
          </button>
        ) : (
          <SecondaryButton
            onClick={finishOrExitRecoveryPlan}
            className="relative z-20 min-h-[50px] w-full shrink-0 px-4 py-3 text-[0.95rem]"
          >
            Finish / Exit Recovery Plan
          </SecondaryButton>
        )}

        <ThinkSelfCheckDialog
          open={thinkSelfCheckOpen && !isSupportAssistMode}
          onOpenChange={setThinkSelfCheckOpen}
          items={selfChecklistItems}
          draft={draftThinkSelfCheck}
          onAnswerChange={updateDraftAnswer}
          onSave={saveThinkSelfCheck}
          canSave={isThinkSelfCheckComplete(selfChecklistItems, draftThinkSelfCheck)}
          isPracticeMode={isPracticeMode}
        />
      </div>
    </AppFrame>
  );
}
