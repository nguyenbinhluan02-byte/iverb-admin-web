# TASK-018: Notifications — soạn và gửi push tới mọi user, xem lịch sử

- **Status:** done
- **Created:** 2026-10-30
- **Branch:** feat/notifications
- **BE:** `iverb-supabase` TASK-032 (branch `feat/push-notifications`, chưa merge)

## Mục tiêu
Admin gửi push notification thủ công tới mọi user app (hiện tại Android), chốt với user 2026-10-30. Trang mới "Notifications": soạn + gửi (có xác nhận) và xem lịch sử push đã gửi.

## Phạm vi
**In scope**
- Route `/notifications` + mục sidebar "Notifications" (icon `Bell`, cuối danh sách).
- Card soạn: Title (≤ 100) + Message (≤ 300) có bộ đếm ký tự, preview thông báo trên điện thoại ("Irregular Verbs"), nút "Send to all users".
- Modal xác nhận (dùng `Modal` có sẵn): hiện title / body, "This will be sent to all app users (Android). It can't be undone."
- Gửi qua Edge Function `admin-push`; toast thành công / lỗi theo mã lỗi; xoá form, làm mới lịch sử.
- Card lịch sử: `admin_list_pushes` (50 mới nhất), badge trạng thái sent / failed / sending, lỗi khi failed, thời gian, người gửi; empty state.
- Ghi chú nhỏ: chỉ tới máy Android chưa tắt "News & announcements".
- Test.

**Out of scope**
- Hẹn giờ gửi, gửi theo nhóm user, iOS, thay đổi backend.

## Checklist
- [x] Sync type từ branch BE `feat/push-notifications`.
- [x] Service `src/services/pushes.ts` (`usePushes`, `useSendPush`, đọc mã lỗi từ body của `FunctionsHttpError`).
- [x] Trang Notifications: form (RHF + Zod), bộ đếm, preview, modal xác nhận, lịch sử.
- [x] Route + sidebar.
- [x] Test (validation / bộ đếm, xác nhận rồi gửi giá trị đã trim, map lỗi → toast, lịch sử theo trạng thái, empty).
- [x] `yarn build`, `yarn lint`, `yarn test`.

## File dự kiến thay đổi
- `src/services/pushes.ts`, `src/services/database.types.ts`
- `src/features/notifications/NotificationsPage.tsx`, `NotificationsPage.test.tsx`, `notificationsModel.ts`
- `src/App.tsx`, `src/components/Sidebar.tsx`
- `docs/tasks/README.md`

## Notes
- Không có design: dựng theo card / field / button / badge của Today và form câu hỏi. Kicker "To app users", hai card cạnh nhau (soạn | "Sent").
- Type sync bằng `cp ../iverb-supabase/types/database.types.ts` từ working copy branch `feat/push-notifications` (BE chưa merge vào main).
- Bộ đếm tính theo giá trị đã trim (giống giới hạn của Edge Function); vượt giới hạn → số đỏ, nút Send bị tắt. Không đặt `maxLength` để dán text dài vẫn thấy được bị vượt bao nhiêu.
- Lỗi Edge Function: supabase-js trả `FunctionsHttpError` với `context` là `Response` → đọc `{ error }` ra `PushError(code)`; `notificationsModel.pushErrorMessage` map sang câu dễ hiểu (mã lạ → "Could not send. Try again.").
- Lịch sử được làm mới cả khi gửi lỗi (BE cũng ghi lại push failed). Lỗi của push failed hiện dưới item và khi hover badge. Thời gian: "x ago", hover xem giờ UTC.
- Modal xác nhận không đóng được khi đang gửi; lỗi thì giữ modal để thử lại.
- `yarn lint`, `yarn build`, `yarn test` (68/68) ok.
- Chưa thử gửi FCM thật, chưa xem trên trình duyệt với dữ liệu thật.
