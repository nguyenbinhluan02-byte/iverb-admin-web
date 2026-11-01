# TASK-022: Màn Users (chỉ đọc)

- **Status:** done
- **Created:** 2026-11-01
- **Branch:** feat/users-screen

## Mục tiêu
Theo design `design/CHANGES-users-screen.md`: danh sách tài khoản có tìm kiếm, lọc, sắp xếp, phân trang và panel chi tiết. Không có thao tác sửa / xoá. BE: iverb-supabase TASK-039.

## Quyết định (user, 2026-11-01)
- Bỏ status "Deletion requested" (xoá trong app là xoá ngay).
- Last active lấy từ `profiles.last_active_at` (get_me cập nhật, tối đa 1 lần/giờ).
- Bỏ dòng Device / app version (app chưa gửi).
- Thêm status **Free** (chưa từng premium, pill xám); filter Plan thêm **No plan**. Plan thật: Premium yearly / lifetime / manual, Free gift (không có monthly).

## Phạm vi
**In scope**
- Sidebar Users (cuối), route `/users`, filter trong URL như Library.
- Bảng + panel chi tiết + month picker. Pager dùng lại `Pagination` của Library.

**Out of scope**
- Sửa / xoá user.

## Checklist
- [x] `services/users.ts`, `features/users/*`, Sidebar, route.
- [x] Test (`UsersPage.test.tsx`, `usersModel.test.ts`).
- [x] `yarn build`, `yarn lint`, `yarn test` (86 pass).
- [x] BE TASK-039 trên Dev.

## File dự kiến thay đổi
- `src/services/users.ts`, `src/services/database.types.ts`
- `src/features/users/UsersPage.tsx`, `MonthPicker.tsx`, `usersModel.ts` (+ test)
- `src/components/Sidebar.tsx`, `src/App.tsx`

## Notes
- Khác design: plan sub-line "Never premium" cho user Free; lifetime → "Ends Never"; Accuracy "—" khi chưa trả lời. Tên nút Sign-in Google dùng icon globe (lucide không có logo thương hiệu).
- Chưa xem bằng trình duyệt với dữ liệu thật; cần đăng nhập admin trên Dev.
