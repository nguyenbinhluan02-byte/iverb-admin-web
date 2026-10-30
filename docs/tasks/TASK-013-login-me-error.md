# TASK-013: Fix đăng nhập im lặng khi `get_me` lỗi

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** fix/login-me-error

## Mục tiêu
Sự cố prod 2026-10-29: đăng nhập admin không vào được, không có thông báo.
1. Project prod chưa mở schema `api` (Data API → Exposed schemas) → `get_me` lỗi `PGRST106 Invalid schema: api`. User đã mở trên Dashboard.
2. Web coi `get_me` lỗi là "chưa đăng nhập" → đứng yên ở form, không báo gì.
3. Kết quả lỗi của `['me', userId]` được cache (`staleTime: Infinity`) → đăng nhập lại cùng tài khoản trong cùng tab không gọi lại `get_me`. Tải lại trang thì vào được.

## Phạm vi
**In scope**
- `AuthStatus` thêm `error`; Login hiện "Signed in, but your profile could not be loaded: …" + **Try again** / **Use another account**.
- `signIn` xoá cache `['me']` trước khi đăng nhập.
- Test `AuthProvider.test.tsx` tái hiện đúng sự cố.

**Out of scope**
- Bước kiểm tra "Exposed schemas" trong quy trình tạo project (ghi chú ở backend README).

## Checklist
- [x] Sửa + test.
- [x] `yarn build`, `yarn lint`, `yarn test` (52 test).

## File dự kiến thay đổi
- `src/auth/{AuthContext,AuthProvider}.ts(x)`, `src/auth/AuthProvider.test.tsx`, `src/pages/LoginPage.tsx`
