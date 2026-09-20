import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { UPLOADS_DIR } from './db';

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Guarda un File subido y devuelve su ruta pública (/media/<archivo>). */
export async function saveUpload(file: unknown): Promise<string> {
  if (!file || typeof file === 'string' || !(file instanceof File) || file.size === 0) {
    throw new Error('No se recibió ninguna imagen.');
  }
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error('Formato no permitido. Usa JPG, PNG o WebP.');
  if (file.size > MAX_BYTES) throw new Error('La imagen supera el máximo de 5 MB.');

  const name = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buffer);
  return `/media/${name}`;
}

/** Borra del disco una imagen subida (solo si es /media/*; ignora las estáticas). */
export function deleteUpload(src: string | undefined): void {
  if (!src || !src.startsWith('/media/')) return;
  const name = src.slice('/media/'.length);
  if (name.includes('/') || name.includes('..')) return;
  const file = path.join(UPLOADS_DIR, name);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
