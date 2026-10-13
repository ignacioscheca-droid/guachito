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

import numpy as np
from PIL import Image
from scipy import ndimage

from area_layers import OUT, SRC, H, W, changed, feather, fill_from_neighbours, mask_box, pct, rgb, save_cut, sky_alpha

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
    # the cut-outs keep the sky transparent, so the clouds stay behind them
    al = feather(m, 6)
    after = al * sky_alpha(stages[k]).astype(np.float32) / 255
    before = al * sky_alpha(stages[k - 1]).astype(np.float32) / 255
    # pile and obra share one box, so the transition swaps them in place
    boxes[f'obra_{name}'] = save_cut(stages[k], after, f'area1_obra_{name}', mask_box(al))
    boxes[f'pila_{name}'] = save_cut(stages[k - 1], before, f'area1_pila_{name}', mask_box(al))

# --- the stages as scenes: trees and (built) fire taken out, sky cut away
house = obra_masks['casa']
for k, st in enumerate(stages):
    c = st.copy()
    tf = feather(trees, 2)[..., None]
    behind = no_trees.copy()
    if k == 0:
        # behind the trees, no_trees shows the casa's edges: there is no casa yet, so fill
        # those few pixels from the nearest bit of stage 0 that isn't tree or casa
        behind = fill_from_neighbours(st, trees & house, ~(trees | house)) * (trees & house)[..., None] + behind * ~(trees & house)[..., None]
    c = c * (1 - tf) + behind * tf
    if k >= 2:
        ff = feather(fire, 2)[..., None]
        c = c * (1 - ff) + fire_out * ff
    alpha = sky_alpha(c)
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
