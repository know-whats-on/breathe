import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export const POSITION_TAB_SETS = [
  {
    id: "standing",
    label: "Standing",
    images: [
      "/recovery-position/Standing%201.svg",
      "/recovery-position/Standing%202.svg",
      "/recovery-position/Standing%203.svg",
    ],
  },
  {
    id: "sitting",
    label: "Sitting",
    images: [
      "/recovery-position/Sitting%201.svg",
      "/recovery-position/Sitting%202.svg",
      "/recovery-position/Sitting%203.svg",
    ],
  },
] as const;

export type PositionTabId = (typeof POSITION_TAB_SETS)[number]["id"];

const POSITION_ROTATING_INSTRUCTIONS = [
  "Lean forward",
  "Keep your shoulders down",
  "Support your elbows and arms",
  "Flop and drop shoulders",
  "Keep your elbows low",
] as const;

const POSITION_INSTRUCTION_INTERVAL_MS = 2200;
const POSITION_INSTRUCTION_TRANSITION_SECONDS = 0.24;

export const POSITION_TAB_GUIDE_COPY = {
  standing: {
    heading: "Lean Forward | Support Your Elbows and Arms",
    subheading: "When Standing Up",
    body: "Bend at your hips to lean forward. To support the weight of your upper body, you can lean over the following:",
    options: [
      "Back of a chair",
      "Kitchen counter",
      "Table",
      "Windowsill",
      "Walking frame",
      "Shopping trolley",
      "Fence or railing",
    ],
    extraLead: "If you can’t lean forward while standing up:",
    extraOptions: ["Lean back against a wall, with your feet shoulder width apart"],
  },
  sitting: {
    heading: "When Sitting Down",
    body: "If you are able to sit down or already sitting, sit up straight in a chair with your feet wide apart. Keep your shoulders down, lean forward and support your arms in one of the following ways:",
    options: [
      "Rest your elbows and forearms on your knees",
      "Lightly stretch your arms in front on a table",
      "Pile pillows on a table in front, then rest your head and arms on them",
    ],
  },
} satisfies Record<
  PositionTabId,
  {
    heading: string;
    subheading?: string;
    body: string;
    options: readonly string[];
    extraLead?: string;
    extraOptions?: readonly string[];
  }
>;

export function getPositionTabDefinition(tabId: PositionTabId) {
  return POSITION_TAB_SETS.find((tab) => tab.id === tabId) ?? POSITION_TAB_SETS[0];
}

