import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
  AlertTriangle,
  MapPin,
  Loader2,
  CloudFog,
  Thermometer,
  Droplets,
  ShieldCheck,
} from "lucide-react";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDeg: number;
  city: string;
  main: string;
  humidity: number;
}

interface AirQualityData {
  aqi: number;
  label: string;
  color: string;
  percent: number;
}

function getWindDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getHumidityInfo(h: number): { label: string; color: string } {
  if (h <= 30) return { label: "Low", color: "text-orange-500" };
  if (h <= 60) return { label: "Fair", color: "text-green-600" };
  return { label: "High", color: "text-blue-600" };
}

interface CopdAdvisory {
  message: string;
  bgColor: string;
  dotColor: string;
}

function getCopdAdvisories(
  weather: WeatherData,
  airQuality: AirQualityData | null,
  bushfireRisk: string
): CopdAdvisory[] {
  const advisories: CopdAdvisory[] = [];

  // High humidity
  if (weather.humidity > 60) {
    advisories.push({
      message: "Humidity is high — consider staying indoors and keeping your reliever handy.",
      bgColor: "bg-blue-50 border-blue-200",
      dotColor: "bg-blue-400",
    });
  }

  // Low humidity (dry air)
  if (weather.humidity < 25) {
    advisories.push({
      message: "Air is quite dry — stay hydrated and consider using a humidifier indoors.",
      bgColor: "bg-amber-50 border-amber-200",
      dotColor: "bg-amber-400",
    });
  }

  // Poor air quality
  if (airQuality && airQuality.aqi >= 3) {
    const severity = airQuality.aqi >= 4
      ? "Air quality is poor — best to stay indoors and keep windows closed if possible."
      : "Air quality is moderate — keep your reliever nearby if heading outside.";
    advisories.push({
      message: severity,
      bgColor: airQuality.aqi >= 4 ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200",
      dotColor: airQuality.aqi >= 4 ? "bg-red-400" : "bg-orange-400",
    });
  }

  // Extreme temperatures
  if (weather.temp >= 35) {
    advisories.push({
      message: "It's very hot today — stay cool, hydrate often, and avoid outdoor activity.",
      bgColor: "bg-red-50 border-red-200",
      dotColor: "bg-red-400",
    });
  } else if (weather.temp <= 5) {
    advisories.push({
      message: "Cold air can tighten airways — wrap a scarf over your nose and mouth outdoors.",
      bgColor: "bg-sky-50 border-sky-200",
      dotColor: "bg-sky-400",
    });
  }

  // High wind
  if (weather.windSpeed >= 30) {
    advisories.push({
      message: "Windy conditions may carry irritants — a calm indoor space may feel easier.",
      bgColor: "bg-gray-100 border-gray-300",
      dotColor: "bg-gray-400",
    });
  }

  // Bushfire risk
  if (bushfireRisk === "High" || bushfireRisk === "Extreme") {
    advisories.push({
      message: bushfireRisk === "Extreme"
        ? "Extreme fire risk — stay indoors, seal windows, and have your action plan ready."
        : "Fire risk is elevated — be aware of smoke and keep doors and windows closed.",
      bgColor: "bg-red-50 border-red-200",
      dotColor: "bg-red-400",
    });
  }

  return advisories;
}

function getAqiInfo(aqi: number): { label: "Good" | "Fair" | "Moderate" | "Poor" | "Very Poor" | "Unknown"; color: string; percent: number } {
  switch (aqi) {
    case 1:
      return { label: "Good", color: "text-green-600", percent: 90 };
    case 2:
      return { label: "Fair", color: "text-yellow-600", percent: 70 };
    case 3:
      return { label: "Moderate", color: "text-orange-500", percent: 50 };
    case 4:
      return { label: "Poor", color: "text-red-500", percent: 30 };
    case 5:
      return { label: "Very Poor", color: "text-red-700", percent: 10 };
    default:
      return { label: "Unknown", color: "text-gray-500", percent: 0 };
  }
}

