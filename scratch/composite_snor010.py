import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
gem_badge = src.crop((650, 153, 850, 235))

target10 = Image.open(os.path.join(all_img, '11_snor-010_PSA10.webp')).convert('RGB')
# Resize badge slightly if needed to match snor-010
target10.paste(gem_badge, (665, 96))
target10.save(os.path.join(dir_path, 'snor-010_fixed.webp'), 'WEBP', quality=95)

# Check top of fixed image
fixed_crop = target10.crop((50, 40, 900, 260))
fixed_crop.save(os.path.join(dir_path, 'snor010_fixed_crop.png'))
print("Saved snor-010_fixed.webp and crop!")
