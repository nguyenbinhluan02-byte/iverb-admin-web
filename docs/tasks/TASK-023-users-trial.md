# TASK-023: Users: trạng thái dùng thử (Trial)

- **Status:** done
- **Created:** 2026-11-02
- **Branch:** feat/users-trial

## Mục tiêu
Biết ai đang dùng thử trả lời miễn phí (backend iverb-supabase TASK-040 / TASK-042).
Quyết định với user (2026-11-02): đang premium → Active; Trial = không có premium đang dùng và còn hạn dùng thử; hết dùng thử → Free (hoặc Expired nếu từng premium).

## Phạm vi
**In scope**
- `UserStatus` thêm `trial`, `AdminUser.trial_expires_at`.
- Lọc Status: chip **Trial** (đếm theo `counts.status.trial`).
- Bảng: pill Trial (xanh dương), dòng phụ "Trial ends …".
- Panel chi tiết: ghi chú trạng thái, dòng "Trial ends" / "Trial ended".

**Out of scope**
- Sửa hạn dùng thử từ admin (màn Users chỉ đọc).

## Checklist
- [x] Service + model + page.
- [x] Test (vitest).
- [x] `yarn sync:types`, `build`, `lint`, `test`.
- [x] BE: iverb-supabase TASK-042 (PR #55).

## File dự kiến thay đổi
- `src/services/users.ts`, `src/features/users/usersModel.ts`, `src/features/users/UsersPage.tsx`
- `src/features/library/filterOptions.ts` (`BLUE_TINT`), test, `src/services/database.types.ts`

## Notes
- BE đã lên Dev; Prod cần deploy migration `20261102000300_admin_users_trial.sql`.
