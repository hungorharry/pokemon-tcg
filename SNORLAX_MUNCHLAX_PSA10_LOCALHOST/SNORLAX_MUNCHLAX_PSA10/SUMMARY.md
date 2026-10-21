# TỔNG KẾT DỰ ÁN (PROJECT SUMMARY)

## 📌 Tổng Quan
Hệ thống **Snorlax & Munchlax Market Atlas** là ứng dụng web tra cứu, định lượng đầu tư thẻ bài Pokémon dành riêng cho phân khúc chuẩn **PSA (PSA ONLY)**, tích hợp dữ liệu thời gian thực từ 2 sàn giao dịch thẻ hàng đầu thế giới: **Fanatics Collect** và **eBay**.

---

## 🎯 Phạm Vi & Quy Chuẩn (Scope & Standard)
1. **Chuẩn Thẩm Định Duy Nhất**:
   - **Chỉ nhận PSA (PSA ONLY)**: Toàn bộ 198 phiên bản thẻ trong danh mục đều mang chuẩn thẩm định PSA (PSA 10 Gem Mint, PSA 9 Mint, PSA 8 NM-MT, PSA 7 Near Mint).
   - Đã loại bỏ hoàn toàn các hãng khác (CGC, BGS, SGC) theo yêu cầu định hướng sưu tầm thuần PSA của người dùng.
2. **Nguồn Dữ Liệu Thị Trường**:
   - **Fanatics Collect Buy Now**: Các thẻ thật đang niêm yết Mua Ngay tại kho Fanatics Vault với link direct dẫn thẳng vào trang sản phẩm.
   - **eBay Buy It Now**: Liên kết trực tiếp mã sản phẩm `ebay.com/itm/...` hoặc bộ lọc Buy It Now cố định, tuyệt đối không lấy giá đấu giá ảo.
3. **Phân Loại Danh Mục**:
   - **198 thẻ PSA**: 178 thẻ Snorlax và 20 thẻ Munchlax.
   - **127 thẻ PSA 10 Gem Mint**.
   - **42 thẻ PSA 9 Mint**.
   - **29 thẻ PSA 7–8 NM/Mint**.

---

## 💡 Các Tính Năng Đã Hoàn Thiện
- **Giao diện Supabase White Clean Theme**: Tối ưu hiển thị danh sách thẻ theo dạng Grid (lưới) và Table (bảng), hiển thị huy hiệu PSA và độ hiếm.
- **Dual Marketplace Action Links**: Nút `⚡ Fanatics ↗` và `🛒 eBay ↗` hiển thị rõ ràng trên từng thẻ và trong modal chi tiết.
- **Drawer Chi Tiết Chuyên Sâu**:
  - Đối chiếu giá song song Fanatics Collect vs eBay Buy It Now.
  - Phân bổ bậc điểm PSA (Grade 1 đến 10) kèm tỷ lệ % và dân số (Population).
  - Mô phỏng chênh lệch định giá Grading Arbitrage (Thẻ Raw -> Thẩm định PSA 10 / PSA 9).
- **Bộ Lọc & Tìm Kiếm**:
  - Lọc theo nhân vật (Snorlax / Munchlax).
  - Lọc theo bậc grade (Grade 10 / Grade 9 / Grade 8 / Grade 7).
  - Lọc theo xếp hạng đầu tư (Tier S/A/B/C/D/F).
  - Tìm kiếm linh hoạt theo tên thẻ, năm, số bộ, promo.
  - Chuyển đổi tiền tệ tức thì giữa VNĐ (₫) và USD ($).
