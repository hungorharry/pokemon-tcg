import json
import re
import os
import urllib.request
import hashlib
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

with open('scripts/all_ghost_cards_raw.json', 'r', encoding='utf-8') as f:
    raw_items = json.load(f)

# Master PriceCharting catalog for these 29 distinct cards
PC_CATALOG = {
    # Chandelure
    "chandelure_cp4": {
        "character": "Chandelure", "year": 2016, "set": "Premium Champion Pack CP4", 
        "name": "Chandelure Holo #059/131", "grade": 10, "pc_usd": 63.89,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-cp4/chandelure-59"
    },
    "chandelure_sv11b": {
        "character": "Chandelure", "year": 2024, "set": "Super Electric Breaker SV11B",
        "name": "Chandelure AR #102/086", "grade": 10, "pc_usd": 55.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-black-bolt/chandelure-102-086"
    },
    "chandelure_m5": {
        "character": "Chandelure", "year": 2026, "set": "M5 Abyss Eye",
        "name": "Mega Chandelure ex Super Rare #097", "grade": 10, "pc_usd": 70.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-promo/chandelure"
    },
    "chandelure_s9a": {
        "character": "Chandelure", "year": 2022, "set": "Battle Region S9a",
        "name": "Chandelure Character Rare CHR #069/067", "grade": 10, "pc_usd": 38.50,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-battle-region/chandelure-69-67"
    },
    "chandelure_s8": {
        "character": "Chandelure", "year": 2021, "set": "Fusion Arts S8",
        "name": "Chandelure V Full Art SR #102/100", "grade": 10, "pc_usd": 34.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-fusion-arts/chandelure-v-102-100"
    },
    
    # Duskull
    "duskull_sv6a": {
        "character": "Duskull", "year": 2024, "set": "Night Wanderer SV6a",
        "name": "Duskull Art Rare AR #068/064", "grade": 10, "pc_usd": 45.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-night-wanderer/duskull-68-64"
    },
    "duskull_deoxys": {
        "character": "Duskull", "year": 2005, "set": "EX Deoxys",
        "name": "Duskull Reverse Holo Stamp #58", "grade": 10, "pc_usd": 304.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-ex-deoxys/duskull-reverse-holo-58"
    },
    "duskull_s12a": {
        "character": "Duskull", "year": 2022, "set": "VSTAR Universe S12a",
        "name": "Duskull Art Rare AR #203/172", "grade": 10, "pc_usd": 32.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/duskull-203-172"
    },
    
    # Haunter
    "haunter_151_mb": {
        "character": "Haunter", "year": 2023, "set": "Pokemon 151 SV2a",
        "name": "Haunter Master Ball Reverse Holo #093/165", "grade": 10, "pc_usd": 168.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-151/haunter-master-ball-93"
    },
    "haunter_starter_ar": {
        "character": "Haunter", "year": 2025, "set": "Starter Set Mega Gengar ex",
        "name": "Haunter Art Rare AR #022/021", "grade": 10, "pc_usd": 55.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-promo/haunter"
    },
    
    # Gastly
    "sabrinas_gastly": {
        "character": "Gastly", "year": 1999, "set": "Yamabuki City Gym Deck",
        "name": "Sabrina's Gastly LV.16 #92 (Old Back)", "grade": 10, "pc_usd": 410.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-gym/sabrina's-gastly-92"
    },
    "gastly_151_mb": {
        "character": "Gastly", "year": 2023, "set": "Pokemon 151 SV2a",
        "name": "Gastly Master Ball Reverse Holo #092/165", "grade": 10, "pc_usd": 145.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-151/gastly-master-ball-92"
    },
    "gastly_sv5k_ar": {
        "character": "Gastly", "year": 2024, "set": "Wild Force SV5K",
        "name": "Gastly Art Rare AR #080/071", "grade": 10, "pc_usd": 85.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-wild-force/gastly-80-71"
    },
    
    # Giratina
    "giratina_s12a_vstar": {
        "character": "Giratina", "year": 2022, "set": "VSTAR Universe S12a",
        "name": "Giratina VSTAR RRR #111/172", "grade": 10, "pc_usd": 38.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/giratina-vstar-111-172"
    },
    "giratina_s12a_v": {
        "character": "Giratina", "year": 2022, "set": "VSTAR Universe S12a",
        "name": "Giratina V RR #110/172", "grade": 10, "pc_usd": 70.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/giratina-v-110-172"
    },
    "giratina_s11_ur": {
        "character": "Giratina", "year": 2022, "set": "Lost Abyss S11",
        "name": "Giratina VSTAR Gold Ultra Rare UR #125/100", "grade": 10, "pc_usd": 103.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-lost-abyss/giratina-vstar-125-100"
    },
    "giratina_movie_promo": {
        "character": "Giratina", "year": 2008, "set": "11th Movie Commemoration Set",
        "name": "Reverse World's Giratina Movie Promo Holo #005/009", "grade": 10, "pc_usd": 520.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-promo/giratina-005-009"
    },
    "giratina_sm12a_holo": {
        "character": "Giratina", "year": 2019, "set": "Tag Team GX All Stars SM12a",
        "name": "Giratina Holo #049/173", "grade": 10, "pc_usd": 75.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-tag-team-gx-all-stars/giratina-49-173"
    },
    "giratina_sm7b_holo": {
        "character": "Giratina", "year": 2018, "set": "Fairy Rise SM7b",
        "name": "Giratina Holo #017/050", "grade": 10, "pc_usd": 165.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-fairy-rise/giratina-17-50"
    },
    
    # Mimikyu
    "mimikyu_sm2l_holo": {
        "character": "Mimikyu", "year": 2017, "set": "Alolan Moonlight SM2L",
        "name": "Mimikyu Holo #020/050", "grade": 10, "pc_usd": 380.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-alolan-moonlight/mimikyu-20-50"
    },
    "mimikyu_s8b_csr": {
        "character": "Mimikyu", "year": 2021, "set": "VMAX Climax S8b",
        "name": "Mimikyu V Character Super Rare CSR #233/184", "grade": 10, "pc_usd": 150.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-vmax-climax/mimikyu-v-233-184"
    },
    "mimikyu_sv4a_s": {
        "character": "Mimikyu", "year": 2023, "set": "Shiny Treasure ex SV4a",
        "name": "Mimikyu Shiny Rare S #265/190", "grade": 10, "pc_usd": 85.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-shiny-treasure-ex/mimikyu-265-190"
    },
    "mimikyu_s8b_vmax": {
        "character": "Mimikyu", "year": 2021, "set": "VMAX Climax S8b",
        "name": "Mimikyu VMAX RRR #077/184", "grade": 10, "pc_usd": 65.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-vmax-climax/mimikyu-vmax-77-184"
    },
    "mimikyu_s5i_sr": {
        "character": "Mimikyu", "year": 2021, "set": "Single Strike Master S5I",
        "name": "Mimikyu V Full Art Super Rare SR #073/070", "grade": 10, "pc_usd": 160.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-single-strike-master/mimikyu-v-73-70"
    },
    
    # Gengar
    "gengar_fossil_1st": {
        "character": "Gengar", "year": 1999, "set": "Fossil",
        "name": "Gengar 1st Edition Non-Holo #20/62", "grade": 10, "pc_usd": 4000.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-fossil/gengar-1st-edition-20"
    },
    "gengar_xy4_ex": {
        "character": "Gengar", "year": 2014, "set": "Phantom Gate XY4",
        "name": "Gengar EX 1st Edition #033/088", "grade": 10, "pc_usd": 520.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-phantom-gate/gengar-ex-33-88"
    },
    "gengar_vmax_sa": {
        "character": "Gengar", "year": 2021, "set": "High Class Decks / SA",
        "name": "Gengar VMAX Ultra Rare #002/019", "grade": 10, "pc_usd": 95.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-high-class-deck-gengar-vmax/gengar-vmax-2-19"
    },
    "mega_gengar_ex": {
        "character": "Gengar", "year": 2024, "set": "Terastal Fest / Special Box",
        "name": "Mega Gengar EX #230/193", "grade": 10, "pc_usd": 70.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-promo/gengar"
    },
    "gengar_expedition_1st": {
        "character": "Gengar", "year": 2001, "set": "Expedition Base Set",
        "name": "Gengar 1st Edition Holo #117/128 (Swirl)", "grade": 9, "pc_usd": 2500.00,
        "pc_url": "https://www.pricecharting.com/game/pokemon-japanese-expedition/gengar-117-128"
    }
}

