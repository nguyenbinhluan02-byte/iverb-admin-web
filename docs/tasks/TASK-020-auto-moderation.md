# TASK-020: Today — bài bị kiểm duyệt tự động ẩn (lọc Auto-hidden, lý do, Approve / Delete)

- **Status:** in-progress
- **Created:** 2026-11-01
- **Branch:** feat/auto-moderation
- **BE:** iverb-supabase TASK-038

## Mục tiêu
Backend tự kiểm duyệt reply / explanation (luật link + từ cấm EN/VI, OpenAI moderation) và ẩn ngầm bài vi phạm (tác giả vẫn thấy). Admin cần thấy các bài này, lý do, rồi duyệt (hiện lại) hoặc xoá.

## Phạm vi
**In scope**
- Lọc **Auto-hidden · N** (`p_filter = 'auto_hidden'`, `auto_hidden_count`).
- Explanation / reply bị hệ thống ẩn: khung "Hidden by the system · <lý do>" + **Approve** (`admin_dismiss_reports`) / Delete; "N auto-hidden replies".
- Lý do: `link` → "Link or contact info", `profanity` → "Bad language", `ai:a,b` → "AI: a, b".

**Out of scope**
- Sửa danh sách từ cấm trên web.

## Checklist
- [x] Type + `isAutoHidden`, `moderationReasonLabel` (+ test).
- [x] UI lọc, khung lý do, Approve / Delete (+ test).
- [x] `yarn build`, `yarn lint`, `yarn test` (78/78).
- [ ] BE TASK-038 lên Dev, `yarn sync:types`, xem trên trình duyệt.

## File dự kiến thay đổi
- `src/services/today.ts`, `src/features/today/{TodayPage,todayModel}.tsx|ts` (+ test)

## Notes
- Approve dùng chung `admin_dismiss_reports` (→ `approved`, xoá report nếu có), bài ra khỏi lọc Auto-hidden.
