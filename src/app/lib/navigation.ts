import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

type NavigationState = {
  backTo?: string;
  backState?: unknown;
};

export function getPathWithSearchAndHash(location: Pick<Location, "pathname" | "search" | "hash">) {
  return `${location.pathname}${location.search}${location.hash}`;
}

export function getStateBackTo(state: unknown) {
  if (!state || typeof state !== "object") return null;
  const value = (state as NavigationState).backTo;
  return typeof value === "string" && value.startsWith("/") ? value : null;
}

export function getStateBackState(state: unknown) {
  if (!state || typeof state !== "object") return undefined;
  return (state as NavigationState).backState;
}

export function usePreviousScreenBack(fallback = "/") {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (overrideFallback?: string) => {
      const stateBackTo = getStateBackTo(location.state);
      if (stateBackTo) {
        navigate(stateBackTo, { state: getStateBackState(location.state) });
        return;
      }

      if (window.history.length > 1) {
        navigate(-1);
        return;
      }

      navigate(overrideFallback ?? fallback);
    },
    [fallback, location.state, navigate]
  );
}
