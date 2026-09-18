import { AuthController } from "./auth.controller";

describe("AuthController cookies", () => {
  let authService: any;
  let res: any;
  let controller: AuthController;

  beforeEach(() => {
    authService = {
      login: jest.fn().mockResolvedValue({ access: "a1", refresh: "r1" }),
      refreshToken: jest
        .fn()
        .mockResolvedValue({ access: "a2", refresh: "r2", remember_me: true }),
    };
    res = { cookie: jest.fn(), clearCookie: jest.fn() };
    controller = new AuthController(authService);
  });

  const cookie = (name: string) =>
    res.cookie.mock.calls.find((call: any[]) => call[0] === name);

  it("sets both cookies on login as httpOnly, secure, SameSite=None", async () => {
    await controller.login({ email: "e", password: "p" }, res);

    expect(cookie("access_token")).toEqual([
      "access_token",
      "a1",
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 1000,
      },
    ]);
    expect(cookie("refresh_token")[1]).toBe("r1");
  });

  it("makes the refresh cookie a session cookie unless remember_me is set", async () => {
    await controller.login({ email: "e", password: "p" }, res);
    expect(cookie("refresh_token")[2]).not.toHaveProperty("maxAge");

    res.cookie.mockClear();
    await controller.login(
      { email: "e", password: "p", remember_me: true },
      res,
    );
    expect(cookie("refresh_token")[2].maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("still returns the tokens in the body", async () => {
    await expect(
      controller.login({ email: "e", password: "p" }, res),
    ).resolves.toMatchObject({ access: "a1", refresh: "r1" });
  });

  it("refreshes from the cookie, preferring it over the body", async () => {
    await controller.refreshToken(
      { cookies: { refresh_token: "from-cookie" } } as any,
      { refresh: "from-body" },
      res,
    );

    expect(authService.refreshToken).toHaveBeenCalledWith("from-cookie");
    expect(cookie("access_token")[1]).toBe("a2");
    expect(cookie("refresh_token")[1]).toBe("r2");
    expect(cookie("refresh_token")[2].maxAge).toBeDefined();
  });

  it("falls back to the body when there is no cookie", async () => {
    await controller.refreshToken(
      { cookies: {} } as any,
      { refresh: "from-body" },
      res,
    );

    expect(authService.refreshToken).toHaveBeenCalledWith("from-body");
  });

  it("clears both cookies on logout with matching options", () => {
    expect(controller.logout(res)).toEqual({
      detail: "Successfully logged out.",
    });
    expect(res.clearCookie.mock.calls.map((call: any[]) => call[0])).toEqual([
      "access_token",
      "refresh_token",
    ]);
    expect(res.clearCookie.mock.calls[0][1]).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  });
});
