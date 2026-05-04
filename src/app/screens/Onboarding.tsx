import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { STARTER_MODULE_RECOMMENDATIONS } from "../content/planContent";
import { AppFrame, PrimaryButton, ProgressDots, SecondaryButton, Surface, ToggleChip } from "../components/AppChrome";
import { useAppState } from "../state/AppState";
import type { UserProfile } from "../model/types";
import { getDisplayName } from "../lib/format";
import { saveOnboardingRedirect } from "../lib/onboardingRedirect";

const FINAL_STEP_ICONS = [
  {
    key: "stop",
    src: "/do-your-five-icons/stop-icon.svg",
    angle: -90,
    floatDuration: 4.6,
    floatDelay: 0.1,
  },
  {
    key: "calm",
    src: "/do-your-five-icons/calm-icon.svg",
    angle: -18,
    floatDuration: 4.2,
    floatDelay: 0.45,
  },
  {
    key: "position",
    src: "/do-your-five-icons/position-icon.svg",
    angle: 54,
    floatDuration: 4.8,
    floatDelay: 0.25,
  },
  {
    key: "blow-air",
    src: "/do-your-five-icons/blow-air-icon.svg",
    angle: 126,
    floatDuration: 4.5,
    floatDelay: 0.7,
  },
  {
    key: "fan",
    src: "/do-your-five-icons/fan-icon.svg",
    angle: 198,
    floatDuration: 5,
    floatDelay: 0.95,
  },
] as const;

const FINAL_STEP_ORBIT_DURATION = 17;
const FINAL_STEP_ORBIT_RADIUS = 86;
const FINAL_STEP_ORBIT_STEPS = 18;
const LEARN_MORE_URL =
  "https://www.uts.edu.au/research/centres/impacct/about-us/impacct-research/chronic-care/breathe-project";
const FINAL_STEP_ORBIT_TIMES = Array.from(
  { length: FINAL_STEP_ORBIT_STEPS + 1 },
  (_, index) => index / FINAL_STEP_ORBIT_STEPS
);

function getOrbitFrames(startAngle: number) {
  const positions = FINAL_STEP_ORBIT_TIMES.map((_, index) => {
    const radians = ((startAngle + (360 * index) / FINAL_STEP_ORBIT_STEPS) * Math.PI) / 180;
    return {
      x: Math.cos(radians) * FINAL_STEP_ORBIT_RADIUS,
      y: Math.sin(radians) * FINAL_STEP_ORBIT_RADIUS,
    };
  });

  return {
    x: positions.map((position) => position.x),
    y: positions.map((position) => position.y),
  };
}

function generateUniqueId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from({ length: 3 }, (_, groupIndex) =>
    Array.from({ length: 4 }, (_, charIndex) => chars[bytes[groupIndex * 4 + charIndex] % chars.length]).join("")
  ).join("-");
}

function isValidEmail(value: string) {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

async function copyTextToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let didCopy = false;
    try {
      didCopy = document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }

    if (!didCopy) {
      throw new Error("Copy command failed");
    }
  }
}

