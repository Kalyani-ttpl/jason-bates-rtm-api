export interface JwtPayload {
  token_type: "access" | "refresh";
  user_id: string;
  id: number;
  jti: string;
  provider_id: number | null;
  language: string;
  /** Refresh tokens only: re-issue the refresh cookie as persistent on refresh. */
  remember_me?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: bigint;
  uuid: string;
  email: string | null;
  providerId: bigint | null;
  language: string;
}

export const PROVIDER_ROLES = {
  PHYSICIAN: "physician",
  NURSE: "nurse",
  CARE_MANAGER: "care_manager",
  BILLER: "biller",
  ADMIN: "admin",
} as const;

export const PROVIDER_PHYSICIAN_ROLES: Record<string, boolean> = {
  [PROVIDER_ROLES.PHYSICIAN]: true,
};

export const PROVIDER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  INVITED: "invited",
} as const;

/**
 * Question types. The first four are the only values `common_questions.type`
 * ever holds; the aliases below them are what the frontend sends. The rest are
 * care plan section names, stored on `care_plan_questions.type`.
 */
export enum QType {
  Allergies = "allergies",
  Medications = "medications",
  Supports = "supports",
  General = "general",

  GeneralQuestions = "general_questions",
  Support = "support",
  SupportQuestions = "support_questions",
  MedicationQuestions = "medication_questions",

  Goals = "goals",
  Barriers = "barriers",
  Symptoms = "symptoms",
  Interventions = "interventions",
  NumbersOfTrack = "numbers_of_track",
  ExpectedOutcome = "expected_outcome",
  CareplanAdditionalNotes = "careplan_additional_notes",
}

export const STORED_QUESTION_TYPES = [
  QType.Allergies,
  QType.Medications,
  QType.Supports,
  QType.General,
] as const;
