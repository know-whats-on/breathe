import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowRight, Check, PhoneCall, Stethoscope, X } from "lucide-react";
import { BETTER_CHECKS } from "../content/planContent";
import { AppFrame, PrimaryButton, SecondaryButton, Surface } from "../components/AppChrome";
import { useAppState } from "../state/AppState";

type Outcome = "better" | "action_plan" | "medical_advice" | "emergency_care" | "uncertain";
type FirstChoice = "yes" | "not_really" | null;

export default function NextSteps() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, actions } = useAppState();
  const [checks, setChecks] = useState<string[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>("uncertain");
  const [firstChoice, setFirstChoice] = useState<FirstChoice>(null);

  const runtime = data.episodeRuntime;
  const actionPlanLocation = data.recoveryPlan.nextStepsPlan.actionPlanLocation;
  const canContinue = firstChoice === "yes" || selectedOutcome !== "uncertain";

  const toggleCheck = (check: string) => {
    const nextChecks = checks.includes(check)
      ? checks.filter((item) => item !== check)
      : [...checks, check];

    setChecks(nextChecks);
  };

  const chooseYes = () => {
    setFirstChoice("yes");
    setSelectedOutcome("better");
  };

  const chooseNotReally = () => {
    setFirstChoice("not_really");
    setSelectedOutcome("uncertain");
  };

  const continueToReview = () => {
    if (!canContinue) return;

    const outcome = firstChoice === "yes" ? "better" : selectedOutcome;

    actions.setEpisodeStage("review");
    navigate("/review", {
      state: {
        outcome,
        reasonBetter: checks.join(" • "),
      },
      replace: location.pathname === "/review",
    });
  };

  return (
    <AppFrame tone="warm">
      <div className="mb-6">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#E88C5D]">
          Decide next steps
        </p>
        <h1 className="mt-3 text-[2.35rem] font-bold leading-[0.98] text-slate-900">
          Am I getting better?
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={chooseYes}
          aria-pressed={firstChoice === "yes"}
          className={`flex min-h-[82px] items-center justify-center gap-3 rounded-[1.25rem] border px-4 text-[1.12rem] font-bold transition active:scale-[0.98] ${
            firstChoice === "yes"
              ? "border-[#168E43] bg-[#EAF6DD] text-[#145F2F] ring-2 ring-[#168E43]/18"
              : "border-[#168E43]/20 bg-white text-slate-900"
          }`}
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#168E43] text-white">
            <Check className="h-5 w-5" />
          </span>
          Yes
        </button>

        <button
          type="button"
          onClick={chooseNotReally}
          aria-pressed={firstChoice === "not_really"}
          className={`flex min-h-[82px] items-center justify-center gap-3 rounded-[1.25rem] border px-4 text-[1.12rem] font-bold transition active:scale-[0.98] ${
            firstChoice === "not_really"
              ? "border-[#FF3D3D] bg-[#FFF1F1] text-[#C43232] ring-2 ring-[#FF3D3D]/16"
              : "border-[#FF3D3D]/22 bg-white text-[#C43232]"
          }`}
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF3D3D] text-white">
            <X className="h-5 w-5" />
          </span>
          Not really
        </button>
      </div>

      {firstChoice === "yes" && (
        <Surface className="mt-5 border border-[#319A50]/18 bg-[#EAF6DD]">
          <p className="text-[1.02rem] font-semibold text-slate-900">I am feeling better because:</p>
          <div className="mt-3 space-y-3">
            {BETTER_CHECKS.map((check) => (
              <button
                type="button"
                key={check}
                onClick={() => toggleCheck(check)}
                className="flex w-full items-center gap-3 rounded-xl bg-white/0 px-1 py-1 text-left transition active:scale-[0.99]"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 ${
                    checks.includes(check) ? "border-[#168E43] bg-[#168E43]" : "border-[#168E43] bg-white"
                  }`}
                >
                  {checks.includes(check) && <Check className="h-4 w-4 text-white" />}
                </span>
                <span className="text-[1rem] font-semibold leading-snug text-slate-900">{check}</span>
              </button>
            ))}
          </div>
        </Surface>
      )}

      {firstChoice === "not_really" && (
        <div className="mt-4 overflow-hidden rounded-[1.2rem] bg-white shadow-[0_18px_42px_-30px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => setSelectedOutcome("action_plan")}
            className={`block w-full text-left transition ${
              selectedOutcome === "action_plan" ? "ring-2 ring-inset ring-[#319A50]" : ""
            }`}
          >
            <div className="bg-[#F5C400] px-4 py-2 text-center text-[1rem] font-bold text-slate-900">
              Refer to your COPD Action Plan
            </div>
            <div className="bg-[#FFF4C9] px-4 py-3">
              <p className="text-[0.95rem] font-semibold text-slate-700">If I have one, I keep it here:</p>
              <div className="mt-2 min-h-[3rem] rounded-sm bg-white px-3 py-2 text-[0.95rem] leading-relaxed text-slate-700">
                {actionPlanLocation}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOutcome("medical_advice")}
            className={`block w-full text-left transition ${
              selectedOutcome === "medical_advice" ? "ring-2 ring-inset ring-[#319A50]" : ""
            }`}
          >
            <div className="bg-[#F29A4A] px-4 py-2 text-center text-[1rem] font-bold text-slate-900">
              Seek medical advice
            </div>
            <p className="bg-[#FFF4EA] px-4 py-4 text-[1.02rem] leading-relaxed text-slate-900">
              If I’m not sure what to do, I’ll call a healthcare professional from my list of contacts
            </p>
          </button>
          <div className="bg-[#FFF4EA] px-4 pb-4">
            <button
              type="button"
              onClick={() => navigate("/contacts#healthcare-professional")}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[1rem] bg-white px-4 text-[0.95rem] font-semibold text-[#9B4E10] shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
            >
              <Stethoscope className="h-4 w-4" />
              Healthcare professional contact
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedOutcome("emergency_care")}
            className={`block w-full text-left transition ${
              selectedOutcome === "emergency_care" ? "ring-2 ring-inset ring-[#319A50]" : ""
            }`}
          >
            <div className="bg-[#F45A1F] px-4 py-2 text-center text-[1rem] font-bold text-slate-900">
              Seek emergency care
            </div>
            <p className="bg-[#FFE7DE] px-4 py-4 text-[1.02rem] leading-relaxed text-slate-900">
              If I feel extremely unwell, I’ll dial 000 for an ambulance.
            </p>
          </button>
          <div className="bg-[#FFE7DE] px-4 pb-4">
            <a
              href="tel:000"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[1rem] bg-[#F45A1F] px-4 text-[0.95rem] font-semibold text-white shadow-[0_18px_40px_-28px_rgba(244,90,31,0.72)] transition active:scale-[0.98]"
            >
              <PhoneCall className="h-4 w-4" />
              Call 000
            </a>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <SecondaryButton onClick={() => navigate(runtime ? "/episode" : "/")}>
          {runtime ? "Back to my plan" : "Back home"}
        </SecondaryButton>
        <PrimaryButton onClick={continueToReview} disabled={!canContinue} className="justify-between">
          <span>{canContinue ? "Plan for next time" : "Choose one"}</span>
          <ArrowRight className="h-5 w-5" />
        </PrimaryButton>
      </div>
    </AppFrame>
  );
}
