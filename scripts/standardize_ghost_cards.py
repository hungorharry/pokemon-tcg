import json
import hashlib
import sys
import io
from pathlib import Path

# Force UTF-8 stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load merged data
with open('scripts/ghost_cards_final_34.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

cleaned_cards = []
removed_cards = []

for c in cards:
    # Get seller transactions
    tx = c.get('tx_count') if 'tx_count' in c else c.get('seller_transactions', 0)
    seller = c.get('sellerName') or c.get('seller_name', 'Unknown')
    fb_pct = c.get('fb_pct') if 'fb_pct' in c else c.get('seller_feedback_pct', 100.0)
    is_auction = c.get('isAuction', False) or c.get('is_auction', False)
    bid_count = c.get('bidCount', '') or c.get('bid_count', '')
    
    # Check exclusion rules
    if is_auction or (str(bid_count).isdigit() and int(bid_count) > 0):
        removed_cards.append({
            'name': c.get('clean_name') or c.get('title'),
            'reason': f"Đấu giá / Có Bids ({bid_count} bids)",
            'seller': seller,
            'tx': tx
        })
        continue

    if tx < 31:
        removed_cards.append({
            'name': c.get('clean_name') or c.get('title'),
            'reason': f"Người bán dưới 31 lượt đánh giá ({tx} GD)",
            'seller': seller,
            'tx': tx
        })
        continue

    # Determine grade & company
    title = c.get('title', '')
    grade = c.get('grade') or c.get('grade_num', 10)
    company = "BGS" if "BGS" in title.upper() else "PSA"

    # Price diff & deal assessment
    price_usd = float(c.get('price_usd', 0))
    pc_usd = float(c.get('pc_usd', 0))
    diff_usd = round(price_usd - pc_usd, 2)
    diff_pct = round((diff_usd / pc_usd) * 100, 1) if pc_usd > 0 else 0.0

    if diff_pct < -5.0:
        deal_status = "🔥 HỜI (RẺ HƠN PC)"
    elif abs(diff_pct) <= 15.0:
        deal_status = "⚡ HỢP LÝ (FAIR / SÁT PC)"
    else:
        deal_status = "⚠️ CAO HƠN PC"

    image_local = c.get('image_local')
    local_p = Path(f"public{image_local}") if image_local and image_local.startswith('/') else Path(image_local or "")
    
    img_bytes = local_p.stat().st_size if local_p.exists() else c.get('image_bytes', 0)
    img_md5 = ""
    if local_p.exists():
        with open(local_p, 'rb') as img_f:
            img_md5 = hashlib.md5(img_f.read()).hexdigest()[:8]

    cleaned_card = {
        'id': c.get('id'),
        'character': c.get('character'),
        'clean_name': c.get('clean_name') or c.get('title'),
        'grade': grade,
        'company': company,
        'set': c.get('set', ''),
        'year': c.get('year', 0),
        'price_usd': price_usd,
        'price_vnd': int(price_usd * 25460),
        'pc_usd': pc_usd,
        'pc_vnd': int(pc_usd * 25460),
        'diff_usd': diff_usd,
        'diff_pct': diff_pct,
        'deal_status': deal_status,
        'seller_name': seller,
        'seller_transactions': tx,
        'seller_feedback_pct': fb_pct,
        'url': c.get('url'),
        'pc_url': c.get('pc_url'),
        'image_local': image_local,
        'image_bytes': img_bytes,
        'image_md5': img_md5
    }
    cleaned_cards.append(cleaned_card)

print(f"Tổng số thẻ hợp lệ đạt chuẩn: {len(cleaned_cards)}")
print(f"Số thẻ bị loại bỏ: {len(removed_cards)}")
for r in removed_cards:
    print(f"  ❌ ĐÃ LOẠI: {r['name']} | Lý do: {r['reason']} | Seller: {r['seller']}")

with open('scripts/ghost_cards_verified_final.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_cards, f, indent=2, ensure_ascii=False)

print("\nĐã lưu danh mục hoàn chỉnh vào: scripts/ghost_cards_verified_final.json")
