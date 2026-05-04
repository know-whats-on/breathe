import { DEFAULT_HOME_MODULES } from "../model/types";
import type { HomeModuleKey, StrategyBucketType } from "../model/types";

export interface StrategyOption {
  id: string;
  label: string;
  detail: string;
  action?: {
    label: string;
    route: string;
  };
  recommendation?: {
    textBeforeLink: string;
    linkLabel: string;
    href: string;
    textAfterLink?: string;
  };
}

export interface StrategySection {
  title: string;
  intro: string[];
  strategyIds: string[];
}

export const DO_YOUR_FIVE_STEP_TITLES: Record<StrategyBucketType, string> = {
  STOP: "Stop",
  THINK: "Think",
  POSITION: "Position",
  BREATHE_OUT_SLOWLY: "Breathe Out Slowly",
  AIRFLOW_COOL: "Airflow/Cool",
};

export const BUCKET_COPY: Record<
  StrategyBucketType,
  { title: string; eyebrow: string; description: string }
> = {
  STOP: {
    title: "Stop what you're doing",
    eyebrow: "Take a moment",
    description:
      "When you STOP, it can help people around you understand that something is going on. You may need some space and it can let people know you need to deal with things yourself for a moment.\n\nIt can also be used to tell people not to talk to you, so you can save your breath. This can help you concentrate and figure out your next steps.",
  },
  THINK: {
    title: "Think",
    eyebrow: "Stay safe and in control",
    description:
      "During a breathlessness episode, it’s common to feel frightened or to have unhelpful thoughts that can add to the panic.",
  },
  POSITION: {
    title: "Settle into a helpful position",
    eyebrow: "Support your body",
    description: "Find the posture that makes breathing easier for you, whether you are standing or sitting.",
  },
  BREATHE_OUT_SLOWLY: {
    title: "Breathe Out Slowly",
    eyebrow: "Get the old air out",
    description: "Use the techniques from the guide that help you lengthen the out-breath and slow your breathing down.",
  },
  AIRFLOW_COOL: {
    title: "Cool your face and increase airflow",
    eyebrow: "Use air and cooling together",
    description: "Pair cool air with your breathing strategies to ease breathlessness.",
  },
};

