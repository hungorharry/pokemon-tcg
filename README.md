# Pokémon TCG — Snorlax & Munchlax PSA 10 Market Atlas

Ứng dụng web nghiên cứu thị trường, theo dõi biến động giá thẩm định và tỷ trọng dân số (Population Report) cho dòng thẻ bài **Snorlax & Munchlax** (PSA 7 – 10). Tích hợp dữ liệu đấu giá và chào bán Buy It Now từ eBay US & Fanatics Collect (PWCC).

---

## ⚡ Khởi chạy nhanh (Quick Start)

### 1. Trên Windows (Khuyên dùng)
- Yêu cầu: Đã cài [Node.js 20+](https://nodejs.org/)
- Nhấp đúp vào file **`CHAY_WINDOWS.bat`**
- Trình duyệt sẽ tự động mở tại: `http://127.0.0.1:4173`

### 2. Trên macOS / Linux
```bash
sh chay_mac_linux.sh
```
Mở trình duyệt tại: `http://127.0.0.1:4173`

### 3. Mở nhanh không cần cài đặt
- Nhấp đúp trực tiếp vào file **`index.html`** để xem danh mục thẻ, bảng xếp hạng và import CSV/JSON ngoại tuyến.

---

## 📁 Cấu trúc thư mục (Project Structure)

```text
pokemon-tcg/
├── index.html              # Giao diện web app chính (PSA Market Atlas UI)
├── server.js               # Node.js backend server (cổng 4173, xử lý eBay / TCGdex / Fanatics API)
├── catalog.json            # Cơ sở dữ liệu danh mục thẻ chuẩn PSA
├── ai-market-sentinel.js   # Module AI Sentinel quét và hiệu chuẩn giá thị trường
├── fanatics-scraper.js     # Module đồng bộ dữ liệu Fanatics Collect
├── images/                 # Hình ảnh phôi slab và thẻ minh họa
├── sample-import.csv       # File mẫu chuẩn để import danh mục thẻ mới
├── CHAY_WINDOWS.bat        # Launcher 1-click cho Windows
├── chay_mac_linux.sh       # Launcher cho macOS / Linux
├── .env.example            # Mẫu cấu hình biến môi trường (eBay Developer API keys)
├── package.json            # Cấu hình dự án & scripts test
├── README.md               # Tài liệu giới thiệu tổng quan
├── README_HUONG_DAN.md     # Hướng dẫn chi tiết sử dụng bằng tiếng Việt
│
├── docs/                   # Tài liệu kỹ thuật, quy tắc chuẩn hóa và hướng dẫn
│   ├── CGC_DATA_SCRAPING_RULES.md
│   ├── CODEX_FIX_PROMPT.md
│   ├── EBAY_SETUP.md
│   ├── FREE_RESEARCH.md
│   ├── HANDOFF.md
│   ├── IMAGE_SCRAPING_RULES.md
│   ├── IMAGE_SCRAPING_RULES_v2.md
│   ├── nghien-cuu.md.txt
│   └── SUMMARY.md
│
├── scripts/                # Tập lệnh xây dựng dữ liệu, phân giải định danh thẻ & pipeline
│   ├── apply_enriched_psa.js
│   ├── apply_pricecharting_images.js
│   ├── build_merged_cards.js
│   ├── ebay-market.js
│   ├── generate_database.js
│   ├── graded-research.js
│   ├── identity_engine.js
│   ├── image_resolver.js
│   ├── image_validator.js
│   ├── inject_cgc_population.js
│   ├── inspect_extracted.js
│   ├── inspect_munchlax.js
│   ├── match_user_100.js
│   ├── parse_pc_search.js
│   ├── process_candidates_v2.js
│   ├── recalibrate_graded_prices.js
│   ├── remap-free-research.js
│   ├── update-free-research.js
│   └── upgrade_psa_slabs_and_drawer.js
│
├── tests/                  # Bộ kiểm thử tự động (Unit tests & quy tắc ảnh)
│   ├── ebay-market.test.js
│   ├── graded-research.test.js
│   ├── test_images.js
│   ├── test_image_rules_v2.js
│   └── test_pc.js
│
├── data/                   # Dữ liệu cào thô, OpenAPI spec và bản sao lưu
│   ├── catalog_full_backup.json
│   ├── PRICECHARTING_CANDIDATES.csv
│   ├── pricecharting_crawled_images.json
│   ├── psa-openapi.json
│   ├── psa_store_scraped.json
│   ├── remaining_16_scraped.json
│   ├── slab_searched_8.json
│   └── user_100_parsed.json
│
├── archive/                # Nguyên mẫu thử nghiệm cũ (snorlax-munchlax-investment-research)
└── scratch/                # Thư mục nháp xử lý ảnh và script tạm thời
```

---

## 🧪 Chạy Kiểm thử (Run Tests)

```bash
npm test          # Chạy bộ unit test thị trường eBay và graded research
npm run test:rules # Kiểm thử 9 quy tắc nhận diện và xác thực hình ảnh
```

Xem hướng dẫn chi tiết về cấu hình eBay API và quy tắc đầu tư tại [README_HUONG_DAN.md](README_HUONG_DAN.md).
