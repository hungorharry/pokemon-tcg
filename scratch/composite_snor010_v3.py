import os
from PIL import Image, ImageDraw

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
# Clean crop of GEM MT 10 (width 190, height 75)
gem_badge = src.crop((655, 154, 845, 230))

target10 = Image.open(os.path.join(all_img, '11_snor-010_PSA10.webp')).convert('RGB')
draw = ImageDraw.Draw(target10)

# Sample background color near (750, 100)
bg_color = target10.getpixel((750, 85))

# Cover the whole EX-MT 6 block: from x=680 to 895, y=90 to 160
draw.rectangle([680, 90, 895, 160], fill=bg_color)

# Paste gem_badge centered in that region (x: 695, y: 92)
# Resize gem_badge slightly to match text scale
w, h = gem_badge.size
gem_badge_resized = gem_badge.resize((int(w * 0.95), int(h * 0.85)), Image.Resampling.LANCZOS)
target10.paste(gem_badge_resized, (700, 93))

# Save
target10.save(os.path.join(dir_path, 'snor-010_fixed.webp'), 'WEBP', quality=95)
fixed_crop = target10.crop((50, 40, 900, 260))
fixed_crop.save(os.path.join(dir_path, 'snor010_fixed_crop.png'))
print("Saved refined composite v3!")
