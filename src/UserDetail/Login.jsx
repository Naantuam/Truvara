import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthOutlineButton from "./AuthComponents/AuthOutlineButton";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthLink from "./AuthComponents/AuthLink";
import AuthButton from "./AuthComponents/AuthButton";
import Logo from "./AuthComponents/Logo";
import InputField from "./AuthComponents/InputField";
import { Mail, Lock, ArrowRight, Building2, MailWarning } from "lucide-react";
import api from "../api";
import { AUTH_DISABLED } from "../config";
import { routeForAuthResponse } from "../authSession";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  // Set when the account exists but its emailed link was never used.
  const [notActivated, setNotActivated] = useState(false);
  const [resendNotice, setResendNotice] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (AUTH_DISABLED) {
      navigate("/dashboard");
      return;
    }

    setLoading(true);
    setNotActivated(false);
    setResendNotice(null);

    try {
      const res = await api.post("/auth/login/", form);

      if (res.data.mfa_required) {
        // Redirect to MFA verification screen
        navigate("/mfa", { state: { userId: res.data.user_id, email: res.data.email } });
        return;
      }

      // No company yet -> workspace creation; several -> pick one.
      const { to, state } = routeForAuthResponse(res.data);
      navigate(to, { state });
    } catch (err) {
      let errorMessage = "Login failed due to an unknown error.";

      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === "object") {
          // Flatten validation errors (e.g. { email: ["Invalid"], password: ["Required"] })
          errorMessage = Object.values(data).flat().join(" ");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error("Login failed:", errorMessage);

      if (err.response?.data?.code === "ACCOUNT_NOT_ACTIVATED") {
        setNotActivated(true);
      } else if (!err.response) {
        alert("Could not connect to the server. Check your internet connection or server status.");
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-activation", { email: form.email });
      setResendNotice("We've sent a new link. Check your inbox.");
    } catch {
      setResendNotice("We couldn't resend the email. Please try again shortly.");
    }
  };

  return (
    <AuthLayout>
      <AuthCard>

        {/* Top Section: Logo & Title */}
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
          {/* Mobile-only heading */}
          <h1 className="md:hidden text-gray-900 text-xl font-bold text-center mt-6">
            Sign in to Truvara
          </h1>
        </div>

        {/* Middle Section: Form (Grows to fill space) */}
        <div className="flex-grow flex flex-col justify-center py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              Icon={Mail}
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              Icon={Lock}
            />

            <div className="flex justify-start -mt-3">
              <AuthLink to="/forgot-password">Forgot Password?</AuthLink>
            </div>

            {notActivated && (
              <div className="flex gap-3 rounded-xl bg-gold-50 border border-gold-200 px-4 py-3 text-sm text-gray-800">
                <MailWarning className="h-5 w-5 flex-shrink-0 text-gold-800" />
                <div>
                This account hasn't been activated yet. Use the link we emailed you, or{" "}
                <button type="button" onClick={handleResend} className="font-semibold text-brand-700 hover:underline">
                  send a new link
                </button>
                .
                {resendNotice && <p className="mt-1 text-gray-600">{resendNotice}</p>}
                </div>
              </div>
            )}

            <AuthButton type="submit" label="Login" isLoading={loading} TrailingIcon={ArrowRight} />
          </form>
        </div>

        {/* Second call to action: businesses not on Truvara yet */}
        <div className="flex flex-col gap-4 pb-4 md:pb-0">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-black/20" />
            <span className="text-sm text-gray-600">New to Truvara?</span>
            <span className="h-px flex-1 bg-black/20" />
          </div>
          <AuthOutlineButton to="/register" icon={<Building2 className="h-5 w-5" strokeWidth={2.25} />}>
            Create a business account
          </AuthOutlineButton>
        </div>

      </AuthCard>
    </AuthLayout>
  );
};

export default Login;