import { ChevronDown, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  AppFrame,
  FooterNav,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  Surface,
  ToggleChip,
} from "../components/AppChrome";
import {
  EpisodeConfidenceField,
  EpisodeOutcomeField,
  EpisodeReflectionFields,
  EpisodeTriggerField,
  getEpisodeTriggerOptions,
  ManualDiaryEntryFields,
} from "../components/DiaryEntryFields";
import { formatDateLabel, formatTimeLabel } from "../lib/format";
import type { DiaryEntryUpdateInput, EpisodeLog, ThinkSelfCheckEntry } from "../model/types";
import { useAppState } from "../state/AppState";

type DiaryFilter = "all" | "episode" | "manual";
type ManualEntryDraft = {
  title: string;
  trigger: string;
  notes: string;
};

const TEXT_INPUT_CLASSNAME =
  "min-h-[56px] w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10";

function createEmptyManualEntryDraft(): ManualEntryDraft {
  return {
    title: "",
    trigger: "",
    notes: "",
  };
}

function createEditDraft(log: EpisodeLog): DiaryEntryUpdateInput {
  if (log.entryType === "manual") {
    return {
      id: log.id,
      kind: "manual",
      entry: {
        title: log.title,
        trigger: log.trigger,
        notes: log.notes,
      },
    };
  }

  if (log.status === "started") {
    return {
      id: log.id,
      kind: "episode-started",
      entry: {
        title: log.title,
        trigger: log.trigger,
        notes: log.notes,
      },
    };
  }

  return {
    id: log.id,
    kind: "episode-completed",
    entry: {
      title: log.title,
      trigger: log.trigger,
      outcome: log.outcome,
      confidence: log.confidence,
      helped: log.helped,
      didntHelp: log.didntHelp,
      supportNotes: log.supportNotes,
      revisionSummary: log.revisionSummary,
    },
  };
}

function canSaveManualDraft(draft: ManualEntryDraft) {
  return (
    draft.title.trim().length > 0 ||
    draft.trigger.trim().length > 0 ||
    draft.notes.trim().length > 0
  );
}

function getBadgeLabel(log: EpisodeLog) {
  if (log.entryType === "manual") return "manual note";
  if (log.status === "started") return "in progress";
  return log.outcome.replace(/_/g, " ");
}

function getEpisodeSummarySnippet(log: EpisodeLog) {
  const source = log.trigger.trim() || log.notes.trim();

  if (source.length === 0) return "";
  if (source.length <= 88) return source;

  return `${source.slice(0, 85).trimEnd()}...`;
}

function DetailSection({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[1rem] bg-slate-50 px-4 py-3">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <p className="mt-2 text-[0.94rem] leading-relaxed text-slate-600">{value}</p>
    </div>
  );
}

