import { useNavigate } from "react-router";
import EpisodeLayout from "../components/EpisodeLayout";
import { Wind } from "lucide-react";

export default function StepFan() {
  const navigate = useNavigate();

  return (
    <EpisodeLayout
      highlightedFinger={3}
      onNext={() => navigate("/episode/breathe")}
      onBack={() => navigate("/episode/position")}
      speakText="Step 3. Fan. Use your fan or feel the breeze on your face."
    >
      <div className="text-center">
        <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-8">
          FAN
        </h1>
        <Wind className="w-24 h-24 mx-auto mb-8 text-[#78B382]" strokeWidth={2} />
        <p className="text-[24px] text-[#222222] leading-[1.5]">
          Use your fan or the breeze
        </p>
      </div>
    </EpisodeLayout>
  );
}
