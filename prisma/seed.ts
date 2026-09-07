import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SEED = {
  tenant: {
    slug: "jason",
    name: "Jason RTM",
    code: "JSN",
    timezone: "America/New_York",
  },
  providerGroup: {
    group_name: "Jason RTM Group",
    code: "JRG",
  },
  provider: {
    email: "provider@jason-rtm.com",
    password: "Provider@123",
    first_name: "Jason",
    last_name: "Bates",
    role: "admin",
  },
};

const TENANT_TABLES = [
  "user_account",
  "provider_group",
  "provider",
  "provider_group_member",
];

/**
 * Enables row-level security and installs the tenant isolation policy on every
 * tenant-owned table. Prisma cannot express policies in schema.prisma, so the
 * DDL lives here. Add new tenant-owned tables to TENANT_TABLES.
 *
 * The policy compares tenant_id against the `app.tenant_id` runtime setting
 * that PrismaService sets per operation. current_setting(..., true) yields NULL
 * when unset, so a query with no tenant context matches no rows.
 */
async function applyRowLevelSecurity() {
  for (const table of TENANT_TABLES) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`,
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`,
    );
    await prisma.$executeRawUnsafe(
      `DROP POLICY IF EXISTS tenant_isolation ON "${table}"`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE POLICY tenant_isolation ON "${table}"
         USING      (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint)
         WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint)`,
    );
  }
  console.log(`Row-level security applied to ${TENANT_TABLES.length} tables.`);
}

/** Seeds the first tenant with one provider group and one admin provider. */
async function seedTenant() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: SEED.tenant.slug },
    update: {},
    create: { ...SEED.tenant, is_active: true, features: {} },
  });

  // The remaining tables carry RLS policies, so everything below runs inside one
  // transaction with app.tenant_id set.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${String(tenant.id)}, TRUE)`;

    const group = await tx.provider_group.upsert({
      where: {
        tenant_id_code: {
          tenant_id: tenant.id,
          code: SEED.providerGroup.code,
        },
      },
      update: {},
      create: {
        ...SEED.providerGroup,
        tenant_id: tenant.id,
        email: SEED.provider.email,
        status: "active",
        timezone: tenant.timezone,
      },
    });

    const user = await tx.user_account.upsert({
      where: {
        tenant_id_email: { tenant_id: tenant.id, email: SEED.provider.email },
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        email: SEED.provider.email,
        username: SEED.provider.email,
        password: await bcrypt.hash(SEED.provider.password, 10),
        first_name: SEED.provider.first_name,
        last_name: SEED.provider.last_name,
        is_active: true,
        is_provider: true,
        is_tenant_admin: true,
        is_super_tenant_admin: true,
      },
    });

    const provider = await tx.provider.upsert({
      where: {
        tenant_id_email: { tenant_id: tenant.id, email: SEED.provider.email },
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        user_id: user.id,
        email: SEED.provider.email,
        first_name: SEED.provider.first_name,
        last_name: SEED.provider.last_name,
        display_name: `${SEED.provider.first_name} ${SEED.provider.last_name}`,
        role: SEED.provider.role,
        status: "active",
        language: "en",
        timezone: tenant.timezone,
        is_tenant_admin: true,
        is_tenant_provider: true,
      },
    });

    await tx.provider_group_member.upsert({
      where: {
        provider_id_provider_group_id: {
          provider_id: provider.id,
          provider_group_id: group.id,
        },
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        provider_id: provider.id,
        provider_group_id: group.id,
      },
    });

    console.log(`Tenant "${tenant.slug}" seeded.`);
    console.log(
      `Login with: ${SEED.provider.email} / ${SEED.provider.password} / tenant "${tenant.slug}"`,
    );
  });
}

async function main() {
  await applyRowLevelSecurity();
  await seedTenant();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
