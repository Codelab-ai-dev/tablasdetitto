// ============================================================
//  Las Tablas de Titto — Configuración central
//  Edita AQUÍ tus datos reales (contacto, precios, textos).
//  Todo lo demás en la web lee de este archivo.
// ============================================================

export const site = {
  name: 'Las Tablas de Titto',
  tagline: 'Charcutería artesanal para tus mejores momentos',
  // Zona de entrega / servicio
  zona: 'Ciudad de México y área metropolitana',
};

export const contacto = {
  // ⚠️ PLACEHOLDER — reemplaza con tu número real (formato internacional, sin +, espacios ni guiones)
  whatsapp: '5215500000000',
  instagram: 'lastablasdetitto',
  instagramUrl: 'https://instagram.com/lastablasdetitto',
  email: 'hola@lastablasdetitto.com',
};

// Genera un link de WhatsApp con mensaje prellenado
export function waLink(mensaje: string): string {
  return `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

// Catálogo de tablas — edita nombres, descripciones y precios
export const tablas = [
  {
    nombre: 'Tabla Clásica',
    porciones: '2 – 3 personas',
    precio: '$549',
    descripcion:
      'Selección de quesos madurados, jamón serrano, salami y frutos secos. El punto de partida perfecto.',
    destacada: false,
  },
  {
    nombre: 'Tabla Premium',
    porciones: '4 – 6 personas',
    precio: '$989',
    descripcion:
      'Quesos importados, embutidos ibéricos, mieles, mermeladas artesanales, frutas de temporada y crujientes.',
    destacada: true,
  },
  {
    nombre: 'Tabla para Compartir',
    porciones: '8 – 10 personas',
    precio: '$1,790',
    descripcion:
      'Nuestra tabla grande para reuniones: variedad completa de charcutería, quesos y acompañamientos de autor.',
    destacada: false,
  },
];

// Galería — reemplaza estas etiquetas cuando agregues fotos reales en /public/images
export const galeria = [
  'Tabla de quesos madurados',
  'Embutidos ibéricos',
  'Mesa de grazing para evento',
  'Detalle de mieles y frutos',
  'Tabla individual',
  'Montaje para boda',
];
