import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppFrame, PrimaryButton, SecondaryButton, Surface } from "../components/AppChrome";
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
  const triggerOptions = getEpisodeTriggerOptions(data.triggers);

  const saveReview = () => {
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
    navigate("/", { replace: true });
  };

  return (
    <AppFrame tone="warm">
      <Surface className="mb-6 border border-[#168E43]/25 bg-white/95">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h1 className="text-[1.6rem] font-bold leading-tight text-[#168E43]">Reflect</h1>
            <p className="mt-4 text-[1rem] leading-relaxed text-slate-900">
              Record what happened, what helped, and what you may want to change for next time.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-[1.6rem] font-bold leading-tight text-[#168E43]">Record</h2>
              <p className="mt-4 text-[1rem] leading-relaxed text-slate-900">
                Some people may find the ‘Breathlessness Episode Diary’ in the user guide helpful to see patterns over time.
              </p>
            </div>

            <div>
              <h2 className="text-[1.45rem] font-bold leading-tight text-[#168E43]">Revise and update</h2>
              <p className="mt-4 text-[1rem] leading-relaxed text-slate-900">
                If needed, update the strategies in your plan. Ask a healthcare professional for help and practice new
                strategies before your next episode.
              </p>
            </div>
          </div>
        </div>
      </Surface>

      <div className="space-y-4">
        <EpisodeTriggerField
          trigger={trigger}
          onTriggerChange={setTrigger}
          triggerOptions={triggerOptions}
          asSurface
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
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <SecondaryButton
          onClick={() => {
            actions.clearEpisode();
            navigate("/plan");
          }}
        >
          Revise my plan
        </SecondaryButton>
        <PrimaryButton onClick={saveReview} className="justify-between">
          <span>Save review</span>
          <ArrowRight className="h-5 w-5" />
        </PrimaryButton>
      </div>
    </AppFrame>
  );
}
