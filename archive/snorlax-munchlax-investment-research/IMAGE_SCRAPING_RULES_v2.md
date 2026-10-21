# IMAGE_SCRAPING_RULES v2.0 | Snorlax & Munchlax PSA Research

> **Mục tiêu:** Không hiển thị **bất kỳ ảnh sai nhân vật, sai bộ, sai số thẻ, sai bản in, sai biến thể, sai loại sản phẩm hoặc sai tình trạng PSA nào** dưới danh nghĩa ảnh đã xác minh. Khi không xác minh được, giao diện phải ghi rõ **"Chưa có ảnh được xác minh"**, không tự thế ảnh gần giống.
>
> **Fail closed:** Ưu tiên bỏ trống có giải thích hơn là ảnh đẹp nhưng sai. Tài liệu này là *đặc tả triển khai*, không chứng minh rằng bất kỳ ảnh nào trong CSV đã được kiểm duyệt.

## 0. Vì sao v1 sai, sửa cái gì?

1. `validateCardImage(url, meta)` ở v1 hầu như chỉ xét tiền tố URL; **không đọc pixel ảnh**, không kiểm tra `name`, `set`, `number`, `variant`, `edition`, `language`, `cert`.
2. Code ví dụ có chuỗi Markdown trong `startsWith('[https://...](https://...)')`, không khớp với URL thực tế. Phải dùng URL parser và so sánh `hostname` chính xác.
3. Trang PriceCharting dạng danh sách đưa ảnh `/60.jpg`; thay `/60.jpg` thành `/1600.jpg` chỉ là **tạo một URL ứng viên**, không có nghĩa URL trả HTTP 200 hoặc thật sự 1600px.
4. Danh sách kết quả từ khóa chứa **nhiều loại hàng hóa**, không thể coi mọi kết quả là thẻ TCG. `Eevee & Snorlax GX` là thẻ Tag Team có **Eevee + Snorlax**, không phải Snorlax + Munchlax.
5. `PSA SecureScan` không có ranh giới cứng "trước/sau năm 2021". PSA cho biết chương trình SecureScan bắt đầu từ 2019; tình trạng có ảnh phụ thuộc hồ sơ chứng nhận thực tế.
6. `images.pokemontcg.io` là ảnh từ **dịch vụ bên thứ ba**, không phải API chính thức của The Pokémon Company; PNG là raster, không phải "vector". Nhà cung cấp Pokémon TCG API cũ thông báo dừng ngày **01/03/2027**; không xây phụ thuộc dài hạn vào endpoint đó.
7. Tự bọc hình card vào **khung PSA 10 giả** là hành vi mô phỏng có thể gây hiểu lầm trong nghiên cứu đầu tư. **CẤM** dùng ảnh giả slab/grade để đại diện vật phẩm đã chấm PSA.

## 1. Phạm vi dữ liệu (nhất định phải chọn từ đầu)

- Mặc định chỉ nhận các **thẻ Pokémon TCG kích thước tiêu chuẩn** có Pokémon đích là Snorlax và/hoặc Munchlax. Có thể bao gồm `Rocket's Snorlax`, `Hop's Snorlax`, `Eevee & Snorlax GX` nếu metadata xác nhận Snorlax xuất hiện; không tự đòi Tag Team có Munchlax.
- Loại mặc định: `LEGO`, `Funko`, `Mini Tin`, hộp hàng, `Old Maid`, `Jumbo`, `Snorlax Doll` (Trainer/Item). Nếu muốn nghiên cứu cameo, Jumbo hoặc ngoài TCG, tạo **danh mục tách biệt** `non_core`, không lẫn vào universe PSA chuẩn.
- Các bản `1st Edition`, `Unlimited`, `Shadowless`, `Holo`, `Reverse Holo`, `Cosmos Holo`, `Master Ball`, `Stamped`, `Staff`, `Prerelease`, `No Symbol`, `error`, Promo **không được gộp ảnh** chỉ vì trùng artwork, set hoặc số thẻ.
- Dữ liệu danh sách tìm kiếm = **ứng viên**, không phải danh mục đầy đủ và không phải bằng chứng ảnh đúng. Không tự tuyên bố đã bao phủ 100% mọi thẻ trên thế giới từ 2 trang tìm kiếm.

## 2. Khoá danh tính (Identity Key) bắt buộc

Mỗi bản in phải có ít nhất:

