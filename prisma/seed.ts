import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SEED = {
  providerGroup: {
    group_name: "Jason RTM Group",
    code: "JRG",
    timezone: "America/New_York",
  },
  provider: {
    email: "provider@jason-rtm.com",
    password: "Provider@123",
    first_name: "Jason",
    last_name: "Bates",
    role: "admin",
  },
};

/** Seeds one provider group and one admin provider to sign in with. */
async function seed() {
  const group = await prisma.providerGroup.upsert({
    where: { code: SEED.providerGroup.code },
    update: {},
    create: {
      ...SEED.providerGroup,
      email: SEED.provider.email,
      status: "active",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: SEED.provider.email },
    update: {},
    create: {
      email: SEED.provider.email,
      username: SEED.provider.email,
      passwordHash: await bcrypt.hash(SEED.provider.password, 10),
      firstName: SEED.provider.first_name,
      lastName: SEED.provider.last_name,
      isActive: true,
      isProvider: true,
      isTenantAdmin: true,
      isSuperTenantAdmin: true,
    },
  });

  const provider = await prisma.provider.upsert({
    where: { email: SEED.provider.email },
    update: {},
    create: {
      user_id: user.id,
      email: SEED.provider.email,
      first_name: SEED.provider.first_name,
      last_name: SEED.provider.last_name,
      display_name: `${SEED.provider.first_name} ${SEED.provider.last_name}`,
      role: SEED.provider.role,
      status: "active",
      language: "en",
      timezone: SEED.providerGroup.timezone,
      is_tenant_admin: true,
      is_tenant_provider: true,
    },
  });

  await prisma.providerGroupMember.upsert({
    where: {
      provider_id_provider_group_id: {
        provider_id: provider.id,
        provider_group_id: group.id,
      },
    },
    update: {},
    create: {
      provider_id: provider.id,
      provider_group_id: group.id,
    },
  });

  console.log(`Login with: ${SEED.provider.email} / ${SEED.provider.password}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
