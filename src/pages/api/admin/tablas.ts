import type { APIRoute } from 'astro';
import db from '../../../lib/db';

const back = (redirect: (url: string) => Response, msg: string, ok = true) =>
  redirect(`/admin/tablas?${ok ? 'ok' : 'err'}=${encodeURIComponent(msg)}`);

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('_action') || '');

  const nombre = String(form.get('nombre') || '').trim();
  const porciones = String(form.get('porciones') || '').trim();
  const precio = String(form.get('precio') || '').trim();
  const descripcion = String(form.get('descripcion') || '').trim();
  const destacada = form.get('destacada') === '1' ? 1 : 0;
  const orden = parseInt(String(form.get('orden') || '0'), 10) || 0;
  const id = parseInt(String(form.get('id') || '0'), 10) || 0;

  try {
    if (action === 'create') {
      if (!nombre) return back(redirect, 'El nombre es obligatorio.', false);
      db.prepare(
        'INSERT INTO tablas (nombre, porciones, precio, descripcion, destacada, orden) VALUES (?,?,?,?,?,?)'
      ).run(nombre, porciones, precio, descripcion, destacada, orden);
      return back(redirect, 'Tabla agregada.');
    }

    if (action === 'update') {
      if (!id) return back(redirect, 'Tabla no encontrada.', false);
      db.prepare(
        'UPDATE tablas SET nombre=?, porciones=?, precio=?, descripcion=?, destacada=?, orden=? WHERE id=?'
      ).run(nombre, porciones, precio, descripcion, destacada, orden, id);
      return back(redirect, 'Tabla actualizada.');
    }

    if (action === 'delete') {
      if (!id) return back(redirect, 'Tabla no encontrada.', false);
      db.prepare('DELETE FROM tablas WHERE id=?').run(id);
      return back(redirect, 'Tabla eliminada.');
    }

    return back(redirect, 'Acción no válida.', false);
  } catch (e) {
    return back(redirect, 'Error: ' + (e instanceof Error ? e.message : 'desconocido'), false);
  }
};