export const STRATEGY_LIBRARY: Record<StrategyBucketType, StrategyOption[]> = {
  STOP: [
    { id: "stop-hand-signal", label: "Stop what you’re doing", detail: "Hold up your hand to tell people you need some space." },
    { id: "stop-slow-down", label: "Slow Down", detail: "Slow down and take enough time to deal with things yourself for a moment." },
    { id: "stop-take-a-moment", label: "Take a Moment", detail: "Take a moment so you can concentrate and figure out your next steps." },
    {
      id: "stop-use-hand-signal",
      label: "Use my hand signal",
      detail:
        "Putting up your hand can indicate you’re okay and just need a moment to concentrate on getting your breathing under control yourself.",
      action: {
        label: "Support or Assistance",
        route: "/support",
      },
    },
  ],
  THINK: [
    { id: "think-self-check", label: "Self-Check", detail: "Ask yourself: Does my breathlessness feel different to usual?" },
    { id: "think-it-will-pass", label: "It will pass", detail: "" },
    { id: "think-my-breathing-will-calm-down", label: "My breathing will calm down", detail: "" },
    { id: "think-stay-calm", label: "Stay Calm", detail: "" },
    { id: "think-it-will-be-okay", label: "It will be okay", detail: "" },
    { id: "think-i-have-had-this-feeling-before", label: "I have had this feeling before", detail: "" },
    { id: "think-i-am-safe", label: "I am safe", detail: "" },
    { id: "think-managed-before", label: "I have managed this before, I can do so again", detail: "" },
    { id: "think-know-it-will-go-away", label: "I know it will go away", detail: "" },
    { id: "think-nothing-awful", label: "Nothing awful is going to happen", detail: "" },
    { id: "think-i-can-do-this", label: "I can do this - I am doing it now", detail: "" },
    { id: "think-dont-need-frightened", label: "I don’t need to be frightened", detail: "" },
    { id: "think-get-my-breath-back", label: "I know I can get my breath back, I am going to be okay", detail: "" },
    { id: "think-recover-from-breathlessness", label: "Remember, I can recover from breathlessness", detail: "" },
    { id: "think-activity-normal", label: "Breathlessness with activity is normal", detail: "" },
    { id: "think-may-take-time", label: "It may take time, but it will pass", detail: "" },
    { id: "think-breathlessness-not-bad", label: "Breathlessness is not bad for me", detail: "" },
    { id: "think-key-facts", label: "I will be able to get my breath back", detail: "" },
    { id: "think-no-more-oxygen", label: "Being breathless doesn't necessarily mean I need more oxygen", detail: "" },
    { id: "think-not-pass-out", label: "I’m not going to pass out", detail: "" },
    { id: "think-heart-normal-active", label: "My heart is beating hard and fast and that is normal when I am active", detail: "" },
    { id: "think-relax-close-eyes", label: "Close your eyes", detail: "" },
    { id: "think-relax-escalator", label: "Imagine yourself on a slowly moving escalator", detail: "" },
    { id: "think-relax-somewhere", label: "Imagine yourself somewhere relaxing", detail: "" },
    { id: "think-relax-positive-feeling", label: "Focus on a positive feeling", detail: "" },
    { id: "think-relax-smell", label: "Think about what you can smell", detail: "" },
    { id: "think-relax-hear", label: "Think about what you can hear", detail: "" },
    { id: "think-relax-see", label: "Think about what you can see", detail: "" },
    { id: "think-relax-self-soothing", label: "Self-soothing", detail: "" },
    { id: "think-relax-meditate", label: "Meditate", detail: "" },
    { id: "think-relax-rock-slowly", label: "Rock yourself slowly", detail: "" },
    { id: "think-relax-music", label: "Breathe in time to the music", detail: "" },
    { id: "think-relax-pray", label: "Pray", detail: "" },
    {
      id: "think-relax-bubbles",
      label: "Imagine your worries as bubbles in fizzy water- let the bubbles rise to the surface and burst.",
      detail: "",
    },
    { id: "think-relax-stroke-pet", label: "Stroke your pet", detail: "" },
    { id: "think-distraction-fists", label: "Open & close your fists while counting to 50", detail: "" },
    { id: "think-distraction-crossword", label: "Do a crossword", detail: "" },
    { id: "think-distraction-87", label: "Count backwards from 87 in intervals of 5", detail: "" },
    { id: "think-distraction-poem", label: "Recite a poem", detail: "" },
    { id: "think-distraction-200", label: "Count backwards from 200 to 1", detail: "" },
    { id: "think-distraction-read", label: "Read a book or magazine", detail: "" },
    { id: "think-distraction-music-radio", label: "Listen to music or the radio", detail: "" },
    { id: "think-distraction-tv", label: "Listen to or watch TV", detail: "" },
    { id: "think-distraction-object", label: "Focus on an object & describe it to yourself", detail: "" },
    { id: "think-distraction-pictures", label: "Look at pictures", detail: "" },
    { id: "think-distraction-outside-sounds", label: "Sit outside and listen to sounds around you", detail: "" },
    { id: "think-distraction-look-outside", label: "Look outside", detail: "" },
    {
      id: "think-distraction-alphabet",
      label: "For each letter of the alphabet, think of a colour, a name or something of your choice",
      detail: "",
    },
    { id: "think-calm-clear-room", label: "Clear the room of onlookers", detail: "" },
    { id: "think-calm-personal-space", label: "Ask for personal space", detail: "" },
    { id: "think-calm-block-distractions", label: "Block out distractions", detail: "" },
    { id: "think-calm-turn-off-tv-music", label: "Turn off the TV or music", detail: "" },
  ],
  POSITION: [
    { id: "position-lean-forward", label: "Lean forward", detail: "Bend at your hips to lean forward." },
    { id: "position-shoulders-down", label: "Keep your shoulders down", detail: "Some people raise their shoulders when breathless, but this makes breathing more difficult." },
    { id: "position-support-arms", label: "Support your elbows and arms", detail: "Rest your elbows and forearms on your knees, a table, or another surface." },
    { id: "position-loosen-clothing", label: "Loosen tight clothing", detail: "It may be helpful to loosen clothing, particularly around your shoulders and neck." },
    { id: "position-standing", label: "When Standing Up", detail: "Lean over a back of a chair, table, kitchen counter, windowsill, walking frame, shopping trolley, fence or railing." },
    { id: "position-chair", label: "When Sitting Down", detail: "Sit up straight in a chair with your feet wide apart." },
  ],
  BREATHE_OUT_SLOWLY: [
    { id: "breathe-out-breaths", label: "Focus on the out-breaths", detail: "Focus on the out-breaths, the in-breaths will take care of themselves." },
    { id: "breathe-rectangle", label: "Breathing Around the Rectangle", detail: "Breathe in along the short side of the rectangle to the count of 2. Breathe out along the long side of the rectangle to the count of 4." },
    { id: "breathe-pursed-lip", label: "Pursed Lip Breathing", detail: "Breathe out gently with pursed lips - like flickering a candle with your breath but not putting it out." },
    { id: "breathe-bubbles", label: "Blow bubbles", detail: "Imagine doing something like blowing bubbles to help you breathe out gently." },
    { id: "breathe-blow-as-you-go", label: "Blow As You Go Technique", detail: "Breathe in before making the effort. Breathe out while making the effort." },
    { id: "breathe-paced", label: "Paced Breathing Technique", detail: "Match the rhythm of your movement with your breathing." },
    { id: "breathe-tummy", label: "Tummy Breathing or Breathing Control Technique", detail: "Practise this breathing technique when you’re sitting and resting." },
  ],
  AIRFLOW_COOL: [
    {
      id: "cool-handheld-fan",
      label: "Use a handheld fan",
      detail: "Cool air directed at your face can help reduce breathlessness.",
      recommendation: {
        textBeforeLink: "We highly recommend using Lung Foundation Australia’s handheld fan. You can buy one by ",
        linkLabel: "clicking here",
        href: "https://lungfoundation.com.au/product/hand-held-fan-2/",
        textAfterLink: ".",
      },
    },
    { id: "cool-air-conditioning", label: "Use the air conditioning", detail: "Cool your face while using your breathing techniques." },
    { id: "cool-ceiling-fan", label: "Use a ceiling fan", detail: "Use cooling techniques with your breathing techniques and also when adjusting your position." },
    { id: "cool-go-outside", label: "Go outside", detail: "Move to cooler air if it is safe for you." },
    { id: "cool-pedestal-fan", label: "Use a pedestal fan", detail: "Direct cool air toward your face." },
    { id: "cool-open-window", label: "Open a window", detail: "Create more airflow around you." },
    { id: "cool-open-door", label: "Open a door", detail: "Create more airflow around you." },
    { id: "cool-damp-cloth-face", label: "Wipe a damp cloth on your face", detail: "It can also be helpful to cool your face." },
    { id: "cool-damp-cloth-neck", label: "Put a damp cloth around your neck", detail: "It can also be helpful to cool your neck." },
  ],
};

