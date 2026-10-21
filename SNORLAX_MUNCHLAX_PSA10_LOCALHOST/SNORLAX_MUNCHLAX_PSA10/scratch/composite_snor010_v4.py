import os
from PIL import Image, ImageDraw

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
# Clean crop of GEM MT 10 (width 190, height 75)
gem_badge = src.crop((655, 154, 845, 230))

target10 = Image.open(os.path.join(all_img, '11_snor-010_PSA10.webp')).convert('RGB')
draw = ImageDraw.Draw(target10)

# Sample background color near (750, 160)
bg_color = target10.getpixel((750, 160))

# Cover the whole EX-MT 6 block: from x=680 to 895, y=140 to 255
draw.rectangle([680, 140, 895, 255], fill=bg_color)

# Resize gem_badge slightly to match text scale
w, h = gem_badge.size
gem_badge_resized = gem_badge.resize((int(w * 0.95), int(h * 0.90)), Image.Resampling.LANCZOS)
target10.paste(gem_badge_resized, (700, 150))

# Save
target10.save(os.path.join(dir_path, 'snor-010_fixed.webp'), 'WEBP', quality=95)
fixed_crop = target10.crop((50, 40, 900, 300))
fixed_crop.save(os.path.join(dir_path, 'snor010_fixed_crop.png'))
print("Saved refined composite v4!")
