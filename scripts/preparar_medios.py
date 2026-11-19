"""
Prepara las versiones web de los medios de Bink Tattoo.

Lee los ORIGINALES de las carpetas hermanas del proyecto (../Fotos, ../Videos,
../recuperacion-binktattoo) y escribe COPIAS derivadas dentro del proyecto.
Nunca modifica ni sobrescribe un original.

Uso:  python3 scripts/preparar_medios.py [ruta_a_Tattoo_byron]
Requiere: Python 3, opencv-python, numpy, Pillow y ffmpeg en el PATH.
"""
import shutil, subprocess, sys
from pathlib import Path
import cv2, numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parents[1]
ORIGEN = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ.parent
REC = ORIGEN / "recuperacion-binktattoo"
IMG = RAIZ / "src/assets/img"
MEDIA = RAIZ / "public/media"
MARCA = RAIZ / "public/marca"
for d in (IMG, MEDIA, MARCA):
    d.mkdir(parents=True, exist_ok=True)

# 1) Fotografías: copias exactas con nombres descriptivos (Astro genera AVIF/WebP al compilar)
FOTOS = {
    "poseidon.jpg": ORIGEN / "Fotos/IMG-20261118-WA0008.jpg",
    "estudio-puesto.jpg": ORIGEN / "Fotos/IMG-20261118-WA0009.jpg",
    "estudio-espera.jpg": ORIGEN / "Fotos/IMG-20261118-WA0010.jpg",
    "sesion-espejo.jpg": ORIGEN / "Fotos/IMG-20261118-WA0007.jpg",
    "estudio-entrada.jpg": REC / "imagenes/estudio/imgbinkt01.jpg",
    "estudio-panoramica.jpg": REC / "imagenes/estudio/bannerIBT.jpg",
    "material.jpg": REC / "imagenes/estudio/img02IBT.jpg",
    "mariposa.jpg": REC / "imagenes/tatuajes/img04IBT.jpg",
    "flor.jpg": REC / "imagenes/tatuajes/img06IBT.jpg",
    "stitch.jpg": REC / "imagenes/tatuajes/img15IBT.jpg",
    "alma.jpg": REC / "imagenes/tatuajes/img16IBT.jpg",
}
for nombre, src in FOTOS.items():
    shutil.copyfile(src, IMG / nombre)

# Retrato: se recorta el borde inferior (resto de interfaz en la esquina del original)
r = Image.open(ORIGEN / "Fotos/byron.jpg").convert("RGB")
r.crop((0, 0, r.width, r.height - 40)).save(IMG / "byron.jpg", quality=92)

# 2) Boceto derivado de la foto real de Poseidón (detección de trazos, sin IA generativa)
img = cv2.imread(str(FOTOS["poseidon.jpg"]))
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
cl = cv2.createCLAHE(2.0, (8, 8)).apply(g)
b = cv2.bilateralFilter(cl, 9, 60, 60)
bl = cv2.GaussianBlur(255 - b, (0, 0), 5)
sk = cv2.divide(b, 255 - bl, scale=256).astype(np.float32) / 255
line = np.clip((1 - sk - 0.07) * 2.6, 0, 1) ** 1.05
gb = cv2.GaussianBlur(g, (0, 0), 8).astype(np.float32)
lum = np.clip((gb - 40) / 50, 0, 1)
h, w = line.shape
yy, xx = np.mgrid[0:h, 0:w]
d = np.sqrt(((xx - 0.55 * w) / (0.40 * w)) ** 2 + ((yy - 0.52 * h) / (0.62 * h)) ** 2)
line *= (0.25 + 0.75 * lum) * (0.15 + 0.85 * np.clip(1.3 - d, 0, 1) ** 1.5)
hueso = np.array([218, 230, 236], np.float32)
tinta = np.array([9, 10, 11], np.float32)
out = tinta * (1 - line[..., None]) + hueso * line[..., None]
cv2.imwrite(str(IMG / "poseidon-boceto.jpg"), out.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])

# 3) Vídeos: sin audio, H.264 faststart, fotograma de póster
def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)

V = ORIGEN / "Videos"
GRIS = "hue=s=0,eq=contrast=1.12:brightness=-0.02"
VIDEOS = [
    # salida, origen, inicio, duración, filtro
    ("hero-aro", V / "VID-20261118-WA0012.mp4", 0, 10.8, GRIS),
    ("pieza-color", V / "VID-20261118-WA0011.mp4", 0.3, 10.2, "eq=contrast=1.05:saturation=1.08"),
]
for nombre, src, ini, dur, vf in VIDEOS:
    ff("-ss", str(ini), "-t", str(dur), "-i", str(src), "-an", "-vf", f"{vf},format=yuv420p",
       "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-movflags", "+faststart", str(MEDIA / f"{nombre}.mp4"))
    # Versión AV1 (≈ la mitad de peso); el HTML la ofrece primero y deja H.264 de respaldo
    ff("-i", str(MEDIA / f"{nombre}.mp4"), "-an", "-c:v", "libsvtav1", "-preset", "5", "-crf", "38", "-g", "120",
       "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(MEDIA / f"{nombre}.av1.mp4"))
    # Póster en WebP
    ff("-ss", "0.2", "-i", str(MEDIA / f"{nombre}.mp4"), "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", str(MEDIA / f"{nombre}.webp"))

# Fotogramas fijos para las cartas y la galería
for nombre, src, t, vf in [
    ("sesion-maquina.jpg", V / "VID-20261118-WA0014.mp4", 6, GRIS),
    ("sesion-aro.jpg", V / "VID-20261118-WA0014.mp4", 12, GRIS),
    ("pieza-color.jpg", V / "VID-20261118-WA0011.mp4", 4, "null"),
]:
    ff("-ss", str(t), "-i", str(src), "-frames:v", "1", "-vf", vf, "-q:v", "2", str(IMG / nombre))

# 4) Marca
shutil.copyfile(REC / "marca/logobinkTwht.svg", MARCA / "logo-blanco.svg")
fav = Image.open(REC / "marca/faviconbinkt.png").convert("RGBA")
for s in (32, 180, 512):
    fav.resize((s, s), Image.LANCZOS).save(MARCA / f"favicon-{s}.png")
print("Medios preparados en", IMG, "y", MEDIA)
