# TASK-043: App config — công tắc "Free users can reply"

- **Status:** done
- **Created:** 2026-11-17
- **Branch:** feat/task-043-free-can-reply → `release/v3.2.0`
- **Backend:** iverb-supabase TASK-071 (PR #94)

## Mục tiêu
Tách quyền reply khỏi quyền trả lời: nhóm "Free trial & preview" thêm công tắc `free_can_reply` (0 / 1, mặc định tắt). Mô tả `free_can_answer` bỏ chữ "Community".

## Checklist
- [x] `appConfigModel.ts`, `services/appConfig.ts`, test
- [x] yarn test 130/130, lint, build

## Notes
- Server chưa deploy TASK-071 thì công tắc hiện "Not on the server yet".
