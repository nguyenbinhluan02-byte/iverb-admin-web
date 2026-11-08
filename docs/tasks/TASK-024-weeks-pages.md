# TASK-024: Sidebar v3, This week, Weeks

- **Status:** done
- **Created:** 2026-11-08
- **Branch:** feat/weeks-pages → `release/v3.1.0`
- **Backend:** iverb-supabase TASK-052, TASK-053 (`admin_week_dashboard`, `admin_lesson_weeks`, `admin_weeks_needing_work`)

## Mục tiêu
Design `design/Quiz Admin v3 - changes since v1.md` §1–3 (`Weekly Lessons.dc.html`): mô hình mỗi tuần 1 bài học.

## Phạm vi
**In scope**
- Sidebar: phụ đề "Weekly lessons"; **This week** (`/week`) + **Weeks** (`/weeks`, badge cam = tuần sắp tới chưa sẵn sàng) sau Today, có vạch ngăn; bỏ Schedule (`/schedule` → `/weeks`); mặc định `/week`.
- **This week**: Live · Day N of 7, khoảng ngày, bài học, Edit this week; 4 thẻ số liệu; Lesson drop-off; Daily questions (đúng / tổng, % < 60 màu cam); Coming up (3 tuần tới).
- **Weeks**: bảng tuần (khoảng + tương đối, loại bài + tên, nội dung, 7 chấm câu hỏi, trạng thái, hành động), dòng tuần live nền `#FFFAF6`, Add week (thêm 1 tuần trống ở cuối danh sách).
- Add/Edit question (màn riêng): bỏ khối "Publish date" (§1.3). Câu mới không có ngày → "Save to library"; `?date=` (từ week editor) → "Schedule".

**Out of scope**
- Week editor `/weeks/:weekStart` (TASK-025/026/027) — tạm ComingSoon.

## Checklist
- [x] `services/weeks.ts`, `lib/weeks.ts` (+ test)
- [x] `ThisWeekPage`, `WeeksPage`, `WeekStatusBadge`
- [x] Sidebar, routes
- [x] Bỏ Publish date + sửa test form
- [x] `yarn build`, `yarn lint`, `yarn test`

## File dự kiến thay đổi
- `src/services/weeks.ts`, `src/lib/weeks.ts`, `src/lib/weeks.test.ts`
- `src/features/weeks/*`
- `src/components/Sidebar.tsx`, `src/App.tsx`
- `src/features/question-form/QuestionFormPage.tsx` (+ test)
- `src/services/database.types.ts`, `design/*`

## Notes
- Danh sách Weeks: từ 2 tuần trước tới tuần cuối đã có bài / câu hỏi (ít nhất tuần sau) + số tuần thêm bằng "Add week" (chỉ trên trình duyệt tới khi lưu).
- Chưa chạy thử trên trình duyệt với dữ liệu Dev.
