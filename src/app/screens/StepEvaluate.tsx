import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import EpisodeLayout from "../components/EpisodeLayout";
import { CheckCircle, XCircle } from "lucide-react";

export default function StepEvaluate() {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [timerComplete, setTimerComplete] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setTimerComplete(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!timerComplete) {
    return (
      <EpisodeLayout
        highlightedFinger={5}
        showNext={false}
        onBack={() => navigate("/episode/breathe")}
        speakText="Step 5. Evaluate. Take a moment to rest. Continue breathing slowly and calmly."
      >
        <div className="text-center">
          <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-8">
            EVALUATE
          </h1>
          <p className="text-[24px] text-[#222222] leading-[1.5] mb-12">
            Take a moment to rest
          </p>

          <div className="mb-8">
            <div className="w-48 h-48 mx-auto rounded-full border-8 border-[#78B382] flex items-center justify-center">
              <span className="text-[48px] font-bold text-[#222222]">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          <p className="text-[20px] text-gray-600">
            Continue breathing slowly and calmly
          </p>
        </div>
      </EpisodeLayout>
    );
  }

  return (
    <EpisodeLayout
      highlightedFinger={5}
      showNext={false}
      showBack={false}
      speakText="Are you feeling less breathless? Tap Yes if you feel better, or No if you need more help."
    >
      <div className="text-center w-full">
        <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-8">
          EVALUATE
        </h1>
        <p className="text-[24px] text-[#222222] leading-[1.5] mb-8">
          Are you feeling less breathless?
        </p>

        <div className="space-y-5 mb-8">
          <button
            onClick={() => navigate("/post-episode-log")}
            className="w-full h-20 rounded-2xl bg-[#78B382] text-white flex items-center justify-center shadow-lg active:bg-[#6a9f73] transition-colors"
          >
            <CheckCircle className="w-9 h-9 mr-3" strokeWidth={2.5} />
            <span className="text-[28px] font-bold">Yes, I am better</span>
          </button>

          <button
            onClick={() => navigate("/escalation")}
            className="w-full h-20 rounded-2xl bg-[#5A8BAF] text-white flex items-center justify-center shadow-lg active:bg-[#4e7a9a] transition-colors"
          >
            <XCircle className="w-9 h-9 mr-3" strokeWidth={2.5} />
            <span className="text-[28px] font-bold">No, I need more help</span>
          </button>
        </div>

        {/* Back / Finish buttons */}
        <div className="flex gap-3 w-full relative z-[60]">
          <button
            onClick={() => navigate("/episode/breathe")}
            className="flex-1 h-16 sm:h-20 rounded-2xl bg-gray-300 text-[#222222] text-[24px] sm:text-[30px] font-bold shadow-lg active:bg-gray-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            BACK
          </button>
          <button
            onClick={() => navigate("/post-episode-log")}
            className="flex-1 h-16 sm:h-20 rounded-2xl bg-[#319A50] text-white text-[24px] sm:text-[30px] font-bold shadow-lg active:bg-[#2a8543] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            FINISH
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </EpisodeLayout>
  );
}
