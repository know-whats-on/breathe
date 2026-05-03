export function getDisplayName(name: string, isForSelf: boolean, careRecipientName: string) {
  const source = isForSelf ? name : careRecipientName || name;
  return source.trim().split(/\s+/)[0] || "there";
}

export function formatDateLabel(value: string | null) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeLabel(value: string) {
  return new Date(value).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatElapsedFrom(startedAt: string) {
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const minutes = Math.max(0, Math.floor(elapsedMs / 60000));
  const seconds = Math.max(0, Math.floor((elapsedMs % 60000) / 1000));
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

