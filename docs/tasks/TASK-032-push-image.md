# TASK-032: Gửi notification kèm ảnh

- **Status:** done
- **Created:** 2026-11-09
- **Branch:** feat/push-image → `release/v3.1.0`

## Mục tiêu
Trang Notifications gửi push kèm một ảnh (vd. thông báo bản 3.1 có bài học). BE: iverb-supabase TASK-061 (#85).

## Phạm vi
**In scope**
- Ô "Image" (tuỳ chọn) dùng lại `ImageDrop` → upload `lesson-media` (nén 1600 px WebP), gửi `image_url` cho `admin-push`.
- Preview điện thoại, dialog xác nhận, lịch sử "Sent" hiện ảnh.

**Out of scope**
- iOS hiện ảnh (cần Notification Service Extension trong app, làm sau).

## Checklist
- [x] `services/pushes.ts` (`NewPush`, `image_url`)
- [x] `NotificationsPage` + test
- [x] `yarn build`, `yarn lint`, `yarn test` (119)

## File dự kiến thay đổi
- `src/services/pushes.ts`
- `src/features/notifications/NotificationsPage.tsx`, `NotificationsPage.test.tsx`

## Notes
- Cần deploy Dev bản backend TASK-061 (migration + function `admin-push`); trước đó function cũ bỏ qua ảnh.
- Ảnh tỉ lệ 2:1 (vd. 1024×512) hiển thị đẹp nhất trên Android. Chưa thử trên trình duyệt / máy thật.
