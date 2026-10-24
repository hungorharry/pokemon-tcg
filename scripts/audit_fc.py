import json

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

fc_cards = [c for c in cards if c['id'].startswith('fc-')]
print(f'Total FC cards: {len(fc_cards)}')

for c in fc_cards[:10]:
    print(c['id'], '| Grade:', c.get('grade'), '| Price:', c.get('listingPriceUSD'), '| PC:', c.get('pricecharting'), '| Title:', c.get('listingTitle') or c.get('name'))
    if c.get('ebayItemTitle'):
        print('   -> eBay linked:', c.get('ebayItemTitle'), f"(${c.get('ebayItemPrice')})")
