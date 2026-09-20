import { defineMiddleware } from 'astro:middleware';
import { validate, COOKIE } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const p = url.pathname;

  const isAdminPage = p === '/admin' || p.startsWith('/admin/');
  const isAdminApi = p.startsWith('/api/admin/');
  const isLogin = p === '/admin/login' || p === '/api/admin/login';

  if ((isAdminPage || isAdminApi) && !isLogin) {
    const token = cookies.get(COOKIE)?.value;
    if (!validate(token)) {
      if (isAdminApi) return new Response('No autorizado', { status: 401 });
      return redirect('/admin/login');
    }
  }

  return next();
});
