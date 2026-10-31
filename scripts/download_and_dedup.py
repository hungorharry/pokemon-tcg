import json
import os
import urllib.request
import hashlib
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

with open('scripts/ghost_cards_analyzed.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total analyzed cards: {len(items)}")

# 1. Flag auctions
auctions = [c for c in items if c['is_auction'] or c['bid_count']]
buy_it_nows = [c for c in items if not (c['is_auction'] or c['bid_count'])]

print(f"\n--- AUCTIONS / BIDS (BẮT BUỘC LOẠI BỎ THEO QUY TẮC USER): {len(auctions)} thẻ ---")
for a in auctions:
    print(f"❌ [BIDS: {a['bid_count']}] {a['title'][:55]} | {a['price_usd']}$ | URL: {a['url']}")

print(f"\n--- BUY IT NOW VALID CARDS: {len(buy_it_nows)} thẻ ---")

# 2. Check duplicates among Buy It Now cards
# Group by card_key
from collections import defaultdict
by_card = defaultdict(list)
for c in buy_it_nows:
    by_card[c['card_key']].append(c)

print("\n--- DUPLICATION AUDIT ---")
deduped_cards = []
for k, card_list in by_card.items():
    if len(card_list) == 1:
        deduped_cards.append(card_list[0])
    else:
        print(f"⚠️ Thẻ trùng nhau: '{k}' có {len(card_list)} listings:")
        for idx, c in enumerate(card_list):
            print(f"   [{idx+1}] Seller: {c['seller_name']} ({c['seller_transactions']:,} GD, {c['seller_feedback_pct']}%) | Giá: ${c['price_usd']} | Link: {c['url']}")
        
        # Selection logic based on user priority:
        # 1. Prefer seller with >8,000 transactions
        # 2. If both or neither, choose better price / deal
        card_list_sorted = sorted(
            card_list,
            key=lambda x: (
                1 if x['seller_transactions'] >= 8000 else 0,
                x['seller_feedback_pct'],
                -x['price_usd'] if x['seller_transactions'] >= 8000 else x['price_usd'] # lower price is better
            ),
            reverse=True
        )
        chosen = card_list_sorted[0]
        print(f"   👉 CHỌN BẢN TỐI ƯU: {chosen['seller_name']} (${chosen['price_usd']}, {chosen['seller_transactions']:,} GD)\n")
        deduped_cards.append(chosen)

print(f"Tổng số thẻ duy nhất (đã loại bỏ thẻ trùng & bids): {len(deduped_cards)} thẻ!")

# 3. Download slab images and verify hashes
os.makedirs('public/assets/cards/ghost', exist_ok=True)
os.makedirs('assets/cards/ghost', exist_ok=True)

downloaded_hashes = {}
final_list = []

for idx, c in enumerate(deduped_cards):
    slug = c['card_key'].lower().replace(' ', '_').replace('/', '_').replace("'", "")
    card_id = f"gh-{idx+1:03d}-{slug}"
    c['id'] = card_id
    
    img_url = c['imgs'][0] if c['imgs'] else ''
    if not img_url:
        print(f"Warning: No image for {card_id}")
        continue
        
    local_pub = f"public/assets/cards/ghost/{card_id}.webp"
    local_assets = f"assets/cards/ghost/{card_id}.webp"
    
    req = urllib.request.Request(img_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            md5 = hashlib.md5(data).hexdigest()
            
            if md5 in downloaded_hashes:
                print(f"⚠️ Trùng ảnh slab hoàn toàn với {downloaded_hashes[md5]}! (Hash: {md5})")
            else:
                downloaded_hashes[md5] = card_id
                
            with open(local_pub, 'wb') as f:
                f.write(data)
            with open(local_assets, 'wb') as f:
                f.write(data)
                
            c['image_local'] = f"/assets/cards/ghost/{card_id}.webp"
            c['image_md5'] = md5
            c['image_bytes'] = len(data)
            print(f"✅ Đã tải slab {card_id}: {len(data):,} bytes (MD5: {md5[:8]})")
            final_list.append(c)
    except Exception as e:
        print(f"❌ Lỗi tải ảnh {card_id}: {e}")

with open('scripts/ghost_cards_final.json', 'w', encoding='utf-8') as f:
    json.dump(final_list, f, indent=2, ensure_ascii=False)

print(f"\n🎉 Hoàn thành xử lý {len(final_list)} thẻ Ma Quỷ (Ghost) chính hãng!")
