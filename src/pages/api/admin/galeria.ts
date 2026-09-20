import type { APIRoute } from 'astro';
import db from '../../../lib/db';
import { setSetting } from '../../../lib/content';
import { saveUpload, deleteUpload } from '../../../lib/uploads';

const back = (redirect: (url: string) => Response, msg: string, ok = true) =>
  redirect(`/admin/galeria?${ok ? 'ok' : 'err'}=${encodeURIComponent(msg)}`);

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('_action') || '');

  try {
    if (action === 'upload') {
      const src = await saveUpload(form.get('file'));
      const caption = String(form.get('caption') || '').trim();
      const nextOrden =
        ((db.prepare('SELECT MAX(orden) AS m FROM galeria').get() as { m: number | null }).m ?? -1) + 1;
      db.prepare('INSERT INTO galeria (src, caption, orden) VALUES (?,?,?)').run(src, caption, nextOrden);
      return back(redirect, 'Foto subida.');
    }

    if (action === 'update') {
      const id = parseInt(String(form.get('id') || '0'), 10) || 0;
      if (!id) return back(redirect, 'Foto no encontrada.', false);
      const caption = String(form.get('caption') || '').trim();
      const orden = parseInt(String(form.get('orden') || '0'), 10) || 0;
      db.prepare('UPDATE galeria SET caption=?, orden=? WHERE id=?').run(caption, orden, id);
      return back(redirect, 'Foto actualizada.');
    }

    if (action === 'delete') {
      const id = parseInt(String(form.get('id') || '0'), 10) || 0;
      if (!id) return back(redirect, 'Foto no encontrada.', false);
      const row = db.prepare('SELECT src FROM galeria WHERE id=?').get(id) as { src: string } | undefined;
      db.prepare('DELETE FROM galeria WHERE id=?').run(id);
      if (row) deleteUpload(row.src);
      return back(redirect, 'Foto eliminada.');
    }

    if (action === 'section') {
      const which = String(form.get('which') || '');
      if (which !== 'hero' && which !== 'nosotros') return back(redirect, 'Sección no válida.', false);

      const file = form.get('file');
      let src = String(form.get('src') || '').trim();
      if (file instanceof File && file.size > 0) {
        src = await saveUpload(file);
      }
      if (!src) return back(redirect, 'Sin cambios: elige una imagen o sube una nueva.', false);

      setSetting(which === 'hero' ? 'hero_image' : 'nosotros_image', src);
      return back(redirect, 'Imagen de sección actualizada.');
    }

    return back(redirect, 'Acción no válida.', false);
  } catch (e) {
    return back(redirect, 'Error: ' + (e instanceof Error ? e.message : 'desconocido'), false);
  }
};
