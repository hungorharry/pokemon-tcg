# PROMPT DÁN VÀO CODEX (VS CODE) - FIX TRIỆT ĐỂ SNORLAX/MUNCHLAX IMAGE SCRAPING

Đóng vai kỹ sư dữ liệu Pokémon TCG + QA ảnh + maintainer ứng dụng. Mục tiêu là **không còn hiển thị ảnh sai thẻ Snorlax/Munchlax** trong dự án hiện tại; chấp nhận thiếu ảnh khi chưa có chứng cứ, tuyệt đối không "chữa cháy" bằng ảnh gần giống.

**ĐỌC TRƯỚC KHI SỬA:**
1. Tìm thư mục dự án `snorlax-munchlax-investment-research` ở workspace hiện tại; đọc cấu trúc, package scripts, các trình crawler, `data/cards.json`, logic gắn ảnh của giao diện, cache, và bộ test.
2. Đọc file `IMAGE_SCRAPING_RULES_v2.md` đi kèm prompt này. Nếu file chỉ ở thư mục cha `Nghiên cứu chơi`, cũng dùng nó. Nếu không tồn tại: dừng việc tự động ghi ảnh và báo thiếu tài liệu, không tự tuyên bố đã sửa xong.
3. Đọc `data/PRICECHARTING_CANDIDATES.csv` nếu có. Đây là **danh sách ứng viên**, không phải ảnh đã xác minh. Dữ liệu gồm Snorlax, Munchlax và cả mục cần loại trừ.
4. Kiểm tra trạng thái Git, không xóa thay đổi người dùng chưa commit. Lập kế hoạch ngắn và nêu file dự kiến sửa trước khi thay đổi.

## A. Sửa lỗi danh tính và phân loại sản phẩm

- Không crawl theo tên chung rồi lấy ảnh đầu tiên, không tìm và thay URL thiếu `card_key`.
- Xây identity duy nhất từ (subjects, tên, set, printed_number, language, region, edition, foil, stamp, format). Tách các biến thể cùng artwork; không ghép `1st Edition` với Unlimited, Holo với Reverse Holo, Snorlax #11 với #27, Munchlax #69 với #70.
- Không suy đoán `set_id`, phiên bản, rarity, cert từ slug của người bán. Những trường không được xác thực thì dùng null + review.
- Phân loại OUT_OF_SCOPE đối với LEGO, Funko, Mini Tin, Old Maid, Jumbo, Snorlax Doll trong universe TCG chuẩn; mở rộng nếu có danh mục riêng.
- `Eevee & Snorlax GX` là Snorlax Tag Team với Eevee. Không gán là thẻ Munchlax.
- Không coi 100 kết quả Snorlax và 33 kết quả Munchlax trong snapshot PriceCharting là toàn bộ universe chính thức.

## B. Sửa crawler và resolver ảnh

- Đọc dữ liệu `pricecharting_product_id + exact_title + set + URL` từ đúng ô HTML. Vào đúng product page (nếu được phép) để tìm URL ảnh. Không lấy bừa `<img>` từ quảng cáo, carousel, liên kết bán hàng hoặc ảnh backside.
- URL `/60.jpg` chỉ là thumbnail; `/1600.jpg` có thể được tạo làm ứng viên nhưng **phải tải kiểm HTTP, bytes, MIME, width/height và chứng minh khớp đúng identity**. Nếu không có ảnh 1600, không tự phóng lớn thumbnail.
- Sửa sanitizer đang dùng chuỗi Markdown sai định dạng trong `startsWith`. Dùng `new URL(...)`, exact host allowlist, kiểm redirect và chống SSRF. Nguồn 3rd-party phải có quyền truy cập hợp lệ; tôn trọng robots, ToS, rate limit.
- Có validation pixel thật >= 600x840 (cho card portrait); kiểm mặt trước, không chói, không crop nhãn slab PSA, không lệch quá 20°. Với slab, áp dụng yêu cầu ROI card + label đầy đủ.
- Phân biệt ảnh raw card/reference và ảnh PSA slab; slab phải khớp cert thật, đúng grade. PSA SecureScan không bị ràng buộc mốc 2021. **KHÔNG** tạo slab PSA 10 giả.
- Đối chiếu OCR/số thẻ/biến thể và ảnh đối chứng khi đủ dữ liệu. Foil/edition bất khả phân biệt bằng một ảnh tĩnh thì chuyển review; không đoán.
- Không dùng ảnh Munchlax làm Snorlax hoặc ngược lại. Không dùng ảnh của bản standard làm Reverse Holo dù artwork giống.

