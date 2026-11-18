/**
 * Humo / tinta en agua procedural (WebGL 1, un único shader de pantalla completa).
 * - Sin vídeos ni imágenes de stock: ruido fbm con deformación de dominio.
 * - Se dibuja a media resolución y solo mientras es visible y tiene progreso.
 * - modo 'portal': brota radialmente desde un punto (hero).
 * - modo 'estela': pluma que sale de un punto hacia la derecha (transiciones).
 */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime, uProg, uMode, uAlpha, uSeed; uniform vec2 uOrigin;
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy/uRes; float asp = uRes.x/uRes.y;
  vec2 p = uv; p.x *= asp; vec2 o = uOrigin; o.x *= asp;
  vec2 d = p - o;
  float t = uTime*.055 + uSeed;
  // advección: el humo se expande desde el origen (zoom suave, sin singularidad central)
  vec2 s = (uMode < .5) ? o + d*(1. - uProg*.38) + vec2(0., -uProg*.25) : p - vec2(uProg*.7, 0.);
  vec2 q = vec2(fbm(s*2.1 + vec2(0., t)), fbm(s*2.1 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(s*2.7 + 3.6*q + vec2(1.7, 9.2) + t*1.4), fbm(s*2.7 + 3.6*q + vec2(8.3, 2.8) - t));
  float f = fbm(s*2. + 3.2*r);
  float m;
  if (uMode < .5) {
    float rad = length(d);
    float R = mix(.02, 1.65, uProg);
    m = smoothstep(R + .08, R - .55, rad + (f - .5)*1.1);
    m *= smoothstep(0., .12, uProg);
  } else {
    float x = d.x;
    float spread = .03 + max(x, 0.)*.42;
    float y = abs(d.y - (f - .5)*.55*max(x, 0.) + sin(x*3. + t*4.)*.04*x);
    float reach = uProg*(asp + .6);
    m = smoothstep(spread, spread*.1, y) * smoothstep(-.03, .04, x) * smoothstep(reach + .05, reach - .5, x);
  }
  // volutas: se conservan solo las crestas del ruido → humo fino, no masa
  float v = f + .25*length(r) - .18*length(q);
  float dens = m * smoothstep(.34, .92, v);
  float wisp = pow(dens, 1.6);
  vec3 c = mix(vec3(.06,.055,.05), vec3(.82,.79,.74), wisp);
  c += vec3(.76,.63,.42) * pow(dens, 3.5) * .14;          /* reflejo latón muy leve */
  float a = clamp(dens*1.1, 0., .94) * uAlpha;
  gl_FragColor = vec4(c*a, a);
}`;

export interface HumoOpts { modo?: 'portal' | 'estela'; origen?: [number, number]; escala?: number; semilla?: number }

export class Humo {
  private gl: WebGLRenderingContext | null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private visible = false;
  private t0 = performance.now();
  progreso = 0;
  alpha = 1;
  ok = false;

  constructor(private canvas: HTMLCanvasElement, private o: HumoOpts = {}) {
    this.gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true, powerPreference: 'low-power' });
    if (!this.gl) return;
    const gl = this.gl;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { this.gl = null; return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['uRes', 'uTime', 'uProg', 'uMode', 'uAlpha', 'uOrigin', 'uSeed']) this.u[n] = gl.getUniformLocation(prog, n);
    gl.uniform1f(this.u.uMode, o.modo === 'estela' ? 1 : 0);
    gl.uniform1f(this.u.uSeed, o.semilla ?? Math.random() * 10);
    const [ox, oy] = o.origen ?? [0.5, 0.5];
    gl.uniform2f(this.u.uOrigin, ox, 1 - oy);
    this.ok = true;
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.loop(); }).observe(canvas);
  }

  setOrigen(x: number, y: number) { this.gl?.uniform2f(this.u.uOrigin, x, 1 - y); }

  private resize() {
    if (!this.gl) return;
    const k = this.o.escala ?? 0.5;
    const w = Math.max(2, Math.round(this.canvas.clientWidth * k));
    const h = Math.max(2, Math.round(this.canvas.clientHeight * k));
    this.canvas.width = w; this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
    this.gl.uniform2f(this.u.uRes, w, h);
    this.draw();
  }

  private draw() {
    const gl = this.gl; if (!gl) return;
    gl.uniform1f(this.u.uTime, (performance.now() - this.t0) / 1000);
    gl.uniform1f(this.u.uProg, this.progreso);
    gl.uniform1f(this.u.uAlpha, this.alpha);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (this.progreso > 0.001 && this.alpha > 0.001) gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private loop = () => {
    cancelAnimationFrame(this.raf);
    if (!this.visible) return;
    this.draw();
    // Si no hay humo, no seguimos pidiendo fotogramas
    if (this.progreso > 0.001 && this.alpha > 0.001) this.raf = requestAnimationFrame(this.loop);
  };

  /** Llamar al cambiar progreso/alpha (por ejemplo desde ScrollTrigger). */
  set(p: number, a = this.alpha) {
    const wasIdle = !(this.progreso > 0.001 && this.alpha > 0.001);
    this.progreso = p; this.alpha = a;
    if (wasIdle) this.loop(); else if (!this.raf) this.loop();
  }
}
