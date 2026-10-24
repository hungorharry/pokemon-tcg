import json

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

print('Current catalog cards:', len(cat))
for i, c in enumerate(cat[:8]):
    img = c.get('image', '')
    print(f"{i+1}. {c['name']} (Grade {c.get('grade')}) - Price: ${c.get('listingPriceUSD')} - PC: ${c.get('pricecharting')} - Img: {img[:45]}...")
