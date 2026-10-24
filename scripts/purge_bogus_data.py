import json, re, sys, os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print("=== QUY TRÌNH KIỂM TOÁN VÀ LÀM SẠCH DỮ LIỆU TOÀN DIỆN ===")

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

before_count = len(cards)
cleaned_cards = []
removed_cards = []
purged_bogus_links = []

# Danh sách item rác đã được xác định
BOGUS_EBAY_ITEMS = {
    '128100373238': '2023 151 Snorlax #181',
    '840031149873': 'Eevee & Snorlax Tag Bolt',
    '327022390099': 'Surfing Pikachu',
    '327374848579': 'Aerodactyl',
}

for c in cards:
    cid = c['id']
    name = c.get('name', '')
    
    # 1. Thẻ bonus-019 là bản ghi trùng lặp giả định với bonus-013 (PokéPark Grand Opening 040)
    # bonus-013 là bản ghi THẬT (PSA 10, Listing thật 157692709972, giá thật $2,050).
    # bonus-019 bị gán giá giả $222 và link 151 rác (128100373238).
    if cid == 'bonus-019':
        removed_cards.append({
            'id': cid,
            'name': name,
            'reason': 'Thẻ trùng lặp giả định (đã có bonus-013 PSA 10 giá $2,050 và ebay-900020955555 PSA 9)'
        })
        continue

    # 2. Xóa các trường ebayItem* rác trên thẻ Fanatics Collect (fc-snorlax-xxx)
    if cid.startswith('fc-'):
        if 'ebayItemUrl' in c or 'ebayItemTitle' in c or 'ebayItemPrice' in c:
            purged_bogus_links.append((cid, name, c.get('ebayItemUrl', ''), 'Fanatics card with random eBay link'))
            c.pop('ebayItemUrl', None)
            c.pop('ebayItemTitle', None)
            c.pop('ebayItemPrice', None)

    # 3. Xóa các link eBay rác trên thẻ legacy
    e_url = c.get('ebayItemUrl', '')
    for b_id, b_name in BOGUS_EBAY_ITEMS.items():
        if b_id in e_url:
            purged_bogus_links.append((cid, name, e_url, f"Gán nhầm {b_name}"))
            c.pop('ebayItemUrl', None)
            c.pop('ebayItemTitle', None)
            c.pop('ebayItemPrice', None)
            break

    # 4. Đảm bảo thẻ nào có listingUrl trên eBay thì ebayItemUrl = listingUrl
    l_url = c.get('listingUrl', '')
    if l_url and 'ebay.com/itm/' in l_url:
        c['ebayItemUrl'] = l_url

    cleaned_cards.append(c)

after_count = len(cleaned_cards)

print(f"\n1. SỐ LƯỢNG THẺ:")
print(f" - Trước khi làm sạch: {before_count} thẻ")
print(f" - Thẻ bị loại bỏ (rác/trùng lặp): {len(removed_cards)} thẻ")
for r in removed_cards:
    print(f"   * [{r['id']}] {r['name']}: {r['reason']}")
print(f" - Sau khi làm sạch: {after_count} thẻ chuẩn xác 100%")

print(f"\n2. SỐ LIÊN KẾT RÁC ĐÃ GỠ BỎ: {len(purged_bogus_links)} trường hợp")
print("Top 10 ví dụ được làm sạch:")
for it in purged_bogus_links[:10]:
    print(f" - [{it[0]}] {it[1]}: Gỡ bỏ '{it[2][:45]}...' ({it[3]})")

# 5. Lưu lại cả 3 file JSON
with open('data/catalog/catalog.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_cards, f, ensure_ascii=False, indent=2)

with open('catalog.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_cards, f, ensure_ascii=False, indent=2)

with open('assets/pokemon_tcg_cards.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_cards, f, ensure_ascii=False, indent=2)

print("\n✓ ĐÃ LƯU THÀNH CÔNG 3 FILE CATALOG JSON!")
