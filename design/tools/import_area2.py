"""Área 2 (El galpón) for the app, from ChatGPT's art (local only, in arte_build/area2_assets/):

  area2_etapa0..2.png, area2_v2.png   the four stages (piles → cucha, galpón, gallinero built)
  area2_plano_limpio.png              area2_v2 without clouds, trees, veleta, clothes, hens
  area2_animados.png                  veleta (side, front), poncho, bombachas, the two hens
                                      standing and pecking, three clouds
  paucho_gallinas.png                 Paucho throwing maize (his thing to do here)

    python3 design/tools/import_area2.py

Writes into app/public/a/:
  area2_sky.webp, area2_scene_K.webp, area2_tree_l/r.webp, area2_cloud_1..3.webp,
  area2_ropa_1/2.webp, area2_veleta_side/front.webp, area2_gallina_{blanca,colorada}_{parada,pica}.webp,
  area2_obra_X.webp + area2_pila_X.webp, area2_etapa0.webp, paucho_maiz.webp

Prints the boxes (in % of the art) for AREAS[1] in app/src/game/journey.ts.
"""

import json

import numpy as np
from PIL import Image
from scipy import ndimage

from area_layers import OUT, SRC, H, W, changed, feather, fill_from_neighbours, mask_box, pct, rgb, save_cut, sheet_sprites, sky_alpha

D = SRC / 'area2_assets'
stages = [rgb(D / f'area2_etapa{k}.png') for k in range(3)] + [rgb(D / 'area2_v2.png')]
plate = rgb(D / 'area2_plano_limpio.png')
final = stages[3]
boxes = {}

# --- what moves: where the finished art and its clean plate differ, one blob at a time
moving = changed(final, plate, min_size=300, grow=3)
lab, n = ndimage.label(moving)
r, g, b = final[..., 0], final[..., 1], final[..., 2]
cloudish = ((r > 185) & (g > 195) & (b > 205)) | ((b > r + 40) & (b > 200))


def blob_at(x, y):
    return lab == lab[y, x]


