import { BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { CreateProviderDto } from "./dto/providers.dto";
import { ProvidersService } from "./providers.service";

describe("ProvidersService", () => {
  let user: any;
  let provider: any;
  let providerGroupMember: any;
  let tx: any;
  let prisma: any;
  let service: ProvidersService;

  const payload = (
    overrides: Partial<CreateProviderDto> = {},
  ): CreateProviderDto => ({
    email: "jane.doe@jason-rtm.com",
    first_name: "Jane",
    last_name: "Doe",
    ...overrides,
  });

  beforeEach(() => {
    user = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 10n }),
    };
    provider = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 20n }),
    };
    providerGroupMember = {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    };
    tx = { user, provider, providerGroupMember };
    prisma = { ...tx, $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new ProvidersService(prisma);
  });

  it("returns the provider id, user id and Zenara's message", async () => {
    await expect(service.createProvider(payload())).resolves.toEqual({
      id: 20n,
      user_id: 10n,
      message: "Provider created successfully",
    });
  });

  it("creates the sign-in account flagged as a provider", async () => {
    await service.createProvider(payload());

    expect(user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "jane.doe@jason-rtm.com",
        firstName: "Jane",
        lastName: "Doe",
        isActive: true,
        isProvider: true,
        isPatient: false,
      }),
      select: { id: true },
    });
  });

  it("hashes a supplied password so the provider can sign in", async () => {
    await service.createProvider(payload({ password: "Provider@123" }));

    const hash = user.create.mock.calls[0][0].data.passwordHash as string;
    expect(hash).toEqual(expect.any(String));
    expect(hash).not.toBe("Provider@123");
    await expect(bcrypt.compare("Provider@123", hash)).resolves.toBe(true);
  });

  it("leaves the account without a password when none is supplied", async () => {
    await service.createProvider(payload());

    expect(user.create.mock.calls[0][0].data.passwordHash).toBeUndefined();
  });

  it("links the provider to the group ids from the body", async () => {
    await service.createProvider(payload({ provider_group: ["1", "2"] }), 9n);

    expect(providerGroupMember.createMany).toHaveBeenCalledWith({
      data: [
        { provider_id: 20n, provider_group_id: 1n },
        { provider_id: 20n, provider_group_id: 2n },
      ],
      skipDuplicates: true,
    });
  });

  it("falls back to the route's group when the body omits them", async () => {
    await service.createProvider(payload(), 9n);

    expect(providerGroupMember.createMany).toHaveBeenCalledWith({
      data: [{ provider_id: 20n, provider_group_id: 9n }],
      skipDuplicates: true,
    });
  });

  it("links the provider record to the created account", async () => {
    await service.createProvider(payload({ npi: "1234567890" }));

    expect(provider.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: 10n,
        is_deleted: false,
        email: "jane.doe@jason-rtm.com",
        npi: "1234567890",
      }),
      select: { id: true },
    });
  });

  it("rejects an email that is already taken", async () => {
    user.findFirst.mockResolvedValue({ id: 1n });

    await expect(service.createProvider(payload())).rejects.toThrow(
      BadRequestException,
    );
    expect(user.create).not.toHaveBeenCalled();
  });

  it("matches an existing email case-insensitively", async () => {
    await service.createProvider(payload());

    expect(user.findFirst).toHaveBeenCalledWith({
      where: {
        email: { contains: "jane.doe@jason-rtm.com", mode: "insensitive" },
      },
    });
  });

  it("rejects a duplicate NPI", async () => {
    provider.findFirst.mockResolvedValue({ id: 5n });

    await expect(
      service.createProvider(payload({ npi: "1234567890" })),
    ).rejects.toThrow(BadRequestException);
    expect(provider.create).not.toHaveBeenCalled();
  });

  it("skips the NPI check when no NPI is supplied", async () => {
    await service.createProvider(payload());

    expect(provider.findFirst).not.toHaveBeenCalled();
  });
});
