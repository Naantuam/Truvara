import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import AuthIconTile from "./AuthComponents/AuthIconTile";
import AuthOutlineButton from "./AuthComponents/AuthOutlineButton";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthButton from "./AuthComponents/AuthButton";
import InputField from "./AuthComponents/InputField";
import Logo from "./AuthComponents/Logo";
import { Lock, KeyRound, UserCheck, ShieldCheck, LinkIcon, ArrowRight, ArrowLeft } from "lucide-react";
import { routeForAuthResponse } from "../authSession";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  // Same endpoint for both, different wording: invited team members are
  // "activating", self-signups are confirming their email.
  const isSignup = searchParams.get("signup") === "1";
  const isReset = searchParams.get("reset") === "1";
  const title = isSignup ? "Create your password" : isReset ? "Choose a new password" : "Activate Your Account";
  const navigate = useNavigate();
  // Same black tile + gold icon as the other auth pages, picked per link type.
  const ModeIcon = isSignup ? UserCheck : isReset ? KeyRound : ShieldCheck;

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/auth/activate/", { token, password: form.password });

      // Self-signups (no company yet) go on to create their workspace;
      // invited people land in their company, or pick one if several.
      const { to, state } = routeForAuthResponse(res.data);
      navigate(to, { state });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "This link didn't work. It may have expired or been replaced by a newer one; request a new link from the sign-in page."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
            <Logo />
            <AuthIconTile className="mt-6 md:mt-0"><LinkIcon className="w-7 h-7" strokeWidth={2.25} /></AuthIconTile>
            <h1 className="text-gray-900 text-xl font-bold text-center mt-4 mb-2">{title}</h1>
            <p className="text-red-600 text-sm text-center mb-6">
              This activation link is missing its token. Please use the link from your email exactly as it was sent.
            </p>
          </div>
          <BackToLogin />
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
          <AuthIconTile className="mt-6 md:mt-0"><ModeIcon className="w-7 h-7" strokeWidth={2.25} /></AuthIconTile>
          <h1 className="text-gray-900 text-xl font-bold text-center mt-4 mb-2">{title}</h1>
          <p className="text-gray-500 text-sm text-center">
            {isSignup
              ? "Choose a password to verify your email and finish creating your account. Use at least 8 characters."
              : isReset
                ? "Enter a new password for your account. Use at least 8 characters."
                : "Set a password to finish setting up your account."}
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-center py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <InputField
              id="password"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={form.password}
              onChange={handleChange}
              Icon={Lock}
            />

            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              Icon={Lock}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <AuthButton
              type="submit"
              label={isSignup ? "Create account" : isReset ? "Reset password" : "Set Password & Activate"}
              isLoading={submitting}
              TrailingIcon={ArrowRight}
            />
          </form>
        </div>

        <BackToLogin />
      </AuthCard>
    </AuthLayout>
  );
}

function BackToLogin() {
  return (
    <div className="pb-4 md:pb-0">
      <AuthOutlineButton to="/login" nudge="left" icon={<ArrowLeft className="h-5 w-5" strokeWidth={2.25} />}>
        Back to Login
      </AuthOutlineButton>
    </div>
  );
}
