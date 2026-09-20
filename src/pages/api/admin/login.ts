import type { APIRoute } from 'astro';
import { login, COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const username = String(form.get('username') || '').trim();
  const password = String(form.get('password') || '');

  const session = login(username, password);
  if (!session) {
    return redirect('/admin/login?err=' + encodeURIComponent('Usuario o contraseña incorrectos.'));
  }

  cookies.set(COOKIE, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    path: '/',
    maxAge: session.maxAge,
  });
  return redirect('/admin');
};
