// The wizard's questions (PRD section 6), as data: the same definitions
// drive each step's form and the review summary. Field names and option
// values must match the backend allowlist in
// backend/src/services/onboardingService.js (STEP_SCHEMAS) -- anything else
// is stripped by the server.
//
// Every question is optional. "Not sure" appears wherever the PRD asks for
// it, and "Complete later" is always available.

const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

// Placeholder category list -- to be confirmed (and later driven by the
// reviewed rules catalogue, PRD section 2). "Other" opens a free-text field;
// legal obligations are never decided from the category alone.
const INDUSTRIES = [
  "Agriculture",
  "Construction",
  "Education",
  "Energy, oil and gas",
  "Financial services",
  "Food and hospitality",
  "Healthcare",
  "Logistics and transport",
  "Manufacturing",
  "Media and creative",
  "Professional services",
  "Real estate",
  "Retail and e-commerce",
  "Technology",
  "Other",
].map((label) => ({ value: label, label }));

const REGISTRATION_OPTIONS = {
  NG: [
    { value: "not_registered", label: "Not registered yet" },
    { value: "business_name", label: "Business Name / sole proprietorship" },
    { value: "partnership", label: "Partnership or other registered form" },
    { value: "ltd", label: "Private company limited by shares (Ltd)" },
    { value: "public_or_other", label: "Public company, LLP/LP or another structure" },
    { value: "outside_nigeria", label: "Registered outside Nigeria" },
    { value: "not_sure", label: "Not sure / need guidance" },
  ],
  US: [
    { value: "not_registered", label: "Not registered yet" },
    { value: "sole_proprietorship", label: "Sole proprietorship" },
    { value: "partnership", label: "Partnership" },
    { value: "llc", label: "LLC" },
    { value: "corporation", label: "Corporation" },
    { value: "public_or_other", label: "Another structure" },
    { value: "not_sure", label: "Not sure / need guidance" },
  ],
};

export const registrationOptionsFor = (country) => REGISTRATION_OPTIONS[country] || REGISTRATION_OPTIONS.NG;

