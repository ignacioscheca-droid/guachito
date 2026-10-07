"""Turn the artist's delivery (guachito_assets/) into web-ready art in app/public/a/.

- Character and dog poses: every pose is shifted so its lowest pixel sits on the
  baseline, then all are cropped with ONE shared box, so they swap in place.
- Ride: the separate rider is scaled onto each gallop frame, tracking the saddle.
- Items and icons: trimmed (icons padded square) and downsized.
- Illustrations and backgrounds: recompressed.
Everything is WebP (alpha kept) to keep the phone download small.

Usage: python3 design/tools/import_assets.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "guachito_assets"
OUT = ROOT / "app/public/a"

POSES = ["idle", "jump", "celebrate", "wave", "thumbs", "mate", "sleep", "think", "surprised", "sad", "map", "pet"]
POSE_BOX = (420, 590, 1628, 1910)  # shared crop after the baseline fix (2048 canvas)
POSE_SCALE = 0.75
BASELINE = 1900

DOGS = ["sit", "happy", "sleep", "belly", "wave", "run_1", "run_2", "run_3", "run_4"]
DOG_BOX = (160, 340, 880, 970)
DOG_SCALE = 0.6
DOG_BASELINE = 960

RIDE_BOX = (880, 640, 2180, 1910)  # 3072 x 2048 canvas
RIDE_SCALE = 0.5
RIDER_SCALE = 0.62
SADDLE_REF = (1547, 1431)  # saddle top in horse_gallop_2.png

HABIT_ICONS = ["agua", "ejercicio", "fruta", "dormir", "meditar", "foco", "leer", "mate", "plantas", "sol", "cocinar", "pantallas"]
ITEMS = ["herradura", "planta", "farol", "mesa", "silla", "alfombra", "barril", "guitarra", "fogon", "sillon",
         "fogon_base", "fogon_flame_1", "fogon_flame_2", "fogon_flame_3"]


def rgba(path):
    return Image.open(path).convert("RGBA")


def save(img, name, quality=86):
    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / f"{name}.webp", "WEBP", quality=quality, method=6)


def lowest_row(img):
    a = np.array(img)[..., 3]
    return int(np.where(a.max(axis=1) > 16)[0].max())


def on_baseline(img, baseline):
    """Shift the image vertically so its lowest opaque pixel lands on baseline."""
    dy = baseline - lowest_row(img)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.alpha_composite(img, (0, dy)) if dy >= 0 else out.alpha_composite(img.crop((0, -dy, img.width, img.height)), (0, 0))
    return out


def crop_scale(img, box, scale):
    c = img.crop(box)
    return c.resize((round(c.width * scale), round(c.height * scale)), Image.LANCZOS)


def trim(img, pad=0):
    l, t, r, b = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    return img.crop((max(0, l - pad), max(0, t - pad), min(img.width, r + pad), min(img.height, b + pad)))


def fit(img, max_side):
    s = min(1, max_side / max(img.size))
    return img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS) if s < 1 else img


def gray_small(img, k=4):
    bg = Image.new("RGBA", img.size, (128, 128, 128, 255))
    bg.alpha_composite(img)
    return np.array(bg.convert("L").reduce(k)).astype(np.float32)


def find_saddle(frame, ref_patch, k=4, search=25):
    """Locate the saddle patch (from frame 2) in another gallop frame by SSD search,
    over a few scales: the artist's frames are not all drawn at the same size.
    Returns (x, y, scale) with scale = how much bigger this frame's horse is."""
    best = None
    ph, pw = ref_patch.shape
    for s in (1.0,):
        g = gray_small(frame.resize((round(frame.width / s), round(frame.height / s)), Image.BILINEAR), k)
        for dy in range(-search, search + 1):
            for dx in range(-search, search + 1):
                cx, cy = round(SADDLE_REF[0] / k) + dx, round(SADDLE_REF[1] / k) + dy
                y0, x0 = cy - ph // 2, cx - pw // 2
                if y0 < 0 or x0 < 0 or y0 + ph > g.shape[0] or x0 + pw > g.shape[1]:
                    continue
                d = ((g[y0:y0 + ph, x0:x0 + pw] - ref_patch) ** 2).mean()
                if best is None or d < best[0]:
                    best = (d, cx * k * s, cy * k * s, s)
    _, x, y, s = best
    return round(x), round(y), float(s)


