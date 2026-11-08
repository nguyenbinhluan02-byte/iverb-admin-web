# TASK-027: Week editor — Languages và duyệt bản dịch

- **Status:** done
- **Created:** 2026-11-08
- **Branch:** feat/week-editor-languages (nối trên TASK-026) → `release/v3.1.0`
- **Backend:** TASK-050 (`admin_lesson_translations`, `admin_lesson_translation`, `admin_save_card_translation`, `admin_save_vocab_translation`, `admin-translate`), TASK-053 (`admin_set_translation_status`, `admin_mark_locale_reviewed`)

## Mục tiêu
Design `design/Quiz Admin v3 - changes since v1.md` §5: xem trạng thái dịch từng ngôn ngữ và duyệt / sửa bản dịch ngay trong tab Lesson.

## Phạm vi
**In scope**
- Card **Languages**: mô tả; nút "Tiếng Anh · Source"; dropdown 24 ngôn ngữ (tìm, tab All / Needs review / Reviewed, chấm + trạng thái: Not translated / N outdated / Machine · N to review / Reviewed / Translating…, sắp xếp missing → old → review → busy → ok); chip tổng (ẩn khi 0, bấm mở dropdown đúng bộ lọc).
- Khi chọn ngôn ngữ: **Re-translate {Language}** (`force`, giữ bản đã duyệt; nếu tất cả đã duyệt → toast "nothing to re-translate"); **Mark all {Language} reviewed** (khi còn bản máy); badge trạng thái trên danh sách thẻ; xem trước bằng ngôn ngữ đó.
- **Màn duyệt 1 thẻ**: badge (Machine / Reviewed / Outdated / Not translated / Translating…); banner Outdated; "Not translated yet" + **Translate {Language}**; mỗi trường: EN phía trên + ô dịch, sửa (rời ô) → lưu thành Reviewed; nút Mark reviewed / Mark as machine; phần khoá (câu ví dụ, công thức, signal words, câu đúng / sai, quick check, từ) giữ tiếng Anh.
- Mở 1 ngôn ngữ **không** gọi dịch. Save & translate làm mới trạng thái sau khi dịch xong.

**Out of scope**
- Dịch lại riêng 1 thẻ (design không có).

## Checklist
- [x] `services/translations.ts`
- [x] `translationModel` (+ test), `LanguagesCard`, `TranslationReview`
- [x] Ghép vào `WeekEditorPage`, `PhonePreview` (bản dịch)
- [x] `yarn build`, `yarn lint`, `yarn test` (105)

## File dự kiến thay đổi
- `src/services/translations.ts`
- `src/features/week-editor/{translationModel,LanguagesCard,TranslationReview,WeekEditorPage,PhonePreview}.tsx|ts`

## Notes
- Tên ngôn ngữ hiển thị bằng tiếng Việt như design, cho 24 mã của backend (`private.lesson_locales`).
- Chưa chạy thử trên trình duyệt với dữ liệu Dev.
