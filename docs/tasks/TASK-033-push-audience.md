# TASK-033: Chọn người nhận notification

- **Status:** done
- **Created:** 2026-11-09
- **Branch:** feat/push-audience → `release/v3.1.0`

## Mục tiêu
Trang Notifications chọn ai nhận push (vd. chỉ máy đang chạy 3.0 để báo có bản 3.1). BE: iverb-supabase TASK-062 (#86).

Quyết định với user (2026-11-09): "All users" (topic, cả guest) vẫn là mặc định; "Filter" / "Specific users" gửi theo token → chỉ user đã đăng nhập, **bỏ qua** công tắc "News & announcements".

## Phạm vi
**In scope**
- "Send to": All users | Filter (phiên bản app kèm số máy, Android / iOS, gói Premium / Trial / Free / Expired) | Specific users (tìm theo tên / email qua `admin_list_users`).
- Số người / máy nhận (`admin_push_audience`), nút "Send to N devices", dialog xác nhận nêu bộ lọc.
- Lịch sử: gửi tới ai, số máy nhận / lỗi.

**Out of scope**
- Lọc theo quốc gia / ngôn ngữ; guest.

## Checklist
- [x] `services/pushes.ts` (`Audience`, `usePushAudience`), `database.types.ts` thêm tay `admin_push_audience`
- [x] `AudiencePicker`, `NotificationsPage`, `notificationsModel` + test
- [x] `yarn build`, `yarn lint`, `yarn test` (125)

## Notes
- Sau khi deploy Dev bản backend #85 + #86: chạy `yarn sync:types` để thay entry thêm tay. Chưa thử trên trình duyệt.
