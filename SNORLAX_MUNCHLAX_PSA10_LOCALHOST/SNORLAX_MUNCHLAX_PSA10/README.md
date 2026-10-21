# 🐻 SNORLAX × MUNCHLAX MARKET ATLAS | POKÉMON PSA & MULTI-SLAB TERMINAL

> **Nền tảng phân tích đầu tư, săn deal thẻ bài Pokémon Snorlax & Munchlax (PSA · CGC · BGS 7–10) với dữ liệu thị trường trực tiếp từ 2 sàn đấu giá & giao dịch số 1 thế giới: Fanatics Collect (PWCC) và eBay.**

---

## 🌟 TÍNH NĂNG NỔI BẬT

- **Dual Marketplace Integration (Liên kết song song 2 sàn)**:
  - Mỗi thẻ bài đều được tích hợp đồng thời 2 nút truy cập nhanh: **`[⚡ Fanatics ↗]`** và **`[🛒 eBay ↗]`**.
  - Bảng chi tiết (Drawer) trang bị khối **So sánh đối chiếu trực tiếp 2 sàn** (giá niêm yết Mua Ngay của Fanatics Collect Vault và giá Buy It Now của eBay).
  - Mọi phân hạng phẩm cấp (Grade 10 · 9.5 · 9 · 8 · 7) đều có sẵn liên kết mở trực tiếp từng grade trên cả 2 sàn.
- **Quy chuẩn Đa công ty Thẩm định (Multi-Grading Slabs)**:
  - **PSA (Professional Sports Authenticator)**: Chuẩn thanh khoản toàn cầu (PSA 10 Gem Mint, PSA 9, PSA 8, PSA 7).
  - **CGC (Certified Guaranty Company)**: Đỉnh cao độ trong suốt phôi kính và phôi thẻ (CGC 10 Pristine Gold Label, CGC 10 Gem Mint, CGC 9.5 Mint+).
  - **BGS (Beckett Grading Services)**: Thang điểm 4 chỉ số phụ khắt khe (BGS 10 Black Label, BGS 9.5).
  - **SGC**: Thẩm định tem đen cổ điển.
- **Chính sách Không Ảo giác Giá (Zero Hallucination Policy)**:
  - 100% giá chào bán hiển thị trên ứng dụng là giá niêm yết bán ngay thực tế từ sàn (`type=FIXED` Buy Now), loại bỏ hoàn toàn các mức bid đấu giá tạm thời hay công thức toán suy diễn ảo.
  - Tuyệt đối loại bỏ các đường dẫn ma (ghost links) — mọi liên kết tìm kiếm đều được chuẩn hóa và gắn cứng tham số `type=FIXED`.
- **Hệ thống tiền tệ tối ưu cho Collector Việt Nam**:
  - Hiển thị song song **Việt Nam Đồng (VNĐ / ₫)** theo tỷ giá chuẩn và **USD ($)**.
  - Công tắc chuyển đổi tức thì `[₫ VNĐ]` / `[$ USD]` trên thanh công cụ.
- **Mô hình định lượng chênh lệch (Grading Arbitrage Matrix)**:
  - Phân tích chi phí mua thẻ Raw (chưa chấm điểm) + chi phí gửi lab thẩm định (PSA/CGC) để tính toán ROI và hệ số nhân vốn khi đạt Grade 10 hoặc Grade 9.
- **Giao diện Terminal cao cấp (Supabase Light Theme & Dot Grid)**:
  - Tối ưu trải nghiệm trực quan với nền lưới điểm (Dot Grid Background), hiệu ứng lật slab 3D kèm tia phản quang Holo Glare, bộ lọc tìm kiếm tức thì theo nhân vật, grade, công ty và tier đầu tư.
- **Kiến trúc Thuần túy (Zero Dependency)**:
  - Chạy trực tiếp trên Node.js thuần (Node 20+), không cần chạy `npm install`, không kéo theo thư mục `node_modules` nặng nề.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### 1. Yêu cầu hệ thống
- Máy tính đã cài đặt **[Node.js 20+](https://nodejs.org/)**.

### 2. Khởi chạy 1-Click trên Windows
1. Nhấp đúp vào file **`CHAY_WINDOWS.bat`**.
2. Trình duyệt sẽ tự động mở hoặc bạn truy cập: **`http://localhost:4173/`**.

### 3. Khởi chạy trên macOS / Linux
Mở Terminal tại thư mục dự án và chạy:
```bash
sh chay_mac_linux.sh
```
Sau đó truy cập trình duyệt tại: **`http://localhost:4173/`**.

---

## ⚙️ CẤU HÌNH EBAY LIVE BROWSE API (TÙY CHỌN)

Nếu bạn có tài khoản eBay Developer và muốn app tự động quét giá theo thời gian thực qua Browse API:
1. Đăng ký tại [eBay Developer Portal](https://developer.ebay.com/my/keys) và lấy **Production Application Keys** (Client ID & Client Secret).
2. Tạo file **`.env`** tại thư mục gốc (tham khảo `.env.example`):
   ```env
   EBAY_CLIENT_ID=your_ebay_client_id_here
   EBAY_CLIENT_SECRET=your_ebay_client_secret_here
   PORT=4173
   HOST=0.0.0.0
   ```
3. Khởi động lại server. Hệ thống sẽ báo `🟢 AI Sentinel Engine online` và tự động cập nhật giá từ eBay Browse API.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
SNORLAX_MUNCHLAX_PSA10/
├── index.html               # Ứng dụng Single Page Application (UI/UX, 3D Canvas, Logic)
├── server.js                # Server Node.js thuần (API Proxy, Static Server, OAuth)
├── catalog.json             # Cơ sở dữ liệu 548 thẻ Pokémon Snorlax & Munchlax
├── ai-market-sentinel.js    # Engine kiểm toán và chuẩn hóa dữ liệu định kỳ
├── fanatics-scraper.js      # Module cào và đồng bộ kho thẻ từ Fanatics Collect
├── CHAY_WINDOWS.bat         # Script khởi chạy nhanh trên Windows
├── chay_mac_linux.sh        # Script khởi chạy trên macOS/Linux
├── sample-import.csv        # Mẫu file CSV để người dùng nhập thêm thẻ
├── .env.example             # Mẫu khai báo biến môi trường eBay API
├── README.md                # Tài liệu giới thiệu tổng quan dự án
├── SUMMARY.md               # Báo cáo tóm tắt quá trình phát triển & nâng cấp
├── HANDOFF.md               # Tài liệu bàn giao kỹ thuật & hướng dẫn bảo trì
└── scratch/                 # Thư mục lưu trữ dữ liệu crawl, scripts hỗ trợ & hình ảnh
```

---

## ⚖️ BẢN QUYỀN & TUYÊN BỐ MIỄN TRỪ
- Dự án được phát triển phục vụ mục đích nghiên cứu dữ liệu và sưu tầm cá nhân.
- Pokémon, tên các nhân vật và hình ảnh thuộc bản quyền của **Nintendo / Creatures Inc. / GAME FREAK inc.**
- Dữ liệu định giá và danh mục listing thuộc bản quyền của **Fanatics Collect** và **eBay Inc.**
