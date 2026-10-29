# TASK-008: GitHub Actions deploy production lên Firebase Hosting

- **Status:** in-progress
- **Created:** 2026-10-29
- **Branch:** ci/deploy-workflow

## Mục tiêu
Deploy web admin bằng GitHub Actions thay cho `yarn deploy` ở máy local. Chỉ có production (yêu cầu 2026-10-29: không cần bản dev).

## Phạm vi
**In scope**
- Workflow `Deploy` (`workflow_dispatch`, input `confirm_version`), cùng luật với backend (`iverb-supabase` TASK-020): chỉ `release/vX.Y.Z`, gõ lại đúng version, không cũ hơn tag `prod-v*` mới nhất, branch chứa commit của release đó.
- lint → test → build `--mode production` (biến `VITE_*` từ GitHub Environment `production`) → `google-github-actions/auth` (WIF) → `firebase deploy --only hosting:admin` → tag `prod-vX.Y.Z`.
- `.github/scripts/check-release.sh` (copy từ backend).
- README.

**Out of scope**
- Bản dev / preview channel cho PR, custom domain.

## Checklist
- [x] Workflow + script.
- [x] Kiểm tra build lấy `VITE_*` từ biến môi trường (thắng `.env.local`).
- [x] Firebase project riêng `iverbs-admin` (quyết định 2026-10-29, thay cho site phụ trong `iverbs-400af`), service account `id-github-actions-deploy`.
- [ ] Workload Identity Federation (org policy chặn tạo key JSON, 2026-10-29): pool `github`, provider `iverb-admin-web`, quyền `workloadIdentityUser` cho `github-actions-deploy`. Không dùng secret `FIREBASE_SERVICE_ACCOUNT`.
- [ ] User: variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (project prod `gomejworljhapbfyorfj`).
- [ ] User: tài khoản admin trên Supabase production.
- [ ] Chạy deploy đầu tiên.

## File dự kiến thay đổi
- `.github/workflows/deploy.yml`, `.github/scripts/check-release.sh` (mới), `README.md`

## Notes
- Anon key là public (nằm trong JS), để ở variable cho dễ xem; service account JSON là secret.
- Version của web admin độc lập với backend (tag `prod-v*` riêng của từng repo).
- Thay cho phần "firebase login + yarn deploy" của TASK-007 (vẫn giữ làm dự phòng).
