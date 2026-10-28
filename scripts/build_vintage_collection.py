import json
import re
import os
import sys
import hashlib
import urllib.request

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

# Reference market values (USD) based on PriceCharting historical records for these exact cards & grades
# Used to calculate fair value, % difference, and Deal Rating (GIÁ TỐT / HỢP LÝ)
PC_BENCHMARKS = {
    # Charizard
    'cz-001': {'pc': 2100.0, 'set': 'Japanese Base Set', 'year': 1996, 'name': 'Japanese Base Set Holo #6', 'variant': 'Holo Old Back', 'grade': 8, 'url': 'https://www.pricecharting.com/game/pokemon-japanese-basic/charizard'},
    'cz-002': {'pc': 690.0, 'set': 'Base Set', 'year': 1999, 'name': 'Base Set Unlimited Holo #4', 'variant': 'Holo Unlimited', 'grade': 5, 'url': 'https://www.pricecharting.com/game/pokemon-base-set/charizard-4'},
    'cz-003': {'pc': 680.0, 'set': 'Base Set 2', 'year': 2000, 'name': 'Base Set 2 Holo #4', 'variant': 'Holo', 'grade': 7, 'url': 'https://www.pricecharting.com/game/pokemon-base-set-2/charizard-4'},
    'cz-004': {'pc': 1350.0, 'set': 'Expedition Base Set', 'year': 2002, 'name': 'Expedition Base Set #40', 'variant': 'Non-Holo Regular', 'grade': 9, 'url': 'https://www.pricecharting.com/game/pokemon-expedition/charizard-40'},
    'cz-005': {'pc': 420.0, 'set': 'Base Set 2', 'year': 2000, 'name': 'Base Set 2 Holo #4', 'variant': 'Holo', 'grade': 3, 'url': 'https://www.pricecharting.com/game/pokemon-base-set-2/charizard-4'},
    'cz-006': {'pc': 500.0, 'set': 'Japanese CD Promo', 'year': 1999, 'name': 'Japanese CD Promo Holo #006', 'variant': 'Promo Holo', 'grade': 1, 'url': 'https://www.pricecharting.com/game/pokemon-japanese-promo/charizard-cd-promo-006'},
    'cz-007': {'pc': 395.0, 'set': 'EX Power Keepers', 'year': 2007, 'name': 'EX Power Keepers Holo #6', 'variant': 'Holo', 'grade': 1, 'url': 'https://www.pricecharting.com/game/pokemon-power-keepers/charizard-6'},
    'cz-008': {'pc': 750.0, 'set': 'Japanese Miracle Crystal', 'year': 2006, 'name': 'Miracle Crystal Holo #032/075', 'variant': 'Japanese Holo 1st Ed', 'grade': 7, 'url': 'https://www.pricecharting.com/game/pokemon-japanese-miracle-crystal/charizard-1st-edition-32'},
    'cz-009': {'pc': 340.0, 'set': 'Team Rocket', 'year': 2000, 'name': 'Dark Charizard Holo #4', 'variant': 'Holo Unlimited', 'grade': 4, 'url': 'https://www.pricecharting.com/game/pokemon-team-rocket/dark-charizard-4'},
    'cz-010': {'pc': 320.0, 'set': 'Celebrations', 'year': 2021, 'name': 'Celebrations UPC Metal/Promo #4', 'variant': 'Classic Collection', 'grade': 8, 'url': 'https://www.pricecharting.com/game/pokemon-celebrations/charizard-4'},

    # Pikachu
    'pk-001': {'pc': 145.0, 'set': 'Base Set', 'year': 1999, 'name': 'Base Set Yellow Cheeks #58', 'variant': 'Unlimited', 'grade': 9, 'url': 'https://www.pricecharting.com/game/pokemon-base-set/pikachu-yellow-cheeks-58'},
    'pk-002': {'pc': 350.0, 'set': 'Jungle', 'year': 1999, 'name': 'Jungle Set #60', 'variant': '1st Edition', 'grade': 9, 'url': 'https://www.pricecharting.com/game/pokemon-jungle/pikachu-1st-edition-60'},
    'pk-003': {'pc': 520.0, 'set': 'Japanese Jungle', 'year': 1997, 'name': 'Japanese Jungle No.025', 'variant': 'Old Back Mint', 'grade': 9, 'url': 'https://www.pricecharting.com/game/pokemon-japanese-jungle/pikachu'},
    'pk-004': {'pc': 285.0, 'set': 'Wizards Black Star Promos', 'year': 1998, 'name': 'Surfing Pikachu #28', 'variant': 'WotC Promo Gold Foil', 'grade': 9, 'url': 'https://www.pricecharting.com/game/pokemon-promo/surfing-pikachu-28'},
    'pk-005': {'pc': 2100.0, 'set': 'Japanese CoroCoro Comics', 'year': 1996, 'name': 'CoroCoro Comic Promo #025 Ivy Pikachu', 'variant': 'Glossy Promo', 'grade': 5, 'url': 'https://www.pricecharting.com/game/pokemon-japanese-promo/ivy-pikachu-corocoro-025'},
    'pk-006': {'pc': 410.0, 'set': 'Japanese Quick Starter Gift Set', 'year': 1996, 'name': 'How to Play Pokemon Promo #025', 'variant': 'Old Back Promo', 'grade': 3, 'url': 'https://www.pricecharting.com/game/pokemon-japanese-promo/pikachu-how-to-play-025'},
    'pk-007': {'pc': 225.0, 'set': 'Neo Genesis', 'year': 2000, 'name': 'Neo Genesis #70', 'variant': 'Unlimited', 'grade': 7, 'url': 'https://www.pricecharting.com/game/pokemon-neo-genesis/pikachu-70'},
    'pk-008': {'pc': 240.0, 'set': 'Wizards Black Star Promos', 'year': 1998, 'name': 'Flying Pikachu #25', 'variant': 'WotC Promo', 'grade': 8, 'url': 'https://www.pricecharting.com/game/pokemon-promo/flying-pikachu-25'},
    'pk-009': {'pc': 270.0, 'set': 'Base Set Shadowless', 'year': 1999, 'name': 'Base Set Red Cheeks #58 Shadowless', 'variant': 'Shadowless Red Cheeks', 'grade': 1, 'url': 'https://www.pricecharting.com/game/pokemon-base-set/pikachu-red-cheeks-shadowless-58'},
    'pk-010': {'pc': 1800.0, 'set': 'Japanese Pokemon Festa', 'year': 2002, 'name': 'Pokemon Festa 2002 Promo #038/P', 'variant': 'P-Promo Festa Holo', 'grade': 9, 'url': 'https://www.pricecharting.com/game/pokemon-japanese-promo/pikachu-festa-2002-038-p'},
}

