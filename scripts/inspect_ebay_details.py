import json, re

with open('data/scraped/ebay_psa_store.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total items: {len(items)}")

# Sample inspection
for it in items[:15]:
    title = it.get('title', '')
    priceRaw = it.get('priceRaw', '')
    img = it.get('img', '')
    link = it.get('link', '')

    # Extract grade
    grade_match = re.search(r'\bPSA\s*(\d+(?:\.5)?)\b', title, re.IGNORECASE)
    grade = float(grade_match.group(1)) if grade_match else None

    # Parse priceRaw (e.g. '10,358,141.04 VND')
    vnd_clean = re.sub(r'[^\d.]', '', priceRaw.replace(',', ''))
    priceVND = float(vnd_clean) if vnd_clean else 0
    priceUSD = round(priceVND / 25460, 2)

    print(f"Grade: {grade} | USD: ${priceUSD:,.2f} | Title: {title}")
