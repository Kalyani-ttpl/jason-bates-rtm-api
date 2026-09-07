import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "../common/constants";
import { TenantContextService } from "../prisma/tenant-context.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const secret = "test-secret";
  const tenant = {
    id: 3n,
    uuid: "tenant-uuid",
    slug: "acme",
    name: "Acme",
    timezone: "America/New_York",
    features: {},
    is_active: true,
  };

  let client: any;
  let prisma: any;
  let tenantService: any;
  let tenantContext: TenantContextService;
  let jwtService: JwtService;
  let service: AuthService;

  const activeUser = async () => ({
    id: 10n,
    uuid: "user-uuid",
    email: "provider@acme.com",
    password: await bcrypt.hash("Provider@123", 4),
    first_name: "Jason",
    last_name: "Bates",
    picture: null,
    is_active: true,
    is_provider: true,
    is_tenant_admin: true,
    is_super_tenant_admin: false,
  });

  const login = () => ({
    email: "provider@acme.com",
    password: "Provider@123",
    tenant: "acme",
  });

  beforeEach(() => {
    process.env.JWTSECRET = secret;

    client = {
      user_account: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      provider: { findFirst: jest.fn(), findUnique: jest.fn() },
      provider_group_member: { findMany: jest.fn().mockResolvedValue([]) },
    };
    prisma = { client, unscoped: jest.fn() };
    tenantService = { findActiveBySlug: jest.fn().mockResolvedValue(tenant) };
    tenantContext = new TenantContextService();
    jwtService = new JwtService({ secret });

    service = new AuthService(prisma, jwtService, tenantService, tenantContext);
  });

  describe("login", () => {
    it("returns tokens, provider and groups for valid credentials", async () => {
      client.user_account.findFirst.mockResolvedValue(await activeUser());
      client.provider.findFirst.mockResolvedValue({ id: 20n, language: "en" });
      client.provider_group_member.findMany.mockResolvedValue([
        { provider_group: { id: 30n, group_name: "Acme Group" } },
      ]);

      const result = await service.login(login());

      expect(result.access).toEqual(expect.any(String));
      expect(result.refresh).toEqual(expect.any(String));
      expect(result.provider_groups).toEqual([
        { id: 30n, group_name: "Acme Group" },
      ]);
      expect(result.tenant.slug).toBe("acme");
    });

    it("binds the access token to the tenant and provider", async () => {
      client.user_account.findFirst.mockResolvedValue(await activeUser());
      client.provider.findFirst.mockResolvedValue({ id: 20n, language: "es" });

      const { access } = await service.login(login());
      const payload = jwtService.verify<JwtPayload>(access, { secret });

      expect(payload.tenant_id).toBe(3);
      expect(payload.tenant_slug).toBe("acme");
      expect(payload.provider_id).toBe(20);
      expect(payload.language).toBe("es");
      expect(payload.token_type).toBe("access");
      expect(payload.admin.isTenantAdmin).toBe(true);
    });

    it("queries the user inside the tenant context", async () => {
      client.user_account.findFirst.mockImplementation(async () => {
        expect(tenantContext.getTenantId()).toBe(3n);
        return activeUser();
      });
      client.provider.findFirst.mockResolvedValue(null);

      await service.login(login());

      expect(client.user_account.findFirst).toHaveBeenCalled();
    });

    it("rejects an unknown email", async () => {
      client.user_account.findFirst.mockResolvedValue(null);

      await expect(service.login(login())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects a wrong password", async () => {
      client.user_account.findFirst.mockResolvedValue(await activeUser());

      await expect(
        service.login({ ...login(), password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("rejects a disabled account", async () => {
      client.user_account.findFirst.mockResolvedValue({
        ...(await activeUser()),
        is_active: false,
      });

      await expect(service.login(login())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("logs in a user that has no provider record", async () => {
      client.user_account.findFirst.mockResolvedValue(await activeUser());
      client.provider.findFirst.mockResolvedValue(null);

      const result = await service.login(login());

      expect(result.provider).toBeNull();
      expect(result.provider_groups).toEqual([]);
      expect(client.provider_group_member.findMany).not.toHaveBeenCalled();
    });

    it("records the login timestamp", async () => {
      client.user_account.findFirst.mockResolvedValue(await activeUser());
      client.provider.findFirst.mockResolvedValue(null);

      await service.login(login());

      expect(client.user_account.update).toHaveBeenCalledWith({
        where: { id: 10n },
        data: { last_login: expect.any(Date) },
      });
    });

    it("propagates an inactive tenant rejection", async () => {
      tenantService.findActiveBySlug.mockRejectedValue(
        new UnauthorizedException("inactive"),
      );

      await expect(service.login(login())).rejects.toThrow(
        UnauthorizedException,
      );
      expect(client.user_account.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    it("issues a new access token from a refresh token", async () => {
      client.user_account.findFirst.mockResolvedValue(await activeUser());
      client.provider.findFirst.mockResolvedValue({ id: 20n, language: "en" });
      const { refresh } = await service.login(login());

      const { access } = await service.refreshToken({ refresh });
      const payload = jwtService.verify<JwtPayload>(access, { secret });

      expect(payload.token_type).toBe("access");
      expect(payload.tenant_id).toBe(3);
      expect(payload.provider_id).toBe(20);
    });

    it("rejects an access token", async () => {
      client.user_account.findFirst.mockResolvedValue(await activeUser());
      client.provider.findFirst.mockResolvedValue(null);
      const { access } = await service.login(login());

      await expect(service.refreshToken({ refresh: access })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects a token signed with another secret", async () => {
      const forged = new JwtService({ secret: "other" }).sign({
        token_type: "refresh",
        tenant_id: 3,
      });

      await expect(service.refreshToken({ refresh: forged })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
