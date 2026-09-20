import type { APIRoute } from 'astro';
import { setSetting } from '../../../lib/content';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  const whatsapp = String(form.get('whatsapp') || '').replace(/[^0-9]/g, '');
  const instagram = String(form.get('instagram') || '').trim().replace(/^@/, '');
  const instagramUrl = String(form.get('instagram_url') || '').trim();
  const email = String(form.get('email') || '').trim();
  const zona = String(form.get('zona') || '').trim();

  try {
    setSetting('whatsapp', whatsapp);
    setSetting('instagram', instagram);
    setSetting('instagram_url', instagramUrl);
    setSetting('email', email);
    setSetting('zona', zona);
    return redirect('/admin/contacto?ok=' + encodeURIComponent('Datos de contacto guardados.'));
  } catch (e) {
    return redirect(
      '/admin/contacto?err=' + encodeURIComponent('Error: ' + (e instanceof Error ? e.message : 'desconocido'))
    );
  }
};
