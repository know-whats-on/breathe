import { useNavigate } from "react-router";
import EpisodeLayout from "../components/EpisodeLayout";

export default function StepPosition() {
  const navigate = useNavigate();

  return (
    <EpisodeLayout
      highlightedFinger={2}
      onNext={() => navigate("/episode/fan")}
      onBack={() => navigate("/episode/stop")}
      speakText="Step 2. Position. Find a resting position. Lean forward with your arms supported."
    >
      <div className="text-center">
        <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-8">
          POSITION
        </h1>
        <p className="text-[24px] text-[#222222] leading-[1.5] mb-8">
          Find a resting position
        </p>

        {/* Silhouette illustration */}
        <div className="flex justify-center">
          <svg width="200" height="150" viewBox="0 0 200 150" className="text-[#78B382]">
            <circle cx="100" cy="40" r="15" fill="currentColor" opacity="0.7" />
            <ellipse cx="100" cy="80" rx="20" ry="35" fill="currentColor" opacity="0.7" transform="rotate(15 100 80)" />
            <line x1="90" y1="70" x2="60" y2="100" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
            <line x1="110" y1="70" x2="140" y2="100" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
            <line x1="40" y1="100" x2="160" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </EpisodeLayout>
  );
}
