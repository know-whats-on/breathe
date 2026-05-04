import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadAppData, saveAppData } from "../lib/storage";
import { createDefaultAppData, limitHomeModules, normaliseRecoveryPlan } from "../model/types";
import type {
  AppData,
  ContactSet,
  CopdActionPlan,
  DiaryEntryUpdateInput,
  EpisodeGuideVariant,
  EpisodeMode,
  EpisodeLog,
  EpisodeReviewEntry,
  EpisodeStage,
  HomeModuleKey,
  ManualDiaryEntryInput,
  NextStepsPlan,
  RecoveryPlan,
  SelfChecklistItem,
  SupportPreferences,
  UserProfile,
  WeatherSnapshot,
} from "../model/types";

interface AppStateContextValue {
  ready: boolean;
  data: AppData;
  actions: {
    completeOnboarding: (profile: UserProfile, homeModules: HomeModuleKey[]) => void;
    logOut: () => void;
    updateHomeModules: (homeModules: HomeModuleKey[]) => void;
    updateRecoveryPlan: (recoveryPlan: RecoveryPlan) => void;
    updateSelfChecklistItems: (selfChecklistItems: SelfChecklistItem[]) => void;
    updateSupportPreferences: (supportPreferences: SupportPreferences) => void;
    updateNextStepsPlan: (nextStepsPlan: NextStepsPlan) => void;
    updateContacts: (contacts: ContactSet) => void;
    updateCopdActionPlan: (copdActionPlan: CopdActionPlan) => void;
    clearCopdActionPlan: () => void;
    updateTriggers: (triggers: string[]) => void;
    startEpisode: (options?: { mode?: EpisodeMode; guideVariant?: EpisodeGuideVariant }) => void;
    setEpisodeIndex: (index: number) => void;
    setEpisodeStage: (stage: EpisodeStage) => void;
    markPlanPractised: () => void;
    markPlanReviewed: () => void;
    addManualDiaryEntry: (entry: ManualDiaryEntryInput) => void;
    updateDiaryEntry: (entry: DiaryEntryUpdateInput) => void;
    deleteDiaryEntry: (id: string) => void;
    patchActiveEpisodeLog: (patch: Partial<EpisodeLog>) => void;
    saveEpisodeLog: (entry: EpisodeReviewEntry) => void;
    clearEpisode: () => void;
    saveWeatherSnapshot: (snapshot: WeatherSnapshot) => void;
  };
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const DEFAULT_MANUAL_TITLE = "Manual diary note";
const DEFAULT_SESSION_TITLE = "Help Me Recover session";

function appendTriggerIfMissing(triggers: string[], rawTrigger?: string) {
  const trigger = rawTrigger?.trim() ?? "";

  if (
    trigger.length === 0 ||
    triggers.some((currentTrigger) => currentTrigger.toLowerCase() === trigger.toLowerCase())
  ) {
    return triggers;
  }

  return [...triggers, trigger];
}

function buildManualDiaryTitle(title: string, notes: string, trigger: string) {
  const nextTitle = title.trim();

  if (nextTitle.length > 0) return nextTitle;
  if (notes.trim().length > 0) return DEFAULT_MANUAL_TITLE;
  return trigger || DEFAULT_MANUAL_TITLE;
}

function buildSessionTitle(title: string, trigger: string) {
  return title.trim() || trigger || DEFAULT_SESSION_TITLE;
}

function hasCustomSessionTitle(title?: string | null) {
  const nextTitle = title?.trim() ?? "";
  return nextTitle.length > 0 && nextTitle !== DEFAULT_SESSION_TITLE;
}

function buildCompletedSessionTitle(existingTitle: string | undefined, trigger: string) {
  if (hasCustomSessionTitle(existingTitle)) {
    return existingTitle!.trim();
  }

  return trigger || existingTitle?.trim() || DEFAULT_SESSION_TITLE;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(createDefaultAppData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadAppData().then((loaded) => {
      if (cancelled) return;
      setData(loaded);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveAppData(data);
  }, [data, ready]);

  const updateData = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => updater(current));
  }, []);

  const completeOnboarding = useCallback((profile: UserProfile, homeModules: HomeModuleKey[]) => {
    updateData((current) => ({
      ...current,
      onboardingComplete: true,
      profile,
      homeModules: limitHomeModules(homeModules),
    }));
  }, [updateData]);

  const logOut = useCallback(() => {
    setData(createDefaultAppData());
  }, []);

  const updateHomeModules = useCallback((homeModules: HomeModuleKey[]) => {
    updateData((current) => ({ ...current, homeModules: limitHomeModules(homeModules) }));
  }, [updateData]);

  const updateRecoveryPlan = useCallback((recoveryPlan: RecoveryPlan) => {
    updateData((current) => ({ ...current, recoveryPlan: normaliseRecoveryPlan(recoveryPlan) }));
  }, [updateData]);

  const updateSelfChecklistItems = useCallback((selfChecklistItems: SelfChecklistItem[]) => {
    updateData((current) => ({
      ...current,
      recoveryPlan: { ...current.recoveryPlan, selfChecklistItems },
    }));
  }, [updateData]);

  const updateSupportPreferences = useCallback((supportPreferences: SupportPreferences) => {
    updateData((current) => ({
      ...current,
      recoveryPlan: { ...current.recoveryPlan, supportPreferences },
    }));
  }, [updateData]);

  const updateNextStepsPlan = useCallback((nextStepsPlan: NextStepsPlan) => {
    updateData((current) => ({
      ...current,
      recoveryPlan: { ...current.recoveryPlan, nextStepsPlan },
    }));
  }, [updateData]);

  const updateContacts = useCallback((contacts: ContactSet) => {
    updateData((current) => ({ ...current, contacts }));
  }, [updateData]);

  const updateCopdActionPlan = useCallback((copdActionPlan: CopdActionPlan) => {
    updateData((current) => ({ ...current, copdActionPlan }));
  }, [updateData]);

  const clearCopdActionPlan = useCallback(() => {
    updateData((current) => ({
      ...current,
      copdActionPlan: {
        front: null,
        back: null,
      },
    }));
  }, [updateData]);

  const updateTriggers = useCallback((triggers: string[]) => {
    updateData((current) => ({ ...current, triggers }));
  }, [updateData]);

  const startEpisode = useCallback((options?: { mode?: EpisodeMode; guideVariant?: EpisodeGuideVariant }) => {
    const mode = options?.mode ?? "live";
    const guideVariant = options?.guideVariant ?? "standard";

    updateData((current) => {
      if (current.episodeRuntime) {
        if (
          current.episodeRuntime.mode === "live" &&
          mode === "live" &&
          guideVariant === "support_assist" &&
          current.episodeRuntime.guideVariant !== "support_assist"
        ) {
          return {
            ...current,
            episodeRuntime: {
              ...current.episodeRuntime,
              guideVariant: "support_assist",
            },
          };
        }

        return current;
      }

      const startedAt = new Date().toISOString();
      const logId = mode === "live" ? crypto.randomUUID() : null;
      const startedEntry: EpisodeLog | null = logId
        ? {
            id: logId,
            entryType: "episode",
            status: "started",
            title: "Help Me Recover session",
            notes: "",
            startedAt,
            finishedAt: null,
            outcome: "uncertain",
            reasonBetter: "",
            trigger: "",
            confidence: 0,
            helped: "",
            didntHelp: "",
            supportNotes: "",
            revisionSummary: "",
            thinkSelfCheck: null,
          }
        : null;

      return {
        ...current,
        episodeLogs: startedEntry ? [startedEntry, ...current.episodeLogs] : current.episodeLogs,
        episodeRuntime: {
          startedAt,
          currentIndex: 0,
          stage: "running",
          mode,
          guideVariant,
          logId,
        },
      };
    });
  }, [updateData]);

  const setEpisodeIndex = useCallback((index: number) => {
    updateData((current) =>
      current.episodeRuntime
        ? {
            ...current,
            episodeRuntime: { ...current.episodeRuntime, currentIndex: index },
          }
        : current
    );
  }, [updateData]);

  const setEpisodeStage = useCallback((stage: EpisodeStage) => {
    updateData((current) =>
      current.episodeRuntime
        ? {
            ...current,
            episodeRuntime: { ...current.episodeRuntime, stage },
          }
        : current
    );
  }, [updateData]);

  const markPlanPractised = useCallback(() => {
    updateData((current) => ({
      ...current,
      recoveryPlan: {
        ...current.recoveryPlan,
        lastPractisedAt: new Date().toISOString(),
      },
    }));
  }, [updateData]);

  const markPlanReviewed = useCallback(() => {
    updateData((current) => ({
      ...current,
      recoveryPlan: {
        ...current.recoveryPlan,
        lastReviewedAt: new Date().toISOString(),
      },
    }));
  }, [updateData]);

  const addManualDiaryEntry = useCallback((entry: ManualDiaryEntryInput) => {
    updateData((current) => {
      const timestamp = new Date().toISOString();
      const trigger = entry.trigger?.trim() ?? "";
      const notes = entry.notes.trim();
      const title = buildManualDiaryTitle(entry.title, notes, trigger);
      const nextLog: EpisodeLog = {
        id: crypto.randomUUID(),
        entryType: "manual",
        status: "completed",
        title,
        notes,
        startedAt: timestamp,
        finishedAt: timestamp,
        outcome: "uncertain",
        reasonBetter: "",
        trigger,
        confidence: 0,
        helped: "",
        didntHelp: "",
        supportNotes: "",
        revisionSummary: "",
        thinkSelfCheck: null,
      };

      return {
        ...current,
        triggers: appendTriggerIfMissing(current.triggers, trigger),
        episodeLogs: [nextLog, ...current.episodeLogs],
      };
    });
  }, [updateData]);

  const updateDiaryEntry = useCallback((entry: DiaryEntryUpdateInput) => {
    updateData((current) => {
      let nextTrigger = "";
      let updated = false;

      const nextEpisodeLogs = current.episodeLogs.map((log) => {
        if (log.id !== entry.id) return log;

        if (entry.kind === "manual") {
          if (log.entryType !== "manual") return log;

          const trigger = entry.entry.trigger?.trim() ?? "";
          const notes = entry.entry.notes.trim();

          nextTrigger = trigger;
          updated = true;

          return {
            ...log,
            title: buildManualDiaryTitle(entry.entry.title, notes, trigger),
            trigger,
            notes,
          };
        }

        if (entry.kind === "episode-started") {
          if (log.entryType !== "episode" || log.status !== "started") return log;

          const trigger = entry.entry.trigger.trim();
          const notes = entry.entry.notes.trim();

          nextTrigger = trigger;
          updated = true;

          return {
            ...log,
            title: buildSessionTitle(entry.entry.title, trigger),
            trigger,
            notes,
          };
        }

        if (log.entryType !== "episode" || log.status !== "completed") return log;

        const trigger = entry.entry.trigger.trim();

        nextTrigger = trigger;
        updated = true;

        return {
          ...log,
          title: buildSessionTitle(entry.entry.title, trigger),
          trigger,
          outcome: entry.entry.outcome,
          confidence: entry.entry.confidence,
          helped: entry.entry.helped.trim(),
          didntHelp: entry.entry.didntHelp.trim(),
          supportNotes: entry.entry.supportNotes.trim(),
          revisionSummary: entry.entry.revisionSummary.trim(),
        };
      });

      if (!updated) return current;

      return {
        ...current,
        triggers: appendTriggerIfMissing(current.triggers, nextTrigger),
        episodeLogs: nextEpisodeLogs,
      };
    });
  }, [updateData]);

  const patchActiveEpisodeLog = useCallback((patch: Partial<EpisodeLog>) => {
    updateData((current) => {
      const runtime = current.episodeRuntime;

      if (!runtime || runtime.mode !== "live" || !runtime.logId) return current;

      let updated = false;
      const nextEpisodeLogs = current.episodeLogs.map((log) => {
        if (log.id !== runtime.logId) return log;

        updated = true;
        return {
          ...log,
          ...patch,
          id: log.id,
          entryType: log.entryType,
          status: log.status,
          startedAt: log.startedAt,
          finishedAt: log.finishedAt,
        };
      });

      return updated
        ? {
            ...current,
            episodeLogs: nextEpisodeLogs,
          }
        : current;
    });
  }, [updateData]);

  const saveEpisodeLog = useCallback((entry: EpisodeReviewEntry) => {
    updateData((current) => {
      const startedAt = current.episodeRuntime?.startedAt ?? new Date().toISOString();
      const finishedAt = new Date().toISOString();
      const currentLogId = current.episodeRuntime?.logId;
      const existingLog = currentLogId
        ? current.episodeLogs.find((log) => log.id === currentLogId)
        : undefined;
      const trigger = entry.trigger.trim() || existingLog?.trigger.trim() || "";
      const completedLog: EpisodeLog = {
        id: existingLog?.id ?? crypto.randomUUID(),
        entryType: "episode",
        status: "completed",
        title: buildCompletedSessionTitle(existingLog?.title, trigger),
        notes: existingLog?.notes ?? "",
        startedAt: existingLog?.startedAt ?? startedAt,
        finishedAt,
        ...entry,
        trigger,
        thinkSelfCheck: existingLog?.thinkSelfCheck ?? null,
      };

      const nextEpisodeLogs = existingLog
        ? current.episodeLogs.map((log) => (log.id === existingLog.id ? completedLog : log))
        : [completedLog, ...current.episodeLogs];

      return {
        ...current,
        triggers: appendTriggerIfMissing(current.triggers, trigger),
        episodeLogs: nextEpisodeLogs,
        episodeRuntime: null,
        recoveryPlan: {
          ...current.recoveryPlan,
          lastReviewedAt: finishedAt,
        },
      };
    });
  }, [updateData]);

  const deleteDiaryEntry = useCallback((id: string) => {
    updateData((current) => {
      const targetLog = current.episodeLogs.find((log) => log.id === id);

      if (!targetLog) return current;

      return {
        ...current,
        episodeLogs: current.episodeLogs.filter((log) => log.id !== id),
        episodeRuntime:
          current.episodeRuntime?.logId === id && targetLog.status === "started"
            ? null
            : current.episodeRuntime,
      };
    });
  }, [updateData]);

  const clearEpisode = useCallback(() => {
    updateData((current) => {
      const activeLogId = current.episodeRuntime?.logId;

      return {
        ...current,
        episodeLogs: activeLogId
          ? current.episodeLogs.filter((log) => {
              if (log.id !== activeLogId || log.status !== "started") return true;
              return Boolean(log.thinkSelfCheck);
            })
          : current.episodeLogs,
        episodeRuntime: null,
      };
    });
  }, [updateData]);

  const saveWeatherSnapshot = useCallback((snapshot: WeatherSnapshot) => {
    updateData((current) => ({ ...current, weatherSnapshot: snapshot }));
  }, [updateData]);

  const actions = useMemo(() => ({
    completeOnboarding,
    logOut,
    updateHomeModules,
    updateRecoveryPlan,
    updateSelfChecklistItems,
    updateSupportPreferences,
    updateNextStepsPlan,
    updateContacts,
    updateCopdActionPlan,
    clearCopdActionPlan,
    updateTriggers,
    startEpisode,
    setEpisodeIndex,
    setEpisodeStage,
    markPlanPractised,
    markPlanReviewed,
    addManualDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    patchActiveEpisodeLog,
    saveEpisodeLog,
    clearEpisode,
    saveWeatherSnapshot,
  }), [
    addManualDiaryEntry,
    clearCopdActionPlan,
    clearEpisode,
    completeOnboarding,
    deleteDiaryEntry,
    logOut,
    markPlanPractised,
    markPlanReviewed,
    patchActiveEpisodeLog,
    saveEpisodeLog,
    saveWeatherSnapshot,
    setEpisodeIndex,
    setEpisodeStage,
    startEpisode,
    updateDiaryEntry,
    updateContacts,
    updateCopdActionPlan,
    updateHomeModules,
    updateNextStepsPlan,
    updateRecoveryPlan,
    updateSelfChecklistItems,
    updateSupportPreferences,
    updateTriggers,
  ]);

  const value = useMemo(() => ({ ready, data, actions }), [actions, data, ready]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return value;
}
