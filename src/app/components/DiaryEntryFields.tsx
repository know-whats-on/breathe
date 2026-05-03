import type { ReactNode } from "react";
import { TRIGGER_SUGGESTIONS } from "../content/planContent";
import type { EpisodeOutcome } from "../model/types";
import { Surface, ToggleChip } from "./AppChrome";

const TEXT_INPUT_CLASSNAME =
  "min-h-[58px] w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10";
const TEXTAREA_CLASSNAME =
  "w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10";

export const EPISODE_OUTCOME_OPTIONS: Array<{ value: EpisodeOutcome; label: string }> = [
  { value: "better", label: "Return slowly to normal activity" },
  { value: "action_plan", label: "Refer to COPD Action Plan" },
  { value: "medical_advice", label: "Seek medical advice" },
  { value: "emergency_care", label: "Seek emergency care" },
  { value: "uncertain", label: "Still unsure" },
];

const CONFIDENCE_OPTIONS = [
  { value: 1, emoji: "😰", label: "Panicked" },
  { value: 2, emoji: "😟", label: "Worried" },
  { value: 3, emoji: "😐", label: "Unsure" },
  { value: 4, emoji: "🙂", label: "Okay" },
  { value: 5, emoji: "😀", label: "Confident" },
] as const;

function SectionWrapper({
  asSurface,
  className,
  children,
}: {
  asSurface?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (asSurface) {
    return <Surface className={className}>{children}</Surface>;
  }

  return <div className={className}>{children}</div>;
}

export function getEpisodeTriggerOptions(savedTriggers: readonly string[]) {
  const seen = new Set<string>();
  const options: string[] = [];

  for (const rawTrigger of [...TRIGGER_SUGGESTIONS, ...savedTriggers]) {
    const trigger = rawTrigger.trim();
    const key = trigger.toLowerCase();
    if (!trigger || seen.has(key)) continue;
    seen.add(key);
    options.push(trigger);
  }

  return options;
}

export function ManualDiaryEntryFields({
  title,
  trigger,
  notes,
  onTitleChange,
  onTriggerChange,
  onNotesChange,
}: {
  title: string;
  trigger: string;
  notes: string;
  onTitleChange: (value: string) => void;
  onTriggerChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <>
      <label className="mt-4 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">Title</span>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="e.g. Rough morning walk"
          className={TEXT_INPUT_CLASSNAME}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">Trigger or context</span>
        <input
          value={trigger}
          onChange={(event) => onTriggerChange(event.target.value)}
          placeholder="Optional"
          className={TEXT_INPUT_CLASSNAME}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={4}
          placeholder="What happened, what you noticed, or what you want to remember"
          className={TEXTAREA_CLASSNAME}
        />
      </label>
    </>
  );
}

export function EpisodeTriggerField({
  trigger,
  onTriggerChange,
  triggerOptions = TRIGGER_SUGGESTIONS,
  asSurface = false,
  className,
}: {
  trigger: string;
  onTriggerChange: (value: string) => void;
  triggerOptions?: readonly string[];
  asSurface?: boolean;
  className?: string;
}) {
  return (
    <SectionWrapper asSurface={asSurface} className={className}>
      <p className="text-[1.02rem] font-semibold text-slate-900">What made your breathlessness worse?</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {triggerOptions.map((item) => (
          <ToggleChip key={item} active={trigger === item} onClick={() => onTriggerChange(item)}>
            {item}
          </ToggleChip>
        ))}
      </div>
      <input
        value={trigger}
        onChange={(event) => onTriggerChange(event.target.value)}
        placeholder="What made your breathlessness worse?"
        className="mt-4 min-h-[58px] w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10"
      />
    </SectionWrapper>
  );
}

export function EpisodeConfidenceField({
  confidence,
  onConfidenceChange,
  asSurface = false,
  className,
}: {
  confidence: number;
  onConfidenceChange: (value: number) => void;
  asSurface?: boolean;
  className?: string;
}) {
  return (
    <SectionWrapper asSurface={asSurface} className={className}>
      <p className="text-[1.02rem] font-semibold text-slate-900">How confident did you feel managing it?</p>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {CONFIDENCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={`${option.value} of 5, ${option.label}`}
            aria-pressed={confidence === option.value}
            title={`${option.value} of 5, ${option.label}`}
            onClick={() => onConfidenceChange(option.value)}
            className={`flex aspect-square min-h-[3.25rem] items-center justify-center rounded-[1rem] border text-[1.55rem] transition active:scale-[0.97] ${
              confidence === option.value
                ? "border-[#319A50] bg-[#EAF6EE] shadow-[0_16px_34px_-28px_rgba(49,154,80,0.68)] ring-2 ring-[#319A50]/20"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span aria-hidden="true">{option.emoji}</span>
          </button>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function EpisodeOutcomeField({
  outcome,
  onOutcomeChange,
}: {
  outcome: EpisodeOutcome;
  onOutcomeChange: (value: EpisodeOutcome) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">Outcome</span>
      <div className="flex flex-wrap gap-2">
        {EPISODE_OUTCOME_OPTIONS.map((option) => (
          <ToggleChip
            key={option.value}
            active={outcome === option.value}
            onClick={() => onOutcomeChange(option.value)}
          >
            {option.label}
          </ToggleChip>
        ))}
      </div>
    </div>
  );
}

export function EpisodeReflectionFields({
  helped,
  didntHelp,
  supportNotes,
  revisionSummary,
  onHelpedChange,
  onDidntHelpChange,
  onSupportNotesChange,
  onRevisionSummaryChange,
  asSurface = false,
  className,
}: {
  helped: string;
  didntHelp: string;
  supportNotes: string;
  revisionSummary: string;
  onHelpedChange: (value: string) => void;
  onDidntHelpChange: (value: string) => void;
  onSupportNotesChange: (value: string) => void;
  onRevisionSummaryChange: (value: string) => void;
  asSurface?: boolean;
  className?: string;
}) {
  return (
    <SectionWrapper asSurface={asSurface} className={className}>
      <label className="block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">
          What strategies worked well?
        </span>
        <textarea
          value={helped}
          onChange={(event) => onHelpedChange(event.target.value)}
          rows={4}
          placeholder="What strategies worked well?"
          className={TEXTAREA_CLASSNAME}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">
          What strategies didn’t work well?
        </span>
        <textarea
          value={didntHelp}
          onChange={(event) => onDidntHelpChange(event.target.value)}
          rows={4}
          placeholder="What strategies didn’t work well?"
          className={TEXTAREA_CLASSNAME}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">
          What did others do that was helpful or not?
        </span>
        <textarea
          value={supportNotes}
          onChange={(event) => onSupportNotesChange(event.target.value)}
          rows={4}
          placeholder="What did others do that was helpful or not?"
          className={TEXTAREA_CLASSNAME}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">Revise and update</span>
        <textarea
          value={revisionSummary}
          onChange={(event) => onRevisionSummaryChange(event.target.value)}
          rows={4}
          placeholder="If needed, update the strategies in your plan."
          className={TEXTAREA_CLASSNAME}
        />
      </label>
    </SectionWrapper>
  );
}
