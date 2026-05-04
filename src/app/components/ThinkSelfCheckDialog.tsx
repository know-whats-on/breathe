import { Check, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./AppChrome";
import type {
  SelfChecklistItem,
  ThinkSelfCheckAnswerValue,
  ThinkSelfCheckEntry,
} from "../model/types";

export const DEFAULT_WARNING_SELF_CHECK_IDS = new Set([
  "different-breathlessness",
  "phlegm-change",
  "ankle-swelling",
  "chest-pain",
]);

export type ThinkSelfCheckDraft = Record<string, ThinkSelfCheckAnswerValue | null>;

export function createEmptyThinkSelfCheckDraft(items: SelfChecklistItem[]): ThinkSelfCheckDraft {
  return Object.fromEntries(items.map((item) => [item.id, null]));
}

export function createThinkSelfCheckDraft(
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

export function isThinkSelfCheckComplete(items: SelfChecklistItem[], draft: ThinkSelfCheckDraft) {
  return items.every((item) => draft[item.id] !== null);
}

export function buildThinkSelfCheckEntry(items: SelfChecklistItem[], draft: ThinkSelfCheckDraft): ThinkSelfCheckEntry {
  return {
    completedAt: new Date().toISOString(),
    responses: items.map((item) => ({
      id: item.id,
      prompt: item.prompt,
      answer: draft[item.id] as ThinkSelfCheckAnswerValue,
    })),
  };
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

export function ThinkSelfCheckDialog({
  open,
  onOpenChange,
  items,
  draft,
  onAnswerChange,
  onSave,
  canSave,
  description,
  overlay = "absolute",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SelfChecklistItem[];
  draft: ThinkSelfCheckDraft;
  onAnswerChange: (id: string, answer: ThinkSelfCheckAnswerValue) => void;
  onSave: () => void;
  canSave: boolean;
  description: string;
  overlay?: "absolute" | "fixed";
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`${overlay} inset-0 z-[70] flex items-center justify-center bg-slate-900/32 px-3 py-3 backdrop-blur-[2px] sm:px-4 sm:py-4`}
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
            <p className="mt-3 text-[0.96rem] leading-relaxed text-slate-500">{description}</p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-black/5 transition hover:text-slate-700 active:scale-[0.97]"
              aria-label="Close self-check"
            >
              <X className="h-5 w-5" />
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
              <Check className="h-4 w-4" />
              Save self-check
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
