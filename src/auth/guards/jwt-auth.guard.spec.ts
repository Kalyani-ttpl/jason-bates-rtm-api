import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  const secret = "test-secret";
  const claims = {
    user_id: "user-uuid",
    id: 10,
    jti: "j",
    provider_id: 20,
    language: "en",
  };

  const access = (extra: object = {}) =>
    jwt.sign({ ...claims, token_type: "access", ...extra }, secret, {
      expiresIn: "1h",
    });

  const run = (request: { headers?: object; cookies?: object }) => {
    const req: any = { headers: {}, ...request };
    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    return { result: () => new JwtAuthGuard().canActivate(context), req };
  };

  beforeEach(() => {
    process.env.JWTSECRET = secret;
  });

  it("accepts the access_token cookie and sets the user", () => {
    const { result, req } = run({ cookies: { access_token: access() } });

    expect(result()).toBe(true);
    expect(req.user).toEqual({
      id: 10n,
      uuid: "user-uuid",
      email: null,
      providerId: 20n,
      language: "en",
    });
  });

  it("still accepts a Bearer header for Swagger and API tools", () => {
    const { result } = run({
      headers: { authorization: `Bearer ${access()}` },
    });

    expect(result()).toBe(true);
  });

  it("falls back to the cookie when the header token is stale", () => {
    const stale = jwt.sign({ ...claims, token_type: "access" }, secret, {
      expiresIn: -10,
    });

    const { result } = run({
      headers: { authorization: `Bearer ${stale}` },
      cookies: { access_token: access() },
    });

    expect(result()).toBe(true);
  });

  it("ignores a literal 'undefined' header token", () => {
    const { result } = run({
      headers: { authorization: "Bearer undefined" },
      cookies: { access_token: access() },
    });

    expect(result()).toBe(true);
  });

  it("rejects a request with no token", () => {
    expect(() => run({}).result()).toThrow("Missing authentication token");
  });

  it("rejects a refresh token used as an access token", () => {
    const refresh = jwt.sign({ ...claims, token_type: "refresh" }, secret);

    expect(() => run({ cookies: { access_token: refresh } }).result()).toThrow(
      "Invalid or expired token",
    );
  });

  it("rejects a token signed with another secret", () => {
    const forged = jwt.sign({ ...claims, token_type: "access" }, "other");

    expect(() => run({ cookies: { access_token: forged } }).result()).toThrow(
      UnauthorizedException,
    );
  });

  it("maps a missing provider to null", () => {
    const { result, req } = run({
      cookies: { access_token: access({ provider_id: null }) },
    });

    result();
    expect(req.user.providerId).toBeNull();
  });
});
