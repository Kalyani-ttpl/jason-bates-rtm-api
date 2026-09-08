-- CreateTable
CREATE TABLE "user_account" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "password" VARCHAR(128),
    "username" VARCHAR(150),
    "email" VARCHAR(254),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "picture" TEXT,
    "last_login" TIMESTAMPTZ,
    "date_joined" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "is_superuser" BOOLEAN DEFAULT false,
    "is_staff" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "is_tenant_admin" BOOLEAN DEFAULT false,
    "is_super_tenant_admin" BOOLEAN DEFAULT false,
    "is_provider" BOOLEAN DEFAULT false,
    "is_patient" BOOLEAN DEFAULT false,
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_group" (
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

    CONSTRAINT "provider_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider" (
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

    CONSTRAINT "provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_group_member" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "provider_id" BIGINT NOT NULL,
    "provider_group_id" BIGINT NOT NULL,

    CONSTRAINT "provider_group_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icd_code" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "code" VARCHAR(200),
    "description" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_unspecified" BOOLEAN NOT NULL DEFAULT false,
    "is_hipaa_covered" VARCHAR(100),
    "order_number" VARCHAR(255),
    "condition_id" BIGINT,

    CONSTRAINT "icd_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpt_code" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "code" VARCHAR(255),
    "description" VARCHAR(500),
    "category" VARCHAR(100),
    "global_period" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cpt_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition" (
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

    CONSTRAINT "condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_question" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "condition_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" TEXT,
    "question_type" VARCHAR(50),
    "choices" TEXT,
    "additional_note" TEXT,

    CONSTRAINT "condition_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_type" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "title" VARCHAR(255),
    "is_billable" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "provider_group_id" BIGINT,
    "created_by_id" BIGINT,

    CONSTRAINT "task_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_communication_template" (
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

    CONSTRAINT "bulk_communication_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_communication_template_revision" (
    "id" UUID NOT NULL,
    "template_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "old_title" VARCHAR(255),
    "new_title" VARCHAR(255),
    "old_content" TEXT,
    "new_content" TEXT,
    "revision_by_id" BIGINT,

    CONSTRAINT "bulk_communication_template_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent" (
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

    CONSTRAINT "consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careplan" (
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

    CONSTRAINT "careplan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_account_uuid_key" ON "user_account"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_username_key" ON "user_account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_uuid_key" ON "provider_group"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_group_npi_key" ON "provider_group"("group_npi");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_code_key" ON "provider_group"("code");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_system_email_key" ON "provider_group"("system_email");

-- CreateIndex
CREATE INDEX "provider_group_created_at_idx" ON "provider_group"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "provider_uuid_key" ON "provider"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "provider_email_key" ON "provider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "provider_npi_key" ON "provider"("npi");

-- CreateIndex
CREATE UNIQUE INDEX "provider_user_id_key" ON "provider"("user_id");

-- CreateIndex
CREATE INDEX "provider_added_by_id_idx" ON "provider"("added_by_id");

-- CreateIndex
CREATE INDEX "provider_deleted_by_id_idx" ON "provider"("deleted_by_id");

-- CreateIndex
CREATE INDEX "provider_created_at_idx" ON "provider"("created_at");

-- CreateIndex
CREATE INDEX "provider_group_member_provider_id_idx" ON "provider_group_member"("provider_id");

-- CreateIndex
CREATE INDEX "provider_group_member_provider_group_id_idx" ON "provider_group_member"("provider_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_member_provider_id_provider_group_id_key" ON "provider_group_member"("provider_id", "provider_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "icd_code_uuid_key" ON "icd_code"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "icd_code_code_key" ON "icd_code"("code");

-- CreateIndex
CREATE INDEX "icd_code_description_idx" ON "icd_code"("description");

-- CreateIndex
CREATE INDEX "icd_code_status_idx" ON "icd_code"("status");

-- CreateIndex
CREATE INDEX "icd_code_condition_id_idx" ON "icd_code"("condition_id");

-- CreateIndex
CREATE INDEX "icd_code_created_at_idx" ON "icd_code"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cpt_code_uuid_key" ON "cpt_code"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "cpt_code_code_key" ON "cpt_code"("code");

-- CreateIndex
CREATE INDEX "cpt_code_description_idx" ON "cpt_code"("description");

-- CreateIndex
CREATE INDEX "cpt_code_category_idx" ON "cpt_code"("category");

-- CreateIndex
CREATE INDEX "cpt_code_status_idx" ON "cpt_code"("status");

-- CreateIndex
CREATE INDEX "cpt_code_created_at_idx" ON "cpt_code"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "condition_uuid_key" ON "condition"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "condition_title_key" ON "condition"("title");

-- CreateIndex
CREATE INDEX "condition_created_at_idx" ON "condition"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "condition_question_uuid_key" ON "condition_question"("uuid");

-- CreateIndex
CREATE INDEX "condition_question_condition_id_idx" ON "condition_question"("condition_id");

-- CreateIndex
CREATE INDEX "condition_question_created_at_idx" ON "condition_question"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "task_type_uuid_key" ON "task_type"("uuid");

-- CreateIndex
CREATE INDEX "task_type_provider_group_id_idx" ON "task_type"("provider_group_id");

-- CreateIndex
CREATE INDEX "task_type_created_by_id_idx" ON "task_type"("created_by_id");

-- CreateIndex
CREATE INDEX "task_type_created_at_idx" ON "task_type"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bulk_communication_template_uuid_key" ON "bulk_communication_template"("uuid");

-- CreateIndex
CREATE INDEX "bulk_communication_template_provider_group_id_idx" ON "bulk_communication_template"("provider_group_id");

-- CreateIndex
CREATE INDEX "bulk_communication_template_template_type_idx" ON "bulk_communication_template"("template_type");

-- CreateIndex
CREATE INDEX "bulk_communication_template_created_at_idx" ON "bulk_communication_template"("created_at");

-- CreateIndex
CREATE INDEX "bulk_communication_template_revision_template_id_idx" ON "bulk_communication_template_revision"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "consent_uuid_key" ON "consent"("uuid");

-- CreateIndex
CREATE INDEX "consent_program_idx" ON "consent"("program");

-- CreateIndex
CREATE INDEX "consent_created_at_idx" ON "consent"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "careplan_uuid_key" ON "careplan"("uuid");

-- CreateIndex
CREATE INDEX "careplan_title_idx" ON "careplan"("title");

-- CreateIndex
CREATE INDEX "careplan_creator_id_idx" ON "careplan"("creator_id");

-- CreateIndex
CREATE INDEX "careplan_provider_group_id_idx" ON "careplan"("provider_group_id");

-- CreateIndex
CREATE INDEX "careplan_copied_from_id_idx" ON "careplan"("copied_from_id");

-- CreateIndex
CREATE INDEX "careplan_created_at_idx" ON "careplan"("created_at");

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_member" ADD CONSTRAINT "provider_group_member_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_member" ADD CONSTRAINT "provider_group_member_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icd_code" ADD CONSTRAINT "icd_code_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "condition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_question" ADD CONSTRAINT "condition_question_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_type" ADD CONSTRAINT "task_type_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_type" ADD CONSTRAINT "task_type_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_communication_template" ADD CONSTRAINT "bulk_communication_template_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_communication_template_revision" ADD CONSTRAINT "bulk_communication_template_revision_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "bulk_communication_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent" ADD CONSTRAINT "consent_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent" ADD CONSTRAINT "consent_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careplan" ADD CONSTRAINT "careplan_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careplan" ADD CONSTRAINT "careplan_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careplan" ADD CONSTRAINT "careplan_copied_from_id_fkey" FOREIGN KEY ("copied_from_id") REFERENCES "careplan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
