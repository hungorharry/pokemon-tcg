

## 🏛️ QUY TẮC BẮT BUỘC VỀ NGUỒN SÀN & TIỀN TỆ (VND · MULTI-VAULT)
> **1. NGUỒN DỮ LIỆU UY TÍN (PSA FIRST & FANATICS COLLECT VAULT)**:
> - **Hạng 1 (Đấu giá & Vault Quốc tế)**: **Fanatics Collect Marketplace (tiền thân PWCC Vault)** (`https://www.fanaticscollect.com`) - Sàn đấu giá thẻ bài Blue-chip lớn nhất hành tinh.
> - **Hạng 2**: **Official PSA Store trên eBay** (`https://www.ebay.com/str/psa`) - Hàng kiểm định gốc PSA chính chủ.
> - **Hạng 3**: Các Top Vault Consignors uy tín toàn cầu (Probstein123, DCSports87) và người bán Top Rated Plus (>99.5% positive feedback).
> - Tuyệt đối không lấy giá từ seller 0 feedback hoặc giá ảo, scam.
>
> **2. TIỀN TỆ VIỆT NAM ĐỒNG (VND)**:
> - Mặc định hiển thị giá bằng **Việt Nam Đồng (VND / ₫)** theo tỷ giá quy đổi tham chiếu thực tế (~25,450 VNĐ/USD).
> - Hỗ trợ công tắc chuyển đổi trực tiếp **[₫ VNĐ]** và **[$ USD]** trên thanh công cụ.
> - Trên thẻ hiển thị gọn theo dạng triệu / tỷ VNĐ (VD: `216.3 tr ₫`, `1.27 tỷ ₫`), trong chi tiết hiển thị đầy đủ cả VNĐ và USD đối chiếu.

## 💎 TIÊU CHUẨN ĐA CÔNG TY THẨM ĐỊNH (PSA · CGC · BGS · RAW MATRIX)
> **TIÊU CHUẨN HIỂN THỊ LƯỚI CHÍNH**: 100% hình ảnh trên lưới thẻ phải là thẻ đã đóng **SLAB KIỂM ĐỊNH CHUẨN** có nhãn tem xác thực rõ ràng.
> - **PSA (Professional Sports Authenticator)**: Chuẩn thanh khoản số 1 (PSA 10 Gem Mint, PSA 9 Mint, PSA 8, PSA 7). Huy hiệu Đỏ Ruby `#E11D48`.
> - **CGC (Certified Guaranty Company)**: Chuẩn độ trong suốt phôi kính và phôi thẻ hoàn hảo (CGC 10 Pristine, CGC 10 Gem Mint, CGC 9.5 Mint+). Huy hiệu Xanh Cyan `#0284C7`.
> - **BGS (Beckett Grading Services)**: Chuẩn 4 chỉ số phụ Subgrades & Chén thánh BGS 10 Black Label / 9.5 Gem Mint. Huy hiệu Vàng Gold `#D97706`.
> - **Thẻ Raw (Chưa chấm điểm / Ungraded)**: Không đưa lên lưới chính; được dùng làm mức giá tham chiếu gốc trong khối **Grading Arbitrage Matrix** ở popup chi tiết (so sánh giá Raw vs. giá đạt PSA 10/CGC 10 để tính toán lợi nhuận khi đem thẻ đi thẩm định).

# SNORLAX × MUNCHLAX PSA 7 - 10 · MARKET ATLAS

Web app trên máy tính, không cần `npm install`, không cần database. Dữ liệu người dùng tự lưu trong `localStorage` của trình duyệt tại `http://127.0.0.1:4173`.

## Chạy trên localhost

