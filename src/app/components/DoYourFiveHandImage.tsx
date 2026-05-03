import type { StrategyBucketType } from "../model/types";

type FingerIndex = 1 | 2 | 3 | 4 | 5;
type ImageKey = "stop" | "calm" | "position" | "blow-air" | "fan";

const IMAGE_BY_BUCKET: Record<StrategyBucketType, ImageKey> = {
  STOP: "stop",
  THINK: "calm",
  POSITION: "position",
  BREATHE_OUT_SLOWLY: "blow-air",
  AIRFLOW_COOL: "fan",
};

const IMAGE_BY_FINGER: Record<FingerIndex, ImageKey> = {
  1: "stop",
  2: "calm",
  3: "position",
  4: "blow-air",
  5: "fan",
};

const LABEL_BY_KEY: Record<ImageKey, string> = {
  "stop": "Stop hand guide",
  "calm": "Calm your thinking hand guide",
  "position": "Position hand guide",
  "blow-air": "Blow air breathing hand guide",
  "fan": "Fan and airflow hand guide",
};

function resolveImageKey(bucket?: StrategyBucketType, highlightedFinger?: FingerIndex) {
  if (bucket) return IMAGE_BY_BUCKET[bucket];
  if (highlightedFinger) return IMAGE_BY_FINGER[highlightedFinger];
  return null;
}

export default function DoYourFiveHandImage({
  bucket,
  highlightedFinger,
  className,
}: {
  bucket?: StrategyBucketType;
  highlightedFinger?: FingerIndex;
  className?: string;
}) {
  const imageKey = resolveImageKey(bucket, highlightedFinger);

  if (!imageKey) return null;

  return (
    <img
      src={`/do-your-five/${imageKey}.png`}
      alt={LABEL_BY_KEY[imageKey]}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
