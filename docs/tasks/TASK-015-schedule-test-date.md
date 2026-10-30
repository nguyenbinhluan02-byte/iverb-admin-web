# TASK-015: Fix test Schedule lỗi theo ngày chạy (chặn deploy)

- **Status:** done
- **Created:** 2026-10-30
- **Branch:** fix/schedule-test-date

## Mục tiêu
Deploy web admin fail vì `SchedulePage > lists the next 14 days with legend counts` lỗi: `getByText('13')` tìm số ngày trống ở legend, nhưng khi ngày 13 nằm trong 14 ngày tới (chạy ngày 2026-10-30 → có 13/11) thì ô lịch cũng có chữ "13" → "Found multiple elements".

## Phạm vi
**In scope**
- Test chỉ tìm đúng legend "13 empty".

**Out of scope**
- Code `SchedulePage`.

## Checklist
- [x] Sửa test.
- [x] Chạy test với nhiều ngày giả lập.
- [x] `yarn lint`, `yarn build`, `yarn test`.

## File dự kiến thay đổi
- `src/features/schedule/SchedulePage.test.tsx`
- `docs/tasks/README.md`

## Notes
- Test tìm đúng phần tử có text `13 empty` thay vì `getByText('13')`.
- Giả lập `Date` (vi.useFakeTimers toFake Date) cho 12 ngày (cuối / đầu tháng, cuối năm, tháng 2, năm nhuận): 53/53 pass mỗi ngày.
