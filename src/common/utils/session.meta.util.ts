import type { Request } from 'express';

export function getSessionMeta(req: Request) {
  return {
    ipAddress:
      req.ip ??
      req.socket.remoteAddress ??
      'unknown',

    userAgent:
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : 'unknown',
  };
}