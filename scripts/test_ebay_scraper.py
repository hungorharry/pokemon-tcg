import urllib.request, urllib.parse, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

def scrape_ebay_query(query):
    url = f"https://www.ebay.com/sch/i.html?_nkw={urllib.parse.quote(query)}&LH_BIN=1&_sop=12&_ipg=60"
    print(f"Fetching: {url}")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            # Split items
            raw_items = re.findall(r'<li[^>]*class=\"s-item[^\"]*\"[^>]*>(.*?)</li>', html, re.DOTALL)
            items = []
            for itm in raw_items:
                m_title = re.search(r'<div[^>]*class=\"s-item__title\"[^>]*>(?:<span[^>]*>)?(.*?)(?:</span>)?</div>', itm)
                m_price = re.search(r'<span[^>]*class=\"s-item__price\"[^>]*>(.*?)</span>', itm)
                m_link = re.search(r'href=\"(https://www\.ebay\.com/itm/\d+)[^\"]*\"', itm)
                m_img = re.search(r'src=\"(https://i\.ebayimg\.com/[^\"]+)\"', itm)
                
                if not m_title or not m_link or not m_price:
                    continue
                title = re.sub(r'<[^>]+>', '', m_title.group(1)).strip()
                if 'Shop on eBay' in title:
                    continue
                price = re.sub(r'<[^>]+>', '', m_price.group(1)).strip()
                link = m_link.group(1)
                img = m_img.group(1) if m_img else ''
                
                items.append({
                    'title': title,
                    'price': price,
                    'link': link,
                    'img': img
                })
            return items
    except Exception as e:
        print("Scrape error:", e)
        return []

items = scrape_ebay_query("Charizard Vintage PSA")
print(f"Found {len(items)} items for Charizard Vintage PSA")
for it in items[:5]:
    print(it['title'][:60], '|', it['price'], '|', it['link'])

