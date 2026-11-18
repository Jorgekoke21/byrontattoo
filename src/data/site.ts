/**
 * Datos del estudio.
 * Solo se incluye información verificada en la recuperación de la web antigua
 * (capturas de 2024-2025) y lo confirmado por el cliente (Byron es el tatuador).
 * Los campos `null` están PENDIENTES: no se muestran en la web hasta tener el dato.
 */
/** Antepone la ruta base (necesaria en GitHub Pages: /byrontattoo/). */
export const u = (ruta: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${ruta}`;

export const site = {
  nombre: 'B Ink Tattoo',
  nombreLargo: 'B Ink Tattoo Studio',
  url: 'https://binktattoo.com', // dominio de la web antigua, pendiente de confirmar
  email: 'binktattoo23@gmail.com',
  instagram: {
    usuario: '@b_ink_tattoo_studio',
    url: 'https://www.instagram.com/b_ink_tattoo_studio',
  },
  direccion: {
    calle: 'Calle Doctor Teijeiro, 31 bajo',
    cp: '27400',
    ciudad: 'Monforte de Lemos',
    provincia: 'Lugo',
    pais: 'ES',
  },
  mapa: 'https://www.google.com/maps/search/?api=1&query=Calle+Doctor+Teijeiro+31+Monforte+de+Lemos',
  artista: { nombre: 'Byron', rol: 'Tatuador' },
  tecnicas: ['Blackwork', 'Realismo', 'Fineline', 'Color'],

  // Pendientes de confirmar con el estudio
  telefono: null as string | null,
  whatsapp: null as string | null,
  horario: null as string | null,
  biografia: null as string | null,
} as const;

export const nav = [
  { href: u('/trabajos'), label: 'Trabajos' },
  { href: u('/estudio'), label: 'Estudio' },
  { href: u('/cita'), label: 'Cita' },
];

/** Plantilla de correo para solicitar cita (mientras no haya otros canales). */
export function mailtoCita(cuerpo?: string) {
  const asunto = 'Cita en B Ink Tattoo';
  const texto =
    cuerpo ??
    'Hola Byron,\n\nMe gustaría hacerme un tatuaje.\n\nIdea:\nZona del cuerpo:\nTamaño aproximado:\n¿Color o negro?:\n\n(Si tienes referencias, adjúntalas al correo.)\n';
  return `mailto:${site.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`;
}
