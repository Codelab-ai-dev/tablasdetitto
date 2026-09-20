import db from './db';

export interface Tabla {
  id: number;
  nombre: string;
  porciones: string;
  precio: string;
  descripcion: string;
  destacada: number;
  orden: number;
}

export interface GaleriaItem {
  id: number;
  src: string;
  caption: string;
  orden: number;
}

export function getTablas(): Tabla[] {
  return db.prepare('SELECT * FROM tablas ORDER BY orden, id').all() as Tabla[];
}

export function getGaleria(): GaleriaItem[] {
  return db.prepare('SELECT * FROM galeria ORDER BY orden, id').all() as GaleriaItem[];
}

export function getSetting(key: string, fallback = ''): string {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  return row ? row.value : fallback;
}

export function setSetting(key: string, value: string): void {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value);
}

export function getContacto() {
  return {
    whatsapp: getSetting('whatsapp'),
    instagram: getSetting('instagram'),
    instagramUrl: getSetting('instagram_url'),
    email: getSetting('email'),
    zona: getSetting('zona'),
  };
}

// Enlace de WhatsApp con mensaje prellenado, usando el número actual de la BD.
export function waLink(mensaje: string): string {
  const numero = getSetting('whatsapp');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
