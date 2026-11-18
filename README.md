# B Ink Tattoo — web

Web del estudio B Ink Tattoo (Monforte de Lemos). Astro 7 + Tailwind CSS 4 + GSAP + Lenis. Sin React.

## Puesta en marcha

Requiere Node **22.23.4 o superior** (recomendado: la última LTS).

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera /dist (estático)
npm run preview
```

## Medios

Los originales **no se tocan**. Viven en las carpetas hermanas de este proyecto (`../Fotos`, `../Videos`, `../recuperacion-binktattoo`).
`scripts/preparar_medios.py` crea copias web dentro del proyecto:

- `src/assets/img/`: copias de las fotos con nombres descriptivos (Astro genera AVIF/WebP al compilar). El retrato de Byron se recorta 40 px por abajo para quitar un resto de interfaz.
- `src/assets/img/poseidon-boceto.jpg`: boceto derivado de la foto real de Poseidón (detección de trazos con OpenCV, **sin IA generativa**). Es la capa base del revelado.
- `public/media/*.mp4`: vídeos sin audio, recortados, H.264 *faststart* (≈0,8–1,6 MB), con su póster `.jpg`. El del hero y el del estudio van en blanco y negro.

```bash
pip install opencv-python numpy pillow   # y ffmpeg en el PATH
python scripts/preparar_medios.py        # por defecto lee de la carpeta padre
```

## Estructura

```
src/
  components/
    HeroAro.astro          Hero: aro de luz + vídeo en portal + salida con humo (pin)
    RevelaTinta.astro      Revelado con pincel (boceto → tinta), cortinilla, modo pincel táctil
    CartasEstudio.astro    Abanico 3D (ratón) / baraja deslizable (táctil) + visor
    Manifiesto.astro       Marquesinas góticas + ventana vertical
    Estela.astro           Transición de humo entre secciones
    GaleriaTrabajos.astro  Galería editorial asimétrica + filtros + visor
    Proceso.astro          «Cómo trabajamos» (lista A/B/C/D)
    CitaCTA.astro          Llamada a la cita (correo e Instagram)
  scripts/
    motion.ts              GSAP + ScrollTrigger + Lenis compartidos, reveals
    humo.ts                Humo procedural WebGL (un shader, media resolución)
  data/
    site.ts                Datos del negocio (solo verificados; pendientes = null)
    trabajos.ts            Portfolio
    estudio.ts             Cartas del estudio
  pages/                   index, trabajos, estudio, cita, legales (pendientes), 404
```

## Añadir trabajos

1. Copia la foto a `src/assets/img/`.
2. Añade una entrada en `src/data/trabajos.ts` (título, estilo, alt).
   La galería repite un patrón asimétrico de 6 posiciones, así que la composición se mantiene sola.

## Revelado con un par antes/después real

`RevelaTinta` acepta `antes` y `despues`. Si se consigue una foto del brazo limpio alineada con la tatuada:

```astro
<RevelaTinta antes={brazoLimpio} despues={brazoTatuado} etiquetaAntes="Sin tinta" etiquetaDespues="Con tinta" eyebrow="Antes / después" ... />
```

Las dos imágenes deben tener exactamente el mismo encuadre y las mismas proporciones.

## Pendiente con el estudio

- Teléfono / WhatsApp, horario y biografía de Byron (`src/data/site.ts`). Hasta tenerlos, no aparecen.
- Datos del titular para aviso legal, privacidad y cookies. Las páginas existen con `noindex` y un aviso de «En preparación».
- Testimonios: no se publican hasta verificar su procedencia.
- Dominio definitivo (`astro.config.mjs` → `site`; ahora `https://binktattoo.com`).
- Más fotos de trabajos.

## Rendimiento y accesibilidad

- El humo solo se dibuja mientras es visible y tiene densidad, a 0,4–0,45× la resolución.
- Los vídeos solo se reproducen en pantalla y se pausan con la pestaña oculta.
- `prefers-reduced-motion`: sin scroll suave, sin animaciones y sin autoplay; todo el contenido queda visible.
- Las interacciones tienen equivalente con teclado (cartas con flechas e Intro, visor con Esc).