function PositionGuideDialog({
  tabId,
  onClose,
}: {
  tabId: PositionTabId;
  onClose: () => void;
}) {
  const activeTab = getPositionTabDefinition(tabId);
  const copy = POSITION_TAB_GUIDE_COPY[tabId];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="position-guide-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/34 px-4 py-5 backdrop-blur-[2px]"
    >
      <div className="flex max-h-full w-full max-w-[25rem] flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_34px_90px_-36px_rgba(15,23,42,0.48)] ring-1 ring-black/5">
        <div className="min-h-0 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
                {activeTab.label}
              </p>
              <h2 id="position-guide-title" className="mt-2 text-[1.55rem] font-bold leading-tight text-slate-900">
                {copy.heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close position guidance"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 shadow-sm ring-1 ring-black/5 transition active:scale-[0.97]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {copy.subheading && (
            <p className="mt-4 text-[1.05rem] font-semibold leading-tight text-[#057EAD]">{copy.subheading}</p>
          )}
          <p className="mt-3 text-[1rem] leading-relaxed text-slate-700">{copy.body}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {copy.options.map((option) => (
              <span
                key={option}
                className="rounded-[0.8rem] border border-slate-200 bg-[#F7FBF8] px-3 py-2 text-[0.9rem] font-semibold leading-tight text-[#155E33]"
              >
                {option}
              </span>
            ))}
          </div>

          {copy.extraLead && copy.extraOptions && (
            <>
              <p className="mt-5 text-[1rem] leading-relaxed text-slate-700">{copy.extraLead}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {copy.extraOptions.map((option) => (
                  <span
                    key={option}
                    className="rounded-[0.8rem] border border-slate-200 bg-[#F7FBF8] px-3 py-2 text-[0.9rem] font-semibold leading-tight text-[#155E33]"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PositionVisualGuide({
  activeTabId,
  imageIndex,
  onTabChange,
  showTitle = true,
  className = "",
}: {
  activeTabId: PositionTabId;
  imageIndex: number;
  onTabChange: (tabId: PositionTabId) => void;
  showTitle?: boolean;
  className?: string;
}) {
  const [openGuideTab, setOpenGuideTab] = useState<PositionTabId | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [instructionIndex, setInstructionIndex] = useState(0);
  const activeTab = getPositionTabDefinition(activeTabId);
  const currentImage = activeTab.images[imageIndex] ?? activeTab.images[0];
  const activeInstruction = POSITION_ROTATING_INSTRUCTIONS[instructionIndex % POSITION_ROTATING_INSTRUCTIONS.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setInstructionIndex((value) => (value + 1) % POSITION_ROTATING_INSTRUCTIONS.length);
    }, POSITION_INSTRUCTION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={`flex w-full flex-col items-center text-center ${className}`}>
      {showTitle && (
        <h1 className="text-[clamp(1.8rem,7vw,2.35rem)] font-bold leading-[0.95] text-slate-900">
          Position
        </h1>
      )}

      <div className={showTitle ? "mt-3 flex flex-wrap justify-center gap-2" : "flex flex-wrap justify-center gap-2"}>
        {POSITION_TAB_SETS.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-pressed={isActive}
              className={`rounded-full px-4 py-2.5 text-[0.92rem] font-semibold transition active:scale-[0.98] ${
                isActive
                  ? "bg-[#319A50] text-white shadow-[0_18px_40px_-26px_rgba(49,154,80,0.7)]"
                  : "border border-[#319A50]/16 bg-white/90 text-slate-700 shadow-[0_18px_40px_-30px_rgba(31,41,55,0.35)] ring-1 ring-black/5"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setOpenGuideTab(activeTab.id)}
        className="mt-4 flex min-h-[15rem] w-full items-center justify-center rounded-[1.35rem] bg-white/88 p-3 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] ring-1 ring-black/5 transition active:scale-[0.99]"
      >
        {failedImages.has(currentImage) ? (
          <span className="text-[0.95rem] font-semibold text-slate-500">
            {activeTab.label} position image unavailable
          </span>
        ) : (
          <img
            key={`${activeTab.id}-${currentImage}`}
            src={currentImage}
            alt={`${activeTab.label} recovery position ${imageIndex + 1}`}
            className="h-[min(34vh,18rem)] w-full object-contain"
            loading="eager"
            decoding="async"
            draggable={false}
            onError={() => {
              setFailedImages((current) => {
                const next = new Set(current);
                next.add(currentImage);
                return next;
              });
            }}
          />
        )}
      </button>

      <div className="mt-3 flex min-h-[3.2rem] w-full max-w-[22rem] items-center justify-center rounded-[1.15rem] bg-white/84 px-4 py-3 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
        <p className="text-[1rem] font-semibold leading-snug text-[#057EAD]">Tap Image for Instructions</p>
      </div>

      <div className="mt-2 flex min-h-[3rem] w-full max-w-[22rem] items-center justify-center rounded-[1rem] bg-white/72 px-4 py-2.5 text-center shadow-[0_16px_38px_-34px_rgba(15,23,42,0.42)] ring-1 ring-black/5">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeInstruction}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: POSITION_INSTRUCTION_TRANSITION_SECONDS }}
            className="text-[0.98rem] font-semibold leading-snug text-slate-800"
          >
            {activeInstruction}
          </motion.p>
        </AnimatePresence>
      </div>

      {openGuideTab && <PositionGuideDialog tabId={openGuideTab} onClose={() => setOpenGuideTab(null)} />}
    </div>
  );
}