function WeatherIcon({ main, className }: { main: string; className?: string }) {
  const props = { className: className || "w-8 h-8", strokeWidth: 2 };
  switch (main.toLowerCase()) {
    case "clear":
      return <Sun {...props} />;
    case "rain":
      return <CloudRain {...props} />;
    case "drizzle":
      return <CloudDrizzle {...props} />;
    case "thunderstorm":
      return <CloudLightning {...props} />;
    case "snow":
      return <CloudSnow {...props} />;
    case "mist":
    case "fog":
    case "haze":
      return <CloudFog {...props} />;
    default:
      return <Cloud {...props} />;
  }
}

// Mock data for demo (free APIs have rate limits / need keys)
const MOCK_WEATHER: WeatherData = {
  temp: 22,
  description: "Partly cloudy",
  icon: "02d",
  windSpeed: 12,
  windDeg: 225,
  city: "Melbourne",
  main: "Clouds",
  humidity: 60,
};

const MOCK_AQI: AirQualityData = {
  aqi: 2,
  label: "Fair",
  color: "text-yellow-600",
  percent: 70,
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [bushfireRisk, setBushfireRisk] = useState<string>("Low");

  useEffect(() => {
    async function fetchWeather(latitude: number, longitude: number, cityName?: string) {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&timezone=auto`
        );
        const weatherJson = await weatherRes.json();

        const current = weatherJson.current;
        const wmoCode = current.weather_code;
        const { main, description } = wmoToDescription(wmoCode);

        if (!cityName) {
          const geoRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto`
          );
          const geoJson = await geoRes.json();
          cityName = geoJson.timezone?.split("/").pop()?.replace(/_/g, " ") || "Your Location";
        }

        setWeather({
          temp: Math.round(current.temperature_2m),
          description,
          icon: "",
          windSpeed: Math.round(current.wind_speed_10m),
          windDeg: current.wind_direction_10m,
          city: cityName,
          main,
          humidity: current.relative_humidity_2m ?? 60,
        });

        const aqiRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi`
        );
        const aqiJson = await aqiRes.json();
        const eaqi = aqiJson.current?.european_aqi;
        if (eaqi !== undefined) {
          const level = eaqi <= 20 ? 1 : eaqi <= 40 ? 2 : eaqi <= 60 ? 3 : eaqi <= 80 ? 4 : 5;
          const info = getAqiInfo(level);
          const percent = Math.max(0, Math.min(100, Math.round(100 - eaqi)));
          setAirQuality({ aqi: level, ...info, percent });
        } else {
          setAirQuality(MOCK_AQI);
        }

        const temp = current.temperature_2m;
        const wind = current.wind_speed_10m;
        if (temp > 35 && wind > 30) setBushfireRisk("Extreme");
        else if (temp > 30 && wind > 20) setBushfireRisk("High");
        else if (temp > 25 && wind > 15) setBushfireRisk("Moderate");
        else setBushfireRisk("Low");
      } catch {
        setWeather(MOCK_WEATHER);
        setAirQuality(MOCK_AQI);
      }
      setLoading(false);
    }

    // Check for saved location first
    const savedLocation = localStorage.getItem("breathe_location");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        if (parsed.lat && parsed.lon) {
          fetchWeather(parsed.lat, parsed.lon, parsed.name);
          return;
        } else if (parsed.name) {
          // Geocode the saved name
          fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsed.name)}&count=1`)
            .then(r => r.json())
            .then(json => {
              if (json.results?.[0]) {
                fetchWeather(json.results[0].latitude, json.results[0].longitude, parsed.name);
              } else {
                fallbackToGeo();
              }
            })
            .catch(() => fallbackToGeo());
          return;
        }
      } catch {}
    }

    fallbackToGeo();

    function fallbackToGeo() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
          () => {
            setLocationError(true);
            setWeather(MOCK_WEATHER);
            setAirQuality(MOCK_AQI);
            setLoading(false);
          },
          { timeout: 5000 }
        );
      } else {
        setWeather(MOCK_WEATHER);
        setAirQuality(MOCK_AQI);
        setLoading(false);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-2xl p-4 flex items-center justify-center gap-2 text-gray-500 min-h-[60px]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-[16px]">Loading conditions...</span>
      </div>
    );
  }

  if (!weather) return null;

  const bushfireColor =
    bushfireRisk === "Extreme"
      ? "text-red-700"
      : bushfireRisk === "High"
      ? "text-red-500"
      : bushfireRisk === "Moderate"
      ? "text-orange-500"
      : "text-green-600";

  const humidityInfo = getHumidityInfo(weather.humidity);

  const advisories = getCopdAdvisories(weather, airQuality, bushfireRisk);

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl p-3 shadow-sm border border-gray-100">
      {/* Location header */}
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className="w-3.5 h-3.5 text-[#319A50]" />
        <span className="text-[13px] text-gray-600">
          {weather.city}
          {locationError && " (demo)"}
        </span>
      </div>

      {/* Main weather + info grid in one row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <WeatherIcon main={weather.main} className="w-8 h-8 text-[#5A8BAF]" />
          <div>
            <div className="text-[22px] font-bold text-gray-800 leading-tight">{weather.temp}°C</div>
            <div className="text-[12px] text-gray-500">{weather.description}</div>
          </div>
        </div>

        {/* Info grid */}
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <div className="bg-gray-50 rounded-lg p-1.5 text-center">
            <div className={`text-[12px] font-semibold ${airQuality?.color || "text-gray-500"}`}>
              {airQuality?.label || "N/A"} {airQuality?.percent != null && `${airQuality.percent}%`}
            </div>
            <div className="text-[10px] text-gray-400">Air Quality</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-1.5 text-center">
            <div className="text-[12px] font-semibold text-gray-700">
              {weather.windSpeed} km/h
            </div>
            <div className="text-[10px] text-gray-400">{getWindDirection(weather.windDeg)} wind</div>
          </div>
          <div
            className={`rounded-lg p-1.5 text-center ${
              humidityInfo.label !== "Fair"
                ? `${humidityInfo.label === "High" ? "bg-blue-50 border border-blue-200" : "bg-amber-50 border border-amber-200"}`
                : "bg-gray-50"
            }`}
            style={humidityInfo.label !== "Fair" ? { animation: "cardPulse 2.5s ease-in-out infinite" } : undefined}
          >
            <div className={`text-[12px] font-semibold ${humidityInfo.color}`}>
              {humidityInfo.label} {Math.round(weather.humidity)}%
            </div>
            <div className="text-[10px] text-gray-400">Humidity</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-1.5 text-center">
            <div className={`text-[12px] font-semibold ${bushfireColor}`}>{bushfireRisk}</div>
            <div className="text-[10px] text-gray-400">Fire Risk</div>
          </div>
        </div>
      </div>

      {/* COPD advisories */}
      {advisories.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {advisories.map((advisory, index) => (
            <div
              key={index}
              className={`p-2 ${advisory.bgColor} border rounded-lg flex items-start gap-2.5`}
            >
              {/* Pulsing indicator dot */}
              <span className="relative mt-1 shrink-0 flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full ${advisory.dotColor} opacity-60`}
                  style={{
                    animation: "copdPulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${advisory.dotColor}`}
                />
              </span>
              <p className="text-[12px] text-gray-700 leading-snug">
                {advisory.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pulse keyframes */}
      <style>{`
        @keyframes copdPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2); opacity: 0; }
        }
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function wmoToDescription(code: number): { main: string; description: string } {
  if (code === 0) return { main: "Clear", description: "Clear sky" };
  if (code <= 3) return { main: "Clouds", description: "Partly cloudy" };
  if (code <= 49) return { main: "Fog", description: "Foggy" };
  if (code <= 59) return { main: "Drizzle", description: "Drizzle" };
  if (code <= 69) return { main: "Rain", description: "Rain" };
  if (code <= 79) return { main: "Snow", description: "Snow" };
  if (code <= 84) return { main: "Rain", description: "Rain showers" };
  if (code <= 94) return { main: "Snow", description: "Snow showers" };
  return { main: "Thunderstorm", description: "Thunderstorm" };
}