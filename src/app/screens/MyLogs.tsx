import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Activity, Smile, ImageIcon } from "lucide-react";
import type { MoodLog } from "../components/MoodCheckIn";

interface EpisodeLog {
  id: number;
  type?: "episode";
  date: string;
  trigger: string;
}

type LogEntry =
  | (EpisodeLog & { type: "episode" })
  | MoodLog;

export default function MyLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "mood" | "episode">("all");
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const episodeLogs: EpisodeLog[] = JSON.parse(
      localStorage.getItem("breathe-logs") || "[]"
    ).map((l: EpisodeLog) => ({ ...l, type: "episode" as const }));

    const moodLogs: MoodLog[] = JSON.parse(
      localStorage.getItem("breathe_mood_logs") || "[]"
    );

    const all: LogEntry[] = [...episodeLogs, ...moodLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setLogs(all);
  }, []);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const moodCount = logs.filter((l) => l.type === "mood").length;
  const episodeCount = logs.filter((l) => l.type === "episode").length;

  return (
    <div className="min-h-[100dvh] bg-white max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-[#5A8BAF] text-white p-6 pb-5">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center active:opacity-70"
        >
          <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
        </button>
        <h1 className="text-[30px] font-bold leading-tight">My Logs</h1>
        <p className="text-white/70 text-[14px] mt-1">
          {logs.length} entr{logs.length !== 1 ? "ies" : "y"} recorded
        </p>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        {[
          { key: "all" as const, label: "All" },
          { key: "mood" as const, label: `Mood (${moodCount})` },
          { key: "episode" as const, label: `Episodes (${episodeCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
              filter === tab.key
                ? "bg-[#5A8BAF] text-white"
                : "bg-gray-100 text-gray-600 active:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-14 h-14 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
            <p className="text-[18px] text-gray-500 font-semibold">No logs yet</p>
            <p className="text-[14px] text-gray-400 mt-1">
              {filter === "mood"
                ? "Log your mood from the home screen"
                : filter === "episode"
                ? "Your recovery history will appear here"
                : "Your mood and episode history will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((log) =>
              log.type === "mood" ? (
                <MoodCard
                  key={log.id}
                  log={log}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  onPhotoClick={setExpandedPhoto}
                />
              ) : (
                <EpisodeCard
                  key={log.id}
                  log={log}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              )
            )}
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <p className="text-[14px] text-gray-700 text-center">
              {moodCount > 0 && (
                <>
                  <strong className="text-[#319A50]">{moodCount}</strong> mood check-in
                  {moodCount !== 1 ? "s" : ""}
                </>
              )}
              {moodCount > 0 && episodeCount > 0 && " · "}
              {episodeCount > 0 && (
                <>
                  <strong className="text-[#78B382]">{episodeCount}</strong> episode
                  {episodeCount !== 1 ? "s" : ""} managed
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Expanded photo overlay */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setExpandedPhoto(null)}
        >
          <img
            src={expandedPhoto}
            alt="Full size"
            className="max-w-full max-h-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

// ── Mood Log Card ──
function MoodCard({
  log,
  formatDate,
  formatTime,
  onPhotoClick,
}: {
  log: MoodLog;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
  onPhotoClick: (url: string) => void;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="text-[28px] leading-none mt-0.5">{log.moodEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-gray-800">
              {log.moodLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[10px] font-semibold">
              <Smile className="w-2.5 h-2.5" />
              Mood
            </span>
          </div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            {formatDate(log.date)} · {formatTime(log.date)}
          </div>
          {log.note && (
            <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">
              {log.note}
            </p>
          )}
          {log.photo && (
            <button
              onClick={() => onPhotoClick(log.photo!)}
              className="mt-2 relative group"
            >
              <img
                src={log.photo}
                alt="Mood photo"
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white opacity-0 group-active:opacity-100" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Episode Log Card ──
function EpisodeCard({
  log,
  formatDate,
  formatTime,
}: {
  log: EpisodeLog;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#78B382]/15 flex items-center justify-center shrink-0 mt-0.5">
          <Calendar className="w-4 h-4 text-[#78B382]" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-gray-800">
              Breathlessness Episode
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-50 text-[#319A50] text-[10px] font-semibold">
              <Activity className="w-2.5 h-2.5" />
              Episode
            </span>
          </div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            {formatDate(log.date)} · {formatTime(log.date)}
          </div>
          {log.trigger && (
            <div className="mt-2">
              <span className="text-[12px] text-gray-400">Trigger: </span>
              <span className="text-[13px] text-gray-600">{log.trigger}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
