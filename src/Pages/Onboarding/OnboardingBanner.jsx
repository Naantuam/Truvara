import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ClipboardList, ArrowRight } from "lucide-react";
import api from "../../api";

// Dashboard prompt to resume the business profile (PRD: "can resume
// incomplete onboarding later"). Only for whoever can edit the profile, and
// only while it isn't finished.
export default function OnboardingBanner() {
  const { user } = useOutletContext() || {};
  const canEdit = Boolean(user?.permissions?.includes("admin:settings:manage"));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!canEdit) return;
    let cancelled = false;
    api
      .get("/onboarding/profile")
      .then((res) => !cancelled && setProfile(res.data))
      // A banner isn't worth an error message; the dashboard still works.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [canEdit]);

  if (!canEdit || !profile || profile.completedAt) return null;
  const done = profile.completedSteps.length;
  const total = profile.steps.length;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold-300 bg-gold-50 dark:bg-gold-500/10 dark:border-gold-500/30 px-5 py-4">
      <div className="w-10 h-10 rounded-xl bg-gold-500 text-gray-900 flex items-center justify-center flex-shrink-0">
        <ClipboardList className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 dark:text-white">Finish setting up your business profile</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {done} of {total} steps complete. Pick up where you left off.
        </p>
      </div>
      <Link
        to="/onboarding"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-gray-900 text-sm font-bold transition-colors"
      >
        Resume <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
