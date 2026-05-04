import { useEffect, useRef, useState, type ReactNode, type UIEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  LogOut,
  PhoneCall,
  RefreshCw,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router";
import {
  AppFrame,
  FooterNav,
  PrimaryButton,
  RecoveryHeroButton,
  SecondaryButton,
  Surface,
} from "../components/AppChrome";
import { HOME_WIDGET_SHELL_CLASS } from "../components/homeWidgetStyles";
import WeatherModule from "../components/WeatherModule";
import { getDisplayName } from "../lib/format";
import { useAppState } from "../state/AppState";

const HOME_WIDGET_GRID_CLASS = "grid w-full grid-cols-2 gap-3.5 px-1 pb-2 pt-1";
const HOME_TRAY_PAGE_CLASS = "min-w-[calc(100%-1.15rem)] shrink-0 basis-[calc(100%-1.15rem)] snap-center";
const PAGE_COUNT = 3;
const PAGE_THREE_PLACEHOLDERS = ["Widget 1", "Widget 2", "Widget 3", "Widget 4"] as const;
const ACCESSIBLE_WIDGET_TONES = {
  review: "border border-emerald-100/90 bg-[linear-gradient(180deg,#F5FCF6_0%,#E8F7EB_100%)]",
  contacts: "border border-sky-100/90 bg-[linear-gradient(180deg,#F5FAFF_0%,#E7F1FF_100%)]",
  selfCheck: "border border-orange-100/90 bg-[linear-gradient(180deg,#FFF9F2_0%,#FFECD9_100%)]",
  practice: "border border-teal-100/90 bg-[linear-gradient(180deg,#F3FCFA_0%,#DDF5EE_100%)]",
  support: "border border-violet-100/90 bg-[linear-gradient(180deg,#FBF8FF_0%,#EEE7FF_100%)]",
} as const;

function HomeWidgetShell({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const classes = className ? `${HOME_WIDGET_SHELL_CLASS} ${className}` : HOME_WIDGET_SHELL_CLASS;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  return <Surface className={classes}>{children}</Surface>;
}

function HomeWidgetCard({
  title,
  summary,
  detail,
  accent,
  toneClass,
  icon: Icon,
  onClick,
}: {
  title: string;
  summary?: string;
  detail?: string;
  accent: string;
  toneClass?: string;
  icon: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <HomeWidgetShell onClick={onClick} className={toneClass}>
      <div className="flex items-start justify-between gap-2.5">
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-[1.2rem] ${accent}`}>
          <Icon className="h-7 w-7" />
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
      </div>
      <div className="mt-3.5 min-w-0 flex-1">
        {summary ? (
          <>
            <p className="text-[0.7rem] font-semibold uppercase leading-[1.15] tracking-[0.14em] text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {title}
            </p>
            <p className="mt-2 overflow-hidden text-[1.08rem] font-semibold leading-[1.15] text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {summary}
            </p>
          </>
        ) : (
          <p className="mt-2 overflow-hidden text-[1.08rem] font-semibold leading-[1.15] text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {title}
          </p>
        )}
        {detail ? (
          <p className="mt-1.5 overflow-hidden text-[0.88rem] leading-[1.38] text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {detail}
          </p>
        ) : null}
      </div>
    </HomeWidgetShell>
  );
}

function SimpleHomeWidgetCard({
  label,
  accent,
  toneClass,
  icon: Icon,
  onClick,
}: {
  label: string;
  accent: string;
  toneClass?: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <HomeWidgetShell onClick={onClick} className={`items-center justify-center text-center ${toneClass ?? ""}`}>
      <div className={`inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] ${accent}`}>
        <Icon className="h-8 w-8" />
      </div>
      <p className="mt-3.5 text-[1.12rem] font-semibold leading-[1.2] text-slate-900">{label}</p>
    </HomeWidgetShell>
  );
}

function CountMetricCard({
  count,
  label,
  onClick,
}: {
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <HomeWidgetShell onClick={onClick} className="items-center justify-center text-center">
      <p className="text-[3rem] font-bold leading-none text-[#319A50]">{count}</p>
      <p className="mt-2 text-[0.98rem] font-semibold lowercase text-[#319A50]">{label}</p>
    </HomeWidgetShell>
  );
}

function PlaceholderWidgetCard({ label }: { label: string }) {
  return (
    <HomeWidgetShell className="items-center justify-center text-center">
      <p className="text-[1rem] font-semibold text-slate-400">{label}</p>
    </HomeWidgetShell>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { data, actions } = useAppState();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const trayRef = useRef<HTMLDivElement | null>(null);

  const profile = data.profile;
  const displayName = profile ? getDisplayName(profile.name, profile.isForSelf, profile.careRecipientName) : "there";
  const activeEpisode = data.episodeRuntime;
  const practiceDisabled = activeEpisode?.mode === "live";

  const getEpisodeRoute = () => {
    if (activeEpisode?.stage === "review") return "/review";
    if (activeEpisode?.stage === "next_steps") return "/next-steps";
    return "/episode";
  };

  const handleTrayScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const pageElements = Array.from(container.querySelectorAll<HTMLElement>("[data-home-page]"));
    const nextPage = pageElements.reduce(
      (closest, page, index) => {
        const distance = Math.abs(container.scrollLeft - page.offsetLeft);
        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: currentPage, distance: Number.POSITIVE_INFINITY }
    ).index;

    if (nextPage !== currentPage) setCurrentPage(nextPage);
  };

  const scrollToPage = (pageIndex: number) => {
    const container = trayRef.current;
    if (!container) return;
    const page = container.querySelectorAll<HTMLElement>("[data-home-page]")[pageIndex];
    if (!page) return;
    container.scrollTo({ left: page.offsetLeft, behavior: "smooth" });
    setCurrentPage(pageIndex);
  };

  useEffect(() => {
    if (shouldReduceMotion) return;

    setShowSwipeHint(true);
    const timer = window.setTimeout(() => setShowSwipeHint(false), 950);

    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  const handleLogOut = () => {
    if (!window.confirm("Log out and clear this device's saved BREATHE data?")) return;
    actions.logOut();
    navigate("/onboarding", { replace: true });
  };

  const openPracticeSession = () => {
    setReviewDialogOpen(false);
    if (practiceDisabled) {
      navigate(getEpisodeRoute());
      return;
    }
    actions.startEpisode({ mode: "practice" });
    navigate("/episode");
  };

  return (
    <AppFrame withNav>
      <div className="flex flex-col gap-[1.1rem] pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.2em] text-[#319A50]">Home</p>
            <p className="mt-1 truncate text-[1.02rem] font-semibold text-slate-800">{displayName}</p>
          </div>
          <button
            onClick={handleLogOut}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/88 px-4 text-[0.88rem] font-semibold text-rose-700 ring-1 ring-black/5 transition active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        <RecoveryHeroButton
          onClick={() => {
            if (!activeEpisode) actions.startEpisode({ mode: "live" });
            navigate(getEpisodeRoute());
          }}
        />

        <div className="flex flex-col gap-4">
          <div className="relative -mx-3 overflow-hidden px-3">
            {currentPage > 0 && (
              <button
                type="button"
                aria-label="Previous drawer page"
                onClick={() => scrollToPage(currentPage - 1)}
                className="absolute left-1 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-600 shadow-sm ring-1 ring-black/5 transition active:scale-[0.97]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {currentPage < PAGE_COUNT - 1 && (
              <button
                type="button"
                aria-label="Next drawer page"
                onClick={() => scrollToPage(currentPage + 1)}
                className="absolute right-1 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-600 shadow-sm ring-1 ring-black/5 transition active:scale-[0.97]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <motion.div
              animate={showSwipeHint ? { x: [0, -14, 0] } : { x: 0 }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
            >
              <div
                ref={trayRef}
                onScroll={handleTrayScroll}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scroll-smooth px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div data-home-page className={HOME_TRAY_PAGE_CLASS}>
                  <div className={HOME_WIDGET_GRID_CLASS}>
                    <HomeWidgetCard
                      title="Ask for Support or Assistance"
                      toneClass={ACCESSIBLE_WIDGET_TONES.support}
                      accent="bg-violet-600 text-white shadow-[0_18px_40px_-26px_rgba(124,58,237,0.68)]"
                      icon={HeartHandshake}
                      onClick={() => navigate("/support", { state: { backTo: "/" } })}
                    />
                  <SimpleHomeWidgetCard
                    label="Support Contacts"
                    toneClass={ACCESSIBLE_WIDGET_TONES.contacts}
                    accent="bg-sky-600 text-white shadow-[0_18px_40px_-26px_rgba(2,132,199,0.7)]"
                    icon={PhoneCall}
                    onClick={() => navigate("/contacts")}
                  />
                  <WeatherModule compact />
                  <SimpleHomeWidgetCard
                    label="Self Check-in"
                    toneClass={ACCESSIBLE_WIDGET_TONES.selfCheck}
                    accent="bg-orange-500 text-white shadow-[0_18px_40px_-26px_rgba(249,115,22,0.65)]"
                    icon={BellRing}
                    onClick={() => navigate("/next-steps")}
                  />
                  </div>
                </div>

                <div data-home-page className={HOME_TRAY_PAGE_CLASS}>
                  <div className={HOME_WIDGET_GRID_CLASS}>
                    <CountMetricCard count={data.triggers.length} label="triggers" onClick={() => navigate("/triggers")} />
                    <HomeWidgetCard
                      title="Practice My Plan"
                      summary={practiceDisabled ? "Live session already active." : "Rehearse while calm."}
                      toneClass={ACCESSIBLE_WIDGET_TONES.practice}
                      accent="bg-teal-600 text-white shadow-[0_18px_40px_-26px_rgba(13,148,136,0.68)]"
                      icon={RefreshCw}
                      onClick={openPracticeSession}
                    />
                    <CountMetricCard count={data.episodeLogs.length} label="entries" onClick={() => navigate("/diary")} />
                    <SimpleHomeWidgetCard
                      label="Personalise My Plan"
                      toneClass={ACCESSIBLE_WIDGET_TONES.review}
                      accent="bg-emerald-600 text-white shadow-[0_18px_40px_-26px_rgba(5,150,105,0.7)]"
                      icon={ClipboardList}
                      onClick={() => setReviewDialogOpen(true)}
                    />
                  </div>
                </div>

                <div data-home-page className={HOME_TRAY_PAGE_CLASS}>
                  <div className={HOME_WIDGET_GRID_CLASS}>
                    {PAGE_THREE_PLACEHOLDERS.map((label) => (
                      <PlaceholderWidgetCard key={label} label={label} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: PAGE_COUNT }, (_, index) => (
              <button
                key={index}
                onClick={() => scrollToPage(index)}
                aria-label={`Go to Home tray page ${index + 1}`}
                className={`h-2.5 rounded-full transition ${
                  index === currentPage ? "w-6 bg-[#319A50]" : "w-2.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {reviewDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/32 px-5 backdrop-blur-[2px]">
          <div className="w-[min(27rem,calc(100vw-2.5rem))] overflow-hidden rounded-[1.9rem] bg-white shadow-[0_36px_100px_-40px_rgba(15,23,42,0.55)]">
            <div className="border-b border-slate-100 px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[1.35rem] font-semibold text-slate-900">Review My Plan</p>
                  <p className="mt-1 text-[0.94rem] leading-relaxed text-slate-500">
                    Open your personalised plan, or practise a simulation that will not be added to the Episode Diary.
                  </p>
                </div>
                <button
                  onClick={() => setReviewDialogOpen(false)}
                  className="text-[0.9rem] font-semibold text-[#319A50]"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              {practiceDisabled && (
                <div className="rounded-[1.2rem] bg-[#FFF8F1] px-4 py-3 text-[0.9rem] leading-relaxed text-slate-600">
                  A Help Me Recover session is already in progress. Resume that session first before starting a practice run.
                </div>
              )}

              <div className="mt-5 grid gap-3">
                <SecondaryButton
                  onClick={() => {
                    setReviewDialogOpen(false);
                    navigate("/plan");
                  }}
                  className="w-full justify-between"
                >
                  <span>Edit My Plan</span>
                  <ArrowUpRight className="h-5 w-5" />
                </SecondaryButton>
                <PrimaryButton onClick={openPracticeSession} disabled={practiceDisabled} className="w-full justify-between">
                  <span>Practice My Plan</span>
                  <ArrowUpRight className="h-5 w-5" />
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <FooterNav />
    </AppFrame>
  );
}
