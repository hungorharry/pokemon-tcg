import os
from PIL import Image, ImageDraw

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
gem_badge = src.crop((650, 150, 850, 235))

target10 = Image.open(os.path.join(all_img, '11_snor-010_PSA10.webp')).convert('RGB')

# 1. Fill the old 'EX-MT 6' area with the label background color of target10
draw = ImageDraw.Draw(target10)
# Sample background color near (750, 130)
bg_color = target10.getpixel((750, 85))
draw.rectangle([680, 95, 910, 160], fill=bg_color)

# 2. Paste gem_badge with transparency mask or blend
target10.paste(gem_badge, (670, 90))

# Save
target10.save(os.path.join(dir_path, 'snor-010_fixed.webp'), 'WEBP', quality=95)
fixed_crop = target10.crop((50, 40, 900, 260))
fixed_crop.save(os.path.join(dir_path, 'snor010_fixed_crop.png'))
print("Saved refined composite!")
