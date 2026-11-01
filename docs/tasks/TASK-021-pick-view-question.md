# TASK-021: Nút View trong modal "Choose from library"

- **Status:** done
- **Created:** 2026-11-01
- **Branch:** feat/pick-view-question

## Mục tiêu
Trong Schedule → From library, admin chỉ thấy prompt rút gọn nên khó chọn. Thêm nút View trên mỗi dòng để mở modal xem đủ câu hỏi (lựa chọn, đáp án, giải thích) trước khi chọn.

## Phạm vi
**In scope**
- Nút View (icon mắt) bên phải mỗi dòng trong picker.
- Mở `QuestionViewDialog` chồng lên picker; footer có **Choose** (chọn câu đó trong picker rồi đóng View).

**Out of scope**
- History / Edit / Reuse trong View mở từ picker (đã có Edit first ở picker).
- BE: không cần.

## Checklist
- [x] `QuestionViewDialog` nhận `actions` để thay footer.
- [x] Picker: nút View + Choose.
- [x] Test.
- [x] `yarn build`, `yarn lint`, `yarn test`.

## File dự kiến thay đổi
- `src/features/library/QuestionViewDialog.tsx`
- `src/features/schedule/PickFromLibraryDialog.tsx`
- `src/features/schedule/SchedulePage.test.tsx`

## Notes
Không cần BE. View mở từ picker chỉ có nút Choose (chọn câu trong picker, đóng View); Schedule vẫn bấm ở picker. Test: SchedulePage.test.tsx "views a library question from the picker and chooses it".
