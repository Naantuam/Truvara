import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthButton from "./AuthComponents/AuthButton";
import InputField from "./AuthComponents/InputField";
import Logo from "./AuthComponents/Logo";
import { Lock } from "lucide-react";
import { clearCache } from "../dataCache";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

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

      if (res.data.companies_available) {
        // Same edge case as Login -- rare for a brand-new user, but possible
        // if they were added to more than one company before activating.
        navigate("/select-company", {
          state: { companies: res.data.companies_available, preAuthToken: res.data.pre_auth_token },
        });
        return;
      }

      clearCache();
      if (res.data?.access) localStorage.setItem("access_token", res.data.access);
      if (res.data?.refresh) localStorage.setItem("refresh_token", res.data.refresh);
      if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to activate your account. The link may be invalid or expired.");
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
            <h1 className="text-gray-900 text-xl font-bold text-center mt-6 mb-2">Activate Your Account</h1>
            <p className="text-red-600 text-sm text-center mb-6">
              This activation link is missing its token. Please use the link from your email exactly as it was sent.
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
          <h1 className="text-gray-900 text-xl font-bold text-center mt-6 mb-2">Activate Your Account</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Set a password to finish setting up your account.</p>
        </div>

        <div className="flex-grow flex flex-col justify-center py-6">
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

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="mt-4">
              <AuthButton type="submit" label="Set Password & Activate" isLoading={submitting} />
            </div>
          </form>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
