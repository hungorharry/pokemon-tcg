import json
import re
import urllib.request
import os
import hashlib
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

new_raw = [
    {
        "url": "https://www.ebay.com/itm/117439058250",
        "title": "1999 POKEMON FOSSIL #20 GENGAR PSA 8",
        "price_usd": 499.00,
        "is_auction": False,
        "bid_count": "",
        "seller_name": "PSA",
        "seller_transactions": 867179,
        "seller_feedback_pct": 99.9,
        "img": "https://i.ebayimg.com/images/g/ZvcAAeSw9g1qvG9Y/s-l1600.webp",
        "character": "Gengar",
        "year": 1999,
        "set": "Fossil",
        "clean_name": "Gengar Non-Holo #20",
        "grade": 8,
        "pc_usd": 250.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-fossil/gengar-20"
    },
    {
        "url": "https://www.ebay.com/itm/307170756256",
        "title": "1999 POKEMON JAPANESE YAMABUKI CITY GYM DECK #94 SABRINA'S GENGAR PSA 10",
        "price_usd": 10500.00,
        "is_auction": False,
        "bid_count": "",
        "seller_name": "PSA",
        "seller_transactions": 867179,
        "seller_feedback_pct": 99.9,
        "img": "https://i.ebayimg.com/images/g/2y8AAeSwf4ZqoYDf/s-l1600.webp",
        "character": "Gengar",
        "year": 1999,
        "set": "Yamabuki City Gym Deck",
        "clean_name": "Sabrina's Gengar Holo #94 (Banned Graveyard Art)",
        "grade": 10,
        "pc_usd": 8450.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-gym/sabrina's-gengar-94"
    },
    {
        "url": "https://www.ebay.com/itm/117465554171",
        "title": "2002 POKEMON JAPANESE MYSTERIOUS MOUNTAINS 1ST EDITION #043 GENGAR PSA 9",
        "price_usd": 3500.00,
        "is_auction": False,
        "bid_count": "",
        "seller_name": "PSA",
        "seller_transactions": 867179,
        "seller_feedback_pct": 99.9,
        "img": "https://i.ebayimg.com/images/g/e4AAAeSwWAZqwWPD/s-l1600.webp",
        "character": "Gengar",
        "year": 2002,
        "set": "Mysterious Mountains (Skyridge e-Series)",
        "clean_name": "Gengar 1st Edition e-Reader #043",
        "grade": 9,
        "pc_usd": 620.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-mysterious-mountains/gengar-43"
    },
    {
        "url": "https://www.ebay.com/itm/307252627091",
        "title": "2000 POKEMON GYM HEROES HOLO #14 SABRINA'S GENGAR PSA 9",
        "price_usd": 2800.00,
        "is_auction": False,
        "bid_count": "",
        "seller_name": "PSA",
        "seller_transactions": 867179,
        "seller_feedback_pct": 99.9,
        "img": "https://i.ebayimg.com/images/g/rmoAAeSw8Adq4Tii/s-l1600.webp",
        "character": "Gengar",
        "year": 2000,
        "set": "Gym Heroes",
        "clean_name": "Sabrina's Gengar Holo #14",
        "grade": 9,
        "pc_usd": 1462.50,
        "pc_url": "https://www.pricecharting.com/game/pokemon-gym-heroes/sabrina's-gengar-14"
    },
    {
        "url": "https://www.ebay.com/itm/307004884216",
        "title": "2000 GYM CHALLENGE 1ST EDITION #29 SABRINA'S GENGAR BGS 9",
        "price_usd": 2200.00,
        "is_auction": False,
        "bid_count": "",
        "seller_name": "PSA",
        "seller_transactions": 867179,
        "seller_feedback_pct": 99.9,
        "img": "https://i.ebayimg.com/images/g/ktYAAeSw0vRqMNUh/s-l1600.webp",
        "character": "Gengar",
        "year": 2000,
        "set": "Gym Challenge",
        "clean_name": "Sabrina's Gengar 1st Edition #29 (BGS 9)",
        "grade": 9,
        "pc_usd": 1628.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-gym-challenge/sabrina's-gengar-1st-edition-29"
    }
]

# Ensure dirs
os.makedirs('public/assets/cards/ghost', exist_ok=True)
os.makedirs('assets/cards/ghost', exist_ok=True)

processed_new = []
for idx, c in enumerate(new_raw):
    # User rule check 1: Bids
    if c['is_auction'] or c['bid_count']:
        print(f"Skipping auction: {c['title']}")
        continue
    # User rule check 2: Seller sales < 31
    if c['seller_transactions'] < 31:
        print(f"Skipping seller with <31 sales: {c['seller_name']} ({c['seller_transactions']})")
        continue

    slug = re.sub(r'[^a-z0-9]+', '_', c['clean_name'].lower()).strip('_')
    cid = f"gh_gengar_{slug}_{c['grade']}"
    c['id'] = cid
    
    # Calculate price diff
    price_usd = c['price_usd']
    pc_usd = c['pc_usd']
    diff_usd = round(price_usd - pc_usd, 2)
    diff_pct = round(((price_usd - pc_usd) / pc_usd) * 100, 1)
    
    c['diff_usd'] = diff_usd
    c['diff_pct'] = diff_pct
    c['price_vnd'] = round(price_usd * 25460)
    c['pc_vnd'] = round(pc_usd * 25460)
    
    # Download image
    local_pub = f"public/assets/cards/ghost/{cid}.webp"
    local_assets = f"assets/cards/ghost/{cid}.webp"
    
    try:
        req = urllib.request.Request(c['img'], headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            md5 = hashlib.md5(data).hexdigest()
            with open(local_pub, 'wb') as f:
                f.write(data)
            with open(local_assets, 'wb') as f:
                f.write(data)
            c['image_local'] = f"/assets/cards/ghost/{cid}.webp"
            c['image_bytes'] = len(data)
            c['image_md5'] = md5
            print(f"✅ Saved slab image {cid}: {len(data):,} bytes (MD5: {md5[:8]})")
    except Exception as e:
        print(f"❌ Error downloading {cid}: {e}")
        
    processed_new.append(c)

print(f"\nSuccessfully processed and downloaded {len(processed_new)} new Gengar cards!")

# Load existing 29 cards and merge
with open('scripts/ghost_cards_verified_29.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Combine and deduplicate by URL
by_url = {}
for c in existing:
    by_url[c['url']] = c
for c in processed_new:
    by_url[c['url']] = c

merged = list(by_url.values())
print(f"Total merged cards: {len(merged)} (Existing: {len(existing)} + New: {len(processed_new)})")

with open('scripts/ghost_cards_final_34.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, indent=2, ensure_ascii=False)

print("Saved to scripts/ghost_cards_final_34.json!")
