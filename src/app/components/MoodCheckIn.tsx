import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, ImageIcon, X, Send, SkipForward } from "lucide-react";

const MOODS = [
  { emoji: "😫", label: "Terrible", value: 1, color: "bg-red-100 border-red-300" },
  { emoji: "😟", label: "Poor", value: 2, color: "bg-orange-100 border-orange-300" },
  { emoji: "😐", label: "Okay", value: 3, color: "bg-yellow-100 border-yellow-300" },
  { emoji: "🙂", label: "Good", value: 4, color: "bg-lime-100 border-lime-300" },
  { emoji: "😄", label: "Great", value: 5, color: "bg-green-100 border-green-300" },
];

export interface MoodLog {
  id: string;
  type: "mood";
  date: string;
  moodValue: number;
  moodEmoji: string;
  moodLabel: string;
  note: string;
  photo: string | null; // base64 data URL
}

function saveMoodLog(log: MoodLog) {
  const existing: MoodLog[] = JSON.parse(localStorage.getItem("breathe_mood_logs") || "[]");
  existing.unshift(log);
  localStorage.setItem("breathe_mood_logs", JSON.stringify(existing));
}

export default function MoodCheckIn() {
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"pick" | "note" | "done">("pick");
  const [pendingMood, setPendingMood] = useState<(typeof MOODS)[0] | null>(null);
  const [noteText, setNoteText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("breathe_mood");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setSelected(parsed.value);
          setPhase("done");
        }
      } catch {}
    }
  }, []);

  const handleSelect = (mood: (typeof MOODS)[0]) => {
    setPendingMood(mood);
    setSelected(mood.value);
    setNoteText("");
    setPhoto(null);
    setPhase("note");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const finishLog = () => {
    if (!pendingMood) return;
    const log: MoodLog = {
      id: `mood_${Date.now()}`,
      type: "mood",
      date: new Date().toISOString(),
      moodValue: pendingMood.value,
      moodEmoji: pendingMood.emoji,
      moodLabel: pendingMood.label,
      note: noteText.trim(),
      photo,
    };
    saveMoodLog(log);
    localStorage.setItem(
      "breathe_mood",
      JSON.stringify({ value: pendingMood.value, date: new Date().toDateString() })
    );
    setPhase("done");
    setTimeout(() => {
      // keep "done" state
    }, 2000);
  };

  const removePhoto = () => setPhoto(null);

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl p-3 shadow-sm border border-gray-100">
      {/* Hidden file inputs */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence mode="wait">
        {/* ── Phase: Pick emoji ── */}
        {phase === "pick" && (
          <motion.div
            key="pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-[14px] text-gray-600 mb-2">How are you feeling?</div>
            <div className="flex justify-between gap-1">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleSelect(mood)}
                  className={`flex-1 flex flex-col items-center py-1.5 rounded-lg border-2 transition-all active:scale-95 ${
                    selected === mood.value
                      ? `${mood.color} scale-105`
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-[22px] leading-none mb-0.5">{mood.emoji}</span>
                  <span className="text-[10px] text-gray-500">{mood.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Phase: Optional note/photo ── */}
        {phase === "note" && pendingMood && (
          <motion.div
            key="note"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[22px]">{pendingMood.emoji}</span>
              <span className="text-[14px] font-semibold text-gray-700">
                Feeling {pendingMood.label.toLowerCase()}
              </span>
              <button
                onClick={() => {
                  setPhase("pick");
                  setSelected(null);
                }}
                className="ml-auto text-gray-400 active:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Text input */}
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Want to add a note? (optional)"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[14px] bg-white resize-none focus:outline-none focus:border-[#319A50] focus:ring-1 focus:ring-[#319A50]/30 mb-2"
            />

            {/* Photo preview */}
            {photo && (
              <div className="relative mb-2 inline-block">
                <img
                  src={photo}
                  alt="Attached"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={removePhoto}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center gap-2">
              {!photo && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[12px] font-semibold active:bg-gray-200 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Photo
                  </button>
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[12px] font-semibold active:bg-gray-200 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Camera
                  </button>
                </>
              )}
              <div className="flex-1" />
              <button
                onClick={finishLog}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-gray-500 text-[12px] font-semibold active:bg-gray-100 transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Skip
              </button>
              {(noteText.trim() || photo) && (
                <button
                  onClick={finishLog}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#319A50] text-white text-[12px] font-semibold active:bg-[#287a40] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Phase: Done ── */}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-[14px] text-gray-600 mb-2">Thanks! Logged ✓</div>
            <div className="flex justify-between gap-1">
              {MOODS.map((mood) => (
                <div
                  key={mood.value}
                  className={`flex-1 flex flex-col items-center py-1.5 rounded-lg border-2 transition-all ${
                    selected === mood.value
                      ? `${mood.color} scale-105`
                      : "border-transparent bg-gray-50 opacity-50"
                  }`}
                >
                  <span className="text-[22px] leading-none mb-0.5">{mood.emoji}</span>
                  <span className="text-[10px] text-gray-500">{mood.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
