# TASK-036: Nút trong thẻ Languages không xuống dòng

- **Status:** done
- **Created:** 2026-11-16
- **Branch:** fix/task-036-languages-header

## Mục tiêu
Nút "Mark all Chinese (Simplified) reviewed" bị đẩy xuống dòng vì đoạn mô tả bên trái dài.

## Phạm vi
**In scope**
- Mô tả bên trái co lại và tự xuống dòng (`flex-1 basis-[280px]`), nhóm nút `flex-none` giữ trên một hàng.
- Nhãn gọn: "Re-translate", "Mark all reviewed"; tên ngôn ngữ chuyển vào `title` (ngôn ngữ đang chọn đã hiện ở chip).

**Out of scope**
- Đổi hành vi nút.

## Checklist
- [x] Sửa `LanguagesCard.tsx`
- [x] build / lint / test

## File dự kiến thay đổi
- `src/features/week-editor/LanguagesCard.tsx`

## Notes
Chỉ FE, không có BE.
