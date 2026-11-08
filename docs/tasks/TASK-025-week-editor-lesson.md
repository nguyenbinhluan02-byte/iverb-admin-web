# TASK-025: Week editor — tab Lesson

- **Status:** done
- **Created:** 2026-11-08
- **Branch:** feat/week-editor-lesson → `release/v3.1.0`
- **Backend:** iverb-supabase TASK-052 (`admin_save_week_lesson`), TASK-054 (`audio_meta`, WAV), `admin-lesson-media`, `admin-translate`

## Mục tiêu
Design `design/Quiz Admin v3 - changes since v1.md` §4 + §4.1 (`Weekly Lessons.dc.html` "WEEK EDITOR"): soạn bài học của một tuần.

## Phạm vi
**In scope**
- `/weeks/:weekStart`: breadcrumb Weeks, khoảng ngày, badge trạng thái, 2 check (Lesson ready / incomplete, q/7 questions), **Save & translate**; notice tuần Live / Ended (Ended chỉ xem); tab Lesson / Daily questions.
- Tab Lesson: loại bài (Grammar / Vocabulary by topic), tên bài, ảnh bìa; danh sách thẻ (thêm, chọn, lên / xuống, xoá); xem trước trên điện thoại.
- Thẻ grammar: chip label, heading, 8 loại block (thêm / lên / xuống / xoá), cảnh báo > 3 block, tối đa 6.
- Thẻ vocab: word, IPA, meaning (EN), part of speech (1 trong 5), example `*sao*`, ảnh 16:10, phát âm **Generate** (giọng, Play, badge No word yet / Generates on save / Ready) / **Upload file** (MP3 / M4A / WAV ≤ 5 s, Play, Replace; giữ cả 2 file khi đổi qua lại).
- Lưu: tạo TTS cho từ chưa Ready → `admin_save_week_lesson` → nạp lại form từ kết quả (id thẻ mới) → `admin-translate` gọi tới khi `remaining = 0`.

**Out of scope**
- Card Languages + duyệt bản dịch (TASK-027), tab Daily questions (TASK-026, tạm dòng hướng dẫn).

## Checklist
- [x] `services/lessons.ts`
- [x] `features/week-editor/*` (`editorModel` + test, `WeekEditorPage`, `CardEditor`, `BlockEditor`, `PhonePreview`, `ImageDrop`, `ui`)
- [x] Route `/weeks/:weekStart`
- [x] `yarn build`, `yarn lint`, `yarn test` (98)

## File dự kiến thay đổi
- `src/services/lessons.ts`
- `src/features/week-editor/*`
- `src/App.tsx`, `docs/tasks/*`

## Notes
- Hai danh sách thẻ (grammar / vocab) được giữ riêng trên form: đổi loại bài qua lại không mất; chỉ loại đang chọn được lưu.
- Từ lưu trước TASK-054 (chưa có `audio_meta`) coi như audio tạo từ chính từ đó (Ready).
- Play khi chưa Ready gọi TTS ngay và giữ file đó cho lần lưu.
- Chưa chạy thử trên trình duyệt với dữ liệu Dev.
