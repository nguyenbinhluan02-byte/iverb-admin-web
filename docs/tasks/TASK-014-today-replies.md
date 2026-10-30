# TASK-014: Today — xem / xoá reply dưới user explanation

- **Status:** done
- **Created:** 2026-10-30
- **Branch:** feat/today-replies
- **BE:** `iverb-supabase` TASK-027

## Mục tiêu
Trang Today hiện reply của user dưới mỗi explanation (design: replies nested) và xoá được reply. Quyết định với user (2026-10-30): **không** làm admin trả lời reply (không có nút Reply / ô nhập, không có chip Admin).

## Phạm vi
**In scope**
- Explanation có reply: nút "View N replies" / "Hide replies"; mở ra thì tải `admin_replies_page` (cũ nhất trước, 20 / trang, Load more).
- Reply: avatar 28, bubble `bg-page`, tên, thời gian, Delete → modal xác nhận → `admin_delete_reply`.
- Test.

**Out of scope**
- Admin trả lời reply, report / Dismiss, filter All / Replied / Reported, thống kê "N replied".

## Checklist
- [x] `sync:types`, service (`useReplies`, `useDeleteReply`).
- [x] UI reply + xoá.
- [x] Test.
- [x] `yarn build`, `yarn lint`, `yarn test`.

## File dự kiến thay đổi
- `src/services/today.ts`, `src/services/database.types.ts`
- `src/features/today/TodayPage.tsx`, `TodayPage.test.tsx`
- `docs/tasks/README.md`

## Notes
- Reply chỉ tải khi bấm "View N replies" (`admin_replies_page`, 20 / trang, "Load more replies (N left)"). Xoá: modal "Delete this reply?" → `admin_delete_reply`, làm mới list reply + `replies_count`.
- Xoá reply là xoá hẳn (BE TASK-027), khác xoá explanation (ẩn).
- `yarn lint`, `yarn build` ok; `yarn test` 52/53. Test lỗi `SchedulePage > lists the next 14 days with legend counts` lỗi sẵn trên `main` (phụ thuộc ngày chạy), không liên quan.
- Chưa xem trên trình duyệt với dữ liệu thật.
