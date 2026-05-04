import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useLocation } from "react-router";
import { PhoneCall } from "lucide-react";
import { AppFrame, FooterNav, PageHeader, PrimaryButton, Surface } from "../components/AppChrome";
import { useAppState } from "../state/AppState";
import { createContactPerson, type ContactSet } from "../model/types";

function ContactInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = label,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: "text" | "tel";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.94rem] font-semibold text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        inputMode={type === "tel" ? "tel" : undefined}
        placeholder={placeholder}
        className="min-h-[54px] w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 text-[0.98rem] outline-none transition focus:border-[#319A50] focus:ring-2 focus:ring-[#319A50]/10"
      />
    </label>
  );
}

function getPhoneHref(phone: string) {
  const normalised = phone.trim().replace(/[^\d+*#,;]/g, "");

  return normalised.length > 0 ? `tel:${normalised}` : "";
}

function ContactCallButton({
  phone,
  fallbackLabel,
  name,
}: {
  phone: string;
  fallbackLabel: string;
  name?: string;
}) {
  const href = getPhoneHref(phone);
  const targetName = name?.trim() || fallbackLabel;
  const label = `Call ${targetName}`;
  const className = "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[1rem] px-4 text-[0.95rem] font-semibold shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]";

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className={`${className} cursor-not-allowed bg-slate-100 text-slate-400 shadow-none`}
      >
        <PhoneCall className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <a href={href} className={`${className} bg-white text-[#236A3D]`}>
      <PhoneCall className="h-4 w-4" />
      {label}
    </a>
  );
}

function ContactSection({
  title,
  children,
  id,
  sectionRef,
}: {
  title: string;
  children: ReactNode;
  id?: string;
  sectionRef?: RefObject<HTMLElement>;
}) {
  return (
    <Surface id={id} ref={sectionRef} tabIndex={id ? -1 : undefined}>
      <p className="text-[1.05rem] font-semibold text-slate-900">{title}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </Surface>
  );
}

export default function Contacts() {
  const location = useLocation();
  const { data, actions } = useAppState();
  const healthcareSectionRef = useRef<HTMLElement>(null);
  const [draft, setDraft] = useState<ContactSet>(() => {
    const next = structuredClone(data.contacts);

    while (next.supportPeople.length < 2) {
      next.supportPeople.push(createContactPerson("Support person"));
    }

    return next;
  });
  const [savedMessage, setSavedMessage] = useState("");

  const saveContacts = () => {
    actions.updateContacts(draft);
    setSavedMessage("Contacts saved.");
    window.setTimeout(() => setSavedMessage(""), 1800);
  };

  useEffect(() => {
    if (location.hash !== "#healthcare-professional") return;

    window.setTimeout(() => {
      healthcareSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      healthcareSectionRef.current?.focus({ preventScroll: true });
    }, 80);
  }, [location.hash]);

  return (
    <AppFrame withNav>
      <PageHeader
        title="Contacts"
        subtitle="Keep your GP, healthcare professional, and support people close. Call 000 in an emergency."
      />

      <div className="mt-4 space-y-4">
        <ContactSection title="General Practitioner (GP)">
          <ContactInput
            label="Name"
            value={draft.gp.name}
            onChange={(name) => setDraft((current) => ({ ...current, gp: { ...current.gp, name } }))}
          />
          <ContactInput
            label="Phone"
            value={draft.gp.phone}
            type="tel"
            onChange={(phone) => setDraft((current) => ({ ...current, gp: { ...current.gp, phone } }))}
          />
          <ContactCallButton phone={draft.gp.phone} name={draft.gp.name} fallbackLabel="GP" />
        </ContactSection>

        <ContactSection
          id="healthcare-professional"
          title="Healthcare Professional"
          sectionRef={healthcareSectionRef}
        >
          <ContactInput
            label="Name"
            value={draft.copdNurse.name}
            onChange={(name) => setDraft((current) => ({ ...current, copdNurse: { ...current.copdNurse, name } }))}
          />
          <ContactInput
            label="Role"
            value={draft.copdNurse.role}
            placeholder="e.g. COPD nurse, respiratory specialist"
            onChange={(role) => setDraft((current) => ({ ...current, copdNurse: { ...current.copdNurse, role } }))}
          />
          <ContactInput
            label="Phone"
            value={draft.copdNurse.phone}
            type="tel"
            onChange={(phone) =>
              setDraft((current) => ({ ...current, copdNurse: { ...current.copdNurse, phone } }))
            }
          />
          <ContactCallButton
            phone={draft.copdNurse.phone}
            name={draft.copdNurse.name}
            fallbackLabel="Healthcare Professional"
          />
        </ContactSection>

        <ContactSection title="Support Persons">
          {draft.supportPeople.slice(0, 2).map((person, index) => (
            <div
              key={person.id}
              className={index === 0 ? "" : "border-t border-slate-200 pt-4"}
            >
              <div className="space-y-3">
                <ContactInput
                  label={`Name ${index + 1}`}
                  value={person.name}
                  onChange={(name) =>
                    setDraft((current) => ({
                      ...current,
                      supportPeople: current.supportPeople.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, name } : entry
                      ),
                    }))
                  }
                />
                <ContactInput
                  label={`Phone ${index + 1}`}
                  value={person.phone}
                  type="tel"
                  onChange={(phone) =>
                    setDraft((current) => ({
                      ...current,
                      supportPeople: current.supportPeople.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, phone } : entry
                      ),
                    }))
                  }
                />
                <ContactCallButton
                  phone={person.phone}
                  name={person.name}
                  fallbackLabel={`Support Person ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </ContactSection>
      </div>

      <div className="mt-6">
        <PrimaryButton className="w-full" onClick={saveContacts}>
          Save contacts
        </PrimaryButton>
        {savedMessage && <p className="mt-3 text-center text-[0.92rem] font-semibold text-[#319A50]">{savedMessage}</p>}
      </div>

      <FooterNav />
    </AppFrame>
  );
}
