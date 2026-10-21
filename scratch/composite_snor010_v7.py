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

target10 = Image.open(os.path.join(all_img, '11_snor-010_PSA10.webp')).convert('RGBA')

# Clean blank white patch from above/middle: (500, 80, 700, 150)
bg_patch = target10.crop((500, 80, 690, 160))

# Cover old EX-MT 6 at (695, 160)
target10.paste(bg_patch, (695, 160))

# Paste GEM MT 10 text at (705, 172)
w, h = gem_badge.size
gem_badge_resized = gem_badge.resize((int(w * 0.95), int(h * 0.88)), Image.Resampling.LANCZOS)
target10.paste(gem_badge_resized, (705, 172), gem_badge_resized)

# Save
target10_rgb = target10.convert('RGB')
target10_rgb.save(os.path.join(dir_path, 'snor-010_fixed.webp'), 'WEBP', quality=95)
fixed_crop = target10_rgb.crop((50, 40, 900, 300))
fixed_crop.save(os.path.join(dir_path, 'snor010_fixed_crop.png'))
print("Saved perfect texture-cloned composite v7!")
