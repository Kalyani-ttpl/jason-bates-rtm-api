import { CookieOptions, Response } from "express";

/**
 * Auth cookies, modelled on the Alvin (tfc_api_service) setup. The browser app
 * never touches the tokens: login and refresh set them as httpOnly cookies, the
 * guard reads them back, and logout clears them.
 *
 * `secure` + `sameSite: "none"` let the frontend on another origin send them
 * with `credentials: "include"`. Browsers treat http://localhost as a secure
 * context, so this also works in local development.
 */
const COOKIE_DEFAULTS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/** Token lifetimes. The JWTs are signed with these, so cookie and token expire together. */
export const ACCESS_TOKEN_EXPIRES_IN = "1h";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function setAccessTokenCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, {
    ...COOKIE_DEFAULTS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

/**
 * With `rememberMe` the refresh cookie persists for the token's lifetime and
 * survives a browser restart. Without it `maxAge` is left off, making it a
 * session cookie the browser drops when the last window closes.
 */
export function setRefreshTokenCookie(
  res: Response,
  token: string,
  rememberMe = false,
) {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...COOKIE_DEFAULTS,
    ...(rememberMe && { maxAge: REFRESH_TOKEN_MAX_AGE }),
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_DEFAULTS);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, COOKIE_DEFAULTS);
}
