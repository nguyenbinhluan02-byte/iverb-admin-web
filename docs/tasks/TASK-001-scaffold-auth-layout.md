# TASK-001: Scaffold, đăng nhập email + password, layout

- **Status:** in-progress
- **Created:** 2026-10-29
- **Branch:** feat/scaffold
- **BE:** `iverb-supabase` TASK-015 (`private.require_admin`), done

## Mục tiêu
Dựng project web admin theo stack đã chốt, đăng nhập admin, khung layout (sidebar + main) theo design để các màn hình sau cắm vào.

## Phạm vi
**In scope**
- Vite + React 19 + TS, Tailwind v4 với token design, React Router, TanStack Query, Supabase client (schema `api`), oxlint, Prettier, Vitest.
- Đăng nhập email + password, chặn user không phải admin (`get_me().profile.role`), đăng xuất.
- Sidebar (brand, nav 5 mục, admin ở chân), trang tạm cho từng màn hình.
- `CLAUDE.md`, `README.md`, `docs/tasks/`.

**Out of scope**
- Nội dung các màn hình (TASK-002 → 006), badge đếm trên sidebar (cần API của từng màn hình), deploy (TASK-007).

## Checklist
- [x] Scaffold + cấu hình (alias `@`, Tailwind token, Vitest, oxlint).
- [x] Auth provider + route guard + trang Login.
- [x] Sidebar + layout + trang tạm.
- [x] BE: `private.require_admin()` (TASK-015).
- [x] `yarn build`, `yarn lint`, `yarn test` pass.
- [x] Test tay: vào `/today` khi chưa đăng nhập → `/login`; sai mật khẩu → "Wrong email or password." (gọi Supabase Dev thật).
- [ ] Test tay đăng nhập bằng tài khoản admin trên Dev + user thường (chờ có tài khoản admin).

## File dự kiến thay đổi
- Toàn bộ project (mới).

## Notes
- Node 22 (`.nvmrc`); Vite 8 không chạy với Node 18.
- `resolutions: @types/estree 1.0.9`: tarball 1.0.10 trên registry npm đang 404 (2026-10-29). Bỏ khi registry hết lỗi.
- Lint dùng oxlint (mặc định của template Vite) thay ESLint.
- Badge sidebar (reported / empty days / pending) thêm ở task của màn hình tương ứng.
