"""Split the mate icon into the parts the day-1 streak animates.

app/public/a/habit_mate.webp (256x256) ->
  mate_empty.webp    the mate with its bombilla and an empty, dark mouth
  mate_yerba.webp    only the yerba inside the mouth (what rises as you pour)
  mate_bombilla.webp the bombilla's end inside the mouth, sinking into the dark

Stacked in that order with the yerba in place they nearly rebuild the icon (the yerba
stops just inside the rim), so the animation ends on the icon itself. Where the bombilla
covered the yerba, the yerba is filled with its mirror image across the mouth's centre.

    python3 design/tools/make_mate_parts.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

A = Path(__file__).resolve().parents[2] / "app/public/a"

# In the 256 px icon: the mouth, inside the silver rim.
MOUTH = (116.5, 112.5, 47.5, 16.0)
# The yerba layer stops a little inside the rim, so no silver comes along when it's low.
YERBA = (116.5, 112.8, 45.0, 14.0)
# The bombilla's end inside the mouth.
INSIDE = [(136, 94), (165, 94), (155, 126), (130, 126)]


def coverage(inside, h, w, n=4):
    """Anti-aliased mask: the share of n×n subsamples of each pixel that are inside."""
    acc = np.zeros((h, w), np.float32)
    for i in range(n):
        for j in range(n):
            ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
            acc += inside(xs + (j + 0.5) / n, ys + (i + 0.5) / n)
    return acc / (n * n)


def in_ellipse(xs, ys, e):
    cx, cy, rx, ry = e
    return ((xs - cx) / rx) ** 2 + ((ys - cy) / ry) ** 2 <= 1


def in_polygon(xs, ys, pts):
    inside = np.zeros(xs.shape, bool)
    j = len(pts) - 1
    for i, (xi, yi) in enumerate(pts):
        xj, yj = pts[j]
        inside ^= ((yi > ys) != (yj > ys)) & (xs < (xj - xi) * (ys - yi) / (yj - yi + 1e-9) + xi)
        j = i
    return inside


def main():
    src = np.array(Image.open(A / "habit_mate.webp").convert("RGBA")).astype(np.float32)
    h, w = src.shape[:2]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    mouth = coverage(lambda x, y: in_ellipse(x, y, MOUTH), h, w)
    cx, cy, rx, ry = MOUTH

    # the bombilla's end: grey pixels in the mouth, fading out as it goes down into it
    rgb = src[..., :3]
    spread = rgb.max(2) - rgb.min(2)
    grey = np.clip((30 - spread) / 14, 0, 1) * np.clip((rgb[..., 0] - 70) / 20, 0, 1)
    sink = np.clip((120 - ys) / 16, 0, 1) ** 1.5
    end = src.copy()
    end[..., 3] = 255 * grey * sink * in_polygon(xs, ys, INSIDE)

    # the empty mouth: dark, with a little light on the far wall falling off to the sides
    t = np.clip((ys - (cy - ry)) / (2 * ry), 0, 1)
    wall = np.stack([92 - 56 * t, 52 - 34 * t, 40 - 29 * t], -1)
    wall *= (0.72 + 0.28 * np.clip(1 - np.abs(xs - cx) / rx, 0, 1))[..., None]
    empty = src.copy()
    empty[..., :3] = rgb * (1 - mouth[..., None]) + wall * mouth[..., None]

    # the yerba: the mouth's pixels, with the bombilla's end mirrored away
    bomb = in_polygon(xs, ys, INSIDE)
    yerba = src.copy()
    by, bx = np.nonzero(bomb)
    yerba[by, bx] = src[by, np.clip(np.round(2 * cx - bx).astype(int), 0, w - 1)]
    yerba[..., 3] = 255 * coverage(lambda x, y: in_ellipse(x, y, YERBA), h, w)

    for name, img in (("mate_empty", empty), ("mate_yerba", yerba), ("mate_bombilla", end)):
        Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(A / f"{name}.webp", lossless=True)
        print("wrote", A / f"{name}.webp")


if __name__ == "__main__":
    main()
