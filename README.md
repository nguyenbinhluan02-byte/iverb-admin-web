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
Site `iverbs-admin` trong Firebase project `iverbs-400af` (cùng project với app). Chỉ có môi trường prod.

Lần đầu:
```bash
npx -y firebase-tools@14 login                                   # tài khoản có quyền iverbs-400af
npx -y firebase-tools@14 hosting:sites:create iverbs-admin --project iverbs-400af
```

Mỗi lần deploy:
```bash
# .env.production (không commit): URL + anon key của Supabase production
yarn deploy        # test → build --mode production → firebase deploy --only hosting:admin
```

Trước khi deploy bản có RPC mới: `supabase db push` lên **production** ở repo `iverb-supabase` trước.
Không bao giờ đặt `service_role` key vào biến `VITE_*` (bị đóng gói vào JS công khai).

## Tài liệu
- Design: `design/README.md`
- Task: `docs/tasks/`
- Admin API: `iverb-supabase/docs/solutions/admin-api.md`
