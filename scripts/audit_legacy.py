import json

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

legacy = [c for c in cards if not c['id'].startswith('ebay-') and not c['id'].startswith('fc-')]
print(f'Total legacy cards: {len(legacy)}')

for c in legacy:
    cid = c['id']
    g = c.get('grade')
    nm = c.get('name')
    p = c.get('listingPriceUSD')
    mp = c.get('manualPrice')
    ep = c.get('ebayItemPrice')
    lu = (c.get('listingUrl') or '')[:40]
    eu = (c.get('ebayItemUrl') or '')[:40]
    img = (c.get('image') or '')
    print(f'{cid} | PSA {g} | P_USD: {p} | Manual: {mp} | eBayP: {ep} | {nm}')
