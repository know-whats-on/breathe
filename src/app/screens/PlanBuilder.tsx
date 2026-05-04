import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Check, ChevronDown, ExternalLink, HeartHandshake, ListChecks, Play } from "lucide-react";
import { BUCKET_COPY, STRATEGY_LIBRARY, THINK_STRATEGY_SECTIONS } from "../content/planContent";
import { AppFrame, FooterNav, PageHeader, PrimaryButton, SecondaryButton, Surface } from "../components/AppChrome";
import BoxBreathingGuide from "../components/BoxBreathingGuide";
import LoopingDoYourFiveHand from "../components/LoopingDoYourFiveHand";
import PositionVisualGuide, { type PositionTabId, getPositionTabDefinition } from "../components/PositionVisualGuide";
import { getPathWithSearchAndHash } from "../lib/navigation";
import { useAppState } from "../state/AppState";
import {
  EVERYDAY_BREATHE_OUT_STRATEGY_IDS,
  REQUIRED_BREATHE_OUT_STRATEGY_ID,
  normaliseBreatheOutStrategyIds,
  normaliseRecoveryPlan,
  type RecoveryPlan,
  type StrategyBucketType,
} from "../model/types";
import type { StrategyOption } from "../content/planContent";

function moveItem(order: StrategyBucketType[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= order.length) return order;
  const next = [...order];
  const [removed] = next.splice(index, 1);
  next.splice(nextIndex, 0, removed);
  return next;
}

function withReviewedAt(plan: RecoveryPlan): RecoveryPlan {
  return {
    ...plan,
    lastReviewedAt: new Date().toISOString(),
  };
}

const SETUP_ORDER_PARAGRAPHS = [
  "This is a short list to help you take back control in-the-moment. There are only 5 key points that are easy to practise and remember.",
  "Put the steps in the order that works best for you.",
  "When you feel your breathlessness get worse, lift your hand and go through the steps.",
  "Putting up your hand can also let others know that something’s going on. It tells them not to talk to you, so you can save your breath and concentrate.",
];

const SETUP_ORDER_PROMPT = "If my breathlessness starts to get worse, I’m going to:";

const SETUP_STRATEGY_INTRO =
  "From the following section, pick and choose specific strategies to write in your Breathlessness Episode Recovery Plan.";

const SETUP_CUSTOM_NOTE_HELPER = "You may have other strategies that you can write in instead.";

const SETUP_BUCKET_COPY: Record<StrategyBucketType, { title: string; eyebrow: string; paragraphs: string[] }> = {
  STOP: {
    title: "STOP",
    eyebrow: "Strategies to Manage Breathlessness Episodes | STOP",
    paragraphs: [
      "When you STOP, it can help people around you understand that something is going on. You may need some space and it can let people know you need to deal with things yourself for a moment.",
      "It can also be used to tell people not to talk to you, so you can save your breath. This can help you concentrate and figure out your next steps.",
      "STOP can mean something different to everyone and a few examples are provided below:",
    ],
  },
  THINK: {
    title: "THINK",
    eyebrow: "Strategies to Manage Breathlessness Episodes | THINK",
    paragraphs: [
      "During a breathlessness episode, it’s common to feel frightened or to have unhelpful thoughts that can add to the panic.",
      "Strategies to manage your thinking can include self-checking, positive self-talk, remembering key facts about breathlessness rather than myths, using relaxation, using distraction, creating a calm environment and using other ways to make you feel safe and in control.",
      "Self-checking means becoming aware of things that need your immediate attention.",
    ],
  },
  POSITION: {
    title: "POSITION",
    eyebrow: "Strategies to Manage Breathlessness Episodes | POSITION",
    paragraphs: [
      "Breathlessness episodes can happen standing up or sitting down. For both, you can adjust your position to help you breathe better.",
      "There is no one position that’s better for everyone. Try different ones to find out what works best for you.",
      "Below are some key things to do:",
    ],
  },
  BREATHE_OUT_SLOWLY: {
    title: "BREATHE OUT SLOWLY",
    eyebrow: "Strategies to Manage Breathlessness Episodes | BREATHE OUT SLOWLY",
    paragraphs: [
      "When people get breathless, they tend to focus on getting 'air in' and forget about breathing out.",
      "But in COPD you need to get the old air out, so there is room for fresh air to come in.",
      "This means it is important to take long out-breaths and slow your breathing down.",
      "These breathing techniques help you to breathe out slowly during a breathlessness episode. They are both similar and can be used together.",
    ],
  },
  AIRFLOW_COOL: {
    title: "AIRFLOW | COOL",
    eyebrow: "Strategies to Manage Breathlessness Episodes | AIRFLOW | COOL",
    paragraphs: [
      "There is good medical evidence that cool air directed at your face can help reduce breathlessness.",
      "It can also be helpful to cool your face or neck.",
      "You can do the following to help with this.",
      "Remember - use these cooling techniques with your breathing techniques and also when adjusting your position.",
    ],
  },
};

