import os
from PIL import Image, ImageDraw, ImageFilter

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
gem_badge = src.crop((655, 154, 845, 230)).convert('RGBA')

gray = gem_badge.convert('L')
alpha = gray.point(lambda p: 255 if p < 110 else int(255 * (230 - p) / 120) if p < 230 else 0)
gem_badge.putalpha(alpha)

target19 = Image.open(os.path.join(all_img, '40_bonus-019_PSA10.webp')).convert('RGBA')
draw = ImageDraw.Draw(target19)

# Clean fill over NM-MT 8
draw.rectangle([460, 78, 580, 145], fill=(227, 230, 235))

# Scale gem_badge to match
w, h = gem_badge.size
scale = 647.0 / 953.0
gem_badge_resized = gem_badge.resize((int(w * scale * 0.95), int(h * scale * 0.88)), Image.Resampling.LANCZOS)

# Paste GEM MT 10 text
target19.paste(gem_badge_resized, (465, 88), gem_badge_resized)

# Save
target19_rgb = target19.convert('RGB')
target19_rgb.save(os.path.join(dir_path, 'bonus-019_fixed.webp'), 'WEBP', quality=95)
fixed_crop = target19_rgb.crop((20, 20, 620, 200))
fixed_crop.save(os.path.join(dir_path, 'bonus019_fixed_crop.png'))
print("Saved bonus019 v5!")
