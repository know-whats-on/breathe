import { ArrowUpRight, ChevronRight, ListChecks, Siren } from "lucide-react";
import { useNavigate } from "react-router";
import { AppFrame, FooterNav, PageHeader, Surface } from "../components/AppChrome";

const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/8MAv8u_qyi8";
const HOW_TO_USE_PLAN_URL = "https://www.uts.edu.au/contentassets/053603386dca4df78a0250fb8532c870/v5_draft-user-guide-for-breathlessness-episode-recovery-plan_feasibility-testing_05022026.pdf";
const COPD_ACTION_PLAN_URL = "https://lungfoundation.com.au/resources/copd-action-plan/";
const PULMONARY_REHAB_URL = "https://lungfoundation.com.au/find-a-service/pulmonary-rehabilitation/?service-card=3";
const CARER_GATEWAY_URL = "https://www.carergateway.gov.au/";
const SUPPORTING_BREATHLESSNESS_URL = "https://supporting-breathlessness.org.uk/";

function InternalResourceCard({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: typeof ListChecks;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[1.1rem] bg-slate-50 px-4 py-4 text-left transition active:scale-[0.985]"
    >
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-[#319A50]/10 text-[#319A50]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.98rem] font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-slate-500">{description}</p>
      </div>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
    </button>
  );
}

function ExternalResourceCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-start gap-3 rounded-[1.1rem] bg-slate-50 px-4 py-4 transition active:scale-[0.985]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[0.98rem] font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-slate-500">{description}</p>
      </div>
      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
    </a>
  );
}

export default function Resources() {
  const navigate = useNavigate();

  return (
    <AppFrame withNav>
      <PageHeader
        title="Guides & Resources"
        subtitle="Videos, support links, and everyday lists you can use inside the app."
      />

      <div className="space-y-5">
        <Surface>
          <p className="text-[1.05rem] font-semibold text-slate-900">
            Guide to creating a Breathlessness Recovery Plan
          </p>
          <div className="mt-4 overflow-hidden rounded-[1.3rem] bg-slate-950 shadow-[0_24px_50px_-32px_rgba(15,23,42,0.55)]">
            <div className="relative aspect-video w-full">
              <iframe
                src={YOUTUBE_EMBED_URL}
                title="Guide to creating a Breathlessness Recovery Plan"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </Surface>

        <Surface>
          <p className="text-[1.05rem] font-semibold text-slate-900">How to use ypur Breathlessness Recovery Plan</p>
          <div className="mt-4">
            <ExternalResourceCard
              title="How to use ypur Breathlessness Recovery Plan"
              description="Open the PDF guide for using your Breathlessness Recovery Plan."
              href={HOW_TO_USE_PLAN_URL}
            />
          </div>
        </Surface>

        <Surface>
          <p className="text-[1.05rem] font-semibold text-slate-900">Useful Lists</p>
          <div className="mt-4 space-y-3">
            <InternalResourceCard
              title="My Triggers"
              description="Review and update the triggers that tend to make breathlessness harder."
              icon={Siren}
              onClick={() => navigate("/triggers")}
            />
            <InternalResourceCard
              title="Self-Checklist"
              description="Edit the checklist used from the Think step when you press the self-check pill."
              icon={ListChecks}
              onClick={() => navigate("/self-checklist")}
            />
          </div>
        </Surface>

        <Surface>
          <p className="text-[1.05rem] font-semibold text-slate-900">Lung Foundation COPD Action Plan</p>
          <div className="mt-4">
            <ExternalResourceCard
              title="Open the Lung Foundation COPD Action Plan"
              description="Use your medication-based COPD Action Plan if you have flare-up symptoms."
              href={COPD_ACTION_PLAN_URL}
            />
          </div>
        </Surface>

        <Surface>
          <p className="text-[1.05rem] font-semibold text-slate-900">Find pulmonary rehabilitation</p>
          <div className="mt-4">
            <ExternalResourceCard
              title="Find pulmonary rehabilitation"
              description="Locate a program near you."
              href={PULMONARY_REHAB_URL}
            />
          </div>
        </Surface>

        <Surface>
          <p className="text-[1.05rem] font-semibold text-slate-900">Resources for Support Persons</p>
          <div className="mt-4 space-y-3">
            <ExternalResourceCard
              title="Carer Gateway"
              description="Emotional and practical support for carers."
              href={CARER_GATEWAY_URL}
            />
            <ExternalResourceCard
              title="Supporting Breathlessness"
              description="Guidance for people supporting someone with breathlessness."
              href={SUPPORTING_BREATHLESSNESS_URL}
            />
          </div>
        </Surface>
      </div>

      <FooterNav />
    </AppFrame>
  );
}
