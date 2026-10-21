import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
gem_badge = src.crop((655, 154, 845, 230)).convert('RGBA')

# Invert text to alpha
gray = gem_badge.convert('L')
alpha = gray.point(lambda p: 255 if p < 120 else int(255 * (230 - p) / 110) if p < 230 else 0)
gem_badge.putalpha(alpha)

target19 = Image.open(os.path.join(all_img, '40_bonus-019_PSA10.webp')).convert('RGBA')
# Target size: 647 x 1080
# Top crop was y: 32 to 194 (h=162), x: 32 to 614 (w=582)
# NM-MT was at crop x: 450 -> target x = 482
# NM-MT was at crop y: 60 -> target y = 92
# 8 was at crop y: 95 -> target y = 127

# Blank white patch from (340, 80) to (470, 150)
bg_patch = target19.crop((340, 80, 470, 150))

# Cover NM-MT 8 at (475, 80)
target19.paste(bg_patch, (475, 80))

# Scale gem_badge to 68% to match 647px width (target10 was 953px)
w, h = gem_badge.size
scale = 647.0 / 953.0
gem_badge_resized = gem_badge.resize((int(w * scale * 0.95), int(h * scale * 0.88)), Image.Resampling.LANCZOS)

# Paste GEM MT 10 text
target19.paste(gem_badge_resized, (465, 86), gem_badge_resized)

# Save
target19_rgb = target19.convert('RGB')
target19_rgb.save(os.path.join(dir_path, 'bonus-019_fixed.webp'), 'WEBP', quality=95)
fixed_crop = target19_rgb.crop((20, 20, 620, 200))
fixed_crop.save(os.path.join(dir_path, 'bonus019_fixed_crop.png'))
print("Saved bonus019 composite!")
