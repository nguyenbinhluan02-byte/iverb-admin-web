# TASK-035: Tạo ảnh từ vựng bằng AI

- **Status:** in-progress
- **Created:** 2026-11-16
- **Branch:** feat/task-035-ai-word-image

## Mục tiêu
Thẻ từ vựng có nút "Generate with AI" dưới ô ảnh: tạo ảnh minh hoạ phẳng, không chữ (theo mẫu `store/`) từ từ, loại từ, câu ví dụ + gợi ý tuỳ chọn. BE: iverb-supabase TASK-063 (`admin-lesson-media` `{ image }`).

## Phạm vi
**In scope**
- `generateWordImage` trong `services/lessons.ts`, lỗi `image_failed`.
- `AiImage` trong `CardEditor.tsx`: ô gợi ý + nút Generate / Regenerate, đặt `imageUrl` khi xong (vẫn cần Save bài).

**Out of scope**
- Ảnh bìa bài; tạo hàng loạt cho cả bài.

## Checklist
- [x] Service + UI + test (`AiImage.test.tsx`)
- [x] build / lint / test
- [ ] Deploy BE Dev, thử trên Dev

## File dự kiến thay đổi
- `src/services/lessons.ts`, `src/features/week-editor/CardEditor.tsx`, `src/features/week-editor/AiImage.test.tsx`

## Notes
- Mỗi lần bấm là 1 ảnh mới, tốn ~0.06 $ (OpenAI gpt-image-1).
