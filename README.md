# iverb-admin-web

Web admin cho câu hỏi hằng ngày của app iVerbs (Today, Schedule, Library, Submissions).

## Chạy
```bash
nvm use            # Node 22
yarn
cp .env.example .env.local   # điền URL + anon key của project Supabase (Dev)
yarn dev
```

Scripts: `yarn build`, `yarn lint`, `yarn test`, `yarn format`, `yarn sync:types` (copy type từ `../iverb-supabase`).

## Tài khoản admin
Đăng nhập bằng email + password. Tạo user trên Supabase Dashboard (Authentication → Users → Add user, tick *Auto confirm*), rồi chạy trong SQL editor:

```sql
update private.profiles set role = 'admin', display_name = 'Tên hiển thị'
where id = (select id from auth.users where email = '<email>');
```

## Deploy (production → Firebase Hosting)
Firebase project riêng **`iverbs-admin`** (tách khỏi project `iverbs-400af` của app), site mặc định https://iverbs-admin.web.app. Chỉ có môi trường production.

**GitHub Actions** (cách chính): Actions → **Deploy** → *Run workflow*, chọn branch `release/vX.Y.Z`, gõ lại `vX.Y.Z`.
- Chỉ chạy từ `release/vX.Y.Z`; version không cũ hơn tag `prod-vX.Y.Z` mới nhất và branch phải chứa commit của release đó.
- lint → test → build (`--mode production`) → deploy `hosting:admin` → gắn tag `prod-vX.Y.Z`.
- Đăng nhập Google bằng **Workload Identity Federation** (không có key JSON — org policy chặn tạo key): pool `github`, provider `iverb-admin-web` (chỉ nhận repo này + environment `production`), service account `github-actions-deploy@iverbs-admin.iam.gserviceaccount.com` (role *Firebase Hosting Admin*).
- Cài đặt một lần (Settings → Environments → `production`): variable `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (project production).

Site mặc định có sẵn khi bật Hosting trên Firebase Console, không cần tạo thêm.

**Chạy tay** (dự phòng): tạo `.env.production` (không commit) rồi `yarn deploy` (cần `firebase login`).

Trước khi deploy bản dùng RPC mới: deploy backend (`iverb-supabase`, workflow Deploy) lên production trước.
Không bao giờ đặt `service_role` key vào biến `VITE_*` (bị đóng gói vào JS công khai).

## Tài liệu
- Design: `design/README.md`
- Task: `docs/tasks/`
- Admin API: `iverb-supabase/docs/solutions/admin-api.md`
