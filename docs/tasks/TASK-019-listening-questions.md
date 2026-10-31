# TASK-019: Câu hỏi Listening (TTS / upload, Dictation)

- **Status:** in-progress
- **Created:** 2026-10-31
- **Branch:** feat/listening
- **BE:** iverb-supabase TASK-034 (PR #40), TASK-035 (`feat/admin-listening`)

## Mục tiêu
Design Oct 31 · Listening questions (`design/README.md`): admin tạo câu hỏi có audio — Text-to-speech (Google Cloud TTS, 4 giọng) hoặc upload file — và loại mới Dictation.

## Phạm vi
**In scope**
- Thẻ loại thứ 5 **Dictation** ("Write what you hear").
- Thẻ **Listening** dưới ô Question: bật/tắt (Dictation luôn bật, Reorder không có), Audio source (Text-to-speech | Upload audio), Voice, file (≤ 5 MB, ≤ 30 s, kiểm ở trình duyệt), Transcript / "Sentence users must write", Play preview / Play file / Stop + dòng meta.
- Lưu: TTS gọi `admin-audio` (dùng lại file nếu voice + transcript không đổi, kể cả file vừa tạo khi bấm Play preview); file chọn mới thì upload. `content.audio_url` + `audio_meta`, key `transcript` / `sentence`.
- Validate: Listening → transcript; Upload → có file; Dictation → ≥ 3 từ. Nháp Dictation cần transcript (TTS) hoặc file.
- App preview: chip "Listening · …", mock player, ô "Type the sentence you hear".
- Nhãn "Listening · {type}" + icon tai nghe ở Schedule, Library, Choose from library, Today, View modal, cảnh báo trùng.
- Bộ lọc loại: **Dictation**, **All listening**.
- View modal: khối audio (nút phát, "Transcript · UK · Female" / "Audio file · name" / "Sentence to write").
- Today: chip dictation "All words right" / "Missed words".

**Out of scope**
- Submissions (user không gửi được câu listening).

## Checklist
- [x] Types + service `audio.ts`.
- [x] `formModel` (state, validate, payload) + test.
- [x] `ListeningCard`, form page, App preview.
- [x] Nhãn / icon / bộ lọc / View modal / Today.
- [x] `yarn build`, `yarn lint`, `yarn test` (73/73).
- [x] Thử trên trình duyệt (Dev): thẻ Listening, Dictation, App preview, cảnh báo trùng, nhãn Library, modal View (phát được audio mẫu). Play preview báo đúng "Text-to-speech is not set up yet" khi thiếu key.
- [ ] Thử TTS thật sau khi có `GOOGLE_TTS_API_KEY`; thử upload file.

## File dự kiến thay đổi
- `src/services/{questions,audio}.ts`, `src/lib/question.ts`, `src/components/{typeIcons.ts,TypeIcon.tsx,Badge.tsx}`, `src/features/question-form/*`, `src/features/library/*`, `src/features/schedule/*`, `src/features/today/*`, `design/*`, `docs/tasks/README.md`

## Notes
- "Play preview" của TTS gọi luôn `admin-audio` (không dùng giọng đọc của trình duyệt như prototype) để nghe đúng file user sẽ nghe.
