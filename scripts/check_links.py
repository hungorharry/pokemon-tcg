import json

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

ebay_links = 0
fanatics_links = 0
for c in cat:
    url = c.get('listingUrl', '') or c.get('ebayItemUrl', '') or c.get('manualUrl', '')
    if 'ebay.com' in url:
        ebay_links += 1
    if 'fanatics' in url:
        fanatics_links += 1

print(f"Total catalog: {len(cat)}")
print(f"Cards with direct eBay links: {ebay_links}")
print(f"Cards with Fanatics links: {fanatics_links}")
