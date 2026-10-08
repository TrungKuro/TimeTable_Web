# Tiêu đề dự án: Ứng dụng Quản lý Lịch Trình Cá Nhân (Notion-based Daily Tracker)

## 1. Bối cảnh & Mục tiêu
Bạn là một Senior/Lead Full-Stack Developer. Nhiệm vụ của bạn là xây dựng một ứng dụng web quản lý lịch trình và nhịp sinh học cá nhân. Ứng dụng này sẽ lấy dữ liệu từ cơ sở dữ liệu Notion (Read-only), hiển thị dưới dạng một trục thời gian thực (Real-time Timeline) và được thiết kế theo hướng có thể đóng gói thành ứng dụng di động gốc thông qua **Capacitor**. 

## 2. Ngăn xếp Công nghệ (Tech Stack) bắt buộc
- **Khung ứng dụng (Core Framework):** Next.js (App Router) + TypeScript.
- **Giao diện (UI):** Tailwind CSS + Lucide React (Icons).
- **Đóng gói di động (Mobile Wrapper):** Capacitor (với các plugin `@capacitor/local-notifications`, `@capacitor/filesystem`, `@capacitor/preferences`).
- **Quản lý trạng thái (State Management):** Zustand.
- **Quản lý dữ liệu & Bộ đệm (Data Fetching):** SWR hoặc TanStack Query.
- **Xử lý thời gian (Date/Time):** `date-fns` hoặc `dayjs` (Tuyệt đối không dùng hàm `Date` mặc định để tránh lỗi múi giờ).
- **Lưu trữ cục bộ (Local Storage):** IndexedDB (sử dụng thư viện `dexie` cho các ghi chú phát sinh).

## 3. Kiến trúc Hệ thống (System Architecture)
- **Giải quyết CORS:** API của Notion không cho phép gọi trực tiếp từ client. Do đó, phải sử dụng Next.js API Routes (môi trường máy chủ Node.js) làm Proxy. Client (Trình duyệt/Capacitor) sẽ gọi API nội bộ, API này dùng Token để gọi sang Notion, lấy dữ liệu và trả về Client.
- **Chiến lược Offline-first:** Khi mở ứng dụng, luôn render giao diện từ bộ nhớ đệm (Cache/Local Storage) trước. Khi người dùng bấm "Sync", hệ thống mới gọi Next.js API Route để cập nhật dữ liệu từ Notion.
- **Thông báo đẩy (Push Notifications):** Sử dụng `@capacitor/local-notifications`. Sau mỗi lần "Sync" thành công, hệ thống tính toán thời gian và lên lịch (schedule) thông báo gốc trên hệ điều hành trước 5 phút cho mỗi tác vụ.

## 4. Mô hình Dữ liệu (Notion Database Structure)
Ứng dụng sẽ đọc một bảng (Table) trên Notion. Dưới đây là định dạng các thuộc tính (Properties) cần xử lý:
1. `OrderIndex` (Number): Số thứ tự tác vụ.
2. `TimeBlock` (Text): Định dạng bắt buộc `HH:mm - HH:mm` theo hệ 24h (Ví dụ: `05:00 - 07:30`). Mọi tính toán thời lượng (Duration) hệ thống phải tự nội suy từ trường này.
3. `Action` (Title): Tên tác vụ.
4. `Checklist` (Text): Danh sách công việc nhỏ, mỗi dòng bắt đầu bằng dấu gạch ngang `-`. Mã nguồn phải tự phân tích chuỗi (parse) và chuyển thành các Checkbox tương tác được.
5. `Benefit` (Text - Tùy chọn): Lý do/Lợi ích.
6. `Instruction` (Text - Tùy chọn): Hướng dẫn chi tiết.

## 5. Yêu cầu Giao diện & Trải nghiệm (UI/UX)
**Phong cách:** Minimalism, mặc định Dark Mode (Nền `#121212`). Các thẻ tác vụ sử dụng Layout Card-based. Phông chữ: **Inter** cho văn bản, **JetBrains Mono** cho đồng hồ đếm ngược.

**5.1. Khu vực Sticky Header:**
- Giữ nguyên vị trí khi cuộn trang.
- **Current Date:** Hiển thị ngày (tùy chọn định dạng trong Settings).
- **Week Tracker:** Số tuần hiện tại so với tổng số tuần của năm (Ví dụ: `Week 41/52 (11 weeks left)`).
- **Timezone:** Lấy theo hệ thống (Ví dụ: `GMT+07:00` hoặc `Asia/Ho_Chi_Minh`).
- **Real-time Clock:** Đồng hồ kỹ thuật số.
- **Daily Progress Bar:** Thanh tiến độ thời gian trong ngày (12:00 AM - 11:59 PM).
- **Task Progress:** Đếm số công việc hoàn thành trên tổng số (Ví dụ: `1/10 (10%)`), đi kèm Circular Progress.

