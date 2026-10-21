import os
from PIL import Image

dir_path = r'c:\Users\hungtn\Downloads\Nghiên cứu chơi\SNORLAX_MUNCHLAX_PSA10_LOCALHOST\SNORLAX_MUNCHLAX_PSA10\scratch'
all_img = os.path.join(dir_path, 'all_images')

target19 = Image.open(os.path.join(all_img, '40_bonus-019_PSA10.webp')).convert('RGBA')
w, h = target19.size
print(f"bonus-019 size: {w}x{h}")

# Crop top label of bonus-019
top_crop = target19.crop((int(w * 0.05), int(h * 0.03), int(w * 0.95), int(h * 0.18)))
top_crop.save(os.path.join(dir_path, 'bonus019_top_crop.png'))
print("Saved bonus019_top_crop.png")