**Windows**: Cài [Node.js 20+](https://nodejs.org/) rồi giải nén ZIP, nhấp đúp **`CHAY_WINDOWS.bat`**, mở **http://127.0.0.1:4173**. Giữ cửa sổ dòng lệnh mở trong lúc dùng.

**macOS / Linux**: Mở Terminal tại folder đã giải nén, chạy `sh chay_mac_linux.sh`, sau đó mở **http://127.0.0.1:4173**.

**Xem thử không cài gì**: Mở file **`index.html`** trực tiếp. Sử dụng được bảng xếp hạng và import CSV/JSON, nhưng không dùng được eBay live, đồng bộ TCGdex hoặc import Excel `.xlsx`.

## Bật GIÁ EBAY REAL-TIME để hover thấy giá

1. Đăng ký eBay Developer: https://developer.ebay.com/my/keys và tạo **Production application keys** có quyền Browse API.
2. Tạo/cập nhật file **`.env`** cùng thư mục với `server.js` (lúc chạy `CHAY_WINDOWS.bat`, file này được tạo tự động). Mở `.env` bằng Notepad. Thêm:
   ```env
   EBAY_CLIENT_ID=YOUR_PRODUCTION_APP_ID
   EBAY_CLIENT_SECRET=YOUR_PRODUCTION_CERT_ID
   PORT=4173
   HOST=127.0.0.1
   ```
3. Dừng chương trình (`Ctrl+C`) và chạy lại `CHAY_WINDOWS.bat`.
4. Góc trái hiện **eBay API online**. Rê chuột vào một thẻ, giá Buy It Now được tra từ eBay Browse API và lưu tạm 15 phút. Nhấn **Quét giá 8 thẻ** để lấy nhóm thẻ đang hiển thị đầu tiên.

**Cách lọc**: chỉ lấy title chứa **PSA 10**, chỉ lấy `FIXED_PRICE` và loại kết quả nào có `AUCTION`, loại AGS/CGC/BGS, loại grade 8/9, loại thẻ không khớp phiên bản, số thẻ, dấu first edition, Reverse, Stamp, Gold... Giá hiển thị là listing *đang rao*, **không phải Sold**. eBay có thể đổi dữ liệu tìm kiếm; thao tác lọc theo title có thể bỏ sót một số listing hợp lệ, hoặc vẫn có lỗi tên/số. Hãy mở link kiểm tra cert PSA trước khi mua. Không có API thì app **không bịa giá live**.

**Chú ý**: eBay có thể yêu cầu eBay Developer duyệt hoặc cấp quyền API cho ứng dụng. App sẽ báo lỗi quyền nếu thiếu. File `.env` chứa key, đừng chia sẻ công khai.

## Tính năng

- **39 mẫu có sẵn:** 20 mẫu Snorlax từ bảng nghiên cứu cũ, cùng 19 mẫu bổ sung Snorlax/Munchlax (phần mở rộng có nhiều ô chưa xác minh).
- **Xếp S/A/B/C/D/F:** Điểm đầu tư là nhận định chủ quan có thể sửa, **không phải grade PSA**. S >=90, A >=80, B >=68, C >=55, D >=40, F <40. Phiên bản mới đồng bộ TCGdex được xếp sơ bộ có dấu `*` và cần kiểm chứng.
- **Đồng bộ kho thẻ:** nút `Đồng bộ kho thẻ` kết nối nguồn [TCGdex](https://tcgdex.dev/). Tra cả Snorlax / Munchlax tiếng Anh và tiếng Nhật (カビゴン / ゴンベ). Kho có thể **chưa có hết** promo/variant và nhiều phiên bản khác grade chung một artwork. Chưa có số PSA10/giá thì để trống, không suy đoán. Mỗi thẻ đồng bộ không bảo đảm tồn tại PSA 10.
- **Import:** CSV, JSON và Excel `.xlsx` (Excel cần server localhost), cột chuẩn xem `sample-import.csv`. Chỉ nhận grade PSA 10 hoặc grade trống (tự hiểu là danh mục PSA 10). Tự loại grade khác 10.
- **Chỉnh sửa:** Chọn `Xem phân tích` > `Chỉnh thẻ` để cập nhật grade population, giá, rank, ảnh, lời nhận xét, link PriceCharting, từ khóa eBay.
- **Lưu/yêu thích:** mọi thay đổi lưu vào trình duyệt. Bấm `Xuất dữ liệu` để tải JSON sao lưu rồi import lại bất kỳ lúc nào.
- **PriceCharting:** số liệu nghiên cứu snapshot **19/10/2026**. App không tự scrape, không sử dụng API PriceCharting không được cấp phép.
- **Giá thủ công:** có ô `Giá eBay thủ công`, chỉ sử dụng khi ông tự nhập, được phân biệt với giá API live.
- **Bộ lọc:** tên, nhân vật, tier, yêu thích, sắp xếp theo điểm, giá, PSA10 pop và năm.

## Lỗi thường gặp

- **Mở HTML file mà không thấy giá**: cần chạy `CHAY_WINDOWS.bat` và nhập production eBay keys. HTML tĩnh không thể an toàn gọi thẳng eBay API.
- **Không nhận Excel**: dùng localhost (server Node), hoặc chuyển Excel thành CSV UTF-8.
- **Không thấy phiên bản**: nhấn Đồng bộ kho thẻ hoặc Import, đôi khi TCGdex còn thiếu variant Nhật/PokéPark.
- **Giá không khớp**: app chỉ nhận listing *chắc chắn theo title*. Số thẻ bị viết thiếu hoặc tên khác sẽ bị loại. Thử chỉnh `ebayQuery` để tìm theo từ khóa khác. **Không tự trộn PSA / AGS**.
- **API báo 403 hoặc quota**: kiểm tra Production keys và quyền Browse API của tài khoản eBay Developer.
- **Làm mất danh mục khi đổi browser/xóa dữ liệu**: khôi phục bằng file JSON từ `Xuất dữ liệu`.

## Cấu trúc

`index.html` = giao diện standalone HTML/CSS/JS, `server.js` = Node server + eBay OAuth + TCGdex + XLSX parser; `catalog.json` = danh mục mẫu; `sample-import.csv` = file import mẫu; `.env.example` = mẫu cấu hình key; `CHAY_WINDOWS.bat` = chạy Windows; `chay_mac_linux.sh` = chạy hệ Unix.

### Nguồn kỹ thuật

- eBay Browse API: https://developer.ebay.com/develop/api/buy
- Browse API filters: https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html
- OAuth client credentials: https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html
- TCGdex: https://tcgdex.dev/rest/cards