const REORDER_STEP_CONTENT: Record<StrategyBucketType, { label: string; iconSrc: string }> = {
  STOP: {
    label: "Stop",
    iconSrc: "/do-your-five-icons/stop-icon.svg",
  },
  THINK: {
    label: "Think",
    iconSrc: "/do-your-five-icons/calm-icon.svg",
  },
  POSITION: {
    label: "Position",
    iconSrc: "/do-your-five-icons/position-icon.svg",
  },
  BREATHE_OUT_SLOWLY: {
    label: "Breath control",
    iconSrc: "/do-your-five-icons/blow-air-icon.svg",
  },
  AIRFLOW_COOL: {
    label: "Airflow",
    iconSrc: "/do-your-five-icons/fan-icon.svg",
  },
};

const REORDER_POSITION_STYLES = [
  {
    bgClass: "bg-[#155E33]",
    textClass: "text-white",
    actionClass: "text-white/92",
    controlClass: "text-[#155E33]",
  },
  {
    bgClass: "bg-[#198D42]",
    textClass: "text-white",
    actionClass: "text-white/92",
    controlClass: "text-[#155E33]",
  },
  {
    bgClass: "bg-[#7AC943]",
    textClass: "text-[#155E33]",
    actionClass: "text-[#155E33]",
    controlClass: "text-[#155E33]",
  },
  {
    bgClass: "bg-[#A4D57C]",
    textClass: "text-[#155E33]",
    actionClass: "text-[#155E33]",
    controlClass: "text-[#155E33]",
  },
  {
    bgClass: "bg-[#C3DEAB]",
    textClass: "text-[#155E33]",
    actionClass: "text-[#155E33]",
    controlClass: "text-[#155E33]",
  },
];

function getCopyParagraphs(description: string) {
  return description.split(/\n\s*\n/).filter(Boolean);
}

const THINK_STRATEGY_BY_ID = new Map(STRATEGY_LIBRARY.THINK.map((strategy) => [strategy.id, strategy]));
const THINK_SECTION_SELECTION_LIMIT = 2;
const BREATHE_OUT_STRATEGY_BY_ID = new Map(
  STRATEGY_LIBRARY.BREATHE_OUT_SLOWLY.map((strategy) => [strategy.id, strategy])
);
const SELECTABLE_BREATHE_OUT_STRATEGY_IDS = [
  "breathe-rectangle",
  "breathe-pursed-lip",
  "breathe-bubbles",
] as const;
const EVERYDAY_BREATHE_OUT_STRATEGY_ID_SET = new Set<string>(EVERYDAY_BREATHE_OUT_STRATEGY_IDS);

function getInitialPlanStepIndex(state: unknown, stepCount: number) {
  if (!state || typeof state !== "object") return null;
  const value = (state as { planActiveStepIndex?: unknown }).planActiveStepIndex;
  return typeof value === "number" && value >= 0 && value < stepCount ? value : null;
}

