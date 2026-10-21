import os
from PIL import Image, ImageDraw, ImageOps

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
gem_badge = src.crop((655, 154, 845, 230)).convert('RGBA')

# Convert white background of gem_badge to transparent, keeping dark text
# Grayscale inverted -> alpha channel
gray = gem_badge.convert('L')
# Text is dark (< 100), background is white (> 240)
# We make text opaque and white transparent
alpha = gray.point(lambda p: 255 if p < 140 else int(255 * (240 - p) / 100) if p < 240 else 0)
gem_badge.putalpha(alpha)

target10 = Image.open(os.path.join(all_img, '11_snor-010_PSA10.webp')).convert('RGBA')
draw = ImageDraw.Draw(target10)

# Sample background color near (780, 200)
bg_color = target10.getpixel((780, 150))

# Cover the old EX-MT 6 block cleanly
draw.rectangle([680, 160, 910, 260], fill=bg_color)

# Resize gem_badge
w, h = gem_badge.size
gem_badge_resized = gem_badge.resize((int(w * 0.95), int(h * 0.88)), Image.Resampling.LANCZOS)

# Paste with alpha
target10.paste(gem_badge_resized, (700, 172), gem_badge_resized)

# Save
target10_rgb = target10.convert('RGB')
target10_rgb.save(os.path.join(dir_path, 'snor-010_fixed.webp'), 'WEBP', quality=95)
fixed_crop = target10_rgb.crop((50, 40, 900, 300))
fixed_crop.save(os.path.join(dir_path, 'snor010_fixed_crop.png'))
print("Saved alpha-blended composite v5!")
