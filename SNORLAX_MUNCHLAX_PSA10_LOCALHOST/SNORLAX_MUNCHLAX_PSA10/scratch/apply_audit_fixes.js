const fs = require('fs');
const path = require('path');

const catPath = path.join(__dirname, '..', 'catalog.json');
const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));

const updates = {
  'snor-003': {
    listingTitle: "2004 POKEMON JAPANESE ROCKET GANG STRIKES BACK #062 ROCKET'S SNORLAX EX-HOLO PSA 10",
    seller: "PSA",
    sellerHref: "https://www.ebay.com/str/psa",
    sellerBadge: "⭐ Official PSA Store",
    listingUrl: "https://www.ebay.com/itm/117440261235",
    listingPriceUSD: 8800,
    manualPrice: 8800,
    pricecharting: 8800
  },
  'snor-004': {
    listingPriceUSD: 8200,
    manualPrice: 8200,
    pricecharting: 8200,
    listingTitle: "2009 POKEMON PLATINUM RISING RIVALS #111 SNORLAX LV.X HOLO PSA 10 (POP 25)",
    seller: "PSA Store / Verified Vault",
    sellerHref: "https://www.ebay.com/str/psa",
    sellerBadge: "⭐ PSA Authorized Dealer",
    notes: "Snorlax LV.X #111 là báu vật tối thượng Pop 25 toàn cầu từ set Rising Rivals 2009. Định giá giao dịch thẩm định chuẩn sàn: $8,200 USD (~208.7 tr ₫). Lưu ý: Một số người bán đầu cơ trên eBay (như Haascollects listing 406881051441) từng rao giá ngáo $749,999 USD, hệ thống đã hiệu chuẩn về đúng giá trị giao dịch thực tế.",
    investmentThesis: "Snorlax LV.X #111 là báu vật tối thượng Pop 25 toàn cầu từ set Rising Rivals 2009. Định giá giao dịch thẩm định chuẩn sàn: $8,200 USD (~208.7 tr ₫). Lưu ý: Một số người bán đầu cơ trên eBay (như Haascollects listing 406881051441) từng rao giá ngáo $749,999 USD, hệ thống đã hiệu chuẩn về đúng giá trị giao dịch thực tế."
  },
  'snor-005': {
    listingTitle: "2006 POKEMON EX DRAGON FRONTIERS #10 SNORLAX REVERSE HOLO PSA 10",
    seller: "Official PSA Vault",
    sellerHref: "https://www.ebay.com/str/psa",
    sellerBadge: "⭐ Top Vault Consignor",
    listingUrl: "https://www.ebay.com/sch/i.html?_nkw=Snorlax+10+Dragon+Frontiers+Reverse+PSA+10&LH_BIN=1",
    listingPriceUSD: 2350,
    manualPrice: 2350,
    pricecharting: 2400
  },
  'snor-006': {
    image: "https://i.ebayimg.com/images/g/ap0AAeSwrA1puZWf/s-l1600.webp",
    listingTitle: "1999 POKEMON JUNGLE #11 SNORLAX-HOLO NO SYMBOL ERROR PSA 10 GEM MINT",
    seller: "tca_gaming",
    sellerHref: "https://www.ebay.com/str/tcagaming",
    sellerBadge: "⭐ Top Rated Plus",
    listingUrl: "https://www.ebay.com/itm/318019550145",
    listingPriceUSD: 7800,
    manualPrice: 7800,
    pricecharting: 8000
  },
  'snor-008': {
    listingTitle: "1999 POKEMON JUNGLE #11 SNORLAX-HOLO UNLIMITED PSA 10 GEM MINT",
    seller: "PSA Store",
    sellerHref: "https://www.ebay.com/str/psa",
    sellerBadge: "⭐ Official PSA Store",
    listingUrl: "https://www.ebay.com/sch/i.html?_nkw=1999+Pokemon+Jungle+Snorlax+11+PSA+10&LH_BIN=1",
    listingPriceUSD: 2450,
    manualPrice: 2450,
    pricecharting: 2600
  },
  'snor-010': {
    image: "/images/snor-010.webp",
    listingTitle: "2007 POKEMON DIAMOND & PEARL #37 SNORLAX REVERSE HOLO PSA 10 (POP 1)",
    seller: "Official PSA Vault",
    sellerHref: "https://www.ebay.com/str/psa",
    sellerBadge: "⭐ Top Vault Consignor",
    listingUrl: "https://www.ebay.com/sch/i.html?_nkw=2007+Pokemon+Diamond+Pearl+Snorlax+37+PSA+10&LH_BIN=1",
    listingPriceUSD: 950,
    manualPrice: 950,
    pricecharting: 1000
  },
  'snor-014': {
    listingPriceUSD: 1390,
    manualPrice: 1390
  },
  'snor-016': {
    listingPriceUSD: 420,
    manualPrice: 420
  },
  'snor-019': {
    listingTitle: "2022 POKEMON SWSH LOST ORIGIN #TG10 FA/SNORLAX PSA 10 GEM MINT",
    seller: "PSA Store",
    sellerHref: "https://www.ebay.com/str/psa",
    sellerBadge: "⭐ Official PSA Store",
    listingUrl: "https://www.ebay.com/sch/i.html?_nkw=Snorlax+TG10+Lost+Origin+PSA+10&LH_BIN=1",
    listingPriceUSD: 520,
    manualPrice: 520,
    pricecharting: 530
  },
  'snor-021': {
    listingPriceUSD: 8000,
    manualPrice: 8000,
    pricecharting: 8000
  },
  'bonus-001': {
    listingPriceUSD: 400,
    manualPrice: 400
  },
  'bonus-002': {
    listingPriceUSD: 950,
    manualPrice: 950
  },
  'bonus-003': {
    listingPriceUSD: 250,
    manualPrice: 250
  },
  'bonus-004': {
    listingPriceUSD: 115,
    manualPrice: 115
  },
  'bonus-005': {
    listingPriceUSD: 150,
    manualPrice: 150
  },
  'bonus-009': {
    listingPriceUSD: 850,
    manualPrice: 850
  },
  'bonus-011': {
    listingPriceUSD: 890,
    manualPrice: 890
  },
  'bonus-018': {
    listingPriceUSD: 695,
    manualPrice: 695
  },
  'bonus-019': {
    image: "/images/bonus-019.webp",
    listingPriceUSD: 222,
    manualPrice: 222,
    pricecharting: 230
  },
  'snor-022': {
    listingPriceUSD: 3800,
    manualPrice: 3800,
    pricecharting: 3800
  },
  'snor-031': {
    manualPrice: 858.88
  },
  'snor-033': {
    manualPrice: 249
  },
  'munch-004': {
    manualPrice: 288
  },
  'munch-005': {
    manualPrice: 372.68
  },
  'munch-007': {
    manualPrice: 859
  }
};

let count = 0;
cat.forEach(c => {
  if (updates[c.id]) {
    Object.assign(c, updates[c.id]);
    count++;
  }
});

fs.writeFileSync(catPath, JSON.stringify(cat, null, 2), 'utf8');
console.log(`Updated ${count} cards in catalog.json successfully!`);
