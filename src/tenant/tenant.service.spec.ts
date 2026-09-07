import { UnauthorizedException } from "@nestjs/common";
import { TenantService } from "./tenant.service";

describe("TenantService", () => {
  let findUnique: jest.Mock;
  let prisma: any;
  let service: TenantService;

  beforeEach(() => {
    findUnique = jest.fn();
    prisma = { unscoped: () => ({ tenant: { findUnique } }) };
    service = new TenantService(prisma);
  });

  it("returns an active tenant", async () => {
    findUnique.mockResolvedValue({ id: 1n, slug: "acme", is_active: true });

    await expect(service.findActiveBySlug("acme")).resolves.toMatchObject({
      slug: "acme",
    });
    expect(findUnique).toHaveBeenCalledWith({ where: { slug: "acme" } });
  });

  it("rejects an unknown slug without revealing it", async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.findActiveBySlug("nope")).rejects.toThrow(
      new UnauthorizedException("Invalid credentials"),
    );
  });

  it("rejects an inactive tenant", async () => {
    findUnique.mockResolvedValue({ id: 1n, slug: "acme", is_active: false });

    await expect(service.findActiveBySlug("acme")).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
