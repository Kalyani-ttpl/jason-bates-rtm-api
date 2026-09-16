/**
 * The 23 care plan common questions, ported verbatim from Zenara's
 * `src/util/careplandata.ts`. `POST /import-data` writes them into
 * `common_questions`; `GET /common-question` reads them back by type.
 */
export interface CommonQuestionSeed {
  title: string;
  options: string[];
  question_type: string;
}

export const MEDICATION_QUESTIONS: CommonQuestionSeed[] = [
  {
    title:
      "Let's review the patient's prescription medications, dietary and/or herbal supplements, and/or over-the-counter medicine.",
    options: [
      "Select from list",
      "Enter as Free  text",
      "List reviewed in EHR",
      "Patient reports that they do not actively take any medication.",
    ],
    question_type: "single_select",
  },
  {
    title: "Do you forget to take your medication more than once a week?",
    options: [
      "Yes, I have occasionally forgotten to take my medication more than once a week.",
      "No, I never forget to take my medication.",
      "Forget to take medicine occasionally",
      "Not applicable or skip",
    ],
    question_type: "single_select",
  },
  {
    title: "Do you sometimes forget to refill your prescription(s)?",
    options: [
      "Yes, sometimes I forget to refill my prescription(s).",
      "No, I never forget to refill my prescription(s).",
      "Not applicable or skip",
    ],
    question_type: "single_select",
  },
  {
    title:
      "Do you stop taking your medication without discussing it with your healthcare provider first, just because you start feeling better?",
    options: [
      "Yes, I stop taking my medication when I start feeling better without consulting my healthcare provider first",
      "With my healthcare provider's approval, I stop taking medication when I start to feel better.",
      "I never stop taking my medication, even if I feel better.",
      "Not applicable or skip",
    ],
    question_type: "single_select",
  },
  {
    title:
      "Do you stop taking your medication without discussing it with your healthcare provider first, just because you start feeling worse?",
    options: [
      "Yes, I stop taking my medication when I feel worse, without discussing it with my healthcare provider first.",
      "With my healthcare provider's approval,  I stop taking my medication when I begin to feel worse.",
      "I never stop taking my medication, even if I feel worse.",
      "Not applicable or skip",
    ],
    question_type: "single_select",
  },
  {
    title:
      "Do you report any side effects from your medication to your healthcare provider?",
    options: [
      "I always report my medication side effects to my healthcare provider.",
      "I occasionally report my medication side effects to my healthcare provider.",
      "I never report my medication side effects to my healthcare provider.",
      "Not applicable or skip",
    ],
    question_type: "single_select",
  },
];

export const ALLERGY_QUESTIONS: CommonQuestionSeed[] = [
  {
    title: "Do you have any allergies?",
    options: [
      "Yes, I do have allergies.",
      "No, I do not have any allergies.",
      "Enter as free text",
    ],
    question_type: "single_select",
  },
];

export const SUPPORT_QUESTIONS: CommonQuestionSeed[] = [
  {
    title:
      "It's really important that we have an accurate list of the care team members or providers involved in your healthcare. Let's make a list of your care team.",
    options: [
      "Dropdown list of eligible providers",
      "Free text",
      "Not applicable",
    ],
    question_type: "single_select",
  },
  {
    title:
      "It's also important for us to know which family or surrounding member you can turn to for help for any health related problems (e.g.- family, neighbor, friends, and/or spiritual leaders).",
    options: [
      "Dropdown for List of family with multiple selection options",
      "Free text",
      "Not applicable",
    ],
    question_type: "single_select",
  },
  {
    title:
      "Who in your support group can you turn to for help with your health if needed?",
    options: [],
    question_type: "free_text",
  },
  {
    title: "Is your support system adequate and meeting your needs?",
    options: [
      "Yes",
      "No",
      "I am independent and require not additional support at this time",
    ],
    question_type: "sinle_select",
  },
  {
    title: "Do you have difficulty obtaining any of the following resources?",
    options: [
      "Housing",
      "Clothing",
      "Food",
      "Transportation",
      "Employment",
      "Financial assistance",
    ],
    question_type: "multi_select",
  },
  {
    title:
      "If needed, please elaborate on difficulties obtaining these resources?",
    options: [],
    question_type: "free_text",
  },
];

export const GENERAL_QUESTIONS: CommonQuestionSeed[] = [
  {
    title: "How would you rate your overall physical health",
    options: ["Excellent", "Fair", "Good", "Poor", "Very Good"],
    question_type: "single_select",
  },
  {
    title:
      "What activities of daily living (ADLs) do you currently require assistance with?",
    options: [
      "Bathing",
      "Dressing",
      "Feeding",
      "Grooming",
      "Toileting",
      "Transferring",
      "Walking",
    ],
    question_type: "multi_select",
  },
  {
    title:
      "What instrumental activities of daily living (IADLs) do you currently require assistance with?",
    options: [
      "House keeping and home maintenance",
      "Managing finances",
      "Medication management",
      "Preparing meals",
      "Shopping",
      "Transportation",
    ],
    question_type: "multi_select",
  },
  {
    title:
      "Do you have a history of falling or feeling unsteady while walking?",
    options: ["No", "Yes"],
    question_type: "single_select",
  },
  {
    title: "Do you have any problems with pain?",
    options: [
      "No, I do not experience pain routinely",
      "Yes, my pain is currently adequately managed",
      "Yes, my pain is currently unmanaged",
    ],
    question_type: "single_select",
  },
  {
    title:
      "If necessary, please provide more details about the pain issues you are experiencing.",
    options: [],
    question_type: "free_text",
  },
  {
    title:
      "Do you have a good understanding of your health conditions, including when to seek additional help from a healthcare provider?",
    options: ["No", "Yes"],
    question_type: "single_select",
  },
  {
    title: "Do you have life planning documents in place?",
    options: ["No", "Yes"],
    question_type: "single_select",
  },
  {
    title: "What is your recommended diet?",
    options: [
      "Cardiac diet (low fat, low sodium/salt)",
      "Diabetic diet (limits high carbohydrate foods)",
      "Fluid restriction",
      "High fiber diet",
      "High protein",
      "Low fat/low cholesterol diet (low fat in diet, typically < 50g per day)",
      "Low protein (limits protein, typically < 60g per day)",
      "Low sodium diet (low sodium or salt, typically < 2000mg per day)",
      "Mechanical Soft (foods soft in texture and low fiber for those who have difficulty chewing)",
      "Other diet",
      "Renal diet (limiting potassium, salt, phosphorus, and protein)",
    ],
    question_type: "multi_select",
  },
  {
    title: "In the past week, how many days did you exercise?",
    options: ["1-2 days", "3-4 days", "5-7 days", "No days"],
    question_type: "single_select",
  },
];
