import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import api from "../../api";
import AuthButton from "../../UserDetail/AuthComponents/AuthButton";
import { TextField, SelectField, ChoiceGroup, MultiChoice } from "./fields";
import { STEPS, registrationOptionsFor, displayValue } from "./onboardingSteps";
import { apiErrorMessage } from "../../authSession";

const REVIEW = STEPS.length; // index of the review screen

// Drop empty values and answers to questions that are currently hidden, so
// what's saved matches what the owner can see.
function cleanAnswers(step, answers) {
  const out = {};
  for (const field of step.fields) {
    if (field.showIf && !field.showIf(answers)) continue;
    let v = answers[field.name];
    if (field.type === "number") v = v === "" || v === undefined ? undefined : Number(v);
    if (field.type === "licences") v = (v || []).filter((l) => Object.values(l).some(Boolean));
    if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) continue;
    out[field.name] = v;
  }
  return out;
}

// First step not yet completed, or the review screen if all are.
const resumeIndex = (completed) => {
  const i = STEPS.findIndex((s) => !completed.includes(s.id));
  return i === -1 ? REVIEW : i;
};

function LicenceList({ value = [], onChange }) {
  const update = (i, key, v) => onChange(value.map((l, idx) => (idx === i ? { ...l, [key]: v } : l)));
  return (
    <div className="flex flex-col gap-3">
      {value.map((l, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl border border-gray-200">
          {[
            ["type", "Licence or permit"],
            ["number", "Number"],
            ["issuingBody", "Issuing body"],
            ["expiryDate", "Expiry date"],
          ].map(([key, placeholder]) => (
            <input
              key={key}
              type={key === "expiryDate" ? "date" : "text"}
              aria-label={placeholder}
              placeholder={placeholder}
              value={l[key] || ""}
              onChange={(e) => update(i, key, e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="sm:col-span-2 justify-self-end inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, {}])}
        className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-gold-600"
      >
        <Plus className="w-4 h-4" /> Add a licence or permit
      </button>
    </div>
  );
}

function Field({ field, answers, setAnswer, country }) {
  if (field.showIf && !field.showIf(answers)) return null;
  const value = answers[field.name];
  const onChange = (v) => setAnswer(field.name, v);
  const common = { id: field.name, label: field.label, hint: field.hint, value, onChange };

  switch (field.type) {
    case "textarea":
      return <TextField {...common} placeholder={field.placeholder} multiline />;
    case "number":
      return <TextField {...common} type="number" placeholder={field.placeholder} />;
    case "date":
      return <TextField {...common} type="date" />;
    case "select":
      return <SelectField {...common} options={field.options} />;
    case "choice":
      return <ChoiceGroup {...common} options={field.options} />;
    case "multi":
      return <MultiChoice {...common} options={field.options} />;
    case "registration":
      return <ChoiceGroup {...common} options={registrationOptionsFor(country)} />;
    case "checkbox":
      return (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked || undefined)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-brand-600"
          />
          <span>
            <span className="block text-sm font-semibold text-gray-900">{field.label}</span>
            {field.hint && <span className="block text-xs text-gray-500 mt-0.5">{field.hint}</span>}
          </span>
        </label>
      );
    case "licences":
      return (
        <div>
          <p className="text-sm font-semibold text-gray-900">{field.label}</p>
          {field.hint && <p className="text-xs text-gray-500 mt-0.5 mb-2">{field.hint}</p>}
          <LicenceList value={value} onChange={onChange} />
        </div>
      );
    default:
      return <TextField {...common} placeholder={field.placeholder} />;
  }
}

function Progress({ index, completed, onJump }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5" role="list" aria-label="Onboarding progress">
        {STEPS.map((s, i) => {
          const done = completed.includes(s.id);
          const current = i === index;
          return (
            <button
              key={s.id}
              type="button"
              role="listitem"
              onClick={() => onJump(i)}
              aria-current={current ? "step" : undefined}
              title={s.title}
              className={`h-2 flex-1 rounded-full transition-colors ${
                current ? "bg-gold-500" : done ? "bg-brand-600" : "bg-gray-200 hover:bg-gray-300"
              }`}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs font-semibold text-gray-500">
        {index < REVIEW ? `Step ${index + 1} of ${STEPS.length}` : "Review"} · {completed.length} of {STEPS.length} complete
      </p>
    </div>
  );
}

export default function OnboardingWizard({ companyCountry }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(null); // "next" | "later" | "finish"
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/onboarding/profile")
      .then((res) => {
        setProfile(res.data);
        setIndex(resumeIndex(res.data.completedSteps));
      })
      .catch((err) =>
        setLoadError(
          err.response?.status === 403
            ? "Only the workspace's owner can fill in the business profile."
            : apiErrorMessage(err, "We couldn't load your business profile.")
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const step = STEPS[index];
  // Seed the form each time a different step opens.
  useEffect(() => {
    if (profile && step) setDraft(profile.answers?.[step.id] || {});
  }, [profile, step]);

  const country = useMemo(() => {
    const c = profile?.answers?.identity?.countryOfRegistration;
    return c === "US" || c === "NG" ? c : companyCountry;
  }, [profile, companyCountry]);

  const setAnswer = (name, value) => setDraft((d) => ({ ...d, [name]: value }));

  const save = async (complete) => {
    const res = await api.patch(`/onboarding/profile/${step.id}`, { answers: cleanAnswers(step, draft), complete });
    setProfile(res.data);
    return res.data;
  };

  const run = async (kind, action) => {
    setSaving(kind);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(apiErrorMessage(err, "We couldn't save your answers. Please try again."));
    } finally {
      setSaving(null);
    }
  };

  const handleNext = () =>
    run("next", async () => {
      const saved = await save(true);
      setIndex(index + 1 < STEPS.length ? resumeIndexFrom(index + 1, saved.completedSteps) : REVIEW);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  // Skip forward past steps already done, but never backwards.
  const resumeIndexFrom = (from, completed) => {
    for (let i = from; i < STEPS.length; i += 1) if (!completed.includes(STEPS[i].id)) return i;
    return REVIEW;
  };

  const handleLater = () =>
    run("later", async () => {
      if (step) await save(profile.completedSteps.includes(step.id));
      navigate("/dashboard");
    });

  const handleFinish = () =>
    run("finish", async () => {
      await api.post("/onboarding/profile/complete");
      navigate("/dashboard");
    });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-700">{loadError}</p>
        <div className="mt-6">
          <AuthButton type="button" label="Go to dashboard" onClick={() => navigate("/dashboard")} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Progress index={index} completed={profile.completedSteps} onJump={setIndex} />

      {index < REVIEW ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          noValidate
        >
          <h1 className="text-xl font-bold text-gray-900">{step.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{step.intro}</p>

          <div className="flex flex-col gap-6 mt-6">
            {step.fields.map((f) => (
              <Field key={f.name} field={f} answers={draft} setAnswer={setAnswer} country={country} />
            ))}
          </div>

          {error && <p className="text-sm text-red-600 mt-6">{error}</p>}

          <div className="mt-8 flex flex-col gap-3">
            <AuthButton type="submit" label="Save and continue" isLoading={saving === "next"} disabled={Boolean(saving)} />
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                disabled={index === 0 || Boolean(saving)}
                className="font-semibold text-gray-600 hover:text-gray-900 disabled:invisible"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleLater}
                disabled={Boolean(saving)}
                className="font-semibold text-brand-700 hover:text-gold-600 disabled:opacity-60"
              >
                {saving === "later" ? "Saving..." : "Complete later"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <h1 className="text-xl font-bold text-gray-900">Review your business profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Check your answers before finishing. You can change any of them later.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {STEPS.map((s, i) => {
              const answers = profile.answers?.[s.id] || {};
              const rows = s.fields
                .map((f) => [f.label, displayValue(f, answers[f.name], answers, country)])
                .filter(([, v]) => v);
              const done = profile.completedSteps.includes(s.id);
              return (
                <section key={s.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          done ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {done ? <Check className="w-3 h-3" /> : <span className="text-[10px]">{i + 1}</span>}
                      </span>
                      {s.title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-gold-600"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  {rows.length ? (
                    <dl className="mt-3 grid grid-cols-1 gap-2">
                      {rows.map(([label, v]) => (
                        <div key={label} className="text-sm">
                          <dt className="text-gray-500">{label}</dt>
                          <dd className="text-gray-900 font-medium break-words">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">Nothing filled in yet.</p>
                  )}
                </section>
              );
            })}
          </div>

          {error && <p className="text-sm text-red-600 mt-6">{error}</p>}

          <div className="mt-8">
            <AuthButton
              type="button"
              label={profile.completedAt ? "Back to dashboard" : "Finish"}
              isLoading={saving === "finish"}
              onClick={profile.completedAt ? () => navigate("/dashboard") : handleFinish}
            />
          </div>
        </div>
      )}
    </>
  );
}
