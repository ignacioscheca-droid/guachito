"""Parts for the Rive Guachito, built from the artist's full-body poses.

The delivered rig parts don't rebuild the character yet, so the Rive master is
pose-swap + vector eyelids: the web-ready poses (app/public/a/g_*.webp, all on
one 906 x 990 box with the boots at y = 982.5) plus a clean moustache overlay
cut from the idle pose, drawn above the eyelids so a blink never covers it.

Writes design/rive/parts/ and prints the eye ellipses + skin colours in box px.
Usage: python3 design/tools/rive_parts.py
"""
import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "app/public/a"
OUT = ROOT / "design/rive/parts"

# idle pose, original 2048 canvas: sclera boxes (x0, y0, x1, y1) measured on the artist's file
EYES = {"eye_a": (912, 1012, 1005, 1107), "eye_b": (1105, 967, 1185, 1062)}
SHIFT_Y = 57  # baseline fix applied to the idle by import_assets.py
BOX = (420, 590)
SCALE = 0.75


def to_box(x, y):
    return (x - BOX[0]) * SCALE, (y + SHIFT_Y - BOX[1]) * SCALE


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name in ["g_idle", "g_jump", "g_celebrate", "g_thumbs"]:
        shutil.copy(WEB / f"{name}.webp", OUT / f"{name}.webp")

    idle = np.array(Image.open(WEB / "g_idle.webp").convert("RGBA")).astype(int)
    meta = {"box": [906, 990], "baseline": 982.5, "eyes": {}}
    for key, (x0, y0, x1, y1) in EYES.items():
        cx, cy = to_box((x0 + x1) / 2, (y0 + y1) / 2)
        rx, ry = (x1 - x0) / 2 * SCALE, (y1 - y0) / 2 * SCALE
        # lid colour: median skin in a ring around the eye (brows, pupils and moustache excluded)
        ys, xs = np.mgrid[: idle.shape[0], : idle.shape[1]]
        d = ((xs - cx) / rx) ** 2 + ((ys - cy) / ry) ** 2
        ring = idle[(d > 1.3) & (d < 2.2), :3]
        skin = np.median(ring[(ring[:, 0] > 200) & (ring[:, 1] > 130) & (ring[:, 2] < 170)], axis=0)
        meta["eyes"][key] = {"cx": round(cx, 1), "cy": round(cy, 1), "rx": round(rx, 1), "ry": round(ry, 1),
                             "skin": "#%02x%02x%02x" % tuple(int(v) for v in skin)}

    # Moustache + mouth: the big dark-brown blob below the eyes.
    rgb, a = idle[..., :3], idle[..., 3]
    ys, xs = np.mgrid[: idle.shape[0], : idle.shape[1]]
    eye_cy = min(e["cy"] for e in meta["eyes"].values())
    region = (ys > eye_cy - 10) & (ys < eye_cy + 170) & (xs > 250) & (xs < 680)
    dark = (rgb.sum(axis=2) < 300) & (a > 100) & region
    # Inside the eyes only moustache-brown counts: no black pupil, no white sclera.
    brown = (rgb[..., 0] - rgb[..., 2] > 22) & (rgb.sum(axis=2) > 105)
    in_eye = np.zeros_like(dark)
    for e in meta["eyes"].values():
        in_eye |= ((xs - e["cx"]) / (e["rx"] + 4)) ** 2 + ((ys - e["cy"]) / (e["ry"] + 4)) ** 2 < 1
    dark &= ~in_eye | brown
    lab, n = ndimage.label(ndimage.binary_closing(dark, iterations=2))
    sizes = ndimage.sum(dark, lab, range(1, n + 1))
    keep = ndimage.binary_dilation(lab == int(np.argmax(sizes)) + 1, iterations=2) & (~in_eye | brown)
    tache = idle.copy().astype(np.uint8)
    tache[~keep, 3] = 0
    Image.fromarray(tache, "RGBA").save(OUT / "g_idle_moustache.webp", "WEBP", quality=90)
    (OUT / "parts.json").write_text(json.dumps(meta, indent=1))
    print(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
