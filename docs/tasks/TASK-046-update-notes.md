# TASK-046: App config: "What's new in the latest version" (`latest_version_notes`)

- **Status:** done
- **Created:** 2026-11-18
- **Branch:** feat/task-046-update-notes → `release/v3.2.0`
- **BE:** iverb-supabase TASK-073 (#97) · **App:** i_verbs_v2 TASK-122

## Mục tiêu
Admin soạn danh sách tính năng mới hiện trong modal "Update available" của app.

## Phạm vi
**In scope**
- Field kiểu `lines` (textarea) trong nhóm App versions, dưới Latest version.
- Mỗi dòng một ý, tối đa 5 dòng × 80 ký tự (giống server); rời ô → bỏ dòng trống, trim.
- Đếm số dòng dưới ô.

**Out of scope**
- Nhiều ngôn ngữ.

## Checklist
- [x] `LinesField`, `fieldError`, `LinesControl`
- [x] Test
- [x] `yarn build`, `yarn lint`, `yarn test`
- [x] BE TASK-073 (#97 merged)
- [ ] Deploy BE Dev / Prod (trước đó ô hiện "Not on the server yet")

## File dự kiến thay đổi
- `src/services/appConfig.ts`
- `src/features/app-config/appConfigModel.ts`, `AppConfigPage.tsx`, `AppConfigPage.test.tsx`

## Notes
- Quyết định (user, 2026-11-18): ô nhiều dòng, mỗi dòng một ý; chỉ modal "Update available" dùng.
