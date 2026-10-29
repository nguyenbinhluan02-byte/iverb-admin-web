# TASK-010: Library phân trang theo số trang

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** feat/library-pagination
- **BE:** `iverb-supabase` TASK-022 (`admin_search_questions` + `p_offset`), done

## Mục tiêu
Theo design mới (`design/README.md` → Library → Pagination, 2026-10-29): thay "Load more" của Library bằng phân trang đánh số.

## Phạm vi
**In scope**
- 8 câu / trang; "Showing 1–8 of N"; ‹ prev, số trang, › next; hiện trang đầu, cuối, hiện tại ±1, còn lại gộp "…"; prev / next tắt ở hai đầu; ẩn khi không có kết quả.
- Trang lưu trên URL (`?page=`); đổi tìm kiếm / Status / Added by / Type / Sort → về trang 1; kết quả ít đi → kéo về trang cuối.
- `useQuestionPage` (offset, `keepPreviousData`), component `Pagination`, `lib/pagination.ts` + test.

**Out of scope**
- Choose from library và explanations vẫn dùng Load more (design không đổi).

## Checklist
- [x] BE: TASK-022.
- [x] Hook + component + Library.
- [x] Test (dãy trang, chuyển trang, về trang 1 khi lọc, kéo về trang cuối, ẩn khi rỗng).
- [x] `yarn build`, `yarn lint`, `yarn test` (51 test).

## File dự kiến thay đổi
- `src/services/questions.ts`, `src/lib/pagination*.ts`, `src/components/Pagination.tsx`, `src/features/library/LibraryPage*`

## Notes
- Thay đổi design (`design/README.md`, `Quiz Admin.dc.html`) do user thêm đã vô tình được gộp vào commit TASK-009 (`git add -A`); nội dung giữ nguyên.
- Deploy: backend (migration `20261029000700`) lên production trước web.