```json
{
  "card_key": "species|set_id|printed_number|language|edition|foil|stamp|format",
  "subjects": ["Snorlax"],
  "exact_title": "Snorlax [1st Edition] #11",
  "set_name": "Pokemon Jungle",
  "set_id": null,
  "printed_number": "11",
  "printed_total": null,
  "language": "en",
  "region": "US",
  "edition": "1st Edition",
  "foil": "Holo",
  "stamp": "none",
  "format": "standard",
  "item_type": "POKEMON_TCG_CARD",
  "pricecharting_product_id": "643384",
  "pricecharting_product_url": "https://www.pricecharting.com/game/pokemon-jungle/snorlax-1st-edition-11",
  "psa": {"cert_number": null, "grade": null},
  "image": {"status": "PENDING", "source_url": null, "local_path": null, "sha256": null, "evidence": []}
}
```

- Giá trị trên là **ví dụ cấu trúc**, không phải bản ghi đã xác minh. Trường chưa tìm được = `null`; không đoán `set_id`, không mặc định `foil=Holo` cho mọi ảnh cùng bộ, không bịa `PSA 10`.
- `card_key` chỉ được lập khi metadata tối thiểu đã được kiểm chứng. Thiếu `set_id`, edition hoặc foil quan trọng: `REVIEW_REQUIRED`, không được tự ghép nhầm từ `exact_title`.
- PSA slab là **một hiện vật cụ thể**: thêm `cert_number + grade + grading_company`; ảnh PSA theo chứng nhận không được chuyển sang một cert khác, kể cả cùng card/grade.
- Giữ `source_product_id`, `source_url`, `checked_at`, `identity_verified_by`, `identity_evidence_url`. 1 id PriceCharting không thay thế id chuẩn của nhà phát hành.

## 3. Quy trình bắt buộc: Metadata → Identity → Image → Display

```text
HTML/listing của PriceCharting
    → Trích product_id + chính xác title + set + page URL
    → Phân loại item_type, loại SKU/đồ chơi/Jumbo/Trainer nếu ngoài phạm vi
    → Chuẩn hóa identity từ ít nhất 1 nguồn dữ liệu card độc lập và/hoặc bằng chứng người kiểm duyệt
    → Tạo nhóm ảnh ứng viên CHỈ cho card_key đó
    → Tải ảnh thật và kiểm bytes, MIME, kích thước, orientation, hiệu ứng lóe sáng
    → OCR + kiểm số thẻ/phiên bản + so hình với bản tham chiếu đã xác minh
    → Xác minh metadata slab PSA nếu hiển thị là ảnh graded
    → APPROVED hoặc REVIEW_REQUIRED / REJECTED
    → Lưu ảnh đã duyệt vào assets nội bộ và gắn đúng card_key
```

**Quy tắc không thương lượng:** Tuyệt đối không dùng tìm kiếm chung `snorlax.jpg`, Google ảnh, ảnh đầu tiên của eBay/PriceCharting, tên file, hoặc `image URL contains snorlax` làm bằng chứng. Không dùng ảnh từ **card khác** khi URL ảnh chính chết. `handleImgError` chỉ chuyển giữa **các URL đã APPROVED của cùng `card_key`**, nếu không có thì hiện placeholder trung tính.

## 4. Nguồn và thứ bậc ưu tiên có điều kiện

**Bước 1: Xác minh danh tính trước.** Ưu tiên catalogue thẻ có ID thật và metadata `set / printed number / version / region`; đối chiếu trang chi tiết PriceCharting theo `product_id`; kiểm lại với bảng tham chiếu đã duyệt. Nguồn bên thứ ba không được gọi là dữ liệu "official".

**Bước 2: Tìm ảnh đúng mục đích.**

| Mục đích | Ưu tiên | Điều kiện bắt buộc |
|---|---|---|
| Ảnh slab PSA của *cert cụ thể* | PSA Cert Verification / SecureScan | Cert, card, grade trùng khớp; có ảnh thực và có quyền sử dụng |
| Ảnh slab sàn đấu giá | Ảnh listing gắn cùng PSA cert | Đọc rõ cert/label, khớp metadata, có bằng chứng nguồn, không chói |
| Ảnh card mặt trước để nhận diện artwork | Catalogue/hình quét card chất lượng cao đã đối chiếu | Trùng identity + variant; ghi rõ "ảnh mặt thẻ tham khảo, không phải slab PSA" |
| Ảnh PriceCharting | Trang product ID chính xác + ảnh ứng viên rõ | Tải/đo/đối chiếu, không lấy từ ô kết quả tìm kiếm và mặc nhiên coi là đúng |
| Không có ảnh đạt | Placeholder "CHƯA XÁC MINH ẢNH" | Giữ tên, set, số và liên kết nguồn để tra cứu |

