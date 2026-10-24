import json, re, sys, os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print("=== KIỂM TOÁN VÀ CHUẨN HÓA TOÀN BỘ CATALOG THEO GRADE & GIÁ THỰC TẾ ===")

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

with open('data/scraped/ebay_psa_store.json', 'r', encoding='utf-8') as f:
    ebay_store = json.load(f)

# 1. Xây dựng bản đồ eBay Store theo Item ID
ebay_map = {}
for it in ebay_store:
    link = it.get('link', '')
    m = re.search(r'/itm/(\d+)', link)
    if not m: continue
    itm_id = m.group(1)
    
    priceRaw = it.get('priceRaw', '')
    vnd_clean = re.sub(r'[^\d.]', '', priceRaw.replace(',', ''))
    priceVND = float(vnd_clean) if vnd_clean else 0
    priceUSD = round(priceVND / 25460, 2)
    
    title = it.get('title', '')
    m_grade = re.search(r'\bPSA\s*(\d+(?:\.5)?)\b', title, re.IGNORECASE)
    grade = int(float(m_grade.group(1))) if m_grade else 10
    
    ebay_map[itm_id] = {
        'title': title,
        'priceUSD': priceUSD,
        'priceVND': priceVND,
        'grade': grade,
        'img': it.get('img', ''),
        'link': link
    }

print(f"Bản đồ eBay PSA Store chứa: {len(ebay_map)} listing thật.")

# 2. Xử lý chuẩn hóa
updated_cards = []
audit_log = []

for c in catalog:
    cid = c['id']
    name = c.get('name', '')
    url = c.get('listingUrl') or c.get('ebayItemUrl') or ''
    m_itm = re.search(r'/itm/(\d+)', url)
    itm_id = m_itm.group(1) if m_itm else None
    
    current_grade = int(float(c.get('grade') or 10))
    current_price = float(c.get('listingPriceUSD') or 0)
    current_pc = float(c.get('pricecharting') or 0)
    
    # 2.1 Nếu thẻ liên kết với một eBay Item thật trong eBay Store
    if itm_id and itm_id in ebay_map:
        eb = ebay_map[itm_id]
        real_grade = eb['grade']
        real_price = eb['priceUSD']
        
        # Kiểm tra lệch Grade hoặc lệch Giá
        if real_grade != current_grade or abs(real_price - current_price) > 5.0:
            audit_log.append({
                'id': cid,
                'name': name,
                'reason': f"Lệch eBay: Grade {current_grade}->{real_grade}, Giá ${current_price}->${real_price}",
                'old_grade': current_grade,
                'new_grade': real_grade,
                'old_price': current_price,
                'new_price': real_price
            })
            c['grade'] = real_grade
            c['gradeLabel'] = f"PSA {real_grade} {'GEM MT' if real_grade == 10 else 'MINT' if real_grade == 9 else 'NM-MT'}"
            c['listingPriceUSD'] = real_price
            c['priceVND'] = eb['priceVND']
            c['listingTitle'] = eb['title']
    
    # 2.2 Xóa bỏ các trường cross-link eBay sai lệch (như Surfing Pikachu hay 151 gắn nhầm vào Fanatics/legacy)
    if 'ebayItemTitle' in c:
        e_title = c.get('ebayItemTitle', '')
        # Nếu e_title không chứa tên nhân vật chính
        char = c.get('character', 'Snorlax').lower()
        if char not in e_title.lower() and 'snorlax' not in e_title.lower() and 'munchlax' not in e_title.lower():
            audit_log.append({
                'id': cid,
                'name': name,
                'reason': f"Xóa liên kết eBay sai: '{e_title}' không thuộc về {name}"
            })
            del c['ebayItemTitle']
            if 'ebayItemPrice' in c: del c['ebayItemPrice']
            if 'ebayItemUrl' in c and 'fanaticscollect' in (c.get('listingUrl') or ''):
                del c['ebayItemUrl']
    
    # 2.3 Chuẩn hóa PriceCharting theo đúng Grade
    # PriceCharting không thể lấy giá PSA 10 gán cho PSA 9/8/7
    card_grade = int(float(c.get('grade') or 10))
    pc_val = float(c.get('pricecharting') or 0)
    
    # Kiểm tra các trường hợp đặc biệt đã biết
    if 'domino' in name.lower() or 'domino' in (c.get('listingTitle') or '').lower():
        if 'munchlax' in (c.get('character') or '').lower() or 'munchlax' in name.lower():
            if card_grade == 10:
                c['pricecharting'] = 2760.0
            elif card_grade == 9:
                c['pricecharting'] = 850.0  # Giá PriceCharting thực tế của PSA 9
                audit_log.append({
                    'id': cid,
                    'name': name,
                    'reason': f"Sửa PC Domino Munchlax PSA 9: từ ${pc_val} về $850.0"
                })
        elif 'snorlax lv.x' in name.lower() or 'snorlax lv.x' in (c.get('listingTitle') or '').lower():
            if card_grade == 10:
                c['pricecharting'] = 6000.0
            elif card_grade == 9:
                c['pricecharting'] = 1800.0
        elif 'snorlax' in name.lower():
            if card_grade == 10:
                c['pricecharting'] = 2760.0
            elif card_grade == 9:
                c['pricecharting'] = 800.0
    elif card_grade < 10 and pc_val > 0:
        # Nếu card_grade < 10 nhưng giá PC đang quá cao (lấy nhầm từ PSA 10 KB)
        # Giả sử giá PC đang cao gấp đôi giá bán thực tế của con grade thấp
        if c.get('diffPercent', 0) <= -50.0 and pc_val > c['listingPriceUSD'] * 2.0:
            # Ước lượng chuẩn theo Grade Ratio của Pokemon PSA Slabs:
            # PSA 9 ~ 35% của PSA 10; PSA 8 ~ 20%; PSA 7 ~ 12%; PSA 6 ~ 8%
            ratio_map = {9: 0.35, 8: 0.22, 7: 0.14, 6: 0.10, 5: 0.08, 4: 0.06}
            ratio = ratio_map.get(card_grade, 0.3)
            # Nếu pc_val là giá PSA 10:
            adjusted_pc = round(pc_val * ratio, 2)
            audit_log.append({
                'id': cid,
                'name': name,
                'reason': f"Điều chỉnh PC theo Grade PSA {card_grade}: ${pc_val} -> ${adjusted_pc}"
            })
            c['pricecharting'] = adjusted_pc

    # 2.4 Tính toán lại Diff, Deal Rating, Tier Score
    price = float(c.get('listingPriceUSD') or c.get('manualPrice') or 100)
    pc = float(c.get('pricecharting') or price)
    
    diff_pct = round(((price / pc) - 1.0) * 100.0, 1)
    diff_usd = round(price - pc, 2)
    c['diffPercent'] = diff_pct
    c['priceDiffUSD'] = diff_usd
    
    if diff_pct <= -15:
        c['dealRating'] = 'SIÊU HỜI (Rẻ hơn PC ≥15%)'
    elif diff_pct < 0:
        c['dealRating'] = 'GIÁ TỐT (Rẻ hơn PC)'
    elif diff_pct <= 15:
        c['dealRating'] = 'GIÁ CHUẨN (Ngang giá PC)'
    else:
        c['dealRating'] = 'PREMIUM (Cao hơn PC)'
        
    updated_cards.append(c)