export const THINK_STRATEGY_SECTIONS: StrategySection[] = [
  {
    title: "Positive Self-Talk",
    intro: [
      "You can reassure yourself in-the-moment with some of the statements below.",
      "You can also make your own ‘mantra’ that works for you.",
    ],
    strategyIds: [
      "think-it-will-pass",
      "think-my-breathing-will-calm-down",
      "think-stay-calm",
      "think-it-will-be-okay",
      "think-i-have-had-this-feeling-before",
      "think-i-am-safe",
      "think-managed-before",
      "think-know-it-will-go-away",
      "think-nothing-awful",
      "think-i-can-do-this",
      "think-dont-need-frightened",
      "think-get-my-breath-back",
      "think-recover-from-breathlessness",
      "think-activity-normal",
      "think-may-take-time",
    ],
  },
  {
    title: "Remember Key Facts About Breathlessness and Address Myths",
    intro: ["The following  address unhelpful ideas some people have about breathlessness."],
    strategyIds: [
      "think-breathlessness-not-bad",
      "think-key-facts",
      "think-no-more-oxygen",
      "think-not-pass-out",
      "think-heart-normal-active",
    ],
  },
  {
    title: "Relaxation Techniques",
    intro: [
      "Using relaxation techniques can calm your mind. The techniques below have been suggested by people with COPD.",
    ],
    strategyIds: [
      "think-relax-close-eyes",
      "think-relax-escalator",
      "think-relax-somewhere",
      "think-relax-positive-feeling",
      "think-relax-smell",
      "think-relax-hear",
      "think-relax-see",
      "think-relax-self-soothing",
      "think-relax-meditate",
      "think-relax-rock-slowly",
      "think-relax-music",
      "think-relax-pray",
      "think-relax-bubbles",
      "think-relax-stroke-pet",
    ],
  },
  {
    title: "Distraction Techniques",
    intro: [
      "Distracting yourself during a breathlessness episode can help some people take their mind off what is happening. Some of the following suggestions may help you:",
    ],
    strategyIds: [
      "think-distraction-fists",
      "think-distraction-crossword",
      "think-distraction-87",
      "think-distraction-poem",
      "think-distraction-200",
      "think-distraction-read",
      "think-distraction-music-radio",
      "think-distraction-tv",
      "think-distraction-object",
      "think-distraction-pictures",
      "think-distraction-outside-sounds",
      "think-distraction-look-outside",
      "think-distraction-alphabet",
    ],
  },
  {
    title: "Create a Calm Environment",
    intro: [
      "What’s happening around you can affect you during during a breathlessness episode. You can use the following strategies to create a calm environment for yourself:",
    ],
    strategyIds: [
      "think-calm-clear-room",
      "think-calm-personal-space",
      "think-calm-block-distractions",
      "think-calm-turn-off-tv-music",
    ],
  },
];

