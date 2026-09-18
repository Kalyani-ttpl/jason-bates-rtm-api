-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "email" VARCHAR(254),
    "password_hash" VARCHAR(128),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(3),
    "password_changed_at" TIMESTAMPTZ(3),
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "username" VARCHAR(150),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "picture" TEXT,
    "date_joined" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "is_superuser" BOOLEAN DEFAULT false,
    "is_staff" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "is_provider" BOOLEAN DEFAULT false,
    "is_patient" BOOLEAN DEFAULT false,
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icd_codes" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "code" VARCHAR(200),
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_unspecified" BOOLEAN NOT NULL DEFAULT false,
    "is_hipaa_covered" VARCHAR(100),
    "order_number" VARCHAR(255),
    "condition_id" BIGINT,

    CONSTRAINT "icd_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpt_codes" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "code" VARCHAR(255),
    "description" VARCHAR(500),
    "amount" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "category" VARCHAR(100),
    "global_period" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cpt_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT,
    "employee_id" BIGINT,
    "type" TEXT,
    "line1" TEXT,
    "line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_groups" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "group_name" VARCHAR(255),
    "group_npi" VARCHAR(10),
    "code" VARCHAR(3),
    "email" VARCHAR(254),
    "system_email" VARCHAR(254),
    "system_email_verified" BOOLEAN DEFAULT false,
    "phone" VARCHAR(15),
    "fax_id" VARCHAR(20),
    "website" VARCHAR(200),
    "speciality" JSON,
    "status" VARCHAR(10),
    "picture" TEXT,
    "bio" TEXT,
    "caller_id" VARCHAR(15),
    "caller_id_verified" BOOLEAN DEFAULT false,
    "physical_address_id" BIGINT,
    "billing_address_id" BIGINT,
    "device_vender_base_url" VARCHAR(200),
    "show_revenue" BOOLEAN DEFAULT false,
    "timezone" VARCHAR,
    "communication_logo" TEXT,
    "consent_logo" TEXT,
    "report_logo" TEXT,
    "disable_patient_emails" BOOLEAN DEFAULT false,
    "disable_patient_notifications" BOOLEAN DEFAULT false,
    "disable_patient_sms" BOOLEAN DEFAULT false,
    "disable_provider_emails" BOOLEAN DEFAULT false,
    "disable_provider_notifications" BOOLEAN DEFAULT false,
    "disable_provider_sms" BOOLEAN DEFAULT false,
    "disable_patient_calls" BOOLEAN DEFAULT false,
    "disable_call_recording" BOOLEAN DEFAULT false,

    CONSTRAINT "provider_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "first_name" VARCHAR(255),
    "middle_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "display_name" VARCHAR(255),
    "gender" VARCHAR(100),
    "pronoun" VARCHAR(50),
    "email" VARCHAR(254),
    "temparory_email" VARCHAR(254),
    "phone" VARCHAR(15),
    "npi" VARCHAR(10),
    "role" VARCHAR(30),
    "secondary_role" VARCHAR(30),
    "permission" VARCHAR(100),
    "language" VARCHAR(20),
    "timezone" VARCHAR,
    "picture" TEXT,
    "status" VARCHAR(20),
    "speciality" JSON,
    "provider_type" VARCHAR(255),
    "year_of_experience" VARCHAR(10),
    "bio" TEXT,
    "state_license" VARCHAR(50),
    "license_number" VARCHAR(50),
    "taxonomyCode" VARCHAR(100),
    "caller_id" VARCHAR(15),
    "caller_id_verified" BOOLEAN DEFAULT false,
    "dynamic_caller_ids" JSON,
    "is_partner" BOOLEAN DEFAULT false,
    "is_clinical_manager" BOOLEAN NOT NULL DEFAULT false,
    "is_auto_timelog" BOOLEAN DEFAULT false,
    "auto_timelog_message" VARCHAR,
    "is_role_changed" BOOLEAN DEFAULT false,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_reason" VARCHAR(255),
    "user_id" BIGINT,
    "added_by_id" BIGINT,
    "deleted_by_id" BIGINT,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_group_members" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "provider_id" BIGINT NOT NULL,
    "provider_group_id" BIGINT NOT NULL,

    CONSTRAINT "provider_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(200),
    "description" VARCHAR(255),
    "for_ccm" BOOLEAN DEFAULT false,
    "for_pcm" BOOLEAN DEFAULT false,
    "for_bhi" BOOLEAN DEFAULT false,
    "for_rpm" BOOLEAN DEFAULT false,
    "programs" JSON,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_questions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "condition_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" TEXT,
    "question_type" VARCHAR(50),
    "choices" TEXT,
    "additional_note" TEXT,

    CONSTRAINT "condition_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT,
    "description" TEXT,
    "status" TEXT,
    "due_date" TIMESTAMPTZ(3),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "action" VARCHAR(20),
    "patient_note" TEXT,
    "completed_at" TIMESTAMPTZ(3),
    "is_billable" BOOLEAN NOT NULL DEFAULT true,
    "assignee_id" BIGINT,
    "assigned_by_id" BIGINT,
    "provider_group_id" BIGINT,
    "reminder_set" BOOLEAN NOT NULL DEFAULT false,
    "reminder_send_to_host" BOOLEAN NOT NULL DEFAULT false,
    "reminder_mediums" JSONB,
    "reminder_before_number" INTEGER,
    "reminder_before_unit" VARCHAR(20),
    "reminder_at" TIMESTAMPTZ(3),
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "session_id" BIGINT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_types" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255),
    "is_billable" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "provider_group_id" BIGINT,
    "created_by_id" BIGINT,

    CONSTRAINT "task_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_communication_templates" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255),
    "subject" VARCHAR(255),
    "template_body" TEXT,
    "template_type" VARCHAR(100),
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "provider_group_id" BIGINT,
    "created_by_id" BIGINT,
    "updated_by_id" BIGINT,
    "achieved_by_id" BIGINT,

    CONSTRAINT "bulk_communication_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_communication_template_revisions" (
    "id" UUID NOT NULL,
    "template_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "old_title" VARCHAR(255),
    "new_title" VARCHAR(255),
    "old_content" TEXT,
    "new_content" TEXT,
    "revision_by_id" BIGINT,

    CONSTRAINT "bulk_communication_template_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(200),
    "program" VARCHAR(100),
    "file" TEXT,
    "created_by_id" BIGINT,
    "deleted_by_id" BIGINT,
    "deleted_at" TIMESTAMPTZ,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plans" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(200),
    "description" VARCHAR(255),
    "support" BOOLEAN NOT NULL DEFAULT false,
    "allergies" BOOLEAN NOT NULL DEFAULT false,
    "medications" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "programs" JSON,
    "copied" BOOLEAN NOT NULL DEFAULT false,
    "copied_from_id" BIGINT,
    "creator_id" BIGINT,
    "provider_group_id" BIGINT,

    CONSTRAINT "care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "user_id" BIGINT,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "preferred_name" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "phone" TEXT,
    "phone_type" TEXT,
    "email" TEXT,
    "preferred_contact_method" TEXT,
    "preferred_language" TEXT,
    "pronoun" TEXT,
    "race" TEXT,
    "ethnicity" TEXT,
    "secondary_phone" TEXT,
    "home_phone" TEXT,
    "work_phone" TEXT,
    "timezone" TEXT,
    "pos" TEXT,
    "notes" TEXT,
    "registration_date" DATE,
    "referring_provider" TEXT,
    "preferred_communication_channel" TEXT,
    "disable_call_recording" BOOLEAN NOT NULL DEFAULT false,
    "interpreter_required" BOOLEAN NOT NULL DEFAULT false,
    "has_advanced_directive" BOOLEAN NOT NULL DEFAULT false,
    "has_power_of_attorney" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile_picture" TEXT,
    "treatment_goals" TEXT[],
    "referring_physician" TEXT,
    "referring_physician_number" TEXT,
    "primary_care_physician" TEXT,
    "primary_care_physician_number" TEXT,
    "hear_about_us" TEXT,
    "outside_records_consent" BOOLEAN NOT NULL DEFAULT false,
    "hipaa_notice" BOOLEAN NOT NULL DEFAULT false,
    "treatment_consent" BOOLEAN NOT NULL DEFAULT false,
    "financial_consent" BOOLEAN NOT NULL DEFAULT false,
    "signature" TEXT,
    "signature_date" DATE,
    "printed_first_name" TEXT,
    "printed_middle_name" TEXT,
    "printed_last_name" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "mrn" TEXT,
    "status" TEXT,
    "status_updated_at" TIMESTAMPTZ(3),
    "invite_status" TEXT,
    "invited_at" TIMESTAMPTZ(3),
    "last_call_at" TIMESTAMPTZ(3),
    "last_call_status" TEXT,
    "risk_level" TEXT,
    "risk_score" DOUBLE PRECISION,
    "cms_risk_score" DOUBLE PRECISION,
    "cms_risk_tier" TEXT,
    "risk_stratification_bool" BOOLEAN,
    "risk_stratification_date" TIMESTAMPTZ(3),
    "risk_stratification_freq" INTEGER,
    "marital_status" TEXT,
    "is_consent_to_message" BOOLEAN DEFAULT false,
    "is_consent_to_call" BOOLEAN DEFAULT false,
    "is_consent_to_email" BOOLEAN DEFAULT false,
    "is_pcm_eligible" BOOLEAN DEFAULT false,
    "is_rtm_eligible" BOOLEAN DEFAULT false,
    "is_send_consent_rtm" BOOLEAN DEFAULT false,
    "is_heart_eligible" BOOLEAN DEFAULT false,
    "primary_physician_id" BIGINT,
    "primary_care_manager_id" BIGINT,
    "secondary_care_manager_id" BIGINT,
    "provider_group_id" BIGINT,
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_insurances" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "member_id" TEXT,
    "group_id" TEXT,
    "group_name" TEXT,
    "type" TEXT,
    "card_front_url" TEXT,
    "card_back_url" TEXT,
    "effective_date" DATE,
    "expiration_date" DATE,
    "insured_first_name" TEXT,
    "insured_middle_name" TEXT,
    "insured_last_name" TEXT,
    "insured_dob" DATE,
    "relationship_to_insured" TEXT,
    "is_workers_comp_or_auto" BOOLEAN NOT NULL DEFAULT false,
    "claim_number" TEXT,
    "adjuster_name" TEXT,
    "adjuster_phone" TEXT,
    "rtm_eligible" BOOLEAN DEFAULT true,
    "rtm_note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_emergency_contacts" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "relationship" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "preferred_language" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_power_of_attorneys" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_power_of_attorneys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_preferred_pharmacies" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_preferred_pharmacies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_imagings" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "facility" TEXT,
    "date" DATE,
    "image_urls" TEXT[],
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_imagings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_allergies" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT,
    "criticality" TEXT,
    "onset_date" DATE,
    "notes" TEXT,
    "is_source_ehr" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_by_id" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medications" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "prescribing_provider" BIGINT,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "notes" TEXT,
    "status" TEXT,
    "sig" TEXT,
    "unit" TEXT,
    "taken_when" TEXT,
    "days" INTEGER,
    "for_lifetime" BOOLEAN NOT NULL DEFAULT false,
    "is_source_ehr" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_by_id" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medical_histories" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "condition" TEXT NOT NULL,
    "date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_medical_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_surgical_histories" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "procedure" TEXT NOT NULL,
    "date" DATE,
    "surgeon" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_surgical_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_social_histories" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "occupation" TEXT,
    "physical_job_demands" TEXT,
    "activity" TEXT,
    "tobacco_use" TEXT,
    "tobacco_frequency" TEXT,
    "alcohol_use" TEXT,
    "living_situation" TEXT,
    "history_of_falls" BOOLEAN,
    "number_of_falls" INTEGER,
    "assistive_devices" TEXT[],
    "height" TEXT,
    "weight" TEXT,
    "dominant_hand" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "patient_social_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_documents" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "source" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "folder" TEXT,
    "hash" TEXT,
    "tag" VARCHAR(50),
    "metadata" JSONB,
    "is_signed" BOOLEAN NOT NULL DEFAULT false,
    "is_consent" BOOLEAN NOT NULL DEFAULT false,
    "is_program_consent" BOOLEAN NOT NULL DEFAULT false,
    "consent_for" VARCHAR(50),
    "consent_at" TIMESTAMPTZ(3),
    "signed_at" TIMESTAMPTZ(3),
    "consent_timezone" TEXT,
    "already_consented" BOOLEAN NOT NULL DEFAULT false,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "expired_at" TIMESTAMPTZ(3),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMPTZ(3),
    "unarchived_at" TIMESTAMPTZ(3),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "modified_at" TIMESTAMPTZ(3),
    "created_by_id" BIGINT,
    "modified_by_id" BIGINT,
    "archived_by_id" BIGINT,
    "unarchived_by_id" BIGINT,
    "consent_id" BIGINT,
    "medium_template_id" BIGINT,

    CONSTRAINT "patient_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_material_conditions" (
    "id" BIGSERIAL NOT NULL,
    "education_material_id" BIGINT NOT NULL,
    "condition_id" BIGINT NOT NULL,

    CONSTRAINT "education_material_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_education_materials" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "assigned_by_id" BIGINT,
    "patient_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "education_material_id" BIGINT,
    "note" TEXT,

    CONSTRAINT "patient_education_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_materials" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "added_by_id" BIGINT,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "speciality" TEXT,
    "file_type" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "is_archived" BOOLEAN DEFAULT false,
    "archived_by_id" BIGINT,
    "unarchived_by_id" BIGINT,
    "condition_id" BIGINT,
    "provider_group_id" BIGINT,
    "user_types" JSONB,
    "specialities" JSONB,

    CONSTRAINT "education_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" TEXT NOT NULL,
    "user_id" BIGINT,
    "account_type" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "resource" TEXT,
    "resource_id" BIGINT,
    "status_code" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "duration_ms" INTEGER NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_caregiver_contacts" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "email" VARCHAR(150),
    "phone" VARCHAR(15),
    "relation" VARCHAR(50),
    "patient_id" BIGINT NOT NULL,

    CONSTRAINT "patient_caregiver_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_conditions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "status" VARCHAR(20),
    "type" VARCHAR(20),
    "onset_date" TIMESTAMPTZ,
    "last_occurence" TIMESTAMPTZ,
    "notes" TEXT,
    "is_complex" BOOLEAN DEFAULT false,
    "is_source_ehr" BOOLEAN DEFAULT false,
    "is_deleted" BOOLEAN DEFAULT false,
    "condition_id" BIGINT,
    "patient_id" BIGINT NOT NULL,
    "updated_by_id" BIGINT,

    CONSTRAINT "patient_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_care_managers" (
    "id" BIGSERIAL NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "provider_id" BIGINT NOT NULL,

    CONSTRAINT "patient_care_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "description" TEXT,
    "note" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "updated_by_id" BIGINT,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "lab_result_for" VARCHAR(255) NOT NULL,
    "abnormal_flag" VARCHAR(255),
    "value" VARCHAR(255) NOT NULL,
    "note" TEXT,
    "recorded_at" TIMESTAMPTZ,
    "file" TEXT,
    "file_type" VARCHAR(50),
    "is_track" BOOLEAN NOT NULL DEFAULT false,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "created_by_id" BIGINT,
    "updated_by_id" BIGINT,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_result_files" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "file" TEXT NOT NULL,
    "title" VARCHAR(255),
    "lab_result_id" BIGINT NOT NULL,

    CONSTRAINT "lab_result_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "recorded_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "recorder_method" VARCHAR(30),
    "type" VARCHAR(30),
    "value" DOUBLE PRECISION,
    "unit" VARCHAR(100),
    "definition" TEXT,
    "note" TEXT,
    "tags" JSON,
    "notes" JSON,
    "vital_meta" JSON,
    "device_id" VARCHAR(255),
    "meal_time" VARCHAR(50),
    "meal_type" VARCHAR(50),
    "pulse_rate" DOUBLE PRECISION,
    "diastolic" DOUBLE PRECISION,
    "generate_alert" BOOLEAN DEFAULT false,
    "is_draft" BOOLEAN DEFAULT false,
    "is_track" BOOLEAN DEFAULT false,
    "is_from_ehr" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "recorded_by_id" BIGINT,

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_alerts" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "type" VARCHAR(50),
    "min_normal" DOUBLE PRECISION,
    "max_normal" DOUBLE PRECISION,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "alert_mediums" JSON,
    "send_alert" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "assign_to_id" BIGINT,

    CONSTRAINT "vital_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_review_notes" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "reviewed_note" TEXT,
    "reviewed_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "patient_id" BIGINT NOT NULL,
    "reviewed_by_id" BIGINT,

    CONSTRAINT "vital_review_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "normal_range" VARCHAR(50),
    "vital_value" VARCHAR(50),
    "severity" VARCHAR(20),
    "status" VARCHAR(20),
    "flag" VARCHAR(10),
    "note" TEXT,
    "due_at" TIMESTAMPTZ,
    "resolved_at" TIMESTAMPTZ,
    "resolved_note" TEXT,
    "last_notify_at" TIMESTAMPTZ,
    "vital_id" BIGINT,
    "assigned_to_id" BIGINT,
    "assigned_by_id" BIGINT,
    "resolved_by_id" BIGINT,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "category" VARCHAR(25),
    "enrolled_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "is_billable" BOOLEAN DEFAULT false,
    "consent_form_type" VARCHAR(100),
    "consent_signed_at" TIMESTAMPTZ,
    "consent_file" TEXT,
    "signed_consent_file" TEXT,
    "note" TEXT,
    "unenrolled" BOOLEAN DEFAULT false,
    "unenrolled_status" VARCHAR(100),
    "unenrolled_note" TEXT,
    "unenrolled_at" TIMESTAMPTZ,
    "termination_letter" VARCHAR(100),
    "is_declined" BOOLEAN DEFAULT false,
    "declined_at" TIMESTAMPTZ,
    "declined_note" TEXT,
    "patient_id" BIGINT NOT NULL,
    "unenrolled_by_id" BIGINT,
    "declined_by_id" BIGINT,
    "updated_by_id" BIGINT,
    "enrollment_service_type" VARCHAR(20),
    "enrollment_status_type" VARCHAR(20) DEFAULT 'NEW',
    "current_month_year" VARCHAR(10),
    "enrollment_date" TIMESTAMPTZ,
    "deleted" BOOLEAN DEFAULT false,
    "consent_document_id" BIGINT,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_consent_templates" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255),
    "description" TEXT,
    "template_body" TEXT,
    "achieved" BOOLEAN DEFAULT false,
    "provider_group_id" BIGINT,
    "created_by_id" BIGINT,
    "updated_by_id" BIGINT,
    "achieved_by_id" BIGINT,

    CONSTRAINT "additional_consent_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "program" VARCHAR(10),
    "added_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "assigned_status" VARCHAR(100),
    "current_section" VARCHAR(100),
    "condition_icd_code" JSON,
    "consent_signed" BOOLEAN DEFAULT false,
    "consent_signed_at" TIMESTAMPTZ,
    "sign_off_at" TIMESTAMPTZ,
    "sign_off_note" TEXT,
    "is_signed_off" BOOLEAN DEFAULT false,
    "finished_at" TIMESTAMPTZ,
    "is_stoped" BOOLEAN DEFAULT false,
    "stoped_on" TIMESTAMPTZ,
    "stoped_note" TEXT,
    "is_discard" BOOLEAN DEFAULT false,
    "discard_on" TIMESTAMPTZ,
    "discard_note" TEXT,
    "transfer_stoped" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "careplan_id" BIGINT,
    "added_by_id" BIGINT,
    "sign_off_by_id" BIGINT,
    "stoped_by_id" BIGINT,
    "discard_by_id" BIGINT,
    "transfer_by_id" BIGINT,

    CONSTRAINT "patient_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_questions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" TEXT,
    "description" VARCHAR(255),
    "type" VARCHAR(50),
    "question_type" VARCHAR(50),
    "choices" JSON,
    "careplan_id" BIGINT,
    "condition_id" BIGINT,

    CONSTRAINT "care_plan_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "responses" JSON,
    "is_discard" BOOLEAN DEFAULT false,
    "discard_on" TIMESTAMPTZ,
    "discard_note" TEXT,
    "careplan_id" BIGINT,
    "patient_id" BIGINT NOT NULL,
    "question_id" BIGINT,
    "discard_by_id" BIGINT,

    CONSTRAINT "care_plan_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_progress" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "progress" DOUBLE PRECISION,
    "title" TEXT,
    "note" TEXT,
    "initial_comment" TEXT,
    "type" VARCHAR(255),
    "status" VARCHAR(100),
    "completed_at" TIMESTAMPTZ,
    "completed_date" TIMESTAMPTZ,
    "is_discard" BOOLEAN DEFAULT false,
    "discard_on" TIMESTAMPTZ,
    "discard_note" TEXT,
    "patient_id" BIGINT NOT NULL,
    "careplan_id" BIGINT,
    "updated_by_id" BIGINT,
    "discard_by_id" BIGINT,

    CONSTRAINT "care_plan_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_provider_reviews" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "reviewed_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "initial_review_note" TEXT,
    "treatment_test_note" TEXT,
    "referral_note" TEXT,
    "community_resource_note" TEXT,
    "medication_change" TEXT,
    "health_education_need" TEXT,
    "diet_change" TEXT,
    "exercise_change" TEXT,
    "stress_management_assistance" TEXT,
    "safety_recommendation" TEXT,
    "other_habit_to_change" TEXT,
    "visit_frequency" TEXT,
    "other_note" TEXT,
    "general_note" TEXT,
    "note" TEXT,
    "signature" TEXT,
    "is_offline_review" BOOLEAN DEFAULT false,
    "offline_reviewed_at" TIMESTAMPTZ,
    "offline_reviewed_by" VARCHAR(255),
    "offline_reviewed_file" TEXT,
    "patient_id" BIGINT NOT NULL,
    "reviewed_by_id" BIGINT,

    CONSTRAINT "care_plan_provider_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_monthly_updates" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "updated_on" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR(255),
    "note" TEXT,
    "file" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_note" TEXT,
    "patient_id" BIGINT NOT NULL,
    "updated_by_id" BIGINT,
    "deleted_by_id" BIGINT,

    CONSTRAINT "care_plan_monthly_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_conditions" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "careplan_id" BIGINT NOT NULL,
    "condition_id" BIGINT NOT NULL,

    CONSTRAINT "care_plan_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_icd_codes" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "careplan_id" BIGINT NOT NULL,
    "icdcode_id" BIGINT NOT NULL,

    CONSTRAINT "care_plan_icd_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_tasks" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255),
    "action" VARCHAR(50),
    "priority" VARCHAR(50),
    "careplan_id" BIGINT NOT NULL,
    "template_id" BIGINT,

    CONSTRAINT "care_plan_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common_questions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" TEXT,
    "type" VARCHAR(100),
    "question_type" VARCHAR(50),
    "choices" JSON,

    CONSTRAINT "common_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255),
    "description" TEXT,
    "category" VARCHAR(50),
    "flag" VARCHAR(50),
    "frequencey" VARCHAR(20),
    "tags" JSON,
    "font_icons" JSON,
    "is_active" BOOLEAN DEFAULT true,
    "is_archieved" BOOLEAN DEFAULT false,
    "is_nas_assessment" BOOLEAN DEFAULT false,
    "assessment_ccm_type" VARCHAR(20),
    "creator_id" BIGINT,
    "provider_group_id" BIGINT,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_conditions" (
    "id" BIGSERIAL NOT NULL,
    "assessment_id" BIGINT NOT NULL,
    "condition_id" BIGINT NOT NULL,

    CONSTRAINT "assessment_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_questions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "choices" JSON,
    "assessment_id" BIGINT NOT NULL,
    "creator_id" BIGINT,
    "choice_id" BIGINT,

    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_question_choices" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255) NOT NULL,
    "nas_class" VARCHAR(10),
    "is_free_text" BOOLEAN DEFAULT false,
    "question_id" BIGINT NOT NULL,
    "creator_id" BIGINT,

    CONSTRAINT "assessment_question_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assigned_assessments" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "assigned_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "responsible_person" VARCHAR(50),
    "program" VARCHAR(10),
    "is_scheduled" BOOLEAN DEFAULT false,
    "scheduled_at" TIMESTAMPTZ,
    "scheduled_id" VARCHAR(150),
    "scheduled_medium" VARCHAR(10),
    "is_archived" BOOLEAN DEFAULT false,
    "assessment_id" BIGINT NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "assigned_by_id" BIGINT,
    "scheduled_by_id" BIGINT,

    CONSTRAINT "assigned_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "responses" JSONB,
    "response_at" TIMESTAMPTZ,
    "review_at" TIMESTAMPTZ,
    "review_note" TEXT,
    "is_new" BOOLEAN DEFAULT true,
    "pdf_responses" TEXT,
    "response_pdf" VARCHAR(100),
    "careplan_data" JSONB,
    "careplan_response_ids" JSON,
    "assignement_id" BIGINT NOT NULL,
    "review_by_id" BIGINT,
    "nas_score" DECIMAL(10,2),

    CONSTRAINT "assessment_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screenings" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "responses" JSON,
    "screening_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "responsible_person" VARCHAR(50),
    "is_scheduled" BOOLEAN DEFAULT false,
    "scheduled_at" TIMESTAMPTZ,
    "scheduled_medium" VARCHAR(10),
    "scheduled_sections" JSON,
    "blueprint_meta" JSON,
    "score" INTEGER,
    "is_archived" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "screening_by_id" BIGINT,
    "scheduled_by_id" BIGINT,

    CONSTRAINT "screenings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_schedules" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "send_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50),
    "cancelled_at" TIMESTAMPTZ,
    "education_id" BIGINT NOT NULL,
    "cancelled_by_id" BIGINT,
    "scheduled_by_id" BIGINT,
    "send_by_id" BIGINT,
    "updated_by_id" BIGINT,

    CONSTRAINT "education_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_schedule_patients" (
    "id" BIGSERIAL NOT NULL,
    "educationschedule_id" BIGINT NOT NULL,
    "patient_id" BIGINT NOT NULL,

    CONSTRAINT "education_schedule_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "id" UUID NOT NULL,
    "is_online" BOOLEAN DEFAULT false,
    "last_online" TIMESTAMPTZ,
    "user_id" BIGINT,
    "conversation_id" UUID,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "content" TEXT,
    "attachment" TEXT,
    "attachment_ext" VARCHAR(100),
    "viewed" BOOLEAN DEFAULT false,
    "notified" BOOLEAN DEFAULT false,
    "conversation_id" UUID,
    "sender_id" UUID,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_records" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "content" TEXT,
    "sent_by" VARCHAR(10),
    "viewed" BOOLEAN DEFAULT false,
    "source" VARCHAR(20) DEFAULT 'careos',
    "patient_id" BIGINT,
    "provider_id" BIGINT,

    CONSTRAINT "sms_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_record_media" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "file" TEXT,
    "mime_type" VARCHAR(50),
    "sms_id" BIGINT NOT NULL,

    CONSTRAINT "sms_record_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_message_histories" (
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "number" VARCHAR(15),
    "body" TEXT,
    "status" VARCHAR(100),

    CONSTRAINT "text_message_histories_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bulk_communications" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "sms_body" TEXT,
    "email_body" TEXT,
    "email_subject" VARCHAR(255),
    "send_on" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "sent_by_id" BIGINT,

    CONSTRAINT "bulk_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "notify_for" VARCHAR(255),
    "notification_type" VARCHAR(50),
    "is_email" BOOLEAN DEFAULT false,
    "is_text" BOOLEAN DEFAULT false,
    "is_push_notification" BOOLEAN DEFAULT false,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "name" VARCHAR(100),
    "description" TEXT,
    "status" VARCHAR(50),
    "permissions" JSON,
    "provider_group_id" BIGINT,
    "creator_id" BIGINT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_addresses" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(254),
    "verified" BOOLEAN DEFAULT false,
    "primary" BOOLEAN DEFAULT true,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "email_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_logs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "start_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMPTZ,
    "time_spent" DOUBLE PRECISION,
    "total_seconds" DOUBLE PRECISION,
    "note" TEXT,
    "log_as" VARCHAR(255),
    "log_for" VARCHAR(100),
    "program" VARCHAR(100),
    "resource" VARCHAR(100),
    "is_billable" BOOLEAN DEFAULT false,
    "is_manual" BOOLEAN DEFAULT false,
    "intervals" JSON,
    "call_file" TEXT,
    "call_status" VARCHAR(255),
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_note" TEXT,
    "deleted_by_id" BIGINT,
    "log_for_patient_id" BIGINT,
    "log_by_provider_id" BIGINT,
    "permorm_by_provider_id" BIGINT,
    "enrollment_service_type" VARCHAR(20),
    "duration_in_seconds_for_care_managers" INTEGER,
    "duration_in_seconds_for_physicians" INTEGER,
    "cpt_codes" TEXT,
    "current_month_year" VARCHAR(10),
    "log_at" TIMESTAMPTZ,

    CONSTRAINT "time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_log_intervals" (
    "id" UUID NOT NULL,
    "start" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMPTZ,
    "time_log_id" BIGINT NOT NULL,

    CONSTRAINT "time_log_intervals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pcm_billings" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "time_spends" DOUBLE PRECISION DEFAULT 0,
    "pcm_time_spends" DOUBLE PRECISION DEFAULT 0,
    "month" INTEGER,
    "year" INTEGER,
    "billing_flag" VARCHAR(255),
    "billing_status" VARCHAR(100) DEFAULT 'pending',
    "billable_date" DATE,
    "submitted_at" TIMESTAMPTZ,
    "submitted_cpt_codes" JSON,
    "revenue" DOUBLE PRECISION DEFAULT 0,
    "complexity_type" VARCHAR(20),
    "patient_id" BIGINT NOT NULL,

    CONSTRAINT "pcm_billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pcm_billing_time_logs" (
    "id" BIGSERIAL NOT NULL,
    "pcmbilling_id" BIGINT NOT NULL,
    "timelog_id" BIGINT NOT NULL,

    CONSTRAINT "pcm_billing_time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pcm_billing_pcm_time_logs" (
    "id" BIGSERIAL NOT NULL,
    "pcmbilling_id" BIGINT NOT NULL,
    "timelog_id" BIGINT NOT NULL,

    CONSTRAINT "pcm_billing_pcm_time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_notes" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "billing_type" VARCHAR(50),
    "note" TEXT,
    "old_status" VARCHAR(100),
    "new_status" VARCHAR(100),
    "created_by_id" BIGINT,
    "pcm_billing_id" BIGINT NOT NULL,

    CONSTRAINT "billing_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_devices" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "device_name" VARCHAR(255),
    "device_source" VARCHAR(50),
    "device_id" VARCHAR(255),
    "enrollment_id" BIGINT NOT NULL,

    CONSTRAINT "enrollment_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_billings" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "criteria" VARCHAR(20) DEFAULT 'ENROLLMENT',
    "service" VARCHAR(20),
    "cpt_code" VARCHAR(10),
    "bill_cycle_start_date" TIMESTAMPTZ,
    "bill_cycle_end_date" TIMESTAMPTZ,
    "current_month_year" VARCHAR(10),
    "enrollment_status_type" VARCHAR(20),
    "paid_status" VARCHAR(50),
    "claim_status" VARCHAR(50),
    "submitted_at" TIMESTAMPTZ,
    "deleted" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "enrollment_id" BIGINT NOT NULL,

    CONSTRAINT "enrollment_billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_billings" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "criteria" VARCHAR(20) DEFAULT 'DAY',
    "service" VARCHAR(20),
    "cpt_code" VARCHAR(10),
    "days" INTEGER DEFAULT 0,
    "new_updated_at" TIMESTAMPTZ,
    "bill_cycle_start_date" TIMESTAMPTZ,
    "bill_cycle_end_date" TIMESTAMPTZ,
    "current_month_year" VARCHAR(10),
    "paid_status" VARCHAR(50),
    "claim_status" VARCHAR(50),
    "submitted_at" TIMESTAMPTZ,
    "deleted" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "enrollment_id" BIGINT NOT NULL,

    CONSTRAINT "monitoring_billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_billings" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "criteria" VARCHAR(20) DEFAULT 'TIME',
    "service" VARCHAR(20),
    "current_month_year" VARCHAR(10),
    "interaction_minutes" INTEGER,
    "cpt_codes" TEXT,
    "bill_cycle_start_date" TIMESTAMPTZ,
    "bill_cycle_end_date" TIMESTAMPTZ,
    "paid_status" VARCHAR(50),
    "claim_status" VARCHAR(50),
    "submitted_at" TIMESTAMPTZ,
    "complexity_type" VARCHAR(20),
    "deleted" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "enrollment_id" BIGINT NOT NULL,

    CONSTRAINT "interaction_billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_data" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "vital" VARCHAR(50),
    "actual_reading_one" VARCHAR(100),
    "actual_reading_two" VARCHAR(100),
    "actual_reading_three" VARCHAR(100),
    "device_reading" JSON,
    "reading_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "step_date" DATE,
    "is_alert" BOOLEAN DEFAULT false,
    "review_status" VARCHAR(20) DEFAULT 'UNREVIEWED',
    "reviewed_at" TIMESTAMPTZ,
    "reviewed_by_id" BIGINT,
    "patient_id" BIGINT NOT NULL,
    "enrollment_id" BIGINT,

    CONSTRAINT "monitoring_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_time_entries" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "duration_in_seconds" INTEGER,
    "note" TEXT,
    "activity" VARCHAR(255),
    "logged_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "patient_id" BIGINT NOT NULL,
    "time_log_id" BIGINT,
    "created_by_id" BIGINT,

    CONSTRAINT "manual_time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_interactions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "enrollment_service_type" VARCHAR(20),
    "interaction_week" INTEGER,
    "interaction_year" INTEGER,
    "interacted_at" TIMESTAMPTZ,
    "note" TEXT,
    "patient_id" BIGINT NOT NULL,
    "enrollment_id" BIGINT,
    "provider_id" BIGINT,

    CONSTRAINT "patient_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_timelines" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "enrollment_service_type" VARCHAR(20),
    "event_type" VARCHAR(50),
    "title" VARCHAR(255),
    "description" TEXT,
    "meta" JSON,
    "occurred_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "patient_id" BIGINT NOT NULL,
    "enrollment_id" BIGINT,
    "created_by_id" BIGINT,

    CONSTRAINT "activity_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "datetime" TIMESTAMPTZ,
    "end_datetime" TIMESTAMPTZ,
    "duration" INTEGER,
    "title" VARCHAR(255),
    "description" TEXT,
    "purpose" TEXT,
    "status" VARCHAR(20),
    "status_reason" VARCHAR(255),
    "medium" VARCHAR(10),
    "call_type" VARCHAR(20),
    "file" TEXT,
    "transcript_file" TEXT,
    "transcriptions_text" JSONB,
    "summary_note" TEXT,
    "session_notes" TEXT,
    "call_end_note" TEXT,
    "rescheduled_note" TEXT,
    "log_status" VARCHAR(255),
    "log_updated_at" TIMESTAMPTZ,
    "is_recurring" BOOLEAN DEFAULT false,
    "recurring_id" UUID,
    "reminder_set" BOOLEAN DEFAULT false,
    "reminder_at" TIMESTAMPTZ,
    "reminder_before_number" INTEGER,
    "reminder_before_unit" VARCHAR(50),
    "reminder_mediums" JSONB,
    "reminder_send_to_host" BOOLEAN DEFAULT false,
    "reminder_sent" BOOLEAN DEFAULT false,
    "reminder_sent_to_patient" BOOLEAN DEFAULT false,
    "source" VARCHAR(20),
    "patient_id" BIGINT,
    "host_id" BIGINT,
    "created_by_id" BIGINT,
    "assessment_id" BIGINT,
    "general_call_id" BIGINT,
    "telehealth_session_id" BIGINT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_files" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "file" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "hash" VARCHAR(64),
    "session_id" BIGINT NOT NULL,

    CONSTRAINT "session_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telehealth_sessions" (
    "id" BIGSERIAL NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "platform" TEXT DEFAULT 'zoom',
    "meetingId" TEXT,
    "meetingUuid" TEXT,
    "meetingPassword" TEXT,
    "hostUrl" TEXT,
    "joinUrl" TEXT,
    "hostKey" TEXT,
    "status" TEXT,
    "scheduledStart" TIMESTAMPTZ NOT NULL,
    "actualStartTime" TIMESTAMPTZ,
    "actualEndTime" TIMESTAMPTZ,
    "actualDuration" INTEGER,
    "providerJoinedAt" TIMESTAMPTZ,
    "providerLeftAt" TIMESTAMPTZ,
    "patientJoinedAt" TIMESTAMPTZ,
    "patientLeftAt" TIMESTAMPTZ,
    "patientWaitingAt" TIMESTAMPTZ,
    "patientAdmittedAt" TIMESTAMPTZ,
    "recordingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "recordingConsentId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "telehealth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_encounters" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "encounter_id" TEXT,
    "reason" TEXT,
    "location" TEXT,
    "status" TEXT,
    "program" VARCHAR(50),
    "service_date" TIMESTAMPTZ,
    "billed_date" TIMESTAMPTZ,
    "time_spent" DOUBLE PRECISION DEFAULT 0,
    "cm_phy" VARCHAR(50),
    "flag" VARCHAR(50),
    "encounter_form" JSONB,
    "cptCode" JSONB,
    "icdCode" JSONB,
    "is_billable" BOOLEAN DEFAULT false,
    "is_claim_generated" BOOLEAN DEFAULT false,
    "billingId" BIGINT,
    "patient_id" BIGINT,
    "provider_id" BIGINT,
    "schedule_id" BIGINT,
    "group_id" BIGINT,

    CONSTRAINT "patient_encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_encounter_details" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "subjective_data" JSONB,
    "objective_data" JSONB,
    "assessment_data" JSONB,
    "plan_data" JSONB,
    "careplan" JSONB,
    "follow_up" JSONB,
    "instruction_note" JSONB,
    "status" VARCHAR(50),
    "is_signed" BOOLEAN DEFAULT false,
    "is_draft" BOOLEAN DEFAULT false,
    "signature" TEXT,
    "signed_at" TIMESTAMPTZ,
    "session_id" BIGINT,
    "patient_id" BIGINT,
    "provider_id" BIGINT,
    "signed_by_id" BIGINT,
    "created_by_id" BIGINT,
    "updated_by_id" BIGINT,

    CONSTRAINT "patient_encounter_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_call_recordings" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "phone_number" VARCHAR(20),
    "call_type" VARCHAR(20),
    "status" VARCHAR(20),
    "call_status" VARCHAR(20),
    "duration" VARCHAR(10),
    "file" TEXT,
    "transcript_file" TEXT,
    "recording_sid" VARCHAR(255),
    "patient_id" BIGINT,
    "provider_id" BIGINT,
    "provider_group_id" BIGINT,

    CONSTRAINT "general_call_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_group_transfer_calls" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "caller_id" VARCHAR(20),
    "checked" BOOLEAN DEFAULT false,
    "call_type" VARCHAR(255),
    "call_status" VARCHAR(255),
    "provider_group_id" BIGINT,
    "provider_id" BIGINT,

    CONSTRAINT "provider_group_transfer_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "provider_id" BIGINT,
    "appointment_type_id" BIGINT NOT NULL,
    "availability_id" BIGINT NOT NULL,
    "window_index" INTEGER,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "mode" TEXT,
    "chief_complaint" TEXT,
    "body_part" TEXT,
    "affected_side" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_types" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "color" TEXT,
    "forms" TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "appointment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availabilities" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "provider_id" BIGINT,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_days" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "availability_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "slot_minutes" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "availability_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reason_to_visits" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "body_part_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "reason_to_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body_parts" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "body_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_alert_providers" (
    "id" BIGSERIAL NOT NULL,
    "vitalalert_id" BIGINT NOT NULL,
    "provider_id" BIGINT NOT NULL,

    CONSTRAINT "vital_alert_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_review_note_vitals" (
    "id" BIGSERIAL NOT NULL,
    "vitalreviewnote_id" BIGINT NOT NULL,
    "vital_id" BIGINT NOT NULL,

    CONSTRAINT "vital_review_note_vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpm_vital_informations" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "vital_to_track" VARCHAR(100),
    "frequency" VARCHAR(150),
    "check_in_interval" VARCHAR(150),
    "tracking_device" VARCHAR(255),
    "patient_id" BIGINT NOT NULL,

    CONSTRAINT "rpm_vital_informations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_configurations" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "type" VARCHAR(50),
    "min_normal" DOUBLE PRECISION,
    "max_normal" DOUBLE PRECISION,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "alert_mediums" JSONB,
    "send_alert" BOOLEAN DEFAULT false,
    "assign_to_id" BIGINT,
    "provider_group_id" BIGINT,

    CONSTRAINT "vital_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_time_logs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "start_at" TIMESTAMPTZ,
    "end_at" TIMESTAMPTZ,
    "reason" VARCHAR(255),
    "note" TEXT,
    "program" VARCHAR(100),
    "patient_id" BIGINT,
    "provider_id" BIGINT,

    CONSTRAINT "reset_time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_provider_review_drafts" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "content" TEXT,
    "section" VARCHAR(100),
    "careplan_id" BIGINT,
    "patient_id" BIGINT,
    "added_by_id" BIGINT,

    CONSTRAINT "care_plan_provider_review_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_provider_review_notes" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "note" TEXT,
    "added_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_note" TEXT,
    "patient_id" BIGINT NOT NULL,
    "added_by_id" BIGINT,
    "deleted_by_id" BIGINT,

    CONSTRAINT "care_plan_provider_review_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_number_to_track_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "vitals_to_track" TEXT,
    "labs_to_track" TEXT,
    "patient_id" BIGINT NOT NULL,

    CONSTRAINT "care_plan_number_to_track_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_progress_histories" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "old_status" VARCHAR(100),
    "new_status" VARCHAR(100),
    "progress" VARCHAR(100),
    "note" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_note" TEXT,
    "progress_obj_id" BIGINT,
    "updated_by_id" BIGINT,
    "deleted_by_id" BIGINT,

    CONSTRAINT "care_plan_progress_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_progress" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "progress" DOUBLE PRECISION,
    "title" TEXT,
    "note" TEXT,
    "initial_comment" TEXT,
    "type" VARCHAR(255),
    "status" VARCHAR(100),
    "tag" VARCHAR(100),
    "completed_at" TIMESTAMPTZ,
    "completed_date" TIMESTAMPTZ,
    "is_discard" BOOLEAN DEFAULT false,
    "discard_on" TIMESTAMPTZ,
    "discard_note" TEXT,
    "patient_id" BIGINT NOT NULL,
    "updated_by_id" BIGINT,
    "discard_by_id" BIGINT,

    CONSTRAINT "personal_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_progress_histories" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "old_status" VARCHAR(100),
    "new_status" VARCHAR(100),
    "progress" VARCHAR(100),
    "note" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_note" TEXT,
    "progress_obj_id" BIGINT,
    "updated_by_id" BIGINT,
    "deleted_by_id" BIGINT,

    CONSTRAINT "personal_progress_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common_question_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "responses" JSONB,
    "careplan_id" BIGINT,
    "patient_id" BIGINT NOT NULL,
    "question_id" BIGINT,

    CONSTRAINT "common_question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generic_care_plan_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "responses" JSONB,
    "is_draft" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,

    CONSTRAINT "generic_care_plan_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_additional_notes" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "note" TEXT,
    "is_draft" BOOLEAN DEFAULT false,
    "patient_id" BIGINT NOT NULL,
    "careplan_id" BIGINT,

    CONSTRAINT "care_plan_additional_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_question_file_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "file" TEXT,

    CONSTRAINT "condition_question_file_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_questionnaires" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "questions" JSONB,
    "condition_id" BIGINT,

    CONSTRAINT "condition_questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_questionnaire_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "response" JSONB,
    "status" VARCHAR(255) NOT NULL,
    "completed_at" TIMESTAMPTZ,
    "question_id" BIGINT,
    "patient_id" BIGINT NOT NULL,
    "completed_by_id" BIGINT,

    CONSTRAINT "condition_questionnaire_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_patient_reports" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "report_file" TEXT,
    "report_on" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "reviewed" BOOLEAN DEFAULT false,
    "reviewed_at" TIMESTAMPTZ,
    "patient_id" BIGINT NOT NULL,
    "send_by_id" BIGINT,

    CONSTRAINT "care_plan_patient_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_review_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "providerReview_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "provider_review_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_update_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "careplanmonthlyupdate_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "monthly_update_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_review_note_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "careplanproviderreviewnote_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "provider_review_note_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "number_to_track_response_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "careplannumbertotrackresponse_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "number_to_track_response_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_note_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "careplanadditionalnotes_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "additional_note_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generic_response_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "genericcareplanresponse_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "generic_response_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_report_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "careplanpatientreport_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "patient_report_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergy_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "allergy_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "allergy_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "medication_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "medication_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_result_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "labresult_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "lab_result_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_care_plans" (
    "id" BIGSERIAL NOT NULL,
    "vital_id" BIGINT NOT NULL,
    "careplan_id" BIGINT NOT NULL,

    CONSTRAINT "vital_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_response_files" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "file" TEXT,

    CONSTRAINT "assessment_response_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_reviews" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "severity_level" VARCHAR(255),
    "risk_flag" VARCHAR(255),
    "review_at" TIMESTAMPTZ,
    "note" TEXT,
    "screening_id" BIGINT,
    "review_by_id" BIGINT,

    CONSTRAINT "screening_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_overall_responses" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "name" VARCHAR(255),
    "color" VARCHAR(255),
    "flag" VARCHAR(255),
    "score" INTEGER,
    "severity" VARCHAR(255),
    "status" VARCHAR(255),
    "is_reviewed" BOOLEAN DEFAULT false,
    "review_severity" VARCHAR(255),
    "review_risk_flag" VARCHAR(255),
    "review_at" TIMESTAMPTZ,
    "review_note" TEXT,
    "patient_id" BIGINT NOT NULL,
    "review_by_id" BIGINT,

    CONSTRAINT "assessment_overall_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "icd_codes_uuid_key" ON "icd_codes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "icd_codes_code_key" ON "icd_codes"("code");

-- CreateIndex
CREATE INDEX "icd_codes_description_idx" ON "icd_codes"("description");

-- CreateIndex
CREATE INDEX "icd_codes_status_idx" ON "icd_codes"("status");

-- CreateIndex
CREATE INDEX "icd_codes_condition_id_idx" ON "icd_codes"("condition_id");

-- CreateIndex
CREATE INDEX "icd_codes_created_at_idx" ON "icd_codes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cpt_codes_uuid_key" ON "cpt_codes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "cpt_codes_code_key" ON "cpt_codes"("code");

-- CreateIndex
CREATE INDEX "cpt_codes_description_idx" ON "cpt_codes"("description");

-- CreateIndex
CREATE INDEX "cpt_codes_category_idx" ON "cpt_codes"("category");

-- CreateIndex
CREATE INDEX "cpt_codes_status_idx" ON "cpt_codes"("status");

-- CreateIndex
CREATE INDEX "cpt_codes_created_at_idx" ON "cpt_codes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_uuid_key" ON "addresses"("uuid");

-- CreateIndex
CREATE INDEX "addresses_patient_id_idx" ON "addresses"("patient_id");

-- CreateIndex
CREATE INDEX "addresses_employee_id_idx" ON "addresses"("employee_id");

-- CreateIndex
CREATE INDEX "addresses_city_state_idx" ON "addresses"("city", "state");

-- CreateIndex
CREATE INDEX "addresses_postal_code_idx" ON "addresses"("postal_code");

-- CreateIndex
CREATE UNIQUE INDEX "provider_groups_uuid_key" ON "provider_groups"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "provider_groups_group_npi_key" ON "provider_groups"("group_npi");

-- CreateIndex
CREATE UNIQUE INDEX "provider_groups_code_key" ON "provider_groups"("code");

-- CreateIndex
CREATE UNIQUE INDEX "provider_groups_system_email_key" ON "provider_groups"("system_email");

-- CreateIndex
CREATE INDEX "provider_groups_physical_address_id_idx" ON "provider_groups"("physical_address_id");

-- CreateIndex
CREATE INDEX "provider_groups_billing_address_id_idx" ON "provider_groups"("billing_address_id");

-- CreateIndex
CREATE INDEX "provider_groups_created_at_idx" ON "provider_groups"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "providers_uuid_key" ON "providers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "providers_email_key" ON "providers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "providers_npi_key" ON "providers"("npi");

-- CreateIndex
CREATE UNIQUE INDEX "providers_user_id_key" ON "providers"("user_id");

-- CreateIndex
CREATE INDEX "providers_added_by_id_idx" ON "providers"("added_by_id");

-- CreateIndex
CREATE INDEX "providers_deleted_by_id_idx" ON "providers"("deleted_by_id");

-- CreateIndex
CREATE INDEX "providers_created_at_idx" ON "providers"("created_at");

-- CreateIndex
CREATE INDEX "provider_group_members_provider_id_idx" ON "provider_group_members"("provider_id");

-- CreateIndex
CREATE INDEX "provider_group_members_provider_group_id_idx" ON "provider_group_members"("provider_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_members_provider_id_provider_group_id_key" ON "provider_group_members"("provider_id", "provider_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "conditions_uuid_key" ON "conditions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "conditions_title_key" ON "conditions"("title");

-- CreateIndex
CREATE INDEX "conditions_created_at_idx" ON "conditions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "condition_questions_uuid_key" ON "condition_questions"("uuid");

-- CreateIndex
CREATE INDEX "condition_questions_condition_id_idx" ON "condition_questions"("condition_id");

-- CreateIndex
CREATE INDEX "condition_questions_created_at_idx" ON "condition_questions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_uuid_key" ON "tasks"("uuid");

-- CreateIndex
CREATE INDEX "tasks_patient_id_idx" ON "tasks"("patient_id");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_is_completed_due_date_idx" ON "tasks"("assignee_id", "is_completed", "due_date");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "tasks_provider_group_id_idx" ON "tasks"("provider_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_types_uuid_key" ON "task_types"("uuid");

-- CreateIndex
CREATE INDEX "task_types_provider_group_id_idx" ON "task_types"("provider_group_id");

-- CreateIndex
CREATE INDEX "task_types_created_by_id_idx" ON "task_types"("created_by_id");

-- CreateIndex
CREATE INDEX "task_types_created_at_idx" ON "task_types"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bulk_communication_templates_uuid_key" ON "bulk_communication_templates"("uuid");

-- CreateIndex
CREATE INDEX "bulk_communication_templates_provider_group_id_idx" ON "bulk_communication_templates"("provider_group_id");

-- CreateIndex
CREATE INDEX "bulk_communication_templates_template_type_idx" ON "bulk_communication_templates"("template_type");

-- CreateIndex
CREATE INDEX "bulk_communication_templates_created_at_idx" ON "bulk_communication_templates"("created_at");

-- CreateIndex
CREATE INDEX "bulk_communication_template_revisions_template_id_idx" ON "bulk_communication_template_revisions"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "consents_uuid_key" ON "consents"("uuid");

-- CreateIndex
CREATE INDEX "consents_program_idx" ON "consents"("program");

-- CreateIndex
CREATE INDEX "consents_created_at_idx" ON "consents"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "care_plans_uuid_key" ON "care_plans"("uuid");

-- CreateIndex
CREATE INDEX "care_plans_title_idx" ON "care_plans"("title");

-- CreateIndex
CREATE INDEX "care_plans_creator_id_idx" ON "care_plans"("creator_id");

-- CreateIndex
CREATE INDEX "care_plans_provider_group_id_idx" ON "care_plans"("provider_group_id");

-- CreateIndex
CREATE INDEX "care_plans_copied_from_id_idx" ON "care_plans"("copied_from_id");

-- CreateIndex
CREATE INDEX "care_plans_created_at_idx" ON "care_plans"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "patients_uuid_key" ON "patients"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- CreateIndex
CREATE INDEX "patients_date_of_birth_idx" ON "patients"("date_of_birth");

-- CreateIndex
CREATE INDEX "patients_is_active_first_name_id_idx" ON "patients"("is_active", "first_name", "id");

-- CreateIndex
CREATE INDEX "patients_is_active_last_name_first_name_idx" ON "patients"("is_active", "last_name", "first_name");

-- CreateIndex
CREATE INDEX "patients_status_idx" ON "patients"("status");

-- CreateIndex
CREATE INDEX "patients_invite_status_idx" ON "patients"("invite_status");

-- CreateIndex
CREATE INDEX "patients_provider_group_id_idx" ON "patients"("provider_group_id");

-- CreateIndex
CREATE INDEX "patients_primary_physician_id_idx" ON "patients"("primary_physician_id");

-- CreateIndex
CREATE INDEX "patients_primary_care_manager_id_idx" ON "patients"("primary_care_manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_insurances_uuid_key" ON "patient_insurances"("uuid");

-- CreateIndex
CREATE INDEX "patient_insurances_patient_id_idx" ON "patient_insurances"("patient_id");

-- CreateIndex
CREATE INDEX "patient_insurances_name_idx" ON "patient_insurances"("name");

-- CreateIndex
CREATE INDEX "patient_insurances_patient_id_name_idx" ON "patient_insurances"("patient_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "patient_emergency_contacts_uuid_key" ON "patient_emergency_contacts"("uuid");

-- CreateIndex
CREATE INDEX "patient_emergency_contacts_patient_id_idx" ON "patient_emergency_contacts"("patient_id");

-- CreateIndex
CREATE INDEX "patient_emergency_contacts_last_name_first_name_idx" ON "patient_emergency_contacts"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "patient_emergency_contacts_phone_idx" ON "patient_emergency_contacts"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "patient_power_of_attorneys_uuid_key" ON "patient_power_of_attorneys"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "patient_power_of_attorneys_patient_id_key" ON "patient_power_of_attorneys"("patient_id");

-- CreateIndex
CREATE INDEX "patient_power_of_attorneys_name_idx" ON "patient_power_of_attorneys"("name");

-- CreateIndex
CREATE INDEX "patient_power_of_attorneys_phone_idx" ON "patient_power_of_attorneys"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "patient_preferred_pharmacies_uuid_key" ON "patient_preferred_pharmacies"("uuid");

-- CreateIndex
CREATE INDEX "patient_preferred_pharmacies_name_idx" ON "patient_preferred_pharmacies"("name");

-- CreateIndex
CREATE INDEX "patient_preferred_pharmacies_patient_id_idx" ON "patient_preferred_pharmacies"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_imagings_uuid_key" ON "patient_imagings"("uuid");

-- CreateIndex
CREATE INDEX "patient_imagings_patient_id_idx" ON "patient_imagings"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_allergies_uuid_key" ON "patient_allergies"("uuid");

-- CreateIndex
CREATE INDEX "patient_allergies_patient_id_idx" ON "patient_allergies"("patient_id");

-- CreateIndex
CREATE INDEX "patient_allergies_patient_id_is_active_idx" ON "patient_allergies"("patient_id", "is_active");

-- CreateIndex
CREATE INDEX "patient_allergies_name_is_active_idx" ON "patient_allergies"("name", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "patient_medications_uuid_key" ON "patient_medications"("uuid");

-- CreateIndex
CREATE INDEX "patient_medications_patient_id_is_active_idx" ON "patient_medications"("patient_id", "is_active");

-- CreateIndex
CREATE INDEX "patient_medications_prescribing_provider_idx" ON "patient_medications"("prescribing_provider");

-- CreateIndex
CREATE INDEX "patient_medications_name_is_active_idx" ON "patient_medications"("name", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "patient_medical_histories_uuid_key" ON "patient_medical_histories"("uuid");

-- CreateIndex
CREATE INDEX "patient_medical_histories_patient_id_idx" ON "patient_medical_histories"("patient_id");

-- CreateIndex
CREATE INDEX "patient_medical_histories_condition_idx" ON "patient_medical_histories"("condition");

-- CreateIndex
CREATE UNIQUE INDEX "patient_surgical_histories_uuid_key" ON "patient_surgical_histories"("uuid");

-- CreateIndex
CREATE INDEX "patient_surgical_histories_patient_id_idx" ON "patient_surgical_histories"("patient_id");

-- CreateIndex
CREATE INDEX "patient_surgical_histories_procedure_idx" ON "patient_surgical_histories"("procedure");

-- CreateIndex
CREATE UNIQUE INDEX "patient_social_histories_uuid_key" ON "patient_social_histories"("uuid");

-- CreateIndex
CREATE INDEX "patient_social_histories_patient_id_idx" ON "patient_social_histories"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_documents_uuid_key" ON "patient_documents"("uuid");

-- CreateIndex
CREATE INDEX "patient_documents_patient_id_idx" ON "patient_documents"("patient_id");

-- CreateIndex
CREATE INDEX "patient_documents_name_idx" ON "patient_documents"("name");

-- CreateIndex
CREATE INDEX "patient_documents_patient_id_is_consent_consent_for_idx" ON "patient_documents"("patient_id", "is_consent", "consent_for");

-- CreateIndex
CREATE INDEX "education_material_conditions_condition_id_idx" ON "education_material_conditions"("condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "education_material_conditions_education_material_id_conditi_key" ON "education_material_conditions"("education_material_id", "condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_education_materials_uuid_key" ON "patient_education_materials"("uuid");

-- CreateIndex
CREATE INDEX "patient_education_materials_patient_id_idx" ON "patient_education_materials"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_education_materials_education_material_id_patient_i_key" ON "patient_education_materials"("education_material_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "education_materials_uuid_key" ON "education_materials"("uuid");

-- CreateIndex
CREATE INDEX "education_materials_title_idx" ON "education_materials"("title");

-- CreateIndex
CREATE INDEX "education_materials_added_by_id_idx" ON "education_materials"("added_by_id");

-- CreateIndex
CREATE INDEX "education_materials_condition_id_idx" ON "education_materials"("condition_id");

-- CreateIndex
CREATE INDEX "education_materials_provider_group_id_idx" ON "education_materials"("provider_group_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_occurred_at_idx" ON "audit_logs"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_occurred_at_idx" ON "audit_logs"("resource", "resource_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_logs_occurred_at_id_idx" ON "audit_logs"("occurred_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_caregiver_contacts_uuid_key" ON "patient_caregiver_contacts"("uuid");

-- CreateIndex
CREATE INDEX "patient_caregiver_contacts_patient_id_idx" ON "patient_caregiver_contacts"("patient_id");

-- CreateIndex
CREATE INDEX "patient_caregiver_contacts_created_at_idx" ON "patient_caregiver_contacts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "patient_conditions_uuid_key" ON "patient_conditions"("uuid");

-- CreateIndex
CREATE INDEX "patient_conditions_patient_id_idx" ON "patient_conditions"("patient_id");

-- CreateIndex
CREATE INDEX "patient_conditions_condition_id_idx" ON "patient_conditions"("condition_id");

-- CreateIndex
CREATE INDEX "patient_conditions_updated_by_id_idx" ON "patient_conditions"("updated_by_id");

-- CreateIndex
CREATE INDEX "patient_conditions_created_at_idx" ON "patient_conditions"("created_at");

-- CreateIndex
CREATE INDEX "patient_care_managers_patient_id_idx" ON "patient_care_managers"("patient_id");

-- CreateIndex
CREATE INDEX "patient_care_managers_provider_id_idx" ON "patient_care_managers"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_care_managers_patient_id_provider_id_key" ON "patient_care_managers"("patient_id", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "symptoms_uuid_key" ON "symptoms"("uuid");

-- CreateIndex
CREATE INDEX "symptoms_patient_id_idx" ON "symptoms"("patient_id");

-- CreateIndex
CREATE INDEX "symptoms_updated_by_id_idx" ON "symptoms"("updated_by_id");

-- CreateIndex
CREATE INDEX "symptoms_created_at_idx" ON "symptoms"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "lab_results_uuid_key" ON "lab_results"("uuid");

-- CreateIndex
CREATE INDEX "lab_results_patient_id_idx" ON "lab_results"("patient_id");

-- CreateIndex
CREATE INDEX "lab_results_created_by_id_idx" ON "lab_results"("created_by_id");

-- CreateIndex
CREATE INDEX "lab_results_updated_by_id_idx" ON "lab_results"("updated_by_id");

-- CreateIndex
CREATE INDEX "lab_results_created_at_idx" ON "lab_results"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "lab_result_files_uuid_key" ON "lab_result_files"("uuid");

-- CreateIndex
CREATE INDEX "lab_result_files_lab_result_id_idx" ON "lab_result_files"("lab_result_id");

-- CreateIndex
CREATE INDEX "lab_result_files_created_at_idx" ON "lab_result_files"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vitals_uuid_key" ON "vitals"("uuid");

-- CreateIndex
CREATE INDEX "vitals_patient_id_idx" ON "vitals"("patient_id");

-- CreateIndex
CREATE INDEX "vitals_recorded_at_idx" ON "vitals"("recorded_at");

-- CreateIndex
CREATE INDEX "vitals_recorded_by_id_idx" ON "vitals"("recorded_by_id");

-- CreateIndex
CREATE INDEX "vitals_type_idx" ON "vitals"("type");

-- CreateIndex
CREATE INDEX "vitals_is_draft_idx" ON "vitals"("is_draft");

-- CreateIndex
CREATE INDEX "vitals_is_track_idx" ON "vitals"("is_track");

-- CreateIndex
CREATE INDEX "vitals_created_at_idx" ON "vitals"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vital_alerts_uuid_key" ON "vital_alerts"("uuid");

-- CreateIndex
CREATE INDEX "vital_alerts_patient_id_idx" ON "vital_alerts"("patient_id");

-- CreateIndex
CREATE INDEX "vital_alerts_assign_to_id_idx" ON "vital_alerts"("assign_to_id");

-- CreateIndex
CREATE INDEX "vital_alerts_created_at_idx" ON "vital_alerts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vital_review_notes_uuid_key" ON "vital_review_notes"("uuid");

-- CreateIndex
CREATE INDEX "vital_review_notes_patient_id_idx" ON "vital_review_notes"("patient_id");

-- CreateIndex
CREATE INDEX "vital_review_notes_reviewed_by_id_idx" ON "vital_review_notes"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "vital_review_notes_created_at_idx" ON "vital_review_notes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_uuid_key" ON "alerts"("uuid");

-- CreateIndex
CREATE INDEX "alerts_vital_id_idx" ON "alerts"("vital_id");

-- CreateIndex
CREATE INDEX "alerts_assigned_to_id_idx" ON "alerts"("assigned_to_id");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_uuid_key" ON "enrollments"("uuid");

-- CreateIndex
CREATE INDEX "enrollments_patient_id_idx" ON "enrollments"("patient_id");

-- CreateIndex
CREATE INDEX "enrollments_category_idx" ON "enrollments"("category");

-- CreateIndex
CREATE INDEX "enrollments_enrollment_service_type_idx" ON "enrollments"("enrollment_service_type");

-- CreateIndex
CREATE INDEX "enrollments_enrollment_status_type_idx" ON "enrollments"("enrollment_status_type");

-- CreateIndex
CREATE INDEX "enrollments_created_at_idx" ON "enrollments"("created_at");

-- CreateIndex
CREATE INDEX "enrollments_consent_document_id_idx" ON "enrollments"("consent_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "additional_consent_templates_uuid_key" ON "additional_consent_templates"("uuid");

-- CreateIndex
CREATE INDEX "additional_consent_templates_provider_group_id_idx" ON "additional_consent_templates"("provider_group_id");

-- CreateIndex
CREATE INDEX "additional_consent_templates_created_at_idx" ON "additional_consent_templates"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "patient_care_plans_uuid_key" ON "patient_care_plans"("uuid");

-- CreateIndex
CREATE INDEX "patient_care_plans_patient_id_idx" ON "patient_care_plans"("patient_id");

-- CreateIndex
CREATE INDEX "patient_care_plans_careplan_id_idx" ON "patient_care_plans"("careplan_id");

-- CreateIndex
CREATE INDEX "patient_care_plans_program_idx" ON "patient_care_plans"("program");

-- CreateIndex
CREATE INDEX "patient_care_plans_created_at_idx" ON "patient_care_plans"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_questions_uuid_key" ON "care_plan_questions"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_questions_careplan_id_idx" ON "care_plan_questions"("careplan_id");

-- CreateIndex
CREATE INDEX "care_plan_questions_condition_id_idx" ON "care_plan_questions"("condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_responses_uuid_key" ON "care_plan_responses"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_responses_patient_id_idx" ON "care_plan_responses"("patient_id");

-- CreateIndex
CREATE INDEX "care_plan_responses_careplan_id_idx" ON "care_plan_responses"("careplan_id");

-- CreateIndex
CREATE INDEX "care_plan_responses_question_id_idx" ON "care_plan_responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_progress_uuid_key" ON "care_plan_progress"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_progress_patient_id_idx" ON "care_plan_progress"("patient_id");

-- CreateIndex
CREATE INDEX "care_plan_progress_careplan_id_idx" ON "care_plan_progress"("careplan_id");

-- CreateIndex
CREATE INDEX "care_plan_progress_status_idx" ON "care_plan_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_provider_reviews_uuid_key" ON "care_plan_provider_reviews"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_provider_reviews_patient_id_idx" ON "care_plan_provider_reviews"("patient_id");

-- CreateIndex
CREATE INDEX "care_plan_provider_reviews_reviewed_by_id_idx" ON "care_plan_provider_reviews"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "care_plan_provider_reviews_created_at_idx" ON "care_plan_provider_reviews"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_monthly_updates_uuid_key" ON "care_plan_monthly_updates"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_monthly_updates_patient_id_idx" ON "care_plan_monthly_updates"("patient_id");

-- CreateIndex
CREATE INDEX "care_plan_monthly_updates_created_at_idx" ON "care_plan_monthly_updates"("created_at");

-- CreateIndex
CREATE INDEX "care_plan_conditions_condition_id_idx" ON "care_plan_conditions"("condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_conditions_careplan_id_condition_id_key" ON "care_plan_conditions"("careplan_id", "condition_id");

-- CreateIndex
CREATE INDEX "care_plan_icd_codes_icdcode_id_idx" ON "care_plan_icd_codes"("icdcode_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_icd_codes_careplan_id_icdcode_id_key" ON "care_plan_icd_codes"("careplan_id", "icdcode_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_tasks_uuid_key" ON "care_plan_tasks"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_tasks_careplan_id_idx" ON "care_plan_tasks"("careplan_id");

-- CreateIndex
CREATE INDEX "care_plan_tasks_template_id_idx" ON "care_plan_tasks"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "common_questions_uuid_key" ON "common_questions"("uuid");

-- CreateIndex
CREATE INDEX "common_questions_type_idx" ON "common_questions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_uuid_key" ON "assessments"("uuid");

-- CreateIndex
CREATE INDEX "assessments_provider_group_id_idx" ON "assessments"("provider_group_id");

-- CreateIndex
CREATE INDEX "assessments_category_idx" ON "assessments"("category");

-- CreateIndex
CREATE INDEX "assessments_created_at_idx" ON "assessments"("created_at");

-- CreateIndex
CREATE INDEX "assessment_conditions_condition_id_idx" ON "assessment_conditions"("condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_conditions_assessment_id_condition_id_key" ON "assessment_conditions"("assessment_id", "condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_questions_uuid_key" ON "assessment_questions"("uuid");

-- CreateIndex
CREATE INDEX "assessment_questions_assessment_id_idx" ON "assessment_questions"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_questions_choice_id_idx" ON "assessment_questions"("choice_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_question_choices_uuid_key" ON "assessment_question_choices"("uuid");

-- CreateIndex
CREATE INDEX "assessment_question_choices_question_id_idx" ON "assessment_question_choices"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "assigned_assessments_uuid_key" ON "assigned_assessments"("uuid");

-- CreateIndex
CREATE INDEX "assigned_assessments_assessment_id_idx" ON "assigned_assessments"("assessment_id");

-- CreateIndex
CREATE INDEX "assigned_assessments_patient_id_idx" ON "assigned_assessments"("patient_id");

-- CreateIndex
CREATE INDEX "assigned_assessments_scheduled_at_idx" ON "assigned_assessments"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_responses_uuid_key" ON "assessment_responses"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_responses_assignement_id_key" ON "assessment_responses"("assignement_id");

-- CreateIndex
CREATE INDEX "assessment_responses_created_at_idx" ON "assessment_responses"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "screenings_uuid_key" ON "screenings"("uuid");

-- CreateIndex
CREATE INDEX "screenings_patient_id_idx" ON "screenings"("patient_id");

-- CreateIndex
CREATE INDEX "screenings_screening_at_idx" ON "screenings"("screening_at");

-- CreateIndex
CREATE UNIQUE INDEX "education_schedules_uuid_key" ON "education_schedules"("uuid");

-- CreateIndex
CREATE INDEX "education_schedules_education_id_idx" ON "education_schedules"("education_id");

-- CreateIndex
CREATE INDEX "education_schedules_send_at_idx" ON "education_schedules"("send_at");

-- CreateIndex
CREATE INDEX "education_schedule_patients_educationschedule_id_idx" ON "education_schedule_patients"("educationschedule_id");

-- CreateIndex
CREATE INDEX "education_schedule_patients_patient_id_idx" ON "education_schedule_patients"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "education_schedule_patients_educationschedule_id_patient_id_key" ON "education_schedule_patients"("educationschedule_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_user_id_key" ON "chat_participants"("user_id");

-- CreateIndex
CREATE INDEX "chat_participants_conversation_id_idx" ON "chat_participants"("conversation_id");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_idx" ON "chat_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "chat_messages_sender_id_idx" ON "chat_messages"("sender_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sms_records_uuid_key" ON "sms_records"("uuid");

-- CreateIndex
CREATE INDEX "sms_records_patient_id_idx" ON "sms_records"("patient_id");

-- CreateIndex
CREATE INDEX "sms_records_provider_id_idx" ON "sms_records"("provider_id");

-- CreateIndex
CREATE INDEX "sms_records_created_at_idx" ON "sms_records"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sms_record_media_uuid_key" ON "sms_record_media"("uuid");

-- CreateIndex
CREATE INDEX "sms_record_media_sms_id_idx" ON "sms_record_media"("sms_id");

-- CreateIndex
CREATE INDEX "text_message_histories_number_idx" ON "text_message_histories"("number");

-- CreateIndex
CREATE UNIQUE INDEX "bulk_communications_uuid_key" ON "bulk_communications"("uuid");

-- CreateIndex
CREATE INDEX "bulk_communications_send_on_idx" ON "bulk_communications"("send_on");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_uuid_key" ON "user_notifications"("uuid");

-- CreateIndex
CREATE INDEX "user_notifications_user_id_idx" ON "user_notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "roles"("uuid");

-- CreateIndex
CREATE INDEX "roles_provider_group_id_idx" ON "roles"("provider_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_addresses_email_key" ON "email_addresses"("email");

-- CreateIndex
CREATE INDEX "email_addresses_user_id_idx" ON "email_addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "time_logs_uuid_key" ON "time_logs"("uuid");

-- CreateIndex
CREATE INDEX "time_logs_log_for_patient_id_idx" ON "time_logs"("log_for_patient_id");

-- CreateIndex
CREATE INDEX "time_logs_log_by_provider_id_idx" ON "time_logs"("log_by_provider_id");

-- CreateIndex
CREATE INDEX "time_logs_program_idx" ON "time_logs"("program");

-- CreateIndex
CREATE INDEX "time_logs_start_at_idx" ON "time_logs"("start_at");

-- CreateIndex
CREATE INDEX "time_logs_enrollment_service_type_idx" ON "time_logs"("enrollment_service_type");

-- CreateIndex
CREATE INDEX "time_logs_current_month_year_idx" ON "time_logs"("current_month_year");

-- CreateIndex
CREATE INDEX "time_logs_log_at_idx" ON "time_logs"("log_at");

-- CreateIndex
CREATE INDEX "time_log_intervals_time_log_id_idx" ON "time_log_intervals"("time_log_id");

-- CreateIndex
CREATE UNIQUE INDEX "pcm_billings_uuid_key" ON "pcm_billings"("uuid");

-- CreateIndex
CREATE INDEX "pcm_billings_patient_id_idx" ON "pcm_billings"("patient_id");

-- CreateIndex
CREATE INDEX "pcm_billings_billing_status_idx" ON "pcm_billings"("billing_status");

-- CreateIndex
CREATE INDEX "pcm_billings_month_year_idx" ON "pcm_billings"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "pcm_billings_patient_id_month_year_key" ON "pcm_billings"("patient_id", "month", "year");

-- CreateIndex
CREATE INDEX "pcm_billing_time_logs_pcmbilling_id_idx" ON "pcm_billing_time_logs"("pcmbilling_id");

-- CreateIndex
CREATE INDEX "pcm_billing_time_logs_timelog_id_idx" ON "pcm_billing_time_logs"("timelog_id");

-- CreateIndex
CREATE UNIQUE INDEX "pcm_billing_time_logs_pcmbilling_id_timelog_id_key" ON "pcm_billing_time_logs"("pcmbilling_id", "timelog_id");

-- CreateIndex
CREATE INDEX "pcm_billing_pcm_time_logs_pcmbilling_id_idx" ON "pcm_billing_pcm_time_logs"("pcmbilling_id");

-- CreateIndex
CREATE INDEX "pcm_billing_pcm_time_logs_timelog_id_idx" ON "pcm_billing_pcm_time_logs"("timelog_id");

-- CreateIndex
CREATE UNIQUE INDEX "pcm_billing_pcm_time_logs_pcmbilling_id_timelog_id_key" ON "pcm_billing_pcm_time_logs"("pcmbilling_id", "timelog_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_notes_uuid_key" ON "billing_notes"("uuid");

-- CreateIndex
CREATE INDEX "billing_notes_pcm_billing_id_idx" ON "billing_notes"("pcm_billing_id");

-- CreateIndex
CREATE INDEX "billing_notes_created_at_idx" ON "billing_notes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_devices_uuid_key" ON "enrollment_devices"("uuid");

-- CreateIndex
CREATE INDEX "enrollment_devices_enrollment_id_idx" ON "enrollment_devices"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_billings_uuid_key" ON "enrollment_billings"("uuid");

-- CreateIndex
CREATE INDEX "enrollment_billings_patient_id_idx" ON "enrollment_billings"("patient_id");

-- CreateIndex
CREATE INDEX "enrollment_billings_enrollment_id_idx" ON "enrollment_billings"("enrollment_id");

-- CreateIndex
CREATE INDEX "enrollment_billings_service_idx" ON "enrollment_billings"("service");

-- CreateIndex
CREATE INDEX "enrollment_billings_current_month_year_idx" ON "enrollment_billings"("current_month_year");

-- CreateIndex
CREATE INDEX "enrollment_billings_claim_status_idx" ON "enrollment_billings"("claim_status");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_billings_uuid_key" ON "monitoring_billings"("uuid");

-- CreateIndex
CREATE INDEX "monitoring_billings_patient_id_idx" ON "monitoring_billings"("patient_id");

-- CreateIndex
CREATE INDEX "monitoring_billings_enrollment_id_idx" ON "monitoring_billings"("enrollment_id");

-- CreateIndex
CREATE INDEX "monitoring_billings_service_idx" ON "monitoring_billings"("service");

-- CreateIndex
CREATE INDEX "monitoring_billings_days_idx" ON "monitoring_billings"("days");

-- CreateIndex
CREATE INDEX "monitoring_billings_bill_cycle_end_date_idx" ON "monitoring_billings"("bill_cycle_end_date");

-- CreateIndex
CREATE INDEX "monitoring_billings_new_updated_at_idx" ON "monitoring_billings"("new_updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "interaction_billings_uuid_key" ON "interaction_billings"("uuid");

-- CreateIndex
CREATE INDEX "interaction_billings_patient_id_idx" ON "interaction_billings"("patient_id");

-- CreateIndex
CREATE INDEX "interaction_billings_enrollment_id_idx" ON "interaction_billings"("enrollment_id");

-- CreateIndex
CREATE INDEX "interaction_billings_service_idx" ON "interaction_billings"("service");

-- CreateIndex
CREATE INDEX "interaction_billings_current_month_year_idx" ON "interaction_billings"("current_month_year");

-- CreateIndex
CREATE UNIQUE INDEX "interaction_billings_patient_id_service_current_month_year_key" ON "interaction_billings"("patient_id", "service", "current_month_year");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_data_uuid_key" ON "monitoring_data"("uuid");

-- CreateIndex
CREATE INDEX "monitoring_data_patient_id_idx" ON "monitoring_data"("patient_id");

-- CreateIndex
CREATE INDEX "monitoring_data_enrollment_id_idx" ON "monitoring_data"("enrollment_id");

-- CreateIndex
CREATE INDEX "monitoring_data_reading_date_idx" ON "monitoring_data"("reading_date");

-- CreateIndex
CREATE INDEX "monitoring_data_step_date_idx" ON "monitoring_data"("step_date");

-- CreateIndex
CREATE INDEX "monitoring_data_is_alert_idx" ON "monitoring_data"("is_alert");

-- CreateIndex
CREATE UNIQUE INDEX "manual_time_entries_uuid_key" ON "manual_time_entries"("uuid");

-- CreateIndex
CREATE INDEX "manual_time_entries_patient_id_idx" ON "manual_time_entries"("patient_id");

-- CreateIndex
CREATE INDEX "manual_time_entries_time_log_id_idx" ON "manual_time_entries"("time_log_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_interactions_uuid_key" ON "patient_interactions"("uuid");

-- CreateIndex
CREATE INDEX "patient_interactions_patient_id_idx" ON "patient_interactions"("patient_id");

-- CreateIndex
CREATE INDEX "patient_interactions_enrollment_service_type_idx" ON "patient_interactions"("enrollment_service_type");

-- CreateIndex
CREATE INDEX "patient_interactions_interaction_week_interaction_year_idx" ON "patient_interactions"("interaction_week", "interaction_year");

-- CreateIndex
CREATE UNIQUE INDEX "activity_timelines_uuid_key" ON "activity_timelines"("uuid");

-- CreateIndex
CREATE INDEX "activity_timelines_patient_id_idx" ON "activity_timelines"("patient_id");

-- CreateIndex
CREATE INDEX "activity_timelines_event_type_idx" ON "activity_timelines"("event_type");

-- CreateIndex
CREATE INDEX "activity_timelines_occurred_at_idx" ON "activity_timelines"("occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_uuid_key" ON "sessions"("uuid");

-- CreateIndex
CREATE INDEX "sessions_patient_id_idx" ON "sessions"("patient_id");

-- CreateIndex
CREATE INDEX "sessions_host_id_idx" ON "sessions"("host_id");

-- CreateIndex
CREATE INDEX "sessions_datetime_idx" ON "sessions"("datetime");

-- CreateIndex
CREATE INDEX "sessions_created_at_idx" ON "sessions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "session_files_uuid_key" ON "session_files"("uuid");

-- CreateIndex
CREATE INDEX "session_files_session_id_idx" ON "session_files"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "telehealth_sessions_appointmentId_key" ON "telehealth_sessions"("appointmentId");

-- CreateIndex
CREATE INDEX "telehealth_sessions_meetingId_idx" ON "telehealth_sessions"("meetingId");

-- CreateIndex
CREATE INDEX "telehealth_sessions_scheduledStart_idx" ON "telehealth_sessions"("scheduledStart");

-- CreateIndex
CREATE UNIQUE INDEX "patient_encounters_uuid_key" ON "patient_encounters"("uuid");

-- CreateIndex
CREATE INDEX "patient_encounters_patient_id_idx" ON "patient_encounters"("patient_id");

-- CreateIndex
CREATE INDEX "patient_encounters_provider_id_idx" ON "patient_encounters"("provider_id");

-- CreateIndex
CREATE INDEX "patient_encounters_schedule_id_idx" ON "patient_encounters"("schedule_id");

-- CreateIndex
CREATE INDEX "patient_encounters_service_date_idx" ON "patient_encounters"("service_date");

-- CreateIndex
CREATE UNIQUE INDEX "patient_encounter_details_uuid_key" ON "patient_encounter_details"("uuid");

-- CreateIndex
CREATE INDEX "patient_encounter_details_session_id_idx" ON "patient_encounter_details"("session_id");

-- CreateIndex
CREATE INDEX "patient_encounter_details_patient_id_idx" ON "patient_encounter_details"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "general_call_recordings_uuid_key" ON "general_call_recordings"("uuid");

-- CreateIndex
CREATE INDEX "general_call_recordings_patient_id_idx" ON "general_call_recordings"("patient_id");

-- CreateIndex
CREATE INDEX "general_call_recordings_provider_id_idx" ON "general_call_recordings"("provider_id");

-- CreateIndex
CREATE INDEX "general_call_recordings_provider_group_id_idx" ON "general_call_recordings"("provider_group_id");

-- CreateIndex
CREATE INDEX "general_call_recordings_created_at_idx" ON "general_call_recordings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_transfer_calls_uuid_key" ON "provider_group_transfer_calls"("uuid");

-- CreateIndex
CREATE INDEX "provider_group_transfer_calls_provider_group_id_idx" ON "provider_group_transfer_calls"("provider_group_id");

-- CreateIndex
CREATE INDEX "provider_group_transfer_calls_provider_id_idx" ON "provider_group_transfer_calls"("provider_id");

-- CreateIndex
CREATE INDEX "provider_group_transfer_calls_created_at_idx" ON "provider_group_transfer_calls"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_uuid_key" ON "appointments"("uuid");

-- CreateIndex
CREATE INDEX "appointments_availability_id_starts_at_status_idx" ON "appointments"("availability_id", "starts_at", "status");

-- CreateIndex
CREATE INDEX "appointments_provider_id_starts_at_status_idx" ON "appointments"("provider_id", "starts_at", "status");

-- CreateIndex
CREATE INDEX "appointments_patient_id_starts_at_idx" ON "appointments"("patient_id", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_starts_at_status_idx" ON "appointments"("starts_at", "status");

-- CreateIndex
CREATE INDEX "appointments_appointment_type_id_idx" ON "appointments"("appointment_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_availability_id_starts_at_window_index_key" ON "appointments"("availability_id", "starts_at", "window_index");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_types_uuid_key" ON "appointment_types"("uuid");

-- CreateIndex
CREATE INDEX "appointment_types_name_idx" ON "appointment_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "availabilities_uuid_key" ON "availabilities"("uuid");

-- CreateIndex
CREATE INDEX "availabilities_type_is_active_idx" ON "availabilities"("type", "is_active");

-- CreateIndex
CREATE INDEX "availabilities_provider_id_idx" ON "availabilities"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_days_uuid_key" ON "availability_days"("uuid");

-- CreateIndex
CREATE INDEX "availability_days_date_idx" ON "availability_days"("date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_days_availability_id_date_key" ON "availability_days"("availability_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_uuid_key" ON "rooms"("uuid");

-- CreateIndex
CREATE INDEX "rooms_name_idx" ON "rooms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reason_to_visits_uuid_key" ON "reason_to_visits"("uuid");

-- CreateIndex
CREATE INDEX "reason_to_visits_body_part_id_idx" ON "reason_to_visits"("body_part_id");

-- CreateIndex
CREATE INDEX "reason_to_visits_name_idx" ON "reason_to_visits"("name");

-- CreateIndex
CREATE UNIQUE INDEX "body_parts_uuid_key" ON "body_parts"("uuid");

-- CreateIndex
CREATE INDEX "body_parts_name_idx" ON "body_parts"("name");

-- CreateIndex
CREATE INDEX "vital_alert_providers_provider_id_idx" ON "vital_alert_providers"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "vital_alert_providers_vitalalert_id_provider_id_key" ON "vital_alert_providers"("vitalalert_id", "provider_id");

-- CreateIndex
CREATE INDEX "vital_review_note_vitals_vital_id_idx" ON "vital_review_note_vitals"("vital_id");

-- CreateIndex
CREATE UNIQUE INDEX "vital_review_note_vitals_vitalreviewnote_id_vital_id_key" ON "vital_review_note_vitals"("vitalreviewnote_id", "vital_id");

-- CreateIndex
CREATE UNIQUE INDEX "rpm_vital_informations_uuid_key" ON "rpm_vital_informations"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "rpm_vital_informations_patient_id_vital_to_track_key" ON "rpm_vital_informations"("patient_id", "vital_to_track");

-- CreateIndex
CREATE UNIQUE INDEX "vital_configurations_uuid_key" ON "vital_configurations"("uuid");

-- CreateIndex
CREATE INDEX "vital_configurations_provider_group_id_type_idx" ON "vital_configurations"("provider_group_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "reset_time_logs_uuid_key" ON "reset_time_logs"("uuid");

-- CreateIndex
CREATE INDEX "reset_time_logs_patient_id_idx" ON "reset_time_logs"("patient_id");

-- CreateIndex
CREATE INDEX "reset_time_logs_created_at_idx" ON "reset_time_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_provider_review_drafts_uuid_key" ON "care_plan_provider_review_drafts"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_provider_review_drafts_patient_id_idx" ON "care_plan_provider_review_drafts"("patient_id");

-- CreateIndex
CREATE INDEX "care_plan_provider_review_drafts_careplan_id_idx" ON "care_plan_provider_review_drafts"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_provider_review_notes_uuid_key" ON "care_plan_provider_review_notes"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_provider_review_notes_patient_id_idx" ON "care_plan_provider_review_notes"("patient_id");

-- CreateIndex
CREATE INDEX "care_plan_provider_review_notes_created_at_idx" ON "care_plan_provider_review_notes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_number_to_track_responses_uuid_key" ON "care_plan_number_to_track_responses"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_number_to_track_responses_patient_id_idx" ON "care_plan_number_to_track_responses"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_progress_histories_uuid_key" ON "care_plan_progress_histories"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_progress_histories_progress_obj_id_idx" ON "care_plan_progress_histories"("progress_obj_id");

-- CreateIndex
CREATE UNIQUE INDEX "personal_progress_uuid_key" ON "personal_progress"("uuid");

-- CreateIndex
CREATE INDEX "personal_progress_patient_id_idx" ON "personal_progress"("patient_id");

-- CreateIndex
CREATE INDEX "personal_progress_created_at_idx" ON "personal_progress"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "personal_progress_histories_uuid_key" ON "personal_progress_histories"("uuid");

-- CreateIndex
CREATE INDEX "personal_progress_histories_progress_obj_id_idx" ON "personal_progress_histories"("progress_obj_id");

-- CreateIndex
CREATE UNIQUE INDEX "common_question_responses_uuid_key" ON "common_question_responses"("uuid");

-- CreateIndex
CREATE INDEX "common_question_responses_patient_id_idx" ON "common_question_responses"("patient_id");

-- CreateIndex
CREATE INDEX "common_question_responses_careplan_id_idx" ON "common_question_responses"("careplan_id");

-- CreateIndex
CREATE INDEX "common_question_responses_question_id_idx" ON "common_question_responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "generic_care_plan_responses_uuid_key" ON "generic_care_plan_responses"("uuid");

-- CreateIndex
CREATE INDEX "generic_care_plan_responses_patient_id_idx" ON "generic_care_plan_responses"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_additional_notes_uuid_key" ON "care_plan_additional_notes"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_additional_notes_patient_id_idx" ON "care_plan_additional_notes"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "condition_question_file_responses_uuid_key" ON "condition_question_file_responses"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "condition_questionnaires_uuid_key" ON "condition_questionnaires"("uuid");

-- CreateIndex
CREATE INDEX "condition_questionnaires_condition_id_idx" ON "condition_questionnaires"("condition_id");

-- CreateIndex
CREATE INDEX "condition_questionnaires_name_idx" ON "condition_questionnaires"("name");

-- CreateIndex
CREATE UNIQUE INDEX "condition_questionnaire_responses_uuid_key" ON "condition_questionnaire_responses"("uuid");

-- CreateIndex
CREATE INDEX "condition_questionnaire_responses_question_id_idx" ON "condition_questionnaire_responses"("question_id");

-- CreateIndex
CREATE INDEX "condition_questionnaire_responses_patient_id_idx" ON "condition_questionnaire_responses"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_patient_reports_uuid_key" ON "care_plan_patient_reports"("uuid");

-- CreateIndex
CREATE INDEX "care_plan_patient_reports_patient_id_idx" ON "care_plan_patient_reports"("patient_id");

-- CreateIndex
CREATE INDEX "care_plan_patient_reports_created_at_idx" ON "care_plan_patient_reports"("created_at");

-- CreateIndex
CREATE INDEX "provider_review_care_plans_careplan_id_idx" ON "provider_review_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_review_care_plans_providerReview_id_careplan_id_key" ON "provider_review_care_plans"("providerReview_id", "careplan_id");

-- CreateIndex
CREATE INDEX "monthly_update_care_plans_careplan_id_idx" ON "monthly_update_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_update_care_plans_careplanmonthlyupdate_id_careplan_key" ON "monthly_update_care_plans"("careplanmonthlyupdate_id", "careplan_id");

-- CreateIndex
CREATE INDEX "provider_review_note_care_plans_careplan_id_idx" ON "provider_review_note_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_review_note_care_plans_careplanproviderreviewnote__key" ON "provider_review_note_care_plans"("careplanproviderreviewnote_id", "careplan_id");

-- CreateIndex
CREATE INDEX "number_to_track_response_care_plans_careplan_id_idx" ON "number_to_track_response_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "number_to_track_response_care_plans_careplannumbertotrackre_key" ON "number_to_track_response_care_plans"("careplannumbertotrackresponse_id", "careplan_id");

-- CreateIndex
CREATE INDEX "additional_note_care_plans_careplan_id_idx" ON "additional_note_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "additional_note_care_plans_careplanadditionalnotes_id_carep_key" ON "additional_note_care_plans"("careplanadditionalnotes_id", "careplan_id");

-- CreateIndex
CREATE INDEX "generic_response_care_plans_careplan_id_idx" ON "generic_response_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "generic_response_care_plans_genericcareplanresponse_id_care_key" ON "generic_response_care_plans"("genericcareplanresponse_id", "careplan_id");

-- CreateIndex
CREATE INDEX "patient_report_care_plans_careplan_id_idx" ON "patient_report_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_report_care_plans_careplanpatientreport_id_careplan_key" ON "patient_report_care_plans"("careplanpatientreport_id", "careplan_id");

-- CreateIndex
CREATE INDEX "allergy_care_plans_careplan_id_idx" ON "allergy_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "allergy_care_plans_allergy_id_careplan_id_key" ON "allergy_care_plans"("allergy_id", "careplan_id");

-- CreateIndex
CREATE INDEX "medication_care_plans_careplan_id_idx" ON "medication_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "medication_care_plans_medication_id_careplan_id_key" ON "medication_care_plans"("medication_id", "careplan_id");

-- CreateIndex
CREATE INDEX "lab_result_care_plans_careplan_id_idx" ON "lab_result_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "lab_result_care_plans_labresult_id_careplan_id_key" ON "lab_result_care_plans"("labresult_id", "careplan_id");

-- CreateIndex
CREATE INDEX "vital_care_plans_careplan_id_idx" ON "vital_care_plans"("careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "vital_care_plans_vital_id_careplan_id_key" ON "vital_care_plans"("vital_id", "careplan_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_response_files_uuid_key" ON "assessment_response_files"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "screening_reviews_uuid_key" ON "screening_reviews"("uuid");

-- CreateIndex
CREATE INDEX "screening_reviews_screening_id_idx" ON "screening_reviews"("screening_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_overall_responses_uuid_key" ON "assessment_overall_responses"("uuid");

-- CreateIndex
CREATE INDEX "assessment_overall_responses_patient_id_idx" ON "assessment_overall_responses"("patient_id");

-- AddForeignKey
ALTER TABLE "icd_codes" ADD CONSTRAINT "icd_codes_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_groups" ADD CONSTRAINT "provider_groups_physical_address_id_fkey" FOREIGN KEY ("physical_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_groups" ADD CONSTRAINT "provider_groups_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_members" ADD CONSTRAINT "provider_group_members_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_members" ADD CONSTRAINT "provider_group_members_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_questions" ADD CONSTRAINT "condition_questions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_types" ADD CONSTRAINT "task_types_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_types" ADD CONSTRAINT "task_types_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_communication_templates" ADD CONSTRAINT "bulk_communication_templates_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_communication_template_revisions" ADD CONSTRAINT "bulk_communication_template_revisions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "bulk_communication_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_copied_from_id_fkey" FOREIGN KEY ("copied_from_id") REFERENCES "care_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_insurances" ADD CONSTRAINT "patient_insurances_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_emergency_contacts" ADD CONSTRAINT "patient_emergency_contacts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_power_of_attorneys" ADD CONSTRAINT "patient_power_of_attorneys_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_preferred_pharmacies" ADD CONSTRAINT "patient_preferred_pharmacies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_imagings" ADD CONSTRAINT "patient_imagings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_prescribing_provider_fkey" FOREIGN KEY ("prescribing_provider") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical_histories" ADD CONSTRAINT "patient_medical_histories_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_surgical_histories" ADD CONSTRAINT "patient_surgical_histories_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_social_histories" ADD CONSTRAINT "patient_social_histories_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_modified_by_id_fkey" FOREIGN KEY ("modified_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_archived_by_id_fkey" FOREIGN KEY ("archived_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_unarchived_by_id_fkey" FOREIGN KEY ("unarchived_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "consents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_medium_template_id_fkey" FOREIGN KEY ("medium_template_id") REFERENCES "bulk_communication_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_material_conditions" ADD CONSTRAINT "education_material_conditions_education_material_id_fkey" FOREIGN KEY ("education_material_id") REFERENCES "education_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_material_conditions" ADD CONSTRAINT "education_material_conditions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_education_materials" ADD CONSTRAINT "patient_education_materials_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_education_materials" ADD CONSTRAINT "patient_education_materials_education_material_id_fkey" FOREIGN KEY ("education_material_id") REFERENCES "education_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_education_materials" ADD CONSTRAINT "patient_education_materials_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_materials" ADD CONSTRAINT "education_materials_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_materials" ADD CONSTRAINT "education_materials_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_materials" ADD CONSTRAINT "education_materials_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_caregiver_contacts" ADD CONSTRAINT "patient_caregiver_contacts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_managers" ADD CONSTRAINT "patient_care_managers_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_managers" ADD CONSTRAINT "patient_care_managers_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_result_files" ADD CONSTRAINT "lab_result_files_lab_result_id_fkey" FOREIGN KEY ("lab_result_id") REFERENCES "lab_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_alerts" ADD CONSTRAINT "vital_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_alerts" ADD CONSTRAINT "vital_alerts_assign_to_id_fkey" FOREIGN KEY ("assign_to_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_review_notes" ADD CONSTRAINT "vital_review_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_review_notes" ADD CONSTRAINT "vital_review_notes_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_vital_id_fkey" FOREIGN KEY ("vital_id") REFERENCES "vitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_unenrolled_by_id_fkey" FOREIGN KEY ("unenrolled_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_declined_by_id_fkey" FOREIGN KEY ("declined_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_consent_document_id_fkey" FOREIGN KEY ("consent_document_id") REFERENCES "patient_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_consent_templates" ADD CONSTRAINT "additional_consent_templates_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_plans" ADD CONSTRAINT "patient_care_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_plans" ADD CONSTRAINT "patient_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_plans" ADD CONSTRAINT "patient_care_plans_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_plans" ADD CONSTRAINT "patient_care_plans_sign_off_by_id_fkey" FOREIGN KEY ("sign_off_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_plans" ADD CONSTRAINT "patient_care_plans_stoped_by_id_fkey" FOREIGN KEY ("stoped_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_plans" ADD CONSTRAINT "patient_care_plans_discard_by_id_fkey" FOREIGN KEY ("discard_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_plans" ADD CONSTRAINT "patient_care_plans_transfer_by_id_fkey" FOREIGN KEY ("transfer_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_questions" ADD CONSTRAINT "care_plan_questions_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_questions" ADD CONSTRAINT "care_plan_questions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_responses" ADD CONSTRAINT "care_plan_responses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_responses" ADD CONSTRAINT "care_plan_responses_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_responses" ADD CONSTRAINT "care_plan_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "care_plan_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_responses" ADD CONSTRAINT "care_plan_responses_discard_by_id_fkey" FOREIGN KEY ("discard_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_progress" ADD CONSTRAINT "care_plan_progress_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_progress" ADD CONSTRAINT "care_plan_progress_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_progress" ADD CONSTRAINT "care_plan_progress_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_progress" ADD CONSTRAINT "care_plan_progress_discard_by_id_fkey" FOREIGN KEY ("discard_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_reviews" ADD CONSTRAINT "care_plan_provider_reviews_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_reviews" ADD CONSTRAINT "care_plan_provider_reviews_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_monthly_updates" ADD CONSTRAINT "care_plan_monthly_updates_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_monthly_updates" ADD CONSTRAINT "care_plan_monthly_updates_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_monthly_updates" ADD CONSTRAINT "care_plan_monthly_updates_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_conditions" ADD CONSTRAINT "care_plan_conditions_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_conditions" ADD CONSTRAINT "care_plan_conditions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_icd_codes" ADD CONSTRAINT "care_plan_icd_codes_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_icd_codes" ADD CONSTRAINT "care_plan_icd_codes_icdcode_id_fkey" FOREIGN KEY ("icdcode_id") REFERENCES "icd_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_tasks" ADD CONSTRAINT "care_plan_tasks_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_tasks" ADD CONSTRAINT "care_plan_tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "bulk_communication_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_conditions" ADD CONSTRAINT "assessment_conditions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_conditions" ADD CONSTRAINT "assessment_conditions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_choice_id_fkey" FOREIGN KEY ("choice_id") REFERENCES "assessment_question_choices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_question_choices" ADD CONSTRAINT "assessment_question_choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "assessment_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_assessments" ADD CONSTRAINT "assigned_assessments_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_assessments" ADD CONSTRAINT "assigned_assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_assessments" ADD CONSTRAINT "assigned_assessments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_assessments" ADD CONSTRAINT "assigned_assessments_scheduled_by_id_fkey" FOREIGN KEY ("scheduled_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_assignement_id_fkey" FOREIGN KEY ("assignement_id") REFERENCES "assigned_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_review_by_id_fkey" FOREIGN KEY ("review_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_screening_by_id_fkey" FOREIGN KEY ("screening_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_scheduled_by_id_fkey" FOREIGN KEY ("scheduled_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_schedules" ADD CONSTRAINT "education_schedules_education_id_fkey" FOREIGN KEY ("education_id") REFERENCES "education_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_schedules" ADD CONSTRAINT "education_schedules_send_by_id_fkey" FOREIGN KEY ("send_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_schedules" ADD CONSTRAINT "education_schedules_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_schedules" ADD CONSTRAINT "education_schedules_scheduled_by_id_fkey" FOREIGN KEY ("scheduled_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_schedule_patients" ADD CONSTRAINT "education_schedule_patients_educationschedule_id_fkey" FOREIGN KEY ("educationschedule_id") REFERENCES "education_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_schedule_patients" ADD CONSTRAINT "education_schedule_patients_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "chat_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_records" ADD CONSTRAINT "sms_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_record_media" ADD CONSTRAINT "sms_record_media_sms_id_fkey" FOREIGN KEY ("sms_id") REFERENCES "sms_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_addresses" ADD CONSTRAINT "email_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_log_for_patient_id_fkey" FOREIGN KEY ("log_for_patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_log_by_provider_id_fkey" FOREIGN KEY ("log_by_provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_permorm_by_provider_id_fkey" FOREIGN KEY ("permorm_by_provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_log_intervals" ADD CONSTRAINT "time_log_intervals_time_log_id_fkey" FOREIGN KEY ("time_log_id") REFERENCES "time_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pcm_billings" ADD CONSTRAINT "pcm_billings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pcm_billing_time_logs" ADD CONSTRAINT "pcm_billing_time_logs_pcmbilling_id_fkey" FOREIGN KEY ("pcmbilling_id") REFERENCES "pcm_billings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pcm_billing_time_logs" ADD CONSTRAINT "pcm_billing_time_logs_timelog_id_fkey" FOREIGN KEY ("timelog_id") REFERENCES "time_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pcm_billing_pcm_time_logs" ADD CONSTRAINT "pcm_billing_pcm_time_logs_pcmbilling_id_fkey" FOREIGN KEY ("pcmbilling_id") REFERENCES "pcm_billings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pcm_billing_pcm_time_logs" ADD CONSTRAINT "pcm_billing_pcm_time_logs_timelog_id_fkey" FOREIGN KEY ("timelog_id") REFERENCES "time_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_pcm_billing_id_fkey" FOREIGN KEY ("pcm_billing_id") REFERENCES "pcm_billings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_devices" ADD CONSTRAINT "enrollment_devices_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_billings" ADD CONSTRAINT "enrollment_billings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_billings" ADD CONSTRAINT "enrollment_billings_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_billings" ADD CONSTRAINT "monitoring_billings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_billings" ADD CONSTRAINT "monitoring_billings_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_billings" ADD CONSTRAINT "interaction_billings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_billings" ADD CONSTRAINT "interaction_billings_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_data" ADD CONSTRAINT "monitoring_data_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_data" ADD CONSTRAINT "monitoring_data_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_time_entries" ADD CONSTRAINT "manual_time_entries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_time_entries" ADD CONSTRAINT "manual_time_entries_time_log_id_fkey" FOREIGN KEY ("time_log_id") REFERENCES "time_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_interactions" ADD CONSTRAINT "patient_interactions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_timelines" ADD CONSTRAINT "activity_timelines_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_general_call_id_fkey" FOREIGN KEY ("general_call_id") REFERENCES "general_call_recordings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_telehealth_session_id_fkey" FOREIGN KEY ("telehealth_session_id") REFERENCES "telehealth_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_files" ADD CONSTRAINT "session_files_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounters" ADD CONSTRAINT "patient_encounters_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounters" ADD CONSTRAINT "patient_encounters_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounters" ADD CONSTRAINT "patient_encounters_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounters" ADD CONSTRAINT "patient_encounters_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounter_details" ADD CONSTRAINT "patient_encounter_details_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounter_details" ADD CONSTRAINT "patient_encounter_details_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounter_details" ADD CONSTRAINT "patient_encounter_details_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounter_details" ADD CONSTRAINT "patient_encounter_details_signed_by_id_fkey" FOREIGN KEY ("signed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounter_details" ADD CONSTRAINT "patient_encounter_details_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_encounter_details" ADD CONSTRAINT "patient_encounter_details_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_call_recordings" ADD CONSTRAINT "general_call_recordings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_call_recordings" ADD CONSTRAINT "general_call_recordings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_call_recordings" ADD CONSTRAINT "general_call_recordings_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_transfer_calls" ADD CONSTRAINT "provider_group_transfer_calls_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_transfer_calls" ADD CONSTRAINT "provider_group_transfer_calls_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "availabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_appointment_type_id_fkey" FOREIGN KEY ("appointment_type_id") REFERENCES "appointment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_days" ADD CONSTRAINT "availability_days_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "availabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reason_to_visits" ADD CONSTRAINT "reason_to_visits_body_part_id_fkey" FOREIGN KEY ("body_part_id") REFERENCES "body_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_alert_providers" ADD CONSTRAINT "vital_alert_providers_vitalalert_id_fkey" FOREIGN KEY ("vitalalert_id") REFERENCES "vital_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_alert_providers" ADD CONSTRAINT "vital_alert_providers_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_review_note_vitals" ADD CONSTRAINT "vital_review_note_vitals_vitalreviewnote_id_fkey" FOREIGN KEY ("vitalreviewnote_id") REFERENCES "vital_review_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_review_note_vitals" ADD CONSTRAINT "vital_review_note_vitals_vital_id_fkey" FOREIGN KEY ("vital_id") REFERENCES "vitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rpm_vital_informations" ADD CONSTRAINT "rpm_vital_informations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_configurations" ADD CONSTRAINT "vital_configurations_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_configurations" ADD CONSTRAINT "vital_configurations_assign_to_id_fkey" FOREIGN KEY ("assign_to_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_time_logs" ADD CONSTRAINT "reset_time_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_time_logs" ADD CONSTRAINT "reset_time_logs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_review_drafts" ADD CONSTRAINT "care_plan_provider_review_drafts_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_review_drafts" ADD CONSTRAINT "care_plan_provider_review_drafts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_review_drafts" ADD CONSTRAINT "care_plan_provider_review_drafts_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_review_notes" ADD CONSTRAINT "care_plan_provider_review_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_review_notes" ADD CONSTRAINT "care_plan_provider_review_notes_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_provider_review_notes" ADD CONSTRAINT "care_plan_provider_review_notes_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_number_to_track_responses" ADD CONSTRAINT "care_plan_number_to_track_responses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_progress_histories" ADD CONSTRAINT "care_plan_progress_histories_progress_obj_id_fkey" FOREIGN KEY ("progress_obj_id") REFERENCES "care_plan_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_progress_histories" ADD CONSTRAINT "care_plan_progress_histories_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_progress_histories" ADD CONSTRAINT "care_plan_progress_histories_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_progress" ADD CONSTRAINT "personal_progress_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_progress" ADD CONSTRAINT "personal_progress_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_progress" ADD CONSTRAINT "personal_progress_discard_by_id_fkey" FOREIGN KEY ("discard_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_progress_histories" ADD CONSTRAINT "personal_progress_histories_progress_obj_id_fkey" FOREIGN KEY ("progress_obj_id") REFERENCES "personal_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_progress_histories" ADD CONSTRAINT "personal_progress_histories_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_progress_histories" ADD CONSTRAINT "personal_progress_histories_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common_question_responses" ADD CONSTRAINT "common_question_responses_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common_question_responses" ADD CONSTRAINT "common_question_responses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common_question_responses" ADD CONSTRAINT "common_question_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "common_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generic_care_plan_responses" ADD CONSTRAINT "generic_care_plan_responses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_additional_notes" ADD CONSTRAINT "care_plan_additional_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_additional_notes" ADD CONSTRAINT "care_plan_additional_notes_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_questionnaires" ADD CONSTRAINT "condition_questionnaires_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_questionnaire_responses" ADD CONSTRAINT "condition_questionnaire_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "condition_questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_questionnaire_responses" ADD CONSTRAINT "condition_questionnaire_responses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_questionnaire_responses" ADD CONSTRAINT "condition_questionnaire_responses_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_patient_reports" ADD CONSTRAINT "care_plan_patient_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_patient_reports" ADD CONSTRAINT "care_plan_patient_reports_send_by_id_fkey" FOREIGN KEY ("send_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_review_care_plans" ADD CONSTRAINT "provider_review_care_plans_providerReview_id_fkey" FOREIGN KEY ("providerReview_id") REFERENCES "care_plan_provider_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_review_care_plans" ADD CONSTRAINT "provider_review_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_update_care_plans" ADD CONSTRAINT "monthly_update_care_plans_careplanmonthlyupdate_id_fkey" FOREIGN KEY ("careplanmonthlyupdate_id") REFERENCES "care_plan_monthly_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_update_care_plans" ADD CONSTRAINT "monthly_update_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_review_note_care_plans" ADD CONSTRAINT "provider_review_note_care_plans_careplanproviderreviewnote_fkey" FOREIGN KEY ("careplanproviderreviewnote_id") REFERENCES "care_plan_provider_review_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_review_note_care_plans" ADD CONSTRAINT "provider_review_note_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_to_track_response_care_plans" ADD CONSTRAINT "number_to_track_response_care_plans_careplannumbertotrackr_fkey" FOREIGN KEY ("careplannumbertotrackresponse_id") REFERENCES "care_plan_number_to_track_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_to_track_response_care_plans" ADD CONSTRAINT "number_to_track_response_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_note_care_plans" ADD CONSTRAINT "additional_note_care_plans_careplanadditionalnotes_id_fkey" FOREIGN KEY ("careplanadditionalnotes_id") REFERENCES "care_plan_additional_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_note_care_plans" ADD CONSTRAINT "additional_note_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generic_response_care_plans" ADD CONSTRAINT "generic_response_care_plans_genericcareplanresponse_id_fkey" FOREIGN KEY ("genericcareplanresponse_id") REFERENCES "generic_care_plan_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generic_response_care_plans" ADD CONSTRAINT "generic_response_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_report_care_plans" ADD CONSTRAINT "patient_report_care_plans_careplanpatientreport_id_fkey" FOREIGN KEY ("careplanpatientreport_id") REFERENCES "care_plan_patient_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_report_care_plans" ADD CONSTRAINT "patient_report_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergy_care_plans" ADD CONSTRAINT "allergy_care_plans_allergy_id_fkey" FOREIGN KEY ("allergy_id") REFERENCES "patient_allergies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergy_care_plans" ADD CONSTRAINT "allergy_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_care_plans" ADD CONSTRAINT "medication_care_plans_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "patient_medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_care_plans" ADD CONSTRAINT "medication_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_result_care_plans" ADD CONSTRAINT "lab_result_care_plans_labresult_id_fkey" FOREIGN KEY ("labresult_id") REFERENCES "lab_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_result_care_plans" ADD CONSTRAINT "lab_result_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_care_plans" ADD CONSTRAINT "vital_care_plans_vital_id_fkey" FOREIGN KEY ("vital_id") REFERENCES "vitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_care_plans" ADD CONSTRAINT "vital_care_plans_careplan_id_fkey" FOREIGN KEY ("careplan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_reviews" ADD CONSTRAINT "screening_reviews_screening_id_fkey" FOREIGN KEY ("screening_id") REFERENCES "screenings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_reviews" ADD CONSTRAINT "screening_reviews_review_by_id_fkey" FOREIGN KEY ("review_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_overall_responses" ADD CONSTRAINT "assessment_overall_responses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_overall_responses" ADD CONSTRAINT "assessment_overall_responses_review_by_id_fkey" FOREIGN KEY ("review_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
