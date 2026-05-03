import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, MapPin, Calendar, Locate, Check } from "lucide-react";

export default function MyInfo() {
  const navigate = useNavigate();
  const [locationInput, setLocationInput] = useState("");
  const [locationSaved, setLocationSaved] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("breathe_location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocationInput(parsed.name || "");
      } catch {}
    }
  }, []);

  const saveLocation = async (name: string, lat?: number, lon?: number) => {
    // If we have a name but no coords, geocode it
    if (name && lat === undefined) {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`
        );
        const json = await res.json();
        if (json.results?.[0]) {
          lat = json.results[0].latitude;
          lon = json.results[0].longitude;
          name = json.results[0].name + (json.results[0].admin1 ? `, ${json.results[0].admin1}` : "");
          setLocationInput(name);
        }
      } catch {}
    }
    localStorage.setItem(
      "breathe_location",
      JSON.stringify({ name, lat, lon })
    );
    setLocationSaved(true);
    setTimeout(() => setLocationSaved(false), 2000);
  };

  const detectLocation = () => {
    if (!("geolocation" in navigator)) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=&count=1`
          );
          // Use reverse approach via open-meteo timezone
          const geoRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto`
          );
          const geoJson = await geoRes.json();
          const cityName = geoJson.timezone?.split("/").pop()?.replace(/_/g, " ") || "Your Location";
          setLocationInput(cityName);
          saveLocation(cityName, latitude, longitude);
        } catch {
          setLocationInput("Your Location");
          saveLocation("Your Location", latitude, longitude);
        }
        setDetectingLocation(false);
      },
      () => setDetectingLocation(false),
      { timeout: 5000 }
    );
  };

  // Mock user data
  const userInfo = {
    name: "John Smith",
    age: 68,
    phone: "0412 345 678",
    address: "123 Main Street, Sydney NSW 2000",
    diagnosis: "COPD - Moderate",
    doctorName: "Dr. Sarah Johnson",
    doctorPhone: "02 9876 5432",
    medications: [
      "Reliever inhaler (blue) - As needed",
      "Preventer inhaler (brown) - Twice daily",
    ],
  };

  return (
    <div className="min-h-[100dvh] bg-white max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-[#5A8BAF] text-white p-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center active:opacity-70"
        >
          <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
        </button>
        <h1 className="text-[36px] font-bold leading-[1.5]">My Info</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Location */}
        <div className="bg-green-50 rounded-2xl p-6 border-2 border-[#319A50]/20">
          <div className="flex items-center mb-4">
            <MapPin className="w-8 h-8 text-[#319A50] mr-3" strokeWidth={2.5} />
            <h2 className="text-[28px] font-bold text-[#222222]">My Location</h2>
          </div>
          <p className="text-[16px] text-gray-500 mb-4">
            Used for weather, air quality & fire risk on your home screen.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter city or suburb..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="flex-1 text-[20px] px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#319A50] focus:outline-none bg-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => saveLocation(locationInput)}
              disabled={!locationInput.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#319A50] text-white text-[18px] font-semibold active:bg-[#2a8543] disabled:opacity-40 transition-all"
            >
              {locationSaved ? (
                <>
                  <Check className="w-5 h-5" /> Saved!
                </>
              ) : (
                "Save Location"
              )}
            </button>
            <button
              onClick={detectLocation}
              disabled={detectingLocation}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-[18px] font-semibold active:bg-gray-200 transition-all"
            >
              <Locate className={`w-5 h-5 ${detectingLocation ? "animate-spin" : ""}`} />
              {detectingLocation ? "..." : "Detect"}
            </button>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <User className="w-8 h-8 text-[#5A8BAF] mr-3" strokeWidth={2.5} />
            <h2 className="text-[28px] font-bold text-[#222222]">Personal</h2>
          </div>
          <div className="space-y-3">
            <InfoRow label="Name" value={userInfo.name} />
            <InfoRow label="Age" value={userInfo.age.toString()} />
            <InfoRow label="Diagnosis" value={userInfo.diagnosis} />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Phone className="w-8 h-8 text-[#5A8BAF] mr-3" strokeWidth={2.5} />
            <h2 className="text-[28px] font-bold text-[#222222]">Contact</h2>
          </div>
          <div className="space-y-3">
            <InfoRow label="Phone" value={userInfo.phone} />
            <InfoRow label="Address" value={userInfo.address} />
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-8 h-8 text-[#5A8BAF] mr-3" strokeWidth={2.5} />
            <h2 className="text-[28px] font-bold text-[#222222]">My Doctor</h2>
          </div>
          <div className="space-y-3">
            <InfoRow label="Name" value={userInfo.doctorName} />
            <InfoRow label="Phone" value={userInfo.doctorPhone} />
          </div>
        </div>

        {/* Medications */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h2 className="text-[28px] font-bold text-[#222222] mb-4">Medications</h2>
          <div className="space-y-3">
            {userInfo.medications.map((med, index) => (
              <div key={index} className="text-[24px] text-[#222222] leading-[1.5]">
                • {med}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[20px] text-gray-600 mb-1">{label}</div>
      <div className="text-[24px] text-[#222222] leading-[1.5]">{value}</div>
    </div>
  );
}
