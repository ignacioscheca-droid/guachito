"""Crop full-screen illustrations out of the screen mockups and paint out baked-in text.

Text sits on smooth sky gradients, so each masked pixel is refilled by linear
interpolation along its row between the nearest clean pixels, then softened.

Usage: python3 design/tools/backgrounds.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "design/source/01_PRODUCT_MVP"
OUT = ROOT / "app/public/art"

# name: (source, crop box, [text boxes in source coords], output width)
BACKGROUNDS = {
    "bg_onboarding": ("01_onboarding.png", (40, 205, 556, 1612), [(90, 320, 520, 605)], 780),
    "bg_name": ("02_name_guachito.png", (44, 200, 530, 1300), [], 780),
    "bg_adventure_ready": ("06_adventure_ready.png", (84, 205, 602, 1660), [(130, 280, 570, 515)], 780),
    "bg_pampas": ("06_adventure_ready.png", (84, 205, 602, 770), [(130, 280, 570, 515)], 1040),
    "story_caballo": ("07_story_reward.png", (186, 297, 572, 698), [], 772),
}


def text_mask(rgb, box):
    """Pixels inside box that stand out from their row's sky colour."""
    l, t, r, b = box
    region = rgb[t:b, l:r].astype(np.float32)
    row_med = np.median(region, axis=1, keepdims=True)
    dist = np.sqrt(((region - row_med) ** 2).sum(axis=2))
    m = np.zeros(rgb.shape[:2], bool)
    m[t:b, l:r] = dist > 10
    return ndimage.binary_dilation(m, iterations=4)


def fill_rows(rgb, mask):
    out = rgb.astype(np.float32).copy()
    xs = np.arange(rgb.shape[1])
    for y in np.where(mask.any(axis=1))[0]:
        bad = mask[y]
        good = ~bad
        if good.sum() < 2:
            continue
        for c in range(3):
            out[y, bad, c] = np.interp(xs[bad], xs[good], out[y, good, c])
    # soften streaks inside the filled area only
    blurred = np.stack([ndimage.gaussian_filter(out[..., c], 3) for c in range(3)], axis=2)
    soft = ndimage.gaussian_filter(mask.astype(np.float32), 2)[..., None]
    return (out * (1 - soft) + blurred * soft).clip(0, 255).astype(np.uint8)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, crop, texts, width) in BACKGROUNDS.items():
        rgb = np.array(Image.open(SRC / src).convert("RGB"))
        mask = np.zeros(rgb.shape[:2], bool)
        for box in texts:
            mask |= text_mask(rgb, box)
        if mask.any():
            rgb = fill_rows(rgb, mask)
        img = Image.fromarray(rgb).crop(crop)
        h = round(img.height * width / img.width)
        img = img.resize((width, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5, 50, 2))
        img.save(OUT / f"{name}.jpg", quality=86)
        print(f"{name:20s} {width}x{h}")


if __name__ == "__main__":
    main()
