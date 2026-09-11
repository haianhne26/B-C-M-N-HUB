# Handoff Document - Bạc Môn Hub Landing Page Builder
*Tài liệu bàn giao cho Codex*

## 1. Tổng quan dự án (Project Overview)
Dự án **Bạc Môn Hub** là một nền tảng quản lý IB (Introducing Broker) và tạo Landing Page động. 
- **Frontend (Web):** Xây dựng bằng React + Vite. Nằm trong thư mục gốc. Được host trên Github Pages (`https://haianhne26.github.io/B-C-M-N-HUB/`). Render các sections động dựa trên JSON payload từ Backend.
- **Backend (API):** Chạy Node.js/Express + Prisma (PostgreSQL). Được host trên Onrender (`https://bacmonhub-backend.onrender.com/api`).
- **Desktop App (Builder):** Nằm trong thư mục `/desktop/`. Dùng Electron + React + Vite. Dùng để IB tạo và cấu hình Landing Page (Theme, Hero, Countdown, Mentor, v.v.).

## 2. Trạng thái hiện tại & Những gì đã làm
- Đã nâng cấp toàn bộ UI của Frontend sang chuẩn **Aurora Glass** (Dark mode, Neon Glow, Glassmorphism).
- Đã đập đi xây lại màn hình `LandingBuilderView.tsx` trong Desktop App: Thêm tất cả các trường cho IB nhập tay (như Nút CTA, Nhãn dán, Dải chữ chạy Ticker, Thông số Mentor, v.v.).
- Đã nối cáp các Components Frontend (`HeroSection`, `CountdownSection`, `MentorProfileSection`, v.v.) để nhận `props` động từ Database.

---

## 3. Các vấn đề & Yêu cầu chưa xử lý triệt để (Cần Codex hỗ trợ)

Mặc dù đã cố gắng sửa, nhưng người dùng báo cáo giao diện trên Web thực tế **vẫn gặp lỗi** hoặc **không ăn thay đổi**. Codex cần kiểm tra và fix tận gốc các lỗi sau:

### 🔴 Lỗi 1: Layout Hero & Lịch phát sóng chưa chuẩn BrokersHub
- **Tình trạng:** Khách hàng muốn khu vực "LỊCH PHÁT SÓNG" (Countdown + Thông tin chỗ ngồi) phải nằm song song (ngay bên dưới) tiêu đề "Trader nhập môn" ở khu vực màn hình đầu tiên. 
- **Vấn đề:** Hiện tại `HeroSection.tsx` và `CountdownSection.tsx` đang tách biệt. Code vừa mới được sửa thành layout căn giữa (centered) nhưng có thể chưa sát với bản thiết kế hoặc bị lệch CSS.
- **Yêu cầu cho Codex:** Hãy thiết kế lại/tái cấu trúc CSS ở khu vực Hero và Countdown sao cho nó tích hợp mượt mà, đúng chuẩn một khối (như ảnh reference của BrokersHub).

### 🔴 Lỗi 2: Không đổi được màu chủ đạo (Theme Color)
- **Tình trạng:** Khách hàng chọn màu chủ đạo trong Desktop App nhưng khi ra Landing Page thì màu không đổi (vẫn giữ màu Cam mặc định).
- **Phân tích nguyên nhân:** 
  - `themeConfig` có thể đang bị parse sai ở `ib.controller.ts` (double stringify) hoặc Frontend `DynamicLandingPage.tsx` đọc biến `data.themeConfig?.primaryColor` ra `undefined`.
  - Nếu đổi được `--ink`, thì các biến gradient/glow như `--ink-2` và `--glow` (chứa opacity) không được overwrite đúng cách khiến màu bị pha trộn (VD: Xanh pha Cam).
- **Yêu cầu cho Codex:** Chuẩn hóa flow truyền tải biến `primaryColor` từ form Desktop -> Backend DB -> Frontend. Viết lại hàm bind CSS style trong `DynamicLandingPage` để tính toán đồng bộ cả hệ màu glow và gradient.

### 🔴 Lỗi 3: API Đếm Lead (Slots Booked) hiện ảo 667
- **Tình trạng:** Tổng số đăng ký hiển thị "Đã đăng ký: 667" trong khi Database chưa có lead nào hoặc do chưa lấy được số thực tế.
- **Phân tích nguyên nhân:** Trong `DynamicLandingPage.tsx`, khi gọi API `/stats/total-leads`, nếu API trả về `{ total: 0 }`, giá trị `0` là falsy dẫn tới fallback về state khởi tạo là `667`.
- **Yêu cầu cho Codex:** Cập nhật lại logic check API response. Phải hiện đúng số lượng thực tế từ DB, hoặc fix lại cách truyền prop `slotsBooked` vào `CountdownSection.tsx`.

### 🔴 Lỗi 4: Logo bị lỗi/mờ
- **Tình trạng:** Logo không hiển thị được trên Github Pages.
- **Phân tích nguyên nhân:** Đang gọi ảnh `<img src="/logo.png" />`. Do repo deploy lên đường dẫn con `/B-C-M-N-HUB/`, việc dùng absolute path gốc sẽ gây 404. 
- **Yêu cầu cho Codex:** Import Logo bằng asset của Vite (e.g., `import logo from '../../public/logo.png'`) hoặc dùng `import.meta.env.BASE_URL` để Github Pages trỏ đúng địa chỉ tệp.

### 🔴 Khâu Deployment Cache
- **Yêu cầu cho Codex:** Sau khi sửa, cần đảm bảo chạy `npm run build && npx gh-pages -d dist` (thông qua powershell là `npm run build; npx gh-pages -d dist`) để đẩy chính xác bản vá lên Github Pages và check lại xem Github Actions đã build xong chưa. Chú ý tư vấn khách xóa cache triệt để.
