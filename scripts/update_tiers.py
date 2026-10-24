import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

for path in ['data/catalog/catalog.json', 'catalog.json', 'assets/pokemon_tcg_cards.json']:
    with open(path, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    tier_counts = {'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0}
    for c in cards:
        s = float(c.get('tierScore') or 60)
        if s >= 90: t = 'S'
        elif s >= 80: t = 'A'
        elif s >= 70: t = 'B'
        elif s >= 63: t = 'C'
        else: t = 'D'
        c['tier'] = t
        tier_counts[t] += 1
        
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
        
    print(f"Updated {path}: {tier_counts}")
