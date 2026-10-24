import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

print("=== KIỂM TRA TOÀN BỘ 54 THẺ LEGACY (SNOR, BONUS, MUNCH) ===")
for c in cards:
    if c['id'].startswith('ebay-') or c['id'].startswith('fc-'):
        continue
    cid = c['id']
    name = c.get('name', '')
    grade = c.get('grade')
    price = c.get('listingPriceUSD')
    pc = c.get('pricecharting')
    l_url = c.get('listingUrl') or ''
    e_url = c.get('ebayItemUrl') or ''
    e_title = c.get('ebayItemTitle') or ''
    img = c.get('image') or ''
    
    # Check if e_url has 128100373238 or 840031149873
    suspicious = ""
    if '128100373238' in (e_url + l_url):
        suspicious = "⚠️ GẮN NHẦM THẺ 151 SNORLAX #181!"
    elif '840031149873' in (e_url + l_url):
        suspicious = "⚠️ GẮN NHẦM THẺ TAG BOLT 7158!"
    elif '327022390099' in (e_url + l_url):
        suspicious = "⚠️ GẮN NHẦM SURFING PIKACHU!"
    elif '327374848579' in (e_url + l_url):
        suspicious = "⚠️ GẮN NHẦM AERODACTYL!"
    elif not l_url.startswith('https://www.ebay.com/itm/'):
        suspicious = "⚠️ CHƯA CÓ LINK LISTING THẬT / CHỈ CÓ LINK SEARCH HOẶC PLACEHOLDER"
        
    print(f"[{cid}] PSA {grade} | Price: ${price} | PC: ${pc} | {name}")
    print(f"   Listing: {l_url[:60]}")
    if e_url and e_url != l_url:
        print(f"   eBayItemUrl: {e_url[:60]} ({e_title[:40]})")
    if suspicious:
        print(f"   -> {suspicious}")
    print("-" * 60)