function DiaryActionButton({
  label,
  onClick,
  destructive = false,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  icon: typeof PencilLine;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[38px] items-center gap-2 rounded-full px-3 py-2 text-[0.82rem] font-semibold transition active:scale-[0.98] ${
        destructive
          ? "bg-[#FFF1F1] text-[#C84A4A]"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function AccordionPanel({
  open,
  children,
  header,
  onToggle,
  className,
}: {
  open: boolean;
  children: ReactNode;
  header?: ReactNode;
  onToggle?: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {header && (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-4 text-left"
        >
          <div className="min-w-0 flex-1">{header}</div>
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
      <div
        className={`grid overflow-hidden transition-all duration-200 ease-out ${
          open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function ThinkSelfCheckPanel({ entry }: { entry: ThinkSelfCheckEntry }) {
  return (
    <div className="rounded-[1rem] bg-slate-50 px-4 py-3">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Think self-check
      </p>
      <div className="mt-3 space-y-2">
        {entry.responses.map((response, index) => (
          <div
            key={`${response.id}-${index}`}
            className="flex items-start justify-between gap-3 rounded-[0.9rem] bg-white/85 px-3 py-3 ring-1 ring-black/5"
          >
            <p className="text-[0.9rem] leading-relaxed text-slate-600">{response.prompt}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] ${
                response.answer === "yes"
                  ? "bg-[#319A50] text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {response.answer}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiaryEntryDetails({ log }: { log: EpisodeLog }) {
  if (log.entryType === "manual") {
    return (
      <div className="mt-4 grid gap-3">
        {log.trigger && <DetailSection title="Trigger or context" value={log.trigger} />}
        <DetailSection title="Notes" value={log.notes || "No extra note recorded"} />
      </div>
    );
  }

  if (log.status === "started") {
    return (
      <div className="mt-4 grid gap-3">
        <DetailSection
          title="Session status"
          value="This entry was created when Help Me Recover was pressed. Finish Decide Next Steps and save your review to complete it."
        />
        {log.trigger && <DetailSection title="Trigger or context" value={log.trigger} />}
        {log.notes && <DetailSection title="Session notes" value={log.notes} />}
        {log.thinkSelfCheck && <ThinkSelfCheckPanel entry={log.thinkSelfCheck} />}
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {log.trigger && <DetailSection title="Trigger or context" value={log.trigger} />}
      <DetailSection
        title="Confidence"
        value={log.confidence > 0 ? `${log.confidence}/5` : "Not recorded"}
      />
      <DetailSection title="What helped" value={log.helped || "Not recorded"} />
      <DetailSection title="What did not help" value={log.didntHelp || "Not recorded"} />
      <DetailSection title="What others did" value={log.supportNotes || "Not recorded"} />
      <DetailSection
        title="What should change next time"
        value={log.revisionSummary || "No plan change recorded"}
      />
      {log.notes && <DetailSection title="Session notes" value={log.notes} />}
      {log.thinkSelfCheck && <ThinkSelfCheckPanel entry={log.thinkSelfCheck} />}
    </div>
  );
}

function ManualEntryEditor({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: ManualEntryDraft;
  onChange: (next: ManualEntryDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[#319A50]">
        Edit manual note
      </p>
      <ManualDiaryEntryFields
        title={draft.title}
        trigger={draft.trigger}
        notes={draft.notes}
        onTitleChange={(title) => onChange({ ...draft, title })}
        onTriggerChange={(trigger) => onChange({ ...draft, trigger })}
        onNotesChange={(notes) => onChange({ ...draft, notes })}
      />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={onSave} disabled={!canSaveManualDraft(draft)}>
          Save changes
        </PrimaryButton>
      </div>
    </div>
  );
}

function StartedEpisodeEditor({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: Extract<DiaryEntryUpdateInput, { kind: "episode-started" }>["entry"];
  onChange: (next: Extract<DiaryEntryUpdateInput, { kind: "episode-started" }>["entry"]) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[#319A50]">
        Edit session entry
      </p>
      <ManualDiaryEntryFields
        title={draft.title}
        trigger={draft.trigger}
        notes={draft.notes}
        onTitleChange={(title) => onChange({ ...draft, title })}
        onTriggerChange={(trigger) => onChange({ ...draft, trigger })}
        onNotesChange={(notes) => onChange({ ...draft, notes })}
      />
      <p className="mt-4 text-[0.88rem] leading-relaxed text-slate-500">
        Think self-check answers stay read-only here and continue with the live session.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={onSave}>Save changes</PrimaryButton>
      </div>
    </div>
  );
}

function CompletedEpisodeEditor({
  draft,
  triggerOptions,
  onChange,
  onSave,
  onCancel,
}: {
  draft: Extract<DiaryEntryUpdateInput, { kind: "episode-completed" }>["entry"];
  triggerOptions: readonly string[];
  onChange: (next: Extract<DiaryEntryUpdateInput, { kind: "episode-completed" }>["entry"]) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[#319A50]">
        Edit session review
      </p>

      <label className="mt-4 block">
        <span className="mb-2 block text-[0.92rem] font-semibold text-slate-700">Title</span>
        <input
          value={draft.title}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
          placeholder="e.g. Rough morning walk"
          className={TEXT_INPUT_CLASSNAME}
        />
      </label>

      <div className="mt-4">
        <EpisodeOutcomeField
          outcome={draft.outcome}
          onOutcomeChange={(outcome) => onChange({ ...draft, outcome })}
        />
      </div>

      <div className="mt-4">
        <EpisodeTriggerField
          trigger={draft.trigger}
          onTriggerChange={(trigger) => onChange({ ...draft, trigger })}
          triggerOptions={triggerOptions}
        />
      </div>

      <div className="mt-4">
        <EpisodeConfidenceField
          confidence={draft.confidence}
          onConfidenceChange={(confidence) => onChange({ ...draft, confidence })}
        />
      </div>

      <div className="mt-4">
        <EpisodeReflectionFields
          helped={draft.helped}
          didntHelp={draft.didntHelp}
          supportNotes={draft.supportNotes}
          revisionSummary={draft.revisionSummary}
          onHelpedChange={(helped) => onChange({ ...draft, helped })}
          onDidntHelpChange={(didntHelp) => onChange({ ...draft, didntHelp })}
          onSupportNotesChange={(supportNotes) => onChange({ ...draft, supportNotes })}
          onRevisionSummaryChange={(revisionSummary) => onChange({ ...draft, revisionSummary })}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={onSave}>Save changes</PrimaryButton>
      </div>
    </div>
  );
}

export default function Diary() {
  const { data, actions } = useAppState();
  const triggerOptions = getEpisodeTriggerOptions(data.triggers);
  const [filter, setFilter] = useState<DiaryFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState<ManualEntryDraft>(createEmptyManualEntryDraft);
  const [editingDraft, setEditingDraft] = useState<DiaryEntryUpdateInput | null>(null);
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<string | null>(null);

  const logs = data.episodeLogs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "episode") return log.entryType === "episode";
    return log.entryType === "manual";
  });

  const closeCreateForm = () => {
    setCreateOpen(false);
    setManualDraft(createEmptyManualEntryDraft());
  };

  const openCreateForm = () => {
    setEditingDraft(null);
    setExpandedEpisodeId(null);
    setCreateOpen(true);
  };

  const toggleCreateForm = () => {
    if (createOpen) {
      closeCreateForm();
      return;
    }

    openCreateForm();
  };

  const saveManualEntry = () => {
    if (!canSaveManualDraft(manualDraft)) return;

    actions.addManualDiaryEntry({
      title: manualDraft.title,
      notes: manualDraft.notes,
      trigger: manualDraft.trigger,
    });
    closeCreateForm();
  };

  const toggleEdit = (log: EpisodeLog) => {
    closeCreateForm();
    if (log.entryType === "episode") {
      setExpandedEpisodeId(log.id);
    } else {
      setExpandedEpisodeId(null);
    }
    setEditingDraft((current) => (current?.id === log.id ? null : createEditDraft(log)));
  };

  const toggleEpisode = (log: EpisodeLog) => {
    if (log.entryType !== "episode") return;

    closeCreateForm();
    setEditingDraft(null);
    setExpandedEpisodeId((current) => (current === log.id ? null : log.id));
  };

  const saveEdit = () => {
    if (!editingDraft) return;

    if (editingDraft.kind === "manual" && !canSaveManualDraft(editingDraft.entry)) {
      return;
    }

    actions.updateDiaryEntry(editingDraft);
    setEditingDraft(null);
  };

  const deleteEntry = (log: EpisodeLog) => {
    const isActiveLiveSession = data.episodeRuntime?.logId === log.id && log.status === "started";
    const confirmed = window.confirm(
      isActiveLiveSession
        ? "Delete this in-progress session? This will discard the active Help Me Recover session."
        : "Delete this diary entry permanently?"
    );

    if (!confirmed) return;

    actions.deleteDiaryEntry(log.id);
    if (editingDraft?.id === log.id) setEditingDraft(null);
    if (expandedEpisodeId === log.id) setExpandedEpisodeId(null);
  };

  return (
    <AppFrame withNav>
      <PageHeader
        title="Episode Diary"
        subtitle="Add your own notes and keep a record each time Help Me Recover is used."
        action={
          <button
            type="button"
            onClick={toggleCreateForm}
            className="mt-1 inline-flex h-11 items-center gap-2 rounded-[1rem] bg-[#319A50] px-4 text-[0.92rem] font-semibold text-white shadow-[0_16px_40px_-24px_rgba(49,154,80,0.7)] transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        }
      />

      <Surface>
        <div className="flex flex-wrap gap-2">
          <ToggleChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </ToggleChip>
          <ToggleChip active={filter === "episode"} onClick={() => setFilter("episode")}>
            Sessions
          </ToggleChip>
          <ToggleChip active={filter === "manual"} onClick={() => setFilter("manual")}>
            Manual notes
          </ToggleChip>
        </div>
      </Surface>

      {createOpen && (
        <Surface className="mt-5">
          <AccordionPanel
            open={createOpen}
            onToggle={closeCreateForm}
            header={
              <div className="pr-6">
                <p className="text-[1.02rem] font-semibold text-slate-900">Add a manual diary entry</p>
                <p className="mt-2 text-[0.94rem] leading-relaxed text-slate-500">
                  Use this for anything you want to remember between sessions, including symptoms, triggers, or changes to discuss later.
                </p>
              </div>
            }
          >
            <ManualDiaryEntryFields
              title={manualDraft.title}
              trigger={manualDraft.trigger}
              notes={manualDraft.notes}
              onTitleChange={(title) => setManualDraft((current) => ({ ...current, title }))}
              onTriggerChange={(trigger) => setManualDraft((current) => ({ ...current, trigger }))}
              onNotesChange={(notes) => setManualDraft((current) => ({ ...current, notes }))}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SecondaryButton onClick={closeCreateForm}>Cancel</SecondaryButton>
              <PrimaryButton onClick={saveManualEntry} disabled={!canSaveManualDraft(manualDraft)}>
                Save manual entry
              </PrimaryButton>
            </div>
          </AccordionPanel>
        </Surface>
      )}

      <div className="mt-5 space-y-4">
        {logs.length === 0 ? (
          <Surface>
            <p className="text-[1.02rem] font-semibold text-slate-900">No diary entries yet</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-500">
              Manual notes will appear here, and Help Me Recover sessions are recorded as soon as they start.
            </p>
          </Surface>
        ) : (
          logs.map((log) => {
            const timestamp = log.finishedAt ?? log.startedAt;
            const isEditing = editingDraft?.id === log.id;
            const isExpanded = expandedEpisodeId === log.id;
            const episodeSummarySnippet = log.entryType === "episode" ? getEpisodeSummarySnippet(log) : "";

            if (log.entryType === "episode") {
              return (
                <Surface key={log.id}>
                  <AccordionPanel
                    open={isExpanded}
                    onToggle={() => toggleEpisode(log)}
                    header={
                      <div className="pr-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[1rem] font-semibold text-slate-900">{log.title}</p>
                            <p className="mt-1 text-[0.9rem] text-slate-400">
                              {formatDateLabel(timestamp)} at {formatTimeLabel(timestamp)}
                            </p>
                            {episodeSummarySnippet && (
                              <p className="mt-2 text-[0.92rem] leading-relaxed text-slate-500">{episodeSummarySnippet}</p>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            {getBadgeLabel(log)}
                          </span>
                        </div>
                      </div>
                    }
                  >
                    <DiaryEntryDetails log={log} />

                    <div className="mt-4 flex flex-wrap gap-2">
                      <DiaryActionButton
                        label={isEditing ? "Close" : "Edit"}
                        icon={PencilLine}
                        onClick={() => toggleEdit(log)}
                      />
                      <DiaryActionButton
                        label="Delete"
                        icon={Trash2}
                        destructive
                        onClick={() => deleteEntry(log)}
                      />
                    </div>

                    <AccordionPanel open={isEditing}>
                      {isEditing && editingDraft?.kind === "episode-started" && (
                        <StartedEpisodeEditor
                          draft={editingDraft.entry}
                          onChange={(entry) =>
                            setEditingDraft((current) =>
                              current?.id === log.id && current.kind === "episode-started"
                                ? { ...current, entry }
                                : current
                            )
                          }
                          onSave={saveEdit}
                          onCancel={() => setEditingDraft(null)}
                        />
                      )}

                      {isEditing && editingDraft?.kind === "episode-completed" && (
                        <CompletedEpisodeEditor
                          draft={editingDraft.entry}
                          triggerOptions={triggerOptions}
                          onChange={(entry) =>
                            setEditingDraft((current) =>
                              current?.id === log.id && current.kind === "episode-completed"
                                ? { ...current, entry }
                                : current
                            )
                          }
                          onSave={saveEdit}
                          onCancel={() => setEditingDraft(null)}
                        />
                      )}
                    </AccordionPanel>
                  </AccordionPanel>
                </Surface>
              );
            }

            return (
              <Surface key={log.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[1rem] font-semibold text-slate-900">{log.title}</p>
                    <p className="mt-1 text-[0.9rem] text-slate-400">
                      {formatDateLabel(timestamp)} at {formatTimeLabel(timestamp)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {getBadgeLabel(log)}
                    </span>
                    <div className="flex flex-wrap justify-end gap-2">
                      <DiaryActionButton
                        label={isEditing ? "Close" : "Edit"}
                        icon={PencilLine}
                        onClick={() => toggleEdit(log)}
                      />
                      <DiaryActionButton
                        label="Delete"
                        icon={Trash2}
                        destructive
                        onClick={() => deleteEntry(log)}
                      />
                    </div>
                  </div>
                </div>

                <DiaryEntryDetails log={log} />

                <AccordionPanel open={isEditing}>
                  {isEditing && editingDraft?.kind === "manual" && (
                    <ManualEntryEditor
                      draft={editingDraft.entry}
                      onChange={(entry) =>
                        setEditingDraft((current) =>
                          current?.id === log.id && current.kind === "manual"
                            ? { ...current, entry }
                            : current
                        )
                      }
                      onSave={saveEdit}
                      onCancel={() => setEditingDraft(null)}
                    />
                  )}
                </AccordionPanel>
              </Surface>
            );
          })
        )}
      </div>

      <FooterNav />
    </AppFrame>
  );
}
