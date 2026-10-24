import json, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

legacy = [c for c in cards if not c['id'].startswith('ebay-') and not c['id'].startswith('fc-')]

print("=== KIỂM TRA 54 THẺ LEGACY ===")
for c in legacy:
    cid = c['id']
    name = c['name']
    grade = c.get('grade')
    price = c.get('listingPriceUSD')
    pc = c.get('pricecharting')
    l_url = c.get('listingUrl') or ''
    e_url = c.get('ebayItemUrl') or ''
    e_price = c.get('ebayItemPrice')
    e_title = c.get('ebayItemTitle') or ''
    img = c.get('image') or ''

    # Check if e_title matches name
    match_status = "OK"
    if e_title and not any(w in e_title.lower() for w in name.lower().split()[:2]):
        match_status = "MISMATCH"

    print(f"[{cid}] PSA {grade} | Price: ${price} | ePrice: ${e_price} | PC: ${pc}")
    print(f"   Name: {name}")
    if e_title:
        print(f"   eBay Item: {e_title} (${e_price}) [{match_status}]")
    print(f"   Image: {img}")
    print(f"   URL: {l_url or e_url}")
    print("-" * 50)
