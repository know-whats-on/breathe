import { useNavigate } from "react-router";
import { Phone, AlertCircle } from "lucide-react";

export default function Escalation() {
  const navigate = useNavigate();

  const handleEmergencyCall = () => {
    window.location.href = "tel:000";
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-white to-orange-50 p-4 sm:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <AlertCircle className="w-20 h-20 mx-auto mb-6 text-[#E88C5D]" strokeWidth={2.5} />
        <h1 className="text-[36px] font-bold text-[#222222] leading-[1.5] mb-4">
          Action Required
        </h1>
      </div>

      {/* Instructions */}
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <p className="text-[24px] text-[#222222] leading-[1.5] text-center">
            Take your prescribed reliever inhaler medication through a spacer
          </p>
        </div>

        {/* Emergency Actions */}
        <div className="space-y-4">
          <button
            onClick={handleEmergencyCall}
            className="w-full h-24 rounded-2xl bg-[#E88C5D] text-white flex items-center justify-center shadow-lg active:bg-[#d77a4f] transition-colors"
            style={{ minHeight: "60px" }}
          >
            <Phone className="w-10 h-10 mr-4" strokeWidth={2.5} />
            <span className="text-[32px] font-bold">Call 000</span>
          </button>

          <button
            onClick={handleEmergencyCall}
            className="w-full h-24 rounded-2xl bg-[#5A8BAF] text-white flex items-center justify-center shadow-lg active:bg-[#4e7a9a] transition-colors"
            style={{ minHeight: "60px" }}
          >
            <Phone className="w-10 h-10 mr-4" strokeWidth={2.5} />
            <span className="text-[32px] font-bold">Call My Doctor</span>
          </button>
        </div>
      </div>

      {/* Return Home */}
      <button
        onClick={() => navigate("/")}
        className="w-full h-16 rounded-2xl bg-gray-200 text-[#222222] text-[24px] font-bold active:bg-gray-300 transition-colors mt-8"
        style={{ minHeight: "60px" }}
      >
        Return Home
      </button>
    </div>
  );
}