# Dữ liệu PSA graded từ nguồn công khai miễn phí

Chạy `npm start`, mở ứng dụng và bấm vào một lá thẻ. Không cần khóa eBay hay tài khoản PSA. Tab chi tiết gồm giá tham khảo theo điểm, population, số lượng/tỷ trọng từng điểm và link nguồn.

Nguồn đang dùng: **trang thẻ công khai của Scrydex**, không dùng API trả phí. Ví dụ: https://scrydex.com/pokemon/cards/snorlax/base2-11 . Dữ liệu structured card được nhúng công khai trong HTML, bao gồm variants, giá graded và population theo hãng. Crawler không truy cập dữ liệu đăng nhập, không vượt chặn HTTP 403 hoặc giới hạn truy cập.

- Giá hiển thị là `market` cho `company=PSA`, đúng grade và variant. Đây là **giá thị trường do Scrydex tổng hợp**, không phải PSA Price Guide hay PSA Estimate chính thức.
- Population lấy riêng `company=PSA`. Không cộng CGC/BGS vào PSA; giữ riêng điểm lẻ, qualifier Q và Auth.
- Tỷ trọng = số bản ghi ở điểm đó / population tổng nguồn báo cáo × 100. Population không phải tổng lượt gửi chấm; tỷ lệ không dự đoán xác suất đạt điểm của một thẻ mới.
- `fetchedAt` là thời điểm tải trang. `sourceUpdatedAt=null` vì nguồn không công bố ngày cập nhật dữ liệu. Không gọi đây là “định giá PSA mới nhất”.
- Nguồn tách phiên bản nào thì chỉ ghép đúng phiên bản đó. Edition, Reverse Holo, stamp và ngôn ngữ không bị gộp. Một số hồ sơ cũ ghi sai Non-Holo; tab hiển thị cảnh báo finish khi nguồn nhận diện Holofoil.
- `cards.json` cũ không bị sửa. Bảng và tab mới lấy từ `data/graded-research.json`, không dùng các giá, population hoặc chứng thư suy đoán trong hồ sơ cũ.

## Cập nhật

`npm run research:update` tìm trang nguồn cho Snorlax/Munchlax, tải từng trang và lưu bản nguồn JSON vào `research-cache`. Không cần khóa API. Crawler chạy tuần tự, có khoảng nghỉ và timeout, giữ lại dữ liệu đã có nếu nguồn lỗi. Sau khi đổi quy tắc nhận dạng, chạy `node remap-free-research.js` để ghép lại từ dữ liệu nguồn đã lưu mà không tải lại.

Nút **Cập nhật dữ liệu** trong tab làm mới đúng trang thẻ đã ghép, tối đa một lần mỗi giờ. Nếu nguồn lỗi, giữ bản trước và hiển thị rõ thời điểm, lỗi làm mới. Thẻ chưa ghép nguồn không được lấy dữ liệu của lá khác để lấp chỗ trống.

`coverage` trong JSON ghi số hồ sơ có nguồn, số có population và số có giá PSA 10. `errors` ghi phiên bản không đủ rõ để ghép; `unmatched` ghi các trang chưa ghép vào danh mục.

Kiểm tra: `npm test`. Có kiểm tra danh tính, edition/foil, population không hợp lệ, tỷ lệ, qualifier, điểm lẻ, Auth và việc tách riêng các hãng chấm.
