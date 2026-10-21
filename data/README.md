# Pokémon TCG Data Storage (`data/`)

Thư mục lưu trữ toàn bộ dữ liệu thẻ bài, dữ liệu cào thị trường và đặc tả API được phân chia ngăn nắp theo từng nhóm mục đích.

---

## 📁 Cấu trúc thư mục dữ liệu

```text
data/
├── catalog/                     # 🌟 CƠ SỞ DỮ LIỆU CHÍNH THỨC CỦA APP
│   ├── catalog.json             # Danh mục tổng hợp 198 thẻ bài chuẩn PSA (Grade 7 - 10)
│   ├── summary.json             # Thống kê tổng quan: số lượng thẻ, phân bố Tier S/A/B/C/D
│   └── cards/                   # Dữ liệu tách nhỏ theo từng thẻ (DỄ ĐỌC & DỄ BIÊN TẬP)
│       ├── snorlax/             # 178 thẻ Snorlax riêng biệt (VD: snor-002.json)
│       └── munchlax/            # 20 thẻ Munchlax riêng biệt (VD: munch-001.json)
│
├── scraped/                     # 🌐 DỮ LIỆU CÀO THỊ TRƯỜNG THỰC TẾ
│   ├── ebay_psa_store.json      # Giá và listing quét từ Official PSA Store trên eBay
│   ├── pricecharting_images.json# Dữ liệu ảnh và giá tham chiếu từ PriceCharting
│   ├── remaining_scraped.json   # Dữ liệu cào bổ sung đợt 2
│   ├── slab_searched.json       # Ảnh phôi slab PSA thật đã đối soát
│   └── user_100_parsed.json     # Dữ liệu parse từ danh sách 100 thẻ mục tiêu
│
├── specs/                       # 📋 ĐẶC TẢ API & SCHEMA
│   └── psa-openapi.json         # Đặc tả OpenAPI chuẩn của hệ thống PSA
│
└── backup/                      # 💾 BẢN LƯU TRỮ LỊCH SỬ & DỰ PHÒNG
    ├── catalog_full_548.json    # Bản lưu 548 thẻ ban đầu trước khi lọc PSA-only
    └── PRICECHARTING_CANDIDATES.csv # Bảng ứng viên thẻ thô ban đầu
```

---

## 📖 Cách đọc và sử dụng

1. **Xem thông tin 1 thẻ nhanh chóng:**
   - Thay vì phải cuộn file 6.000 dòng, chỉ cần vào `data/catalog/cards/snorlax/` hoặc `data/catalog/cards/munchlax/`, mở file JSON tương ứng (VD: `snor-002.json`). Mỗi file chỉ khoảng 30 dòng, hiển thị đầy đủ thông số: Tên thẻ, năm, set, grade PSA, giá tham chiếu, pop report và link eBay.

2. **Dữ liệu tổng hợp dùng cho App:**
   - File `data/catalog/catalog.json` được server tải trực tiếp phục vụ web app.
   - Có thể chạy script đồng bộ nếu có chỉnh sửa từng thẻ con.
