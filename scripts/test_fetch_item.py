import urllib.request
import re
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = 'https://www.ebay.com/itm/267440444703'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        html = r.read().decode('utf-8', errors='ignore')
        print(f"Status: {r.status}, Length: {len(html)}")
        m_title = re.search(r'<title>(.*?)</title>', html)
        print("Title:", m_title.group(1) if m_title else "None")
        
        # Check price
        m_price = re.search(r'itemprop="price"[^>]*content="([^"]+)"', html)
        if not m_price:
            m_price = re.search(r'class="x-price-primary"[^>]*>.*?<span[^>]*class="ux-textspans"[^>]*>([^<]+)</span>', html, re.DOTALL)
        print("Price match:", m_price.group(1) if m_price else "Not found")
        
        # Check image
        m_img = re.search(r'class="ux-image-filmstrip-carousel.*?<img[^>]*src="([^"]+)"', html, re.DOTALL)
        if not m_img:
            m_img = re.search(r'https://i\.ebayimg\.com/images/g/[^/]+/s-l\d+\.(?:webp|jpg)', html)
        print("Image match:", m_img.group(0) if m_img else "Not found")
except Exception as e:
    print("Error:", e)
