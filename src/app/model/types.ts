export const CURRENT_SCHEMA_VERSION = 6;

export const STRATEGY_BUCKET_ORDER = [
  "STOP",
  "THINK",
  "POSITION",
  "BREATHE_OUT_SLOWLY",
  "AIRFLOW_COOL",
] as const;

export const HOME_MODULE_KEYS = [
  "MY_PLAN",
  "QUICK_CONTACTS",
  "DECIDE_NEXT_STEPS",
  "WEATHER",
  "TRIGGERS",
  "PRACTICE",
  "DIARY",
  "ACTION_PLAN",
  "SUPPORT",
  "GUIDES",
  "TIPS",
  "SERVICES",
] as const;

export type StrategyBucketType = (typeof STRATEGY_BUCKET_ORDER)[number];
export type HomeModuleKey = (typeof HOME_MODULE_KEYS)[number];
export type ThinkSelfCheckAnswerValue = "yes" | "no";

export const HOME_PAGE_SIZE = 4;
export const FIXED_HOME_MODULES: HomeModuleKey[] = [
  "MY_PLAN",
  "QUICK_CONTACTS",
  "DECIDE_NEXT_STEPS",
  "WEATHER",
];
export const DEFAULT_HOME_MODULES: HomeModuleKey[] = [];
export const REQUIRED_BREATHE_OUT_STRATEGY_ID = "breathe-out-breaths";
export const EVERYDAY_BREATHE_OUT_STRATEGY_IDS = [
  "breathe-blow-as-you-go",
  "breathe-paced",
  "breathe-tummy",
] as const;

const HOME_MODULE_KEY_SET = new Set<string>(HOME_MODULE_KEYS);
const FIXED_HOME_MODULE_KEY_SET = new Set<string>(FIXED_HOME_MODULES);
const EVERYDAY_BREATHE_OUT_STRATEGY_ID_SET = new Set<string>(EVERYDAY_BREATHE_OUT_STRATEGY_IDS);

export function limitHomeModules(homeModules: HomeModuleKey[]) {
  const unique: HomeModuleKey[] = [];

  for (const key of homeModules) {
    if (FIXED_HOME_MODULE_KEY_SET.has(key)) continue;
    if (unique.includes(key)) continue;
    unique.push(key);
  }

  return unique;
}

export function sanitiseHomeModules(raw: unknown, fallback: HomeModuleKey[] = DEFAULT_HOME_MODULES) {
  if (!Array.isArray(raw)) return [...fallback];

  const next: HomeModuleKey[] = [];

  for (const value of raw) {
    if (typeof value !== "string" || !HOME_MODULE_KEY_SET.has(value)) continue;
    const key = value as HomeModuleKey;
    if (FIXED_HOME_MODULE_KEY_SET.has(key)) continue;
    if (next.includes(key)) continue;
    next.push(key);
  }

  return next;
}

export interface UserProfile {
  name: string;
  email: string;
  uniqueId: string;
  isForSelf: boolean;
  careRecipientName: string;
}

export interface StrategyBucket {
  type: StrategyBucketType;
  selectedStrategyIds: string[];
  customNote: string;
}

export function normaliseBreatheOutStrategyIds(selectedStrategyIds: readonly string[] = []) {
  const next = [REQUIRED_BREATHE_OUT_STRATEGY_ID];

  for (const strategyId of selectedStrategyIds) {
    if (
      strategyId === REQUIRED_BREATHE_OUT_STRATEGY_ID ||
      EVERYDAY_BREATHE_OUT_STRATEGY_ID_SET.has(strategyId) ||
      next.includes(strategyId)
    ) {
      continue;
    }

    next.push(strategyId);
  }

  return next;
}