export default function Onboarding() {
  const { actions } = useAppState();
  const [step, setStep] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [isForSelf, setIsForSelf] = useState<boolean | null>(null);
  const [careRecipientName, setCareRecipientName] = useState("");
  const [showPlanInfo, setShowPlanInfo] = useState(true);
  const startTimeoutRef = useRef<number | null>(null);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);

  const showUniqueId = !email.trim() && uniqueId.length > 0;
  const displayName = getDisplayName(name, isForSelf ?? true, careRecipientName);
  const hasEmailOrUniqueId = isValidEmail(email) || uniqueId.length > 0;
  const canContinueProfile =
    name.trim().length > 0 &&
    hasEmailOrUniqueId &&
    isForSelf !== null &&
    (isForSelf || careRecipientName.trim().length > 0);

  useEffect(() => {
    return () => {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
      }
      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const completeOnboarding = (path: string) => {
    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      uniqueId: email.trim() ? "" : uniqueId,
      isForSelf: Boolean(isForSelf),
      careRecipientName: careRecipientName.trim(),
    };
    saveOnboardingRedirect(path);
    actions.completeOnboarding(profile, STARTER_MODULE_RECOMMENDATIONS);
  };

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    startTimeoutRef.current = window.setTimeout(() => {
      setIsStarting(false);
      setStep(1);
      startTimeoutRef.current = null;
    }, 420);
  };

  const handleCopyUniqueId = async () => {
    if (!uniqueId) return;

    try {
      await copyTextToClipboard(uniqueId);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    if (copyFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(copyFeedbackTimeoutRef.current);
    }

    copyFeedbackTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
      copyFeedbackTimeoutRef.current = null;
    }, 1800);
  };

  return (
    <AppFrame tone="calm">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden pb-8 text-center"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 -mx-4 overflow-hidden">
              <motion.div
                className="absolute inset-[-10%] bg-[radial-gradient(circle_at_42%_18%,rgba(49,154,80,0.18),transparent_42%),radial-gradient(circle_at_74%_24%,rgba(146,201,247,0.16),transparent_36%),radial-gradient(circle_at_48%_88%,rgba(49,154,80,0.12),transparent_34%)]"
                animate={{
                  opacity: [0.7, 0.98, 0.78, 0.94, 0.7],
                  scale: [1, 1.1, 1.02, 1.12, 1],
                  rotate: [0, 5, -4, 3, 0],
                  x: [-14, 18, -10, 22, -14],
                  y: [-8, 18, -16, 12, -8],
                }}
                transition={{
                  duration: 13.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.24, 0.5, 0.76, 1],
                }}
              />
              <motion.div
                className="absolute left-[-22%] top-[-2%] h-72 w-72 rounded-full bg-[#9AE0D1]/42 blur-[68px]"
                animate={{
                  x: [-44, 58, -20, 40, -44],
                  y: [-24, 60, 10, -38, -24],
                  scale: [0.9, 1.24, 0.98, 1.18, 0.9],
                  rotate: [-6, 8, -5, 6, -6],
                  opacity: [0.32, 0.62, 0.44, 0.54, 0.32],
                }}
                transition={{
                  duration: 10.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.24, 0.5, 0.74, 1],
                }}
              />
              <motion.div
                className="absolute right-[-24%] top-[14%] h-80 w-80 rounded-full bg-[#92C9F7]/38 blur-[76px]"
                animate={{
                  x: [36, -60, 24, -42, 36],
                  y: [-30, 34, 68, -10, -30],
                  scale: [0.98, 1.28, 0.94, 1.18, 0.98],
                  rotate: [5, -8, 6, -5, 5],
                  opacity: [0.26, 0.56, 0.38, 0.46, 0.26],
                }}
                transition={{
                  duration: 11.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.22, 0.5, 0.78, 1],
                }}
              />
              <motion.div
                className="absolute bottom-[10%] left-[6%] h-64 w-64 rounded-full bg-[#D2F3D8]/44 blur-[66px]"
                animate={{
                  x: [-28, 62, 34, -22, -28],
                  y: [28, -38, 36, 56, 28],
                  scale: [0.94, 1.24, 1, 1.16, 0.94],
                  rotate: [-4, 7, -5, 5, -4],
                  opacity: [0.3, 0.58, 0.4, 0.5, 0.3],
                }}
                transition={{
                  duration: 10.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.26, 0.5, 0.74, 1],
                }}
              />
              <motion.div
                className="absolute bottom-[-4%] right-[10%] h-52 w-52 rounded-full bg-[#B8DFFF]/32 blur-[58px]"
                animate={{
                  x: [26, -32, 34, -22, 26],
                  y: [10, -42, 28, 44, 10],
                  scale: [0.92, 1.2, 1, 1.14, 0.92],
                  rotate: [6, -7, 5, -5, 6],
                  opacity: [0.2, 0.42, 0.26, 0.34, 0.2],
                }}
                transition={{
                  duration: 9.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.22, 0.5, 0.78, 1],
                }}
              />
            </div>
            <div className="relative flex w-full max-w-[20.5rem] flex-col items-center">
              <h1 className="max-w-[20.5rem] text-[2.12rem] font-bold leading-[1.04] text-[#319A50]">
                My Breathlessness Episode Recovery Plan
              </h1>
              <p className="mt-5 max-w-[20.5rem] text-[1.02rem] leading-relaxed text-slate-600">
                Learn to control breathlessness, so it doesn’t control you
              </p>
              <div className="mt-10 w-full">
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isStarting ? 0.92 : 1,
                    scale: isStarting ? 0.985 : 1,
                    filter: isStarting ? "saturate(0.94)" : "saturate(1)",
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 inset-y-2 rounded-full bg-[#8AD89A]/45 blur-xl"
                    initial={false}
                    animate={{
                      opacity: isStarting ? [0.18, 0.34, 0] : 0.16,
                      scale: isStarting ? [0.98, 1.06, 1.1] : 1,
                    }}
                    transition={{
                      duration: 0.42,
                      ease: "easeOut",
                      times: [0, 0.45, 1],
                    }}
                  />
                  <PrimaryButton
                    onClick={handleStart}
                    aria-busy={isStarting}
                    className={`relative w-full text-[1.1rem] ${isStarting ? "pointer-events-none" : ""}`}
                  >
                    <motion.span
                      initial={false}
                      animate={{ opacity: isStarting ? 0.94 : 1, y: isStarting ? 0.5 : 0 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    >
                      Tap to Start
                    </motion.span>
                    <motion.span
                      initial={false}
                      animate={{ opacity: isStarting ? 0.78 : 1, x: isStarting ? 1.5 : 0 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                      className="inline-flex"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </PrimaryButton>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="flex flex-1 flex-col"
          >
            <ProgressDots step={1} total={3} />
            <h1 className="text-[2rem] font-bold leading-tight text-slate-900">Let&apos;s get started!</h1>
            <p className="mt-3 text-[1rem] leading-relaxed text-slate-500">
              We use this data to personalise your experience. Your information is stored securely on your device.
            </p>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Margaret"
                  className="min-h-[58px] w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">
                  Email
                </span>
                <input
                  value={email}
                  type="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (event.target.value.trim()) setUniqueId("");
                  }}
                  placeholder="name@example.com"
                  className="min-h-[58px] w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10"
                />
              </label>

              {!showUniqueId ? (
                <button
                  onClick={() => {
                    setEmail("");
                    setUniqueId(generateUniqueId());
                    setCopyStatus("idle");
                  }}
                  className="text-[0.92rem] font-semibold text-[#319A50]"
                >
                  I don’t have an email
                </button>
              ) : (
                <Surface className="bg-[#F5FBF6]">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-2xl bg-[#319A50]/10 p-2 text-[#319A50]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
                        Unique ID
                      </p>
                      <p className="mt-2 font-mono text-[1.5rem] font-bold tracking-[0.14em] text-slate-900">
                        {uniqueId}
                      </p>
                      <button
                        onClick={handleCopyUniqueId}
                        className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-[0.9rem] font-semibold text-[#319A50] shadow-sm ring-1 ring-[#319A50]/15 transition active:scale-[0.98]"
                        aria-label="Copy code"
                      >
                        {copyStatus === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>
                          {copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy code"}
                        </span>
                      </button>
                      <p className="mt-2 text-[0.92rem] leading-relaxed text-slate-500">
                        Write this down or copy it somewhere safe. You'll need it to access your plan if you ever
                        change or lose your phone
                      </p>
                      <button
                        onClick={() => {
                          setUniqueId("");
                          setCopyStatus("idle");
                        }}
                        className="mt-3 text-[0.9rem] font-semibold text-[#319A50]"
                      >
                        I do have an email
                      </button>
                    </div>
                  </div>
                </Surface>
              )}

              <div>
                <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">
                  Are you going to be using this app for yourself?
                </span>
                <div className="flex gap-2">
                  <ToggleChip
                    active={isForSelf === true}
                    className="flex-1"
                    onClick={() => {
                      setIsForSelf(true);
                      setCareRecipientName("");
                    }}
                  >
                    Yes
                  </ToggleChip>
                  <ToggleChip active={isForSelf === false} className="flex-1" onClick={() => setIsForSelf(false)}>
                    No
                  </ToggleChip>
                </div>
              </div>

              {isForSelf === false && (
                <label className="block">
                  <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">
                    Who are you setting it up for?
                  </span>
                  <input
                    value={careRecipientName}
                    onChange={(event) => setCareRecipientName(event.target.value)}
                    placeholder="Name of the Person"
                    className="min-h-[58px] w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10"
                  />
                </label>
              )}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
              <SecondaryButton onClick={() => setStep(0)}>Back</SecondaryButton>
              <PrimaryButton disabled={!canContinueProfile} onClick={() => setStep(2)}>
                Next
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="plan-intro"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="flex flex-1 flex-col"
          >
            <ProgressDots step={2} total={3} />
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#319A50]/10 text-[#319A50]">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-[2rem] font-bold leading-tight text-slate-900">All done, {displayName}!</h1>

            <button
              onClick={() => setShowPlanInfo((current) => !current)}
              className="mt-4 self-start text-[0.98rem] font-semibold text-[#319A50] underline underline-offset-4"
            >
              What is a Breathlessness Episode Recovery Plan?
            </button>

            {showPlanInfo && (
              <Surface className="mt-4">
                <p className="text-[1rem] leading-relaxed text-slate-600">
                  ‘Breathlessness Episode Recovery Plans’ (or ‘Breathlessness Plans’ for short) are easy-to-follow
                  guides that summarise what to do when breathlessness becomes worse using simple, non-medicated
                  strategies to help breathing and thinking.
                </p>
              </Surface>
            )}

            <p className="mt-6 text-[1rem] leading-relaxed text-slate-500">
              Create your plan now, or finish and head to Home. You can come back and personalise your plan anytime.
            </p>

            <div className="flex flex-1 items-center justify-center py-6">
              <div className="relative h-[13.25rem] w-[13.25rem]" aria-hidden="true">
                <div className="absolute inset-[1.85rem] rounded-full bg-[radial-gradient(circle,rgba(49,154,80,0.14),rgba(146,201,247,0.08),transparent_72%)] blur-2xl" />
                {FINAL_STEP_ICONS.map((icon) => {
                  const orbit = getOrbitFrames(icon.angle);

                  return (
                    <motion.div
                      key={icon.key}
                      className="absolute left-1/2 top-1/2 h-[4.45rem] w-[4.45rem] -translate-x-1/2 -translate-y-1/2"
                      animate={{
                        x: orbit.x,
                        y: orbit.y,
                      }}
                      transition={{
                        duration: FINAL_STEP_ORBIT_DURATION,
                        repeat: Infinity,
                        ease: "linear",
                        times: FINAL_STEP_ORBIT_TIMES,
                      }}
                    >
                      <motion.img
                        src={icon.src}
                        alt=""
                        className="h-full w-full select-none object-contain drop-shadow-[0_12px_24px_rgba(49,154,80,0.14)]"
                        animate={{
                          y: [0, -3.5, 1, -2.5, 0],
                          x: [0, 1.25, -0.75, 0.75, 0],
                          scale: [1, 1.04, 0.995, 1.03, 1],
                        }}
                        transition={{
                          duration: icon.floatDuration,
                          delay: icon.floatDelay,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        draggable={false}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <PrimaryButton onClick={() => completeOnboarding("/plan?mode=setup")} className="w-full px-3">
                  <span>Create Plan</span>
                </PrimaryButton>
                <a
                  href={LEARN_MORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[60px] items-center justify-center rounded-[1.2rem] bg-white/88 px-3 py-4 text-center text-[1rem] font-semibold text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
                >
                  Learn More
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
                <SecondaryButton onClick={() => completeOnboarding("/")}>
                  <span>Finish</span>
                </SecondaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppFrame>
  );
}
