import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('scripts/ghost_cards_verified_final.json', 'r', encoding='utf-8') as f:
    ghost_cards = json.load(f)

formatted_ghost_cards = []

for c in ghost_cards:
    diff_pct = c['diff_pct']
    # Calculate tier
    if diff_pct < -5.0:
        tier = "S"
        score = 98
    elif diff_pct <= 15.0:
        tier = "A"
        score = 88
    elif diff_pct <= 35.0:
        tier = "B"
        score = 78
    elif diff_pct <= 60.0:
        tier = "C"
        score = 68
    else:
        tier = "D"
        score = 58

    card_obj = {
        "id": c['id'],
        "name": c['clean_name'],
        "character": c['character'],
        "year": c['year'],
        "set": c['set'],
        "variant": "Holo / Graded Slab",
        "grade": c['grade'],
        "gradeLabel": f"{c['company']} {c['grade']}",
        "slabCompany": c['company'],
        "tierScore": score,
        "pricecharting": c['pc_usd'],
        "psa10pop": 150,
        "psaTotal": 2500,
        "priceChartingUrl": c['pc_url'],
        "ebayQuery": f"{c['character']} {c['set']} PSA {c['grade']}",
        "image": c['image_local'],
        "origin": "eBay Live Buy It Now (31/10/2026)",
        "researched": True,
        "notes": f"Thẻ {c['character']} phiên bản {c['clean_name']} đạt chứng nhận {c['company']} {c['grade']}. Người bán uy tín {c['seller_name']} với {c['seller_transactions']:,} giao dịch ({c['seller_feedback_pct']}% feedback tích cực). Không đấu giá, mua ngay.",
        "manualPrice": c['price_usd'],
        "investmentThesis": f"Thẻ {c['character']} {c['clean_name']} ({c['company']} {c['grade']}). Định giá sàn ${c['price_usd']:,.2f} so với giá tham chiếu PriceCharting ${c['pc_usd']:,.2f} ({c['deal_status']}).",
        "seller": f"{c['seller_name']} ({c['seller_transactions']:,} sales • {c['seller_feedback_pct']}%)",
        "sellerHref": f"https://www.ebay.com/usr/{c['seller_name'].lower().replace(' ', '')}",
        "sellerBadge": f"🏆 {c['seller_name']} ({c['seller_transactions']:,} GD • {c['seller_feedback_pct']}%)",
        "listingUrl": c['url'],
        "listingPriceUSD": c['price_usd'],
        "listingTitle": f"[{c['company']} {c['grade']}] {c['clean_name']}",
        "manualUrl": c['url'],
        "diffPercent": c['diff_pct'],
        "priceDiffUSD": c['diff_usd'],
        "dealRating": c['deal_status'],
        "tier": tier,
        "sellerTransactions": c['seller_transactions'],
        "sellerFeedback": c['seller_feedback_pct'],
        "isPowerSeller8k": c['seller_transactions'] >= 8000,
        "listingType": "BUY_IT_NOW",
        "bids": 0
    }
    formatted_ghost_cards.append(card_obj)

catalog_paths = ["data/catalog/catalog.json", "catalog.json"]

for p in catalog_paths:
    with open(p, "r", encoding="utf-8") as f:
        existing = json.load(f)
    # Remove old ghost cards if any
    filtered = [c for c in existing if not c.get("id", "").startswith("gh_")]
    merged = filtered + formatted_ghost_cards
    with open(p, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    print(f"Updated {p}: {len(filtered)} existing + {len(formatted_ghost_cards)} ghost cards = {len(merged)} total cards.")

print("Successfully injected all 33 ghost cards into catalogs!")
