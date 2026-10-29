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

## Tài liệu
- Design: `design/README.md`
- Task: `docs/tasks/`
- Admin API: `iverb-supabase/docs/solutions/admin-api.md`
