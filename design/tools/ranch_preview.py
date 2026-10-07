"""Render the ranch layout from app/src/game/content.ts onto the patio, for review.

Mirrors Scene.tsx: spots are % of the square patio (bottom-centre anchored).
Usage: python3 design/tools/ranch_preview.py [out.png] [owned,ids]
"""
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
A = ROOT / "app/public/a"
S = 1254
HERO = dict(x=20.9, y=71.3, h=25.1)  # keep in sync with Scene.tsx
DOG = dict(x=7.9, y=72.8, h=11.3)


def spots():
    src = (ROOT / "app/src/game/content.ts").read_text()
    out = {}
    for m in re.finditer(r"\{ id: '(\w+)'.*?image: '(\w+)', spot: \{([^}]*)\}(?:, needs: '(\w+)', alt: \{([^}]*)\})?", src):
        parse = lambda t: {k: float(v) for k, v in re.findall(r"(\w+): ([\d.]+)", t)}
        out[m.group(1)] = dict(image=m.group(2), spot=parse(m.group(3)), needs=m.group(4), alt=parse(m.group(5)) if m.group(5) else None)
    return out


def paste(bg, img, x, y, h, w=None):
    hp = round(h / 100 * S)
    wp = round(w / 100 * S) if w else round(img.width * hp / img.height)
    img = img.resize((wp, hp), Image.LANCZOS)
    bg.alpha_composite(img, (round(x / 100 * S - wp / 2), round(y / 100 * S - hp)))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "design/work/ranch_preview.png")
    items = spots()
    owned = sys.argv[2].split(",") if len(sys.argv) > 2 else list(items)
    bg = Image.open(A / "bg_patio.webp").convert("RGBA")
    layers = []
    for iid in owned:
        it = items[iid]
        sp = it["alt"] if it["needs"] and it["needs"] not in owned else it["spot"]
        layers.append((sp.get("z", round(sp["y"])), it["image"], sp))
    layers.append((round(HERO["y"]), "g_idle", dict(HERO, box=True)))
    layers.append((round(DOG["y"]), "dog_sit", dict(DOG, dog=True)))
    for _, name, sp in sorted(layers, key=lambda t: t[0]):
        img = Image.open(A / f"{name}.webp").convert("RGBA")
        if sp.get("box"):  # pose box: idle fills 89.5% of it
            paste(bg, img, sp["x"], sp["y"] + 0.4 * sp["h"] / 42, sp["h"] / 0.895)
        elif sp.get("dog"):
            paste(bg, img, sp["x"], sp["y"] + 0.3, sp["h"] / 0.875)
        else:
            paste(bg, img, sp["x"], sp["y"], sp["h"], sp.get("w"))
    bg.save(out)
    print("wrote", out)


if __name__ == "__main__":
    main()
