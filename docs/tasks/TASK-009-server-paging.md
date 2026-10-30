# TASK-009: Lọc + phân trang ở server

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** feat/server-paging
- **BE:** `iverb-supabase` TASK-021 (`admin_search_questions`, `admin_explanations_page`), done

## Mục tiêu
Yêu cầu 2026-10-29: Library có phân trang và bộ lọc chạy ở backend; danh sách explanation ở Today cũng phân trang.

## Phạm vi
**In scope**
- Library (đã thay bằng phân trang đánh số ở TASK-010): `useQuestionSearch` (infinite query, 30 câu / trang) gửi query / status / source / type / sort lên server; số đếm dropdown và "N questions" lấy từ server; ô tìm kiếm debounce 300 ms; nút **Load more** ("x of total").
- Choose from library: cùng RPC với `pickable: true`, có Load more; số câu hiện `total` từ server.
- Today → User explanations: `admin_explanations_page` (20 / trang) + Load more.
- Component `LoadMore`, hook `useDebounced`.
- Bỏ lọc / đếm ở client (`filterQuestions`, `countFilters`, `filterPool`, `countPool`, `searchText`) và test của chúng (đã có pgTAP ở backend).

**Out of scope**
- Schedule, form (kiểm tra câu trùng, ngày đã có câu), badge sidebar, "Next empty day" vẫn dùng `admin_list_questions` (cần toàn bộ câu hỏi).

## Checklist
- [x] BE: TASK-021.
- [x] Hooks + Library + picker + explanations.
- [x] Test: tham số gửi lên server, debounce, Load more.
- [x] `yarn build`, `yarn lint`, `yarn test` (48 test).

## File dự kiến thay đổi
- `src/services/{questions,today}.ts`, `src/lib/{useDebounced,question}.ts`, `src/components/LoadMore.tsx`
- `src/features/library/*`, `src/features/schedule/{PickFromLibraryDialog,pickModel}*`, `src/features/today/TodayPage*`

## Notes
- **Thứ tự deploy:** backend (migration `20261029000600`) phải lên production **trước** web bản này, vì web gọi RPC mới. RPC cũ vẫn giữ nên deploy backend trước không làm hỏng web v1.0.0.
- `keepPreviousData`: đổi bộ lọc vẫn giữ danh sách cũ cho tới khi có kết quả mới (không nháy trắng).
- Picker sort "Shown most recently" → `newest`: trong nhóm chưa chiếu, câu chưa có ngày lên trước.
