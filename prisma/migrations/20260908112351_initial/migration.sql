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
    "is_tenant_admin" BOOLEAN DEFAULT false,
    "is_super_tenant_admin" BOOLEAN DEFAULT false,
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
    "is_tenant_provider" BOOLEAN DEFAULT false,
    "is_tenant_admin" BOOLEAN DEFAULT false,
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

-- AddForeignKey
ALTER TABLE "icd_codes" ADD CONSTRAINT "icd_codes_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
