import json

with open('data/scraped/ebay_psa_store.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for it in items:
    for target in ['117440261235', '307239534901', '307212237702']:
        if target in it.get('link', ''):
            print(target, it.get('title'), it.get('priceRaw'))
