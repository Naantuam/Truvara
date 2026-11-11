// Form controls for the onboarding wizard, styled to match the sign-in
// screens' InputField (rounded-xl, gray border, brand focus ring) and the
// company picker's selected state (gold border + ring).

const inputClass =
  "w-full p-2.5 sm:p-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

function Label({ htmlFor, label, hint }) {
  return (
    <div className="mb-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}

export function TextField({ id, label, hint, value, onChange, placeholder, type = "text", multiline = false }) {
  return (
    <div>
      <Label htmlFor={id} label={label} hint={hint} />
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export function SelectField({ id, label, hint, value, onChange, options, placeholder = "Select..." }) {
  return (
    <div>
      <Label htmlFor={id} label={label} hint={hint} />
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)} className={inputClass}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const pill = (selected) =>
  `px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors text-left ${
    selected
      ? "border-gold-500 bg-gold-50 ring-2 ring-gold-500 text-gray-900"
      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
  }`;

// Single choice. Clicking the selected option again clears it, so an
// answer is never forced once picked.
export function ChoiceGroup({ label, hint, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <Label label={label} hint={hint} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(value === o.value ? undefined : o.value)}
            className={pill(value === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function MultiChoice({ label, hint, value = [], onChange, options }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <Label label={label} hint={hint} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value.includes(o.value)}
            onClick={() => toggle(o.value)}
            className={pill(value.includes(o.value))}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
