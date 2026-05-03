import { ArrowRight, CheckCircle2, ClipboardList, House } from "lucide-react";
import { useNavigate } from "react-router";
import { AppFrame, PrimaryButton, SecondaryButton, Surface } from "../components/AppChrome";

export default function PracticeSummary() {
  const navigate = useNavigate();

  return (
    <AppFrame tone="calm">
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="mx-auto flex w-full max-w-[22rem] flex-col items-center text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#319A50]/12 text-[#319A50]">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <p className="mt-6 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
            Practice complete
          </p>
          <h1 className="mt-3 text-[2.35rem] font-bold leading-[0.98] text-slate-900">
            You practised your plan
          </h1>
          <p className="mt-4 text-[1rem] leading-relaxed text-slate-500">
            This was a simulation, so it has not been added to your Episode Diary. You can go Home now or review your
            personalised plan again.
          </p>

          <Surface className="mt-6 w-full text-left">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-1 h-5 w-5 text-[#319A50]" />
              <p className="text-[0.95rem] leading-relaxed text-slate-600">
                Practising while calm helps your steps feel more familiar when you need them for real.
              </p>
            </div>
          </Surface>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <PrimaryButton onClick={() => navigate("/", { replace: true })} className="justify-between">
          <span>Return Home</span>
          <House className="h-5 w-5" />
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate("/plan")} className="justify-between">
          <span>View My Plan</span>
          <ArrowRight className="h-5 w-5" />
        </SecondaryButton>
      </div>
    </AppFrame>
  );
}
