# 🐻 SNORLAX × MUNCHLAX MARKET ATLAS | POKÉMON PSA TERMINAL (PSA ONLY)

> **Nền tảng phân tích đầu tư, săn deal thẻ bài Pokémon Snorlax & Munchlax quy chuẩn PSA (PSA 7–10) với dữ liệu thị trường trực tiếp từ 2 sàn giao dịch số 1 thế giới: Fanatics Collect (PWCC) và eBay.**

---

## 🌟 TÍNH NĂNG NỔI BẬT

- **Quy chuẩn Duy nhất PSA (Strictly PSA Only)**:
  - Chỉ tập trung vào chuẩn thanh khoản cao nhất thế giới từ **Professional Sports Authenticator (PSA)**:
    - **PSA 10 Gem Mint**: Tiêu chuẩn thanh khoản và sưu tầm cao nhất.
    - **PSA 9 Mint**: Cận hoàn hảo, cơ hội đầu tư giá trị hợp lý.
    - **PSA 8 NM-MT & PSA 7 Near Mint**: Dành cho vintage cổ và các bộ thẻ hiếm.
  - Toàn bộ danh mục 198 phiên bản thẻ Snorlax & Munchlax đều đạt chuẩn thẩm định PSA.
- **Dual Marketplace Integration (Liên kết song song 2 sàn)**:
  - Mỗi thẻ bài đều được tích hợp đồng thời 2 nút truy cập nhanh: **`[⚡ Fanatics ↗]`** và **`[🛒 eBay ↗]`**.
  - Bảng chi tiết (Drawer) trang bị khối **So sánh đối chiếu trực tiếp 2 sàn** (giá niêm yết Mua Ngay của Fanatics Collect Vault và giá Buy It Now của eBay).
  - Mọi phân hạng phẩm cấp (PSA 10 · PSA 9 · PSA 8 · PSA 7) đều có sẵn liên kết mở trực tiếp từng grade trên cả 2 sàn.
- **Dữ liệu thật 100% - Không Hallucination (Zero Hallucination Guarantee)**:
  - Mọi đường link Fanatics đều dẫn thẳng đến URL thẻ thật trên `fanaticscollect.com/buy-now/...`.
  - Mọi link eBay dẫn đến URL item thật `ebay.com/itm/...` hoặc kết quả Buy It Now chính xác theo từ khóa + hãng + grade.
  - Giá niêm yết là giá cố định (Fixed Price / Buy Now), không lấy giá Auction khởi điểm gây sai lệch nhận định thị trường.
- **Mô hình Định lượng Chênh lệch & Arbitrage (PSA Arbitrage)**:
  - Phân tích biên lợi nhuận giữa mua thẻ Raw Near Mint thị trường, trừ chi phí gửi lab thẩm định PSA + bảo hiểm, so sánh với lợi nhuận kỳ vọng khi đạt PSA 10 hoặc PSA 9.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY NHANH

### Cách 1: Chạy trực tiếp trên Windows
Nhấp đúp chuột vào file:
```cmd
CHAY_WINDOWS.bat
```
Trình duyệt sẽ tự động mở tại `http://localhost:4173`.

### Cách 2: Dùng lệnh Node.js (Yêu cầu Node 18+)
```bash
# Đi vào thư mục chứa mã nguồn
cd SNORLAX_MUNCHLAX_PSA10_LOCALHOST/SNORLAX_MUNCHLAX_PSA10

# Khởi chạy server
node server.js
```
Mở trình duyệt: `http://localhost:4173` hoặc truy cập qua mạng nội bộ LAN: `http://<IP_LAN>:4173`.

---

## 🛠️ CẤU TRÚC DỰ ÁN

```
SNORLAX_MUNCHLAX_PSA10_LOCALHOST/SNORLAX_MUNCHLAX_PSA10/
├── index.html               # Giao diện chính Single Page Application (Supabase White Modern Theme)
├── server.js                # Local HTTP Server (Node.js thuần, không cần cài npm modules)
├── catalog.json             # Danh mục 198 thẻ Snorlax & Munchlax chuẩn PSA có link thật
├── ai-market-sentinel.js    # Bộ não AI kiểm định giá trị thị trường và link sàn
├── fanatics-scraper.js      # Trình đồng bộ dữ liệu Buy Now từ sàn Fanatics Collect
├── CHAY_WINDOWS.bat         # Script 1-click khởi chạy cho Windows
├── chay_mac_linux.sh        # Script 1-click khởi chạy cho macOS/Linux
├── README.md                # Tài liệu hướng dẫn tổng quan dự án
├── SUMMARY.md               # Bản tóm tắt kiến trúc và tính năng
└── HANDOFF.md               # Tài liệu bàn giao kỹ thuật & bảo trì
```

---

## 🛡️ MINH BẠCH DỮ LIỆU

- **Phân hạng S/A/B/C/D/F**: Là phân hạng tiềm năng đầu tư và độ khan hiếm theo tiêu chuẩn riêng của người sưu tầm, độc lập với điểm số grade của slab.
- **Giá thị trường**: Là giá chào bán cố định (Buy Now) tại thời điểm thu thập dữ liệu; người mua cần kiểm tra tình trạng thẻ và chứng chỉ thực tế trước khi thanh toán.
