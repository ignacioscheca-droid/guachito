"""Paucho's room for the app, from ChatGPT's art (local only, in arte_build/cuarto/; brief:
Claude Doc "Gauchito — El cuarto de Paucho: todo el arte"):

  cuarto_vacio.png               the empty room (the background)
  cuarto_1/2/3.png               the same room with option 1, 2 or 3 in every slot
  cuarto_sueltos.png             mate, truco cards, the notebook, the pendulum, three notes
  paucho_cuarto(_ojos).png       Paucho standing, celebrating, pointing (and with eyes closed)
  animales_cuarto(_ojos).png     Michi sitting and asleep, the dog lying (tail one way, the
                                 other) and asleep (and with eyes closed)
  iconos_cuarto.png              twelve UI icons

    python3 design/tools/import_room.py

Each piece is where its room edit differs from the empty one, inside its slot's region
(REGIONS: the edits re-render the whole room a little, and neighbours touch through the
sunlight and the skirting, so the regions keep them apart). Writes into app/public/a/ and
writes their boxes to app/src/game/roomArt.ts.
"""

import json

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

from area_layers import OUT, ROOT, SRC, H, W, feather, pct, rgb, sheet_sprites

D = SRC / 'cuarto'

# Where each slot's piece may be, per option: rectangles (l, t, r, b) or polygons [(x, y), …].
# Earlier slots win where regions overlap.
REGIONS = {
    'estante': {1: [(30, 60, 400, 232), (60, 232, 145, 390)], 2: [(30, 60, 400, 232)], 3: [(30, 50, 400, 232)]},
    'pared': {1: [(145, 290, 400, 420)], 2: [(100, 240, 280, 465)], 3: [(120, 245, 280, 395)]},
    'alfeizar': {1: [(455, 320, 560, 432)], 2: [(462, 320, 520, 405)]},
    'cortinas': {k: [(375, 100, 700, 450)] for k in (1, 2, 3)},
    'reloj': {1: [(715, 80, 860, 305)], 2: [(715, 80, 860, 262)], 3: [(715, 80, 860, 305)]},
    'cuadro': {1: [(715, 310, 840, 440)], 2: [(712, 265, 852, 405)], 3: [(700, 305, 872, 472)]},
    'perchero': {k: [(872, 115, 1024, 525)] for k in (1, 2, 3)},
    'cama': {
        1: [(0, 455, 372, 795), (0, 795, 258, 832)],
        2: [[(0, 455), (412, 455), (412, 700), (205, 792), (215, 880), (0, 880)]],
        3: [(0, 398, 378, 785), (0, 785, 234, 848)],
    },
    'ventana_bajo': {k: [(400, 446, 692, 690)] for k in (1, 2, 3)},
    'asiento': {1: [(778, 758, 980, 972)], 2: [(905, 745, 1012, 968), (852, 815, 1012, 968)], 3: [(748, 818, 1024, 1108)]},
    'mesa': {1: [(682, 495, 1015, 758)], 2: [(660, 510, 1024, 818)], 3: [(686, 515, 1024, 818)]},
    'pie': {1: [(0, 842, 162, 1003)], 2: [(0, 828, 132, 948)], 3: [(0, 795, 188, 982)]},
    'calzado': {1: [(234, 798, 378, 898)], 2: [[(205, 792), (412, 700), (412, 815), (354, 815), (354, 872), (210, 872)]], 3: [(188, 780, 372, 948)]},
    'plato': {1: [(192, 928, 338, 1028)], 2: [(143, 872, 304, 990)], 3: [(156, 998, 348, 1098)]},
    'alfombra': {1: [(328, 858, 818, 1062)], 2: [(306, 822, 728, 982)], 3: [(352, 806, 704, 1018)]},
}


def region_mask(shapes):
    im = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(im)
    for s in shapes:
        if isinstance(s, tuple):
            d.rectangle(s, fill=255)
        else:
            d.polygon(s, fill=255)
    return np.asarray(im) > 0


def piece_mask(room, empty, region, thr=45):
    """The thing an edit added inside `region`: where it differs from the empty room, once the
    region's own shift in light is taken out, filled from its outline inwards."""
    ring = region & ~ndimage.binary_erosion(region, iterations=4)
    shift = np.median((room - empty)[ring], axis=0)
    diff = np.abs(room - shift - empty).sum(2) > thr
    m = ndimage.binary_opening(diff & region, iterations=1)
    lab, n = ndimage.label(m)
    if not n:
        return m, None
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > max(120, sizes.max() * 0.02)])
    m = ndimage.binary_closing(m, iterations=5) & region
    # inside = what the background can't reach from the region's edge (the image's own edge
    # doesn't count: the bed runs off it)
    edge = ring.copy()
    edge[:, :2] = edge[:, -2:] = False
    outside = ndimage.binary_propagation(edge & ~m, mask=region & ~m)
    m = region & ~outside
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > max(300, sizes.max() * 0.03)])
    m = ndimage.binary_dilation(m, iterations=2) & region
    # inside the piece, what still looks like the empty room (the wall between the bars of a
    # headboard, a pale shadow) fades out: under every piece there is always the empty room
    near = np.clip((np.abs(room - shift - empty).sum(2) - 14) / 30, 0, 1)
    near = ndimage.grey_dilation(near, size=3)
    return m, near


