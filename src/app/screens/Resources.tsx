import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowUpRight,
  Camera,
  ChevronRight,
  Download,
  Eye,
  FileImage,
  ListChecks,
  RefreshCcw,
  Siren,
  Trash2,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { AppFrame, FooterNav, PageHeader, PrimaryButton, Surface } from "../components/AppChrome";
import { useAppState } from "../state/AppState";
import type { CopdActionPlan, CopdActionPlanImage } from "../model/types";

const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/8MAv8u_qyi8";
const HOW_TO_USE_PLAN_URL = "https://www.uts.edu.au/contentassets/053603386dca4df78a0250fb8532c870/v5_draft-user-guide-for-breathlessness-episode-recovery-plan_feasibility-testing_05022026.pdf";
const COPD_ACTION_PLAN_URL = "https://lungfoundation.com.au/resources/copd-action-plan/";
const PULMONARY_REHAB_URL = "https://lungfoundation.com.au/find-a-service/pulmonary-rehabilitation/?service-card=3";
const CARER_GATEWAY_URL = "https://www.carergateway.gov.au/";
const SUPPORTING_BREATHLESSNESS_URL = "https://supporting-breathlessness.org.uk/";
const MAX_PLAN_IMAGE_EDGE = 1400;
const PLAN_IMAGE_QUALITY = 0.74;

type CopdPlanSide = "front" | "back";

const SIDE_LABELS: Record<CopdPlanSide, string> = {
  front: "Front",
  back: "Back",
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("The selected file could not be read."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("The selected file could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be loaded."));
    image.src = dataUrl;
  });
}

async function compressPlanImage(file: File): Promise<CopdActionPlanImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, MAX_PLAN_IMAGE_EDGE / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("This browser could not prepare the image.");
  }

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", PLAN_IMAGE_QUALITY),
    capturedAt: new Date().toISOString(),
    fileName: file.name || null,
    mimeType: "image/jpeg",
  };
}

function formatCapturedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Saved";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function downloadFileName(side: CopdPlanSide, image: CopdActionPlanImage) {
  const datePart = image.capturedAt.slice(0, 10) || "saved";

  return `copd-plan-${side}-${datePart}.jpg`;
}

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

