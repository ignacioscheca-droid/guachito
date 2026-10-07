"""Contact sheet of cut assets on a two-tone checker so halos and bad crops show up."""
import sys, glob
from pathlib import Path
from PIL import Image, ImageDraw
files = sorted(glob.glob(sys.argv[1]))
out = sys.argv[2]; cell = int(sys.argv[3]) if len(sys.argv) > 3 else 200; cols = int(sys.argv[4]) if len(sys.argv) > 4 else 8
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGBA', (cols * cell, rows * (cell + 18)), (40, 40, 50, 255))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGBA'); im.thumbnail((cell - 10, cell - 10))
    x, y = (i % cols) * cell, (i // cols) * (cell + 18)
    bg = Image.new('RGBA', (cell - 4, cell - 4), (90, 150, 110, 255) if (i // cols + i) % 2 else (70, 110, 170, 255))
    sheet.paste(bg, (x + 2, y + 2))
    sheet.alpha_composite(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))
    d.text((x + 4, y + cell + 2), Path(f).stem, fill=(230, 230, 230, 255))
sheet.save(out)
