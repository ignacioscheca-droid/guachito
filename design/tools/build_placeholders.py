"""Stand-in art for the areas build, made from art we already have.

The build runs on these until ChatGPT's art arrives (brief: the Claude Doc "Gauchito —
Arte para la build"); then each file is replaced with the real one under the same name.

    python3 design/tools/build_placeholders.py

Writes into app/public/a/:
  area2_0.webp          a pampa field (the ride layers), for La chacra
  area3_0.webp          the same field at dusk, for La pulpería
  ui_herradura.webp     a gold horseshoe, the currency
  wear_panuelo_{celeste,amarillo}_{idle,celebrate,avatar}.webp
                        Paucho's red neckerchief recoloured, as overlays for those poses
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
A = ROOT / 'app/public/a'
ASSETS = ROOT / 'guachito_assets'


def save(img: Image.Image, name: str, quality: int = 88):
    img.save(A / f'{name}.webp', quality=quality, method=6)
    print(name, img.size)


def empty_lot():
    """bg_patio without the house: the scenery band mirrored over it, the sky filled in."""
    src = Image.open(A / 'bg_patio.webp').convert('RGB')
    im = np.asarray(src).astype(np.float32)
    H, W, _ = im.shape
    new = im.copy()
    x0, y_sky, y_band, y_end = 600, 150, 380, 848
    for x in range(x0, W):
        k = x - x0
        sx = (x0 - 1 - k) if k < x0 - 150 else 150 + (k - (x0 - 150))
        new[y_band:y_end, x] = im[y_band:y_end, sx]
    row = im[:, 560].copy()
    sky = im[y_sky:y_band, x0:]
    r, g, b = sky[..., 0], sky[..., 1], sky[..., 2]
    skyish = (b > r + 8) | ((r > 225) & (g > 225) & (b > 225))
    fill = np.repeat(row[y_sky:y_band, None, :], W - x0, axis=1)
    new[y_sky:y_band, x0:][~skyish] = fill[~skyish]
    # the cloud the roof cut in half: clear sky on the far right
    for y in range(60, y_band):
        c = im[y, 720] if y < 300 else im[y, 560]
        t = np.clip((np.arange(840, W) - 840) / 80, 0, 1)[:, None]
        new[y, 840:] = new[y, 840:] * (1 - t) + c * t
    res = Image.fromarray(new.clip(0, 255).astype(np.uint8))
    blur = res.filter(ImageFilter.GaussianBlur(1.2))
    m = np.zeros((H, W), np.float32)
    m[y_sky:y_band, x0:][~skyish] = 1
    m[y_band - 4:y_band + 4, x0:] = 1
    res = Image.composite(blur, res, Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)))
    save(res, 'area1_0')

    # the house: wherever the two differ, holes filled, without sky or the fields under the roof
    diff = np.abs(im - np.asarray(res).astype(np.float32)).sum(2)
    mask = Image.fromarray(((diff > 40) * 255).astype(np.uint8))
    mask.paste(0, (0, 0, x0 - 10, H))
    mask = mask.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MinFilter(15)).point(lambda v: 255 if v > 127 else 0)
    ImageDraw.floodfill(mask, (2, 2), 128)
    a = np.asarray(mask.point(lambda v: 0 if v == 128 else 255)).copy()
    a[:140] = 0
    top = im[:y_band]
    sk = (top[..., 2] > top[..., 0] + 8) | ((top[..., 0] > 215) & (top[..., 1] > 215) & (top[..., 2] > 215))
    a[:y_band][sk] = 0
    a[430:, :683] = 0
    alpha = Image.fromarray(a).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    house = src.convert('RGBA')
    house.putalpha(alpha)
    box = alpha.getbbox()
    print('  casita box (% of the patio):', [round(v / W * 100, 2) for v in box])
    save(house.crop(box), 'area1_casita')


def lucero():
    im = Image.open(ASSETS / 'horse/horse_stand.png').convert('RGBA')
    im = im.crop(im.getbbox())
    im.thumbnail((640, 640), Image.LANCZOS)
    save(im, 'area1_corral')


def pampa(name: str, dusk: bool):
    """A square field from the ride layers (sky, sierras, grass), lined up as the ride shows them."""
    sky = Image.open(A / 'ride_bg_sky.webp').convert('RGBA')
    for layer in ('ride_bg_mountains', 'ride_bg_fields'):
        sky.alpha_composite(Image.open(A / f'{layer}.webp').convert('RGBA'))
    side = sky.height
    left = (sky.width - side) // 2
    out = sky.crop((left, 0, left + side, side)).resize((1254, 1254), Image.LANCZOS)
    if dusk:
        out.alpha_composite(Image.new('RGBA', out.size, (255, 160, 100, 56)))
    save(out.convert('RGB'), name)


def herradura():
    im = Image.open(A / 'item_herradura.webp').convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    on = a[..., 3] > 0
    lum = (0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]) / 255
    lum = (lum - lum[on].min()) / (np.ptp(lum[on]) + 1e-6)
    stops = np.array([[120, 66, 10], [214, 140, 30], [246, 190, 64], [255, 236, 160]], np.float32)
    t = np.clip(lum, 0, 1) * 3
    i = np.minimum(t.astype(int), 2)
    f = (t - i)[..., None]
    rgb = stops[i] * (1 - f) + stops[i + 1] * f
    save(Image.fromarray(np.dstack([rgb, a[..., 3]]).astype(np.uint8)).resize((256, 256), Image.LANCZOS), 'ui_herradura')


NECKERCHIEF = {'celeste': (205, 0.55, 1.08), 'amarillo': (46, 0.78, 1.12)}


def neckerchiefs():
    """Paucho's red neckerchief in other colours: the biggest red patch of each pose, re-hued."""
    for pose in ('idle', 'celebrate', 'avatar'):
        im = Image.open(A / f'g_{pose}.webp').convert('RGBA')
        hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(np.float32)
        alpha = np.asarray(im)[..., 3]
        h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
        red = ((h < 14) | (h > 242)) & (s > 165) & (v > 115) & (alpha > 0)
        red = ndimage.binary_opening(red, iterations=2)
        lab, n = ndimage.label(red)
        if n == 0:
            continue
        sizes = ndimage.sum(red, lab, range(1, n + 1))
        keep = lab == (int(np.argmax(sizes)) + 1)
        keep = ndimage.binary_closing(keep, iterations=3)
        # take in the dark creases and the anti-aliased edge around it
        grown = ndimage.binary_dilation(keep, iterations=2) & (((h < 20) | (h > 236)) & (s > 60)) & (alpha > 0)
        keep = keep | grown
        for name, (hue, sat, light) in NECKERCHIEF.items():
            out = hsv.copy()
            out[..., 0] = hue / 360 * 255
            out[..., 1] = np.clip(s * sat, 0, 255)
            out[..., 2] = np.clip(v * light, 0, 255)
            rgb = Image.fromarray(out.astype(np.uint8), 'HSV').convert('RGB')
            layer = np.dstack([np.asarray(rgb), np.where(keep, alpha, 0)]).astype(np.uint8)
            save(Image.fromarray(layer, 'RGBA'), f'wear_panuelo_{name}_{pose}')


if __name__ == '__main__':
    pampa('area2_0', dusk=False)
    pampa('area3_0', dusk=True)
    herradura()
    neckerchiefs()