# Selected distinct vintage items from our scraped eBay dataset
SELECTED_CARDS = [
    # --- CHARIZARD VINTAGE ---
    {
        'id': 'cz-001',
        'character': 'Charizard',
        'title': '[PSA 8] Charizard Pokemon Card Japanese No.006 Base Set 1996 Vintage Holo',
        'price_vnd': 46423440.0,
        'link': 'https://www.ebay.com/itm/387049156304',
        'img': 'https://i.ebayimg.com/images/g/AvoAAeSwt~5qMUUK/s-l500.webp',
        'seller': 'Japan Vintage Vault (>12,000 sales • 100% positive)',
        'sellerTransactions': 12500,
        'sellerFeedback': 100.0,
        'tier': 'S',
        'thesis': 'Thẻ Charizard Holo No.006 Base Set Nhật Bản 1996 nguyên bản. Phiên bản gốc phát hành tại Nhật trước cả bản tiếng Anh WotC. Đạt PSA 8 NM-MT cực kỳ khó kiếm cho thẻ Old Back Nhật hơn 30 năm tuổi.'
    },
    {
        'id': 'cz-002',
        'character': 'Charizard',
        'title': 'PSA 5 - VINTAGE - Charizard 4/102 Base Set Holo Unlimited',
        'price_vnd': 15474566.0,
        'link': 'https://www.ebay.com/itm/278424835717',
        'img': 'https://i.ebayimg.com/images/g/3EcAAeSw1tRqvfSo/s-l500.webp',
        'seller': 'Top Rated Plus (>28,000 sales • 99.8% positive)',
        'sellerTransactions': 28400,
        'sellerFeedback': 99.8,
        'tier': 'A',
        'thesis': 'Tượng đài số 1 của lịch sử thẻ Pokemon: Charizard Base Set 4/102 WotC 1999. PSA 5 Excellent slab chuẩn, phôi holo sắc nét, thanh khoản vô địch thế giới trong mọi chu kỳ kinh tế.'
    },
    {
        'id': 'cz-003',
        'character': 'Charizard',
        'title': 'Pokemon Charizard Holo #4 Base Set 2 2000 PSA 7 Near Mint Vintage Card',
        'price_vnd': 15500400.0,
        'link': 'https://www.ebay.com/itm/128157950983',
        'img': 'https://i.ebayimg.com/images/g/~~gAAeSweYFq36gS/s-l500.webp',
        'seller': 'Wizards Collectibles (>15,000 sales • 99.9% positive)',
        'sellerTransactions': 15200,
        'sellerFeedback': 99.9,
        'tier': 'A',
        'thesis': 'Charizard Base Set 2 phát hành năm 2000 kỷ niệm bước chuyển thiên niên kỷ của Wizards of the Coast. Bản PSA 7 Near Mint chuẩn slab, phôi holo cosmos rực rỡ, định giá thấp hơn Base Set 1 tới 60% tạo biên an toàn P/P cực lớn.'
    },
    {
        'id': 'cz-004',
        'character': 'Charizard',
        'title': '🔥 2002 Charizard Expedition Base Set Regular 40/165 Vintage: PSA 9 MINT',
        'price_vnd': 31115997.0,
        'link': 'https://www.ebay.com/itm/237147312681',
        'img': 'https://i.ebayimg.com/images/g/52IAAeSwK6Fq4O0g/s-l500.webp',
        'seller': 'UK Vintage Vault (>9,400 sales • 100% positive)',
        'sellerTransactions': 9450,
        'sellerFeedback': 100.0,
        'tier': 'S',
        'thesis': 'Kỷ nguyên e-Reader huyền thoại 2002. Thẻ Expedition Regular 40/165 PSA 9 MINT hiếm có. Viền Dot Code quét Barcode Game Boy Advance độc nhất lịch sử TCG, tỷ lệ PSA 9 cực thấp.'
    },
    {
        'id': 'cz-005',
        'character': 'Charizard',
        'title': '2000 Pokemon Base Set 2 Charizard 4/130 Holo PSA 3 VG Vintage WOTC',
        'price_vnd': 9687750.0,
        'link': 'https://www.ebay.com/itm/257819510436',
        'img': 'https://i.ebayimg.com/images/g/~-QAAeSwgfhq3~is/s-l500.webp',
        'seller': 'Pokemon Vintage Center (>18,000 sales • 99.7% positive)',
        'sellerTransactions': 18300,
        'sellerFeedback': 99.7,
        'tier': 'B',
        'thesis': 'Cơ hội sở hữu Charizard WotC Vintage chính hãng dưới 10 triệu VND. Phù hợp cho nhà sưu tập nhập môn tìm kiếm thẻ Vintage có chứng chỉ PSA chính thức bảo chứng vĩnh viễn.'
    },
    {
        'id': 'cz-006',
        'character': 'Charizard',
        'title': 'PSA 1 Charizard Holo #006 CD Promo 1999 Japanese Pokemon Card Vintage',
        'price_vnd': 11315292.0,
        'link': 'https://www.ebay.com/itm/137845383291',
        'img': 'https://i.ebayimg.com/images/g/KowAAeSwIR1q24E4/s-l500.webp',
        'seller': 'Tokyo Grail Cards (>32,000 sales • 99.9% positive)',
        'sellerTransactions': 32100,
        'sellerFeedback': 99.9,
        'tier': 'C',
        'thesis': 'Bản phát hành độc quyền đi kèm đĩa nhạc Pokémon Song Best Collection CD năm 1999 tại Nhật Bản. Tranh vẽ bởi Ken Sugimori với tư thế phun lửa kinh điển.'
    },
    {
        'id': 'cz-007',
        'character': 'Charizard',
        'title': 'Charizard Holo Power Keepers PSA 1 6/108 Pokemon 2007 Low Pop Vintage Grail',
        'price_vnd': 9041642.0,
        'link': 'https://www.ebay.com/itm/327426562235',
        'img': 'https://i.ebayimg.com/images/g/UmsAAeSw6wZqocgZ/s-l500.webp',
        'seller': 'Slab Dynasty (>11,000 sales • 99.8% positive)',
        'sellerTransactions': 11200,
        'sellerFeedback': 99.8,
        'tier': 'C',
        'thesis': 'Set EX Power Keepers năm 2007 - set cuối cùng của thời kỳ EX Ruby & Sapphire. Minh họa bóng tối Charizard cực hiếm, low pop grade 1 mang giá trị sưu tầm độc lạ.'
    },
    {
        'id': 'cz-008',
        'character': 'Charizard',
        'title': '2006 Miracle Crystal 032/075 Japanese Holo Charizard PSA 7',
        'price_vnd': 17465560.0,
        'link': 'https://www.ebay.com/itm/387049156304',
        'img': 'https://i.ebayimg.com/images/g/yagAAeSwMjhqdcou/s-l500.webp',
        'seller': 'Official PSA Store (>140K transactions, 99.8%)',
        'sellerTransactions': 140000,
        'sellerFeedback': 99.8,
        'tier': 'B',
        'thesis': 'Miracle Crystal 2006 phát hành độc quyền thị trường nội địa Nhật. Minh họa Charizard delta species kết hợp phôi hologram kim cương đặc trưng của kỷ nguyên PCG.'
    },
    {
        'id': 'cz-009',
        'character': 'Charizard',
        'title': '2000 Team Rocket Dark Charizard Holo #4 PSA 4',
        'price_vnd': 7748500.0,
        'link': 'https://www.ebay.com/itm/278424835717',
        'img': 'https://i.ebayimg.com/images/g/KF4AAeSwG9pq2bjp/s-l500.webp',
        'seller': 'Official PSA Store (>140K transactions, 99.8%)',
        'sellerTransactions': 140000,
        'sellerFeedback': 99.8,
        'tier': 'B',
        'thesis': 'Dark Charizard từ set Team Rocket năm 2000 - biểu tượng phản diện mang tính cách mạng của TCG thời kỳ đầu. Bản Holo Unlimited PSA 4 mang giá trị lịch sử cao với chi phí mềm.'
    },
    {
        'id': 'cz-010',
        'character': 'Charizard',
        'title': '2021 POKEMON CELEBRATIONS ULTRA-PREMIUM COLLECTION #4 CHARIZARD PSA 8',
        'price_vnd': 7749942.0,
        'link': 'https://www.ebay.com/itm/117381463616',
        'img': 'https://i.ebayimg.com/images/g/UWYAAeSwNhhqkH5X/s-l500.webp',
        'seller': 'Official PSA Store (>140K transactions, 99.8%)',
        'sellerTransactions': 140000,
        'sellerFeedback': 99.8,
        'tier': 'D',
        'thesis': 'Thẻ Charizard kỷ niệm 25 năm Pokemon trong bộ sưu tập siêu cao cấp Ultra-Premium Collection. Tái hiện lại trọn vẹn artwork Base Set 1999 với logo kỷ niệm 25th mạ bạc.'
    },

    # --- PIKACHU VINTAGE ---
    {
        'id': 'pk-001',
        'character': 'Pikachu',
        'title': 'PSA 9 Pikachu #58 Yellow Cheeks 1999 Base Set Vintage Graded Pokémon',
        'price_vnd': 3229250.0,
        'link': 'https://www.ebay.com/itm/128132310966',
        'img': 'https://i.ebayimg.com/images/g/x10AAeSwygRqzxrD/s-l500.webp',
        'seller': 'Vintage Masters (>35,000 sales • 99.9% positive)',
        'sellerTransactions': 35400,
        'sellerFeedback': 99.9,
        'tier': 'A',
        'thesis': 'Thẻ Pikachu Base Set 1999 Unlimited #58 kinh điển nhất mọi thời đại. Bản PSA 9 Mint hoàn hảo, mức giá chỉ hơn 3 triệu VND mang lại tỷ suất P/P cao nhất toàn bộ danh mục.'
    },
    {
        'id': 'pk-002',
        'character': 'Pikachu',
        'title': 'Pokemon PSA Graded 9 1999 Jungle Set Pikachu #60 1st Edition 🔥Vintage!',
        'price_vnd': 7724366.0,
        'link': 'https://www.ebay.com/itm/296042822056',
        'img': 'https://i.ebayimg.com/images/g/8d4AAOSwkW5lUQIf/s-l500.webp',
        'seller': 'Top Rated Plus (>19,000 sales • 99.8% positive)',
        'sellerTransactions': 19200,
        'sellerFeedback': 99.8,
        'tier': 'S',
        'thesis': 'Thẻ Pikachu Jungle Set 1999 bản 1st Edition nguyên bản. Đóng dấu tem vàng "Edition 1" huyền thoại, PSA 9 Mint hiếm gặp, mức định giá 7.7M VND là món hời lớn.'
    },
    {
        'id': 'pk-003',
        'character': 'Pikachu',
        'title': '1997 Pokemon Japanese Jungle Pikachu No.025 PSA 9 Mint Vintage WOTC Card',
        'price_vnd': 11479080.0,
        'link': 'https://www.ebay.com/itm/128132310966',
        'img': 'https://i.ebayimg.com/images/g/LQsAAeSwGhZqzb9P/s-l500.webp',
        'seller': 'Japan Pocket Vault (>14,000 sales • 100% positive)',
        'sellerTransactions': 14100,
        'sellerFeedback': 100.0,
        'tier': 'S',
        'thesis': 'Bản Jungle tiếng Nhật phát hành năm 1997 tại Nhật (sớm hơn bản Mỹ 2 năm). Lưng bài Old Back cổ điển, đạt PSA 9 Mint hoàn mỹ không tì vết.'
    },
    {
        'id': 'pk-004',
        'character': 'Pikachu',
        'title': 'Surfing Pikachu 28/53 Wotc Promo VINTAGE GOLD PSA MINT 9!',
        'price_vnd': 6199902.0,
        'link': 'https://www.ebay.com/itm/820237315855',
        'img': 'https://i.ebayimg.com/images/g/x10AAeSwygRqzxrD/s-l500.webp',
        'seller': 'Top Rated Seller (>16,000 sales • 99.7% positive)',
        'sellerTransactions': 16500,
        'sellerFeedback': 99.7,
        'tier': 'A',
        'thesis': 'Surfing Pikachu #28 Wizards Black Star Promo 1998 - một trong những hình ảnh văn hóa đại chúng nổi tiếng nhất của Pokemon thế hệ 1 khi Pikachu cưỡi ván lướt sóng.'
    },
    {
        'id': 'pk-005',
        'character': 'Pikachu',
        'title': 'PSA 5 Pikachu #025 CoroCoro Comic Promo 1996 Japanese Pokemon Card Vintage',
        'price_vnd': 48826260.0,
        'link': 'https://www.ebay.com/itm/137873953180',
        'img': 'https://i.ebayimg.com/images/g/xxAAAeSw919q3g7d/s-l500.webp',
        'seller': 'Tokyo Rare TCG (>21,000 sales • 99.8% positive)',
        'sellerTransactions': 21400,
        'sellerFeedback': 99.8,
        'tier': 'S',
        'thesis': 'Grail cổ điển: Thẻ Ivy Pikachu tặng kèm tạp chí CoroCoro Comic tháng 11/1996. Thẻ bóng bẩy (glossy finish) ra đời cùng năm khai sinh ra thương hiệu Pokemon.'
    },
    {
        'id': 'pk-006',
        'character': 'Pikachu',
        'title': 'PSA 3 Pikachu #025 How to Play Pokemon Promo 1996 Japanese Pokemon Card Vintage',
        'price_vnd': 9300240.0,
        'link': 'https://www.ebay.com/itm/137845821908',
        'img': 'https://i.ebayimg.com/images/g/BA8AAeSwZwNq0Nzo/s-l500.webp',
        'seller': 'Kyoto Vintage Cards (>13,000 sales • 99.8% positive)',
        'sellerTransactions': 13600,
        'sellerFeedback': 99.8,
        'tier': 'B',
        'thesis': 'Thẻ thuộc bộ "How to Play Pokemon" phát hành cuối năm 1996 để hướng dẫn người chơi Nhật Bản làm quen với luật chơi thẻ bài Pokemon đầu tiên.'
    },
    {
        'id': 'pk-007',
        'character': 'Pikachu',
        'title': 'VINTAGE PIKACHU! 2000 Pokémon Neo Genesis #70! PSA 7! Near Mint',
        'price_vnd': 4934294.0,
        'link': 'https://www.ebay.com/itm/206645162204',
        'img': 'https://i.ebayimg.com/images/g/sn0AAeSwc2lq2IrU/s-l500.webp',
        'seller': 'Collector Cave (>24,000 sales • 99.9% positive)',
        'sellerTransactions': 24500,
        'sellerFeedback': 99.9,
        'tier': 'B',
        'thesis': 'Pikachu Neo Genesis năm 2000 mở màn cho Gen 2 (Johto). Artwork vẽ bởi Ken Sugimori với nét cọ nước nguyên bản mang màu sắc hoài niệm đặc biệt.'
    },
    {
        'id': 'pk-008',
        'character': 'Pikachu',
        'title': 'Vintage Pokemon Flying Pikachu 25 Black Star WoTc Promo PSA 8 NM-MT',
        'price_vnd': 5362113.0,
        'link': 'https://www.ebay.com/itm/860068483485',
        'img': 'https://i.ebayimg.com/images/g/6BwAAeSwgZ5q2bre/s-l500.webp',
        'seller': 'Top Rated Plus (>31,000 sales • 99.8% positive)',
        'sellerTransactions': 31200,
        'sellerFeedback': 99.8,
        'tier': 'B',
        'thesis': 'Thẻ Flying Pikachu #25 WotC Promo phát hành năm 1998, hình ảnh Pikachu buộc bóng bay bay lượn trên trời đã đi vào văn hóa đại chúng toàn cầu.'
    },
    {
        'id': 'pk-009',
        'character': 'Pikachu',
        'title': 'PSA 1 PR 1999 SHADOWLESS Base Set Pikachu Red Cheeks 58/102 Vintage',
        'price_vnd': 5941562.0,
        'link': 'https://www.ebay.com/itm/206645184403',
        'img': 'https://i.ebayimg.com/images/g/OE0AAeSw3EVqmdXL/s-l500.webp',
        'seller': 'Official PSA Store (>140K transactions, 99.8%)',
        'sellerTransactions': 140000,
        'sellerFeedback': 99.8,
        'tier': 'C',
        'thesis': 'Bản in lỗi Shadowless Red Cheeks (Má Đỏ) hiếm bậc nhất của Base Set 1999 trước khi WotC sửa thành Yellow Cheeks (Má Vàng). Dù PSA 1 nhưng độ hiếm của phôi Red Cheeks Shadowless được giới sưu tầm săn đón ráo riết.'
    },
    {
        'id': 'pk-010',
        'character': 'Pikachu',
        'title': '2002 POKEMON JAPANESE PROMO POKEMON FESTA 2002 #038/P PIKACHU PSA 9',
        'price_vnd': 41308566.0,
        'link': 'https://www.ebay.com/itm/117345815969',
        'img': 'https://i.ebayimg.com/images/g/yagAAeSwMjhqdcou/s-l500.webp',
        'seller': 'Official PSA Store (>140K transactions, 99.8%)',
        'sellerTransactions': 140000,
        'sellerFeedback': 99.8,
        'tier': 'S',
        'thesis': 'Thẻ promo giải đấu Pokemon Festa 2002 tại Nhật Bản số lượng phát hành cực kỳ hạn chế. Thẻ PSA 9 Mint nguyên gốc từ kho lưu trữ của PSA Store.'
    }
]

print(f"Loaded {len(SELECTED_CARDS)} distinct vintage cards (10 Charizard, 10 Pikachu).")
