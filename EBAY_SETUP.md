# Kết nối giá và ảnh eBay

Khuyến nghị Node.js 24 (phiên bản đã kiểm tra). Ứng dụng không dùng giá trong `cards.json` thay cho dữ liệu eBay.

1. Tạo khóa **Production** trong eBay Developers Program. Tài khoản cần quyền dùng Browse API; khóa Sandbox không lấy tin đang rao thật.
2. Sao chép `.env.example` thành `.env` tại thư mục gốc và điền khóa trên máy. Không gửi khóa trong chat, không đưa khóa vào HTML hoặc commit.
3. Chạy `npm start`, vào http://localhost:3000, bấm một thẻ. Tab **Tin rao eBay** tự tìm ứng viên Buy It Now trên eBay US.

Ảnh, giá, tiền tệ, người bán và URL cùng lấy từ một `itemSummary`. Không đổi đồng tiền, không cộng phí ship khác tiền tệ, không suy ra giá đã bán. Phí ship thiếu dữ liệu được ghi là chưa xác định. Giá được ghi nhận theo thời điểm, có thể thay đổi khi sang eBay.

Kết quả tìm kiếm tối đa 50 tin, cache 60 giây trong bộ nhớ. Số kết quả này không phải tổng nguồn cung trên eBay. Tiêu đề được kiểm tra tên, số thẻ, grade, set và một số biến thể; đây là kiểm tra ứng viên, không phải xác thực artwork hoặc chứng thư. Không tự cập nhật benchmark, giá nghiên cứu hay số lượng listing vào `cards.json`.

Khi thiếu khóa, lỗi mạng, hết hạn token hoặc eBay giới hạn truy vấn, giao diện báo lỗi rõ ràng. Token hết hạn được xin lại một lần. Nút quét giả cũ và bộ hẹn giờ cập nhật ngày đã bị loại bỏ.

Kiểm tra tự động: `npm test`. Các kiểm tra dùng dữ liệu giả lập API có chủ đích; không chứng minh kết nối Production thành công.

Tài liệu gốc: https://developer.ebay.com/develop/api/buy và https://developer.ebay.com/develop/guides/sell/authorization
