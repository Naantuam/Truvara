import { clearCache } from "./dataCache";

// One place for what every sign-in path does with the backend's response,
// so Login, account activation, company selection and workspace creation
// can't drift apart.
const ONBOARDING_TOKEN_KEY = "onboarding_token";

export function storeSession(data) {
  // Fresh session: no cached data from a previous user may leak in.
  clearCache();
  sessionStorage.removeItem(ONBOARDING_TOKEN_KEY);
  if (data?.access) localStorage.setItem("access_token", data.access);
  if (data?.refresh) localStorage.setItem("refresh_token", data.refresh);
  if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
}

// A verified person with no company yet. Kept in sessionStorage (this tab
// only, gone when it closes) since it's short-lived and single-purpose.
export function storeOnboardingToken(data) {
  clearCache();
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  sessionStorage.setItem(ONBOARDING_TOKEN_KEY, data.onboarding_token);
  if (data.user) sessionStorage.setItem("onboarding_user", JSON.stringify(data.user));
}

export const getOnboardingToken = () => sessionStorage.getItem(ONBOARDING_TOKEN_KEY);

export function getOnboardingUser() {
  try {
    return JSON.parse(sessionStorage.getItem("onboarding_user") || "null");
  } catch {
    return null;
  }
}

// Where to send someone after the backend answers a sign-in request.
// Returns the route to navigate to, plus router state where needed.
export function routeForAuthResponse(data) {
  if (data?.onboarding_required) {
    storeOnboardingToken(data);
    return { to: "/onboarding" };
  }
  if (data?.companies_available) {
    return { to: "/select-company", state: { companies: data.companies_available, preAuthToken: data.pre_auth_token } };
  }
  storeSession(data);
  return { to: data?.user?.default_redirect || "/dashboard" };
}

export const apiErrorMessage = (err, fallback) =>
  err?.response?.data?.detail || (err?.response ? fallback : "Could not connect to the server. Check your connection and try again.");
