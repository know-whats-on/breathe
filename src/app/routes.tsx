import { useEffect, useState } from "react";
import { Navigate, Outlet, createBrowserRouter, useLocation } from "react-router";
import App from "./App";
import Home from "./screens/Home";
import Onboarding from "./screens/Onboarding";
import PlanBuilder from "./screens/PlanBuilder";
import EpisodeRunner from "./screens/EpisodeRunner";
import NextSteps from "./screens/NextSteps";
import ReviewEpisode from "./screens/ReviewEpisode";
import Diary from "./screens/Diary";
import Triggers from "./screens/Triggers";
import Contacts from "./screens/Contacts";
import Support from "./screens/Support";
import Practice from "./screens/Practice";
import PracticeSummary from "./screens/PracticeSummary";
import Resources from "./screens/Resources";
import SelfChecklist from "./screens/SelfChecklist";
import { useAppState } from "./state/AppState";
import { clearOnboardingRedirect, getOnboardingRedirect, saveOnboardingRedirect } from "./lib/onboardingRedirect";

function LoadingScreen() {
  return <div className="min-h-[100dvh] bg-[linear-gradient(180deg,_rgba(247,251,248,1)_0%,_rgba(255,255,255,1)_42%,_rgba(245,248,249,1)_100%)]" />;
}

function OnboardingCompleteRedirect() {
  const [redirectTo] = useState(() => getOnboardingRedirect());

  useEffect(() => {
    clearOnboardingRedirect();
  }, []);

  return <Navigate to={redirectTo} replace />;
}

function OnboardingGate() {
  const { ready, data } = useAppState();
  if (!ready) return <LoadingScreen />;
  if (data.onboardingComplete) return <OnboardingCompleteRedirect />;
  return <Onboarding />;
}

function AppGate() {
  const { ready, data } = useAppState();
  if (!ready) return <LoadingScreen />;
  if (!data.onboardingComplete) return <RedirectToOnboarding />;
  return <Outlet />;
}

function RedirectToOnboarding() {
  const location = useLocation();
  const redirectPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    saveOnboardingRedirect(redirectPath, { replace: false });
  }, [redirectPath]);

  return <Navigate to="/onboarding" replace />;
}

function AppFallbackRedirect() {
  const { ready, data } = useAppState();
  if (!ready) return <LoadingScreen />;
  return <Navigate to={data.onboardingComplete ? "/" : "/onboarding"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { path: "/onboarding", Component: OnboardingGate },
      {
        Component: AppGate,
        children: [
          { index: true, Component: Home },
          { path: "/plan", Component: PlanBuilder },
          { path: "/episode", Component: EpisodeRunner },
          { path: "/next-steps", Component: NextSteps },
          { path: "/review", Component: ReviewEpisode },
          { path: "/diary", Component: Diary },
          { path: "/triggers", Component: Triggers },
          { path: "/contacts", Component: Contacts },
          { path: "/support", Component: Support },
          { path: "/practice", Component: Practice },
          { path: "/practice-summary", Component: PracticeSummary },
          { path: "/resources", Component: Resources },
          { path: "/self-checklist", Component: SelfChecklist },
          { path: "/episode/stop", element: <Navigate to="/episode" replace /> },
          { path: "/episode/position", element: <Navigate to="/episode" replace /> },
          { path: "/episode/fan", element: <Navigate to="/episode" replace /> },
          { path: "/episode/breathe", element: <Navigate to="/episode" replace /> },
          { path: "/episode/evaluate", element: <Navigate to="/next-steps" replace /> },
          { path: "/escalation", element: <Navigate to="/next-steps" replace /> },
          { path: "/post-episode-log", element: <Navigate to="/review" replace /> },
          { path: "/my-info", element: <Navigate to="/plan" replace /> },
          { path: "/my-logs", element: <Navigate to="/diary" replace /> },
          { path: "/emergency-contacts", element: <Navigate to="/contacts" replace /> },
        ],
      },
      { path: "*", Component: AppFallbackRedirect },
    ],
  },
]);