def horse_size(frame, sx, sy):
    """A size measure for the horse in one frame: geometric mean of the eye-to-saddle
    distance, the pupil size and the head height (each varies a bit with the gallop)."""
    a = np.array(frame)
    opaque = a[..., 3] > 16
    region = np.zeros_like(opaque)
    region[max(0, sy - 500): sy + 80, sx + 150: sx + 700] = True
    dark = (a[..., :3].max(axis=2) < 45) & opaque & region
    lab, n = ndimage.label(dark)
    sizes = ndimage.sum(dark, lab, range(1, n + 1))
    ys, xs = np.where(lab == int(np.argmax(sizes)) + 1)
    eye_dist = np.hypot(xs.mean() - sx, ys.mean() - sy)
    head = opaque.copy()
    head[:, : sx + 250] = False
    head[sy + 120:, :] = False
    hy = np.where(head.any(axis=1))[0]
    return float(np.cbrt(eye_dist * np.sqrt(sizes.max()) * (hy.max() - hy.min())))


def normalize_horse(frame, sx, sy, s):
    """Scale the frame by 1/s about the saddle so every horse matches frame 2."""
    small = frame.resize((round(frame.width / s), round(frame.height / s)), Image.LANCZOS)
    out = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    out.alpha_composite(small, (round(sx - sx / s), round(sy - sy / s))) if s <= 1 else out.paste(
        small.crop((round(sx / s - sx), round(sy / s - sy), round(sx / s - sx) + frame.width, round(sy / s - sy) + frame.height)), (0, 0))
    return out


