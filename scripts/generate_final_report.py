import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('scripts/ghost_cards_verified_final.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

print(f"Total verified cards: {len(cards)}\n")

# Group by character
by_char = {}
for c in cards:
    by_char.setdefault(c['character'], []).append(c)

for char, items in by_char.items():
    print(f"=== {char.upper()} ({len(items)} thẻ) ===")
    for c in items:
        vnd_price = f"{c['price_vnd']:,} ₫"
        vnd_pc = f"{c['pc_vnd']:,} ₫"
        diff_str = f"+{c['diff_pct']}%" if c['diff_pct'] > 0 else f"{c['diff_pct']}%"
        print(f"• {c['clean_name']} [{c['company']} {c['grade']}]")
        print(f"  - eBay BIN: ${c['price_usd']:,.2f} ({vnd_price}) | PC: ${c['pc_usd']:,.2f} ({vnd_pc}) [{diff_str}]")
        print(f"  - Đánh giá: {c['deal_status']} | Seller: {c['seller_name']} ({c['seller_transactions']:,} GD - {c['seller_feedback_pct']}%)")
        print(f"  - Ảnh: {c['image_local']} ({c['image_bytes']:,} bytes, MD5: {c['image_md5']})")
        print(f"  - Link: {c['url']}\n")
