import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import Logo from "./AuthComponents/Logo";
import AuthButton from "./AuthComponents/AuthButton";
import AuthIconTile from "./AuthComponents/AuthIconTile";
import AuthOutlineButton from "./AuthComponents/AuthOutlineButton";
import { Building2, Layers, ArrowRight, ArrowLeft, Check } from "lucide-react";
import api from "../api";
import { storeSession } from "../authSession";

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
      navigate("/login");
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

      storeSession(res.data);

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
          <AuthIconTile className="mt-6 md:mt-0">
            <Layers className="w-7 h-7" strokeWidth={2.25} />
          </AuthIconTile>
          <h2 className="text-xl font-bold text-gray-900 text-center mt-4">
            Choose a workspace
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            You have access to more than one company.
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-center py-6 gap-3">
          {/* Each company looks like an input row: gold icon tile that turns
              black when chosen, as a field's tile does when focused. */}
          {companies.map((c) => {
            const selected = selectedId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                aria-pressed={selected}
                className={`flex items-center gap-3 w-full text-left p-2 pr-4 rounded-xl bg-white border shadow-sm transition-all ${
                  selected ? "border-transparent ring-2 ring-black" : "border-gray-300 hover:border-black"
                }`}
              >
                <span
                  className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected ? "bg-black text-gold-300" : "bg-gold-100 text-gold-800"
                  }`}
                >
                  <Building2 size={18} strokeWidth={2.25} />
                </span>
                <span className="flex-1 font-medium text-gray-900">{c.name}</span>
                {selected && <Check className="h-5 w-5 text-black" strokeWidth={2.5} />}
              </button>
            );
          })}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="mt-4">
            <AuthButton
              type="button"
              label="Continue"
              isLoading={loading}
              disabled={!selectedId}
              onClick={handleSelect}
              TrailingIcon={ArrowRight}
            />
          </div>
        </div>

        <div className="pb-4 md:pb-0">
          <AuthOutlineButton to="/login" nudge="left" icon={<ArrowLeft className="h-5 w-5" strokeWidth={2.25} />}>
            Back to Login
          </AuthOutlineButton>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default SelectCompany;