export interface SupportPreferences {
  preferredResponse: string;
  calmingActions: string;
  avoidActions: string;
  decisionMaker: "self" | "support" | "shared";
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface ContactSet {
  emergencyNumber: string;
  gp: ContactPerson;
  copdNurse: ContactPerson;
  supportPeople: ContactPerson[];
}

export interface NextStepsPlan {
  actionPlanLocation: string;
  ifUnsureCall: string;
  medicalAdviceNote: string;
  emergencyCareNote: string;
}

export interface CopdActionPlanImage {
  dataUrl: string;
  capturedAt: string;
  fileName: string | null;
  mimeType: string;
}

export interface CopdActionPlan {
  front: CopdActionPlanImage | null;
  back: CopdActionPlanImage | null;
}

export interface SelfChecklistItem {
  id: string;
  prompt: string;
}

export interface ThinkSelfCheckResponse {
  id: string;
  prompt: string;
  answer: ThinkSelfCheckAnswerValue;
}

export interface ThinkSelfCheckEntry {
  completedAt: string;
  responses: ThinkSelfCheckResponse[];
}

export interface RecoveryPlan {
  order: StrategyBucketType[];
  buckets: Record<StrategyBucketType, StrategyBucket>;
  selfChecklistItems: SelfChecklistItem[];
  supportPreferences: SupportPreferences;
  nextStepsPlan: NextStepsPlan;
  lastReviewedAt: string | null;
  lastPractisedAt: string | null;
}

export function normaliseRecoveryPlan(recoveryPlan: RecoveryPlan): RecoveryPlan {
  const breatheOutBucket = recoveryPlan.buckets.BREATHE_OUT_SLOWLY;

  return {
    ...recoveryPlan,
    buckets: {
      ...recoveryPlan.buckets,
      BREATHE_OUT_SLOWLY: {
        ...breatheOutBucket,
        selectedStrategyIds: normaliseBreatheOutStrategyIds(breatheOutBucket.selectedStrategyIds),
      },
    },
  };
}

export type EpisodeStage = "running" | "next_steps" | "review";
export type EpisodeMode = "live" | "practice";
export type EpisodeGuideVariant = "standard" | "support_assist";
export type EpisodeEntryType = "episode" | "manual";
export type EpisodeEntryStatus = "started" | "completed";
export type EpisodeOutcome =
  | "better"
  | "action_plan"
  | "medical_advice"
  | "emergency_care"
  | "uncertain";

export interface EpisodeRuntime {
  startedAt: string;
  currentIndex: number;
  stage: EpisodeStage;
  mode: EpisodeMode;
  guideVariant: EpisodeGuideVariant;
  logId: string | null;
}

export interface EpisodeLog {
  id: string;
  entryType: EpisodeEntryType;
  status: EpisodeEntryStatus;
  title: string;
  notes: string;
  startedAt: string;
  finishedAt: string | null;
  outcome: EpisodeOutcome;
  reasonBetter: string;
  trigger: string;
  confidence: number;
  helped: string;
  didntHelp: string;
  supportNotes: string;
  revisionSummary: string;
  thinkSelfCheck: ThinkSelfCheckEntry | null;
}

export interface EpisodeReviewEntry {
  outcome: EpisodeOutcome;
  reasonBetter: string;
  trigger: string;
  confidence: number;
  helped: string;
  didntHelp: string;
  supportNotes: string;
  revisionSummary: string;
}

export interface ManualDiaryEntryInput {
  title: string;
  notes: string;
  trigger?: string;
}

export interface StartedEpisodeDiaryEntryUpdateInput {
  title: string;
  notes: string;
  trigger: string;
}

export interface CompletedEpisodeDiaryEntryUpdateInput {
  title: string;
  trigger: string;
  outcome: EpisodeOutcome;
  confidence: number;
  helped: string;
  didntHelp: string;
  supportNotes: string;
  revisionSummary: string;
}

export type DiaryEntryUpdateInput =
  | {
      id: string;
      kind: "manual";
      entry: ManualDiaryEntryInput;
    }
  | {
      id: string;
      kind: "episode-started";
      entry: StartedEpisodeDiaryEntryUpdateInput;
    }
  | {
      id: string;
      kind: "episode-completed";
      entry: CompletedEpisodeDiaryEntryUpdateInput;
    };

export interface WeatherSnapshot {
  locationLabel: string;
  temperatureC: number;
  condition: string;
  humidity: number;
  bushfireRisk: "Low" | "Moderate" | "High" | "Extreme";
  airQualityLabel: string;
  windKmh: number;
  cachedAt: string;
}

export interface AppData {
  schemaVersion: number;
  onboardingComplete: boolean;
  profile: UserProfile | null;
  homeModules: HomeModuleKey[];
  triggers: string[];
  recoveryPlan: RecoveryPlan;
  contacts: ContactSet;
  episodeLogs: EpisodeLog[];
  episodeRuntime: EpisodeRuntime | null;
  copdActionPlan: CopdActionPlan;
  weatherSnapshot: WeatherSnapshot | null;
}

export const DEFAULT_SELF_CHECKLIST_ITEMS: ReadonlyArray<SelfChecklistItem> = [
  {
    id: "routine-medication",
    prompt: "Have I taken my routine medication(s) today?",
  },
  {
    id: "oxygen-supply",
    prompt: "Have I checked my oxygen supply? (If relevant)",
  },
  {
    id: "different-breathlessness",
    prompt: "Does my breathlessness feel different to usual?",
  },
  {
    id: "phlegm-change",
    prompt: "Have there been changes in my phlegm - its colour, amount, consistency or taste?",
  },
  {
    id: "ankle-swelling",
    prompt: "Are my ankles swollen?",
  },
  {
    id: "chest-pain",
    prompt: "Do I have chest pain?",
  },
] as const;

const DEFAULT_SELF_CHECK_PROMPT_BY_ID = new Map(
  DEFAULT_SELF_CHECKLIST_ITEMS.map((item) => [item.id, item.prompt])
);

export function createDefaultSelfChecklistItems(): SelfChecklistItem[] {
  return DEFAULT_SELF_CHECKLIST_ITEMS.map((item) => ({ ...item }));
}

export function sanitiseSelfChecklistItems(
  raw: unknown,
  fallback: SelfChecklistItem[] = createDefaultSelfChecklistItems()
): SelfChecklistItem[] {
  if (!Array.isArray(raw)) return fallback.map((item) => ({ ...item }));

  const next: SelfChecklistItem[] = [];
  const seenIds = new Set<string>();

  for (const value of raw) {
    if (!value || typeof value !== "object") continue;

    const candidate = value as Partial<SelfChecklistItem>;
    const prompt = typeof candidate.prompt === "string" ? candidate.prompt.trim() : "";

    if (prompt.length === 0) continue;

    const fallbackId = crypto.randomUUID();
    const id = typeof candidate.id === "string" && candidate.id.trim().length > 0
      ? candidate.id.trim()
      : fallbackId;

    if (seenIds.has(id)) continue;

    seenIds.add(id);
    next.push({ id, prompt });
  }

  return next.length > 0 ? next : fallback.map((item) => ({ ...item }));
}

export function createContactPerson(role: string): ContactPerson {
  return {
    id: `${role.toLowerCase().replace(/\s+/g, "-")}-${crypto.randomUUID()}`,
    name: "",
    role,
    phone: "",
  };
}

export function createDefaultCopdActionPlan(): CopdActionPlan {
  return {
    front: null,
    back: null,
  };
}

export function createDefaultRecoveryPlan(): RecoveryPlan {
  return {
    order: [...STRATEGY_BUCKET_ORDER],
    buckets: {
      STOP: {
        type: "STOP",
        selectedStrategyIds: ["stop-slow-down", "stop-hand-signal"],
        customNote: "",
      },
      THINK: {
        type: "THINK",
        selectedStrategyIds: ["think-self-check", "think-it-will-pass"],
        customNote: "",
      },
      POSITION: {
        type: "POSITION",
        selectedStrategyIds: ["position-shoulders-down", "position-support-arms"],
        customNote: "",
      },
      BREATHE_OUT_SLOWLY: {
        type: "BREATHE_OUT_SLOWLY",
        selectedStrategyIds: ["breathe-out-breaths", "breathe-rectangle", "breathe-pursed-lip"],
        customNote: "",
      },
      AIRFLOW_COOL: {
        type: "AIRFLOW_COOL",
        selectedStrategyIds: ["cool-handheld-fan", "cool-open-window"],
        customNote: "",
      },
    },
    selfChecklistItems: createDefaultSelfChecklistItems(),
    supportPreferences: {
      preferredResponse: "",
      calmingActions: "",
      avoidActions: "",
      decisionMaker: "shared",
    },
    nextStepsPlan: {
      actionPlanLocation: "",
      ifUnsureCall: "",
      medicalAdviceNote: "If my breathlessness is not improving after 10–15 minutes, I will seek medical advice.",
      emergencyCareNote: "If I have severe symptoms or feel unsafe, I will call 000.",
    },
    lastReviewedAt: null,
    lastPractisedAt: null,
  };
}

export function createDefaultAppData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    onboardingComplete: false,
    profile: null,
    homeModules: [...DEFAULT_HOME_MODULES],
    triggers: [
      "Being more active than usual",
      "Rushing",
      "Feeling big emotions",
      "Changes in weather",
      "Changes in humidity",
      "Pollen",
    ],
    recoveryPlan: createDefaultRecoveryPlan(),
    contacts: {
      emergencyNumber: "000",
      gp: createContactPerson("GP"),
      copdNurse: createContactPerson("COPD nurse"),
      supportPeople: [
        createContactPerson("Support person"),
        createContactPerson("Support person"),
      ],
    },
    episodeLogs: [],
    episodeRuntime: null,
    copdActionPlan: createDefaultCopdActionPlan(),
    weatherSnapshot: null,
  };
}

