# Diseño — Panel de administración `/admin`

**Fecha:** 2026-09-20
**Proyecto:** Las Tablas de Titto (landing Astro)
**Objetivo:** Permitir al dueño iniciar sesión y editar el contenido de la página
(menú de tablas, imágenes/galería y datos de contacto) con cambios visibles al instante.

---

## 1. Alcance

**Editable desde el admin:**
- **Tablas (menú):** agregar, editar, eliminar; campos: nombre, porciones, precio,
  descripción, "destacada" (bool), orden.
- **Galería:** subir, reemplazar, eliminar imágenes; editar `caption` y orden.
- **Imágenes de secciones:** elegir la foto del **hero** y de **nosotros**.
- **Contacto:** WhatsApp, Instagram (handle + URL), correo, zona de servicio.

**Fuera de alcance (por ahora):**
- Editar los textos/titulares de las secciones (hero, nosotros, eventos) — siguen en código.
- Múltiples usuarios / roles. Solo una cuenta de dueño.
- Historial de versiones / borradores. Los cambios son directos a producción.

---

## 2. Arquitectura

Un solo contenedor en Coolify.

- **Astro en modo SSR** con adaptador `@astrojs/node` (standalone). La landing pública
  lee el contenido desde la BD en cada request → cambios instantáneos.
- **Base de datos: SQLite** vía `better-sqlite3`. Archivo único en un volumen persistente.
- **Contraseñas:** hash con `bcryptjs` (JS puro, sin módulos nativos).
- **Imágenes subidas:** guardadas en el volumen `/app/data/uploads`, servidas por una
  ruta SSR `GET /media/[archivo]`.

### Estructura de carpetas (nueva)
```
src/
├── lib/
│   ├── db.ts          # conexión SQLite + migraciones + seed
│   ├── content.ts     # lectura de tablas/galería/contacto para la web pública
│   ├── auth.ts        # hash, verificación, sesiones, guard
│   └── uploads.ts     # guardar/borrar archivos, validación
├── middleware.ts      # protege /admin/* y /api/admin/* (redirige a login)
├── pages/
│   ├── admin/
│   │   ├── index.astro       # dashboard
│   │   ├── login.astro       # formulario login
│   │   ├── tablas.astro      # gestión de tablas
│   │   ├── galeria.astro     # gestión de galería + imágenes de sección
│   │   └── contacto.astro    # datos de contacto
│   ├── api/admin/            # endpoints de escritura (POST)
│   │   ├── login.ts, logout.ts
│   │   ├── tablas/[...].ts
│   │   ├── galeria/[...].ts
│   │   └── contacto.ts
│   └── media/[file].ts       # sirve imágenes subidas desde el volumen
```

### Persistencia (volúmenes en Coolify)
- `/app/data` → contiene `app.db` (SQLite) y `uploads/` (imágenes). Un solo volumen
  cubre ambos para simplificar.

---

## 3. Modelo de datos (SQLite)

```sql
tablas(
  id INTEGER PK, nombre TEXT, porciones TEXT, precio TEXT,
  descripcion TEXT, destacada INTEGER DEFAULT 0, orden INTEGER
)

galeria(
  id INTEGER PK, src TEXT, caption TEXT, orden INTEGER
)  -- src puede ser "/images/..." (semilla) o "/media/..." (subida)

settings(
  key TEXT PK, value TEXT
)  -- keys: whatsapp, instagram, instagram_url, email, zona,
   --       hero_image, nosotros_image

admin(
  id INTEGER PK, username TEXT UNIQUE, password_hash TEXT
)

sessions(
  token TEXT PK, expires_at INTEGER
)
```

### Siembra inicial (idempotente)
Al arrancar, si las tablas están vacías, se siembran con los valores actuales de
`config.ts` (3 tablas, 3 fotos de galería, contacto, hero=`/images/tabla-1.jpg`,
nosotros=`/images/tabla-3.jpg`). La cuenta admin se crea/actualiza desde
`ADMIN_USER` / `ADMIN_PASSWORD` en cada arranque. Resultado: la página se ve idéntica
a la actual, pero ya editable. Las imágenes semilla (`/images/*` y `/logo.png`) siguen
como estáticas en `public/`; las nuevas subidas van a `/media/*`.

