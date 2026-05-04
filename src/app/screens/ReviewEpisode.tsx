import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppFrame, PrimaryButton, SecondaryButton } from "../components/AppChrome";
import {
  EpisodeConfidenceField,
  EpisodeReflectionFields,
  EpisodeTriggerField,
  getEpisodeTriggerOptions,
} from "../components/DiaryEntryFields";
import { useAppState } from "../state/AppState";

type ReviewState = {
  outcome?: "better" | "action_plan" | "medical_advice" | "emergency_care" | "uncertain";
  reasonBetter?: string;
};

function ReviewGuideBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="mb-5 border-b border-[#168E43]/12 pb-4">
      <h2 className="text-[1.35rem] font-bold leading-tight text-[#168E43]">{title}</h2>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-slate-700">{children}</p>
    </div>
  );
}

export default function ReviewEpisode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, actions } = useAppState();
  const routeState = (location.state ?? {}) as ReviewState;
  const activeLog = data.episodeRuntime?.logId
    ? data.episodeLogs.find((log) => log.id === data.episodeRuntime?.logId)
    : undefined;

  const [trigger, setTrigger] = useState(activeLog?.trigger ?? "");
  const [confidence, setConfidence] = useState(activeLog?.confidence ? activeLog.confidence : 3);
  const [helped, setHelped] = useState(routeState.reasonBetter ?? activeLog?.helped ?? "");
  const [didntHelp, setDidntHelp] = useState(activeLog?.didntHelp ?? "");
  const [supportNotes, setSupportNotes] = useState(activeLog?.supportNotes ?? "");
  const [revisionSummary, setRevisionSummary] = useState(activeLog?.revisionSummary ?? "");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const triggerOptions = getEpisodeTriggerOptions(data.triggers);

  const saveReviewEntry = () => {
    actions.saveEpisodeLog({
      outcome: routeState.outcome ?? "uncertain",
      reasonBetter: routeState.reasonBetter ?? activeLog?.reasonBetter ?? "",
      trigger: trigger.trim(),
      confidence,
      helped: helped.trim(),
      didntHelp: didntHelp.trim(),
      supportNotes: supportNotes.trim(),
      revisionSummary: revisionSummary.trim(),
    });
  };

  const completeReview = (destination: "/" | "/plan") => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    saveReviewEntry();
    setSuccessMessage("Episode added to your Diary");
    window.setTimeout(() => {
      navigate(destination, { replace: true });
    }, 850);
  };

  const saveReview = () => {
    completeReview("/");
  };

  return (
    <AppFrame tone="warm">
      <div className="space-y-4">
        <EpisodeTriggerField
          trigger={trigger}
          onTriggerChange={setTrigger}
          triggerOptions={triggerOptions}
          asSurface
          intro={
            <ReviewGuideBlock title="Reflect">
              Record what happened, what helped, and what you may want to change for next time.
            </ReviewGuideBlock>
          }
        />
        <EpisodeConfidenceField
          confidence={confidence}
          onConfidenceChange={setConfidence}
          asSurface
        />
        <EpisodeReflectionFields
          helped={helped}
          didntHelp={didntHelp}
          supportNotes={supportNotes}
          revisionSummary={revisionSummary}
          onHelpedChange={setHelped}
          onDidntHelpChange={setDidntHelp}
          onSupportNotesChange={setSupportNotes}
          onRevisionSummaryChange={setRevisionSummary}
          asSurface
          recordIntro={
            <ReviewGuideBlock title="Record">
              Some people may find the ‘Breathlessness Episode Diary’ in the user guide helpful to see patterns over time.
            </ReviewGuideBlock>
          }
          revisionIntro={
            <ReviewGuideBlock title="Revise and update">
              If needed, update the strategies in your plan. Ask a healthcare professional for help and practice new
              strategies before your next episode.
            </ReviewGuideBlock>
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <SecondaryButton
          onClick={() => completeReview("/plan")}
          disabled={isSubmitting}
        >
          Revise My Plan
        </SecondaryButton>
        <PrimaryButton onClick={saveReview} disabled={isSubmitting} className="justify-between">
          <span>Save review</span>
          <ArrowRight className="h-5 w-5" />
        </PrimaryButton>
      </div>

      {successMessage && (
        <div className="fixed bottom-[calc(1.2rem+env(safe-area-inset-bottom))] left-1/2 z-[80] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-full bg-[#236A3D] px-5 py-3 text-center text-[0.92rem] font-semibold text-white shadow-[0_24px_58px_-32px_rgba(35,106,61,0.85)]">
          {successMessage}
        </div>
      )}
    </AppFrame>
  );
}
