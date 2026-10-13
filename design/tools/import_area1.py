"""Área 1 for the app, from ChatGPT's art (local only, in arte_build/):

  area1_etapa0..3.webp    the four stages (piles of materials → casa, fogón, aljibe built)
  area1_assets/           area1_cielo_limpio, area1_fogon_apagado, area1_sin_arboles (edits of
                          etapa3, pixel-aligned), area1_nubes and area1_llamas (sprites)

    python3 design/tools/import_area1.py

Writes into app/public/a/:
  area1_sky.webp          the cloudless sky (behind everything)
  area1_scene_K.webp      stage K with no sky, no trees and (once built) the fire out
  area1_tree_l/r.webp     the two trees, to sway
  area1_cloud_1..3.webp   clouds, to drift
  area1_flame_1..3.webp   the fire's frames
  area1_obra_X.webp       each obra, and area1_pila_X.webp its pile, for the build transition
  area1_etapa0.webp       stage 0 flattened (the onboarding's background)

Prints the boxes (in % of the art) for AREAS[0] in app/src/game/journey.ts.
"""

import json
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


def save_cut(img, alpha, name):
    """img (H,W,3) with alpha (0..1) cropped to what shows; returns its box in %."""
    a = (alpha * 255).astype(np.uint8)
    box = Image.fromarray(a).point(lambda v: 255 if v > 8 else 0).getbbox()
    Image.fromarray(np.dstack([img.astype(np.uint8), a]), 'RGBA').crop(box).save(OUT / f'{name}.webp', quality=88)
    return pct(box)


stages = [rgb(SRC / f'area1_etapa{k}.webp') for k in range(4)]
clean_sky = rgb(SRC / 'area1_assets/area1_cielo_limpio.png')
no_trees = rgb(SRC / 'area1_assets/area1_sin_arboles.png')
fire_out = rgb(SRC / 'area1_assets/area1_fogon_apagado.png')
final = stages[3]
boxes = {}

# --- the sky, behind everything
Image.fromarray(clean_sky[:420].astype(np.uint8)).save(OUT / 'area1_sky.webp', quality=90)

# --- the trees: where the art and its tree-less edit differ
trees = changed(final, no_trees, min_size=2000, grow=6)
for side, cols in (('l', np.s_[:, : W // 2]), ('r', np.s_[:, W // 2 :])):
    t = np.zeros_like(trees)
    t[cols] = trees[cols]
    boxes[f'tree_{side}'] = save_cut(final, feather(t, 2), f'area1_tree_{side}')

# --- the fire: flames and the pava's steam come out of the stages from the fogón on
fire = changed(final, fire_out, min_size=50, grow=4)

# --- each obra: its pile (stage k-1) and itself (stage k)
obra_masks = {}
for k, name in ((1, 'casa'), (2, 'fogon'), (3, 'aljibe')):
    m = changed(stages[k - 1], stages[k], min_size=1500)
    obra_masks[name] = m
    al = feather(m, 6)
    boxes[f'obra_{name}'] = save_cut(stages[k], al, f'area1_obra_{name}')
    boxes[f'pila_{name}'] = save_cut(stages[k - 1], al, f'area1_pila_{name}')

# --- the stages as scenes: trees and (built) fire taken out, sky cut away
house = obra_masks['casa']
for k, st in enumerate(stages):
    c = st.copy()
    tf = feather(trees, 2)[..., None]
    behind = no_trees.copy()
    if k == 0:
        # behind the trees, no_trees shows the casa's edges: there is no casa yet, so fill
        # those few pixels from the nearest bit of stage 0 that isn't tree or casa
        hole = trees & house
        known = ~(trees | house)
        idx = ndimage.distance_transform_edt(~known, return_distances=False, return_indices=True)
        filled = st[idx[0], idx[1]]
        behind[hole] = filled[hole]
    c = c * (1 - tf) + behind * tf
    if k >= 2:
        ff = feather(fire, 2)[..., None]
        c = c * (1 - ff) + fire_out * ff
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    yy = np.arange(H)[:, None].repeat(W, 1)
    sky = ((b > 225) & (g - r > 52) & (yy < 420)) | ((r > 170) & (g > 195) & (b > 210) & (yy < 240)) | ((b > 240) & (g > 190) & (yy < 240))
    lab, _ = ndimage.label(sky)
    sky = np.isin(lab, list(set(np.unique(lab[:3])) - {0}))
    alpha = np.asarray(Image.fromarray(np.where(sky, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)))
    Image.fromarray(np.dstack([c.astype(np.uint8), alpha]), 'RGBA').save(OUT / f'area1_scene_{k}.webp', quality=86)

Image.fromarray(stages[0].astype(np.uint8)).save(OUT / 'area1_etapa0.webp', quality=86)

# --- clouds: the three sprites, at the size of the art's own clouds
sheet = Image.open(SRC / 'area1_assets/area1_nubes.png').convert('RGBA')
a = np.asarray(sheet)[..., 3] > 20
lab, n = ndimage.label(ndimage.binary_dilation(a, iterations=3))
blobs = sorted((ndimage.find_objects(lab)[i] for i in range(n)), key=lambda s: -(s[1].stop - s[1].start))
for i, (sy, sx) in enumerate(blobs[:3], 1):
    c = sheet.crop((sx.start, sy.start, sx.stop, sy.stop))
    w = (330, 250, 170)[i - 1]
    c = c.resize((w, round(c.height * w / c.width)), Image.LANCZOS)
    c.save(OUT / f'area1_cloud_{i}.webp', quality=90)
    boxes[f'cloud_{i}'] = [round(w / W * 100, 2)]

# --- flames: three frames on one baseline, at the size of the art's own fire
sheet = Image.open(SRC / 'area1_assets/area1_llamas.png').convert('RGBA')
a = np.asarray(sheet)[..., 3] > 20
lab, n = ndimage.label(ndimage.binary_dilation(a, iterations=3))
blobs = sorted((ndimage.find_objects(lab)[i] for i in range(n)), key=lambda s: s[1].start)
top = min(s[0].start for s in blobs)
bottom = max(s[0].stop for s in blobs)
wide = max(s[1].stop - s[1].start for s in blobs)
for i, (sy, sx) in enumerate(blobs[:3], 1):
    cx = (sx.start + sx.stop) // 2
    sheet.crop((cx - wide // 2, top, cx + wide // 2, bottom)).save(OUT / f'area1_flame_{i}.webp', quality=90)
fy, fx = np.nonzero(fire & (np.arange(H)[:, None] > 840))
boxes['fire'] = pct((fx.min(), fy.min(), fx.max(), fy.max()))
boxes['flame_aspect'] = round(wide / (bottom - top), 3)

print(json.dumps(boxes))
