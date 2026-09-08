/**
 * Boilerplate consent bodies offered when creating a consent form. Static in
 * Zenara too, so no table backs this list.
 */
export const ADDITIONAL_CONSENT_TEMPLATES = [
  {
    key: "general_treatment",
    title: "General Consent to Treatment",
    body: "I voluntarily consent to the health care services provided by the practice and its staff. I understand that the practice of medicine is not an exact science and that no guarantees have been made to me about the outcome of any treatment or examination.",
  },
  {
    key: "hipaa_notice",
    title: "HIPAA Notice of Privacy Practices",
    body: "I acknowledge that I have received a copy of the Notice of Privacy Practices, which describes how my health information may be used and disclosed and how I can access this information.",
  },
  {
    key: "financial_responsibility",
    title: "Financial Responsibility",
    body: "I authorize the practice to bill my insurance and assign benefits. I understand that I am financially responsible for any balance not covered by my insurance.",
  },
  {
    key: "telehealth",
    title: "Telehealth Consent",
    body: "I consent to receive health care services via telehealth. I understand the benefits and limitations of telehealth, including the possibility that technical issues may interrupt a visit.",
  },
  {
    key: "release_of_information",
    title: "Authorization to Release Information",
    body: "I authorize the practice to request and receive my medical records from other providers, and to release my records to providers involved in my care.",
  },
];
