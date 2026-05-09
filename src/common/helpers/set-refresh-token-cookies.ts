import type { Response } from "express";

export function setRefreshTokenCookies(res: Response, refreshToken: string | undefined) {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
}