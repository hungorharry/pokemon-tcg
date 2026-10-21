# TÀI LIỆU BÀN GIAO & VẬN HÀNH (HANDOFF & MAINTENANCE GUIDE)

## 1. Thông Tin Kho Mã Nguồn & Triển Khai
- **GitHub Repository**: [https://github.com/hungorharry/pokemon-tcg.git](https://github.com/hungorharry/pokemon-tcg.git)
- **Nhánh chính**: `main`
- **Địa chỉ truy cập Localhost**: `http://localhost:4173`
- **Môi trường yêu cầu**: Node.js v18.0.0 trở lên. Không yêu cầu cài bất kỳ `npm install` nào (Zero-dependency architecture).

---

## 2. Tiêu Chuẩn Danh Mục Thẻ (Data Specifications)
- **Quy chuẩn Slab**: **PSA ONLY** (Chỉ chấp nhận các thẻ đã được Professional Sports Authenticator chứng nhận).
- **Tổng số thẻ**: 198 thẻ Pokémon (Snorlax & Munchlax).
- **Cấu trúc trường dữ liệu trong `catalog.json`**:
  - `id`: Mã định danh duy nhất (ví dụ: `fc-snorlax-003`, `snor-002`).
  - `name`: Tên phiên bản thẻ bài đầy đủ.
  - `character`: `'Snorlax'` hoặc `'Munchlax'`.
  - `year`: Năm phát hành thẻ.
  - `set`: Tên bộ sưu tập.
  - `grade`: Điểm số slab (10, 9, 8, 7).
  - `slabCompany`: Luôn là `'PSA'`.
  - `gradeLabel`: Nhãn định dạng hiển thị (ví dụ: `'PSA 10 GEM MINT'`).
  - `listingUrl`: Link trực tiếp đến sản phẩm trên sàn Fanatics Collect Buy Now hoặc eBay.
  - `listingPriceUSD`: Giá niêm yết Mua Ngay thực tế bằng USD.
  - `ebayItemUrl`: Link trực tiếp đến tin đăng Buy It Now trên sàn eBay.

---

## 3. Các Lệnh Vận Hành Thường Dùng

### Khởi động server
```bash
cd SNORLAX_MUNCHLAX_PSA10_LOCALHOST/SNORLAX_MUNCHLAX_PSA10
node server.js
```

### Thêm thẻ PSA mới vào danh mục
Mở file `catalog.json` hoặc nhấn nút **`[＋ Thêm thẻ]`** trực tiếp trên giao diện web. Đảm bảo cung cấp đầy đủ thông tin `slabCompany: 'PSA'` và đường link `listingUrl` chính xác.

### Đẩy thay đổi lên GitHub
```bash
git add .
git commit -m "update: cập nhật dữ liệu mới"
git push origin main
```
