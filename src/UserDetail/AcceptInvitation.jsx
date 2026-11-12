import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Users, CheckCircle2, XCircle, ArrowRight, X } from "lucide-react";
import api from "../api";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthButton from "./AuthComponents/AuthButton";
import InputField from "./AuthComponents/InputField";
import Logo from "./AuthComponents/Logo";
import AuthIconTile from "./AuthComponents/AuthIconTile";
import AuthOutlineButton from "./AuthComponents/AuthOutlineButton";
import { routeForAuthResponse, apiErrorMessage } from "../authSession";

// /invite?token=... from an invitation email. The person sees which company
// invited them, as what, and by whom, then accepts or declines. Nobody is
// added to a company until they accept here.
//   - new to Truvara: choose a password while accepting, then signed in
//   - already has an account: accept, then sign in with their own password
export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState(token ? "loading" : "invalid"); // loading | invalid | ready | accepted | declined
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(null); // "accept" | "decline"
  const [error, setError] = useState(null);
  const [joinedCompany, setJoinedCompany] = useState(null);

  useEffect(() => {
    if (!token) return;
    api
      .post("/invitations/preview", { token })
      .then((res) => {
        setInvite(res.data);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleAccept = async (e) => {
    e.preventDefault();
    setError(null);
    if (invite.needsPassword) {
      if (form.password.length < 8) return setError("Use at least 8 characters for your password.");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    }

    setBusy("accept");
    try {
      const res = await api.post("/invitations/accept", {
        token,
        ...(invite.needsPassword ? { password: form.password } : {}),
      });
      if (res.data?.accepted) {
        setJoinedCompany(res.data.company_name);
        setStatus("accepted");
      } else {
        const { to, state } = routeForAuthResponse(res.data);
        navigate(to, { state, replace: true });
      }
    } catch (err) {
      setError(apiErrorMessage(err, "We couldn't accept this invitation. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async () => {
    setError(null);
    setBusy("decline");
    try {
      await api.post("/invitations/decline", { token });
      setStatus("declined");
    } catch (err) {
      setError(apiErrorMessage(err, "We couldn't decline this invitation. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
        </div>

        {status === "loading" && <div className="py-16" />}

        {status === "invalid" && (
          <Message
            icon={<XCircle className="w-7 h-7" strokeWidth={2.25} />}
            title="This invitation can't be used"
            body="The link is invalid, has expired, or has already been used. Ask the person who invited you to send a new invitation."
          >
            <AuthButton type="button" label="Go to sign in" onClick={() => navigate("/login")} TrailingIcon={ArrowRight} />
          </Message>
        )}

        {status === "declined" && (
          <Message
            icon={<CheckCircle2 className="w-7 h-7" strokeWidth={2.25} />}
            title="Invitation declined"
            body={`You haven't been added to ${invite?.companyName}. You can close this page.`}
          />
        )}

        {status === "accepted" && (
          <Message
            icon={<CheckCircle2 className="w-7 h-7" strokeWidth={2.25} />}
            title={`You've joined ${joinedCompany}`}
            body="Sign in with your existing password to start working with your team."
          >
            <AuthButton type="button" label="Sign in" onClick={() => navigate("/login")} TrailingIcon={ArrowRight} />
          </Message>
        )}

        {status === "ready" && (
          <>
            <div className="flex flex-col items-center text-center mt-6 md:mt-0">
              <AuthIconTile className="mb-4">
                <Users className="w-7 h-7" strokeWidth={2.25} />
              </AuthIconTile>
              <h1 className="text-gray-900 text-xl font-bold">Join {invite.companyName}</h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {invite.inviterName ? `${invite.inviterName} has invited you` : "You've been invited"} to join{" "}
                <span className="font-semibold text-gray-900">{invite.companyName}</span> on Truvara as{" "}
                <span className="font-semibold text-gray-900">{invite.roleName}</span>.
              </p>
              <p className="text-xs text-gray-500 mt-2">{invite.email}</p>
            </div>

            <div className="flex-grow flex flex-col justify-center py-6">
              <form onSubmit={handleAccept} className="flex flex-col gap-5" noValidate>
                {invite.needsPassword && (
                  <>
                    <p className="text-sm text-gray-500 text-center">Choose a password for your new account.</p>
                    <InputField
                      id="password"
                      type="password"
                      placeholder="Password (at least 8 characters)"
                      value={form.password}
                      onChange={handleChange}
                      Icon={Lock}
                    />
                    <InputField
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      Icon={Lock}
                    />
                  </>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <AuthButton type="submit" label="Accept invitation" isLoading={busy === "accept"} TrailingIcon={ArrowRight} />
                <AuthOutlineButton
                  onClick={handleDecline}
                  disabled={Boolean(busy)}
                  icon={<X className="h-5 w-5" strokeWidth={2.5} />}
                >
                  {busy === "decline" ? "Declining..." : "Decline invitation"}
                </AuthOutlineButton>
              </form>
            </div>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}

function Message({ icon, title, body, children }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-4">
      <AuthIconTile>{icon}</AuthIconTile>
      <h1 className="text-gray-900 text-xl font-bold">{title}</h1>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
      {children && <div className="w-full mt-2">{children}</div>}
    </div>
  );
}
