import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

src = Image.open(os.path.join(all_img, '08_snor-007_PSA10.webp'))
# Crop label area from snor-007 (PSA 10)
# Top label in 08_snor-007 is roughly y: 60 to 280, x: 670 to 880
w, h = src.size
print(f"snor-007 size: {w}x{h}")

# Let's crop the 'GEM MT 10' region
gem_mt = src.crop((int(w * 0.65), int(h * 0.05), int(w * 0.90), int(h * 0.12)))
gem_mt.save(os.path.join(dir_path, 'crop_gem_mt.png'))
print("Saved crop_gem_mt.png")
