// Session token helpers. Edge-safe (used by middleware), so no Node-only imports here.
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'ciaso_admin';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type SessionPayload = { sub: string; email: string; name: string };

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET must be set (32+ characters) in production.');
    return new TextEncoder().encode('dev-only-insecure-secret-change-me-please-0000');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    return { sub: String(payload.sub), email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}
