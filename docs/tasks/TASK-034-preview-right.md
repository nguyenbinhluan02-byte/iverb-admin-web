# TASK-034: Preview notification sang cột phải

- **Status:** done
- **Created:** 2026-11-09
- **Branch:** feat/preview-right → `release/v3.1.0`

## Mục tiêu
Trang Notifications: đưa khung Preview ra cột phải, nằm trên lịch sử "Sent" (user yêu cầu), để form bên trái gọn và vừa soạn vừa xem.

## Phạm vi
**In scope**
- Card "Preview" riêng ở cột phải, trên card "Sent". Màn hẹp (1 cột): Preview nằm dưới form.

**Out of scope**
- Backend (không cần).

## Checklist
- [x] `NotificationsPage.tsx`
- [x] `yarn build`, `yarn lint`, `yarn test`

## File dự kiến thay đổi
- `src/features/notifications/NotificationsPage.tsx`

## Notes
