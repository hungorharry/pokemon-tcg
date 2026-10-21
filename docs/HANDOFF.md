# 🤝 TÀI LIỆU BÀN GIAO KỸ THUẬT (DEVELOPER HANDOFF GUIDE)

**Dự án**: Snorlax × Munchlax Market Atlas  
**Người nhận bàn giao**: Development Team / Git Maintainer  
**Ngày lập tài liệu**: 21/10/2026  

---

## 1. KIẾN TRÚC HỆ THỐNG & DÒNG DỮ LIỆU (DATA FLOW)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL MARKETPLACES                         │
│  Fanatics Collect (PWCC Vault Buy Now)  │   eBay Browse API & Live BIN │
└──────────────────┬──────────────────────┴──────────────────┬───────────┘
                   │                                         │
                   │ Apollo Cache Extract                    │ DOM / OAuth Browse
                   ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND & SCRAPER SCRIPTS                       │
│  - fanatics-scraper.js (Deep Ingestion)  - fetch_ebay.js (Live Match)  │
│  - ai-market-sentinel.js (Data Audit & Auto-Calibration Cron)          │
└──────────────────┬─────────────────────────────────────────────────────┘
                   │
                   ▼ Writes to central JSON
┌────────────────────────────────────────────────────────────────────────┐
│                     DATABASE TRUNG TÂM: catalog.json                   │
│  548 Pokémon Cards (Full Metadata, Direct Product URLs, Dual Prices)   │
└──────────────────┬─────────────────────────────────────────────────────┘
                   │
                   │ Synchronized to SEED_DATA tag
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND: index.html                           │
│  - Client-side In-Memory Store & localStorage User Overrides           │
│  - Dot Grid Canvas, 3D Tilt Stage, Filtering & Dual Action Line        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. QUY ƯỚC DỮ LIỆU CỐT LÕI (CORE PRINCIPLES & CONSTRAINTS)

Khi tiếp quản dự án hoặc thêm tính năng mới, bạn **BẮT BUỘC PHẢI TUÂN THỦ** các nguyên tắc sau:

### Nguyên tắc 1: Chính sách Không Ảo giác Giá (Zero Hallucination Policy)
- **Tuyệt đối không sử dụng công thức toán để bịa ra giá**: Không được nhân giá Grade 10 với các hệ số như `0.40` hay `0.22` để ước tính giá cho Grade 9 hay Grade 8.
- Nếu một grade hoặc phiên bản không có listing thực tế đang bán, hãy để nguyên trạng thái: `Chưa niêm yết - Chưa có niêm yết Buy Now trực tiếp` kèm nút tìm kiếm trên sàn.
- **Phân biệt rạch ròi giữa Mua Ngay (Buy Now) và Đấu giá (Auction)**: Không bao giờ lấy mức bid của phiên đấu giá tuần làm giá trị của thẻ.

### Nguyên tắc 2: Bảo toàn Link Sản phẩm Trực tiếp (Direct Link Integrity)
- Với các thẻ thu thập từ Fanatics Collect, trường `listingUrl` **phải luôn là URL trực tiếp của sản phẩm**:  
  `https://www.fanaticscollect.com/buy-now/${id}/${slug}`.
- Với các liên kết tìm kiếm phụ trên Fanatics, **luôn luôn phải có tham số `type=FIXED`** để đảm bảo dẫn đến sàn Mua Ngay, không bao giờ để URL trống tham số dẫn tới tab đấu giá tuần (`type=WEEKLY`).
- Luôn làm sạch từ khóa tìm kiếm: xóa bỏ ký tự `#`, không lặp lại tên nhân vật (`Snorlax Snorlax`).

### Nguyên tắc 3: Bảo toàn Tính Độc lập Không Phụ thuộc (Zero npm Dependencies)
- Hệ thống backend `server.js` được thiết kế chạy trên các module lõi có sẵn của Node.js (`http`, `fs`, `path`, `zlib`, `url`).
- Không cài thêm các package npm nặng nề trừ khi có yêu cầu kiến trúc đặc thù được phê duyệt.

