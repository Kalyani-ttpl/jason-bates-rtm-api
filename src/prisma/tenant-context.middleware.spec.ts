import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { TenantContextMiddleware } from "./tenant-context.middleware";
import { TenantContextService } from "./tenant-context.service";

describe("TenantContextMiddleware", () => {
  const secret = "test-secret";
  let tenantContext: TenantContextService;
  let middleware: TenantContextMiddleware;
  let seenTenantId: bigint | undefined;
  let next: NextFunction;

  const request = (headers: Record<string, string>) =>
    ({ headers }) as unknown as Request;
  const response = () => ({}) as Response;

  beforeEach(() => {
    process.env.JWTSECRET = secret;
    tenantContext = new TenantContextService();
    middleware = new TenantContextMiddleware(tenantContext);
    seenTenantId = undefined;
    next = jest.fn(() => {
      seenTenantId = tenantContext.getTenantId();
    });
  });

  it("sets the tenant from a valid access token", () => {
    const token = jwt.sign({ tenant_id: 12, tenant_slug: "acme" }, secret);

    middleware.use(
      request({ authorization: `Bearer ${token}` }),
      response(),
      next,
    );

    expect(next).toHaveBeenCalled();
    expect(seenTenantId).toBe(12n);
  });

  it("ignores a token signed with the wrong secret", () => {
    const token = jwt.sign({ tenant_id: 12 }, "another-secret");

    middleware.use(
      request({ authorization: `Bearer ${token}` }),
      response(),
      next,
    );

    expect(next).toHaveBeenCalled();
    expect(seenTenantId).toBeUndefined();
  });

  it("ignores an expired token", () => {
    const token = jwt.sign({ tenant_id: 12 }, secret, { expiresIn: "-1s" });

    middleware.use(
      request({ authorization: `Bearer ${token}` }),
      response(),
      next,
    );

    expect(seenTenantId).toBeUndefined();
  });

  it("falls back to the tenant header", () => {
    middleware.use(request({ "tenant-header": "5" }), response(), next);

    expect(seenTenantId).toBe(5n);
  });

  it("rejects a non-numeric tenant header", () => {
    middleware.use(request({ "tenant-header": "acme" }), response(), next);

    expect(seenTenantId).toBeUndefined();
  });

  it("continues without a context when no tenant is present", () => {
    middleware.use(request({}), response(), next);

    expect(next).toHaveBeenCalled();
    expect(seenTenantId).toBeUndefined();
  });
});
