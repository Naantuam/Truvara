import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import OnboardingShell from "./OnboardingShell";
import CreateWorkspace from "./CreateWorkspace";
import OnboardingWizard from "./OnboardingWizard";
import { getOnboardingToken } from "../../authSession";

const signedInUser = () => {
  try {
    return localStorage.getItem("access_token") ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  } catch {
    return {};
  }
};

// /onboarding: a verified person with no company creates their workspace;
// anyone with a workspace session fills in (or resumes) the business profile.
export default function OnboardingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(signedInUser);

  if (!user && !getOnboardingToken()) return <Navigate to="/login" replace />;

  if (!user) {
    return (
      <OnboardingShell>
        <CreateWorkspace onCreated={() => setUser(signedInUser())} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell wide>
      <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-700 truncate">{user.company_name}</span>
        <button type="button" onClick={() => navigate("/dashboard")} className="font-semibold hover:text-gray-900">
          Go to dashboard
        </button>
      </div>
      <OnboardingWizard companyCountry={user.company_currency === "USD" ? "US" : "NG"} />
    </OnboardingShell>
  );
}