function normaliseEpisodeOutcome(raw: unknown): EpisodeOutcome {
  switch (raw) {
    case "better":
    case "action_plan":
    case "medical_advice":
    case "emergency_care":
    case "uncertain":
      return raw;
    default:
      return "uncertain";
  }
}

function hydrateThinkSelfCheck(raw: unknown): ThinkSelfCheckEntry | null {
  if (!raw || typeof raw !== "object") return null;

  const input = raw as Partial<ThinkSelfCheckEntry>;
  const rawResponses = Array.isArray(input.responses) ? input.responses : [];
  const responses: ThinkSelfCheckResponse[] = [];

  for (const response of rawResponses) {
    if (!response || typeof response !== "object") continue;

    const candidate = response as Partial<ThinkSelfCheckResponse>;
    const answer = candidate.answer === "yes" || candidate.answer === "no" ? candidate.answer : null;
    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const prompt = typeof candidate.prompt === "string" && candidate.prompt.trim().length > 0
      ? candidate.prompt.trim()
      : DEFAULT_SELF_CHECK_PROMPT_BY_ID.get(id) ?? "";

    if (!answer || id.length === 0 || prompt.length === 0) continue;

    responses.push({ id, prompt, answer });
  }

  if (responses.length === 0) return null;

  return {
    completedAt: typeof input.completedAt === "string" ? input.completedAt : new Date().toISOString(),
    responses,
  };
}

