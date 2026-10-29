import type { APIRoute } from 'astro';
import db from '../../../lib/db';
import { saveUpload, deleteUpload } from '../../../lib/uploads';

const back = (redirect: (url: string) => Response, msg: string, ok = true) =>
  redirect(`/admin/tablas?${ok ? 'ok' : 'err'}=${encodeURIComponent(msg)}`);

const hasFile = (f: unknown): f is File => f instanceof File && f.size > 0;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  // El botón pulsado va después del input oculto en el formulario, así que manda el último valor.
  const action = String(form.getAll('_action').pop() || '');

  const nombre = String(form.get('nombre') || '').trim();
  const porciones = String(form.get('porciones') || '').trim();
  const precio = String(form.get('precio') || '').trim();
  const descripcion = String(form.get('descripcion') || '').trim();
  const destacada = form.get('destacada') === '1' ? 1 : 0;
  const orden = parseInt(String(form.get('orden') || '0'), 10) || 0;
  const id = parseInt(String(form.get('id') || '0'), 10) || 0;
  const file = form.get('imagen');
  const quitarImagen = form.get('quitar_imagen') === '1';

  try {
    if (action === 'create') {
      if (!nombre) return back(redirect, 'El nombre es obligatorio.', false);
      const imagen = hasFile(file) ? await saveUpload(file) : '';
      db.prepare(
        'INSERT INTO tablas (nombre, porciones, precio, descripcion, destacada, orden, imagen) VALUES (?,?,?,?,?,?,?)'
      ).run(nombre, porciones, precio, descripcion, destacada, orden, imagen);
      return back(redirect, 'Tabla agregada.');
    }

    if (action === 'update') {
      if (!id) return back(redirect, 'Tabla no encontrada.', false);
      const row = db.prepare('SELECT imagen FROM tablas WHERE id=?').get(id) as
        | { imagen: string }
        | undefined;
      if (!row) return back(redirect, 'Tabla no encontrada.', false);

      let imagen = row.imagen;
      if (hasFile(file)) imagen = await saveUpload(file);
      else if (quitarImagen) imagen = '';

      db.prepare(
        'UPDATE tablas SET nombre=?, porciones=?, precio=?, descripcion=?, destacada=?, orden=?, imagen=? WHERE id=?'
      ).run(nombre, porciones, precio, descripcion, destacada, orden, imagen, id);
      if (imagen !== row.imagen) deleteUpload(row.imagen);
      return back(redirect, 'Tabla actualizada.');
    }

    if (action === 'delete') {
      if (!id) return back(redirect, 'Tabla no encontrada.', false);
      const row = db.prepare('SELECT imagen FROM tablas WHERE id=?').get(id) as
        | { imagen: string }
        | undefined;
      db.prepare('DELETE FROM tablas WHERE id=?').run(id);
      if (row) deleteUpload(row.imagen);
      return back(redirect, 'Tabla eliminada.');
    }

    return back(redirect, 'Acción no válida.', false);
  } catch (e) {
    return back(redirect, 'Error: ' + (e instanceof Error ? e.message : 'desconocido'), false);
  }
};
