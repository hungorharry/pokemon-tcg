import json, re

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

with open('data/scraped/ebay_psa_store.json', 'r', encoding='utf-8') as f:
    ebay_store = json.load(f)

with open('scratch/ebay_crawled_all.json', 'r', encoding='utf-8') as f:
    ebay_crawled = json.load(f)

existing_urls = set()
for c in cat:
    for k in ['listingUrl', 'ebayItemUrl', 'manualUrl']:
        u = c.get(k)
        if u:
            m = re.search(r'/itm/(\d+)', u)
            if m: existing_urls.add(m.group(1))

print(f"Existing eBay Item IDs in current catalog: {len(existing_urls)}")

# Check items in ebay_store not yet in catalog
new_store_items = []
for it in ebay_store:
    link = it.get('link', '')
    m = re.search(r'/itm/(\d+)', link)
    if m and m.group(1) not in existing_urls:
        new_store_items.append(it)

print(f"New eBay items in ebay_psa_store not in catalog: {len(new_store_items)}")

# Check items in ebay_crawled
new_crawled_items = []
for it in ebay_crawled:
    url = it.get('url', '')
    m = re.search(r'/itm/(\d+)', url)
    if m and m.group(1) not in existing_urls:
        new_crawled_items.append(it)

print(f"New eBay items in ebay_crawled not in catalog: {len(new_crawled_items)}")