function hydrateEpisodeLog(raw: unknown): EpisodeLog | null {
  if (!raw || typeof raw !== "object") return null;

  const input = raw as Partial<EpisodeLog>;
  const startedAt = typeof input.startedAt === "string"
    ? input.startedAt
    : typeof input.finishedAt === "string"
      ? input.finishedAt
      : new Date().toISOString();
  const finishedAt = typeof input.finishedAt === "string" ? input.finishedAt : null;
  const entryType = input.entryType === "manual" ? "manual" : "episode";
  const title = typeof input.title === "string" && input.title.trim().length > 0
    ? input.title.trim()
    : typeof input.trigger === "string" && input.trigger.trim().length > 0
      ? input.trigger.trim()
      : entryType === "manual"
        ? "Manual diary note"
        : "Help Me Recover session";

  return {
    id: typeof input.id === "string" && input.id.trim().length > 0 ? input.id : crypto.randomUUID(),
    entryType,
    status: input.status === "started" || finishedAt === null ? "started" : "completed",
    title,
    notes: typeof input.notes === "string" ? input.notes : "",
    startedAt,
    finishedAt,
    outcome: normaliseEpisodeOutcome(input.outcome),
    reasonBetter: typeof input.reasonBetter === "string" ? input.reasonBetter : "",
    trigger: typeof input.trigger === "string" ? input.trigger : "",
    confidence: typeof input.confidence === "number" ? input.confidence : 0,
    helped: typeof input.helped === "string" ? input.helped : "",
    didntHelp: typeof input.didntHelp === "string" ? input.didntHelp : "",
    supportNotes: typeof input.supportNotes === "string" ? input.supportNotes : "",
    revisionSummary: typeof input.revisionSummary === "string" ? input.revisionSummary : "",
    thinkSelfCheck: hydrateThinkSelfCheck(input.thinkSelfCheck),
  };
}

function hydrateCopdActionPlanImage(raw: unknown): CopdActionPlanImage | null {
  if (!raw || typeof raw !== "object") return null;

  const input = raw as Partial<CopdActionPlanImage>;
  const dataUrl = typeof input.dataUrl === "string" ? input.dataUrl : "";

  if (!dataUrl.startsWith("data:image/")) return null;

  return {
    dataUrl,
    capturedAt: typeof input.capturedAt === "string" ? input.capturedAt : new Date().toISOString(),
    fileName: typeof input.fileName === "string" && input.fileName.trim().length > 0
      ? input.fileName.trim()
      : null,
    mimeType: typeof input.mimeType === "string" && input.mimeType.trim().length > 0
      ? input.mimeType.trim()
      : "image/jpeg",
  };
}

function hydrateCopdActionPlan(raw: unknown): CopdActionPlan {
  if (!raw || typeof raw !== "object") return createDefaultCopdActionPlan();

  const input = raw as Partial<CopdActionPlan>;

  return {
    front: hydrateCopdActionPlanImage(input.front),
    back: hydrateCopdActionPlanImage(input.back),
  };
}

