# BẠC MÔN HUB — Landing Page

> **Trading Tools. Simplified.**  
> Landing Page cao cấp, hiện đại, phong cách Fintech & Trading Terminal dành cho sản phẩm BẠC MÔN HUB.

---

## 🚀 Tính năng nổi bật

- **Giao diện Modern Fintech**: Thiết kế tông màu Purple (`#7C3AED`) kết hợp Dark Card & Neon Accent, mang lại cảm giác công nghệ cao cấp và đáng tin cậy.
- **Trading Mockup Terminal sống động**: Mô phỏng bảng giá thời gian thực (Market Data), Biểu đồ nến & xu hướng (Chart), cùng Panel kiểm soát rủi ro (Risk Panel).
- **100% Cấu hình qua File Data**: Toàn bộ tiêu đề, mô tả, danh sách tính năng, link tải file, câu hỏi FAQ và mạng xã hội được quản lý tập trung trong file [`src/config/site.ts`](file:///d:/Downloads/PROJECT%20BACMONDAO/src/config/site.ts).
- **Responsive 100%**: Hiển thị hoàn hảo trên Desktop, Tablet và Mobile với Menu điều hướng tiện lợi.
- **Tự động triển khai GitHub Pages**: Tích hợp sẵn GitHub Actions Workflow (`.github/workflows/deploy.yml`) — tự động build và xuất bản website khi push code lên GitHub.

---

## 🛠️ Hướng dẫn tùy chỉnh nội dung

Bạn **không cần sửa code giao diện**. Chỉ cần mở file:
👉 **[`src/config/site.ts`](file:///d:/Downloads/PROJECT%20BACMONDAO/src/config/site.ts)**

Tại đây bạn có thể thay đổi:
- `siteName`: Tên thương hiệu.
- `downloadUrl`: Đường link tải file cài đặt (ví dụ link Google Drive, OneDrive hoặc file `.exe` trực tiếp).
- `features`: Thêm, bớt hoặc sửa nội dung 6 thẻ tính năng.
- `faqList`: Chỉnh sửa câu hỏi & câu trả lời thường gặp.
- `socialLinks`: Điền link Telegram, Facebook, TikTok (để trống sẽ tự động ẩn).

---

## 💻 Chạy dự án ở máy cục bộ (Local)

1. Cài đặt thư viện:
```bash
npm install
```

2. Khởi chạy máy chủ phát triển (Dev Server):
```bash
npm run dev
```
Truy cập: `http://localhost:5173/`

3. Đóng gói bản phát hành (Production Build):
```bash
npm run build
```

---

## 🌐 Triển khai lên GitHub Pages

1. Đẩy mã nguồn lên repository GitHub của bạn:
```bash
git init
git add .
git commit -m "feat: Khoi tao Landing Page BAC MON HUB"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git push -u origin main
```

2. Bật GitHub Pages trên GitHub:
- Vào tab **Settings** của Repository trên GitHub.
- Chọn mục **Pages** ở cột bên trái.
- Tại phần **Source**, chọn **GitHub Actions**.
- Workflow sẽ tự động chạy và cấp cho bạn link website online miễn phí!

---
© 2026 BẠC MÔN HUB. All rights reserved.