## C. Sửa database, cache và UI

- Ưu tiên tái sử dụng schema hiện tại bằng migration tương thích ngược. Tạo các trạng thái `APPROVED`, `REFERENCE_ART_ONLY`, `REVIEW_REQUIRED`, `REJECTED`, `MISSING` và lưu evidence/provenance + SHA256.
- Chỉ `APPROVED` hiện làm primary_image. `REFERENCE_ART_ONLY` có thể hiện riêng và phải có caption chính xác.
- Nếu không có ảnh APPROVED, hiện placeholder đẹp **"Chưa xác minh ảnh thẻ"** cùng set/số/biến thể và link nguồn, tuyệt đối không hiện sai một lá khác.
- Không xóa ảnh APPROVED đang cache khi crawler lỗi tạm thời. Không gán cert PSA cho bất kỳ ảnh slab không đúng chứng nhận.
- Xuất `image-qa-report.json`, `image-review-queue.json`, ghi reasons chính xác cho mọi thẻ chưa duyệt.

## D. Test kiểm nghiệm (phải chạy, không chỉ mô tả)

Viết unit/integration test với fixture HTML và các case:
1. Snorlax Jungle #11 thường khác [1st Edition] #11 và [No Symbol] #11.
2. Munchlax Rising Rivals #69 khác #70 và khác [Reverse Holo] #69.
3. Eevee & Snorlax GX #SM169 phải có Snorlax/Eevee, không nhận là Munchlax.
4. Japanese 151 Snorlax #181 không được match English 151 Snorlax #143.
5. LEGO/Funko/Mini Tin, Snorlax Doll, Old Maid, Jumbo bị tách khỏi TCG standard.
6. 60x60 bị loại; URL 1600 chưa tồn tại/không đủ pixel bị loại; ảnh không xác minh -> placeholder.
7. URL giả mạo domain, redirect ngoài allowlist và response HTML không được ghi vào cards.json.
8. Sai edition/foil/cert phải bị từ chối; fallback không được vòng lặp và không được nhảy sang card khác.
9. Có thể parse chính xác **100 row Snorlax và 33 row Munchlax** từ snapshot cung cấp, không nhầm đó là 133 thẻ TCG hợp lệ hay là danh sách toàn bộ ngoài đời.

## E. Quy trình thực hiện + báo cáo

- Bước 1: Audit và báo bug gốc, nêu file/line gây lỗi.
- Bước 2: Backup JSON và ảnh hiện tại, xây card identity + classifier.
- Bước 3: Xây verified image resolver + validator + queue + fallback.
- Bước 4: Migration an toàn và sửa UI.
- Bước 5: Thêm fixture/test, chạy script build/lint/test thực tế.
- Bước 6: Báo lại bảng: bao nhiêu sản phẩm đầu vào, OUT_OF_SCOPE, APPROVED, REVIEW_REQUIRED, REJECTED, MISSING; danh sách không đạt; file nào sửa.

**ACCEPTANCE CRITERIA:** 0 ảnh sai danh tính được đưa lên giao diện trong fixture đã xác minh. Không báo `100% ảnh đúng` chỉ vì URL trả 200. Nếu không có reference image/cert đáng tin, giữ trạng thái chưa xác minh và nói rõ coverage thực tế. Nếu thiếu file CSV hoặc có môi trường offline thì test fixture vẫn phải chạy, không bịa kết quả real crawl. Giữ các luồng giá/đầu tư không liên quan, tránh breaking change. Không tự chạy lệnh phá dữ liệu. Có Git thì commit theo bước sau khi test thành công, trừ khi workspace có thay đổi chưa xử lý.
