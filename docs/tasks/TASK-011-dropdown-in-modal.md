# TASK-011: Fix dropdown lọc không mở được trong "Choose from library"

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** fix/dropdown-in-modal

## Mục tiêu
User báo (2026-10-29): các dropdown Status / Added by / Type / Sort trong modal "Choose from library" bấm không mở.

## Phạm vi
**In scope**
- Nguyên nhân: menu của `FilterDropdown` (Radix Popover, portal ra `body`) có `z-40`, thấp hơn overlay của `Modal` (`z-50`) → menu mở nhưng nằm dưới lớp phủ của modal. Ở Library không có modal nên không bị.
- Sửa: menu `z-[60]`.
- Test: chọn option trong dropdown bên trong modal, modal vẫn mở và bộ lọc được gửi lên server.

**Out of scope**
- Thang z-index chung cho toàn app (hiện chỉ có modal 50 và menu 60).

## Checklist
- [x] Sửa z-index.
- [x] Test trong `SchedulePage.test.tsx`.
- [x] `yarn build`, `yarn lint`, `yarn test` (51 test).
- [ ] Xác nhận trên trình duyệt (jsdom không tính z-index).

## File dự kiến thay đổi
- `src/components/FilterDropdown.tsx`, `src/features/schedule/SchedulePage.test.tsx`