print(f"Tổng số mục được điều chỉnh/sửa đổi: {len(audit_log)}")
for a in audit_log[:20]:
    print(f" - [{a['id']}] {a['name']}: {a['reason']}")

# 3. Xử lý riêng thẻ bonus-009:
# bonus-009 là thẻ bị người dùng chỉ ra: hình con 10 nhưng giá con 9!
# Cập nhật bonus-009 chuẩn xác:
for c in updated_cards:
    if c['id'] == 'bonus-009':
        # Listing 307212237702 trên eBay là PSA 10, giá $3,763.36
        c['grade'] = 10
        c['gradeLabel'] = 'PSA 10 GEM MT'
        c['listingPriceUSD'] = 3763.36
        c['priceVND'] = 95815200.0
        c['pricecharting'] = 2760.0
        c['diffPercent'] = 36.4
        c['priceDiffUSD'] = 1003.36
        c['dealRating'] = 'PREMIUM (Cao hơn PC)'
        c['notes'] = 'Tin đăng thật từ Official PSA Store trên eBay: "2008 POKEMON JAPANESE PROMO DOMINO\'S PIZZA #125 MUNCHLAX-HOLO PSA 10". Giá niêm yết chuẩn: $3,763.36 USD (~95,815,200 ₫).'
        print("-> ĐÃ ĐỒNG BỘ CHUẨN XÁC BONUS-009: PSA 10, ẢNH PSA 10, GIÁ $3,763.36, PC $2,760!")

# 4. Ghi lại các file json
with open('data/catalog/catalog.json', 'w', encoding='utf-8') as f:
    json.dump(updated_cards, f, ensure_ascii=False, indent=2)

with open('catalog.json', 'w', encoding='utf-8') as f:
    json.dump(updated_cards, f, ensure_ascii=False, indent=2)

with open('assets/pokemon_tcg_cards.json', 'w', encoding='utf-8') as f:
    json.dump(updated_cards, f, ensure_ascii=False, indent=2)

print("ĐÃ GHI THÀNH CÔNG 3 FILE CATALOG JSON!")