- Không dựng công thức PSA CDN hoặc PriceCharting CDN rồi đánh dấu đã xác minh. URL chỉ là ứng viên, phải thử và kiểm chứng, tôn trọng quyền tác giả/điều khoản truy cập.
- Bất kể nguồn nào, áp dụng rate limit, retry có backoff, không vượt kiểm soát truy cập hoặc cơ chế chống bot, không hotlink khi bị cấm.

## 5. Bộ chặn chất lượng hình ảnh thực (Image Gate)

### 5.1 URL và tải ảnh

- Sử dụng `new URL(url)` / parser tin cậy. Chỉ HTTPS. Dùng **exact allowlist hostname** do project cấu hình; không dùng `startsWith` với URL hoặc hostname substring. Kiểm mỗi lần redirect, tránh SSRF, giới hạn số byte, timeout, retry và Content-Type.
- Kiểm **magic bytes + decoder**: JPEG/PNG/WebP nếu ứng dụng hỗ trợ. HTTP 200 nhưng trả HTML/challenge/1px pixel vẫn phải bị loại.
- Kiểm `width >= 600`, `height >= 840` **theo file thật đã tải**, không căn cứ tên `/1600.jpg`. Với crop slab/ảnh ngang, yêu cầu ROI card đủ nét và cho phép định nghĩa riêng nhưng không nới luật lén lút.
- Loại ảnh backside, placeholder, thumbnail được phóng to, ảnh bị bệt JPEG, mất góc, mất nhãn PSA khi đang gọi là slab.
- Góc lệch trên 20°, flash che nội dung, ngón tay che số thẻ, foil trắng bệt không đọc được: `REVIEW_REQUIRED` hoặc `REJECTED`.

### 5.2 Danh tính trong ảnh

- Kiểm OCR (nếu khả thi) tên card, số in, set symbol, language, logo edition/stamp; đối chiếu kết quả với `card_key`. Không có OCR hoặc OCR không đọc được = **không đủ bằng chứng tự động**, không có quyền APPROVED.
- `Reverse Holo`, `Holo`, `Master Ball`, `1st Edition`, `No Symbol`, error/print-run: yêu cầu ảnh/biên bản chuyên biệt. Artwork trùng **không** đủ.
- Nhận diện ảnh bằng thị giác/AI/pHash chỉ là công cụ phát hiện sai hoặc lấy shortlist; **không dùng điểm similarity cao làm quyền vượt kiểm tra variant**.
- Nếu ảnh chỉ đủ chứng minh phần artwork, đánh dấu `REFERENCE_ART_ONLY` và hiển thị riêng; không ghi là ảnh in của biến thể cụ thể.

### 5.3 PSA riêng

- Nếu UI hiển thị `PSA 8/9/10` trên vật phẩm/ảnh, buộc có `cert_number`, đúng tên, set, number, grade, grading company ở nguồn kiểm chứng. Với ảnh slab, nhãn đầy đủ và card đều phải hiển thị.
- Nếu thông tin không khớp, `REJECTED` hoặc `REVIEW_REQUIRED` và **không hiển thị slab như đã xác thực**. Ngay cả cert có thật cũng không tự xác nhận người bán đang sở hữu đúng hiện vật hay ảnh listing không bị đánh cắp.
- **CẤM** tạo slab PSA 10 giả, dán logo/nhãn PSA giả, tự chỉnh grade để lấp ảnh thiếu.

## 6. Chính sách xuất dữ liệu và fallback

```json
{
  "image": {
    "status": "APPROVED | REFERENCE_ART_ONLY | REVIEW_REQUIRED | REJECTED | MISSING",
    "card_key": "...",
    "source_url": "...",
    "local_path": "assets/cards/<card_key>/<sha256>.webp",
    "sha256": "...",
    "width": 1200,
    "height": 1680,
    "identity_evidence": ["source product id", "reference card identity"],
    "approved_by": "manual-or-strict-evidence",
    "checked_at": "ISO-8601"
  }
}
```