def identify_card(title):
    t = title.lower()
    # Chandelure
    if "chandelure" in t:
        if "059/131" in t or "cp4" in t: return "chandelure_cp4"
        if "102/086" in t or "sv11b" in t: return "chandelure_sv11b"
        if "mega" in t and "097" in t: return "chandelure_m5"
        if "069/067" in t or "s9a" in t or "battle region" in t: return "chandelure_s9a"
        if "102/100" in t or "fusion arts" in t: return "chandelure_s8"
    # Duskull
    if "duskull" in t:
        if "068/064" in t or "night wanderer" in t: return "duskull_sv6a"
        if "deoxys" in t or "#58" in t or " 58 " in t: return "duskull_deoxys"
        if "203/172" in t or "vstar universe" in t: return "duskull_s12a"
    # Haunter
    if "haunter" in t:
        if "master ball" in t or "093/165" in t: return "haunter_151_mb"
        if "022/021" in t or "starter set" in t: return "haunter_starter_ar"
    # Gastly
    if "gastly" in t:
        if "sabrina" in t or "yamabuki" in t or "lv.16" in t: return "sabrinas_gastly"
        if "master ball" in t or "092/165" in t: return "gastly_151_mb"
        if "080/071" in t or "wild force" in t: return "gastly_sv5k_ar"
    # Giratina
    if "giratina" in t:
        if "reverse world" in t or "005/009" in t or "11th movie" in t: return "giratina_movie_promo"
        if "125/100" in t or ("ur" in t and "lost abyss" in t): return "giratina_s11_ur"
        if "111/172" in t: return "giratina_s12a_vstar"
        if "110/172" in t: return "giratina_s12a_v"
        if "sm12a" in t or "tag team" in t or "all stars" in t: return "giratina_sm12a_holo"
        if "sm7b" in t or "017/050" in t or "fairy rise" in t: return "giratina_sm7b_holo"
    # Mimikyu
    if "mimikyu" in t:
        if "020" in t or "alolan moonlight" in t or "2017" in t: return "mimikyu_sm2l_holo"
        if "csr" in t or "233/184" in t: return "mimikyu_s8b_csr"
        if "265/190" in t or "shiny treasure" in t: return "mimikyu_sv4a_s"
        if "vmax" in t and "077/184" in t: return "mimikyu_s8b_vmax"
        if "073/070" in t or "single strike" in t: return "mimikyu_s5i_sr"
    # Gengar
    if "gengar" in t:
        if "#20" in t or "20/62" in t or "fossil 1st" in t: return "gengar_fossil_1st"
        if "phantom gate" in t or "033" in t: return "gengar_xy4_ex"
        if "vmax" in t and "002/019" in t: return "gengar_vmax_sa"
        if "mega gengar" in t or "230/193" in t: return "mega_gengar_ex"
        if "expedition" in t or "117" in t: return "gengar_expedition_1st"
    return None

