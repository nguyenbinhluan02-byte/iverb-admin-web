# Tasks

Mẫu: [`_TEMPLATE.md`](./_TEMPLATE.md). Mỗi task có phần FE (repo này) và BE (`iverb-supabase`) nếu cần; chỉ `done` khi cả hai xong.

| ID | Tiêu đề | BE | Status |
|---|---|---|---|
| [TASK-001](./TASK-001-scaffold-auth-layout.md) | Scaffold, đăng nhập email + password, layout | TASK-015 | done |
| [TASK-002](./TASK-002-library.md) | Library, View, History | TASK-016 | done |
| [TASK-003](./TASK-003-question-form.md) | Form tạo / sửa / reuse câu hỏi | TASK-017 | done |
| [TASK-004](./TASK-004-schedule.md) | Schedule, Choose from library, Reuse calendar | TASK-018 | done |
| [TASK-005](./TASK-005-today.md) | Today (bản đơn giản) | TASK-019 | done |
| TASK-006 | Submissions | | hoãn (2026-10-29) |
| [TASK-007](./TASK-007-firebase-hosting.md) | Deploy production lên Firebase Hosting | | in-progress |
| [TASK-008](./TASK-008-deploy-workflow.md) | GitHub Actions deploy production lên Firebase Hosting | | in-progress |
| [TASK-009](./TASK-009-server-paging.md) | Lọc + phân trang ở server (Library, Choose from library, explanations) | TASK-021 | done |
| [TASK-010](./TASK-010-library-pagination.md) | Library phân trang theo số trang (design mới) | TASK-022 | done |
| [TASK-011](./TASK-011-dropdown-in-modal.md) | Fix: dropdown lọc không mở được trong Choose from library | | done |
| [TASK-012](./TASK-012-rename-iverbs-admin.md) | Đổi tên hiển thị "Quiz Admin" → "IVerbs Admin" | | done |
| [TASK-013](./TASK-013-login-me-error.md) | Fix: đăng nhập im lặng khi `get_me` lỗi, không gọi lại sau khi sửa server | | done |
| [TASK-014](./TASK-014-today-replies.md) | Today: xem / xoá reply dưới user explanation | TASK-027 | done |
| [TASK-015](./TASK-015-schedule-test-date.md) | Fix: test Schedule lỗi theo ngày chạy (chặn deploy) | | done |
| [TASK-016](./TASK-016-avatar-photos.md) | Hiện ảnh đại diện thật (fallback chữ cái) | TASK-028 | done |
| [TASK-017](./TASK-017-today-reports.md) | Today: xử lý report explanation / reply (Dismiss / Delete, filter Reported) | TASK-029 | done |
| [TASK-018](./TASK-018-notifications.md) | Notifications: soạn + gửi push tới mọi user, lịch sử | TASK-032 | done |
| [TASK-019](./TASK-019-listening-questions.md) | Câu hỏi Listening: TTS / upload audio, Dictation, lọc listening | TASK-034, TASK-035 | in-progress |
| [TASK-020](./TASK-020-auto-moderation.md) | Today: bài bị kiểm duyệt tự động ẩn — lọc Auto-hidden, lý do, Approve / Delete | TASK-038 | in-progress |
| [TASK-021](./TASK-021-pick-view-question.md) | Choose from library: nút View xem đủ câu hỏi trước khi chọn | — | done |
| [TASK-022](./TASK-022-users-screen.md) | Users: danh sách tài khoản chỉ đọc (tìm, lọc, tháng tham gia, chi tiết + thống kê) | TASK-039 | done |
| [TASK-023](./TASK-023-users-trial.md) | Users: trạng thái Trial (lọc, pill, hạn dùng thử) | done |
| [TASK-024](./TASK-024-weeks-pages.md) | 3.1.0 sidebar v3, This week (dashboard), Weeks (danh sách tuần), bỏ Publish date ở form câu hỏi | TASK-052, TASK-053 | done |
| [TASK-025](./TASK-025-week-editor-lesson.md) | 3.1.0 week editor — tab Lesson: loại bài, thẻ grammar (8 block), thẻ vocab (ảnh, phát âm TTS / file), xem trước, Save & translate | TASK-052, TASK-054 | done |
| [TASK-026](./TASK-026-week-editor-questions.md) | 3.1.0 week editor — tab Daily questions: 7 ngày, viết / chọn từ library / sửa / gỡ câu, Tests lesson card | TASK-053 | done |
| [TASK-027](./TASK-027-week-editor-languages.md) | 3.1.0 week editor — Languages: trạng thái 24 ngôn ngữ, re-translate, mark reviewed, màn duyệt / sửa bản dịch từng thẻ | TASK-050, TASK-053 | done |
| [TASK-028](./TASK-028-move-week.md) | 3.1.0 chuyển bài sang tuần khác: nút ⇅ ở Weeks, "Move to week…" trong editor, dialog Move / Swap | TASK-055 | done |
