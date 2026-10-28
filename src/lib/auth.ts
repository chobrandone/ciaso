import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from './db';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type SessionPayload } from './session';

export type Admin = { id: number; email: string; name: string; password_hash: string; last_login_at: string | null };

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  // Make sure the account still exists (e.g. it was removed by another admin)
  const exists = await queryOne('SELECT id FROM admins WHERE id = ?', [Number(session.sub)]);
  if (!exists) redirect('/admin/login');
  return session;
}

let dummyHash: string | undefined;

export async function verifyCredentials(email: string, password: string): Promise<Admin | null> {
  const admin = await queryOne<Admin>('SELECT * FROM admins WHERE email = ?', [email.trim()]);
  // Always run bcrypt so response time doesn't reveal whether the email exists
  dummyHash ??= await bcrypt.hash('not-a-real-password', 12);
  const ok = await bcrypt.compare(password, admin?.password_hash ?? dummyHash);
  return admin && ok ? admin : null;
}

export async function startSession(admin: Admin) {
  const token = await signSession({ sub: String(admin.id), email: admin.email, name: admin.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
  await execute("UPDATE admins SET last_login_at = datetime('now') WHERE id = ?", [admin.id]);
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);
