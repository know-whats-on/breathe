import { AppFrame, FooterNav, PageHeader, PrimaryButton, Surface } from "../components/AppChrome";
import { BUCKET_COPY, STRATEGY_LIBRARY } from "../content/planContent";
import { formatDateLabel } from "../lib/format";
import { useAppState } from "../state/AppState";

export default function Practice() {
  const { data, actions } = useAppState();

  return (
    <AppFrame tone="calm" withNav>
      <PageHeader
        title="Practice My Strategies"
        subtitle="The guide recommends rehearsing strategies while calm so they feel familiar during an episode."
      />

      <Surface>
        <p className="text-[1.05rem] font-semibold text-slate-900">Practice status</p>
        <p className="mt-2 text-[0.96rem] leading-relaxed text-slate-500">
          Last practised {formatDateLabel(data.recoveryPlan.lastPractisedAt)}
        </p>
        <div className="mt-4">
          <PrimaryButton
            className="w-full"
            onClick={() => {
              actions.markPlanPractised();
            }}
          >
            Mark today’s practice
          </PrimaryButton>
        </div>
      </Surface>

      <div className="mt-4 space-y-4">
        {data.recoveryPlan.order.map((bucket) => {
          const strategies = data.recoveryPlan.buckets[bucket].selectedStrategyIds
            .map((id) => STRATEGY_LIBRARY[bucket].find((option) => option.id === id))
            .filter(Boolean);

          return (
            <Surface key={bucket}>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#319A50]">
                {BUCKET_COPY[bucket].eyebrow}
              </p>
              <p className="mt-2 text-[1.15rem] font-semibold text-slate-900">{BUCKET_COPY[bucket].title}</p>
              <p className="mt-2 text-[0.94rem] leading-relaxed text-slate-500">{BUCKET_COPY[bucket].description}</p>
              <div className="mt-4 space-y-3">
                {strategies.length > 0 ? (
                  strategies.map((strategy) => (
                    <div key={strategy?.id} className="rounded-[1rem] bg-slate-50 px-4 py-3">
                      <p className="text-[0.98rem] font-semibold text-slate-800">{strategy?.label}</p>
                      {strategy?.detail.trim() && (
                        <p className="mt-1 text-[0.92rem] leading-relaxed text-slate-500">{strategy.detail}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1rem] bg-slate-50 px-4 py-3 text-[0.92rem] leading-relaxed text-slate-500">
                    Personalise this step in My Plan to turn practice into a repeatable routine.
                  </div>
                )}
              </div>
            </Surface>
          );
        })}

        <Surface>
          <p className="text-[1.05rem] font-semibold text-slate-900">Everyday practice from the guide</p>
          <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-slate-600">
            <p>Use paced breathing while walking or climbing stairs: breathe in for one step and out for two.</p>
            <p>Try blow-as-you-go when bending, lifting, or reaching: breathe out during the effort.</p>
            <p>Practise tummy breathing while sitting and resting so it feels easier to use when you need it.</p>
          </div>
        </Surface>
      </div>

      <FooterNav />
    </AppFrame>
  );
}
