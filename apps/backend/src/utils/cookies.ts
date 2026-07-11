import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';

export const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE || isProduction,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
  maxAge: env.COOKIE_MAX_AGE,
});

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('accessToken', accessToken, getAuthCookieOptions());
  res.cookie('refreshToken', refreshToken, {
    ...getAuthCookieOptions(),
    maxAge: env.REFRESH_TOKEN_MAX_AGE,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', getAuthCookieOptions());
  res.clearCookie('refreshToken', getAuthCookieOptions());
};
