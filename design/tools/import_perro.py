"""The dog's arrival (escena_perro/, generated with ChatGPT from the Claude Doc "Gauchito — Llega
el perro") -> app/public/a/:

- cucha_*.webp: the cucha empty, the puppy peeking, the puppy looking at you.
- perro_b*.webp: the puppy up close (looks, blinks, tilts his head, barks, happy).
- mate_b9_perro_*.webp: Paucho holding him, named like the mate close-ups so PauchoTalk takes
  it as one more pose; cropped to their 760x751 frame.

Each group is pixel-aligned and shares one crop box, so swapping never shifts anything.
cucha_asoma_mira.png came truncated (garbage from row ~800 down): only what changed above
that row, the head in the door, is laid over cucha_vacia.
Usage: python3 design/tools/import_perro.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "escena_perro"
OUT = ROOT / "app/public/a"

CUCHA = ["cucha_vacia", "cucha_asoma", "cucha_asoma_mira"]
PERRO = ["perro_b1_mira", "perro_b1_parpadeo", "perro_b2_ladea", "perro_b3_ladra", "perro_b4_feliz"]
PAUCHO = {"paucho_perro_cerrada": "mate_b9_perro_cerrada", "paucho_perro_abierta": "mate_b9_perro_abierta",
          "paucho_perro_parpadeo": "mate_b9_perro_parpadeo"}
TRUNCATED_FROM = 760


def load(n):
    return Image.open(SRC / f"{n}.png").convert("RGBA")


def repaired_mira(base):
    mira = np.array(load("cucha_asoma_mira"))
    out = np.array(base).copy()
    changed = np.abs(mira.astype(int) - out.astype(int)).max(2) > 40
    changed[TRUNCATED_FROM:] = False
    out[changed] = mira[changed]
    return Image.fromarray(out, "RGBA")


def box_of(imgs, pad):
    boxes = np.array([im.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox() for im in imgs])
    return boxes[:, 0].min() - pad, boxes[:, 1].min() - pad, boxes[:, 2].max() + pad, boxes[:, 3].max() + pad


def save(imgs, box, size):
    for name, im in imgs.items():
        im.crop(box).resize(size, Image.LANCZOS).save(OUT / f"{name}.webp", "WEBP", quality=88, method=6)
    print(f"{len(imgs)} images, crop {box} -> {size}")


def by_width(imgs, width, pad=10):
    l, t, r, b = box_of(imgs.values(), pad)
    first = next(iter(imgs.values()))
    l, t, r, b = max(0, l), max(0, t), min(first.width, r), min(first.height, b)
    save(imgs, (l, t, r, b), (width, round((b - t) * width / (r - l))))


def by_frame(imgs, w, h, pad=8):
    """A crop of aspect w:h around everything (it may reach past the canvas: transparent)."""
    l, t, r, b = box_of(imgs.values(), pad)
    cw, ch = r - l, b - t
    if cw / ch < w / h:
        cw2 = round(ch * w / h)
        l, r = l - (cw2 - cw) // 2, l - (cw2 - cw) // 2 + cw2
    else:
        ch2 = round(cw * h / w)
        t, b = b - ch2, b
    save(imgs, (l, t, r, b), (w, h))


if __name__ == "__main__":
    vacia = load("cucha_vacia")
    by_width({"cucha_vacia": vacia, "cucha_asoma": load("cucha_asoma"), "cucha_asoma_mira": repaired_mira(vacia)}, 560)
    by_width({n: load(n) for n in PERRO}, 760)
    by_frame({out: load(n) for n, out in PAUCHO.items()}, 760, 751)
