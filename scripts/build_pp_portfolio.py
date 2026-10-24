import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# 400 triệu VND / 25460 VND/USD
MAX_VND = 400000000
MAX_USD = MAX_VND / 25460  # ~15,710.92 USD

print(f"=== PHÂN TÍCH DANH MỤC P/P CỰC TỐT (< 400 TRIỆU VNĐ / < ${MAX_USD:,.2f} USD) ===")

candidates = []
for c in cards:
    price = float(c.get('listingPriceUSD') or 0)
    if price <= 0 or price > MAX_USD:
        continue
    candidates.append(c)

print(f"Số lượng thẻ dưới 400 củ: {len(candidates)} / {len(cards)} thẻ")

by_tier = {'S': [], 'A': [], 'B': [], 'C': [], 'D': []}
for c in candidates:
    t = c.get('tier', 'B')
    if t in by_tier:
        by_tier[t].append(c)

for t in ['S', 'A', 'B', 'C', 'D']:
    items = by_tier[t]
    # Sắp xếp theo P/P tốt nhất:
    # 1. Chiết khấu sâu nhất so với PriceCharting (diffPercent càng âm càng hời)
    # 2. Hoặc điểm tierScore cao
    items.sort(key=lambda x: (x.get('diffPercent', 0), -float(x.get('tierScore', 0))))
    print(f"\n--- TIER {t} ({len(items)} thẻ) ---")
    for it in items[:6]:
        price_vnd = round(float(it.get('listingPriceUSD')) * 25460)
        pc_vnd = round(float(it.get('pricecharting', 0)) * 25460)
        diff = it.get('diffPercent', 0)
        print(f"[{it['id']}] {it.get('name')} | PSA {it.get('grade')} | Giá: {price_vnd:,.0f} ₫ (${it.get('listingPriceUSD'):,.2f}) | PC: {pc_vnd:,.0f} ₫ (${it.get('pricecharting'):,.2f}) | Deal: {diff}%")
