# TASK-028: Chuyển bài học sang tuần khác

- **Status:** done
- **Created:** 2026-11-08
- **Branch:** feat/move-week → `release/v3.1.0`
- **Backend:** iverb-supabase TASK-055 (`admin_move_week`)

## Mục tiêu
Design cập nhật `design/Quiz Admin v3 - changes since v1.md` §3 (nút Move) + §3.1 (dialog) + §4 (header editor "Move to week…").

## Phạm vi
**In scope**
- Weeks: nút ⇅ (tooltip "Move to another week") cạnh nút hành động, chỉ tuần sắp tới không Empty; cột cuối 150px.
- Week editor: nút "Move to week…" (tuần sắp tới, không Empty); sau khi chuyển, editor đi theo bài sang tuần mới.
- Dialog "Move lesson to another week": danh sách tuần sắp tới (trừ tuần nguồn) với loại bài + tên / "No lesson yet" + badge; chọn tuần trống → "Move lesson", tuần có bài → cảnh báo cam + "Swap weeks", chưa chọn → "Choose a week" (tắt); ghi chú "Live and ended weeks can’t be moved."; toast "Moved to …" / "Swapped … and …".
- Cập nhật file design.

**Out of scope**
- Backend (TASK-055).

## Checklist
- [x] `useMoveWeek`, type `admin_move_week`
- [x] `MoveWeekDialog` (+ test), Weeks, WeekEditorPage
- [x] `yarn build`, `yarn lint`, `yarn test`

## File dự kiến thay đổi
- `src/services/weeks.ts`, `src/services/database.types.ts`
- `src/features/weeks/{MoveWeekDialog,MoveWeekDialog.test,WeeksPage}.tsx`
- `src/features/week-editor/WeekEditorPage.tsx`
- `design/*`

## Notes
- `database.types.ts`: thêm tay `admin_move_week` (Dev chưa có migration); lần `sync:types` sau sẽ sinh giống vậy.
- Danh sách tuần đích: tới tuần cuối đã có bài / câu hỏi + 4 tuần trống.
