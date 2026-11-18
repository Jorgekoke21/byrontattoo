import byron from '../assets/img/byron.jpg';
import puesto from '../assets/img/estudio-puesto.jpg';
import espera from '../assets/img/estudio-espera.jpg';
import entrada from '../assets/img/estudio-entrada.jpg';
import material from '../assets/img/material.jpg';
import espejo from '../assets/img/sesion-espejo.jpg';
import maquina from '../assets/img/sesion-maquina.jpg';
import aro from '../assets/img/sesion-aro.jpg';

/**
 * Cartas del estudio. Los textos describen lo que se ve en cada foto;
 * no añaden datos del negocio que no estén confirmados.
 */
export const cartas = [
  { img: espejo, titulo: 'En sesión', nota: 'Byron trabajando, visto desde el espejo del estudio.', alt: 'Byron tatuando a un cliente, reflejado en un espejo del estudio' },
  { img: puesto, titulo: 'El puesto', nota: 'Camilla, aro de luz y todo el material a mano.', alt: 'Puesto de trabajo con camilla negra, aro de luz y carro de herramientas rojo' },
  { img: maquina, titulo: 'La máquina', nota: 'Concentración bajo el aro de luz.', alt: 'Byron con gorra tatuando bajo el aro de luz', mono: true },
  { img: byron, titulo: 'Byron', nota: 'Tatuador de B Ink Tattoo.', alt: 'Retrato en blanco y negro de Byron, tatuador, con los brazos cruzados' },
  { img: entrada, titulo: 'La entrada', nota: 'En el centro de Monforte de Lemos.', alt: 'Interior del estudio con mampara de listones y cuadros en las paredes' },
  { img: material, titulo: 'El material', nota: 'Mesa protegida con film, lista para la sesión.', alt: 'Mesa de trabajo protegida con film, tintas, guantes y máquina' },
  { img: espera, titulo: 'La espera', nota: 'Sofá, luz cálida y cuadros en la pared.', alt: 'Zona de espera con sofá de cuero marrón y lámpara de pie' },
  { img: aro, titulo: 'El aro', nota: 'La luz que da nombre a esta web.', alt: 'Primer plano de las manos de Byron tatuando bajo el aro de luz', mono: true },
];
