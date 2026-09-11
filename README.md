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

## 🖼️ Reemplazar imágenes por fotos reales

Ahora las tablas se muestran con una **ilustración SVG** (`src/components/BoardArt.astro`) para que no haya imágenes rotas.

Cuando tengas fotos:

1. Ponlas en `public/images/` (p. ej. `tabla-1.jpg`).
2. En `Hero.astro`, `Nosotros.astro` y `Galeria.astro`, cambia `<BoardArt ... />` por:
   ```html
   <img src="/images/tabla-1.jpg" alt="Descripción" class="w-full h-full object-cover rounded-2xl" />
   ```

## 🎨 Logo

Coloca tu logo en `public/` (p. ej. `logo.svg`) y en `src/components/Header.astro`
reemplaza el bloque de texto del logo por:

```html
<img src="/logo.svg" alt="Las Tablas de Titto" class="h-10 w-auto" />
```

## 🎛️ Paleta y tipografía

- Colores en `tailwind.config.mjs` (`charcoal`, `gold`, `wine`, `cream`, …).
- Tipografías: **Cormorant Garamond** (títulos) + **Manrope** (cuerpo), cargadas localmente vía `@fontsource` (sin depender de CDNs).