export function hydrateAppData(raw: unknown): AppData {
  const defaults = createDefaultAppData();
  if (!raw || typeof raw !== "object") return defaults;

  const input = raw as Partial<AppData>;
  const recoveryPlanInput = input.recoveryPlan ?? {};
  const bucketInput = recoveryPlanInput.buckets ?? {};
  const contactsInput = input.contacts ?? {};
  const hydratedLogs = Array.isArray(input.episodeLogs)
    ? input.episodeLogs.map(hydrateEpisodeLog).filter((log): log is EpisodeLog => Boolean(log))
    : defaults.episodeLogs;
  const runtimeInput = input.episodeRuntime;
  const hydratedRuntime = runtimeInput && typeof runtimeInput === "object"
    ? {
        startedAt: typeof runtimeInput.startedAt === "string" ? runtimeInput.startedAt : new Date().toISOString(),
        currentIndex: typeof runtimeInput.currentIndex === "number" ? runtimeInput.currentIndex : 0,
        stage: runtimeInput.stage === "next_steps" || runtimeInput.stage === "review" ? runtimeInput.stage : "running",
        mode: runtimeInput.mode === "practice" ? "practice" : "live",
        guideVariant: runtimeInput.guideVariant === "support_assist" ? "support_assist" : "standard",
        logId: typeof runtimeInput.logId === "string" ? runtimeInput.logId : null,
      }
    : defaults.episodeRuntime;

  return {
    ...defaults,
    ...input,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    homeModules: sanitiseHomeModules(input.homeModules, defaults.homeModules),
    triggers: Array.isArray(input.triggers) ? input.triggers.filter(Boolean) : defaults.triggers,
    episodeLogs: hydratedLogs,
    episodeRuntime: hydratedRuntime,
    copdActionPlan: hydrateCopdActionPlan(input.copdActionPlan),
    recoveryPlan: {
      ...defaults.recoveryPlan,
      ...recoveryPlanInput,
      order: Array.isArray(recoveryPlanInput.order) && recoveryPlanInput.order.length === STRATEGY_BUCKET_ORDER.length
        ? recoveryPlanInput.order as StrategyBucketType[]
        : defaults.recoveryPlan.order,
      buckets: {
        STOP: { ...defaults.recoveryPlan.buckets.STOP, ...(bucketInput.STOP ?? {}) },
        THINK: { ...defaults.recoveryPlan.buckets.THINK, ...(bucketInput.THINK ?? {}) },
        POSITION: { ...defaults.recoveryPlan.buckets.POSITION, ...(bucketInput.POSITION ?? {}) },
        BREATHE_OUT_SLOWLY: {
          ...defaults.recoveryPlan.buckets.BREATHE_OUT_SLOWLY,
          ...(bucketInput.BREATHE_OUT_SLOWLY ?? {}),
          selectedStrategyIds: normaliseBreatheOutStrategyIds(
            bucketInput.BREATHE_OUT_SLOWLY?.selectedStrategyIds ??
              defaults.recoveryPlan.buckets.BREATHE_OUT_SLOWLY.selectedStrategyIds
          ),
        },
        AIRFLOW_COOL: {
          ...defaults.recoveryPlan.buckets.AIRFLOW_COOL,
          ...(bucketInput.AIRFLOW_COOL ?? {}),
        },
      },
      supportPreferences: {
        ...defaults.recoveryPlan.supportPreferences,
        ...(recoveryPlanInput.supportPreferences ?? {}),
      },
      nextStepsPlan: {
        ...defaults.recoveryPlan.nextStepsPlan,
        ...(recoveryPlanInput.nextStepsPlan ?? {}),
      },
      selfChecklistItems: sanitiseSelfChecklistItems(
        recoveryPlanInput.selfChecklistItems,
        defaults.recoveryPlan.selfChecklistItems
      ),
    },
    contacts: {
      ...defaults.contacts,
      ...contactsInput,
      gp: { ...defaults.contacts.gp, ...(contactsInput.gp ?? {}) },
      copdNurse: { ...defaults.contacts.copdNurse, ...(contactsInput.copdNurse ?? {}) },
      supportPeople: Array.isArray(contactsInput.supportPeople) && contactsInput.supportPeople.length > 0
        ? contactsInput.supportPeople.map((person, index) => ({
            ...createContactPerson("Support person"),
            ...(defaults.contacts.supportPeople[index] ?? {}),
            ...person,
          }))
        : defaults.contacts.supportPeople,
    },
  };
}