def cut_rooms(boxes):
    empty = rgb(D / 'cuarto_vacio.png')
    Image.fromarray(empty.astype(np.uint8)).save(OUT / 'room_base.webp', quality=86)
    for k in (1, 2, 3):
        room = rgb(D / f'cuarto_{k}.png')
        taken = np.zeros((H, W), bool)
        for slot, by_k in REGIONS.items():
            if k not in by_k:
                continue
            region = region_mask(by_k[k]) & ~taken
            m, near = piece_mask(room, empty, region)
            if not m.any():
                print('nothing in', slot, k)
                continue
            taken |= m
            a = (feather(m, 1.6) * near * 255).astype(np.uint8)
            box = Image.fromarray(a).point(lambda v: 255 if v > 8 else 0).getbbox()
            Image.fromarray(np.dstack([room.astype(np.uint8), a]), 'RGBA').crop(box).save(OUT / f'room_{slot}_{k}.webp', quality=88)
            boxes[f'{slot}_{k}'] = pct(box)
            # the shop's thumbnail: a square photo of the piece in its own room
            x0, y0, x1, y1 = box
            side = max(x1 - x0, y1 - y0) * 1.12
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            l, t_ = max(0, min(W - side, cx - side / 2)), max(0, min(H - side, cy - side / 2))
            t = Image.fromarray(room.astype(np.uint8)).crop((round(l), round(t_), round(l + side), round(t_ + side)))
            t = t.resize((200, 200), Image.LANCZOS)
            t.save(OUT / f'thumb_{slot}_{k}.webp', quality=86)


def figures(path, grow=6, min_area=4000):
    """The figures of a sheet: (box, mask) each, the mask so a box that overlaps a neighbour's
    doesn't bring a piece of it along."""
    sheet = Image.open(path).convert('RGBA')
    lab, _ = ndimage.label(ndimage.binary_dilation(np.asarray(sheet)[..., 3] > 20, iterations=grow))
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        box = (sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)
        if (box[2] - box[0]) * (box[3] - box[1]) > min_area:
            out.append((box, lab == i))
    return sheet, out


def only(sheet, box, mask):
    a = np.asarray(sheet).copy()
    a[..., 3] = np.where(mask, a[..., 3], 0)
    return Image.fromarray(a, 'RGBA').crop(box)


def crop_pair(name, out_names, order):
    """Figures of a sheet and of its eyes-closed edit, cut with the same box and mask so they
    stay aligned."""
    sheet, figs = figures(D / f'{name}.png')
    eyes = Image.open(D / f'{name}_ojos.png').convert('RGBA')
    sizes = {}
    for (box, mask), out in zip(order(figs), out_names):
        only(sheet, box, mask).save(OUT / f'{out}.webp', quality=90)
        only(eyes, box, ndimage.binary_dilation(mask, iterations=4)).save(OUT / f'{out}_ojos.webp', quality=90)
        sizes[out] = [box[2] - box[0], box[3] - box[1]]
    return sizes


def rows(pieces, row_h=200):
    """Boxes (or (box, mask) figures) in reading order."""
    box = lambda p: p[0] if isinstance(p[0], tuple) else p
    return sorted(pieces, key=lambda p: (round(((box(p)[1] + box(p)[3]) / 2) / row_h), box(p)[0]))


def main():
    boxes = {}
    cut_rooms(boxes)

    # loose pieces: what goes on the table, the pendulum, the notes
    sheet, pieces = sheet_sprites(D / 'cuarto_sueltos.png', grow=8)
    pieces = rows([p for p in pieces if (p[2] - p[0]) * (p[3] - p[1]) > 600], 220)
    print('sueltos', pieces)
    for box, out in zip(pieces, ['room_top_mate', 'room_top_cartas', 'room_top_libreta', 'room_pendulo', 'room_nota_1', 'room_nota_2', 'room_nota_3']):
        sheet.crop(box).save(OUT / f'{out}.webp', quality=90)
        boxes[out] = [box[2] - box[0], box[3] - box[1]]

    boxes.update(crop_pair('paucho_cuarto', ['paucho_room_parado', 'paucho_room_festeja', 'paucho_room_senala'], lambda f: sorted(f, key=lambda b: b[0][0])))
    boxes.update(crop_pair('animales_cuarto', ['michi_sentado', 'michi_duerme', 'perro_room_a', 'perro_room_b', 'perro_room_duerme'], lambda f: rows(f, 400)))

    # icons: a 3 × 4 grid
    sheet, pieces = sheet_sprites(D / 'iconos_cuarto.png', grow=6)
    pieces = rows([p for p in pieces if (p[2] - p[0]) * (p[3] - p[1]) > 4000], 300)
    names = ['ui_herradura', 'ui_premium', 'ui_candado', 'ui_puesto', 'ui_tab_cama', 'ui_tab_mesa', 'ui_tab_pared', 'ui_tab_ventana', 'ui_tab_piso', 'ui_viaje', 'ui_amistad', 'ui_bolsa']
    print('icons', len(pieces))
    for box, out in zip(pieces, names):
        ic = sheet.crop(box)
        ic.thumbnail((256, 256), Image.LANCZOS)
        ic.save(OUT / f'{out}.webp', quality=90)

    rooms = {k: v for k, v in boxes.items() if not k.startswith(('room_', 'paucho_', 'michi_', 'perro_'))}
    sizes = {k: v for k, v in boxes.items() if k not in rooms}
    (ROOT / 'app/src/game/roomArt.ts').write_text(
        '// Written by design/tools/import_room.py: where each cut-out sits in the room art\n'
        '// (left, top, width, height in % of 1024 × 1536) and each loose sprite\'s size in px.\n\n'
        f'export const ROOM_BOXES: Record<string, [number, number, number, number]> = {json.dumps(rooms)}\n\n'
        f'export const SPRITE_PX: Record<string, [number, number]> = {json.dumps(sizes)}\n'
    )
    print(json.dumps(sizes))


if __name__ == '__main__':
    main()
