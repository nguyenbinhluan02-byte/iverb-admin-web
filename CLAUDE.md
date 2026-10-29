# CLAUDE.md

## Quy tắc làm việc

### Luôn tạo task trước khi làm
Trước khi viết hoặc sửa code cho bất kỳ yêu cầu nào (feature, bug fix, refactor, upgrade…):

1. Tạo file task mới trong `docs/tasks/` theo mẫu `docs/tasks/_TEMPLATE.md`.
   - Tên file: `TASK-<số 3 chữ số>-<slug-ngắn>.md`, số tăng dần.
   - Ghi rõ: mục tiêu, phạm vi (in / out of scope), checklist, file dự kiến thay đổi.
2. Thêm task vào bảng trong `docs/tasks/README.md`.
3. Trong lúc làm: tick checklist và cập nhật `Status` (`todo` → `in-progress` → `done`).
4. Khi xong: ghi kết quả, việc còn lại / quyết định vào mục `Notes`.

Mỗi task có phần **FE** (repo này) và **BE** (task tương ứng trong `iverb-supabase`, nếu cần). Task chỉ `done` khi cả hai xong.

Ngoại lệ: câu hỏi thuần giải thích hoặc đọc code (không thay đổi file) thì không cần tạo task.

## Dự án
- Web admin cho app iVerbs: Vite + React 19 + TypeScript, Node 22 (`.nvmrc`), yarn. Alias `@/*` → `src/*`.
- Design handoff: `design/README.md` + `design/Quiz Admin.dc.html` (high-fidelity, khớp pixel). Icon dùng `lucide-react`.
- Style: Tailwind CSS v4, token của design khai báo trong `@theme` ở `src/index.css` (`bg-brand`, `text-muted`, `border-line`…). Dùng lại token có sẵn, chỉ thêm token khi chưa có màu tương đương.
- Data: TanStack Query + `@supabase/supabase-js` (`src/lib/supabase.ts`). Chỉ gọi RPC trong schema `api` (`api.admin_*` cho admin, xem `iverb-supabase/docs/solutions/admin-api.md`). Type: `yarn sync:types` → `src/services/database.types.ts`.
- Backend ở repo `iverb-supabase` (clone ở `../iverb-supabase`). Thay đổi schema / RPC làm ở repo backend, không làm ở đây.
- Đăng nhập email + password (Supabase Auth); chỉ `profile.role = 'admin'` (từ `api.get_me`) được vào.
- Form: React Hook Form + Zod. Modal / dropdown: Radix (`radix-ui`). Toast: `sonner`. Ngày: `date-fns`, theo UTC như backend.
- Kiểm tra trước khi tạo PR: `yarn build`, `yarn lint`, `yarn test`.
