import json, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/catalog/catalog.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

print(f"Tổng số thẻ ban đầu: {len(cards)}")

def make_dedup_key(c):
    char = (c.get('character') or 'Snorlax').strip().lower()
    name = (c.get('name') or '').strip().lower()
    set_name = (c.get('set') or '').strip().lower()
    variant = (c.get('variant') or '').strip().lower()
    grade = str(c.get('grade') or 10)
    year = str(c.get('year') or '')
    
    # Clean up name: remove PSA grade tokens
    clean_name = re.sub(r'\b(psa\s*\d+(\.\d+)?|gem\s*mt|mint|nm-mt)\b', '', name, flags=re.I)
    clean_name = re.sub(r'\b(199\d|20\d\d)\b', '', clean_name)
    clean_name = re.sub(r'[#\-_/]', ' ', clean_name)
    clean_name = re.sub(r'\s+', ' ', clean_name).strip()
    
    # Specific distinguishing tags that MUST be preserved:
    tags = []
    for tag in ['1st edition', 'first edition', 'reverse', 'no symbol', 'prerelease', 'promo', 'master ball', 'pokeball', 'gold', 'secret', 'rainbow', 'art rare', 'special art', 'japanese', 'english', 'lv.x', 'vmax', 'vstar', 'ex', 'gx']:
        if tag in name or tag in variant or tag in set_name or tag in (c.get('listingTitle') or '').lower():
            tags.append(tag)
            
    # Number token if present (e.g. 040, 125, 126, 127, 143, 088, 181, 142, 206)
    m_num = re.search(r'\b0*(\d{1,3})\b', name)
    num_str = m_num.group(1) if m_num else ''

    key = (char, clean_name[:25], '-'.join(sorted(set(tags))), num_str, grade)
    return key

groups = {}
for c in cards:
    k = make_dedup_key(c)
    groups.setdefault(k, []).append(c)

print(f"Tổng số nhóm thẻ độc bản: {len(groups)}")

# Inspect top groups with duplicates
multi_groups = {k: v for k, v in groups.items() if len(v) > 1}
print(f"Số nhóm có từ 2 listing trở lên: {len(multi_groups)}")

# Dedup strategy: for each group, pick the listing with:
# 1. Authentic verified image
# 2. Lowest reasonable asking price (ignore glitch prices <= 2$)
deduped_catalog = []
for k, items in groups.items():
    if len(items) == 1:
        deduped_catalog.append(items[0])
    else:
        # Sort by: valid price (> $5), then lowest price, then has best image
        valid_items = [it for it in items if float(it.get('listingPriceUSD') or 0) > 5.0]
        if not valid_items:
            valid_items = items
            
        # Pick the best deal or lowest price
        valid_items.sort(key=lambda x: (
            float(x.get('listingPriceUSD') or 999999),
            -(x.get('tierScore') or 0)
        ))
        best_pick = valid_items[0]
        # Store how many other listings exist as metadata
        best_pick['duplicateListingsCount'] = len(items)
        deduped_catalog.append(best_pick)

print(f"Tổng số thẻ sau khi khử trùng lặp: {len(deduped_catalog)}")
