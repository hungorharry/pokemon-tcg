# 📊 BÁO CÁO TỔNG KẾT DỰ ÁN (PROJECT SUMMARY)

**Dự án**: Snorlax & Munchlax Market Atlas | Pokémon Multi-Slab Terminal  
**Thời gian hoàn thiện**: Tháng 10/2026  
**Trạng thái hệ thống**: Hoàn thiện toàn diện, sẵn sàng đẩy lên kho lưu trữ Git (Git Ready)

---

## 1. TỔNG QUAN HÀNH TRÌNH PHÁT TRIỂN

Dự án ban đầu được xây dựng như một bảng theo dõi đầu tư cục bộ cho 39 thẻ Pokémon Snorlax & Munchlax đạt chuẩn PSA 10. Qua các giai đoạn nghiên cứu và phản hồi thực tế từ người dùng, ứng dụng đã được tái thiết kế và nâng cấp thành một **Terminal phân tích đầu tư Blue-chip chuyên nghiệp**, kết nối dữ liệu thực tế với 2 sàn thẻ bài lớn nhất thế giới: **Fanatics Collect** và **eBay**.

---

## 2. CÁC MỐC NÂNG CẤP QUAN TRỌNG ĐÃ ĐẠT ĐƯỢC

### Mốc 1: Tái thiết kế Giao diện Dot-Grid Supabase & Trực quan hóa 3D
- Chuyển đổi giao diện sang phong cách **Supabase Light Theme** hiện đại kết hợp nền lưới chấm tròn vi điểm (**Dot Grid Background**).
- Thay thế bảng điều khiển cũ thành hệ thống thẻ tương tác có gắn huy hiệu phân cấp (Company Chip, Grade, Investment Tier).
- Tích hợp khung lật phôi thẻ 3D tương tác bằng chuột kèm tia phản quang (Holo Glare Effect) và bộ công cụ phóng to / thu nhỏ phôi thẻ.

### Mốc 2: Điều tra & Khắc phục triệt để Lỗi Sai lệch Giá (Zero Hallucination)
- **Vấn đề phản ánh**: Người dùng phát hiện một số thẻ trên app hiển thị mức giá khoảng 3 triệu VNĐ, nhưng khi mở sang sàn thực tế giá lại là 5 – 6 triệu hoặc cao hơn.
- **Nguyên nhân cốt lõi phát hiện**:
  1. *Lấy nhầm giá Đấu giá tuần (Weekly Auction Bid)*: Một số thẻ trước đó cào từ tab `type=WEEKLY`, chỉ ghi nhận lượt bid ban đầu ($94 – $110 = ~2,5M – 2,8M VNĐ), trong khi giá trị Mua Ngay thực tế là $250 – $300 (6,3M – 7,6M VNĐ).
  2. *Công thức toán tự suy diễn (`base10Price * 0.40`)*: Hàm hiển thị Grade rows trước đó đã tự động nhân giá Grade 10 với hệ số 0.40 cho Grade 9 khi không thấy listing đối ứng, tự tạo ra con số ~3 triệu ảo.
  3. *Lệch so sánh Grade 9.5 (CGC 9.5)*: Hệ thống so sánh số nguyên `grade === 9` khiến các bản 9.5 Mint+ bị bỏ qua và rơi vào công thức ước tính sai.
- **Biện pháp giải quyết**:
  - Chuyển dịch toàn bộ nguồn cào sang **Fanatics Collect Buy Now (`type=FIXED`)**. Mọi mức giá đều lấy chính xác từ `buyNowPrice.amountInCents / 100`.
  - Xóa bỏ hoàn toàn công thức toán học ước tính giá. Nếu grade nào chưa có ai bán, hiển thị rõ ràng: `Chưa niêm yết - Chưa có niêm yết Buy Now trực tiếp`.

