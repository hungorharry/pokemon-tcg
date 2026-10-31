import json
import os
import sys
import io
import urllib.request
import hashlib
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

FANATICS_CARDS = [
    {
        "id": "gh_mimikyu_dream_league_chr_bgs_10",
        "clean_name": "Mimikyu CHR #058/049 (BGS 10 Pristine)",
        "character": "Mimikyu",
        "year": 2019,
        "set": "Dream League SM11b",
        "grade": 10,
        "company": "BGS",
        "gradeLabel": "BGS 10 PRISTINE",
        "price_usd": 428.00,
        "pc_usd": 190.00,  # PSA 10 comp on PC ($190), BGS 10 Pristine carries heavy premium
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-dream-league/mimikyu-58",
        "url": "https://www.fanaticscollect.com/buy-now/a211c4f8-d6c9-4c92-b65f-e0f3bbd5bfdf/2019-pokemon-japanese-sun-moon-dream-league-chr-mimikyu-58-bgs-10-pristine",
        "seller_name": "Fanatics Collect Vault",
        "seller_transactions": 520000,
        "seller_feedback_pct": 99.9,
        "img_url": "https://cdn-vault.fanaticscollect.com/2026/10/18/bf/2/medium/v7609495_20261018120530666M_59.jpg",
        "notes": "Lá Mimikyu CHR #058/049 nổi tiếng kết hợp cùng Trainer Acerola từ set Dream League 2019. Đạt chứng chỉ BGS 10 Pristine nhãn vàng đỉnh cao, độ hoàn hảo vượt trội so với PSA 10 thông thường. Lưu trữ bảo chứng tại Fanatics Collect Vault."
    },
    {
        "id": "gh_mimikyu_team_rockets_ar_psa_10",
        "clean_name": "Team Rocket's Mimikyu Art Rare AR #205 (PSA 10)",
        "character": "Mimikyu",
        "year": 2025,
        "set": "The Glory of Team Rocket M2a",
        "grade": 10,
        "company": "PSA",
        "gradeLabel": "PSA 10 GEM MT",
        "price_usd": 53.00,
        "pc_usd": 52.54,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-mega-dream-ex/team-rocket's-mimikyu-205",
        "url": "https://www.fanaticscollect.com/buy-now/a35be524-7db6-4064-b612-7d8ed3c1de2d/2025-pokemon-japanese-m2a-team-rockets-mimikyu-art-rare-psa-10-205",
        "seller_name": "Fanatics Collect Vault",
        "seller_transactions": 520000,
        "seller_feedback_pct": 99.9,
        "img_url": "https://cdn-vault.fanaticscollect.com/cdn.shopify.com/s/files/1/0686/2936/4921/files/medium/beaaa0a18fedf72b607a3a22fdd84746.webp",
        "notes": "Artwork Team Rocket cực ngầu của Mimikyu từ set M2a The Glory of Team Rocket 2025. PSA 10 Gem Mint chào bán sát sàn sạt giá PriceCharting ($53 vs $52.54, +0.9%), thanh khoản cực kỳ nhanh."
    },
    {
        "id": "gh_mimikyu_start_deck_gen_ex_psa_10",
        "clean_name": "Mimikyu ex #054/100 (PSA 10 Gem Mint)",
        "character": "Mimikyu",
        "year": 2024,
        "set": "Start Deck Generations SVOD",
        "grade": 10,
        "company": "PSA",
        "gradeLabel": "PSA 10 GEM MT",
        "price_usd": 190.00,
        "pc_usd": 85.09,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-starter-deck-generations/mimikyu-ex-54",
        "url": "https://www.fanaticscollect.com/buy-now/8114cbce-c5fd-420b-b725-788f5967f053/2024-pokemon-japanese-sv-start-deck-generations-mimikyu-ex-54-psa-10-gem-mint",
        "seller_name": "Fanatics Collect Vault",
        "seller_transactions": 520000,
        "seller_feedback_pct": 99.9,
        "img_url": "https://cdn-vault.fanaticscollect.com/2025/10/3/rm1/medium/v1631612_2020100112405265R_43.jpg",
        "notes": "Mimikyu ex từ bộ Starter Deck Generations 2024 đạt PSA 10. Listing Buy Now tại Vault Fanatics Collect."
    }
]

# Ensure output directories
pub_dir = Path("public/assets/cards/ghost")
assets_dir = Path("assets/cards/ghost")
pub_dir.mkdir(parents=True, exist_ok=True)
assets_dir.mkdir(parents=True, exist_ok=True)

processed_cards = []

for c in FANATICS_CARDS:
    card_id = c["id"]
    remote_img = c["img_url"]
    pub_target = pub_dir / f"{card_id}.webp"
    asset_target = assets_dir / f"{card_id}.webp"

    print(f"Downloading slab image for {card_id}...")
    req = urllib.request.Request(remote_img, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            md5_hash = hashlib.md5(data).hexdigest()
            with open(pub_target, "wb") as f:
                f.write(data)
            with open(asset_target, "wb") as f:
                f.write(data)
            print(f"✅ Saved {pub_target} ({len(data):,} bytes, MD5: {md5_hash[:8]})")
            
            diff_usd = round(c["price_usd"] - c["pc_usd"], 2)
            diff_pct = round((diff_usd / c["pc_usd"]) * 100, 1) if c["pc_usd"] > 0 else 0.0
            
            if diff_pct < -5.0:
                deal_status = "🔥 HỜI (RẺ HƠN PC)"
            elif abs(diff_pct) <= 15.0:
                deal_status = "⚡ HỢP LÝ (FAIR / SÁT PC)"
            else:
                deal_status = "⚠️ CAO HƠN PC"

            processed_card = {
                "id": card_id,
                "character": c["character"],
                "clean_name": c["clean_name"],
                "grade": c["grade"],
                "company": c["company"],
                "set": c["set"],
                "year": c["year"],
                "price_usd": c["price_usd"],
                "price_vnd": int(c["price_usd"] * 25460),
                "pc_usd": c["pc_usd"],
                "pc_vnd": int(c["pc_usd"] * 25460),
                "diff_usd": diff_usd,
                "diff_pct": diff_pct,
                "deal_status": deal_status,
                "seller_name": c["seller_name"],
                "seller_transactions": c["seller_transactions"],
                "seller_feedback_pct": c["seller_feedback_pct"],
                "url": c["url"],
                "pc_url": c["pc_url"],
                "image_local": f"/assets/cards/ghost/{card_id}.webp",
                "image_bytes": len(data),
                "image_md5": md5_hash[:8]
            }
            processed_cards.append(processed_card)
    except Exception as e:
        print(f"❌ Error downloading {card_id}: {e}")

# Load existing verified cards
verified_file = Path("scripts/ghost_cards_verified_final.json")
with open(verified_file, "r", encoding="utf-8") as f:
    existing_cards = json.load(f)

# Remove any existing versions of these 3 cards
existing_filtered = [c for c in existing_cards if c["id"] not in [x["id"] for x in processed_cards]]
final_merged = existing_filtered + processed_cards

with open(verified_file, "w", encoding="utf-8") as f:
    json.dump(final_merged, f, indent=2, ensure_ascii=False)

print(f"\nUpdated {verified_file}: {len(existing_filtered)} existing + {len(processed_cards)} new Fanatics = {len(final_merged)} total ghost cards.")
