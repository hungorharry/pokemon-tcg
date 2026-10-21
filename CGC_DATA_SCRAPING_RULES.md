# 📜 QUY TẮC CÀO VÀ THẨM ĐỊNH DỮ LIỆU CGC POPULATION REPORT (CGC DATA SCRAPING RULES v1.0)
> **Tài liệu đặc tả phương pháp thu thập, tính toán độ khó ra Grade 10, Grade 9 và phân bổ số lượng thẻ gửi chấm tại CGC Cards (Certified Guaranty Company).**  
> *Áp dụng độc lập với PSA để nhà đầu tư đối chiếu độ khắt khe, tỷ lệ Gem Mint và độ hiếm thực tế của từng thẻ Snorlax & Munchlax.*

---

## 🏛️ 1. CẤU TRÚC HỆ THỐNG GRADING CỦA CGC CARDS

CGC Cards áp dụng thang điểm từ 1 đến 10 với hệ thống nhãn đặc biệt:

| Cấp Grade CGC | Tên Gọi Chuẩn | Loại Nhãn (Label) | Ý Nghĩa Sưu Tầm & Đầu Tư |
| :--- | :--- | :--- | :--- |
| **CGC Pristine 10** | Pristine 10 | **Nhãn Vàng Kim (Gold Label)** | Cấp độ hoàn hảo tuyệt đối (4 góc vuông sắc lẹm, bề mặt không tì vết, centering 50/50). Độ hiếm cao hơn cả PSA 10. |
| **CGC Gem Mint 10** | Gem Mint 10 | **Nhãn Trắng Chuẩn (White Label)** | Tương đương PSA 10 Gem Mint. Thẻ đạt độ sắc nét hoàn hảo dưới mắt thường. |
| **CGC Mint 9.5** | Gem Mint (Cũ) / Mint+ | Nhãn Trắng / Xanh cũ | Phân khúc chuyển giao giữa 9 và 10; phần lớn thẻ raw đẹp bị kẹt ở mốc này. |
| **CGC Mint 9** | Mint 9 | Nhãn Trắng | Thẻ gần như hoàn hảo nhưng dính 1 lỗi vi mô (mép hơi xơ, centering 55/45). |
| **CGC < 9 (8.5 - 1)** | Near Mint & Sub-grades | Nhãn Trắng | Thẻ có vết xước holo, cấn góc, cong vênh hoặc bạc mép cạnh (silvering). |

---

## 📊 2. CÔNG THỨC TÍNH TOÁN ĐỘ KHÓ RA 10 VÀ RA 9 (GRADING DIFFICULTY INDEX)

Mỗi thẻ trong hệ thống bắt buộc phải tính toán 3 chỉ số then chốt:

### 1. Tỷ Lệ Đạt CGC 10 (Pristine 10 + Gem Mint 10):
$$\text{CGC 10 Rate (\%)} = \frac{\text{CGC Pristine 10} + \text{CGC Gem Mint 10}}{\text{Tổng số thẻ đã gửi chấm CGC}} \times 100\%$$

* **Cực Hiếm Ra 10 ($< 5\%$):** Khối thẻ Vintage WotC (Jungle 1999, Legendary Collection, Skyridge). Nguồn phôi in 25 năm trước có lỗi cắt mép (silvering) và lệch tâm tự nhiên từ nhà in. Hầu hết thẻ gửi đi đều bị kẹt ở điểm 8.5 hoặc 9.
* **Khó Ra 10 ($5\% - 15\%$):** Thẻ Mid-Era (EX Series, Rising Rivals, Call of Legends).
* **Trung Bình ($15\% - 30\%$):** Thẻ Modern English (Sword & Shield, Scarlet & Violet 151).
* **Dễ Ra 10 ($> 30\%$):** Thẻ Nhật Bản (Japanese Promos, Vending, CD Promo, Tag Bolt) do quy trình in ấn tại Nhật áp dụng kiểm định chất lượng (QC) nghiêm ngặt hơn Mỹ gấp nhiều lần.

---

### 2. Tỷ Lệ Ra CGC 9 (Mint 9+ Rate):
$$\text{CGC 9+ Rate (\%)} = \frac{\text{CGC 9} + \text{CGC 9.5} + \text{CGC 10}}{\text{Tổng số thẻ đã gửi chấm CGC}} \times 100\%$$

* Chỉ số này đo lường: **Khả năng giữ trạng thái sưu tầm cao cấp của phôi thẻ**.
* Nếu một thẻ có tỷ lệ ra 9 dưới $40\%$, điều đó chứng tỏ phôi thẻ raw của dòng đó rất dễ bị hư hại bề mặt (mặt Holo mềm dễ xước dăm như Jungle hoặc Dark Phantasma).

---

## 🔎 3. ĐẶC TẢ SCHEMA DỮ LIỆU CGC BẮT BUỘC (DATA SCHEMA)

Trong cơ sở dữ liệu `cards.json`, mỗi thẻ phải chứa khối `cgc_data` độc lập:

```json
{
  "cgc_data": {
    "total_submitted": 420,
    "pop_pristine_10": 4,
    "pop_gem_mint_10": 18,
    "pop_mint_9": 142,
    "pop_below_9": 256,
    "rate_10_percent": 5.2,
    "rate_9_percent": 39.0,
    "difficulty_level": "CỰC HIẾM RA 10",
    "difficulty_verdict": "94.8% số thẻ gửi đến CGC bị rớt điểm xuống 9 hoặc thấp hơn do lỗi bạc mép cắt WotC 1999.",
    "cgc_pop_report_url": "https://www.cgccards.com/population-report/",
    "pristine_10_multiplier": "2.5x - 4x so với PSA 10"
  }
}
```

---

## 🌐 4. QUY TRÌNH CÀO VÀ ĐỐI CHIẾU POPULATION REPORT CGC

```text
Trang web CGC Cards Pop Report (cgccards.com/population-report/)
    → Nhập từ khóa danh tính: Snorlax / Munchlax
    → Lọc Category: Trading Card Games (TCG) → Pokémon
    → Chọn đúng Set name và Printed Card Number
    → Trích xuất bảng số liệu:
         + Total Graded
         + Perfect 10 / Pristine 10
         + Gem Mint 10
         + Mint 9.5 / 9.0
         + Các grade thấp hơn (8.5 trở xuống)
    → Tính toán Rate 10% & Rate 9%
    → Gán đánh giá độ khó và lưu vào cgc_data
```

### Lưu ý kỹ thuật về bản quyền & API CGC:
- Trang web CGC Cards sử dụng Cloudflare bảo vệ. Khi cào tự động, phải áp dụng User-Agent hợp lệ, tôn trọng robots.txt và giới hạn tần suất (Rate limit 1 req/3s).
- Khi người dùng bấm tra cứu trên Dashboard, luôn cung cấp liên kết trực tiếp mở trang tra cứu của CGC để người dùng kiểm chứng hồ sơ thời gian thực.
