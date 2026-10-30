# TASK-017: Today — xử lý report explanation / reply

- **Status:** done
- **Created:** 2026-10-30
- **Branch:** feat/today-reports
- **BE:** `iverb-supabase` TASK-029

## Mục tiêu
App mobile đã cho user report explanation và reply (BE TASK-029). Trang Today cần lọc ra bài bị report, hiện số lần / lý do, cho admin Dismiss (bỏ report, hiện lại) hoặc Delete.

## Phạm vi
**In scope**
- Card User explanations: filter **All / Reported** có số đếm (All = `explanations_count`, Reported = `reported_count`), lọc ở server (`p_filter`), mỗi filter một query key.
- Explanation bị report: hộp đỏ "Reported N times · {lý do}" + Dismiss / Delete (theo design).
- Reply bị report: hộp đỏ trong bubble + Dismiss (Delete reply có sẵn).
- Nhãn nhỏ "Hidden" khi `moderation_status = 'hidden'` (tự ẩn khi đủ 3 report).
- Explanation có reply bị report: ghi chú "N reported replies".
- Sidebar: badge Today = số explanation bị report (pill cam).
- Dismiss → `admin_dismiss_reports`, toast "Reports dismissed", làm mới today / explanations / replies.
- Test.

**Out of scope**
- Filter "Replied" của design (admin không trả lời, chốt 2026-10-30), admin trả lời, report từ web, thay đổi backend.

## Checklist
- [x] `sync:types`, service (`p_filter`, `reports`, `reported_count`, `useDismissReports`).
- [x] UI filter All / Reported.
- [x] Hộp report explanation + reply, Dismiss, nhãn Hidden, ghi chú reply bị report.
- [x] Badge sidebar Today.
- [x] Test.
- [x] `yarn build`, `yarn lint`, `yarn test`.

## File dự kiến thay đổi
- `src/services/today.ts`, `src/services/database.types.ts`
- `src/features/today/TodayPage.tsx`, `TodayPage.test.tsx`, `todayModel.ts`, `todayModel.test.ts`
- `src/components/Sidebar.tsx`
- `docs/tasks/README.md`

## Notes
- Filter All / Reported làm riêng trong Today (có icon như design, nền `bg-page`), không dùng `Segmented` (không có icon, nền `bg-track`). Bỏ "Replied" theo quyết định không làm admin trả lời.
- Nhãn lý do (`REPORT_REASONS` trong `todayModel.ts`) giống bottom sheet report trong app. `top_reason` null → chỉ "Reported N times".
- Dismiss không có modal xác nhận (như design); Delete trong hộp report dùng lại modal xoá có sẵn.
- "Hidden" (icon `EyeOff`, `bg-page` / `text-muted`) và "N reported replies" (`text-red-text`) không có trong design, thêm cho rõ trạng thái.
- Xoá reply / xoá explanation / Dismiss đều invalidate cả nhánh query `['today']` (reported_count, reported_replies_count, list theo filter).
- Badge Today trong sidebar lấy `reported_count` từ `useToday` (cùng query với trang Today, poll 60s); ẩn khi = 0.
- `yarn lint`, `yarn build`, `yarn test` (59/59) ok.
- Chưa xem trên trình duyệt với dữ liệu thật (report thật, auto-hide, badge).
