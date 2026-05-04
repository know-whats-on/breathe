import { useState, type ReactNode } from "react";
import { ArrowLeft, HeartHandshake, House } from "lucide-react";
import { useNavigate } from "react-router";
import { AppFrame, PrimaryButton, SecondaryButton, Surface } from "../components/AppChrome";
import { getDisplayName } from "../lib/format";
import { usePreviousScreenBack } from "../lib/navigation";
import { useAppState } from "../state/AppState";

const STOP_ICON_SRC = "/recovery-step-icons/stop-naked.svg";
const NO_HELP_TITLE = "I am experiencing a breathlessness episode but do not need any help right now";
const NO_HELP_MESSAGE =
  "Thank you for your concern - please give me some space and allow me at least 10 minutes to try and get my breathing under control. I will let you know if I need you to help in any way";
const HELP_INTRO_MESSAGE =
  "I need some help. You can assist by guiding me through my breathlessness plan. This app will help you do this";

function TopActionButton({
  ariaLabel,
  onClick,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/88 text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

export default function Support() {
  const navigate = useNavigate();
  const goBack = usePreviousScreenBack("/");
  const { data, actions } = useAppState();
  const [showHelpIntro, setShowHelpIntro] = useState(false);

  const activeEpisode = data.episodeRuntime;
  const practiceActive = activeEpisode?.mode === "practice";
  const profile = data.profile;
  const displayName = profile ? getDisplayName(profile.name, profile.isForSelf, profile.careRecipientName) : "there";

  const getEpisodeRoute = () => {
    if (activeEpisode?.stage === "review") return "/review";
    if (activeEpisode?.stage === "next_steps") return "/next-steps";
    return "/episode";
  };

  const handleStartSupportGuidance = () => {
    if (practiceActive) return;

    actions.startEpisode({ mode: "live", guideVariant: "support_assist" });
    navigate(getEpisodeRoute());
  };

  const openHelpIntro = () => {
    setShowHelpIntro(true);
  };

  if (showHelpIntro) {
    return (
      <AppFrame tone="warm">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-6 flex items-center justify-between gap-3">
            <TopActionButton ariaLabel="Go back" onClick={() => setShowHelpIntro(false)}>
              <ArrowLeft className="h-5 w-5" />
            </TopActionButton>
            <TopActionButton ariaLabel="Go home" onClick={() => navigate("/")}>
              <House className="h-5 w-5" />
            </TopActionButton>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-violet-600 text-white shadow-[0_18px_40px_-26px_rgba(124,58,237,0.68)]">
              <HeartHandshake className="h-10 w-10" />
            </div>
            <p className="mt-6 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
              Support or Assistance
            </p>
            <Surface className="mt-6 max-w-[22rem] bg-[linear-gradient(180deg,_rgba(245,252,246,1)_0%,_rgba(255,255,255,1)_100%)] p-6">
              <p className="text-[1.45rem] font-semibold leading-[1.35] text-slate-900">{HELP_INTRO_MESSAGE}</p>
            </Surface>

            {practiceActive && (
              <Surface className="mt-4 max-w-[22rem] border border-[#E88C5D]/18 bg-[#FFF6F2]">
                <p className="text-[0.95rem] leading-relaxed text-slate-700">
                  Finish the current practice session before opening the support-assisted guide.
                </p>
              </Surface>
            )}
          </div>

          <PrimaryButton
            type="button"
            onClick={handleStartSupportGuidance}
            disabled={practiceActive}
            className="mt-6 w-full"
          >
            Help, {displayName}
          </PrimaryButton>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame tone="warm">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-6 flex items-center justify-between gap-3">
          <TopActionButton ariaLabel="Go back" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </TopActionButton>
          <TopActionButton ariaLabel="Go home" onClick={() => navigate("/")}>
            <House className="h-5 w-5" />
          </TopActionButton>
        </div>

        <div>
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
            Support or Assistance
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-[2.8rem] bg-[#EAF6EE] shadow-[0_24px_60px_-34px_rgba(49,154,80,0.55)] ring-1 ring-[#319A50]/10">
            <img
              src={STOP_ICON_SRC}
              alt=""
              className="h-28 w-28 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <h1 className="mt-7 text-[2rem] font-bold leading-[1.05] text-slate-900">
            {NO_HELP_TITLE}
          </h1>

          <Surface className="mt-5 max-w-[22rem] bg-white/95 p-5 text-left">
            <p className="text-[1.12rem] font-semibold leading-[1.45] text-slate-900">{NO_HELP_MESSAGE}</p>
          </Surface>
        </div>

        <div className="mt-auto grid gap-3 pt-8">
          <PrimaryButton type="button" onClick={openHelpIntro} className="w-full text-[1.08rem]">
            Ask for Support
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => navigate("/", { replace: true })} className="w-full text-[1.02rem]">
            Return Home
          </SecondaryButton>
        </div>
      </div>
    </AppFrame>
  );
}
