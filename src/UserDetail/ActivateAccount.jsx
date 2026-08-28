import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthButton from "./AuthComponents/AuthButton";
import InputField from "./AuthComponents/InputField";
import Logo from "./AuthComponents/Logo";
import { Lock } from "lucide-react";

export default function ActivateAccount() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [isValid, setIsValid] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [message, setMessage] = useState("Verifying link...");
  
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/users/activate/${uid}/${token}/`);
        setIsValid(true);
        setMessage("Please set a password for your new account.");
      } catch (error) {
        console.error(error);
        setMessage("❌ Activation failed. The link may be invalid or expired.");
        setIsValid(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    if (uid && token) {
      verifyToken();
    }
  }, [uid, token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post(`/users/activate/${uid}/${token}/`, { password: form.password });
      setMessage("✅ Account activated! Redirecting to login...");
      setIsValid(false); // Hide the form
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to set password and activate account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
          <h1 className="text-white text-xl font-bold text-center mt-6 mb-2">
            Activate Your Account
          </h1>
          <p className="text-gray-300 text-sm text-center mb-6">{message}</p>
        </div>

        {loadingStatus && (
          <div className="flex justify-center text-white pb-6">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {!loadingStatus && isValid && (
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

              <div className="mt-4">
                <AuthButton
                  type="submit"
                  label="Set Password & Activate"
                  isLoading={submitting}
                />
              </div>
            </form>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}