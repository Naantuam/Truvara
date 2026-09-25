import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import Logo from "./AuthComponents/Logo";
import AuthButton from "./AuthComponents/AuthButton";
import { Building2 } from "lucide-react";
import api from "../api";
import { clearCache } from "../dataCache";

// Reached only when login proves a password is correct but the person
// belongs to more than one company (e.g. an Owner involved in two
// businesses) -- picking a workspace here, not guessing one.
const SelectCompany = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const companies = location.state?.companies;
  const preAuthToken = location.state?.preAuthToken;

  useEffect(() => {
    if (!companies || !preAuthToken) {
      navigate("/");
    }
  }, [companies, preAuthToken, navigate]);

  const handleSelect = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/select-company/", {
        pre_auth_token: preAuthToken,
        company_id: selectedId,
      });

      clearCache();

      const { access, refresh, user } = res.data;
      if (access) localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to select company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!companies || !preAuthToken) return null;

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center mt-4 md:mt-0">
          <Logo />
          <h2 className="text-xl font-bold text-gray-900 text-center mt-6">
            Choose a workspace
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            You have access to more than one company.
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-center py-6 gap-3">
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                selectedId === c.id
                  ? "border-gold-500 bg-gold-50 ring-2 ring-gold-500"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Building2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">{c.name}</span>
            </button>
          ))}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="mt-4">
            <AuthButton
              type="button"
              label="Continue"
              isLoading={loading}
              disabled={!selectedId}
              onClick={handleSelect}
            />
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default SelectCompany;
