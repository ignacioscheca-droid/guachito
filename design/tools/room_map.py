"""The map of Paucho's room for ChatGPT: where each slot goes, drawn over a greybox of the
reference room (kit_build/16_cuarto_referencia.png, same camera).

    python3 design/tools/room_map.py      → kit_build/17_cuarto_mapa.png

SLOTS is also what the room importer uses to tell the pieces apart, so keep the two in step.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
W, H = 1024, 1536

# slot: number, name on the map, box (left, top, right, bottom) in px of the 1024 × 1536 art, kind
# kind: floor / wall pieces come in the room edits; 'sprite' ones come loose on a sheet
SLOTS = [
    (1, 'Cama', (0, 410, 440, 900), 'floor'),
    (2, 'Bajo la ventana', (435, 455, 695, 665), 'floor'),
    (3, 'Mesa', (690, 520, 1024, 840), 'floor'),
    (4, 'Sobre la mesa', (745, 455, 1000, 560), 'sprite'),
    (5, 'Asiento', (700, 880, 1024, 1160), 'floor'),
    (6, 'Pie de la cama', (0, 910, 180, 1120), 'floor'),
    (7, 'Calzado', (215, 925, 345, 1000), 'floor'),
    (8, 'Alfombra', (370, 1000, 690, 1190), 'floor'),
    (9, 'Plato del perro', (205, 1110, 330, 1185), 'floor'),
    (10, 'Cortinas', (385, 105, 710, 450), 'wall'),
    (11, 'Alféizar', (470, 330, 635, 425), 'wall'),
    (12, 'Estante', (60, 85, 390, 215), 'wall'),
    (13, 'Pared sobre la cama', (110, 250, 400, 405), 'wall'),
    (14, 'Reloj', (715, 85, 850, 290), 'wall'),
    (15, 'Cuadro', (710, 300, 850, 425), 'wall'),
    (16, 'Perchero', (880, 120, 1020, 500), 'wall'),
]
PAUCHO = (440, 640, 640, 1130)
DOG = (250, 1040, 420, 1105)
UNDER_SHOP = 1265  # below this the shop sheet covers the room

COLORS = {'floor': (226, 120, 60), 'wall': (60, 130, 200), 'sprite': (150, 90, 190)}


def font(size):
    return ImageFont.truetype('/System/Library/Fonts/SFNSRounded.ttf', size)


def main():
    im = Image.new('RGB', (W, H), (236, 228, 214))
    d = ImageDraw.Draw(im, 'RGBA')
    # the room, as greybox: ceiling with beams, back wall, right wall, floor, window, shelf, light
    d.rectangle((0, 0, W, 85), fill=(170, 150, 128))
    for x in (60, 300, 540, 780):
        d.rectangle((x, 0, x + 60, 85), fill=(140, 118, 96))
    d.polygon([(0, 85), (900, 85), (900, 668), (0, 668)], fill=(232, 222, 205))
    d.polygon([(900, 85), (W, 40), (W, 720), (900, 668)], fill=(218, 206, 188))
    d.polygon([(0, 668), (900, 668), (W, 720), (W, H), (0, H)], fill=(214, 170, 120))
    d.rectangle((420, 130, 680, 425), fill=(170, 205, 235), outline=(140, 110, 80), width=8)
    d.rectangle((410, 425, 690, 448), fill=(170, 130, 90))
    d.rectangle((60, 212, 390, 228), fill=(170, 130, 90))
    d.polygon([(450, 680), (690, 680), (730, 790), (420, 790)], fill=(255, 236, 190, 110))

    small, mid, big = font(22), font(26), font(40)

    def dashed(box, color, label):
        x0, y0, x1, y1 = box
        for x in range(x0, x1, 24):
            d.line([(x, y0), (min(x + 12, x1), y0)], fill=color, width=5)
            d.line([(x, y1), (min(x + 12, x1), y1)], fill=color, width=5)
        for y in range(y0, y1, 24):
            d.line([(x0, y), (x0, min(y + 12, y1))], fill=color, width=5)
            d.line([(x1, y), (x1, min(y + 12, y1))], fill=color, width=5)
        d.multiline_text(((x0 + x1) / 2, y0 + 16 if y1 - y0 < 100 else y0 + 60), label, font=small, fill=color, anchor='ma', align='center')

    # the free spots first, so the slots' labels stay on top
    dashed(PAUCHO, (40, 90, 170), 'Lugar libre\n(el gaucho\nse para acá)')
    dashed(DOG, (40, 90, 170), 'Perro')
    for n, name, (x0, y0, x1, y1), kind in SLOTS:
        if kind == 'sprite':
            continue  # loose pieces: not drawn in the room, so not on the map
        c = COLORS[kind]
        d.rounded_rectangle((x0 + 2, y0 + 2, x1 - 2, y1 - 2), 14, fill=c + (52,), outline=c + (255,), width=5)
        d.ellipse((x0 + 10, y0 + 10, x0 + 58, y0 + 58), fill=c + (255,))
        d.text((x0 + 34, y0 + 34), str(n), font=mid, fill='white', anchor='mm')
        tw = d.textlength(name, font=small)
        if x0 + 66 + tw < x1 - 6:
            d.text((x0 + 66, y0 + 34), name, font=small, fill=(40, 30, 20), anchor='lm')
        elif y1 - y0 > 120:
            lines, line = [], ''
            for word in name.split():
                if line and d.textlength(f'{line} {word}', font=small) > x1 - x0 - 20:
                    lines.append(line)
                    line = word
                else:
                    line = f'{line} {word}'.strip()
            d.multiline_text((x0 + 12, y0 + 66), '\n'.join(lines + [line]), font=small, fill=(40, 30, 20), spacing=2)
        else:
            # too small for its name: write it just under the box
            d.text((x0 + 6, y1 + 6), name, font=small, fill=(40, 30, 20))

    d.rectangle((0, UNDER_SHOP, W, H), fill=(120, 110, 100, 90))
    d.text((W / 2, (UNDER_SHOP + H) / 2), 'Tapado por la tienda: piso vacío', font=big, fill=(60, 50, 40), anchor='mm')

    out = ROOT / 'kit_build/17_cuarto_mapa.png'
    im.save(out)
    print(out)


if __name__ == '__main__':
    main()
