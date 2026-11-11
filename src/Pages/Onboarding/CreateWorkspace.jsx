import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2 } from "lucide-react";
import api from "../../api";
import AuthButton from "../../UserDetail/AuthComponents/AuthButton";
import { TextField, ChoiceGroup } from "./fields";
import { getOnboardingToken, getOnboardingUser, storeSession, apiErrorMessage } from "../../authSession";

// Step 3 of the journey: a verified person with no company yet creates their
// business workspace and becomes its Owner.
export default function CreateWorkspace({ onCreated }) {
  const navigate = useNavigate();
  const user = getOnboardingUser();
  const [form, setForm] = useState({ companyName: "", country: undefined });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.companyName.trim() || !form.country) {
      setError("Enter your business name and choose where it's based.");
      return;
    }

    setSubmitting(true);
    try {
      // Plain axios, not the shared client: this request carries the
      // onboarding token, and the shared client's 401 handling would try to
      // refresh a session that doesn't exist yet.
      const res = await axios.post(`${api.defaults.baseURL}/onboarding/workspace`, form, {
        headers: { Authorization: `Bearer ${getOnboardingToken()}` },
      });
      storeSession(res.data);
      onCreated();
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(apiErrorMessage(err, "We couldn't create your workspace. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {user?.full_name ? `Welcome, ${user.full_name.split(" ")[0]}` : "Welcome to Truvara"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Create your business workspace. You'll be its Owner, and can invite your team once it's set up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6" noValidate>
        <TextField
          id="companyName"
          label="Business name"
          placeholder="e.g. Acme Ventures"
          value={form.companyName}
          onChange={(v) => setForm({ ...form, companyName: v })}
        />
        <ChoiceGroup
          label="Where is the business based?"
          hint="Truvara currently supports businesses in Nigeria and the United States."
          value={form.country}
          onChange={(v) => setForm({ ...form, country: v })}
          options={[
            { value: "NG", label: "Nigeria" },
            { value: "US", label: "United States" },
          ]}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <AuthButton type="submit" label="Create workspace" isLoading={submitting} />
      </form>
    </>
  );
}
