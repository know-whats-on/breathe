import { useNavigate } from "react-router";
import { useState } from "react";
import { CheckCircle, Home } from "lucide-react";

const TRIGGERS = [
  "Walking",
  "Showering",
  "Dressing",
  "Stairs",
  "Weather",
  "Stress",
  "Other",
];

export default function PostEpisodeLog() {
  const navigate = useNavigate();
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!selectedTrigger) return;

    // Save to localStorage
    const logs = JSON.parse(localStorage.getItem("breathe-logs") || "[]");
    logs.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      trigger: selectedTrigger,
    });
    localStorage.setItem("breathe-logs", JSON.stringify(logs));

    setSaved(true);
  };

  if (saved) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-white to-green-50 p-4 sm:p-6 max-w-lg mx-auto">
        <CheckCircle className="w-24 h-24 text-[#78B382] mb-8" strokeWidth={2.5} />
        <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-4 text-center">
          Episode Logged
        </h1>
        <p className="text-[24px] text-[#222222] leading-[1.5] mb-12 text-center">
          Great job managing your breathing
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full max-w-md h-20 rounded-2xl bg-[#78B382] text-white flex items-center justify-center shadow-lg active:bg-[#6a9f73] transition-colors"
          style={{ minHeight: "60px" }}
        >
          <Home className="w-8 h-8 mr-4" strokeWidth={2.5} />
          <span className="text-[32px] font-bold">Return Home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-white to-green-50 p-4 sm:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-4">
          Great Job!
        </h1>
        <p className="text-[24px] text-[#222222] leading-[1.5]">
          What triggered this episode?
        </p>
      </div>

      {/* Trigger Selection */}
      <div className="flex-1 grid grid-cols-2 gap-4 content-start">
        {TRIGGERS.map((trigger) => (
          <button
            key={trigger}
            onClick={() => setSelectedTrigger(trigger)}
            className={`h-24 rounded-2xl text-white text-[24px] font-bold shadow-md transition-colors ${
              selectedTrigger === trigger
                ? "bg-[#78B382] ring-4 ring-[#78B382] ring-opacity-50"
                : "bg-[#5A8BAF] active:bg-[#4e7a9a]"
            }`}
            style={{ minHeight: "60px" }}
          >
            {trigger}
          </button>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!selectedTrigger}
        className={`w-full h-20 rounded-2xl text-white text-[32px] font-bold shadow-lg transition-colors mt-8 ${
          selectedTrigger
            ? "bg-[#78B382] active:bg-[#6a9f73]"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        style={{ minHeight: "60px" }}
      >
        Save Episode
      </button>
    </div>
  );
}