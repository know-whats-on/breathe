import { ArrowLeft, Home, NotebookTabs, Settings2, LibraryBig } from "lucide-react";
import { motion } from "motion/react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AppFrame({
  children,
  tone = "mist",
  withNav = false,
  scrollable = true,
  contentClassName,
}: {
  children: ReactNode;
  tone?: "mist" | "warm" | "calm" | "focus";
  withNav?: boolean;
  scrollable?: boolean;
  contentClassName?: string;
}) {
  const toneClass =
    tone === "warm"
      ? "bg-[radial-gradient(circle_at_top,_rgba(255,246,232,0.95),_rgba(247,251,248,1)_55%)]"
      : tone === "calm"
      ? "bg-[radial-gradient(circle_at_top,_rgba(232,248,255,0.95),_rgba(248,251,248,1)_55%)]"
      : tone === "focus"
      ? "bg-[linear-gradient(180deg,_rgba(239,247,242,1)_0%,_rgba(255,255,255,1)_42%,_rgba(244,248,246,1)_100%)]"
      : "bg-[linear-gradient(180deg,_rgba(247,251,248,1)_0%,_rgba(255,255,255,1)_42%,_rgba(245,248,249,1)_100%)]";

  return (
    <div className={joinClasses("h-[100dvh] overflow-hidden", toneClass)}>
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-5 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div
          className={joinClasses(
            "flex min-h-0 flex-1 flex-col",
            scrollable ? "overflow-y-auto overscroll-contain" : "overflow-hidden",
            withNav
              ? "pb-[calc(6.9rem+env(safe-area-inset-bottom))]"
              : "pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  backTo,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (backTo) navigate(backTo);
  };

  return (
    <div className="mb-7 flex items-start gap-3">
      {(backTo || onBack) && (
        <button
          onClick={handleBack}
          className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-[0.97]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[2rem] font-bold leading-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-[0.98rem] leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6 flex gap-2">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={joinClasses(
            "h-1.5 flex-1 rounded-full transition-all",
            index <= step ? "bg-[#319A50]" : "bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={joinClasses(
        "inline-flex min-h-[60px] items-center justify-center gap-3 rounded-[1.2rem] bg-[#319A50] px-5 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_40px_-24px_rgba(49,154,80,0.7)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:shadow-none",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={joinClasses(
        "inline-flex min-h-[60px] items-center justify-center gap-3 rounded-[1.2rem] bg-white/88 px-5 py-4 text-[1rem] font-semibold text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none",
        className
      )}
    >
      {children}
    </button>
  );
}

export const Surface = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { children: ReactNode }>(
  ({ children, className, ...props }, ref) => (
    <section
      {...props}
      ref={ref}
      className={joinClasses(
        "rounded-[1.6rem] bg-white/88 p-4 shadow-[0_24px_50px_-32px_rgba(31,41,55,0.22)] ring-1 ring-black/5 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </section>
  )
);

Surface.displayName = "Surface";

export function ToggleChip({
  active,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={joinClasses(
        "rounded-full border px-4 py-2.5 text-[0.92rem] font-semibold transition",
        active
          ? "border-[#319A50] bg-[#319A50] text-white"
          : "border-slate-200 bg-white text-slate-600 active:bg-slate-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ChecklistRow({
  title,
  detail,
  active,
  onClick,
}: {
  title: string;
  detail: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={joinClasses(
        "w-full rounded-[1.2rem] border px-4 py-4 text-left transition",
        active
          ? "border-[#319A50] bg-[#319A50]/6 ring-2 ring-[#319A50]/10"
          : "border-slate-200 bg-white active:bg-slate-50"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={joinClasses(
            "mt-1 h-5 w-5 rounded-full border-2",
            active ? "border-[#319A50] bg-[#319A50]" : "border-slate-300"
          )}
        />
        <div className="min-w-0">
          <p className="text-[1rem] font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-[0.92rem] leading-relaxed text-slate-500">{detail}</p>
        </div>
      </div>
    </button>
  );
}

export function FooterNav() {
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/plan", label: "My Plan", icon: Settings2 },
    { to: "/diary", label: "Diary", icon: NotebookTabs },
    { to: "/resources", label: "Resources", icon: LibraryBig },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <nav className="pointer-events-auto w-[min(28rem,calc(100vw-2.5rem))] rounded-[1.4rem] bg-slate-900/96 p-2 text-white shadow-[0_30px_70px_-26px_rgba(15,23,42,0.72)] backdrop-blur">
        <div className="grid grid-cols-4 gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  joinClasses(
                    "flex min-h-[58px] flex-col items-center justify-center rounded-[1rem] text-[0.76rem] font-medium transition",
                    isActive ? "bg-white text-slate-900" : "text-white/78 hover:text-white"
                  )
                }
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function RecoveryHeroButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={joinClasses(
        "relative min-h-[13rem] overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1CC14C_0%,#30C75A_26%,#41C96B_58%,#62CF8A_100%)] px-6 py-6 text-left text-white shadow-[0_30px_80px_-34px_rgba(64,201,107,0.82)] transition active:scale-[0.985]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_48%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-1.35rem] bottom-[-2.2rem] w-[12.6rem] opacity-[0.26]"
        animate={{
          rotate: [0, 6, -4, 5, 0],
          x: [0, 2, -1, 1, 0],
          y: [0, -1, 1, -1, 0],
        }}
        transition={{
          duration: 5.4,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.2, 0.45, 0.72, 1],
        }}
        style={{ originX: 0.28, originY: 0.94 }}
      >
        <img
          src="/do-your-five/do-your-five-hand.svg"
          alt=""
          className="h-auto w-full select-none"
          draggable={false}
        />
      </motion.div>
      <div className="relative z-10 max-w-[12rem]">
        <p className="text-[clamp(2rem,7vw,3.2rem)] font-bold leading-[0.92]">
          Help Me Recover
        </p>
        <p className="mt-5 text-[1.28rem] font-semibold tracking-[0.01em] text-white/96">
          Do Your Five
        </p>
        <p className="mt-6 max-w-[14rem] text-[0.98rem] leading-relaxed text-white/88">
          Use your personalised Breathlessness Episode Recovery Plan now.
        </p>
      </div>
    </button>
  );
}
