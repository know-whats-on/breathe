const ONBOARDING_REDIRECT_KEY = "breathe-post-onboarding-redirect";

function isAppPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

type SaveOnboardingRedirectOptions = {
  replace?: boolean;
};

export function saveOnboardingRedirect(path: string, options: SaveOnboardingRedirectOptions = {}) {
  if (!isAppPath(path)) return;

  try {
    if (options.replace === false && window.sessionStorage.getItem(ONBOARDING_REDIRECT_KEY)) return;
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