def ride_frames():
    rider = rgba(SRC / "horse/char_pose_ride_rider.png")
    rider = rider.crop(rider.getbbox())
    rider = rider.resize((round(rider.width * RIDER_SCALE), round(rider.height * RIDER_SCALE)), Image.LANCZOS)
    seat = (round(rider.width * 0.42), round(rider.height * 0.66))
    ref = gray_small(rgba(SRC / "horse/horse_gallop_2.png"))
    k = 4
    ph, pw = 30, 50  # saddle patch, in 1/4 scale pixels
    cx, cy = SADDLE_REF[0] // k, SADDLE_REF[1] // k
    patch = ref[cy - ph // 2: cy + ph // 2, cx - pw // 2: cx + pw // 2]
    frames = []
    for i in range(1, 9):
        horse = rgba(SRC / f"horse/horse_gallop_{i}.png")
        sx, sy, _ = find_saddle(horse, patch)
        frames.append((i, horse, sx, sy, horse_size(horse, sx, sy)))
    target = float(np.median([f[4] for f in frames]))
    for i, horse, sx, sy, size in frames:
        sc = size / target
        horse = normalize_horse(horse, sx, sy, sc)
        horse.alpha_composite(rider, (sx - seat[0], sy - seat[1]))
        save(crop_scale(horse, RIDE_BOX, RIDE_SCALE), f"ride_{i}")
        print(f"ride_{i}: saddle at {sx},{sy}, horse scale {sc:.2f}")


def main():
    for p in POSES:
        img = on_baseline(rgba(SRC / f"character/poses/char_pose_{p}.png"), BASELINE)
        save(crop_scale(img, POSE_BOX, POSE_SCALE), f"g_{p}")
    # Round avatar: the idle pose's head and hat (2048 canvas, after the baseline fix)
    head = on_baseline(rgba(SRC / "character/poses/char_pose_idle.png"), BASELINE).crop((700, 760, 1290, 1350))
    save(head.resize((256, 256), Image.LANCZOS), "g_avatar")
    for d in DOGS:
        img = on_baseline(rgba(SRC / f"dog/poses/dog_pose_{d}.png"), DOG_BASELINE)
        save(crop_scale(img, DOG_BOX, DOG_SCALE), f"dog_{d}")
    ride_frames()
    for it in ITEMS:
        save(fit(trim(rgba(SRC / f"items/item_{it}.png"), 4), 512), f"item_{it}")
    for h in HABIT_ICONS:
        save(icon(SRC / f"icons/icon_habit_{h}.png"), f"habit_{h}")
    for n in ["nav_inicio", "nav_aventura", "nav_rancho"]:
        save(icon(SRC / f"icons/icon_{n}.png"), n)
    for n in ["moneda", "energia", "check"]:
        save(icon(SRC / f"icons/icon_{n}.png"), f"ui_{n}")
    B = SRC / "backgrounds"
    for n in ["ill_onboarding", "ill_name", "ill_adventure_ready"]:
        save(rgba(B / f"{n}.png").convert("RGB"), n, 84)
    for i in (1, 2, 3):
        save(fit(rgba(B / f"ill_story_{i}.png").convert("RGB"), 960), f"story_{i}", 84)
    story_extras(B)
    save(rgba(B / "bg_patio_flattened.png").convert("RGB"), "bg_patio", 84)
    for n in ["sky", "mountains", "fields"]:
        img = rgba(B / f"bg_ride_{n}.png")
        save(img if n != "sky" else img.convert("RGB"), f"ride_bg_{n}", 84)
    icon_app = rgba(SRC / "icons/app_icon.png").convert("RGB")
    for size, name in [(512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png")]:
        icon_app.resize((size, size), Image.LANCZOS).save(ROOT / "app/public" / name)
    print("done ->", OUT.relative_to(ROOT))


def shadow(size):
    """Soft contact shadow ellipse."""
    from PIL import ImageDraw, ImageFilter
    w, h = size
    im = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
    ImageDraw.Draw(im).ellipse((w // 2, h // 2, w * 3 // 2, h * 3 // 2), fill=(70, 40, 15, 110))
    return im.filter(ImageFilter.GaussianBlur(h / 3))


def story_extras(B):
    """Episode pictures 4-7: square crops of the screen illustrations, plus one
    composed from the poses (Guachito reading the map with the dog, on the pampa)."""
    crops = {"story_4": ("ill_adventure_ready", (0, 400, 1024, 1424)),
             "story_5": ("ill_onboarding", (0, 380, 1024, 1404)),
             "story_6": ("ill_name", (0, 120, 1024, 1144))}
    for name, (src, box) in crops.items():
        save(rgba(B / f"{src}.png").convert("RGB").crop(box).resize((960, 960), Image.LANCZOS), name, 84)
    side = 960
    pampa = rgba(B / "bg_ride_flattened.png").crop((560, 0, 1284, 724)).resize((side, side), Image.LANCZOS)
    guy = Image.open(OUT / "g_map.webp").convert("RGBA")
    dog = Image.open(OUT / "dog_happy.webp").convert("RGBA")
    gh = round(side * 0.70)
    guy = guy.resize((round(guy.width * gh / guy.height), gh), Image.LANCZOS)
    dh = round(side * 0.34)
    dog = dog.resize((round(dog.width * dh / dog.height), dh), Image.LANCZOS)
    for cx, w in [(400, 300), (715, 200)]:
        sh = shadow((w, 34))
        pampa.alpha_composite(sh, (cx - sh.width // 2, 905 - sh.height // 2))
    pampa.alpha_composite(guy, (400 - guy.width // 2, 910 - guy.height))
    pampa.alpha_composite(dog, (715 - dog.width // 2, 915 - dog.height))
    save(pampa.convert("RGB"), "story_7", 84)


def icon(path, size=256):
    img = trim(rgba(path), 2)
    side = max(img.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.alpha_composite(img, ((side - img.width) // 2, (side - img.height) // 2))
    return sq.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    main()
