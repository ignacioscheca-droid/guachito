"""The mate-scene poses (escena_mate/, generated with ChatGPT) -> app/public/a/mate_*.webp.

- Halo cleanup: keep the main solid silhouette (alpha > 200), plus a 2 px soft edge.
  Removes the smoky halos ChatGPT left around some plano-general frames.
- One shared crop box per group (A = plano general, B = plano medio), so swapping
  poses never shifts the character.

Usage: python3 design/tools/import_mate_scene.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "escena_mate"
OUT = ROOT / "app/public/a"

A = ["a1_base", "a2_cebando_1", "a2_cebando_2", "a2_cebando_3", "a3_sorbo", "a4_ahh", "a5_te_mira"]
B = [f"{p}_{v}" for p in ["b1_saluda", "b2_habla", "b3_escucha", "b4_contento", "b5_ofrece", "b6_toma", "b7_mas_para_mi", "b8_curioso"]
     for v in ["cerrada", "abierta"]] + ["b2_habla_parpadeo", "b3_escucha_parpadeo"]
A_WIDTH = 640   # output width of the plano general crop
B_WIDTH = 760   # output width of the plano medio crop


def clean(img):
    a = np.array(img.convert("RGBA"))
    alpha = a[..., 3].astype(np.float32)
    solid = alpha > 200
    lab, n = ndimage.label(solid)
    if n == 0:
        return img
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    main = ndimage.binary_fill_holes(lab == int(np.argmax(sizes)) + 1)
    soft = ndimage.gaussian_filter(ndimage.binary_dilation(main, iterations=2).astype(np.float32), 0.8)
    a[..., 3] = (alpha * np.clip(soft, 0, 1)).astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def export(names, width, pad=12):
    imgs = {n: clean(Image.open(SRC / f"mate_{n}.png")) for n in names}
    boxes = np.array([im.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox() for im in imgs.values()])
    l, t = boxes[:, 0].min() - pad, boxes[:, 1].min() - pad
    r, b = boxes[:, 2].max() + pad, boxes[:, 3].max() + pad
    first = next(iter(imgs.values()))
    l, t, r, b = max(0, l), max(0, t), min(first.width, r), min(first.height, b)
    scale = width / (r - l)
    size = (width, round((b - t) * scale))
    for n, im in imgs.items():
        im.crop((l, t, r, b)).resize(size, Image.LANCZOS).save(OUT / f"mate_{n}.webp", "WEBP", quality=88, method=6)
    print(f"{len(imgs)} images, crop {(l, t, r, b)} -> {size}")


if __name__ == "__main__":
    export(A, A_WIDTH)
    export(B, B_WIDTH)
