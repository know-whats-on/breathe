import { useState } from "react";
import { AppFrame, FooterNav, PageHeader, PrimaryButton, Surface, ToggleChip } from "../components/AppChrome";
import { TRIGGER_SUGGESTIONS } from "../content/planContent";
import { useAppState } from "../state/AppState";

export default function Triggers() {
  const { data, actions } = useAppState();
  const [draftTriggers, setDraftTriggers] = useState<string[]>(data.triggers);
  const [customTrigger, setCustomTrigger] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const saveTriggers = () => {
    actions.updateTriggers(
      draftTriggers
        .map((trigger) => trigger.trim())
        .filter(Boolean)
    );
    setSavedMessage("Triggers saved.");
    window.setTimeout(() => setSavedMessage(""), 1800);
  };

  const toggleSuggestion = (value: string) => {
    setDraftTriggers((current) =>
      current.includes(value) ? current.filter((trigger) => trigger !== value) : [...current, value]
    );
  };

  return (
    <AppFrame withNav>
      <PageHeader
        title="My Breathlessness Triggers"
        subtitle="The booklet recommends learning your normal pattern and keeping track of the triggers that do not need medical treatment."
      />

      <Surface>
        <p className="text-[1.02rem] font-semibold text-slate-900">Common triggers from the guide</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRIGGER_SUGGESTIONS.map((trigger) => (
            <ToggleChip key={trigger} active={draftTriggers.includes(trigger)} onClick={() => toggleSuggestion(trigger)}>
              {trigger}
            </ToggleChip>
          ))}
        </div>
      </Surface>

      <Surface className="mt-4">
        <p className="text-[1.02rem] font-semibold text-slate-900">Add your own trigger</p>
        <div className="mt-4 flex gap-3">
          <input
            value={customTrigger}
            onChange={(event) => setCustomTrigger(event.target.value)}
            placeholder="e.g. Hanging out the washing"
            className="min-h-[58px] flex-1 rounded-[1.2rem] border border-slate-200 bg-white px-4 text-[1rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10"
          />
          <PrimaryButton
            onClick={() => {
              if (!customTrigger.trim()) return;
              setDraftTriggers((current) => [...current, customTrigger.trim()]);
              setCustomTrigger("");
            }}
            className="px-5"
          >
            Add
          </PrimaryButton>
        </div>
      </Surface>

      <div className="mt-4 space-y-3">
        {draftTriggers.map((trigger) => (
          <Surface key={trigger} className="flex items-center justify-between gap-3 p-4">
            <p className="text-[0.98rem] text-slate-700">{trigger}</p>
            <button
              onClick={() => setDraftTriggers((current) => current.filter((item) => item !== trigger))}
              className="text-[0.92rem] font-semibold text-slate-400"
            >
              Remove
            </button>
          </Surface>
        ))}
      </div>

      <div className="mt-6">
        <PrimaryButton className="w-full" onClick={saveTriggers}>
          Save triggers
        </PrimaryButton>
        {savedMessage && <p className="mt-3 text-center text-[0.92rem] font-semibold text-[#319A50]">{savedMessage}</p>}
      </div>

      <FooterNav />
    </AppFrame>
  );
}
