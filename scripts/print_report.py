import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('scripts/ghost_cards_verified_29.json', encoding='utf-8') as f:
    cards = json.load(f)

print(f"Tổng số thẻ Ghost-type thẩm định thành công: {len(cards)}\n")

by_char = {}
for c in cards:
    by_char.setdefault(c['character'], []).append(c)

for ch, items in by_char.items():
    print(f"================== {ch.upper()} ({len(items)} THẺ) ==================")
    for it in items:
        seller_power = f"⭐ >8,000 GD ({it['tx_count']:,})" if it['tx_count'] >= 8000 else f"({it['tx_count']:,} GD)"
        diff_str = f"{it['diff_pct']:+.1f}%"
        if it['diff_pct'] <= -10:
            deal_tag = "🔥 GIÁ SIÊU TỐT (RẺ HƠN PC NHIỀU)"
        elif it['diff_pct'] < 0:
            deal_tag = "✅ GIÁ TỐT (RẺ HƠN PC)"
        elif it['diff_pct'] <= 10:
            deal_tag = "⚖️ HỢP LÝ (TƯƠNG ĐƯƠNG PC)"
        else:
            deal_tag = "⚠️ CAO HƠN PC"
            
        print(f"• {it['clean_name']}")
        print(f"   Giá eBay BIN: ${it['price_usd']:,.2f} ({it['price_vnd']:,} ₫) | Giá PC: ${it['pc_usd']:,.2f} ({it['pc_vnd']:,} ₫) [{diff_str}]")
        print(f"   Đánh giá: {deal_tag} | Seller: {it['sellerName']} {seller_power} - {it['fb_pct']}% FB")
        print(f"   Ảnh slab đã lưu: {it.get('image_local', 'None')} ({it.get('image_bytes', 0):,} bytes)")
        print(f"   Link eBay: {it['url']}")
        print(f"   Link PriceCharting: {it['pc_url']}")
        print()
