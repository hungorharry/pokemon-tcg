import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
# Clean crop of GEM MT 10
gem_badge = src.crop((650, 154, 850, 235))

# 1. Composite onto snor-010
target10 = Image.open(os.path.join(all_img, '11_snor-010_PSA10.webp')).convert('RGB')
# Location of EX-MT 6 in snor-010:
# In snor-010, the label is roughly at x: 670, y: 70 to 150
# Let's inspect where EX-MT 6 is in snor-010
ex_crop = target10.crop((660, 70, 870, 160))
ex_crop.save(os.path.join(dir_path, 'snor010_ex_crop.png'))
print("Saved snor010_ex_crop.png")
