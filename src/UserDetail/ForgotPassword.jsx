import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthIconTile from "./AuthComponents/AuthIconTile";
import AuthOutlineButton from "./AuthComponents/AuthOutlineButton";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import Logo from "./AuthComponents/Logo";
import InputField from "./AuthComponents/InputField";
import AuthButton from "./AuthComponents/AuthButton";
import { Mail, KeyRound, MailCheck, ArrowRight, ArrowLeft } from "lucide-react";
import api from "../api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/password-reset-request/", { email });
      setMessage(res.data.detail || "If an account with this email exists, a reset link has been sent.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Top Section: same black tile + gold icon as the other auth pages */}
        <div className="flex flex-col items-center mt-4 md:mt-0">
          <Logo />
          <AuthIconTile className="mt-6 md:mt-0">
            {message ? (
              <MailCheck className="w-7 h-7" strokeWidth={2.25} />
            ) : (
              <KeyRound className="w-7 h-7" strokeWidth={2.25} />
            )}
          </AuthIconTile>
          <h2 className="text-xl font-bold text-gray-900 text-center mt-4">
            {message ? "Check your inbox" : "Forgot Password?"}
          </h2>
          {!message && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Enter your email to reset your password
            </p>
          )}
        </div>

        {/* Middle Section (Form) */}
        <div className="flex-grow flex flex-col justify-center py-8">
          {message ? (
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-6">{message}</p>
              <AuthButton label="Back to Login" onClick={() => navigate("/login")} TrailingIcon={ArrowRight} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                Icon={Mail}
              />

              <AuthButton type="submit" label="Send Reset Link" isLoading={loading} TrailingIcon={ArrowRight} />
            </form>
          )}
        </div>

        {/* Bottom Section: Back to Login, as an outlined button like the
            second call to action on Login and Register */}
        {!message && (
          <div className="pb-4 md:pb-0">
            <AuthOutlineButton to="/login" nudge="left" icon={<ArrowLeft className="h-5 w-5" strokeWidth={2.25} />}>
              Back to Login
            </AuthOutlineButton>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
