# TASK-030: App preview luôn hiện ở tab Daily questions

- **Status:** done
- **Created:** 2026-11-08
- **Branch:** feat/daily-preview-column → `release/v3.1.0`

## Mục tiêu
Tab "Daily questions · n/7" của week editor: App preview bị xuống dòng (nằm dưới form) và chỉ hiện khi đang sửa. Design (Weekly Lessons §4.2): 3 cột trên một hàng — danh sách 7 ngày (260px) | câu hỏi (1 1 440px) | điện thoại "App preview · after answering" (320px, sticky), hiện mỗi khi ngày có câu hỏi.

## Phạm vi
**In scope**
- `DailyPhonePreview`: điện thoại 320×650, card "Today's question" ở trạng thái đã trả lời (đáp án đúng màu xanh, giải thích).
- Xem câu hỏi: preview từ câu hỏi đã lưu (`fromQuestion`).
- Viết / sửa: form nhúng nhận `preview`, card form và preview thành cột 2 và 3 của hàng (không còn lồng trong cột giữa).

**Out of scope**
- Màn Add/Edit question độc lập: giữ App preview cũ.
- BE: không cần.

## Checklist
- [x] DailyPhonePreview
- [x] Bố cục 3 cột (xem + sửa)
- [x] Test
- [x] yarn build / lint / test

## File dự kiến thay đổi
- `src/features/week-editor/DailyPhonePreview.tsx` (mới)
- `src/features/week-editor/DailyQuestionsTab.tsx`, `DailyQuestionsTab.test.tsx`
- `src/features/question-form/QuestionFormPage.tsx`

## Notes
- Màn hình hẹp (< ~1100px vùng nội dung) cột preview vẫn xuống dòng, giống design (flex-wrap).
