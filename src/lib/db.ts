import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import {
  tablas as seedTablas,
  galeria as seedGaleria,
  contacto as seedContacto,
  site as seedSite,
} from '../config';

// Directorio de datos persistente (volumen en Coolify). Por defecto ./data en local.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'app.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tablas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    porciones TEXT NOT NULL DEFAULT '',
    precio TEXT NOT NULL DEFAULT '',
    descripcion TEXT NOT NULL DEFAULT '',
    destacada INTEGER NOT NULL DEFAULT 0,
    orden INTEGER NOT NULL DEFAULT 0,
    imagen TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS galeria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  );
`);

migrate();
seed();

// Migraciones aditivas para bases de datos existentes.
function migrate() {
  const cols = db.prepare('PRAGMA table_info(tablas)').all() as { name: string }[];
  if (!cols.some((c) => c.name === 'imagen')) {
    db.exec("ALTER TABLE tablas ADD COLUMN imagen TEXT NOT NULL DEFAULT ''");
  }
}

function seed() {
  // Tablas y galería se siembran una sola vez; si el admin las vacía, no vuelven a aparecer.
  seedOnce('tablas', () => {
    const ins = db.prepare(
      'INSERT INTO tablas (nombre, porciones, precio, descripcion, destacada, orden) VALUES (?,?,?,?,?,?)'
    );
    seedTablas.forEach((t, i) =>
      ins.run(t.nombre, t.porciones, t.precio, t.descripcion, t.destacada ? 1 : 0, i)
    );
  });

  seedOnce('galeria', () => {
    const ins = db.prepare('INSERT INTO galeria (src, caption, orden) VALUES (?,?,?)');
    seedGaleria.forEach((g, i) => ins.run(g.src, g.caption, i));
  });

  // Settings (solo si faltan, para no pisar ediciones)
  setDefault('whatsapp', seedContacto.whatsapp);
  setDefault('instagram', seedContacto.instagram);
  setDefault('instagram_url', seedContacto.instagramUrl);
  setDefault('email', seedContacto.email);
  setDefault('zona', seedSite.zona);
  setDefault('hero_image', '/images/tabla-1.jpg');
  setDefault('nosotros_image', '/images/tabla-3.jpg');

  // Cuenta admin: la fuente de verdad son las variables de entorno.
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'changeme';
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('DELETE FROM admin').run();
  db.prepare('INSERT INTO admin (username, password_hash) VALUES (?,?)').run(username, hash);
}

// Inserta los datos iniciales de `table` si nunca se sembró. Una BD previa que ya tiene filas
// solo se marca como sembrada.
function seedOnce(table: 'tablas' | 'galeria', insert: () => void) {
  const flag = `seeded_${table}`;
  if (db.prepare('SELECT 1 FROM settings WHERE key = ?').get(flag)) return;
  const count = (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;
  if (count === 0) insert();
  setDefault(flag, '1');
}

function setDefault(key: string, value: string) {
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)').run(key, value);
}

export default db;
