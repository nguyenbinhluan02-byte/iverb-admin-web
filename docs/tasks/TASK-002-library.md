# TASK-002: Library, View, History

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** feat/library
- **BE:** `iverb-supabase` TASK-016 (`admin_list_questions`, `admin_question_history`), done

## Mục tiêu
Màn Library theo design: tìm kiếm, lọc, xem chi tiết câu hỏi, lịch sử sử dụng.

## Phạm vi
**In scope**
- Ô tìm kiếm (prompt, câu fill / order, đáp án, hint, tác giả, option).
- Dropdown lọc (component dùng chung `FilterDropdown`): Status, Added by, Type, Sort; lưu trên URL (`?q=&status=&by=&type=&sort=`). Đếm theo filter như design.
- Danh sách: badge type / status / User submitted, text, tác giả, View, History · N, Edit (chưa publish) / Reuse (đã publish).
- Modal View và History (component `Modal` dùng chung, Radix Dialog).

**Out of scope**
- Reuse calendar (TASK-004): nút Reuse đang tắt, "Coming soon".
- Form sửa (TASK-003): Edit chuyển tới `/questions/:id/edit` (trang tạm).
- Giải thích chính thức trong View (TASK-003 thêm cột).

## Checklist
- [x] BE: TASK-016 (migration, pgTAP, types).
- [x] `services/questions.ts` + logic lọc / đếm (`features/library/filter.ts`) + test.
- [x] `Badge`, `FilterDropdown`, `Modal`, `TypeIcon`.
- [x] Library page, View, History + test render.
- [x] `yarn build`, `yarn lint`, `yarn test` (17 test).
- [ ] So giao diện với design trên trình duyệt — user tự kiểm tra sau (quyết định 2026-10-29).

## File dự kiến thay đổi
- `src/features/library/*`, `src/components/{Badge,badgeStyles,FilterDropdown,Modal,TypeIcon,typeIcons}.*`
- `src/lib/question.ts`, `src/services/questions.ts`, `src/App.tsx`, `src/test/setup.ts`

## Notes
- Lọc / tìm ở client: RPC trả toàn bộ câu hỏi (mỗi ngày một câu nên nhỏ). Đổi sang server khi vượt vài nghìn.
- "Added by" / *User submitted* dựa vào `author.role` cho tới khi có Submissions (TASK-006). Dữ liệu seed trên Dev có tác giả là user thường nên sẽ hiện *User submitted*.
- Trạng thái thêm so với design: **Not scheduled** (câu `verified` chưa có ngày) — tính vào *Not published*, không vào *Upcoming*.
- "Live today" được tính vào filter *Upcoming* (như design) và vẫn Edit được.
