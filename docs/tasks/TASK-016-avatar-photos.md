# TASK-016: Hiện ảnh đại diện thật (fallback chữ cái)

- **Status:** done
- **Created:** 2026-10-30
- **Branch:** feat/avatar-photos
- **BE:** `iverb-supabase` TASK-028

## Mục tiêu
`Avatar` chỉ vẽ chữ cái đầu của tên, trong khi app mobile hiện ảnh profile. Quyết định với user (2026-10-30): sửa hết các chỗ có ảnh.

## Phạm vi
**In scope**
- `Avatar` nhận `src`: có ảnh thì hiện ảnh, không có / ảnh lỗi thì giữ chữ cái như cũ.
- Truyền ảnh ở: Today (tác giả, explanation, reply), Library, Schedule, View dialog (tác giả, từ `author.avatar_url` — BE TASK-028), Sidebar (`get_me.avatar_url`).

**Out of scope**
- App preview trong form (chỉ có tên đang gõ ở "Shown as author").

## Checklist
- [x] `Avatar` + test.
- [x] Truyền `avatar_url` ở các màn.
- [x] `yarn build`, `yarn lint`, `yarn test`.

## File dự kiến thay đổi
- `src/components/Avatar.tsx`, `src/services/questions.ts`
- `src/features/today/TodayPage.tsx`, `src/features/library/LibraryPage.tsx`, `src/features/library/QuestionViewDialog.tsx`, `src/features/schedule/SchedulePage.tsx`, `src/components/Sidebar.tsx`
- `docs/tasks/README.md`

## Notes
- `<img referrerPolicy="no-referrer">` (ảnh Google hay chặn khi có referrer); `onError` → chữ cái.
- `author.avatar_url` để optional: backend chưa có TASK-028 (vd production chưa push migration) thì vẫn hiện chữ cái, không lỗi.
- `yarn lint`, `yarn build`, `yarn test` 55/55. Chưa xem trên trình duyệt với dữ liệu thật.
