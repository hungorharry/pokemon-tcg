import json
import re
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

files_to_check = [
    ('Charizard', 'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/6734/output.txt', 'eBay Top Rated Seller (>8,000 transactions, 99.7%)', 25000, 99.7),
    ('Pikachu', 'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/6740/output.txt', 'eBay Top Rated Seller (>8,000 transactions, 99.7%)', 25000, 99.7),
    ('Charizard', 'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/6748/output.txt', 'Official PSA Store (>140K transactions, 99.8%)', 140000, 99.8),
    ('Pikachu', 'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/6754/output.txt', 'Official PSA Store (>140K transactions, 99.8%)', 140000, 99.8),
]

all_items = []

for default_char, filepath, seller_name, tx_count, feedback in files_to_check:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    start_idx = content.find('[\n')
    if start_idx == -1:
        start_idx = content.find('[')
    end_idx = content.rfind('\n]')
    if end_idx == -1:
        end_idx = content.rfind(']')
    else:
        end_idx += 2 # include \n]

    if start_idx == -1 or end_idx == -1:
        continue

    json_str = content[start_idx:end_idx].strip()
    # If trailing characters, find matching bracket
    try:
        items = json.loads(json_str)
    except Exception as e:
        # Fallback regex search for last valid closing bracket
        try:
            bracket_end = content.find('\n### Ran Playwright code')
            if bracket_end != -1:
                clean_json = content[start_idx:bracket_end].strip()
                items = json.loads(clean_json)
            else:
                print(f"Failed to parse {filepath}: {e}")
                continue
        except Exception as e2:
            print(f"Failed to parse fallback {filepath}: {e2}")
            continue

    for it in items:
        title = it.get('title', '').strip()
        full_text = it.get('fullText', '')
        link = it.get('link', '')
        img = it.get('img', '')

        if not title or not link or not img:
            continue
        if 'Shop on eBay' in title:
            continue
        
        # BIDS CHECK: MUST BE BUY IT NOW
        lower_text = full_text.lower()
        if '0 bids' in lower_text or '1 bid' in lower_text or 'bids ·' in lower_text:
            continue

        # Character identification
        is_cz = 'charizard' in title.lower() or 'charizard' in full_text.lower()
        is_pk = 'pikachu' in title.lower() or 'pikachu' in full_text.lower()
        if not is_cz and not is_pk:
            continue
        char = 'Charizard' if is_cz else 'Pikachu'

        # Grade extraction
        m_grade = re.search(r'\bPSA\s*(\d+(?:\.\d+)?)\b', title, re.IGNORECASE)
        if not m_grade:
            m_grade = re.search(r'\bPSA\s*(\d+(?:\.\d+)?)\b', full_text, re.IGNORECASE)
        if not m_grade:
            # Check CGC
            m_cgc = re.search(r'\bCGC\s*(\d+(?:\.\d+)?)\b', title, re.IGNORECASE)
            if m_cgc:
                grade_num = float(m_cgc.group(1))
                grade_str = f"CGC {m_cgc.group(1)}"
            else:
                continue
        else:
            grade_num = float(m_grade.group(1))
            grade_str = f"PSA {m_grade.group(1)}"

        # Price in VND
        price_vnd = 0
        m_vnd = re.search(r'([\d,.]+)\s*VND', full_text)
        if m_vnd:
            raw_vnd = m_vnd.group(1).replace(',', '')
            try:
                price_vnd = float(raw_vnd)
            except:
                pass
        if price_vnd == 0:
            m_usd = re.search(r'\$([\d,.]+)', full_text)
            if m_usd:
                try:
                    price_vnd = float(m_usd.group(1).replace(',', '')) * 25460
                except:
                    pass
        if price_vnd <= 0:
            continue

        # Exclude > 400M VND
        if price_vnd > 400000000:
            continue

        price_usd = round(price_vnd / 25460, 2)

        all_items.append({
            'character': char,
            'title': title,
            'grade': grade_num,
            'grade_str': grade_str,
            'price_vnd': price_vnd,
            'price_usd': price_usd,
            'link': link,
            'img': img,
            'seller': seller_name,
            'sellerTransactions': tx_count,
            'sellerFeedback': feedback,
            'full_text': full_text
        })

print(f"Total valid candidates under 400M VND: {len(all_items)}")

cz_candidates = [it for it in all_items if it['character'] == 'Charizard']
pk_candidates = [it for it in all_items if it['character'] == 'Pikachu']

print(f"Charizard candidates: {len(cz_candidates)}")
print(f"Pikachu candidates: {len(pk_candidates)}")

for it in cz_candidates[:8]:
    print(f"CZ [{it['grade_str']}] {it['title'][:55]} | {it['price_vnd']:,.0f} VND (${it['price_usd']})")

for it in pk_candidates[:8]:
    print(f"PK [{it['grade_str']}] {it['title'][:55]} | {it['price_vnd']:,.0f} VND (${it['price_usd']})")
