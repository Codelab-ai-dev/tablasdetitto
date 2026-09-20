import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import db from './db';

export const COOKIE = 'session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/** Verifica credenciales; si son válidas crea una sesión y devuelve el token. */
export function login(username: string, password: string): { token: string; maxAge: number } | null {
  const row = db.prepare('SELECT password_hash FROM admin WHERE username = ?').get(username) as
    | { password_hash: string }
    | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + SESSION_MS;
  db.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').run(token, expires);
  return { token, maxAge: Math.floor(SESSION_MS / 1000) };
}

/** True si el token corresponde a una sesión vigente. */
export function validate(token: string | undefined): boolean {
  if (!token) return false;
  const row = db.prepare('SELECT expires_at FROM sessions WHERE token = ?').get(token) as
    | { expires_at: number }
    | undefined;
  if (!row) return false;
  if (row.expires_at < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return false;
  }
  return true;
}

export function logout(token: string | undefined): void {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}
