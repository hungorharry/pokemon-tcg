import json, re

# Load all candidate datasets
with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    current_catalog = json.load(f)

with open('data/scraped/ebay_psa_store.json', 'r', encoding='utf-8') as f:
    ebay_store = json.load(f)

with open('scratch/ebay_crawled_all.json', 'r', encoding='utf-8') as f:
    ebay_crawled = json.load(f)

with open('data/backup/catalog_full_548.json', 'r', encoding='utf-8') as f:
    full_548 = json.load(f)

print(f"Current catalog: {len(current_catalog)}")
print(f"eBay store items: {len(ebay_store)}")
print(f"eBay crawled items: {len(ebay_crawled)}")
print(f"Full 548 reference: {len(full_548)}")

# Build a lookup of PriceCharting reference data from full_548 and current_catalog
pc_lookup = {}
for c in full_548 + current_catalog:
    name_norm = c.get('name', '').lower().strip()
    pc_val = c.get('pricecharting')
    if name_norm and pc_val:
        if name_norm not in pc_lookup or pc_lookup[name_norm].get('pricecharting') is None:
            pc_lookup[name_norm] = {
                'pricecharting': pc_val,
                'priceChartingUrl': c.get('priceChartingUrl', ''),
                'psa10pop': c.get('psa10pop'),
                'psaTotal': c.get('psaTotal'),
                'set': c.get('set', ''),
                'year': c.get('year'),
                'variant': c.get('variant', '')
            }

print(f"Unique PriceCharting reference cards in lookup: {len(pc_lookup)}")
