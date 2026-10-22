# 🐻 Pokémon TCG — Snorlax & Munchlax PSA Market Atlas (Next.js App)

> **Nền tảng phân tích đầu tư, theo dõi định giá thị trường và tỷ trọng dân số (Population Report) cho dòng thẻ bài Snorlax & Munchlax quy chuẩn PSA (PSA 7 – 10), phát triển hoàn toàn trên nền tảng Next.js App Router, React 19 và TypeScript.**

---

## 🌟 ĐẶC ĐIỂM NỔI BẬT

- **Kiến trúc Next.js App Router hiện đại**:
  - Tải trang tức thì với Server-side Generation (SSG) kết hợp React Client Hydration.
  - Tự động tối ưu hóa tài nguyên, không độ trễ, cuộn và lọc mượt mà.
  - Tích hợp API Routes nội bộ (`/api/catalog`, `/api/health`, `/api/fanatics-sync`).
- **Quy chuẩn Duy nhất PSA (PSA ONLY)**:
  - 198 phiên bản thẻ Snorlax & Munchlax được thẩm định chuẩn Professional Sports Authenticator (PSA 10 Gem Mint, PSA 9, PSA 8, PSA 7).
- **Dual Marketplace Integration (Liên kết song song 2 sàn)**:
  - Nút **`[⚡ Fanatics ↗]`** và **`[🛒 eBay ↗]`** trực tiếp trên từng thẻ và trong modal chi tiết.
  - Khối đối chiếu giá trực tiếp Mua Ngay giữa kho Fanatics Collect Vault và sàn eBay Buy It Now.
- **Bộ lọc & Sắp xếp đa tiêu chí (Nâng cấp PriceCharting)**:
  - 📈 **Giá PriceCharting: Cao → Thấp** (Đắt nhất trước) & 📉 **Thấp → Cao** (Rẻ nhất trước).
  - 💎 **Giá sàn Buy Now: Cao → Thấp** & 🏷️ **Thấp → Cao**.
  - 🔥 **Săn Deal: Rẻ hơn PC nhiều nhất**.
  - 🏆 **Điểm tiềm năng (S/A/B/C/D/F) & 👑 PSA 10 ít nhất (Pop hiếm)**.
  - Chuyển đổi tiền tệ tức thì giữa **VNĐ (₫)** và **USD ($)**.
- **Trải nghiệm 3D Slab & Phân tích chuyên sâu**:
  - Hiệu ứng lắc 3D tương tác theo chuyển động chuột, phản quang Holo Glare.
  - Chế độ tách phông AI (AI Cutout) và Zoom phóng to thẻ bài.
  - Ma trận Grading Arbitrage và bảng phân bổ PSA Population Report (Grade 1 - 10).

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### 1. Trên Windows (1-Click)
Nhấp đúp chuột vào file:
```cmd
CHAY_WINDOWS.bat
```
Script sẽ tự động kiểm tra thư viện và khởi chạy máy chủ Next.js tại `http://localhost:4173`.

### 2. Dùng lệnh Terminal / Console
```bash
# Cài đặt thư viện (chỉ cần chạy lần đầu)
npm install

# Chạy chế độ phát triển (Dev Mode)
npm run dev

# Hoặc Build & Chạy bản Production tối ưu cao nhất
npm run build
npm start
```
- Truy cập Localhost: **`http://localhost:4173`**
- Truy cập qua mạng nội bộ LAN: **`http://<IP_LAN>:4173`** (ví dụ: `http://192.168.245.101:4173`)

---

## 🛠️ CẤU TRÚC THƯ MỤC DỰ ÁN

```
pokemon-tcg/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root Layout, Google Fonts, Metadata
│   ├── page.tsx                # Trang chủ nạp dữ liệu Server Component
│   ├── globals.css             # Hệ thống Style Supabase White Theme
│   └── api/                    # Next.js Serverless API Routes
│       ├── catalog/route.ts    # API cung cấp 198 thẻ bài PSA
│       └── health/route.ts     # API kiểm tra tình trạng máy chủ
├── components/                 # Các linh kiện giao diện React
│   ├── Dashboard.tsx           # Điều phối toàn bộ trạng thái Dashboard
│   ├── Sidebar.tsx             # Thanh điều hướng phân hạng Tier S/A/B/C/D/F
│   ├── Header.tsx              # Thanh tiêu đề Terminal & các nút xuất/nhập
│   ├── Hero.tsx                # Khu vực giới thiệu & tiêu chuẩn đầu tư
│   ├── StatGrid.tsx            # Thẻ thống kê danh mục, giá sàn, deal hời
│   ├── Toolbar.tsx             # Thanh tìm kiếm, lọc character/grade, sắp xếp
│   ├── CardDeck.tsx            # Bố cục lưới thẻ bài (Grid View)
│   ├── CardItem.tsx            # Thẻ đơn lẻ với hiệu ứng 3D Holo
│   ├── CardTable.tsx           # Bảng xếp hạng chi tiết (Table View)
│   ├── DrawerDossier.tsx       # Hồ sơ phân tích đối chiếu 2 sàn & Arbitrage
│   └── LightboxModal.tsx       # Cửa sổ phóng to 3D & tách phông AI
├── data/                       # Kho dữ liệu thẻ bài phân cấp
│   └── catalog/catalog.json    # Danh mục chuẩn 198 thẻ PSA
├── types/                      # Định nghĩa kiểu dữ liệu TypeScript
│   └── card.ts
├── lib/                        # Thư viện tiện ích & hằng số tính toán
│   ├── constants.ts
│   └── utils.ts
├── CHAY_WINDOWS.bat            # Script khởi chạy Windows 1-click
├── chay_mac_linux.sh           # Script khởi chạy macOS/Linux
└── package.json                # Cấu hình dependency Next.js & React 19
```
