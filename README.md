# Las Tablas de Titto — Landing + Admin

Landing page de charcutería artesanal con **panel de administración**.
**Astro (SSR) + Tailwind CSS + SQLite**, mobile-first.

## 🚀 Cómo correrla en local

```bash
cd las-tablas-de-titto
npm install
# credenciales del admin para local (elige las tuyas):
ADMIN_USER=titto ADMIN_PASSWORD=secret123 npm run dev
# http://localhost:4321   → sitio público
# http://localhost:4321/admin → panel
```

Build de producción:

```bash
npm run build              # compila el servidor SSR en dist/
npm run serve              # corre el servidor: node ./dist/server/entry.mjs
```

Los datos (BD SQLite + imágenes subidas) se guardan en `./data/` en local
(`DATA_DIR` para cambiar la ruta).

## 🔐 Panel de administración `/admin`

Inicia sesión con `ADMIN_USER` / `ADMIN_PASSWORD` y podrás editar, con cambios
**al instante**:

- **Tablas** del menú (agregar, editar, eliminar, destacada, orden)
- **Galería** (subir/eliminar fotos, captions) y las **imágenes del hero y nosotros**
- **Contacto**: WhatsApp, Instagram, correo y zona de servicio

El contenido vive en la base de datos. `src/config.ts` solo se usa como **valores
semilla** la primera vez que arranca (para que la página se vea igual que antes).

Para **cambiar la contraseña**: cambia la variable `ADMIN_PASSWORD` y vuelve a desplegar.

> Los datos de contacto son **placeholders**. Reemplázalos por los reales antes de publicar.

## 🖼️ Imágenes

Las fotos reales viven en `public/images/` (`tabla-1.jpg`, `tabla-2.jpg`, `tabla-3.jpg`).

- **Hero** usa `tabla-1.jpg`, **Nosotros** usa `tabla-3.jpg`.
- La **galería** se controla desde `galeria` en `src/config.ts` (cada entrada tiene `src` y `caption`).

Para cambiar una foto, reemplaza el archivo en `public/images/` conservando el nombre, o edita las rutas en `config.ts` / los componentes.

## 🎨 Logo

Coloca tu logo en `public/` (p. ej. `logo.svg`) y en `src/components/Header.astro`
reemplaza el bloque de texto del logo por:

```html
<img src="/logo.svg" alt="Las Tablas de Titto" class="h-10 w-auto" />
```

## 🎛️ Paleta y tipografía

- Colores en `tailwind.config.mjs` (`charcoal`, `gold`, `wine`, `cream`, …).
- Tipografías: **Cormorant Garamond** (títulos) + **Manrope** (cuerpo), cargadas localmente vía `@fontsource` (sin depender de CDNs).

## ☁️ Despliegue en Coolify (importante)

El sitio ya **no es estático**: corre como servidor Node (Docker) con base de datos.
En Coolify, en tu aplicación:

1. **Build Pack:** Dockerfile (raíz del repo).
2. **Puerto expuesto:** `4321`.
3. **Volumen persistente:** monta `/app/data`
   *(ahí viven la BD SQLite y las imágenes subidas — sin el volumen se pierden en cada redeploy).*
4. **Variables de entorno:**
   - `ADMIN_USER` = tu usuario
   - `ADMIN_PASSWORD` = tu contraseña
   - `SESSION_SECRET` = una cadena larga aleatoria
   - `HOST` = `0.0.0.0`
   - `DATA_DIR` = `/app/data`
5. **Redeploy.**

Ver `.env.example` para la lista de variables.
