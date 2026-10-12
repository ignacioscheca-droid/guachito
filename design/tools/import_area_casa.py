"""Layers for Área 1 (the casa v2, ChatGPT art in arte_build/area_casa_v2.webp).

The app draws the area in layers so it can feel alive:
  area1_sky.webp       the sky without clouds (a gradient rebuilt from the art's own sky)
  area1_cloud_N.webp   the art's clouds, cut out (their hidden bases filled), to drift slowly
  area1_scene.webp     the art with its sky made transparent: house, trees, sierras, ground
  area1_obra_X.webp    each obra cut out, drawn faded on top while it isn't built yet

    python3 design/tools/import_area_casa.py

Prints each cut-out's box in % of the art, for AREAS[0] in app/src/game/journey.ts.
"""

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from scipy.spatial import ConvexHull

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'arte_build/area_casa_v2.webp'
OUT = ROOT / 'app/public/a'

im = Image.open(SRC).convert('RGB')
W, H = im.size
a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
yy = np.arange(H)[:, None].repeat(W, 1)

# --- sky and clouds: blue sky, plus the white/pale clouds above the chimneys, reached from the top
# (the sierras are blue too, but greyer: sky has g - r above ~55, the sierras below ~45)
blue = (b > 225) & (g - r > 52) & (yy < 330)
pale = (((r > 170) & (g > 195) & (b > 210)) | ((b > 240) & (g > 190))) & (yy < 215)
skyish = blue | pale
lab, _ = ndimage.label(skyish)
top_labels = set(np.unique(lab[:3, :])) - {0}
sky = np.isin(lab, list(top_labels))
sky = ndimage.binary_closing(sky, iterations=1)

# the rebuilt sky: per row, the median of the pure blue pixels
pure = blue & ~pale
rows = []
for y in range(330):
    px = a[y][pure[y]]
    rows.append(np.median(px, 0) if len(px) > 20 else rows[-1])
grad = np.array(rows, np.float32)
sky_img = np.repeat(grad[:, None, :], W, 1)
Image.fromarray(sky_img.astype(np.uint8)).save(OUT / 'area1_sky.webp', quality=90)

# the scene: the art minus its sky
alpha = np.where(sky, 0, 255).astype(np.uint8)
alpha = np.asarray(Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)))
scene = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), 'RGBA')
scene.save(OUT / 'area1_scene.webp', quality=88)

# clouds: how far each pale pixel is from the sky colour of its row, as alpha
sky_r = grad[:, 0][:, None]
t = np.clip((r[:330] - sky_r) / (250 - sky_r), 0, 1)
cloud_alpha = np.where(sky[:330], t, 0)
boxes = {}
for n, (x0, y0, x1, y1) in enumerate([(0, 80, 260, 215), (700, 75, 1024, 235)], 1):
    al = cloud_alpha[y0:y1, x0:x1].copy()
    rgb = a[y0:y1, x0:x1].copy()
    body = al > 0.35
    # the part of the cloud hidden behind trees and sierras: inside the cloud's outline
    # (its convex hull) and where the scene is opaque; filled with the cloud's base colour
    ys, xs = np.nonzero(body)
    if len(xs) > 3:
        hull = ConvexHull(np.c_[xs, ys])
        hm = Image.new('L', (al.shape[1], al.shape[0]), 0)
        ImageDraw.Draw(hm).polygon([(int(xs[v]), int(ys[v])) for v in hull.vertices], fill=255)
        # only behind the tree crowns (green); behind the sierras the cloud stays as drawn
        crowns = (g[y0:y1, x0:x1] > r[y0:y1, x0:x1] + 25) & (g[y0:y1, x0:x1] > b[y0:y1, x0:x1])
        hidden = (np.asarray(hm) > 0) & crowns & ~body
        low = body & (ys.max() - np.arange(al.shape[0])[:, None] < 25)
        shade = rgb[low].mean(0) if low.any() else rgb[body].mean(0)
        al[hidden] = 1
        rgb[hidden] = shade
    sprite = Image.fromarray(np.dstack([rgb.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')
    bb = sprite.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    sprite = sprite.crop(bb)
    sprite.save(OUT / f'area1_cloud_{n}.webp', quality=90)
    boxes[f'cloud_{n}'] = [round((x0 + bb[0]) / W * 100, 2), round((y0 + bb[1]) / H * 100, 2), round(sprite.width / W * 100, 2)]

# --- the obras: a polygon around each, minus the bare dirt and the sky
hsv = np.asarray(im.convert('HSV')).astype(np.float32)
hue, sat, val = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
dirt = (hue > 18) & (hue < 42) & (sat > 0.55) & (val > 0.8)
OBRAS = {
    'casa': [(0, 415), (150, 330), (255, 300), (255, 222), (342, 222), (342, 296), (710, 296), (710, 228), (802, 228), (802, 318), (880, 340), (1024, 400), (1024, 752), (0, 752)],
    'fogon': [(15, 785), (480, 785), (480, 985), (15, 985)],
    'aljibe': [(715, 690), (1024, 690), (1024, 1000), (715, 1000)],
}
# boxes kept whole: the guitar's wood is the colour of the ground
KEEP = {'fogon': [[(378, 812), (396, 808), (412, 870), (440, 890), (456, 935), (448, 970), (420, 980), (390, 975), (378, 940), (385, 890), (392, 870)]]}
for name, poly in OBRAS.items():
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    inside = np.asarray(m) > 0
    # bare ground: dirt reachable from the polygon's edge (wood inside the obra stays)
    lab, _ = ndimage.label(dirt & inside)
    edge = inside & ~ndimage.binary_erosion(inside, iterations=3)
    ground = np.isin(lab, list(set(np.unique(lab[edge])) - {0}))
    # the trees' crowns behind the roof are not part of the house
    crowns = (g > r + 30) & (g > b) & (yy < 420)
    mask = inside & ~sky & ~ground & ~crowns
    for poly2 in KEEP.get(name, []):
        k = Image.new('L', (W, H), 0)
        ImageDraw.Draw(k).polygon(poly2, fill=255)
        mask |= np.asarray(k) > 0
    mask = ndimage.binary_opening(mask, iterations=2)
    mask = ndimage.binary_fill_holes(ndimage.binary_closing(mask, iterations=3))
    al = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))
    cut = Image.fromarray(np.dstack([a.astype(np.uint8), al]), 'RGBA')
    bb = Image.fromarray(al).point(lambda v: 255 if v > 10 else 0).getbbox()
    cut.crop(bb).save(OUT / f'area1_obra_{name}.webp', quality=88)
    boxes[name] = [round(bb[0] / W * 100, 2), round(bb[1] / H * 100, 2), round((bb[2] - bb[0]) / W * 100, 2)]

print(json.dumps(boxes))