export const STEPS = [
  {
    id: "identity",
    title: "Identity and location",
    intro: "The basics: what your business is called and where it operates.",
    fields: [
      { name: "tradingName", type: "text", label: "Business or trading name" },
      { name: "legalName", type: "text", label: "Legal name", hint: "Only if different from the trading name." },
      {
        name: "countryOfRegistration",
        type: "select",
        label: "Country of registration",
        options: [
          { value: "NG", label: "Nigeria" },
          { value: "US", label: "United States" },
          { value: "other", label: "Another country" },
          { value: "not_registered", label: "Not registered yet" },
        ],
      },
      {
        name: "operatingCountry",
        type: "select",
        label: "Main operating country",
        options: [
          { value: "NG", label: "Nigeria" },
          { value: "US", label: "United States" },
          { value: "other", label: "Another country" },
        ],
      },
      { name: "stateCity", type: "text", label: "State and city", placeholder: "e.g. Lagos, Ikeja" },
      {
        name: "operatingLocations",
        type: "textarea",
        label: "Other operating locations",
        hint: "Branches, sites or other states you operate in.",
      },
      { name: "website", type: "text", label: "Website or social link", placeholder: "Optional" },
      { name: "startYear", type: "number", label: "Year the business started", placeholder: "e.g. 2021" },
      {
        name: "stage",
        type: "choice",
        label: "Stage",
        options: [
          { value: "idea", label: "Idea" },
          { value: "newly_launched", label: "Newly launched" },
          { value: "operating", label: "Operating" },
          { value: "expanding", label: "Expanding" },
        ],
      },
    ],
  },
  {
    id: "industry",
    title: "Industry and activities",
    intro: "What the business does. Describe it in your own words; categories alone never decide your obligations.",
    fields: [
      { name: "primaryIndustry", type: "select", label: "Primary industry", options: INDUSTRIES },
      { name: "otherIndustry", type: "text", label: "Describe your industry", showIf: (a) => a.primaryIndustry === "Other" },
      { name: "description", type: "textarea", label: "What does your business do?", placeholder: "In plain language" },
      { name: "productsServices", type: "textarea", label: "Main products or services" },
      { name: "customers", type: "text", label: "Who are your main customers?" },
      { name: "revenueModel", type: "text", label: "How does the business make money?" },
      { name: "importsExports", type: "choice", label: "Does it import or export?", options: YES_NO_UNSURE },
      { name: "handlesCustomerFunds", type: "choice", label: "Does it hold or handle customer funds?", options: YES_NO_UNSURE },
      { name: "operatesPremises", type: "choice", label: "Does it operate physical premises?", options: YES_NO_UNSURE },
      { name: "employsFieldWorkers", type: "choice", label: "Does it employ field workers?", options: YES_NO_UNSURE },
      { name: "regulatedSector", type: "choice", label: "Does it work in a regulated sector?", options: YES_NO_UNSURE },
    ],
  },
  {
    id: "registration",
    title: "Registration status",
    intro: "How the business is registered today. If you're unsure, say so; you can ask for a professional review.",
    fields: [
      { name: "status", type: "registration", label: "Current registration" },
      {
        name: "registrationNumber",
        type: "text",
        label: "Registration number",
        showIf: (a) => a.status && !["not_registered", "not_sure"].includes(a.status),
      },
      {
        name: "registrationDate",
        type: "date",
        label: "Registration date",
        showIf: (a) => a.status && !["not_registered", "not_sure"].includes(a.status),
      },
      {
        name: "wantsStructureReview",
        type: "checkbox",
        label: "I'd like a professional to review whether my business structure still suits it",
        hint: "Guidance only, not a legal determination. Nothing is shared without your consent.",
      },
    ],
  },
  {
    id: "workforce",
    title: "Ownership and workforce",
    intro: "Who owns the business and who works in it. You can update this as you grow.",
    fields: [
      { name: "ownersCount", type: "number", label: "Number of founders, owners or partners" },
      {
        name: "staffBand",
        type: "choice",
        label: "Staff strength",
        options: ["0", "1-4", "5-9", "10-19", "20-49", "50+"].map((v) => ({ value: v, label: v.replace("-", "–") })),
      },
      {
        name: "employmentTypes",
        type: "multi",
        label: "Types of employment",
        hint: "Select all that apply.",
        options: [
          { value: "full_time", label: "Full-time" },
          { value: "part_time", label: "Part-time" },
          { value: "contract", label: "Contract" },
          { value: "casual", label: "Casual" },
          { value: "outsourced", label: "Outsourced" },
        ],
      },
      { name: "runsPayroll", type: "choice", label: "Does the business pay salaries or run payroll?", options: YES_NO_UNSURE },
      {
        name: "workplaceTypes",
        type: "multi",
        label: "Where does the work happen?",
        hint: "Select all that apply.",
        options: [
          { value: "office", label: "Office" },
          { value: "shop", label: "Shop" },
          { value: "depot", label: "Depot" },
          { value: "workshop", label: "Workshop" },
          { value: "vessel", label: "Vessel" },
          { value: "construction_site", label: "Construction site" },
          { value: "field_operations", label: "Field operations" },
          { value: "multiple_locations", label: "Multiple locations" },
          { value: "remote", label: "Remote" },
        ],
      },
    ],
  },
  {
    id: "tax",
    title: "Tax and compliance",
    intro:
      "Where things stand today. This helps organise possible next steps; it isn't tax advice. Only your workspace's owners can see these answers.",
    fields: [
      {
        name: "hasTaxRegistration",
        type: "choice",
        label: "Does the business have tax identification or registration details?",
        options: YES_NO_UNSURE,
      },
      {
        name: "filesTaxes",
        type: "choice",
        label: "Does it currently file or remit taxes?",
        options: [...YES_NO_UNSURE, { value: "need_advice", label: "Need advice" }],
      },
      { name: "hasAdviser", type: "choice", label: "Does it have an accountant or tax adviser?", options: YES_NO_UNSURE },
      {
        name: "taxNotes",
        type: "textarea",
        label: "Known tax notices or open questions",
        hint: "Optional and private.",
      },
      { name: "licences", type: "licences", label: "Sector licences or permits", hint: "Add any you hold. Optional." },
    ],
  },
];

// Display value for the review summary.
export function displayValue(field, value, answers, country) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return null;
  if (field.type === "checkbox") return value ? "Yes" : null;
  if (field.type === "licences") return value.map((l) => [l.type, l.number].filter(Boolean).join(" · ")).filter(Boolean).join("; ");
  const options = field.type === "registration" ? registrationOptionsFor(country) : field.options;
  if (options) {
    const labelFor = (v) => options.find((o) => o.value === v)?.label || v;
    return Array.isArray(value) ? value.map(labelFor).join(", ") : labelFor(value);
  }
  return String(value);
}
