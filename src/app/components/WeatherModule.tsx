import { CloudSun, Loader2, MapPin, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { Surface } from "./AppChrome";
import { HOME_WIDGET_SHELL_CLASS } from "./homeWidgetStyles";
import { useAppState } from "../state/AppState";
import type { WeatherSnapshot } from "../model/types";

function describeWeatherCode(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 69) return "Wet conditions";
  if (code <= 79) return "Cold conditions";
  if (code <= 94) return "Showers";
  return "Stormy";
}

function getBushfireRisk(temp: number, wind: number): WeatherSnapshot["bushfireRisk"] {
  if (temp >= 35 && wind >= 30) return "Extreme";
  if (temp >= 30 && wind >= 20) return "High";
  if (temp >= 25 && wind >= 15) return "Moderate";
  return "Low";
}

function CompactWeatherPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-2">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <span className="text-[0.82rem] font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export default function WeatherModule({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { data, actions } = useAppState();
  const [loading, setLoading] = useState(!data.weatherSnapshot);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchConditions(latitude: number, longitude: number) {
      try {
        const [forecastRes, geoRes, aqiRes] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`
          ),
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto`
          ),
          fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi`
          ),
        ]);

        const [forecastJson, geoJson, aqiJson] = await Promise.all([
          forecastRes.json(),
          geoRes.json(),
          aqiRes.json(),
        ]);

        const current = forecastJson.current;
        const locationLabel =
          geoJson.timezone?.split("/").pop()?.replace(/_/g, " ") ?? "My area";
        const airQualityScore = Number(aqiJson.current?.european_aqi ?? 0);
        const airQualityLabel =
          airQualityScore <= 20
            ? "Good"
            : airQualityScore <= 40
            ? "Fair"
            : airQualityScore <= 60
            ? "Moderate"
            : airQualityScore <= 80
            ? "Poor"
            : "Very poor";

        const snapshot: WeatherSnapshot = {
          locationLabel,
          temperatureC: Math.round(current.temperature_2m),
          condition: describeWeatherCode(current.weather_code),
          humidity: Math.round(current.relative_humidity_2m ?? 0),
          bushfireRisk: getBushfireRisk(current.temperature_2m, current.wind_speed_10m),
          airQualityLabel,
          windKmh: Math.round(current.wind_speed_10m),
          cachedAt: new Date().toISOString(),
        };

        if (cancelled) return;
        actions.saveWeatherSnapshot(snapshot);
        setError(null);
      } catch {
        if (cancelled) return;
        setError("Showing your last saved conditions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!navigator.onLine) {
      setLoading(false);
      setError(data.weatherSnapshot ? "Offline. Showing saved conditions." : "Offline. Conditions will load when you're online.");
      return () => {
        cancelled = true;
      };
    }

    if (!("geolocation" in navigator)) {
      setLoading(false);
      setError(data.weatherSnapshot ? "This device cannot refresh your location." : "Location is unavailable on this device.");
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchConditions(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setLoading(false);
        setError(data.weatherSnapshot ? "Location access was denied. Showing saved conditions." : "Allow location access to see local conditions.");
      },
      { timeout: 5000 }
    );

    return () => {
      cancelled = true;
    };
  }, [actions, data.weatherSnapshot]);

  const snapshot = data.weatherSnapshot;

  if (compact) {
    const compactClassName = className ? `${HOME_WIDGET_SHELL_CLASS} ${className}` : HOME_WIDGET_SHELL_CLASS;

    return (
      <Surface className={compactClassName}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#319A50]" />
              <span className="truncate text-[0.8rem]">{snapshot?.locationLabel ?? "My area"}</span>
            </div>
            {snapshot ? (
              <div className="mt-3 min-w-0">
                <p className="text-[1.6rem] font-bold leading-none text-slate-900">{snapshot.temperatureC}°C</p>
                <p className="mt-1 truncate text-[0.78rem] text-slate-500">{snapshot.condition}</p>
              </div>
            ) : (
              <p className="mt-3 overflow-hidden text-[0.82rem] leading-relaxed text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
                Allow location access to show local weather and keep the last snapshot offline.
              </p>
            )}
          </div>
          {loading ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-slate-400" />
          ) : (
            <CloudSun className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          )}
        </div>

        {snapshot ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <CompactWeatherPill label="Air" value={snapshot.airQualityLabel} />
            <CompactWeatherPill label="Humidity" value={`${snapshot.humidity}%`} />
            <CompactWeatherPill label="Bushfire" value={snapshot.bushfireRisk} />
          </div>
        ) : null}

        {error && (
          <p className="mt-2 overflow-hidden text-[0.72rem] leading-[1.3] text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
            {error}
          </p>
        )}
      </Surface>
    );
  }

  return (
    <Surface className={className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Humidity / Air Quality / Bushfire
          </p>
          <div className="mt-2 flex items-center gap-2 text-slate-500">
            <MapPin className="h-4 w-4 text-[#319A50]" />
            <span className="text-[0.92rem]">{snapshot?.locationLabel ?? "Local conditions"}</span>
          </div>
        </div>
        {loading ? <Loader2 className="mt-1 h-5 w-5 animate-spin text-slate-400" /> : <CloudSun className="mt-1 h-6 w-6 text-sky-600" />}
      </div>

      {snapshot ? (
        <>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[2rem] font-bold leading-none text-slate-900">{snapshot.temperatureC}°C</p>
              <p className="mt-2 text-[0.96rem] text-slate-500">{snapshot.condition}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
              <p className="text-[0.75rem] uppercase tracking-[0.18em] text-slate-400">Air quality</p>
              <p className="mt-1 text-[0.95rem] font-semibold text-slate-700">{snapshot.airQualityLabel}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-400">Humidity</p>
              <p className="mt-2 text-[1rem] font-semibold text-slate-800">{snapshot.humidity}%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-400">Bushfire</p>
              <p className="mt-2 text-[1rem] font-semibold text-slate-800">{snapshot.bushfireRisk}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-400">Wind</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[1rem] font-semibold text-slate-800">
                <Wind className="h-4 w-4 text-slate-400" />
                {snapshot.windKmh}
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-[0.95rem] leading-relaxed text-slate-500">
          This module uses location access when available and keeps the last saved snapshot for offline use.
        </p>
      )}

      {error && <p className="mt-4 text-[0.84rem] text-slate-400">{error}</p>}
    </Surface>
  );
}
