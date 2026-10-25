"""Gauchito with his libreta (escena_libreta/, generated with ChatGPT from the Claude Doc
"Gauchito — Anotando en la libreta") -> app/public/a/libreta_*.webp.

Same cleanup as the mate scene, and one shared crop box for all of them, so swapping poses
never shifts him. Usage: python3 design/tools/import_libreta.py
"""
from pathlib import Path

from PIL import Image

from import_mate_scene import clean

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "escena_libreta"
OUT = ROOT / "app/public/a"

POSES = ["base", "escribe_2", "escribe_3", "parpadeo", "habla", "mira_libreta", "mira_pregunta", "mira_arriba",
         "contento", "curioso", "sorprendido", "asiente", "anotado"]
WIDTH = 600


def main(pad=8):
    imgs = {n: clean(Image.open(SRC / f"libreta_{n}.png")) for n in POSES}
    boxes = [im.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox() for im in imgs.values()]
    first = next(iter(imgs.values()))
    l, t = max(0, min(b[0] for b in boxes) - pad), max(0, min(b[1] for b in boxes) - pad)
    r, b = min(first.width, max(x[2] for x in boxes) + pad), min(first.height, max(x[3] for x in boxes) + pad)
    size = (WIDTH, round((b - t) * WIDTH / (r - l)))
    for n, im in imgs.items():
        im.crop((l, t, r, b)).resize(size, Image.LANCZOS).save(OUT / f"libreta_{n}.webp", "WEBP", quality=88, method=6)
    print(f"{len(imgs)} images, crop {(l, t, r, b)} -> {size}")


if __name__ == "__main__":
    main()
