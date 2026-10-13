"""Helpers shared by the area importers (import_area1.py, import_area2.py).

An area arrives from ChatGPT as aligned edits of one picture (its stages, a clean plate
without what moves) plus sprite sheets; these helpers cut layers out of them by comparing
the edits pixel by pixel.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'arte_build'
OUT = ROOT / 'app/public/a'
W, H = 1024, 1536


def rgb(path):
    return np.asarray(Image.open(path).convert('RGB').resize((W, H))).astype(np.float32)


def changed(a, b, thr=60, min_size=800, grow=10):
    """Where two aligned images differ, as solid blobs (re-render noise left out)."""
    m = ndimage.binary_opening(np.abs(a - b).sum(2) > thr, iterations=2)
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=4))
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > min_size])
    return ndimage.binary_fill_holes(ndimage.binary_dilation(m, iterations=grow))


def feather(mask, r=5):
    return np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


def pct(box):
    x0, y0, x1, y1 = box
    return [round(x0 / W * 100, 2), round(y0 / H * 100, 2), round((x1 - x0) / W * 100, 2), round((y1 - y0) / H * 100, 2)]


def save_cut(img, alpha, name, box=None):
    """img (H,W,3) with alpha (0..1) cropped to what shows (or to `box`); returns its box in %."""
    a = (alpha * 255).astype(np.uint8)
    box = box or Image.fromarray(a).point(lambda v: 255 if v > 8 else 0).getbbox()
    Image.fromarray(np.dstack([img.astype(np.uint8), a]), 'RGBA').crop(box).save(OUT / f'{name}.webp', quality=88)
    return pct(box)


def fill_from_neighbours(img, hole, known):
    """img with the `hole` pixels taken from the nearest `known` pixel."""
    idx = ndimage.distance_transform_edt(~known, return_distances=False, return_indices=True)
    out = img.copy()
    out[hole] = img[idx[0], idx[1]][hole]
    return out


def sky_alpha(c, horizon=420, cloud_line=240):
    """Alpha for a scene: 0 on the sky (blue, or pale clouds) reached from the top edge."""
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    yy = np.arange(H)[:, None].repeat(W, 1)
    sky = ((b > 225) & (g - r > 52) & (yy < horizon)) | ((r > 170) & (g > 195) & (b > 210) & (yy < cloud_line)) | ((b > 240) & (g > 190) & (yy < cloud_line))
    lab, _ = ndimage.label(sky)
    sky = np.isin(lab, list(set(np.unique(lab[:3])) - {0}))
    return np.asarray(Image.fromarray(np.where(sky, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)))


def sheet_sprites(path, grow=3):
    """The separate pieces of a sprite sheet (transparent background), as boxes (left, top, right, bottom)."""
    sheet = Image.open(path).convert('RGBA')
    a = np.asarray(sheet)[..., 3] > 20
    lab, n = ndimage.label(ndimage.binary_dilation(a, iterations=grow))
    boxes = [(s[1].start, s[0].start, s[1].stop, s[0].stop) for s in ndimage.find_objects(lab)]
    return sheet, boxes


def mask_box(alpha):
    """The box (left, top, right, bottom) of an alpha (0..1)."""
    return Image.fromarray((alpha * 255).astype(np.uint8)).point(lambda v: 255 if v > 8 else 0).getbbox()