function CopdPlanSideCard({
  side,
  image,
  isProcessing,
  onCapture,
}: {
  side: CopdPlanSide;
  image: CopdActionPlanImage | null;
  isProcessing: boolean;
  onCapture: (side: CopdPlanSide) => void;
}) {
  const label = SIDE_LABELS[side];

  return (
    <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.98rem] font-semibold text-slate-900">{label}</p>
        {image && <p className="text-[0.78rem] font-semibold text-slate-400">{formatCapturedAt(image.capturedAt)}</p>}
      </div>
      <div className="mt-3 flex min-h-[150px] items-center justify-center overflow-hidden rounded-[0.9rem] bg-white ring-1 ring-black/5">
        {image ? (
          <img
            src={image.dataUrl}
            alt={`COPD Plan ${label.toLowerCase()}`}
            className="h-full max-h-[220px] w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center px-4 py-8 text-center text-slate-400">
            <FileImage className="h-8 w-8" />
            <p className="mt-2 text-[0.9rem] font-semibold">{label} photo needed</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onCapture(side)}
        disabled={isProcessing}
        className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[0.95rem] bg-white px-4 text-[0.92rem] font-semibold text-[#236A3D] shadow-sm ring-1 ring-black/5 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
      >
        {image ? <RefreshCcw className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        {isProcessing ? "Saving..." : image ? `Replace ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
      </button>
    </div>
  );
}

function CopdPlanViewer({ plan, onClose }: { plan: CopdActionPlan; onClose: () => void }) {
  const [activeSide, setActiveSide] = useState<CopdPlanSide>("front");
  const activeImage = plan[activeSide];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!activeImage) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/72 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="COPD Plan"
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[1.02rem] font-semibold text-slate-900">COPD Plan</p>
            <p className="text-[0.82rem] font-semibold text-slate-400">{SIDE_LABELS[activeSide]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition active:scale-[0.96]"
            aria-label="Close COPD Plan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 py-3">
          {(["front", "back"] as CopdPlanSide[]).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => setActiveSide(side)}
              className={`min-h-[42px] rounded-[0.9rem] text-[0.9rem] font-semibold transition ${
                activeSide === side ? "bg-[#319A50] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {SIDE_LABELS[side]}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3">
          <img
            src={activeImage.dataUrl}
            alt={`COPD Plan ${SIDE_LABELS[activeSide].toLowerCase()}`}
            className="mx-auto max-h-[70dvh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default function Resources() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, actions } = useAppState();
  const copdPlanSectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSideRef = useRef<CopdPlanSide>("front");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const plan = data.copdActionPlan;
  const hasFrontAndBack = Boolean(plan.front && plan.back);
  const hasAnyPhoto = Boolean(plan.front || plan.back);

  useEffect(() => {
    if (location.hash !== "#copd-action-plan") return;

    window.setTimeout(() => {
      copdPlanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      copdPlanSectionRef.current?.focus({ preventScroll: true });
    }, 80);
  }, [location.hash]);

  const promptForPlanPhoto = (side: CopdPlanSide) => {
    setErrorMessage("");
    pendingSideRef.current = side;
    fileInputRef.current?.click();
  };

  const handlePlanPhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const side = pendingSideRef.current;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const image = await compressPlanImage(file);
      actions.updateCopdActionPlan({
        ...data.copdActionPlan,
        [side]: image,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "That photo could not be saved.");
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePlan = () => {
    if (!hasAnyPhoto) return;
    if (!window.confirm("Delete the saved front and back COPD Plan photos?")) return;

    actions.clearCopdActionPlan();
    setViewerOpen(false);
  };

  return (
    <AppFrame withNav>
      <PageHeader
        title="Guides & Resources"
        subtitle="Videos, support links, and everyday lists you can use inside the app."
      />

      <div className="space-y-5">
        <Surface id="copd-action-plan" ref={copdPlanSectionRef} tabIndex={-1}>
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#319A50]/10 text-[#319A50]">
              <FileImage className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[1.05rem] font-semibold text-slate-900">Add COPD Plan</p>
              <p className="mt-1 text-[0.92rem] leading-relaxed text-slate-500">
                {hasFrontAndBack
                  ? "Your front and back COPD Plan photos are saved here."
                  : "Take or upload the front and back photos of your COPD Plan."}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePlanPhotoSelected}
          />

          <div className="mt-4 grid gap-3">
            <CopdPlanSideCard
              side="front"
              image={plan.front}
              isProcessing={isProcessing}
              onCapture={promptForPlanPhoto}
            />
            <CopdPlanSideCard
              side="back"
              image={plan.back}
              isProcessing={isProcessing}
              onCapture={promptForPlanPhoto}
            />
          </div>

          {errorMessage && (
            <p className="mt-3 rounded-[0.9rem] bg-red-50 px-3 py-2 text-[0.9rem] font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {hasFrontAndBack ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <PrimaryButton type="button" onClick={() => setViewerOpen(true)} className="col-span-2 min-h-[50px] py-3">
                <Eye className="h-4 w-4" />
                View
              </PrimaryButton>
              {plan.front && (
                <a
                  href={plan.front.dataUrl}
                  download={downloadFileName("front", plan.front)}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[1rem] bg-white px-3 text-center text-[0.88rem] font-semibold text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  Download front
                </a>
              )}
              {plan.back && (
                <a
                  href={plan.back.dataUrl}
                  download={downloadFileName("back", plan.back)}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[1rem] bg-white px-3 text-center text-[0.88rem] font-semibold text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  Download back
                </a>
              )}
              <button
                type="button"
                onClick={deletePlan}
                className="col-span-2 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[1rem] bg-red-50 px-4 text-[0.92rem] font-semibold text-red-700 ring-1 ring-red-100 transition active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : (
            <p className="mt-4 rounded-[1rem] bg-[#EAF6DD] px-4 py-3 text-[0.92rem] font-semibold leading-relaxed text-[#236A3D]">
              Add both the front and back before this plan appears in Next Steps.
            </p>
          )}
        </Surface>

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

      {viewerOpen && hasFrontAndBack && <CopdPlanViewer plan={plan} onClose={() => setViewerOpen(false)} />}

      <FooterNav />
    </AppFrame>
  );
}
