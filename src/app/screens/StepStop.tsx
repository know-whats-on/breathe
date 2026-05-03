import { useNavigate } from "react-router";
import EpisodeLayout from "../components/EpisodeLayout";

export default function StepStop() {
  const navigate = useNavigate();

  return (
    <EpisodeLayout
      highlightedFinger={1}
      onNext={() => navigate("/episode/position")}
      showBack={false}
      speakText="Step 1. Stop. Stop what you are doing."
    >
      <div className="text-center">
        <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-4">
          STOP
        </h1>
        <p className="text-[24px] text-[#222222] leading-[1.5]">
          Stop what you are doing
        </p>
      </div>
    </EpisodeLayout>
  );
}
