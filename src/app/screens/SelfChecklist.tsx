import { ListChecks, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AppFrame,
  FooterNav,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  Surface,
} from "../components/AppChrome";
import {
  createDefaultSelfChecklistItems,
  sanitiseSelfChecklistItems,
  type SelfChecklistItem,
} from "../model/types";
import { useAppState } from "../state/AppState";

const TEXTAREA_CLASSNAME =
  "min-h-[88px] w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-[1rem] leading-relaxed outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10";

function createEditableItem(prompt = ""): SelfChecklistItem {
  return {
    id: crypto.randomUUID(),
    prompt,
  };
}

function hasEmptyPrompt(items: SelfChecklistItem[]) {
  return items.some((item) => item.prompt.trim().length === 0);
}

export default function SelfChecklist() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, actions } = useAppState();
  const [draftItems, setDraftItems] = useState<SelfChecklistItem[]>(() => data.recoveryPlan.selfChecklistItems);
  const [savedMessage, setSavedMessage] = useState("");
  const backTo = (location.state as { backTo?: string } | null)?.backTo === "/plan" ? "/plan" : "/resources";

  useEffect(() => {
    setDraftItems(data.recoveryPlan.selfChecklistItems);
  }, [data.recoveryPlan.selfChecklistItems]);

  const saveChecklist = () => {
    const nextItems = sanitiseSelfChecklistItems(draftItems, createDefaultSelfChecklistItems());
    actions.updateSelfChecklistItems(nextItems);
    setDraftItems(nextItems);
    setSavedMessage("Self-checklist saved.");
    window.setTimeout(() => setSavedMessage(""), 1800);
  };

  const addItem = () => {
    setDraftItems((current) => [...current, createEditableItem()]);
  };

  const updatePrompt = (id: string, prompt: string) => {
    setDraftItems((current) =>
      current.map((item) => (item.id === id ? { ...item, prompt } : item))
    );
  };

  const removeItem = (id: string) => {
    if (draftItems.length === 1) {
      setDraftItems(createDefaultSelfChecklistItems());
      setSavedMessage("Checklist reset to the default items.");
      window.setTimeout(() => setSavedMessage(""), 1800);
      return;
    }

    setDraftItems((current) => current.filter((item) => item.id !== id));
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(backTo);
  };

  return (
    <AppFrame withNav>
      <PageHeader
        title="Self-Checklist"
        subtitle="These prompts appear in the Think step when the self-check pill is pressed."
        backTo={backTo}
        onBack={goBack}
      />

      <div className="space-y-4">
        <Surface>
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-[#319A50]/10 text-[#319A50]">
              <ListChecks className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[1.02rem] font-semibold text-slate-900">Edit the checklist used in Help Me Recover</p>
              <p className="mt-2 text-[0.94rem] leading-relaxed text-slate-500">
                Add, update, or remove prompts here. If you remove the last one, the app restores the default six prompts.
              </p>
            </div>
          </div>
        </Surface>

        <div className="space-y-3">
          {draftItems.map((item, index) => (
            <Surface key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#319A50]">
                  Item {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFF1F1] px-3 py-2 text-[0.82rem] font-semibold text-[#C84A4A] transition active:scale-[0.98]"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <textarea
                value={item.prompt}
                onChange={(event) => updatePrompt(item.id, event.target.value)}
                rows={3}
                placeholder="Add a self-check question"
                className={`mt-3 ${TEXTAREA_CLASSNAME}`}
              />
            </Surface>
          ))}
        </div>

        <SecondaryButton type="button" className="w-full" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Add checklist item
        </SecondaryButton>

        <div className="pt-2">
          <PrimaryButton className="w-full" onClick={saveChecklist} disabled={hasEmptyPrompt(draftItems)}>
            Save self-checklist
          </PrimaryButton>
          {savedMessage && <p className="mt-3 text-center text-[0.92rem] font-semibold text-[#319A50]">{savedMessage}</p>}
        </div>
      </div>

      <FooterNav />
    </AppFrame>
  );
}
