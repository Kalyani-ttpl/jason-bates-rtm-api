import { InternalServerErrorException } from "@nestjs/common";
import { TenantContextService } from "./tenant-context.service";

describe("TenantContextService", () => {
  let service: TenantContextService;

  beforeEach(() => {
    service = new TenantContextService();
  });

  it("returns undefined outside of a context", () => {
    expect(service.get()).toBeUndefined();
    expect(service.getTenantId()).toBeUndefined();
  });

  it("exposes the tenant inside run()", () => {
    service.run({ tenantId: 7n, tenantSlug: "acme" }, () => {
      expect(service.getTenantId()).toBe(7n);
      expect(service.get()?.tenantSlug).toBe("acme");
    });
  });

  it("clears the context once run() returns", () => {
    service.run({ tenantId: 7n }, () => undefined);
    expect(service.getTenantId()).toBeUndefined();
  });

  it("keeps the context across await boundaries", async () => {
    await service.run({ tenantId: 42n }, async () => {
      await Promise.resolve();
      expect(service.getTenantId()).toBe(42n);
    });
  });

  it("keeps concurrent contexts isolated", async () => {
    const observe = (tenantId: bigint) =>
      service.run({ tenantId }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return service.getTenantId();
      });

    await expect(Promise.all([observe(1n), observe(2n)])).resolves.toEqual([
      1n,
      2n,
    ]);
  });

  it("requireTenantId throws when no context is set", () => {
    expect(() => service.requireTenantId()).toThrow(
      InternalServerErrorException,
    );
  });

  it("requireTenantId returns the id inside a context", () => {
    service.run({ tenantId: 3n }, () => {
      expect(service.requireTenantId()).toBe(3n);
    });
  });
});
