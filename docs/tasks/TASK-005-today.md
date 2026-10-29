# TASK-005: Today (bản đơn giản)

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** feat/today
- **BE:** `iverb-supabase` TASK-019 (`admin_get_today`, `admin_list_explanations`, `admin_remove_explanation`), done

## Mục tiêu
Màn Today theo design, **rút gọn theo yêu cầu 2026-10-29**: chỉ hiện số answers (không so sánh 7 ngày), correct rate, explanation của user; không có reply.

## Phạm vi
**In scope**
- Header: "Live now", ngày hôm nay (UTC), "Closes in …" (tới 00:00 UTC), Edit question.
- 4 thẻ: Answers, Correct rate (+ "N picked the right answer"), User explanations (số lượng), Next empty day (mở form cho ngày trống đầu tiên / View schedule).
- Thẻ câu hỏi: single / multi có thanh % từng option (đúng = xanh); fill / order hiện đáp án; giải thích chính thức.
- Danh sách explanation: avatar, tên, "Picked B" / `Typed "…"` / "Correct order" (xanh đúng, đỏ sai), thời gian, số vote, Delete (modal xác nhận).
- Số liệu tự làm mới mỗi phút.
- Modal View (Library / Schedule) hiện thêm giải thích chính thức.

**Out of scope (bỏ theo yêu cầu)**
- So sánh 7 ngày, reply của admin, report / dismiss, filter All / Replied / Reported, badge sidebar Today.

## Checklist
- [x] BE: TASK-019.
- [x] `services/today.ts`, `todayModel` + test.
- [x] `TodayPage` + test render.
- [x] `yarn build`, `yarn lint`, `yarn test` (55 test).
- [ ] So giao diện với design — user tự kiểm tra sau.

## File dự kiến thay đổi
- `src/features/today/*`, `src/services/today.ts`, `src/features/library/{QuestionBody,QuestionViewDialog}.tsx`, `src/App.tsx`

## Notes
- Multi: % mỗi option tính trên tổng số answers (tổng có thể > 100%).
- Delete chỉ ẩn explanation (`removed`), không xoá câu trả lời → số answers / correct rate không đổi.
