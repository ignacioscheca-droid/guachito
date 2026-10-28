"""Paucho building at his caballete (escena_trabajando/, generated with ChatGPT from the Claude
Doc "Gauchito — Paucho trabajando en la obra") -> app/public/a/trabaja_*.webp.

The poses are pixel-aligned and already clean, so they share one crop box and are only cut
and resized: swapping them never shifts him. Prints the numbers `PauchoTrabaja` in
AreaScene.tsx needs to stand him on the ground. Usage: python3 design/tools/import_trabajando.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "escena_trabajando"
OUT = ROOT / "app/public/a"

POSES = ["base", "arriba", "golpe", "parpadeo", "seca", "mira", "mate", "mide"]
WIDTH = 420
# in the base pose: his feet's centre and the ground under them, and the top of his hat
FEET_X, FEET_Y = 305, 1314


def main(pad=8):
    imgs = {n: Image.open(SRC / f"trabaja_{n}.png").convert("RGBA") for n in POSES}
    boxes = [im.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox() for im in imgs.values()]
    first = imgs["base"]
    l, t = max(0, min(b[0] for b in boxes) - pad), max(0, min(b[1] for b in boxes) - pad)
    r, b = min(first.width, max(x[2] for x in boxes) + pad), min(first.height, max(x[3] for x in boxes) + pad)
    alpha = np.array(first.getchannel("A")) > 16
    hat = int(np.where(alpha.any(1))[0].min())
    scale = WIDTH / (r - l)
    size = (WIDTH, round((b - t) * scale))
    for n, im in imgs.items():
        im.crop((l, t, r, b)).resize(size, Image.LANCZOS).save(OUT / f"trabaja_{n}.webp", "WEBP", quality=88, method=6)
    print(f"{len(imgs)} images, crop {(l, t, r, b)} -> {size}")
    print(f"WORK_BOX = {{ w: {size[0]}, h: {size[1]}, feetX: {round((FEET_X - l) * scale)}, feetY: {round((FEET_Y - t) * scale)}, tall: {round((FEET_Y - hat) * scale)} }}")


if __name__ == "__main__":
    main()
