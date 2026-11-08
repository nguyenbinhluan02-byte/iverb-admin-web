# TASK-029: Nén ảnh bài học trước khi upload

- **Status:** done
- **Created:** 2026-11-08
- **Branch:** feat/compress-images → `release/v3.1.0`

## Mục tiêu
Ảnh từ vựng / ảnh bìa đang upload nguyên file gốc (ảnh điện thoại thường 4000 px, 3–5 MB) trong khi app chỉ hiện khoảng 1000 px. Nén trong trình duyệt để app tải nhẹ.

## Phạm vi
**In scope**
- `lib/image.ts`: cạnh dài tối đa 1600 px (không phóng to), WebP chất lượng 0.8 (trình duyệt không mã hoá được WebP → JPEG); giữ file gốc nếu file nén không nhỏ hơn và không cần thu nhỏ.
- `ImageDrop`: nén trước khi upload; chỉ nhận JPG / PNG / WebP; ảnh từ vựng nhỏ hơn 800×500 → cảnh báo (vẫn upload).

**Out of scope**
- Nén lại ảnh đã upload (mới có trên Dev), backend / app.

## Checklist
- [x] `lib/image.ts` (+ test `fitSize`)
- [x] `ImageDrop`, `CardEditor` (`minSize`)
- [x] `yarn build`, `yarn lint`, `yarn test` (108)

## File dự kiến thay đổi
- `src/lib/image.ts`, `src/lib/image.test.ts`
- `src/features/week-editor/ImageDrop.tsx`, `CardEditor.tsx`

## Notes
- Dùng `createImageBitmap` + canvas (Chrome / Edge / Firefox / Safari mới). jsdom không có canvas nên test chỉ kiểm phần tính kích thước; chưa thử trên trình duyệt.
