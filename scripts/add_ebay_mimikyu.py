import json
import urllib.request
import hashlib
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

card_id = "gh_mimikyu_team_rockets_ar_ebay_psa_10"
img_url = "https://i.ebayimg.com/images/g/f6kAAeSw5w9qTh3w/s-l1600.webp"
pub_target = Path(f"public/assets/cards/ghost/{card_id}.webp")
asset_target = Path(f"assets/cards/ghost/{card_id}.webp")

print(f"Downloading slab image for {card_id}...")
req = urllib.request.Request(img_url, headers=headers)
with urllib.request.urlopen(req, timeout=20) as resp:
    data = resp.read()
    md5_hash = hashlib.md5(data).hexdigest()
    with open(pub_target, "wb") as f:
        f.write(data)
    with open(asset_target, "wb") as f:
        f.write(data)
    print(f"✅ Saved image: {len(data):,} bytes (MD5: {md5_hash[:8]})")

new_card = {
    "id": card_id,
    "character": "Mimikyu",
    "clean_name": "Team Rocket's Mimikyu AR #205/193 (eBay Deal)",
    "grade": 10,
    "company": "PSA",
    "set": "Mega Dream ex M2a",
    "year": 2025,
    "price_usd": 48.35,
    "price_vnd": int(48.35 * 25460),
    "pc_usd": 52.54,
    "pc_vnd": int(52.54 * 25460),
    "diff_usd": -4.19,
    "diff_pct": -8.0,
    "deal_status": "🔥 HỜI (RẺ HƠN PC)",
    "seller_name": "wa-yashop555",
    "seller_transactions": 399,
    "seller_feedback_pct": 100.0,
    "url": "https://www.ebay.com/itm/178171948003",
    "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-mega-dream-ex/team-rocket's-mimikyu-205",
    "image_local": f"/assets/cards/ghost/{card_id}.webp",
    "image_bytes": len(data),
    "image_md5": md5_hash[:8]
}

# Update ghost_cards_verified_final.json
verified_file = Path("scripts/ghost_cards_verified_final.json")
with open(verified_file, "r", encoding="utf-8") as f:
    cards = json.load(f)

cards = [c for c in cards if c["id"] != card_id]
cards.append(new_card)

with open(verified_file, "w", encoding="utf-8") as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print(f"Updated {verified_file}: Total {len(cards)} ghost cards.")
