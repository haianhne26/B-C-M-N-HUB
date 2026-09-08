# Hướng Dẫn Cài Đặt MT5 Bridge EA — BẠC MÔN HUB

Cầu nối EA này cho phép đồng bộ số dư, tài sản, lệnh mở và lịch sử giao dịch từ MetaTrader 5 về ứng dụng Bạc Môn HUB theo thời gian thực.

---

## 🚀 Các bước cài đặt:

1. Mở phần mềm **MetaTrader 5 (MT5)** trên máy tính của bạn.
2. Vào menu **File > Open Data Folder** (Mở thư mục dữ liệu).
3. Truy cập vào thư mục: `MQL5\Experts\`.
4. Copy file **`BacMonHub_Bridge.mq5`** vào thư mục trên.
5. Trong MT5, mở menu **Tools > Options** (phím tắt `Ctrl + O`):
   - Chọn tab **Expert Advisors**.
   - Tích chọn: ✅ **Allow WebRequest for listed URL**.
   - Thêm URL: `http://localhost:4000` (hoặc domain server của bạn).
   - Nhấn **OK**.
6. Tại thanh Navigator của MT5 (phím tắt `Ctrl + N`):
   - Nhấp chuột phải vào **Expert Advisors** chọn **Refresh**.
   - Kéo file **`BacMonHub_Bridge`** thả vào bất kỳ biểu đồ nào (ví dụ Vàng XAUUSD).
7. Điền thông số đầu vào:
   - `BridgeToken`: `bmh_mt5_secure_bridge_token_2026`
   - `UserId`: ID tài khoản của bạn trong app Bạc Môn HUB.
8. Bấm **OK**. Dữ liệu tài khoản và lệnh giao dịch sẽ tự động truyền về Desktop Dashboard!
