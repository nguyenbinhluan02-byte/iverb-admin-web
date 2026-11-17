# TASK-040: Sửa công tắc "Banner in past-day story" + khoá server chưa có

- **Status:** done
- **Created:** 2026-11-17
- **Branch:** fix/task-040-toggle → `release/v3.2.0`

## Mục tiêu
User báo công tắc TASK-039 bị lỗi. Nguyên nhân:
1. Nút tròn `absolute` không có `left-0` → trong `<button>` (chữ căn giữa) bị lệch.
2. Backend TASK-068 chưa lên Dev → khoá `day_story_banner` / `story_native_ad_every` không có → giá trị rỗng, báo "Must be on or off", và cả trang "Fix errors to save" (không lưu được field khác).

## Phạm vi
**In scope**
- `left-0` cho nút tròn.
- Field mà server chưa có: hiện "Not on the server yet", không tính lỗi khi lưu các field khác.

## Checklist
- [x] Sửa + test (130/130), lint, build
- [ ] Xem lại sau khi #92 lên Dev