---

## 4. Autenticación

- **Login:** `POST /api/admin/login` con usuario+contraseña. Verifica con bcrypt contra
  la fila `admin`. Si es válido, crea una fila en `sessions` (token aleatorio de 32 bytes,
  expira en 7 días) y setea cookie `session` **HttpOnly, Secure, SameSite=Lax**.
- **Guard (middleware):** cualquier ruta bajo `/admin` (excepto `/admin/login`) y
  `/api/admin` (excepto `login`) exige sesión válida; si no, redirige a `/admin/login`.
- **Logout:** borra la fila de `sessions` y limpia la cookie.
- **Credenciales:** `ADMIN_USER`, `ADMIN_PASSWORD` (texto plano solo como env var; se
  hashea al sembrar). `SESSION_SECRET` no es imprescindible con sesiones en BD, pero se
  reserva por si se firma la cookie. Cambiar contraseña = cambiar la env var y redeploy.

---

## 5. Subida de imágenes

- Formulario `multipart/form-data`. En SSR: `await request.formData()` → `File`.
- **Validación:** tipos permitidos `image/jpeg|png|webp`; tamaño máx. **5 MB**.
- Nombre generado: `<uuid>.<ext>` (evita colisiones y nombres inseguros).
- Guardar en `/app/data/uploads/`. Registrar `src = "/media/<uuid>.<ext>"` en BD.
- **Eliminar:** borra la fila y el archivo del disco (si es `/media/*`; las `/images/*`
  semilla no se borran del disco, solo dejan de referenciarse).
- `GET /media/[file]`: valida que el nombre no tenga `..`/`/`, lee del volumen y responde
  con el `Content-Type` correcto y cache larga.

---

## 6. Web pública (cambios)

Los componentes dejan de importar `config.ts` y leen desde `src/lib/content.ts`:
- `Catalogo.astro` → `getTablas()`
- `Galeria.astro` → `getGaleria()`
- `Header.astro`, `Hero.astro`, `Nosotros.astro`, `Footer.astro`, `WhatsappFab.astro`,
  `Eventos.astro` → `getContacto()` / `getSetting('hero_image')` / `getSetting('nosotros_image')`.

`config.ts` se conserva como **valores semilla por defecto** (fuente única para la siembra).

---

## 7. Despliegue (Coolify)

El `Dockerfile` cambia de nginx-estático a **Node**:
- Etapa build: `npm ci && npm run build` (genera `dist/` con servidor SSR).
- Etapa runtime: `node:20-slim`, copia `dist/` + `node_modules`, `CMD node ./dist/server/entry.mjs`.
  (Se usa `node:20-slim`, no Alpine, por compatibilidad de `better-sqlite3`.)
- `EXPOSE 4321`; `HOST=0.0.0.0`.

**Pasos manuales en Coolify (se documentan al entregar):**
1. Puerto expuesto: `4321`.
2. Volumen persistente: montar `/app/data`.
3. Variables de entorno: `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `HOST=0.0.0.0`.
4. Redeploy.

**Riesgo conocido:** si el volumen no se monta, la BD y las imágenes subidas se pierden
en cada redeploy. Se documenta de forma prominente.

---

## 8. Estilo del admin

Interfaz funcional y clara, con la paleta de marca (fondo oscuro, dorado, vino) pero
priorizando usabilidad sobre espectacularidad: formularios legibles, botones grandes,
confirmación antes de eliminar, mensajes de éxito/error. Mobile-friendly.

---

## 9. Pruebas / verificación

- Build de Astro sin errores.
- Flujo E2E local: login → crear/editar/eliminar tabla → subir/eliminar imagen →
  cambiar contacto → ver reflejado en la home → logout → confirmar que `/admin` sin
  sesión redirige a login.
- Verificar que un reinicio del proceso conserva los datos (persistencia).
