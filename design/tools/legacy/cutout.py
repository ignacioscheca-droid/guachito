"""Cut art out of the reference boards onto transparent backgrounds.

The boards are flat cream backgrounds, and Guachito's shirt is almost the same
cream, so a plain colour key eats the shirt. Instead we flood-fill the
background from the crop border with a tight tolerance, then derive a soft
alpha only in a thin fringe around that region and un-mix the background colour
out of the fringe pixels.

Usage: python3 design/tools/cutout.py [asset-name ...]   (default: all)
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = Path(__file__).with_name("assets.json")


def estimate_bg(rgb):
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    return np.median(border, axis=0)


def cut(rgb, flood_tol=9.0, fringe=2, soft_lo=4.0, soft_hi=30.0, keep="largest", min_area=0.002):
    rgb = rgb.astype(np.float32)
    bg = estimate_bg(rgb)
    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))

    # Background = pixels close to bg colour that are connected to the crop border.
    near = dist < flood_tol
    labels, _ = ndimage.label(near)
    edge_labels = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    edge_labels = edge_labels[edge_labels > 0]
    outside = np.isin(labels, edge_labels)

    alpha = np.ones(dist.shape, np.float32)
    alpha[outside] = 0.0
    # Soft edge: inside the fringe ring, alpha follows distance from bg.
    ring = ndimage.binary_dilation(outside, iterations=fringe) & ~outside
    alpha[ring] = np.clip((dist[ring] - soft_lo) / (soft_hi - soft_lo), 0.0, 1.0)

    # Drop specks (confetti, labels) - keep the main subject.
    solid = alpha > 0.5
    lab, n = ndimage.label(solid)
    if n:
        areas = ndimage.sum(solid, lab, range(1, n + 1))
        if keep == "largest":
            keep_ids = [int(np.argmax(areas)) + 1]
        else:  # keep everything bigger than min_area of the crop
            keep_ids = [i + 1 for i, a in enumerate(areas) if a >= min_area * solid.size]
        keep_mask = ndimage.binary_dilation(np.isin(lab, keep_ids), iterations=fringe + 1)
        alpha[~keep_mask] = 0.0

    # Un-mix the background colour from semi-transparent pixels.
    a = alpha[..., None]
    with np.errstate(divide="ignore", invalid="ignore"):
        fg = np.where(a > 0.02, (rgb - (1 - a) * bg) / np.maximum(a, 1e-3), rgb)
    fg = np.clip(fg, 0, 255)
    out = np.dstack([fg, alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def drop_floor_shadow(img):
    """Remove the light-grey contact shadow baked under the feet (redrawn in-app)."""
    a = np.array(img).astype(np.float32)
    rgb, alpha = a[..., :3], a[..., 3]
    rows = np.arange(a.shape[0])[:, None]
    ys = np.where(alpha.max(axis=1) > 0)[0]
    floor = rows > ys.min() + 0.78 * (ys.max() - ys.min())
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    shadow = floor & (chroma < 22) & (rgb.min(axis=2) > 170)
    alpha[shadow] = 0
    a[..., 3] = alpha
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def erode_alpha(img, px):
    """Shrink the matte by px to drop the light glow some screen mockups paint around icons."""
    a = np.array(img)
    a[..., 3] = ndimage.grey_erosion(a[..., 3], size=(2 * px + 1, 2 * px + 1))
    return Image.fromarray(a, "RGBA")


def trim(img, pad=4):
    bbox = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l, t = max(0, l - pad), max(0, t - pad)
    r, b = min(img.width, r + pad), min(img.height, b + pad)
    return img.crop((l, t, r, b))


def process(name, spec):
    src = Image.open(ROOT / spec["src"]).convert("RGB")
    crop = src.crop(tuple(spec["box"]))
    opts = {k: spec[k] for k in ("flood_tol", "fringe", "soft_lo", "soft_hi", "keep", "min_area") if k in spec}
    if spec.get("raw"):  # no keying: illustrations that keep their background
        img = crop.convert("RGBA")
    else:
        img = cut(np.array(crop), **opts)
        if spec.get("no_shadow"):
            img = drop_floor_shadow(img)
        if spec.get("erode"):
            img = erode_alpha(img, spec["erode"])
        img = trim(img)
    scale = spec.get("scale", 1)
    if scale != 1:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    out = ROOT / spec.get("out_dir", "app/public/art") / f"{name}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, optimize=True)
    return out, img.size


def main():
    manifest = json.loads(MANIFEST.read_text())
    names = sys.argv[1:] or list(manifest)
    for name in names:
        out, size = process(name, manifest[name])
        print(f"{name:28s} {size[0]:4d}x{size[1]:<4d} -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
