# TASK-044: App config — "Reply push window"

- **Status:** done
- **Created:** 2026-11-17
- **Branch:** feat/task-044-reply-push-window → `release/v3.2.0`
- **Backend:** iverb-supabase TASK-072 (PR #96)

## Mục tiêu
User yêu cầu (2026-11-17): khoảng chờ giữa 2 push reply của cùng một câu trả lời chỉnh được trong app config.

## Thay đổi
- Nhóm mới "Notifications": số `reply_push_window_minutes` (0–1440 phút, mặc định 15; 0 = mỗi reply một push).
- `services/appConfig.ts`, test.

## Checklist
- [x] yarn test 130/130, lint, build

## Notes
- Server chưa deploy TASK-072 thì ô hiện "Not on the server yet".
