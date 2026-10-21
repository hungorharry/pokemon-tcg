# 📜 QUY TẮC CÀO VÀ CHUẨN HÓA HÌNH ẢNH THẺ BÀI (IMAGE SCRAPING RULES)
> **Tài liệu đặc tả tiêu chuẩn chất lượng hình ảnh (Quality Gate) cho toàn bộ hệ thống nghiên cứu thẻ bài Pokémon Snorlax & Munchlax PSA Graded.**  
> *Được thiết kế để ngăn chặn triệt để tình trạng ảnh "lỏ", ảnh vỡ hạt, ảnh sai nhân vật hoặc ảnh chói đèn.*

---

## 🚫 1. CÁC ĐIỀU CẤM TUYỆT ĐỐI (ZERO-TOLERANCE RULES)

Khi cào hoặc hiển thị ảnh thẻ bài vào hệ thống, các trường hợp sau đây **BỊ LOẠI BỎ NGAY LẬP TỨC**:

1. **CẤM HIỂN THỊ MẶT SAU (CARD BACK):**
   - Tuyệt đối không được lấy ảnh lưng thẻ bài Pokémon (vòng tròn Pokéball xanh dương) làm ảnh đại diện chính của thẻ.
2. **CẤM ẢNH HOẠT HÌNH / CARTOON / FANART:**
   - Không sử dụng ảnh chụp màn hình anime, tranh vẽ fanart chibi, hoạt hình 3D ngẫu nhiên để thay thế thẻ bài thật.
3. **CẤM ẢNH VỠ HẠT / THUMBNAIL SIÊU NHỎ:**
   - Nghiêm cấm sử dụng ảnh kích thước thumbnail `60x60px` hoặc `120x120px` phóng to. Ảnh hiển thị tối thiểu phải đạt chiều rộng $\ge 600\text{px}$ và chiều cao $\ge 840\text{px}$.
4. **CẤM NHẦM LẪN NHÂN VẬT & PHIÊN BẢN:**
   - Thẻ Snorlax chỉ được hiển thị hình Snorlax; thẻ Munchlax chỉ được hiển thị hình Munchlax; thẻ Tag Team phải có đủ cả hai nhân vật.
   - Thẻ `1st Edition` phải có tem số 1 đen; thẻ `Shadowless` không được dùng ảnh thẻ Unlimited; thẻ `Reverse Holo` không được dùng ảnh bản thường.
5. **CẤM ẢNH BỊ CHÓI ĐÈN FLASH / LỆCH GÓC MẠNH:**
   - Khi cào từ eBay/PriceCharting, nếu ảnh bị bóng đèn neon che khuất artwork hoặc bị chụp chéo góc quá $20^\circ$, hệ thống phải chuyển sang phôi Studio Ultra HD.

---

## 🏆 2. THỨ BẬC ƯU TIÊN NGUỒN ẢNH (IMAGE SOURCE HIERARCHY)

Hệ thống phải tự động truy xuất ảnh theo đúng 4 cấp độ ưu tiên sau:

```
[Cấp 1: PriceCharting 1600px Studio CDN]
                  │
                  ▼ (Nếu lỗi hoặc không có ảnh)
[Cấp 2: PSA Official SecureScan 4K CDN]
                  │
                  ▼ (Nếu thẻ chấm trước 2021)
[Cấp 3: Pokémon TCG Official Hi-Res Vector (2000x2800px)]
                  │
                  ▼ (Dự phòng khẩn cấp)
[Cấp 4: Khung Mica Acrylic PSA 10 Bọc Phôi Chuẩn]
```

### Chi tiết từng cấp độ:
* **Cấp 1 - PriceCharting 1600px Ultra HD CDN:**
  - Định dạng URL: `https://storage.googleapis.com/images.pricecharting.com/{image_hash}/1600.jpg`
  - Ưu điểm: Ảnh scan kích thước lớn, màu sắc trung thực, lưu trữ trên cụm Google Cloud Storage tốc độ cao, không bị Cloudflare chặn khi trình duyệt tải.
