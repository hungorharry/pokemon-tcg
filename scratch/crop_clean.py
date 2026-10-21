import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
gem_mt_10_clean = src.crop((655, 125, 855, 215))
gem_mt_10_clean.save(os.path.join(dir_path, 'gem_mt_10_badge.png'))
print("Saved gem_mt_10_badge.png:", gem_mt_10_clean.size)
