import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOADS_DIR } from '../../lib/db';

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const GET: APIRoute = ({ params }) => {
  const file = params.file || '';
  if (file.includes('/') || file.includes('..')) {
    return new Response('Solicitud inválida', { status: 400 });
  }
  const full = path.join(UPLOADS_DIR, file);
  if (!fs.existsSync(full)) {
    return new Response('No encontrado', { status: 404 });
  }
  const ext = (file.split('.').pop() || '').toLowerCase();
  const body = fs.readFileSync(full);
  return new Response(body, {
    headers: {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=604800',
    },
  });
};