* **Cấp 2 - PSA Official Industrial SecureScan 4K:**
  - Định dạng URL: `https://cert-images.psa.com/{cert_number}/large/{cert_number}_f.jpg`
  - Điều kiện: Áp dụng cho các thẻ có mã số chứng chỉ (Cert Number) được kiểm định từ cuối năm 2021 trở lại đây.
* **Cấp 3 - Phôi Gốc Nhà Xuất Bản (Pokémon TCG Official Hi-Res CDN):**
  - Định dạng URL: `https://images.pokemontcg.io/{set_id}/{card_id}_hires.png`
  - Ưu điểm: Độ phân giải siêu cao (2000x2800px), góc vuông chuẩn 100%, không dính vân tay, không dính bóng phản chiếu.
* **Cấp 4 - Dự Phòng Khẩn Cấp (Emergency Fallback):**
  - Trong trường hợp mất mạng hoặc URL ngoài bị chết, hệ thống kích hoạt hàm `handleImgError(this, backupUrl, species)` để tự động nạp ảnh phôi chất lượng cao nội bộ đã được cache sẵn.

---

## ⚙️ 3. QUY TRÌNH KIỂM SOÁT CHẤT LƯỢNG TỰ ĐỘNG (QUALITY GATE PIPELINE)

Mọi ảnh trước khi ghi vào cơ sở dữ liệu `data/cards.json` phải vượt qua tập lệnh kiểm tra:

```javascript
// Bộ tiêu chí kiểm định ảnh hợp lệ:
function validateCardImage(imageUrl, cardMeta) {
  // 1. Kiểm tra định dạng link
  if (!imageUrl || (!imageUrl.startsWith('https://storage.googleapis.com') && !imageUrl.startsWith('https://images.pokemontcg.io') && !imageUrl.startsWith('https://cert-images.psa.com'))) {
    return { valid: false, reason: "Nguồn ảnh không thuộc danh sách CDN được phép" };
  }

  // 2. Chặn các biến thể thumbnail kích thước nhỏ
  if (imageUrl.includes('/60.jpg') || imageUrl.includes('/120.jpg')) {
    return { valid: false, reason: "Ảnh dính kích thước thumbnail 60px/120px" };
  }

  // 3. Phải ép URL lên chuẩn 1600px nếu là PriceCharting
  if (imageUrl.includes('pricecharting.com') && !imageUrl.endsWith('/1600.jpg')) {
    imageUrl = imageUrl.replace(/\/\d+\.jpg$/, '/1600.jpg');
  }

  return { valid: true, sanitizedUrl: imageUrl };
}
```

---

## ✍️ 4. KHU VỰC RÀNG BUỘC BỔ SUNG CỦA BẠN (CUSTOM USER CONSTRAINTS)

*Mời bạn nhập thêm các ràng buộc, tiêu chí gắt gao hoặc điều kiện đặc thù mà bạn muốn hệ thống tuân thủ vào bên dưới:*

### [Ràng Buộc Bổ Sung Của Bạn]:
- **Ràng buộc 1:** *(Ví dụ: Thẻ nào có giá trên 1,000$ bắt buộc phải là ảnh chiếc Slab PSA nguyên vẹn, không được cắt mất phần nhãn tem đỏ PSA)*
- **Ràng buộc 2:** *(Ví dụ: Ưu tiên ảnh nền đen buồng tối của sàn đấu giá PWCC/Goldin hơn ảnh nền trắng)*
- **Ràng buộc 3:** *(Ví dụ: Cấm hoàn toàn ảnh chụp có dính ngón tay người bán cầm trên tay)*
- **Ràng buộc 4:** ...

---

## 📂 5. VỊ TRÍ LƯU TRỮ TÀI LIỆU
* Đường dẫn chính: `c:\Users\hungtn\Downloads\Nghiên cứu chơi\IMAGE_SCRAPING_RULES.md`
* Bản sao ứng dụng: `c:\Users\hungtn\Downloads\Nghiên cứu chơi\snorlax-munchlax-investment-research\IMAGE_SCRAPING_RULES.md`
