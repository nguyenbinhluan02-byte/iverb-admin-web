# TASK-012: Đổi tên hiển thị "Quiz Admin" → "IVerbs Admin"

- **Status:** done
- **Created:** 2026-10-29
- **Branch:** chore/rename-iverbs-admin

## Mục tiêu
Yêu cầu 2026-10-29: tên sản phẩm trên web admin là "IVerbs Admin".

## Phạm vi
**In scope**
- Tiêu đề tab (`index.html`), brand ở Sidebar và trang Login.

**Out of scope**
- Tên file design `design/Quiz Admin.dc.html` và các tài liệu nhắc tới file đó.
- Chữ "Q" trong ô logo và favicon (chờ user quyết).

## Checklist
- [x] Đổi chữ.
- [x] `yarn build`, `yarn lint`, `yarn test`.

## File dự kiến thay đổi
- `index.html`, `src/components/Sidebar.tsx`, `src/pages/LoginPage.tsx`