### Mốc 3: Triệt tiêu Lỗi "Link ma" & Thanh lọc Thẻ Thể thao Không liên quan
- **Vấn đề phản ánh**: Người dùng bấm nút tìm thẻ thì bị dẫn sang link rỗng không có kết quả (`...&type=WEEKLY`).
- **Nguyên nhân**: Nút tìm kiếm trước đó thiếu tham số `type=FIXED`, khiến sàn tự động nhảy về tab Weekly Auction không có thẻ Buy Now này. Đồng thời từ khóa bị lặp 2 lần tên nhân vật (`Snorlax Topps TV Animation Series 3 Snorlax`). Ngoài ra, từ khóa tìm kiếm `Munch` đã kéo nhầm 23 thẻ bóng bầu dục của cầu thủ NFL Mike Munchak.
- **Biện pháp giải quyết**:
  - Gắn cứng tham số `type=FIXED` cho 100% các link tìm kiếm phụ trên Fanatics Collect.
  - Làm sạch bộ lọc từ khóa, loại bỏ hoàn toàn 23 thẻ thể thao NFL.
  - Đưa liên kết sản phẩm trực tiếp (`https://www.fanaticscollect.com/buy-now/...`) lên làm liên kết mặc định ưu tiên số 1 của mọi nút bấm trên thẻ.

### Mốc 4: Tích hợp Hệ thống Liên kết Kép (Dual Marketplace Integration)
- **Cào dữ liệu từ cả 2 sàn lớn**:
  - **Fanatics Collect**: 513 listing Buy Now đã qua kiểm định slab.
  - **eBay**: 223 listing Buy It Now thực tế được cào trực tiếp từ Playwright.
- **Hiển thị song song trên giao diện**:
  - Mỗi thẻ trên màn hình chính có sẵn 3 nút: `[Chi tiết]`, `[⚡ Fanatics ↗]`, `[🛒 eBay ↗]`.
  - Drawer chi tiết trang bị khối **So sánh đối chiếu song song 2 sàn** (Fanatics Collect Vault vs. eBay Marketplace).
  - Từng dòng Grade (10 · 9.5 · 9 · 8 · 7) đều cung cấp song song 2 nút bấm tra cứu cho cả 2 sàn.

---

## 3. THỐNG KÊ DỮ LIỆU HIỆN TẠI

| Chỉ số | Số lượng / Giá trị | Ghi chú |
| :--- | :--- | :--- |
| **Tổng số thẻ trong danh mục** | **548 thẻ** | Đã thanh lọc 100% Pokémon Snorlax & Munchlax chuẩn |
| **Thẻ Snorlax** | **447 thẻ** | Bao gồm thẻ cổ điển WotC, E-series, EX, DP, BW, XY, SM, SWSH, SV |
| **Thẻ Munchlax** | **101 thẻ** | Bao gồm các bản Promo Nhật Bản, PokéPark, Movie, Carddass, Domino's |
| **Phân hạng S-Tier (Grail / Biểu tượng)** | **123 thẻ** | Điểm tiềm năng từ 90 đến 100 |
| **Phân hạng A-Tier (Cốt lõi dài hạn)** | **157 thẻ** | Điểm tiềm năng từ 80 đến 89 |
| **Phân hạng B-Tier (Có tiềm năng)** | **203 thẻ** | Điểm tiềm năng từ 68 đến 79 |
| **Phân hạng C-Tier (Theo dõi)** | **46 thẻ** | Điểm tiềm năng từ 55 đến 67 |
| **Phân hạng D-Tier (Đầu cơ / Phổ thông)** | **19 thẻ** | Điểm tiềm năng từ 40 đến 54 |
| **Phân hạng F-Tier (Không ưu tiên)** | **0 thẻ** | Không có thẻ kém chất lượng trong danh mục |
| **Thẻ có liên kết trực tiếp sản phẩm** | **100%** | Nhảy thẳng vào listing sản phẩm trên Fanatics hoặc eBay |

---

## 4. DANH MỤC CÔNG NGHỆ ÁP DỤNG

- **Client**: Vanilla JavaScript ES2022, CSS3 Flexbox/Grid, Canvas 3D Transform, HTML5 Web Storage API.
- **Server**: Node.js HTTP Server thuần túy (Node 20+), không sử dụng thư viện ngoài (`Zero external npm dependencies`).
- **Crawler & Automation**: Playwright MCP Engine (Headless Chromium) phục vụ trích xuất dữ liệu trực tiếp từ Apollo Client GraphQL Cache của Fanatics và DOM Parser của eBay.
- **Bảo mật**: Cơ chế Client Credentials OAuth2, lưu trữ key an toàn trong file `.env` cục bộ, không bao giờ lộ thông tin bảo mật ra mã nguồn phía Client.
