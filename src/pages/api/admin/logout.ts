import type { APIRoute } from 'astro';
import { logout, COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(COOKIE)?.value;
  logout(token);
  cookies.delete(COOKIE, { path: '/' });
  return redirect('/admin/login');
};
