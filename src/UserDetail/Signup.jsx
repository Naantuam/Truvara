import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, MailCheck, Clock } from "lucide-react";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthButton from "./AuthComponents/AuthButton";
import AuthLink from "./AuthComponents/AuthLink";
import InputField from "./AuthComponents/InputField";
import Logo from "./AuthComponents/Logo";
import api from "../api";
import { apiErrorMessage } from "../authSession";

const BRAND_MESSAGE =
  "Set up your business on Truvara. Decisions, accountability and finances in one place, from day one.";

// Self-service signup, step 1 of the journey: name, email and consent only.
// The password is chosen from the emailed link (ActivateAccount), which also
// proves the person owns this inbox.
export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", acceptedTerms: false });
  const [status, setStatus] = useState("checking"); // checking | open | closed | sent
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api
      .get("/auth/signup-status")
      .then((res) => setStatus(res.data.open ? "open" : "closed"))
      // If the check itself fails, show the form; the submit will report
      // the real state.
      .catch(() => setStatus("open"));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.acceptedTerms) {
      setError("Please accept the Terms of Use and Privacy Notice to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/signup", form);
      setStatus("sent");
    } catch (err) {
      if (err.response?.data?.code === "SIGNUP_CLOSED") setStatus("closed");
      else setError(apiErrorMessage(err, "We couldn't create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setNotice(null);
    try {
      await api.post("/auth/resend-activation", { email: form.email });
      setNotice("We've sent a new link. Earlier links no longer work.");
    } catch (err) {
      setNotice(apiErrorMessage(err, "We couldn't resend the email. Please try again shortly."));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout brandMessage={BRAND_MESSAGE}>
      <AuthCard>
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
        </div>

        {status === "checking" && <div className="py-16" />}

        {status === "closed" && (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="text-gray-900 text-xl font-bold">Sign-up opens soon</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              We're finishing the final security checks before businesses can create their own workspace.
              Already been invited by your company? Sign in instead.
            </p>
            <div className="w-full mt-2">
              <AuthButton type="button" label="Sign in" onClick={() => navigate("/login")} />
            </div>
          </div>
        )}

        {status === "sent" && (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
              <MailCheck className="w-6 h-6" />
            </div>
            <h1 className="text-gray-900 text-xl font-bold">Check your inbox</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              If <span className="font-semibold text-gray-900">{form.email}</span> can be used, we've sent it a link.
              Open it to verify your email and choose your password. The link expires in 48 hours.
            </p>
            {notice && <p className="text-sm text-gray-700">{notice}</p>}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-semibold text-brand-700 hover:text-gold-600 hover:underline disabled:opacity-60"
            >
              {resending ? "Sending..." : "Didn't get it? Send a new link"}
            </button>
          </div>
        )}

        {status === "open" && (
          <>
            <h1 className="text-gray-900 text-xl font-bold text-center mt-6 md:mt-0">Create your account</h1>
            <p className="text-sm text-gray-500 text-center mt-2">
              Start with your details. You'll set up your business next.
            </p>

            <div className="flex-grow flex flex-col justify-center py-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <InputField
                  id="fullName"
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={handleChange}
                  Icon={User}
                />
                <InputField
                  id="email"
                  type="email"
                  placeholder="Work email"
                  value={form.email}
                  onChange={handleChange}
                  Icon={Mail}
                />

                <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acceptedTerms}
                    onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-brand-600"
                  />
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" target="_blank" className="font-semibold text-brand-700 hover:underline">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" target="_blank" className="font-semibold text-brand-700 hover:underline">
                      Privacy Notice
                    </Link>
                    .
                  </span>
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="mt-2">
                  <AuthButton type="submit" label="Continue" isLoading={submitting} />
                </div>
              </form>
            </div>
          </>
        )}

        {status !== "closed" && (
          <div className="flex justify-center items-center gap-1 pb-4 md:pb-0 text-sm text-gray-600">
            Already have an account? <AuthLink to="/login">Sign in</AuthLink>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
