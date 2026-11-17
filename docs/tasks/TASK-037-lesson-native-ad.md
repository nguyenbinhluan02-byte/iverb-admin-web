# TASK-037: App config — card quảng cáo trong bài học

- **Status:** done
- **Created:** 2026-11-17
- **Branch:** feat/task-037-lesson-native-ad → `release/v3.1.0`
- **Backend:** iverb-supabase TASK-065 (PR #89)

## Mục tiêu
Trang App config chỉnh được `lesson_native_ad_every`: sau mỗi N thẻ bài học có 1 card quảng cáo Native (0 = tắt).

## Phạm vi
**In scope**
- Nhóm "Full-screen ads" đổi thành "Ads"; thêm ô "Inside lessons" (0–20, đơn vị card).

## Checklist
- [x] Model + type + test
- [x] test / lint / build
- [ ] Chạy thử sau khi #89 lên Dev
