# TASK-007: Deploy production lên Firebase Hosting

- **Status:** in-progress
- **Created:** 2026-10-29
- **Branch:** chore/firebase-hosting

## Mục tiêu
Deploy web admin (chỉ môi trường production) lên Firebase Hosting, Firebase project riêng `iverbs-admin` (đổi 2026-10-29, ban đầu là site phụ trong `iverbs-400af`).

## Phạm vi
**In scope**
- `firebase.json` (SPA rewrite, cache: `assets/**` immutable, `index.html` no-cache; `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`), `.firebaserc` (target `admin` → site `iverbs-admin`).
- `yarn deploy`: chặn nếu thiếu `.env.production` → test → build `--mode production` → `firebase deploy --only hosting:admin`.
- `<meta name="robots" content="noindex">`.
- Hướng dẫn trong README.

**Out of scope**
- CI tự deploy, môi trường staging, custom domain.

## Checklist
- [x] Cấu hình Firebase + script deploy.
- [ ] Supabase production có đủ migration (app 3.0 + admin TASK-015 → 019) — cần người có quyền (CLI máy này bị 403).
- [ ] Tài khoản admin trên production.
- [ ] `firebase login` + tạo site `iverbs-admin`.
- [ ] `.env.production` + `yarn deploy` + kiểm tra đăng nhập trên URL thật.

## File dự kiến thay đổi
- `firebase.json`, `.firebaserc`, `package.json`, `index.html`, `.gitignore`, `README.md`

## Notes
- Thiếu `.env.production` thì Vite dùng `.env.local` (Dev) → script chặn trước.
- Anon key nằm trong JS là bình thường (public); bảo mật dựa vào `require_admin()` ở RPC. Không dùng `service_role` ở web.
- Email sign-up trên Supabase đang mở: ai cũng tạo được tài khoản email nhưng không vào được admin (role `user`). Không tắt "Allow new users to sign up" vì sẽ chặn cả user mới của app (Google / Apple).
