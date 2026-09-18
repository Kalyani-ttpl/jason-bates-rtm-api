import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "../common/constants";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const secret = "test-secret";

  let prisma: any;
  let jwtService: JwtService;
  let service: AuthService;

  const activeUser = async () => ({
    id: 10n,
    uuid: "user-uuid",
    email: "provider@acme.com",
    passwordHash: await bcrypt.hash("Provider@123", 4),
    firstName: "Jason",
    lastName: "Bates",
    picture: null,
    isActive: true,
    isProvider: true,
  });

  const login = () => ({
    email: "provider@acme.com",
    password: "Provider@123",
  });

  beforeEach(() => {
    process.env.JWTSECRET = secret;

    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      provider: { findFirst: jest.fn(), findUnique: jest.fn() },
      providerGroupMember: { findMany: jest.fn().mockResolvedValue([]) },
    };
    jwtService = new JwtService({ secret });

    service = new AuthService(prisma, jwtService);
  });

  describe("login", () => {
    it("returns tokens, provider and groups for valid credentials", async () => {
      prisma.user.findFirst.mockResolvedValue(await activeUser());
      prisma.provider.findFirst.mockResolvedValue({ id: 20n, language: "en" });
      prisma.providerGroupMember.findMany.mockResolvedValue([
        { provider_group: { id: 30n, group_name: "Acme Group" } },
      ]);

      const result = await service.login(login());

      expect(result.access).toEqual(expect.any(String));
      expect(result.refresh).toEqual(expect.any(String));
      expect(result.provider_groups).toEqual([
        { id: 30n, group_name: "Acme Group" },
      ]);
      expect(result.user.email).toBe("provider@acme.com");
    });

    it("binds the access token to the provider", async () => {
      prisma.user.findFirst.mockResolvedValue(await activeUser());
      prisma.provider.findFirst.mockResolvedValue({ id: 20n, language: "es" });

      const { access } = await service.login(login());
      const payload = jwtService.verify<JwtPayload>(access, { secret });

      expect(payload.provider_id).toBe(20);
      expect(payload.language).toBe("es");
      expect(payload.token_type).toBe("access");
    });

    it("rejects an unknown email", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(login())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects a wrong password", async () => {
      prisma.user.findFirst.mockResolvedValue(await activeUser());

      await expect(
        service.login({ ...login(), password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("rejects a disabled account", async () => {
      prisma.user.findFirst.mockResolvedValue({
        ...(await activeUser()),
        isActive: false,
      });

      await expect(service.login(login())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("logs in a user that has no provider record", async () => {
      prisma.user.findFirst.mockResolvedValue(await activeUser());
      prisma.provider.findFirst.mockResolvedValue(null);

      const result = await service.login(login());

      expect(result.provider).toBeNull();
      expect(result.provider_groups).toEqual([]);
      expect(prisma.providerGroupMember.findMany).not.toHaveBeenCalled();
    });

    it("records the login timestamp", async () => {
      prisma.user.findFirst.mockResolvedValue(await activeUser());
      prisma.provider.findFirst.mockResolvedValue(null);

      await service.login(login());

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 10n },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it("looks up the user by email, skipping deleted accounts", async () => {
      prisma.user.findFirst.mockResolvedValue(await activeUser());
      prisma.provider.findFirst.mockResolvedValue(null);

      await service.login(login());

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: "provider@acme.com", isDeleted: false },
      });
    });
  });

  describe("refreshToken", () => {
    const loggedIn = async (remember_me?: boolean) => {
      prisma.user.findFirst.mockResolvedValue(await activeUser());
      prisma.provider.findFirst.mockResolvedValue({ id: 20n, language: "en" });
      return service.login({ ...login(), remember_me });
    };

    it("issues a new access token from a refresh token", async () => {
      const { refresh } = await loggedIn();

      const { access } = await service.refreshToken(refresh);
      const payload = jwtService.verify<JwtPayload>(access, { secret });

      expect(payload.token_type).toBe("access");
      expect(payload.provider_id).toBe(20);
      expect(payload).not.toHaveProperty("remember_me");
    });

    it("rotates the refresh token", async () => {
      const { refresh } = await loggedIn();

      const result = await service.refreshToken(refresh);
      const payload = jwtService.verify<JwtPayload>(result.refresh, { secret });

      expect(result.refresh).not.toBe(refresh);
      expect(payload.token_type).toBe("refresh");
      expect(payload.provider_id).toBe(20);
    });

    it("carries remember_me through rotation", async () => {
      const remembered = await service.refreshToken(
        (await loggedIn(true)).refresh,
      );
      const forgotten = await service.refreshToken((await loggedIn()).refresh);

      expect(remembered.remember_me).toBe(true);
      expect(forgotten.remember_me).toBe(false);
      expect(
        jwtService.verify<JwtPayload>(remembered.refresh, { secret })
          .remember_me,
      ).toBe(true);
    });

    it("rejects a missing token", async () => {
      await expect(service.refreshToken(undefined)).rejects.toThrow(
        "Missing refresh token",
      );
    });

    it("rejects an access token", async () => {
      const { access } = await loggedIn();

      await expect(service.refreshToken(access)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects a token signed with another secret", async () => {
      const forged = new JwtService({ secret: "other" }).sign({
        token_type: "refresh",
      });

      await expect(service.refreshToken(forged)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
