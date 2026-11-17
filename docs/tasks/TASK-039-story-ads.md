# TASK-039: App config — quảng cáo trong story câu hỏi

- **Status:** done
- **Created:** 2026-11-17
- **Branch:** feat/task-039-story-ads → `release/v3.2.0`
- **Backend:** iverb-supabase TASK-068 (PR #92)

## Mục tiêu
Trang App config, nhóm Ads:
- "Inside question stories" (`story_native_ad_every`, 0–20, 0 = tắt): card quảng cáo giữa các câu trong story ngày cũ và story câu đã lưu.
- "Banner in past-day story" (`day_story_banner`): công tắc bật / tắt banner, lưu 0 / 1.

## Checklist
- [x] Kiểu field mới `toggle` (switch, lưu 0 / 1)
- [x] Hai field + test
- [x] test / lint / build
- [ ] Chạy thử sau khi #92 lên Dev

## Notes
- Nhánh `release/v3.2.0` tạo từ `release/v3.1.0`.
