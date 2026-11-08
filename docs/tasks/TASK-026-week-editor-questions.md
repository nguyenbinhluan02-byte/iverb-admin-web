# TASK-026: Week editor — tab Daily questions

- **Status:** done
- **Created:** 2026-11-08
- **Branch:** feat/week-editor-questions → `release/v3.1.0`
- **Backend:** `admin_save_question`, `admin_schedule_question` (có sẵn), `admin_set_question_card` (TASK-053)

## Mục tiêu
Design `design/Quiz Admin v3 - changes since v1.md` §4.2: câu hỏi 7 ngày của tuần, soạn ngay trong week editor.

## Phạm vi
**In scope**
- Trái: 7 ngày (thứ, ngày, câu hỏi, loại, chấm xanh khi có câu).
- Ngày trống (tương lai): "No question for {day}" + **Write question** (form v1 nhúng trong tab, ngày = ngày đang chọn) / **Choose from library** (dialog v1, "Edit first" quay về tab).
- Ngày có câu: loại, nội dung + đáp án (`QuestionBody`), explanation, tác giả; **Edit** (form nhúng; câu đã chiếu thì không sửa); **Remove question** (ngày tương lai, chưa ai trả lời → về library, không xoá); **Tests lesson card** (chọn thẻ của bài đã lưu → `admin_set_question_card`).
- Tuần đã qua: chỉ xem.
- Form câu hỏi: chế độ nhúng (`EmbeddedQuestionForm`: không tiêu đề trang, xong / huỷ → về tab).

**Out of scope**
- Thống kê đúng / sai theo thẻ (dashboard có theo ngày).

## Checklist
- [x] `DailyQuestionsTab` (+ test)
- [x] `EmbeddedQuestionForm`, `PickFromLibraryDialog` (`from`)
- [x] `useSetQuestionCard`
- [x] `yarn build`, `yarn lint`, `yarn test`

## File dự kiến thay đổi
- `src/features/week-editor/DailyQuestionsTab.tsx` (+ test), `WeekEditorPage.tsx`
- `src/features/question-form/QuestionFormPage.tsx`
- `src/features/schedule/PickFromLibraryDialog.tsx`
- `src/services/lessons.ts`

## Notes
- Hôm nay (tuần live) không thêm câu mới được (backend chỉ cho từ ngày mai); câu của hôm nay vẫn sửa được như v1.
- Chưa chạy thử trên trình duyệt với dữ liệu Dev.
