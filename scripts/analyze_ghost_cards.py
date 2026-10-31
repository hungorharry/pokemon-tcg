import json
import re
import urllib.request
import os
import hashlib
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

with open('scripts/all_ghost_cards_raw.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total raw items loaded: {len(items)}")

# Benchmark PriceCharting valuations (USD) based on live PC tracked comps
PC_PRICES = {
    "Chandelure CP4 059/131": {"pc": 63.89, "character": "Chandelure", "year": 2016, "set": "Premium Champion Pack CP4", "variant": "Japanese Holo 059/131", "grade": 10},
    "Chandelure AR 102/086": {"pc": 55.00, "character": "Chandelure", "year": 2024, "set": "Super Electric Breaker / Black Bolt SV11B", "variant": "Art Rare 102/086", "grade": 10},
    "Mega Chandelure ex 097": {"pc": 70.00, "character": "Chandelure", "year": 2026, "set": "M5 Abyss Eye", "variant": "Super Rare ex 097", "grade": 10},
    "Chandelure CHR 069/067": {"pc": 38.50, "character": "Chandelure", "year": 2022, "set": "Battle Region S9a", "variant": "Character Rare 069/067", "grade": 10},
    "Chandelure V 102/100": {"pc": 34.00, "character": "Chandelure", "year": 2021, "set": "Fusion Arts S8", "variant": "Full Art Super Rare 102/100", "grade": 10},
    
    "Duskull 068/064": {"pc": 45.00, "character": "Duskull", "year": 2024, "set": "Night Wanderer SV6a", "variant": "Art Rare 068/064", "grade": 10},
    "Duskull EX Deoxys 58": {"pc": 304.00, "character": "Duskull", "year": 2005, "set": "EX Deoxys", "variant": "Reverse Holo / Stamp #58", "grade": 10},
    "Duskull AR 203/172": {"pc": 32.00, "character": "Duskull", "year": 2022, "set": "VSTAR Universe S12a", "variant": "Art Rare 203/172", "grade": 10},
    
    "Haunter Master Ball 093/165": {"pc": 168.00, "character": "Haunter", "year": 2023, "set": "Pokemon 151 SV2a", "variant": "Master Ball Reverse Holo 093/165", "grade": 10},
    "Haunter AR 022/021": {"pc": 55.00, "character": "Haunter", "year": 2025, "set": "Starter Set Mega Gengar ex", "variant": "Art Rare 022/021", "grade": 10},
    
    "Sabrina's Gastly 92": {"pc": 410.00, "character": "Gastly", "year": 1999, "set": "Yamabuki City Gym Deck", "variant": "Japanese Old Back #92", "grade": 10},
    "Gastly Master Ball 092/165": {"pc": 145.00, "character": "Gastly", "year": 2023, "set": "Pokemon 151 SV2a", "variant": "Master Ball Foil 092/165", "grade": 10},
    "Gastly AR 080/071": {"pc": 85.00, "character": "Gastly", "year": 2024, "set": "Wild Force SV5K", "variant": "Art Rare 080/071", "grade": 10},
    
    "Giratina VSTAR 111/172": {"pc": 38.00, "character": "Giratina", "year": 2022, "set": "VSTAR Universe S12a", "variant": "RRR Holo 111/172", "grade": 10},
    "Giratina V 110/172": {"pc": 70.00, "character": "Giratina", "year": 2022, "set": "VSTAR Universe S12a", "variant": "RR Holo 110/172", "grade": 10},
    "Giratina VSTAR UR 125/100": {"pc": 103.00, "character": "Giratina", "year": 2022, "set": "Lost Abyss S11", "variant": "Gold Ultra Rare 125/100", "grade": 10},
    "Reverse World's Giratina 005/009": {"pc": 520.00, "character": "Giratina", "year": 2008, "set": "11th Movie Commemoration Set", "variant": "Movie Promo Holo 005/009", "grade": 10},
    "Giratina SM12a 049/173": {"pc": 75.00, "character": "Giratina", "year": 2019, "set": "Tag Team GX All Stars SM12a", "variant": "Japanese Holo", "grade": 10},
    "Giratina SM7b 017/050": {"pc": 165.00, "character": "Giratina", "year": 2018, "set": "Fairy Rise SM7b", "variant": "Japanese Holo 017/050", "grade": 10},
    
    "Mimikyu 020/050": {"pc": 380.00, "character": "Mimikyu", "year": 2017, "set": "Alolan Moonlight SM2L", "variant": "Japanese Holo 020/050", "grade": 10},
    "Mimikyu CSR 233/184": {"pc": 150.00, "character": "Mimikyu", "year": 2021, "set": "VMAX Climax S8b", "variant": "Character Super Rare 233/184", "grade": 10},
    "Mimikyu S 265/190": {"pc": 85.00, "character": "Mimikyu", "year": 2023, "set": "Shiny Treasure ex SV4a", "variant": "Shiny Rare 265/190", "grade": 10},
    "Mimikyu VMAX 077/184": {"pc": 65.00, "character": "Mimikyu", "year": 2021, "set": "VMAX Climax S8b", "variant": "RRR Holo 077/184", "grade": 10},
    "Mimikyu V SR 073/070": {"pc": 160.00, "character": "Mimikyu", "year": 2021, "set": "Single Strike Master S5I", "variant": "Super Rare 073/070", "grade": 10},
    
    "Gengar Fossil 1st Ed #20": {"pc": 4000.00, "character": "Gengar", "year": 1999, "set": "Fossil", "variant": "1st Edition Non-Holo #20", "grade": 10},
    "Gengar EX 033/088": {"pc": 520.00, "character": "Gengar", "year": 2014, "set": "Phantom Gate XY4", "variant": "1st Edition EX 033/088", "grade": 10},
    "Gengar VMAX 002/019": {"pc": 95.00, "character": "Gengar", "year": 2021, "set": "High Class Decks / SA", "variant": "Ultra Rare 002/019", "grade": 10},
    "Mega Gengar EX 230/193": {"pc": 70.00, "character": "Gengar", "year": 2024, "set": "Terastal Fest / Special Box", "variant": "Mega EX Holo 230/193", "grade": 10},
    "Gengar Expedition 1st Ed #117": {"pc": 2500.00, "character": "Gengar", "year": 2001, "set": "Expedition Base Set", "variant": "Japanese 1st Edition Holo #117", "grade": 9},
}

def match_card_key(title):
    t = title.lower()
    if "chandelure" in t:
        if "059/131" in t or "cp4" in t: return "Chandelure CP4 059/131"
        if "102/086" in t or "sv11b" in t: return "Chandelure AR 102/086"
        if "mega" in t and "097" in t: return "Mega Chandelure ex 097"
        if "069/067" in t or "s9a" in t or "battle region" in t: return "Chandelure CHR 069/067"
        if "102/100" in t or "fusion arts" in t: return "Chandelure V 102/100"
    if "duskull" in t:
        if "068/064" in t or "night wanderer" in t: return "Duskull 068/064"
        if "deoxys" in t or "58" in t: return "Duskull EX Deoxys 58"
        if "203/172" in t or "vstar universe" in t: return "Duskull AR 203/172"
    if "haunter" in t:
        if "master ball" in t or "093/165" in t: return "Haunter Master Ball 093/165"
        if "022/021" in t or "starter set" in t: return "Haunter AR 022/021"
    if "gastly" in t:
        if "sabrina" in t or "92" in t or "yamabuki" in t: return "Sabrina's Gastly 92"
        if "master ball" in t or "092/165" in t: return "Gastly Master Ball 092/165"
        if "080/071" in t or "wild force" in t: return "Gastly AR 080/071"
    if "giratina" in t:
        if "reverse world" in t or "005/009" in t or "11th movie" in t: return "Reverse World's Giratina 005/009"
        if "125/100" in t or "ur" in t or "lost abyss" in t: return "Giratina VSTAR UR 125/100"
        if "111/172" in t: return "Giratina VSTAR 111/172"
        if "110/172" in t: return "Giratina V 110/172"
        if "sm12a" in t or "tag team" in t or "all stars" in t: return "Giratina SM12a 049/173"
        if "sm7b" in t or "017/050" in t: return "Giratina SM7b 017/050"
    if "mimikyu" in t:
        if "020" in t or "moonlight" in t or "2017" in t: return "Mimikyu 020/050"
        if "csr" in t or "233/184" in t: return "Mimikyu CSR 233/184"
        if "265/190" in t or "shiny treasure" in t: return "Mimikyu S 265/190"
        if "vmax" in t and "077/184" in t: return "Mimikyu VMAX 077/184"
        if "073/070" in t or "single strike" in t: return "Mimikyu V SR 073/070"
    if "gengar" in t:
        if "#20" in t or "20/62" in t or "non-holo" in t: return "Gengar Fossil 1st Ed #20"
        if "phantom gate" in t or "033" in t: return "Gengar EX 033/088"
        if "vmax" in t and "002/019" in t: return "Gengar VMAX 002/019"
        if "mega gengar" in t or "230/193" in t: return "Mega Gengar EX 230/193"
        if "expedition" in t or "117" in t: return "Gengar Expedition 1st Ed #117"
    return "Unknown"

processed = []
for it in items:
    url = it.get('url', '')
    title = it.get('title', '')
    raw_price = it.get('price', '')
    approx_price = it.get('approxPrice', '')
    is_auction = it.get('isAuction', False)
    bid_count = it.get('bidCount', '')
    seller_name = it.get('sellerName', '')
    seller_feedback = it.get('sellerFeedback', '')
    seller_text = it.get('sellerSectionText', '')
    imgs = it.get('imgs', [])
    
    # Extract seller transaction count
    m_tx = re.search(r'\((\d[\d,]*)\)', seller_text)
    tx_count = int(m_tx.group(1).replace(',', '')) if m_tx else 0
    
    # Extract seller feedback percentage
    m_fb = re.search(r'([\d.]+)%\s*positive', seller_feedback)
    fb_pct = float(m_fb.group(1)) if m_fb else 100.0
    
    # Extract price in USD
    m_usd = re.search(r'US\s*\$([\d,.]+)', raw_price)
    if not m_usd:
        m_usd = re.search(r'\$([\d,.]+)', approx_price)
    if not m_usd:
        m_usd = re.search(r'\$([\d,.]+)', raw_price)
    price_usd = float(m_usd.group(1).replace(',', '')) if m_usd else 0.0
    
    card_key = match_card_key(title)
    pc_data = PC_PRICES.get(card_key, {"pc": price_usd, "character": "Other", "year": 2024, "set": "Pokemon", "variant": "PSA 10", "grade": 10})
    pc_val = pc_data["pc"]
    
    diff_usd = round(price_usd - pc_val, 2)
    diff_pct = round((diff_usd / pc_val) * 100, 1) if pc_val > 0 else 0.0
    
    processed.append({
        "url": url,
        "title": title,
        "card_key": card_key,
        "character": pc_data["character"],
        "year": pc_data["year"],
        "set": pc_data["set"],
        "variant": pc_data["variant"],
        "grade": pc_data["grade"],
        "is_auction": is_auction,
        "bid_count": bid_count,
        "price_usd": price_usd,
        "price_vnd": round(price_usd * 25460),
        "pricecharting_usd": pc_val,
        "pricecharting_vnd": round(pc_val * 25460),
        "diff_usd": diff_usd,
        "diff_pct": diff_pct,
        "seller_name": seller_name,
        "seller_feedback_pct": fb_pct,
        "seller_transactions": tx_count,
        "imgs": imgs
    })

print(f"Processed {len(processed)} items.")
with open('scripts/ghost_cards_analyzed.json', 'w', encoding='utf-8') as f:
    json.dump(processed, f, indent=2, ensure_ascii=False)
