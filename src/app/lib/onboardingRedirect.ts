const ONBOARDING_REDIRECT_KEY = "breathe-post-onboarding-redirect";

function isAppPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export function saveOnboardingRedirect(path: string) {
  if (!isAppPath(path)) return;

  try {
    window.sessionStorage.setItem(ONBOARDING_REDIRECT_KEY, path);
  } catch {
    // Session storage can be unavailable in private or restricted browser contexts.
  }
}

export function getOnboardingRedirect(defaultPath = "/") {
  try {
    const savedPath = window.sessionStorage.getItem(ONBOARDING_REDIRECT_KEY);
    if (savedPath && isAppPath(savedPath)) return savedPath;
  } catch {
    // Fall through to the default path.
  }

  return defaultPath;
}

export function clearOnboardingRedirect() {
  try {
    window.sessionStorage.removeItem(ONBOARDING_REDIRECT_KEY);
  } catch {
    // Nothing else to do if storage is unavailable.
  }
}