# the trees come out of the same blobs as the clouds behind them: keep the green and brown
trees = moving & ~cloudish & (np.arange(H)[:, None] < 440)
trees = ndimage.binary_fill_holes(ndimage.binary_closing(ndimage.binary_opening(trees, iterations=2), iterations=4))
tl = np.zeros_like(trees)
tl[:, : W // 2] = trees[:, : W // 2]
tr = np.zeros_like(trees)
tr[:, W // 2 :] = trees[:, W // 2 :]
for side, t in (('l', tl), ('r', tr)):
    lt, _ = ndimage.label(t)
    sizes = np.bincount(lt.ravel())[1:]
    keep = lt == (np.argmax(sizes) + 1)
    boxes[f'tree_{side}'] = save_cut(final, feather(ndimage.binary_dilation(keep, iterations=2), 1.5), f'area2_tree_{side}')
trees = tl | tr

veleta = blob_at(614, 160)
ropa = blob_at(840, 530)
hens = blob_at(680, 870) | blob_at(880, 880)

# the clothes, each piece on its own to swing from the line: just the cloth, no background
cloth = ropa & ndimage.binary_opening(np.abs(final - plate).sum(2) > 45, iterations=1) & ~(g > r + 8)
ropa_tight = ndimage.binary_erosion(ndimage.binary_fill_holes(ndimage.binary_closing(cloth, iterations=3)), iterations=1)
ys, xs = np.nonzero(ropa)
cols = ropa.sum(0)
mid = xs.min() + int(np.argmin(cols[xs.min() + 40 : xs.max() - 40])) + 40
for i, (x0, x1) in enumerate(((0, mid), (mid, W)), 1):
    piece = np.zeros_like(ropa)
    piece[:, x0:x1] = ropa_tight[:, x0:x1]
    boxes[f'ropa_{i}'] = save_cut(final, feather(piece, 0.8), f'area2_ropa_{i}')

boxes['veleta'] = pct((lambda yy, xx: (xx.min(), yy.min(), xx.max(), yy.max()))(*np.nonzero(veleta)))
for name, (x, y) in (('hen_1', (680, 870)), ('hen_2', (880, 880))):
    yy, xx = np.nonzero(blob_at(x, y))
    boxes[name] = pct((xx.min(), yy.min(), xx.max(), yy.max()))

# --- the obras: their pile (stage k-1) and themselves (stage k), cut from the scenes below
obra_masks = {}
for k, name in ((1, 'cucha'), (2, 'galpon'), (3, 'gallinero')):
    obra_masks[name] = changed(stages[k - 1], stages[k], min_size=1500)

# --- the stages as scenes: what moves taken out (the clean plate behind it), sky cut away
galpon = obra_masks['galpon']
scenes = []
for k, st in enumerate(stages):
    c = st.copy()
    out = trees | ropa | (veleta if k >= 2 else np.zeros_like(trees)) | (hens if k >= 3 else np.zeros_like(trees))
    behind = plate.copy()
    if k < 2:
        # behind the trees the plate shows the galpón's roof: not built yet, so take those
        # pixels from the nearest bit of this stage that is neither tree nor galpón
        hole = out & galpon
        behind[hole] = fill_from_neighbours(st, hole, ~(out | galpon))[hole]
    f = feather(out, 2)[..., None]
    c = c * (1 - f) + behind * f
    sa = sky_alpha(c, horizon=440, cloud_line=270)
    scenes.append((c, sa.astype(np.float32) / 255))
    Image.fromarray(np.dstack([c.astype(np.uint8), sa]), 'RGBA').save(OUT / f'area2_scene_{k}.webp', quality=86)

# (the cut-outs keep the scene's sky transparent, so the clouds stay behind them)
for k, name in ((1, 'cucha'), (2, 'galpon'), (3, 'gallinero')):
    al = feather(obra_masks[name], 6)
    # pile and obra share one box, so the transition swaps them in place
    boxes[f'obra_{name}'] = save_cut(scenes[k][0], al * scenes[k][1], f'area2_obra_{name}', mask_box(al))
    boxes[f'pila_{name}'] = save_cut(scenes[k - 1][0], al * scenes[k - 1][1], f'area2_pila_{name}', mask_box(al))

Image.fromarray(plate[:440].astype(np.uint8)).save(OUT / 'area2_sky.webp', quality=90)
Image.fromarray(stages[0].astype(np.uint8)).save(OUT / 'area2_etapa0.webp', quality=86)

# --- the sprite sheet: veleta (side, front), poncho, bombachas, hens standing/pecking, clouds
sheet, pieces = sheet_sprites(D / 'area2_animados.png', grow=4)
pieces.sort(key=lambda p: (round(p[1] / 120), p[0]))
names = ['veleta_front', 'veleta_side', 'poncho', 'bombachas', 'gallina_blanca_parada', 'gallina_blanca_pica', 'gallina_colorada_parada', 'gallina_colorada_pica']
for name, box in zip(names, pieces[:8]):
    if name in ('poncho', 'bombachas'):
        continue
    sheet.crop(box).save(OUT / f'area2_{name}.webp', quality=90)
    boxes[f'sprite_{name}'] = [box[2] - box[0], box[3] - box[1]]
clouds = sorted(pieces[8:11], key=lambda p: -(p[2] - p[0]))
for i, box in enumerate(clouds, 1):
    c = sheet.crop(box)
    w = (330, 250, 170)[i - 1]
    c.resize((w, round(c.height * w / c.width)), Image.LANCZOS).save(OUT / f'area2_cloud_{i}.webp', quality=90)
    boxes[f'cloud_{i}'] = [round(w / W * 100, 2)]

# --- Paucho throwing maize, cropped to himself
p = Image.open(D / 'paucho_gallinas.png').convert('RGBA')
pb = p.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
p = p.crop(pb)
p.thumbnail((700, 700), Image.LANCZOS)
p.save(OUT / 'paucho_maiz.webp', quality=90)
boxes['paucho_maiz_aspect'] = round(p.width / p.height, 3)

print(json.dumps(boxes))
