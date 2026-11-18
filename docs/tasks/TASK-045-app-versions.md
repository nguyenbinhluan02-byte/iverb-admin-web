# TASK-045: App config: nhóm "App versions" (latest / minimum version)

- **Status:** done
- **Created:** 2026-11-18
- **Branch:** feat/task-045-app-versions → `release/v3.2.0`

## Mục tiêu
App 3.2.0 dùng `latest_version` (nhắc cập nhật, bỏ qua được) và `min_supported_version` (bắt buộc cập nhật), app TASK-121. Hiện lại nhóm "App versions" (đã ẩn từ 2026-11-09 vì app chưa dùng) để admin tự sửa.

## Phạm vi
**In scope**
- Field kiểu `version` (text monospace, `x.y.z`), theo design v3.
- Kiểm tra: đúng semver; minimum ≤ latest (giống server).
- Một version chung cho iOS và Android.

**Out of scope**
- BE: không cần sửa. Key + rule `version` + kiểm tra min ≤ latest đã có (`admin_save_app_config`, TASK-060 backend), giá trị mặc định `0.0.0`.

## Checklist
- [x] `AppConfig` thêm 2 key; `VersionField`, `compareVersions`, `fieldError` nhận `values`
- [x] `VersionControl` trên trang App config
- [x] Test: semver, min ≤ latest, lưu 2 key
- [x] `yarn build`, `yarn lint`, `yarn test`

## File dự kiến thay đổi
- `src/services/appConfig.ts`
- `src/features/app-config/appConfigModel.ts`, `AppConfigPage.tsx`, `AppConfigPage.test.tsx`

## Notes
- Quyết định (user, 2026-11-18): một version chung cho 2 nền tảng → chỉ đổi khi cả 2 store đã có bản mới (ghi ở sub của nhóm).
- `0.0.0` = tắt (app không nhắc / không chặn).
