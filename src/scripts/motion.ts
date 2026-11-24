import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;
/** Modo ligero (móvil/táctil): sin pin, sin WebGL, sin filtros animados. Lo fija un script en <head>. */
export const lite = () => document.documentElement.classList.contains('lite');

// Evita recálculos cuando la barra de direcciones del móvil aparece/desaparece
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis: Lenis | null = null;

/** Scroll suave (Lenis) sincronizado con el ticker de GSAP. Una sola instancia. */
export function initScroll() {
  // En táctil el scroll nativo es más fluido que cualquier suavizado
  if (lenis || reduceMotion() || lite()) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1.2 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // Enlaces internos con ancla
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const el = document.querySelector(a.getAttribute('href')!);
      if (el) { e.preventDefault(); lenis?.scrollTo(el as HTMLElement, { offset: 0 }); }
    }),
  );
  return lenis;
}

export const getLenis = () => lenis;

/** Divide un texto en spans por letra conservando los espacios. */
export function splitChars(el: HTMLElement) {
  const text = el.textContent ?? '';
  el.innerHTML = '';
  const frag = document.createDocumentFragment();
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  frag.append(sr);
  for (const word of text.split(/(\s+)/)) {
    if (/^\s+$/.test(word)) { frag.append(document.createTextNode(' ')); continue; }
    const w = document.createElement('span');
    w.style.display = 'inline-block';
    w.style.whiteSpace = 'nowrap';
    w.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'ch';
      c.style.display = 'inline-block';
      c.textContent = ch;
      w.append(c);
    }
    frag.append(w);
  }
  el.append(frag);
  return Array.from(el.querySelectorAll<HTMLElement>('.ch'));
}

/** Entrada editorial genérica para elementos con [data-sube]. */
export function initReveals(root: ParentNode = document) {
  const items = root.querySelectorAll<HTMLElement>('[data-sube]');
  if (reduceMotion()) return;
  items.forEach((el) => {
    const lineas = el.querySelectorAll('.linea > span');
    const st = { trigger: el, start: 'top 86%', once: true };
    if (lineas.length) gsap.from(lineas, { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.09, scrollTrigger: st });
    else gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: st });
  });
}

export { gsap, ScrollTrigger };
