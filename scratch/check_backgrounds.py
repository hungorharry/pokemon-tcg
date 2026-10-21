import json, urllib.request, io, os
from PIL import Image
import numpy as np

with open('catalog.json', encoding='utf-8') as f:
    cat = json.load(f)

print(f"Total cards: {len(cat)}")
white_bg_count = 0
dark_bg_count = 0

for i, c in enumerate(cat):
    url = c.get('image', '')
    if not url:
        continue
    try:
        if url.startswith('http'):
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
            img = Image.open(io.BytesIO(data)).convert('RGB')
        else:
            local_path = url.lstrip('/')
            img = Image.open(local_path).convert('RGB')
        
        arr = np.array(img)
        h, w, _ = arr.shape
        # Sample 4 corners
        corners = [arr[5, 5], arr[5, w-6], arr[h-6, 5], arr[h-6, w-6]]
        avg_brightness = np.mean([np.mean(p) for p in corners])
        
        is_white = avg_brightness > 180
        if is_white:
            white_bg_count += 1
        else:
            dark_bg_count += 1
            
        if i < 15 or is_white:
            print(f"[{c['id']}] Brightness: {avg_brightness:.1f} -> {'WHITE BG' if is_white else 'DARK BG'}")
    except Exception as e:
        print(f"[{c['id']}] Error: {e}")

print(f"\nSummary: {white_bg_count} white bg, {dark_bg_count} dark bg out of {len(cat)}")