### Nguyên tắc 4: Cơ chế Vượt Cache Trình duyệt (Cache Invalidation)
- Khi cập nhật cấu trúc dữ liệu hoặc giao diện trong `index.html`, luôn tăng số phiên bản cache key của `localStorage` (Ví dụ: `snoratlas-catalog-v34` lên `v35`) để đảm bảo toàn bộ người dùng nhận ngay dữ liệu mới nhất mà không bị cache cũ đè lên.

---

## 3. CÁC API ENDPOINTS TRÊN SERVER LOCALHOST (`server.js`)

Server chạy mặc định tại cổng `4173` (`http://localhost:4173/`):

- **`GET /api/health`**: Kiểm tra trạng thái server, số lượng thẻ và cấu hình eBay API.
- **`GET /api/catalog`**: Trả về toàn bộ danh mục thẻ bài từ `catalog.json`.
- **`POST /api/catalog`**: Cập nhật lại cơ sở dữ liệu `catalog.json`.
- **`GET /api/ebay-price?id={cardId}`**: Gọi eBay Browse API trực tiếp bằng OAuth token để lấy giá Buy It Now mới nhất cho thẻ cụ thể.
- **`GET /api/ai-lookup?id={cardId}`**: Gọi AI Sentinel tra cứu giá và chỉ số Population.
- **`GET /api/fanatics-sync`**: Kích hoạt tiến trình đồng bộ dữ liệu Fanatics Collect vào catalog.

---

## 4. HƯỚNG DẪN CÀO THÊM THẺ MỚI (HOW TO RE-CRAWL & INGEST)

### Cào thẻ mới từ Fanatics Collect:
1. Sử dụng Playwright điều hướng tới `https://www.fanaticscollect.com/marketplace?type=FIXED&q=Snorlax` (hoặc `q=Munchlax`).
2. Trích xuất mảng đối tượng `CollectListing` từ `window.__APOLLO_CLIENT__.cache.extract()`.
3. Chạy script xử lý: `node scratch/process_buy_now.js` để chuẩn hóa dữ liệu.
4. Chạy script đồng bộ: `node scratch/merge_final_catalog.js` để cập nhật vào `catalog.json` và `index.html`.

### Cào thẻ mới từ eBay:
1. Điều hướng tới `https://www.ebay.com/sch/i.html?_nkw=Snorlax+PSA+10&LH_BIN=1`.
2. Trích xuất danh sách link `https://www.ebay.com/itm/{id}` và giá qua DOM Selector `.su-card-container`.
3. Chạy script làm giàu: `node scratch/apply_dual_links.js`.

---

## 5. CHECKLIST CHUẨN BỊ PUSH LÊN GITHUB

Trước khi chạy lệnh `git push`, hãy kiểm tra danh sách sau:

- [x] Đã tạo file `.gitignore` để loại trừ các tệp nhạy cảm (`.env`, log files, scratch data tạm).
- [x] Đã loại bỏ toàn bộ các thẻ thể thao không liên quan (NFL Mike Munchak).
- [x] Đã kiểm tra 100% liên kết Fanatics đều có `type=FIXED`.
- [x] Đã kiểm tra server localhost khởi động trơn tru không báo lỗi cú pháp.
- [x] Đã hoàn thiện 3 tệp tài liệu: `README.md`, `SUMMARY.md`, `HANDOFF.md`.

### Các lệnh Git đề xuất để đẩy mã nguồn:
```bash
# 1. Khởi tạo kho lưu trữ Git (nếu chưa có)
git init

# 2. Thêm toàn bộ tệp tin vào staging
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: release Snorlax & Munchlax Market Atlas v2.0 with Dual Marketplace integration"

# 4. Đặt nhánh chính là main
git branch -M main

# 5. Gắn remote repository (thay bằng URL repo của bạn)
git remote add origin https://github.com/your-username/snorlax-munchlax-atlas.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```
