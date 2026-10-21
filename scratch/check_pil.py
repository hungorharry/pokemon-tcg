import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch\all_images'

# Inspect dimensions
img_source = Image.open(os.path.join(dir_path, '01_snor-001_PSA10.webp'))
img_target10 = Image.open(os.path.join(dir_path, '11_snor-010_PSA10.webp'))
img_target19 = Image.open(os.path.join(dir_path, '40_bonus-019_PSA10.webp'))

print(f"Source (01_snor-001): {img_source.size}")
print(f"Target snor-010: {img_target10.size}")
print(f"Target bonus-019: {img_target19.size}")