classified = []
for it in raw_items:
    card_id_key = identify_card(it['title'])
    if not card_id_key:
        print(f"Warning: could not classify title: {it['title']}")
        continue
    meta = PC_CATALOG[card_id_key]
    
    # Pricing
    m_usd = re.search(r'US\s*\$([\d,.]+)', it.get('price', ''))
    if not m_usd:
        m_usd = re.search(r'\$([\d,.]+)', it.get('approxPrice', ''))
    if not m_usd:
        m_usd = re.search(r'\$([\d,.]+)', it.get('price', ''))
    price_usd = float(m_usd.group(1).replace(',', '')) if m_usd else 0.0
    
    # Seller
    m_tx = re.search(r'\((\d[\d,]*)\)', it.get('sellerSectionText', ''))
    tx_count = int(m_tx.group(1).replace(',', '')) if m_tx else 0
    m_fb = re.search(r'([\d.]+)%\s*positive', it.get('sellerFeedback', ''))
    fb_pct = float(m_fb.group(1)) if m_fb else 100.0
    
    classified.append({
        **it,
        "card_key": card_id_key,
        "character": meta["character"],
        "year": meta["year"],
        "set": meta["set"],
        "clean_name": meta["name"],
        "grade_num": meta["grade"],
        "pc_usd": meta["pc_usd"],
        "pc_url": meta["pc_url"],
        "price_usd": price_usd,
        "price_vnd": round(price_usd * 25460),
        "pc_vnd": round(meta["pc_usd"] * 25460),
        "diff_usd": round(price_usd - meta["pc_usd"], 2),
        "diff_pct": round(((price_usd - meta["pc_usd"]) / meta["pc_usd"]) * 100, 1),
        "tx_count": tx_count,
        "fb_pct": fb_pct
    })