function SelectionMark({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
        isSelected ? "border-[#319A50] bg-[#319A50] text-white" : "border-slate-300 bg-white"
      }`}
    >
      {isSelected && <Check className="h-3.5 w-3.5" />}
    </span>
  );
}

function StrategySelectionButton({
  strategy,
  isSelected,
  onToggle,
  disabled = false,
}: {
  strategy: StrategyOption;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const detail = strategy.detail.trim();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-[1.2rem] border px-4 py-4 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 ${
        isSelected
          ? "border-[#319A50] bg-[#F5FBF6] text-slate-900"
          : "border-slate-200 bg-white/88 text-slate-700"
      }`}
    >
      <span className="mt-0.5">
        <SelectionMark isSelected={isSelected} />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.98rem] font-semibold">{strategy.label}</span>
        {detail && <span className="mt-1 block text-[0.9rem] leading-relaxed text-slate-500">{detail}</span>}
      </span>
    </button>
  );
}

function StrategySelectionCard({
  strategy,
  isSelected,
  onToggle,
  onActionRoute,
  disabled = false,
}: {
  strategy: StrategyOption;
  isSelected: boolean;
  onToggle: () => void;
  onActionRoute?: (route: string) => void;
  disabled?: boolean;
}) {
  const hasSupplementalContent = Boolean(strategy.action || strategy.recommendation);

  if (!hasSupplementalContent) {
    return (
      <StrategySelectionButton
        strategy={strategy}
        isSelected={isSelected}
        onToggle={onToggle}
        disabled={disabled}
      />
    );
  }

  const detail = strategy.detail.trim();

  return (
    <div
      className={`rounded-[1.2rem] border px-4 py-4 transition ${
        isSelected ? "border-[#319A50] bg-[#F5FBF6] text-slate-900" : "border-slate-200 bg-white/88 text-slate-700"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isSelected}
        disabled={disabled}
        className="flex w-full items-start gap-3 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100"
      >
        <span className="mt-0.5">
          <SelectionMark isSelected={isSelected} />
        </span>
        <span className="min-w-0">
          <span className="block text-[0.98rem] font-semibold">{strategy.label}</span>
          {detail && <span className="mt-1 block text-[0.9rem] leading-relaxed text-slate-500">{detail}</span>}
        </span>
      </button>

      {strategy.recommendation && (
        <p className="mt-3 pl-9 text-[0.88rem] leading-relaxed text-slate-600">
          {strategy.recommendation.textBeforeLink}
          <a
            href={strategy.recommendation.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#155E33] underline underline-offset-4"
          >
            {strategy.recommendation.linkLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {strategy.recommendation.textAfterLink}
        </p>
      )}

      {strategy.action && onActionRoute && (
        <button
          type="button"
          onClick={() => onActionRoute(strategy.action!.route)}
          className="mt-3 ml-9 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[0.84rem] font-semibold text-[#155E33] shadow-sm ring-1 ring-[#319A50]/25 transition active:scale-[0.98]"
        >
          <HeartHandshake className="h-4 w-4" />
          {strategy.action.label}
        </button>
      )}
    </div>
  );
}

function LockedStrategyCard({ strategy }: { strategy: StrategyOption }) {
  const detail = strategy.detail.trim();

  return (
    <div className="rounded-[1.2rem] border border-[#319A50] bg-[#F5FBF6] px-4 py-4 text-slate-900">
      <div className="flex items-start gap-3">
        <span className="mt-0.5">
          <SelectionMark isSelected />
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 text-[0.98rem] font-semibold">
            {strategy.label}
            <span className="rounded-full bg-white px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#155E33] ring-1 ring-[#319A50]/16">
              Always included
            </span>
          </span>
          {detail && <span className="mt-1 block text-[0.9rem] leading-relaxed text-slate-500">{detail}</span>}
        </span>
      </div>
    </div>
  );
}

function BreatheOutSelectableCard({
  strategy,
  isSelected,
  onToggle,
  onShowRectangleDemo,
}: {
  strategy: StrategyOption;
  isSelected: boolean;
  onToggle: () => void;
  onShowRectangleDemo?: () => void;
}) {
  const detail = strategy.detail.trim();

  return (
    <div
      className={`rounded-[1.2rem] border px-4 py-4 transition ${
        isSelected ? "border-[#319A50] bg-[#F5FBF6] text-slate-900" : "border-slate-200 bg-white/88 text-slate-700"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isSelected}
        className="flex w-full items-start gap-3 text-left transition active:scale-[0.99]"
      >
        <span className="mt-0.5">
          <SelectionMark isSelected={isSelected} />
        </span>
        <span className="min-w-0">
          <span className="block text-[0.98rem] font-semibold">{strategy.label}</span>
          {detail && <span className="mt-1 block text-[0.9rem] leading-relaxed text-slate-500">{detail}</span>}
        </span>
      </button>

      {onShowRectangleDemo && (
        <button
          type="button"
          onClick={onShowRectangleDemo}
          className="mt-3 ml-9 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-[0.86rem] font-semibold text-[#155E33] shadow-sm ring-1 ring-[#319A50]/25 transition active:scale-[0.98]"
        >
          <Play className="h-4 w-4 fill-current" />
          Show me how
        </button>
      )}
    </div>
  );
}

function BreatheOutTechniqueOptions({
  selectedIds,
  onToggleStrategy,
  onShowRectangleDemo,
}: {
  selectedIds: ReadonlySet<string>;
  onToggleStrategy: (strategyId: string) => void;
  onShowRectangleDemo: () => void;
}) {
  const focusStrategy = BREATHE_OUT_STRATEGY_BY_ID.get(REQUIRED_BREATHE_OUT_STRATEGY_ID);
  const selectableStrategies = SELECTABLE_BREATHE_OUT_STRATEGY_IDS.map((strategyId) =>
    BREATHE_OUT_STRATEGY_BY_ID.get(strategyId)
  ).filter((strategy): strategy is StrategyOption => Boolean(strategy));

  return (
    <div className="mt-5 space-y-3">
      {focusStrategy && <LockedStrategyCard strategy={focusStrategy} />}
      {selectableStrategies.map((strategy) => (
        <BreatheOutSelectableCard
          key={strategy.id}
          strategy={strategy}
          isSelected={selectedIds.has(strategy.id)}
          onToggle={() => onToggleStrategy(strategy.id)}
          onShowRectangleDemo={strategy.id === "breathe-rectangle" ? onShowRectangleDemo : undefined}
        />
      ))}
    </div>
  );
}

function EverydayBreathingTechniques() {
  const everydayStrategies = EVERYDAY_BREATHE_OUT_STRATEGY_IDS.map((strategyId) =>
    BREATHE_OUT_STRATEGY_BY_ID.get(strategyId)
  ).filter((strategy): strategy is StrategyOption => Boolean(strategy));

  return (
    <section className="mt-5 rounded-[1.2rem] bg-white/78 p-4 ring-1 ring-slate-200/80">
      <h2 className="text-[1.02rem] font-bold leading-tight text-slate-900">
        Some techniques you can learn for everyday breathlessness
      </h2>
      <div className="mt-3 space-y-3">
        {everydayStrategies.map((strategy) => (
          <div key={strategy.id} className="rounded-[1rem] border border-slate-200 bg-white/88 px-4 py-4">
            <p className="text-[0.98rem] font-semibold text-slate-900">{strategy.label}</p>
            {strategy.detail.trim() && (
              <p className="mt-1 text-[0.9rem] leading-relaxed text-slate-500">{strategy.detail}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SelfCheckSetupCard({
  strategy,
  isSelected,
  onToggle,
  onSetupChecklist,
}: {
  strategy: StrategyOption;
  isSelected: boolean;
  onToggle: () => void;
  onSetupChecklist: () => void;
}) {
  return (
    <div
      className={`rounded-[1.2rem] border px-4 py-4 transition ${
        isSelected ? "border-[#319A50] bg-[#F5FBF6] text-slate-900" : "border-slate-200 bg-white/88 text-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isSelected}
          aria-label={`${isSelected ? "Remove" : "Select"} ${strategy.label}`}
          className="mt-0.5 shrink-0 rounded-full active:scale-[0.96]"
        >
          <SelectionMark isSelected={isSelected} />
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onToggle} aria-pressed={isSelected} className="block w-full text-left">
            <span className="block text-[0.98rem] font-semibold">{strategy.label}</span>
            <span className="mt-1 block text-[0.9rem] leading-relaxed text-slate-500">{strategy.detail}</span>
          </button>
          <button
            type="button"
            onClick={onSetupChecklist}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[0.84rem] font-semibold text-[#155E33] shadow-sm ring-1 ring-[#319A50]/25 transition active:scale-[0.98]"
          >
            <ListChecks className="h-4 w-4" />
            Set up checklist
          </button>
        </div>
      </div>
    </div>
  );
}

function ThinkStrategyOptions({
  selectedIds,
  onToggleStrategy,
  onSetupChecklist,
}: {
  selectedIds: ReadonlySet<string>;
  onToggleStrategy: (strategyId: string) => void;
  onSetupChecklist: () => void;
}) {
  const selfCheckStrategy = THINK_STRATEGY_BY_ID.get("think-self-check");
  const sectionsWithSelections = THINK_STRATEGY_SECTIONS.filter((section) =>
    section.strategyIds.some((strategyId) => selectedIds.has(strategyId))
  ).map((section) => section.title);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sectionsWithSelections.length > 0 ? sectionsWithSelections : [THINK_STRATEGY_SECTIONS[0]?.title].filter(Boolean))
  );

  const toggleSectionOpen = (sectionTitle: string) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      return next;
    });
  };

  return (
    <div className="mt-5 space-y-5">
      {selfCheckStrategy && (
        <SelfCheckSetupCard
          strategy={selfCheckStrategy}
          isSelected={selectedIds.has(selfCheckStrategy.id)}
          onToggle={() => onToggleStrategy(selfCheckStrategy.id)}
          onSetupChecklist={onSetupChecklist}
        />
      )}

      {THINK_STRATEGY_SECTIONS.map((section) => {
        const strategies = section.strategyIds
          .map((strategyId) => THINK_STRATEGY_BY_ID.get(strategyId))
          .filter((strategy): strategy is StrategyOption => Boolean(strategy));
        const selectedCount = strategies.filter((strategy) => selectedIds.has(strategy.id)).length;
        const isOpen = openSections.has(section.title);

        return (
          <section key={section.title} className="overflow-hidden rounded-[1.2rem] bg-white/78 ring-1 ring-slate-200/80">
            <button
              type="button"
              onClick={() => toggleSectionOpen(section.title)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition active:bg-slate-50/70"
            >
              <span className="min-w-0">
                <span className="block text-[1.02rem] font-bold leading-tight text-[#057EAD]">{section.title}</span>
                <span className="mt-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.11em] text-[#319A50]">
                  Select up to {THINK_SECTION_SELECTION_LIMIT}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[#F5FBF6] px-2.5 py-1 text-[0.78rem] font-semibold text-[#155E33] ring-1 ring-[#319A50]/16">
                  {selectedCount}/{THINK_SECTION_SELECTION_LIMIT} selected
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-slate-200/70 px-3 py-3">
                <div className="space-y-2 px-1">
                  {section.intro.map((paragraph, index) => (
                    <p
                      key={paragraph}
                      className={`text-[0.9rem] leading-relaxed ${
                        index === 1 ? "font-semibold text-slate-800" : "text-slate-600"
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {strategies.map((strategy) => {
                    const isSelected = selectedIds.has(strategy.id);
                    const isDisabled = !isSelected && selectedCount >= THINK_SECTION_SELECTION_LIMIT;

                    return (
                      <StrategySelectionCard
                        key={strategy.id}
                        strategy={strategy}
                        isSelected={isSelected}
                        disabled={isDisabled}
                        onToggle={() => onToggleStrategy(strategy.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function RectangleBreathingDemo({ onBack }: { onBack: () => void }) {
  return (
    <AppFrame tone="focus" scrollable={false} contentClassName="pb-[calc(0.9rem+env(safe-area-inset-bottom))]">
      <div className="relative z-20 flex min-h-0 flex-1 flex-col">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/88 text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-[0.97]"
          aria-label="Back to breathing techniques"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
            Breathing Around the Rectangle
          </p>
          <div className="mt-6">
            <BoxBreathingGuide />
          </div>
          <p className="mt-6 max-w-[20rem] text-[1rem] font-semibold leading-relaxed text-slate-600">
            Follow the green line around the screen. Breathe in on the short sides and breathe out on the long sides.
          </p>
        </div>
      </div>
    </AppFrame>
  );
}

export default function PlanBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data, actions } = useAppState();
  const isSetupMode = searchParams.get("mode") === "setup";
  const currentRoute = getPathWithSearchAndHash(location);
  const [draft, setDraft] = useState<RecoveryPlan>(() => normaliseRecoveryPlan(structuredClone(data.recoveryPlan)));
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(() =>
    getInitialPlanStepIndex(location.state, data.recoveryPlan.order.length)
  );
  const [positionTab, setPositionTab] = useState<PositionTabId>("standing");
  const [positionImageIndex, setPositionImageIndex] = useState(0);
  const [showRectangleDemo, setShowRectangleDemo] = useState(false);
  const currentBucket = activeStepIndex === null ? null : draft.order[activeStepIndex] ?? null;

  const saveDraft = (nextDraft: RecoveryPlan) => {
    const normalisedDraft = normaliseRecoveryPlan(nextDraft);
    setDraft(normalisedDraft);
    actions.updateRecoveryPlan(normalisedDraft);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const nextOrder = moveItem(draft.order, index, direction);

    if (nextOrder === draft.order) return;

    saveDraft(withReviewedAt({ ...draft, order: nextOrder }));
  };

  const toggleStrategy = (bucket: StrategyBucketType, strategyId: string) => {
    if (
      bucket === "BREATHE_OUT_SLOWLY" &&
      (strategyId === REQUIRED_BREATHE_OUT_STRATEGY_ID || EVERYDAY_BREATHE_OUT_STRATEGY_ID_SET.has(strategyId))
    ) {
      return;
    }

    const currentBucketDraft = draft.buckets[bucket];
    const selectedStrategyIds = currentBucketDraft.selectedStrategyIds.includes(strategyId)
      ? currentBucketDraft.selectedStrategyIds.filter((id) => id !== strategyId)
      : [...currentBucketDraft.selectedStrategyIds, strategyId];
    const nextSelectedStrategyIds =
      bucket === "BREATHE_OUT_SLOWLY" ? normaliseBreatheOutStrategyIds(selectedStrategyIds) : selectedStrategyIds;

    saveDraft(
      withReviewedAt({
        ...draft,
        buckets: {
          ...draft.buckets,
          [bucket]: {
            ...currentBucketDraft,
            selectedStrategyIds: nextSelectedStrategyIds,
          },
        },
      })
    );
  };

  const updateCustomNote = (bucket: StrategyBucketType, customNote: string) => {
    const currentBucketDraft = draft.buckets[bucket];

    saveDraft(
      withReviewedAt({
        ...draft,
        buckets: {
          ...draft.buckets,
          [bucket]: {
            ...currentBucketDraft,
            customNote,
          },
        },
      })
    );
  };

  const goToPreviousStep = () => {
    if (activeStepIndex === null || activeStepIndex === 0) {
      setActiveStepIndex(null);
      return;
    }

    setActiveStepIndex(activeStepIndex - 1);
  };

  const goToNextStep = () => {
    if (activeStepIndex === null) return;

    if (activeStepIndex < draft.order.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
      return;
    }

    if (isSetupMode) {
      setActiveStepIndex(null);
      navigate("/plan", { replace: true });
      return;
    }

    setActiveStepIndex(null);
  };

  const navigateWithPlanBack = (route: string) => {
    navigate(route, {
      state: {
        backTo: currentRoute,
        backState: {
          planActiveStepIndex: activeStepIndex,
        },
      },
    });
  };

  useEffect(() => {
    setPositionImageIndex(0);
  }, [positionTab]);

  useEffect(() => {
    if (currentBucket !== "POSITION") return;

    const activePositionTab = getPositionTabDefinition(positionTab);
    const timer = window.setInterval(() => {
      setPositionImageIndex((value) => (value + 1) % activePositionTab.images.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [currentBucket, positionTab]);

  if (showRectangleDemo) {
    return <RectangleBreathingDemo onBack={() => setShowRectangleDemo(false)} />;
  }

  if (currentBucket) {
    const currentBucketDraft = draft.buckets[currentBucket];
    const selectedIds = new Set(currentBucketDraft.selectedStrategyIds);
    const isLastStep = activeStepIndex === draft.order.length - 1;
    const setupCopy = SETUP_BUCKET_COPY[currentBucket];
    const headerTitle = isSetupMode ? setupCopy.title : BUCKET_COPY[currentBucket].title;
    const headerSubtitle = `Step ${activeStepIndex + 1} of ${draft.order.length}`;
    const eyebrow = isSetupMode ? setupCopy.eyebrow : null;
    const descriptionParagraphs = isSetupMode
      ? setupCopy.paragraphs
      : getCopyParagraphs(BUCKET_COPY[currentBucket].description);
    const customNoteLabel =
      currentBucket === "BREATHE_OUT_SLOWLY" || currentBucket === "POSITION"
        ? "My note for this step"
        : isSetupMode
        ? "Other strategies"
        : "My note for this step";
    const customNotePlaceholder =
      currentBucket === "BREATHE_OUT_SLOWLY" || currentBucket === "POSITION" || !isSetupMode
        ? "Add anything that helps you use this step."
        : "Write your own strategy for this step.";
    const customNoteField = (
      <label className="mt-5 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">
          {customNoteLabel}
        </span>
        {isSetupMode && currentBucket !== "BREATHE_OUT_SLOWLY" && currentBucket !== "POSITION" && (
          <span className="mb-2 block text-[0.9rem] leading-relaxed text-slate-500">
            {SETUP_CUSTOM_NOTE_HELPER}
          </span>
        )}
        <textarea
          value={currentBucketDraft.customNote}
          onChange={(event) => updateCustomNote(currentBucket, event.target.value)}
          placeholder={customNotePlaceholder}
          className="min-h-28 w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-[1rem] leading-relaxed outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10"
        />
      </label>
    );

    return (
      <AppFrame tone="focus" withNav={!isSetupMode}>
        <PageHeader title={headerTitle} subtitle={headerSubtitle} />

        <Surface>
          {eyebrow && (
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#319A50]">
              {eyebrow}
            </p>
          )}
          <div className={`${eyebrow ? "mt-2" : ""} space-y-3 text-[0.98rem] leading-relaxed text-slate-500`}>
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {isSetupMode && currentBucket !== "POSITION" && (
            <p className="mt-4 text-[0.94rem] font-semibold leading-relaxed text-slate-700">
              {SETUP_STRATEGY_INTRO}
            </p>
          )}
        </Surface>

        {currentBucket === "THINK" ? (
          <ThinkStrategyOptions
            selectedIds={selectedIds}
            onToggleStrategy={(strategyId) => toggleStrategy(currentBucket, strategyId)}
            onSetupChecklist={() => navigateWithPlanBack("/self-checklist")}
          />
        ) : currentBucket === "POSITION" ? (
          <PositionVisualGuide
            activeTabId={positionTab}
            imageIndex={positionImageIndex}
            onTabChange={setPositionTab}
            showTitle={false}
            className="mt-5"
          />
        ) : currentBucket === "BREATHE_OUT_SLOWLY" ? (
          <>
            <BreatheOutTechniqueOptions
              selectedIds={selectedIds}
              onToggleStrategy={(strategyId) => toggleStrategy(currentBucket, strategyId)}
              onShowRectangleDemo={() => setShowRectangleDemo(true)}
            />
            {customNoteField}
            <EverydayBreathingTechniques />
          </>
        ) : (
          <div className="mt-5 space-y-3">
            {STRATEGY_LIBRARY[currentBucket].map((strategy) => (
              <StrategySelectionCard
                key={strategy.id}
                strategy={strategy}
                isSelected={selectedIds.has(strategy.id)}
                onToggle={() => toggleStrategy(currentBucket, strategy.id)}
                onActionRoute={navigateWithPlanBack}
              />
            ))}
          </div>
        )}

        {currentBucket !== "BREATHE_OUT_SLOWLY" && customNoteField}

        <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
          <SecondaryButton onClick={goToPreviousStep}>
            {activeStepIndex === 0 ? "Back to Order" : "Back"}
          </SecondaryButton>
          <PrimaryButton onClick={goToNextStep}>{isLastStep ? "Finish Plan" : "Next Step"}</PrimaryButton>
        </div>

        {!isSetupMode && <FooterNav />}
      </AppFrame>
    );
  }

  return (
    <AppFrame tone="focus" withNav={!isSetupMode}>
      <PageHeader
        title={isSetupMode ? "Do your five" : "Personalise My Plan"}
        subtitle={
          isSetupMode
            ? "An easy way to remember your plan is ‘Do Your Five’."
            : undefined
        }
      />

      <LoopingDoYourFiveHand className="mt-2" />

      {!isSetupMode && (
        <p className="mt-5 text-[1.08rem] font-bold leading-snug text-slate-900">{SETUP_ORDER_PROMPT}</p>
      )}

      {isSetupMode && (
        <Surface className="mt-5">
          <div className="space-y-3 text-[0.98rem] leading-relaxed text-slate-500">
            {SETUP_ORDER_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Surface>
      )}

      <Surface className="mt-5">
        {isSetupMode && (
          <>
            <p className="mb-1 text-[0.95rem] font-semibold leading-relaxed text-[#319A50]">
              Order your steps below
            </p>
            <p className="mb-3 text-[1rem] font-semibold leading-relaxed text-slate-900">{SETUP_ORDER_PROMPT}</p>
          </>
        )}
        <div className="overflow-hidden rounded-[1.2rem] ring-1 ring-black/5">
          {draft.order.map((bucket, index) => {
            const step = REORDER_STEP_CONTENT[bucket];
            const positionStyle = REORDER_POSITION_STYLES[index] ?? REORDER_POSITION_STYLES[0];

            return (
              <div key={bucket} className={`${positionStyle.bgClass} px-3 py-4`}>
                <div className="grid grid-cols-[2rem_2.5rem_minmax(0,1fr)_2.25rem] items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/95 text-[0.9rem] font-bold text-[#155E33] shadow-sm ring-1 ring-black/5">
                    {index + 1}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/5">
                    <img src={step.iconSrc} alt="" className="h-9 w-9 object-contain" draggable={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[1.2rem] font-bold leading-tight ${positionStyle.textClass}`}>{step.label}</p>
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(index)}
                      className={`mt-2 text-[0.92rem] font-semibold underline-offset-4 active:scale-[0.98] ${positionStyle.actionClass}`}
                    >
                      Personalise each step
                    </button>
                  </div>
                  <div className="flex w-9 flex-col items-center justify-center gap-1.5">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveStep(index, -1)}
                        className={`rounded-full bg-white/94 p-2 shadow-sm ring-1 ring-black/5 transition active:scale-[0.96] ${positionStyle.controlClass}`}
                        aria-label={`Move ${step.label} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    )}
                    {index < draft.order.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveStep(index, 1)}
                        className={`rounded-full bg-white/94 p-2 shadow-sm ring-1 ring-black/5 transition active:scale-[0.96] ${positionStyle.controlClass}`}
                        aria-label={`Move ${step.label} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Surface>

      <div className="mt-4 grid gap-3">
        <PrimaryButton className="w-full" onClick={() => setActiveStepIndex(0)}>
          Set Steps
        </PrimaryButton>
        {!isSetupMode && (
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton className="w-full" onClick={() => navigate("/contacts")}>
              Contacts
            </SecondaryButton>
            <SecondaryButton
              className="w-full"
              onClick={() => navigate("/self-checklist", { state: { backTo: currentRoute } })}
            >
              Self-Checklist
            </SecondaryButton>
          </div>
        )}
      </div>

      {!isSetupMode && <FooterNav />}
    </AppFrame>
  );
}
