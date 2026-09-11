# Las Tablas de Titto — Landing

Landing page de charcutería artesanal. **Astro + Tailwind CSS**, mobile-first, estática y ultra rápida.

## 🚀 Cómo correrla

```bash
cd las-tablas-de-titto
npm install
npm run dev        # http://localhost:4321
```

Otros comandos:

```bash
npm run build      # genera el sitio en dist/
npm run preview    # previsualiza el build
```

## ✏️ Qué editar (sin tocar diseño)

Todo el contenido editable vive en **`src/config.ts`**:

| Quiero cambiar… | Dónde |
|---|---|
| Número de WhatsApp | `contacto.whatsapp` (formato `5215500000000`, sin `+`) |
| Instagram / correo / zona | `contacto` y `site` |
| Tablas, precios y descripciones | `tablas` |
| Textos de la galería | `galeria` |

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