print(f"Classified {len(classified)} total raw items.")

# Separate Auctions vs Buy It Now
auctions = [c for c in classified if c['isAuction'] or c['bidCount']]
bins = [c for c in classified if not (c['isAuction'] or c['bidCount'])]

print(f"Auctions (Excluded): {len(auctions)}")
print(f"Buy It Now (Kept): {len(bins)}")

# Deduplicate identical cards
from collections import defaultdict
grouped = defaultdict(list)
for b in bins:
    grouped[b['card_key']].append(b)

deduped = []
for k, items_in_group in grouped.items():
    if len(items_in_group) == 1:
        deduped.append(items_in_group[0])
    else:
        # Sort by: seller transactions >= 8000 first, then highest feedback, then lowest price
        sorted_items = sorted(
            items_in_group,
            key=lambda x: (
                1 if x['tx_count'] >= 8000 else 0,
                x['fb_pct'],
                -x['price_usd'] # lower price is preferred
            ),
            reverse=True
        )
        deduped.append(sorted_items[0])

print(f"Final unique verified Buy It Now cards: {len(deduped)}")

# Ensure image downloading for all 29 cards
os.makedirs('public/assets/cards/ghost', exist_ok=True)
os.makedirs('assets/cards/ghost', exist_ok=True)

for c in deduped:
    cid = f"gh_{c['card_key']}"
    c['id'] = cid
    img_url = c['imgs'][0] if c['imgs'] else ''
    local_path_pub = f"public/assets/cards/ghost/{cid}.webp"
    local_path_assets = f"assets/cards/ghost/{cid}.webp"
    
    if img_url:
        try:
            req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as r:
                content = r.read()
                with open(local_path_pub, 'wb') as f:
                    f.write(content)
                with open(local_path_assets, 'wb') as f:
                    f.write(content)
                c['image_local'] = f"/assets/cards/ghost/{cid}.webp"
                c['image_bytes'] = len(content)
        except Exception as e:
            print(f"Image error for {cid}: {e}")

with open('scripts/ghost_cards_verified_29.json', 'w', encoding='utf-8') as f:
    json.dump(deduped, f, indent=2, ensure_ascii=False)

print("Saved verified cards to scripts/ghost_cards_verified_29.json!")
