import json, os, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

missing_pub = []
missing_root = []
zero_size = []

for c in cards:
    cid = c['id']
    img = c.get('image', '')
    
    # Path in public
    rel_pub = img.lstrip('/')
    if not os.path.exists(rel_pub):
        missing_pub.append((cid, rel_pub))
    elif os.path.getsize(rel_pub) == 0:
        zero_size.append((cid, rel_pub))
        
    # Path in assets
    rel_root = f"assets/cards/{cid}.webp"
    if not os.path.exists(rel_root):
        missing_root.append((cid, rel_root))

print(f"Tổng số thẻ: {len(cards)}")
print(f"Số ảnh thiếu trong public/: {len(missing_pub)}")
if missing_pub:
    print("Thiếu trong public:", missing_pub[:5])
print(f"Số ảnh thiếu trong assets/: {len(missing_root)}")
if missing_root:
    print("Thiếu trong assets:", missing_root[:5])
print(f"Số ảnh rỗng (0 bytes): {len(zero_size)}")
