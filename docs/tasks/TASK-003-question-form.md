# TASK-003: Form tạo / sửa câu hỏi

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** feat/question-form
- **BE:** `iverb-supabase` TASK-017 (`admin_save_question`, cột `explanation`, `author_name`), done

## Mục tiêu
Màn "New / Edit question" theo design: 4 loại câu hỏi, App preview, cảnh báo câu tương tự, chọn ngày, lưu nháp / xếp lịch.

## Phạm vi
**In scope**
- Route `/questions/new` (`?date=YYYY-MM-DD`, `?from=<id>` để reuse thành bản copy) và `/questions/:id/edit`.
- Thẻ chọn loại; câu hỏi; option 2–6 + đánh dấu đúng (single / multi); fill (câu có `___`, đáp án — nhiều biến thể cách nhau bằng `/`, hint); order (câu đúng, đếm từ).
- Cảnh báo "Similar questions already exist" (thuật toán trùng từ ≥ 60% của design, tính ở client).
- Giải thích, chọn ngày (14 ngày tới, chấm = đã có câu, cảnh báo thay thế), "Shown as author".
- Cancel / Save draft (cần câu hỏi) / Schedule (cần form hợp lệ + ngày).
- App preview cập nhật trực tiếp.

**Out of scope**
- Mở form từ Schedule / Today / Submissions (TASK-004 / 005 / 006). Sau khi lưu đang quay về Library; đổi sang Schedule ở TASK-004.

## Checklist
- [x] BE: TASK-017.
- [x] `formModel.ts` (chuyển đổi, validate bằng Zod, payload) + `similar.ts` + test.
- [x] `QuestionFormPage`, `AppPreview` + test render.
- [x] `yarn build`, `yarn lint`, `yarn test` (36 test).
- [ ] So giao diện với design — user tự kiểm tra sau.

## File dự kiến thay đổi
- `src/features/question-form/*`, `src/services/questions.ts`, `src/lib/{dates,errors}.ts`, `src/App.tsx`, `src/test/fixtures.ts`

## Notes
- Câu đã có người trả lời (thường là câu live): khoá loại / option / đáp án, chỉ sửa câu hỏi, giải thích, tác giả. Form gửi lại nguyên JSON gốc khi phần hiển thị không đổi (giữ id option và thứ tự tile đã xáo) để backend không báo `has_answers`.
- Câu live: ngày cố định là hôm nay, không có Save draft, nút chính là "Save changes".
- Câu đã chiếu (published) không mở được form ("already shown").
- Order: tile được xáo ngẫu nhiên khi lưu, luôn khác thứ tự đúng.
- "Shown as author" trùng tên profile thì backend lưu `null` (dùng profile + avatar); khác tên thì app hiện tên đó, không avatar.
- **App mobile** chưa hiển thị `reveal.explanation` — cần task bên `i_verbs_v2`.
