import { u } from './site';
import poseidon from '../assets/img/poseidon.jpg';
import mariposa from '../assets/img/mariposa.jpg';
import flor from '../assets/img/flor.jpg';
import stitch from '../assets/img/stitch.jpg';
import alma from '../assets/img/alma.jpg';
import piezaColor from '../assets/img/pieza-color.jpg';

/**
 * Portfolio. Para añadir un trabajo: copia la foto en src/assets/img/ e incorpora
 * una entrada aquí. El orden del array es el orden de la galería.
 *
 * `estilo` es una clasificación VISUAL para los filtros (color / black & grey / lettering),
 * no una especialidad declarada por el estudio. Revisar con Byron.
 */
export type Estilo = 'color' | 'black-grey' | 'lettering';
export interface Trabajo {
  id: string;
  titulo: string;
  estilo: Estilo;
  img: ImageMetadata;
  alt: string;
  video?: string; // vídeo corto opcional (público, sin audio)
  destacado?: boolean;
}

export const estilos: Record<Estilo, string> = {
  color: 'Color',
  'black-grey': 'Black & grey',
  lettering: 'Lettering',
};

export const trabajos: Trabajo[] = [
  { id: 'poseidon', titulo: 'Poseidón y el Coliseo', estilo: 'black-grey', img: poseidon, destacado: true,
    alt: 'Media manga en black & grey con Poseidón, su tridente y el Coliseo romano' },
  { id: 'rostro-flor', titulo: 'Rostro y flor, en sesión', estilo: 'color', img: piezaColor, video: u('/media/pieza-color.mp4'), destacado: true,
    alt: 'Byron tatuando en color un rostro femenino con una flor rosa en el antebrazo' },
  { id: 'mariposa', titulo: 'Mariposa azul', estilo: 'color', img: mariposa, destacado: true,
    alt: 'Tatuaje en color de una mariposa azul con sombra, en el hombro' },
  { id: 'flor', titulo: 'Flor violeta', estilo: 'color', img: flor, destacado: true,
    alt: 'Tatuaje de una flor violeta con hojas en ocre, en la pierna' },
  { id: 'stitch', titulo: 'Stitch', estilo: 'black-grey', img: stitch, destacado: true,
    alt: 'Tatuaje en negro y grises del personaje Stitch sentado, en el brazo' },
  { id: 'alma', titulo: 'Alma', estilo: 'lettering', img: alma, destacado: true,
    alt: 'Lettering fino con la palabra «Alma» en el antebrazo' },
];
