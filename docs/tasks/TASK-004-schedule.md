# TASK-004: Schedule, Choose from library, Reuse calendar

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** feat/schedule
- **BE:** `iverb-supabase` TASK-018 (`admin_schedule_question`), done

## Mục tiêu
Màn Schedule theo design và hai modal xếp câu có sẵn vào ngày trống.

## Phạm vi
**In scope**
- Schedule: `Next 14 days | Month` (lưu trên URL `?view=month&m=`), month stepper, thẻ coverage (legend chỉ đếm ngày tương lai), danh sách ngày: View / Edit / Add question / From library; ngày đã qua mờ và chỉ xem; hôm nay nền cam nhạt.
- Modal **Choose from library**: tìm, lọc Status / Added by / Type / Sort ("Shown longest ago" mặc định), câu đã chiếu xếp trước; Edit first / Schedule.
- Modal **Reuse calendar**: lịch tháng Mon-first, không lùi trước tháng hiện tại, chỉ chọn ngày trống; mở từ Library (Reuse) và View → Reuse.
- Badge sidebar Schedule = số ngày trống trong 14 ngày tới.
- Form: nhận `?date=` khi sửa (Edit first một bản nháp), lưu / Cancel quay về trang đã mở form (mặc định Schedule).
- Component dùng chung: `Segmented`, `filterOptions`.

**Out of scope**
- Câu user gửi (pending) trong picker: TASK-006.

## Checklist
- [x] BE: TASK-018.
- [x] `scheduleModel`, `pickModel`, `reuseCalendar` + test.
- [x] `SchedulePage`, `PickFromLibraryDialog`, `ReuseDialog` + test render.
- [x] Library Reuse bật, form quay về đúng trang.
- [x] `yarn build`, `yarn lint`, `yarn test` (47 test).
- [ ] So giao diện với design — user tự kiểm tra sau.

## File dự kiến thay đổi
- `src/features/schedule/*`, `src/features/library/{LibraryPage,filterOptions}.*`, `src/components/{Segmented,Sidebar}.tsx`
- `src/features/question-form/QuestionFormPage.tsx`, `src/services/questions.ts`, `src/lib/errors.ts`, `src/App.tsx`

## Notes
- Pool của picker: câu đã chiếu (copy), nháp và câu chưa xếp lịch (chuyển). Không gồm câu live / câu đã xếp ngày khác (design chỉ cho nháp "will move").
- Edit first: câu đã chiếu → form tạo bản copy (`/questions/new?from=&date=`); nháp / chưa xếp → form sửa câu đó với ngày mới.
- Nháp chưa có đáp án khi xếp vào ngày vẫn là nháp → toast "Draft moved for …".
