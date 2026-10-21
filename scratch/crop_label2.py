import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
# Crop 'GEM MT' and '10'
gem_mt_10 = src.crop((650, 90, 850, 160))
gem_mt_10.save(os.path.join(dir_path, 'crop_gem_mt_10.png'))
print("Saved crop_gem_mt_10.png")