**5.2. Khu vực Trục Thời gian (Timeline) & Thẻ Tác vụ (Event Card):**
- Sử dụng CSS Absolute Positioning. Chiều cao không gian 24 giờ là 1440 phút (tỷ lệ 1 phút = 2px chiều cao).
- Tọa độ `top` của mỗi Event Card tính dựa trên giờ bắt đầu (`TimeBlock`). Chiều cao `height` của Card tính dựa trên thời lượng (Duration) nội suy.
- **Current Time Indicator (CTI):** Một thanh chỉ báo nằm ngang màu Accent di chuyển theo thời gian thực. CTI chạm vào thẻ nào, thẻ đó được Highlight.
- **Bên trong Event Card:**
  - Tên Action.
  - Bộ đếm ngược (Countdown) cho khoảng thời gian còn lại của Action.
  - Tỷ lệ phần trăm hoàn thành Checklist.
  - Nút "Instruction": Nhấn vào mở Modal/Popup ở giữa màn hình.
  - Nút "N" (Note): Mở Popup nhỏ nhập ghi chú phát sinh. Dữ liệu này lưu tạm vào IndexedDB.

## 6. Luồng Nghiệp vụ & Cài đặt (Settings & Business Logic)
Xây dựng một trang Settings chứa các cấu hình lưu vào Local Storage:
- **Notion Token:** Có nút kiểm tra Token (Gửi request thử nghiệm đến Notion API để xác thực).
- **Định dạng hiển thị thời lượng (Duration):** 3 tùy chọn: `2h 30m`, `150'`, hoặc `02:30`.
- **Đồng hồ:** 12h hoặc 24h.
- **Chủ đề (Theme):** Dark / Light / System.
- **Màu nhấn (Accent Color):** Cung cấp các lựa chọn Neon Green, Electric Blue, Sunset Orange, Cyberpunk Purple.
- **Ngày bắt đầu tuần:** Thứ 2 (Monday) hoặc Chủ Nhật (Sunday).
- **Cấu hình Telegram:** Chứa Token Bot và Chat ID.
- **Nút "Sync":** Đồng bộ dữ liệu thủ công từ Notion.
- **Âm thanh thông báo (Alert):** Chọn tiếng chuông cho thông báo.

## 7. Tích hợp Báo cáo Telegram Cuối Ngày
Hệ thống (thông qua Capacitor Background Task hoặc cơ chế kiểm tra thời gian lúc khởi động) sẽ kích hoạt vào lúc 11:59 PM mỗi ngày để gửi báo cáo.
- **Nguồn dữ liệu:** Lấy tiến độ từ Zustand và Ghi chú (Notes) từ IndexedDB.
- **Định dạng gửi:** Thuần văn bản (Plain text), sử dụng `parse_mode="MarkdownV2"` qua API Telegram.
- **Cấu trúc dữ liệu báo cáo mẫu:**
  ```text
  📅 TỔNG KẾT NGÀY: DD/MM/YYYY
  ━━━━━━━━━━━━━━━━━━━━
  🎯 TIẾN ĐỘ CHUNG:
  - Hoàn thành: X/Y Action (Z%)
  - Trạng thái: Tốt 🟢 

  📝 GHI CHÚ / PHÁT SINH (Task Notes):
  1. [HH:mm] Tên Tác Vụ: 
     👉 "Nội dung ghi chú trong IndexedDB"

  ⚠️ CHƯA HOÀN THÀNH:
  - [HH:mm] Tên Tác vụ...

  💡 TỰ ĐÁNH GIÁ: (Lời khuyên tự động dựa trên số liệu)

---

# Cấu trúc Thư mục Đề xuất

```
src/
├── app/               # Next.js App Router (Giao diện chính, api/notion, api/telegram)
├── components/        # Thư mục chứa UI (Card, Timeline, Header, Modal)
├── hooks/             # Custom Hooks (useTimeline, useCountdown)
├── lib/               # Tiện ích (date-fns, cấu hình dexie.js)
├── services/          # Logic gọi API nội bộ, xử lý logic gửi Telegram
├── stores/            # Zustand state (Lưu settings, trạng thái checkbox)
└── types/             # TypeScript Interfaces (Định nghĩa Model từ Notion)
```

---

# Yêu cầu triển khai (Dành cho AI)
Hãy làm theo từng bước (Step-by-step). Không viết toàn bộ mã nguồn vào một file. Hãy bắt đầu bằng việc thiết lập cấu trúc nền tảng (Next.js, Tailwind, Zustand, SWR), sau đó xây dựng Layout UI bằng dữ liệu giả (Mock Data) để kiểm tra CSS Absolute Positioning, rồi mới tiến hành tích hợp Notion API Route và phần Capacitor / Telegram ở cuối cùng.