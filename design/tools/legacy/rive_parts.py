"""Prepare the image parts the Rive master is built from (design/rive/parts).

Idle is split into head and body so the head can bob/tilt over the breathing
body; the celebration poses stay whole and are swapped in by the state machine.
Everything is exported at 2x (Lanczos) and placed at 0.5 scale in Rive.

Usage: python3 design/tools/rive_parts.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "app/public/art"
OUT = ROOT / "design/rive/parts"

NECK_Y = 136  # chin/scarf line in char_idle.png
OVERLAP = 6  # rows shared by head and body so a moving head never shows a gap


def up2(img):
    big = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}

    idle = Image.open(ART / "char_idle.png").convert("RGBA")
    head = idle.crop((0, 0, idle.width, NECK_Y + OVERLAP))
    body = idle.copy()
    body.paste((0, 0, 0, 0), (0, 0, idle.width, NECK_Y - OVERLAP))
    for name, img in {"idle_head": head, "idle_body": body}.items():
        up2(img).save(OUT / f"{name}.png", optimize=True)
        meta[name] = {"w": img.width, "h": img.height}

    # Moustache (+ open mouth) as an overlay drawn above the eyelids, so a blink
    # never paints skin over the moustache where it overlaps the right eye.
    a = np.array(idle)
    region = np.zeros(a.shape[:2], bool)
    region[94:132, 140:340] = True
    darkish = (a[..., :3].astype(int).sum(axis=2) < 330) & (a[..., 3] > 100) & region
    yy, xx = np.mgrid[: a.shape[0], : a.shape[1]]
    for cx, cy, rx, ry in [(187, 92, 23, 18), (281, 89, 24, 19)]:  # keep pupils out
        in_eye = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 < 1
        darkish &= ~(in_eye & (yy < cy + 9))
    lab, n = ndimage.label(ndimage.binary_closing(darkish, iterations=1))
    sizes = ndimage.sum(darkish, lab, range(1, n + 1))
    keep = ndimage.binary_dilation(lab == (int(np.argmax(sizes)) + 1), iterations=1)
    tache = a.copy()
    tache[~keep, 3] = 0
    tache_img = Image.fromarray(tache, "RGBA").crop((0, 0, idle.width, NECK_Y + OVERLAP))
    up2(tache_img).save(OUT / "idle_moustache.png", optimize=True)
    meta["idle_moustache"] = {"w": tache_img.width, "h": tache_img.height}

    for name, src in {
        "pose_jump": "char_jump_big.png",
        "pose_celebrate": "char_celebrate.png",
        "pose_land": "char_step.png",
        "pose_wave": "char_wave.png",
        "dog_sit": "dog_sit.png",
        "dog_happy": "dog_happy.png",
        "dog_sleep": "dog_sleep.png",
    }.items():
        img = Image.open(ART / src).convert("RGBA")
        # dogs and the wave pose were already upscaled by the cutout step
        out = img if name.startswith("dog_") or name == "pose_wave" else up2(img)
        out.save(OUT / f"{name}.png", optimize=True)
        meta[name] = {"w": out.width // 2, "h": out.height // 2}

    # Eye centres / radii in char_idle.png pixels, for the vector eyelids.
    meta["eyes"] = {"left": {"x": 187, "y": 92, "rx": 23, "ry": 18}, "right": {"x": 281, "y": 89, "rx": 24, "ry": 19}}
    meta["skin"] = "#fbb97f"
    (OUT / "parts.json").write_text(json.dumps(meta, indent=1))
    print(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
