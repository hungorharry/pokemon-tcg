import json, re, sys, os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from parse_candidates import all_items

seen_images = set()
unique_items = []

for it in all_items:
    img = it['img']
    # Extract unique image token
    m = re.search(r'/images/g/([^/]+)/', img)
    token = m.group(1) if m else img
    if token in seen_images:
        continue
    seen_images.add(token)
    unique_items.append(it)

print(f"Total unique images among all candidates: {len(unique_items)}")

cz_unique = [it for it in unique_items if it['character'] == 'Charizard']
pk_unique = [it for it in unique_items if it['character'] == 'Pikachu']

print(f"Unique Charizard cards: {len(cz_unique)}")
print(f"Unique Pikachu cards: {len(pk_unique)}")

print("\n--- SAMPLE CHARIZARDS ---")
for it in cz_unique[:15]:
    m = re.search(r'/images/g/([^/]+)/', it['img'])
    token = m.group(1) if m else 'none'
    print(f"[{it['grade_str']}] {it['title'][:45]} | {it['price_vnd']:,.0f} VND | img: {token}")

print("\n--- SAMPLE PIKACHUS ---")
for it in pk_unique[:15]:
    m = re.search(r'/images/g/([^/]+)/', it['img'])
    token = m.group(1) if m else 'none'
    print(f"[{it['grade_str']}] {it['title'][:45]} | {it['price_vnd']:,.0f} VND | img: {token}")
