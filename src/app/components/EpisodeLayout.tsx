import { useNavigate } from "react-router";
import { X, HandHelping, Volume2, VolumeX, ChevronLeft, ChevronRight, Phone, FileText, UserRound, Siren } from "lucide-react";
import { ReactNode, useState, useEffect, useCallback } from "react";
import DoYourFiveHandImage from "./DoYourFiveHandImage";

interface EpisodeLayoutProps {
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  showNext?: boolean;
  showBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
  highlightedFinger?: 1 | 2 | 3 | 4 | 5;
  speakText?: string;
}

// Global mute state persisted across steps
let globalMuted = false;

// Mock user data for assistance modal
const MOCK_ACTION_PLAN = {
  zone: "Yellow - Caution",
  medications: "Salbutamol 2 puffs, Prednisolone 25mg",
  instructions: "Use reliever inhaler. Rest in upright position. If no improvement in 20 mins, call GP.",
};

const MOCK_EMERGENCY_CONTACT = {
  name: "Margaret Smith",
  relationship: "Daughter",
  phone: "0412 345 678",
};

const MOCK_GP = {
  name: "Dr. Sarah Chen",
  clinic: "Greenvalley Medical Centre",
  phone: "03 9876 5432",
};

export default function EpisodeLayout({
  children,
  onNext,
  onBack,
  showNext = true,
  showBack = true,
  nextLabel = "NEXT",
  backLabel = "BACK",
  highlightedFinger,
  speakText,
}: EpisodeLayoutProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(globalMuted);
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (muted || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.lang = "en-AU";
      window.speechSynthesis.speak(utterance);
    },
    [muted]
  );

  useEffect(() => {
    if (speakText && !muted) {
      // Small delay to let the page render first
      const t = setTimeout(() => speak(speakText), 300);
      return () => {
        clearTimeout(t);
        window.speechSynthesis.cancel();
      };
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [speakText, muted, speak]);

  const toggleMute = () => {
    const next = !muted;
    globalMuted = next;
    setMuted(next);
    if (next) {
      window.speechSynthesis.cancel();
    } else if (speakText) {
      setTimeout(() => speak(speakText), 100);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-white to-green-50 max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="p-4 sm:p-6 flex items-start justify-between relative z-[60]">
        {/* Left: Assistance + Speaker */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowAssistanceModal(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#5A8BAF] text-white active:bg-[#4e7a9a] transition-colors shadow-md"
            aria-label="Request assistance"
          >
            <HandHelping className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-[16px] font-bold">Assistance</span>
          </button>
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors shadow-md ${
              muted
                ? "bg-gray-300 text-gray-600 active:bg-gray-400"
                : "bg-[#78B382] text-white active:bg-[#6a9f73]"
            }`}
            aria-label={muted ? "Unmute voice guidance" : "Mute voice guidance"}
          >
            {muted ? (
              <VolumeX className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <Volume2 className="w-6 h-6" strokeWidth={2.5} />
            )}
            <span className="text-[14px] font-bold">
              {muted ? "Unmute" : "Speaker"}
            </span>
          </button>
        </div>

        {/* Right: Exit */}
        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            navigate("/");
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center active:bg-gray-300 transition-colors"
          aria-label="Exit recovery mode"
        >
          <X className="w-8 h-8 text-[#222222]" strokeWidth={3} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Hand Illustration */}
        {highlightedFinger && (
          <div className="mb-4 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <DoYourFiveHandImage
              highlightedFinger={highlightedFinger}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center w-full">
          {children}
        </div>

        {/* Back + Next Buttons */}
        {(showBack || showNext) && (
          <div className="flex gap-3 w-full relative z-[60]">
            {showBack && onBack && (
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  onBack();
                }}
                className="flex-1 h-16 sm:h-20 rounded-2xl bg-gray-300 text-[#222222] text-[24px] sm:text-[30px] font-bold shadow-lg active:bg-gray-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{ minHeight: "56px" }}
              >
                <ChevronLeft className="w-7 h-7" strokeWidth={3} />
                {backLabel}
              </button>
            )}
            {showNext && onNext && (
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  onNext();
                }}
                className="flex-1 h-16 sm:h-20 rounded-2xl bg-[#78B382] text-white text-[24px] sm:text-[30px] font-bold shadow-lg active:bg-[#6a9f73] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{ minHeight: "56px" }}
              >
                {nextLabel}
                <ChevronRight className="w-7 h-7" strokeWidth={3} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assistance Modal */}
      {showAssistanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl max-h-[90dvh] flex flex-col">
            {/* Header */}
            <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-[24px] font-bold text-[#222222]">
                Assistance
              </h2>
              <button
                onClick={() => setShowAssistanceModal(false)}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-[#222222]" strokeWidth={3} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* COPD Action Plan */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
                  <p className="text-[18px] font-bold text-amber-800">COPD Action Plan</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    <p className="text-[15px] text-gray-800">
                      <span className="font-bold">Zone:</span> {MOCK_ACTION_PLAN.zone}
                    </p>
                  </div>
                  <p className="text-[15px] text-gray-800">
                    <span className="font-bold">Medications:</span> {MOCK_ACTION_PLAN.medications}
                  </p>
                  <p className="text-[15px] text-gray-800">
                    <span className="font-bold">Instructions:</span> {MOCK_ACTION_PLAN.instructions}
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-6 h-6 text-[#5A8BAF]" strokeWidth={2.5} />
                  <p className="text-[18px] font-bold text-[#222222]">Emergency Contact</p>
                </div>
                <p className="text-[16px] text-gray-800 mb-1">
                  {MOCK_EMERGENCY_CONTACT.name} ({MOCK_EMERGENCY_CONTACT.relationship})
                </p>
                <a
                  href={`tel:${MOCK_EMERGENCY_CONTACT.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 mt-2 px-4 py-3 rounded-xl bg-[#5A8BAF] text-white font-bold text-[16px] active:bg-[#4e7a9a] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call {MOCK_EMERGENCY_CONTACT.phone}
                </a>
              </div>

              {/* Preferred GP */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserRound className="w-6 h-6 text-[#319A50]" strokeWidth={2.5} />
                  <p className="text-[18px] font-bold text-[#222222]">Preferred GP</p>
                </div>
                <p className="text-[16px] text-gray-800 font-semibold">{MOCK_GP.name}</p>
                <p className="text-[15px] text-gray-600 mb-2">{MOCK_GP.clinic}</p>
                <a
                  href={`tel:${MOCK_GP.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#319A50] text-white font-bold text-[16px] active:bg-[#2a8543] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call {MOCK_GP.phone}
                </a>
              </div>
            </div>

            {/* Emergency Call Button - always visible at bottom */}
            <div className="p-5 pt-3 border-t border-gray-100">
              <a
                href="tel:000"
                className="w-full h-16 rounded-2xl bg-[#DC2626] text-white text-[22px] font-bold flex items-center justify-center gap-3 shadow-lg active:bg-[#B91C1C] transition-colors"
              >
                <Siren className="w-8 h-8" strokeWidth={2.5} />
                Call 000 — Emergency
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
