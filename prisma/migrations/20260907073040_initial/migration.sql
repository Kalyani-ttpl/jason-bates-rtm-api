-- CreateTable
CREATE TABLE "tenant" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(3),
    "description" TEXT,
    "timezone" VARCHAR(255),
    "frontend_url" VARCHAR(255),
    "features" JSON,
    "feature_programs" JSON,
    "additional_features" JSON,
    "billing_mode" VARCHAR(255),
    "white_label" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_billing_enabled" BOOLEAN DEFAULT false,
    "is_sandbox_mode_on" BOOLEAN DEFAULT false,
    "is_trial_enabled" BOOLEAN DEFAULT false,
    "trial_period_start_at" TIMESTAMPTZ,
    "trial_period_end_at" TIMESTAMPTZ,
    "is_data_archieved" BOOLEAN DEFAULT false,
    "is_marked_for_deletion" BOOLEAN DEFAULT false,
    "marked_for_deletion_at" TIMESTAMPTZ,
    "disable_patient_emails" BOOLEAN DEFAULT false,
    "disable_patient_notifications" BOOLEAN DEFAULT false,
    "disable_patient_sms" BOOLEAN DEFAULT false,
    "disable_provider_emails" BOOLEAN DEFAULT false,
    "disable_provider_notifications" BOOLEAN DEFAULT false,
    "disable_provider_sms" BOOLEAN DEFAULT false,
    "communication_logo" TEXT,
    "consent_logo" TEXT,
    "report_logo" TEXT,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "tenant_id" BIGINT NOT NULL,
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
    "tenant_id" BIGINT NOT NULL,
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
    "tenant_id" BIGINT NOT NULL,
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
    "tenant_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "provider_id" BIGINT NOT NULL,
    "provider_group_id" BIGINT NOT NULL,

    CONSTRAINT "provider_group_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_uuid_key" ON "tenant"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_name_key" ON "tenant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_code_key" ON "tenant"("code");

-- CreateIndex
CREATE INDEX "tenant_slug_idx" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "tenant_code_idx" ON "tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_uuid_key" ON "user_account"("uuid");

-- CreateIndex
CREATE INDEX "user_account_tenant_id_idx" ON "user_account"("tenant_id");

-- CreateIndex
CREATE INDEX "user_account_email_idx" ON "user_account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_tenant_id_email_key" ON "user_account"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_tenant_id_username_key" ON "user_account"("tenant_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_uuid_key" ON "provider_group"("uuid");

-- CreateIndex
CREATE INDEX "provider_group_tenant_id_idx" ON "provider_group"("tenant_id");

-- CreateIndex
CREATE INDEX "provider_group_created_at_idx" ON "provider_group"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_tenant_id_group_npi_key" ON "provider_group"("tenant_id", "group_npi");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_tenant_id_code_key" ON "provider_group"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_tenant_id_system_email_key" ON "provider_group"("tenant_id", "system_email");

-- CreateIndex
CREATE UNIQUE INDEX "provider_uuid_key" ON "provider"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "provider_user_id_key" ON "provider"("user_id");

-- CreateIndex
CREATE INDEX "provider_tenant_id_idx" ON "provider"("tenant_id");

-- CreateIndex
CREATE INDEX "provider_email_idx" ON "provider"("email");

-- CreateIndex
CREATE INDEX "provider_npi_idx" ON "provider"("npi");

-- CreateIndex
CREATE INDEX "provider_added_by_id_idx" ON "provider"("added_by_id");

-- CreateIndex
CREATE INDEX "provider_deleted_by_id_idx" ON "provider"("deleted_by_id");

-- CreateIndex
CREATE INDEX "provider_created_at_idx" ON "provider"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "provider_tenant_id_email_key" ON "provider"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "provider_tenant_id_npi_key" ON "provider"("tenant_id", "npi");

-- CreateIndex
CREATE INDEX "provider_group_member_tenant_id_idx" ON "provider_group_member"("tenant_id");

-- CreateIndex
CREATE INDEX "provider_group_member_provider_id_idx" ON "provider_group_member"("provider_id");

-- CreateIndex
CREATE INDEX "provider_group_member_provider_group_id_idx" ON "provider_group_member"("provider_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_group_member_provider_id_provider_group_id_key" ON "provider_group_member"("provider_id", "provider_group_id");

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group" ADD CONSTRAINT "provider_group_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_member" ADD CONSTRAINT "provider_group_member_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_member" ADD CONSTRAINT "provider_group_member_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_member" ADD CONSTRAINT "provider_group_member_provider_group_id_fkey" FOREIGN KEY ("provider_group_id") REFERENCES "provider_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