- Ví dụ JSON nêu **schema**, không phải kết quả kiểm duyệt thực tế.
- **Chỉ ảnh `APPROVED`** được làm `primary_image`. `REFERENCE_ART_ONLY` chỉ hiện trong ô riêng, có caption phân biệt. `REVIEW_REQUIRED`, `REJECTED`, `MISSING` = placeholder trung tính.
- Lưu đè vào `data/cards.json` **chỉ khi có `card_key` và bằng chứng APPROVED**; không xoá ảnh cũ hợp lệ nếu lượt crawl mới lỗi.
- Duy trì `data/image-review-queue.json` với lý do chính xác (ví dụ `ERR_VARIANT_MISMATCH`, `ERR_NOT_A_CARD`, `ERR_TOO_SMALL`, `ERR_PSA_CERT_MISMATCH`, `ERR_NO_VALID_IMAGE`).
- Có nhật ký `image-qa-report.json` gồm tổng số ứng viên, số approved, số tạm hoãn, số loại và loại lỗi; không được báo mọi ảnh hợp lệ khi chưa kiểm duyệt.

## 7. Test case bắt buộc (không được chỉ kiểm URL)

| Tình huống | Kết quả phải đạt |
|---|---|
| `Snorlax #11` Jungle vs `Snorlax [1st Edition] #11` Jungle | 2 identity khác nhau; không dùng chung ảnh nếu chưa chứng minh đúng edition |
| `Snorlax [No Symbol] #11` Jungle | 1 identity riêng, yêu cầu xác nhận dấu/không dấu |
| `Munchlax #69` vs `Munchlax #70` Rising Rivals | 2 identity khác số; ảnh không được hoán đổi |
| `Munchlax #69` vs `[Reverse Holo] #69` Rising Rivals | 2 biến thể, không cho artwork thường thế foil |
| `Snorlax #181` Japanese Scarlet & Violet 151 vs `Snorlax #143` English Scarlet & Violet 151 | Không ghép lẫn ngôn ngữ/set và số |
| `Eevee & Snorlax GX #SM169` | Hợp lệ cho tập Snorlax; đồng chủ thể là Eevee, không bịa Munchlax |
| `Munchlax #72150` LEGO & `Munchlax #885/#917` Funko | OUT_OF_SCOPE |
| `Sinnoh Stars Mini Tin [Munchlax]` | OUT_OF_SCOPE |
| `Snorlax Doll #175` (Trainer) / `Old Maid` / `Jumbo` | OUT_OF_SCOPE trong universe mặc định; có thể mở rộng riêng |
| Ảnh `60.jpg` trả HTTP 200 | REJECTED nếu file thật không đạt pixel gate |
| Tạo `/1600.jpg` nhưng trả 404, ảnh nhỏ, HTML hoặc không đúng card | Không được APPROVED |
| URL trả ảnh đúng nhân vật nhưng sai edition/foil/set/cert | REJECTED hoặc REVIEW_REQUIRED, không được hiển thị |
| API ảnh bên thứ ba không khả dụng | Giữ card metadata; hiện placeholder; không đổi sang thẻ tương tự |
| Ảnh đã duyệt mất mạng | Cache bản APPROVED cũ (nếu có quyền) hoặc placeholder |

## 8. KPI nghiệm thu

- Trên bộ test đã được duyệt thủ công: **0 sai danh tính được phép hiển thị** (false positive = 0). Nếu không đạt thì build phải FAIL.
- `100%` bản ghi có `image.status`, nguồn + lý do, không được để ảnh random vì thiếu ảnh thật.
- `100%` ảnh gắn nhãn slab PSA có chứng cứ cert/grade chính xác; nếu chưa có, **0 ảnh slab chưa xác minh xuất hiện**.
- Tỷ lệ phủ ảnh APPROVED có thể thấp hơn 100% và phải được báo trung thực. **Không đồng nhất 100% đúng với 100% có ảnh.**
- Có test tự động cho parser HTML, item classifier, identity key, image bytes/dimensions, mapping variant, cache và giao diện.
- Trước khi merge: tạo bản backup `data/cards.json`, xuất báo cáo đối chiếu, kiểm từng ảnh đang lỗi qua review queue và lưu test snapshot.

## 9. Nguồn tham khảo kỹ thuật

- PSA: https://www.psacard.com/support/faq (SecureScan bắt đầu từ 2019; xác minh theo cert thực tế)
- PriceCharting: https://blog.pricecharting.com/2021/01/how-to-tell-what-pokemon-card-you-have.html
- Pokémon TCG API cũ: https://docs.pokemontcg.io/ (bên thứ ba; thông báo ngừng dịch vụ 2027)
- PriceCharting danh sách trong CSV đi kèm: dữ liệu ứng viên được trích từ HTML người dùng cung cấp; **không có ảnh nào đã được APPROVED**.