export const THINK_ROTATING_QUOTES = [
  "It will pass",
  "My breathing will calm down",
  "Stay Calm",
  "It will be okay",
  "I have had this feeling before",
  "I am safe",
  "I have managed this before, I can do so again",
  "I know it will go away",
  "Nothing awful is going to happen",
  "I can do this - I am doing it now",
  "I don’t need to be frightened",
  "I know I can get my breath back, I am going to be okay",
  "Remember, I can recover from breathlessness",
  "Breathlessness with activity is normal",
  "It may take time, but it will pass",
] as const;

export const HOME_MODULES: Record<
  HomeModuleKey,
  { label: string; description: string; route?: string; accent: string }
> = {
  MY_PLAN: {
    label: "My Plan",
    description: "Check your five steps and keep your plan up to date.",
    route: "/plan",
    accent: "bg-emerald-100 text-emerald-700",
  },
  QUICK_CONTACTS: {
    label: "Support Contacts",
    description: "Keep support people, your GP, healthcare professional, and 000 close.",
    route: "/contacts",
    accent: "bg-sky-100 text-sky-700",
  },
  DECIDE_NEXT_STEPS: {
    label: "Self-check",
    description: "Open the 10-15 minute check when you are not improving.",
    route: "/next-steps",
    accent: "bg-orange-100 text-orange-700",
  },
  WEATHER: {
    label: "Humidity / Air Quality / Bushfire Conditions",
    description: "Humidity, air quality, temperature, and bushfire conditions with cached fallback.",
    accent: "bg-sky-100 text-sky-700",
  },
  TRIGGERS: {
    label: "My Breathlessness Triggers",
    description: "Track the patterns that make episodes harder.",
    route: "/triggers",
    accent: "bg-orange-100 text-orange-700",
  },
  PRACTICE: {
    label: "Practice My Strategies",
    description: "Rehearse while calm so recovery feels familiar.",
    route: "/practice",
    accent: "bg-emerald-100 text-emerald-700",
  },
  DIARY: {
    label: "Episode Diary",
    description: "Review confidence, triggers, and what worked.",
    route: "/diary",
    accent: "bg-lime-100 text-lime-700",
  },
  ACTION_PLAN: {
    label: "COPD Action Plan Location",
    description: "Keep the location of your COPD Action Plan handy.",
    route: "/plan",
    accent: "bg-yellow-100 text-yellow-700",
  },
  SUPPORT: {
    label: "Support Person Help",
    description: "Guidance for family or friends who help during an episode.",
    route: "/support",
    accent: "bg-violet-100 text-violet-700",
  },
  GUIDES: {
    label: "Guides & Resources",
    description: "Core support materials and education.",
    route: "/resources",
    accent: "bg-amber-100 text-amber-700",
  },
  TIPS: {
    label: "Everyday Breathlessness Tips",
    description: "Paced breathing, blow-as-you-go, and daily advice.",
    route: "/practice",
    accent: "bg-teal-100 text-teal-700",
  },
  SERVICES: {
    label: "Services & Programs",
    description: "Pulmonary rehab, Lung Foundation, and support services.",
    route: "/resources",
    accent: "bg-cyan-100 text-cyan-700",
  },
};

export const STARTER_MODULE_RECOMMENDATIONS: HomeModuleKey[] = [...DEFAULT_HOME_MODULES];

export const TRIGGER_SUGGESTIONS = [
  "Being more active than usual",
  "Rushing",
  "Feeling big emotions",
  "Changes in weather",
  "Changes in humidity",
  "Pollen",
  "Smoke",
  "Showering",
  "Bending over",
  "Climbing stairs",
];

export const BETTER_CHECKS = [
  "My breathing is calmer",
  "I feel less panicky",
  "I’m back to my normal",
];
