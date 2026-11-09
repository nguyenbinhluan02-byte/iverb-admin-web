# TASK-031: Trang App config

- **Status:** done
- **Created:** 2026-11-09
- **Branch:** feat/app-config → `release/v3.1.0`

## Mục tiêu
Design v3 "App config" (`design/Quiz Admin v3 - changes since v1.md`): admin sửa `app_config` (quảng cáo, trial, xem thử bài, link pháp lý) không cần SQL. App đọc giá trị mới ở lần mở app sau.

## Phạm vi
**In scope**
- Sidebar: mục "App config" dưới Users (sau divider), chấm cam khi có thay đổi chưa lưu.
- Trang `/config`: stepper cho số, ô link + nút mở link, badge "Edited · was …", Discard, Save N changes / Fix errors to save, toast "App config saved".
- BE: iverb-supabase TASK-060 (`admin_get_app_config`, `admin_save_app_config`, PR #84 merged).

**Out of scope**
- Nhóm App versions (`latest_version`, `min_supported_version`): **ẩn**, app chưa dùng (quyết định của user 2026-11-09). Backend đã nhận 2 key này, sau chỉ cần thêm FE.

## Checklist
- [x] `services/appConfig.ts`, sync types
- [x] `features/app-config/` (model, bản nháp, trang) + test
- [x] Route, sidebar, mã lỗi `invalid_key` / `invalid_value`
- [x] build / lint / test (117 pass), PR

## File dự kiến thay đổi
- `src/features/app-config/*`, `src/services/appConfig.ts`, `src/services/database.types.ts`
- `src/App.tsx`, `src/components/Sidebar.tsx`, `src/lib/errors.ts`
- `design/Quiz Admin v3*` (design App config)

## Notes
- Quyết định (user, 2026-11-09): ẩn App versions; quảng cáo bài học ghi theo **lần mở bài** ("On lessons" / "Ad on every 3rd lesson opened"), đúng hành vi app; helper trial giữ như design. 0 = tắt (khớp backend / app).
- Bản nháp giữ ở store module (`draftStore.ts`): rời trang rồi quay lại vẫn còn, chấm cam ở sidebar vẫn hiện.
