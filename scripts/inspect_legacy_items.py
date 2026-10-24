import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

legacy = [c for c in cards if not c['id'].startswith('ebay-') and not c['id'].startswith('fc-')]

for c in legacy:
    url = c.get('listingUrl') or c.get('manualUrl') or ''
    # Check if there is an item ID
    import re
    m = re.search(r'/itm/(\d+)', url)
    itm_id = m.group(1) if m else None
    print(f"ID: {c['id']:10s} | Grade: {str(c.get('grade')):2s} | Price: ${str(c.get('listingPriceUSD')):10s} | ItmID: {str(itm_id):15s} | Name: {c.get('name')}")
