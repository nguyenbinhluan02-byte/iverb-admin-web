# Quiz Admin v3: changes since v1

Design files: `Quiz Admin v3.dc.html`, which embeds `Weekly Lessons.dc.html`. Open v3 in a browser to try it.
v1 = `Quiz Admin.dc.html`; its handoff is in `design_handoff_quiz_admin/`.

The screens **Today, Library, Submissions, Users and Add/Edit question** are the same as v1, except for one change to Add/Edit (§1.3). Everything new is the **weekly lesson** model: one lesson per week, plus 7 daily questions tied to that lesson.

---

## 1. Navigation and the old Schedule

1. Sidebar subtitle: "English daily quiz" → **"Weekly lessons"**.
2. The **Schedule** item is replaced by 2 items, placed after Today, with a divider below them:
   - **This week** (book icon), route `week`
   - **Weeks** (calendar icon), route `weeks`. Orange badge = number of upcoming weeks that are not ready yet (status Empty or Draft).
3. **Add/Edit question** (the standalone screen): the **"Publish date"** block (14-day date picker plus the "This day already has a question…" warning) is removed. Daily questions are now assigned inside the week editor (§4).
4. Default route when the admin opens the app: `week`.

---

## 2. This week (dashboard for the live week)

- Header: eyebrow "Live · Day N of 7", H1 = date range (e.g. "Nov 2 – 8"), subtitle "{Grammar|Vocabulary} · {title}", **"Edit this week"** button.
- 4 stat cards: **Finished the lesson** (users), **Answers this week**, **Average correct**, **Next week needing work** (date range + link "Plan week / Edit →", which opens the editor for that week).
- **Lesson drop-off**: one row per card: card number, label, heading, number of users who reached that card, plus a bar.
- **Daily questions**: 7 rows (day, date, question, "Correct x / total", % correct). The % is orange if under 60%, green otherwise. Today's row shows "Today · still open". There is an **"Edit questions"** link.
- **Coming up**: the next 3 weeks: range, "{type} · {title}" or "No lesson yet", "{n} words/cards · {q}/7 questions", status badge, action button. There is an **"All weeks"** link.

## 3. Weeks (list)

- H1 "Weeks". Sub: "One lesson per week, starting Monday · 7 daily questions tied to it". **"Add week"** button (adds the next week after the last one, status Empty).
- Table columns: **Week** (range + relative label: 2 weeks ago / Last week / This week / Next week / In N weeks) · **Lesson** (Grammar or Vocabulary badge + title) · **Content** (n cards / n words) · **Questions** (7 dots, green = has a question, plus "q/7") · **Status** · action button.
- The live week's row has background `#FFFAF6`.
- Week status:

| Status | Rule | Badge |
|---|---|---|
| Ended | the week is over | bg `#F2F2F3`, text `#6E6E73` |
| Live | the current week | bg `#F2711C`, text white |
| Empty | no title, no content, no questions | bg `rgba(245,51,63,.1)`, text `#D42A35` |
| Scheduled | has a title, at least 1 card, and 7/7 questions | bg `rgba(31,169,113,.14)`, text `#138A5B` |
| Draft | anything else | bg `#FFF4EC`, text `#B4500F` |

- Action: Empty → "Plan week", Ended → "View", otherwise → "Edit".
- **Move button** (icon ⇅, tooltip "Move to another week") left of the action button, only on future weeks that aren't Empty. The last grid column is now 150px. Opens the Move dialog (§3.1).

### 3.1 Move lesson to another week
Opened from the Weeks list or from the editor header ("Move to week…").
- Title "Move lesson to another week". Sub: "{type} · {title} · now {range}. The lesson, its 7 daily questions, translations and pronunciation move together."
- Lists every **future** week except the current one (range, "{type} · {title}" or "No lesson yet", status badge). Pick one (radio).
- Target Empty → button **"Move lesson"**. Target has a lesson → orange notice "{range} already has "{title}". The two weeks will swap…", button **"Swap weeks"**. No target → disabled "Choose a week".
- Footer note: "Live and ended weeks can't be moved." They are neither source nor target (they have user answers/stats).
- **What moves**: lesson type, title, cards/words, translations (all locales + review status), pronunciation/images, and each day's question by weekday position (Mon→Mon…). **What stays** with the week: date range, day names/dates, answer stats.
- Backend: one transaction `admin-move-lesson({ from_week_id, to_week_id })`; swap if the target isn't empty. No re-translation needed. Recompute both weeks' status.
- After: toast "Moved to {range}" / "Swapped {range A} and {range B}". If done from the editor, the editor follows the lesson to its new week.

## 4. Week editor

**Header**: breadcrumb "Weeks", H1 = range, status badge, 2 checks ("Lesson ready/incomplete", "q/7 questions"; green if OK, orange if not), **"Move to week…"** (future, non-Empty weeks only; opens §3.1), **"Save & translate"** button.
**Notice**: Live → "This week is live. Changes reach users right away." · Ended → "This week has ended. Users can still review it in the Last week tab."
**2 tabs**: "Lesson · {n cards/words}" and "Daily questions · {q}/7".

### 4.1 Lesson tab
- **Lesson type**: 2 radio options, **Grammar** ("Cards built from blocks") and **Vocabulary by topic** ("Word flashcards"). Each option is max 260px wide (min 220px), aligned left: `grid-template-columns: repeat(auto-fill, minmax(min(100%,220px), 260px))`.
- **Topic name** ("shown on the lesson card, max 2 lines"), **Cover image** (optional, 220×110).
- **Languages**: see §5.
- **Card list** (left): number, label, sub-text, and a translation badge when a language is selected. "Add card/word". Recommended 5–8. A card can be moved up/down or deleted (its translations move or are deleted with it).
- **Phone preview** (right, 320px, sticky, can be turned off with the `showPreview` prop): shows the current card in the chosen language, a progress bar, and Back / Next·Got it / Finish buttons.

**Grammar card**
- Card label chips: Overview, Structure, Rule, Signal words, Common mistake, Summary. In the preview, "Common mistake" shows in red.
- Heading.
- Blocks (move up/down, delete). Block types:
  - **Text**, **Tip**: free text.
  - **Formula**: rows of label + parts joined by "+". The first part is the subject; "…" shows as a muted ending.
  - **Examples**: sentence (wrap key words in `*stars*`), tag, translation.
  - **Compare**: 2 columns, each with a title, lines, and a color (orange/green).
  - **Signal words**: groups of a title + words.
  - **Common mistake**: Wrong / Right / Why (optional).
  - **Quick check**: question, options, If right / If wrong. Not graded.
- More than 3 blocks → warning "This card has more than 3 blocks. Consider splitting it…".

**Vocabulary card**
- Word, IPA, Meaning (English).
- **Part of speech**: pick **one** of noun | verb | adjective | adverb | phrase (default noun). A word with several parts of speech (e.g. "book" noun/verb) is added as separate cards. No multi-select.
- Example: wrap the word in `*stars*` to highlight it.
- **Image** (optional, landscape 16:10, at least 800×500): drop/upload area 240px wide, radius 10, "Drop or click to add". Each word has its own image, shown at the top of the flashcard. Hint: "Shown at the top of the flashcard."
- **Pronunciation**: 2 sources, chosen with a segmented control on the right of the label: **Generate** (default) / **Upload file**.
  - **Upload file**: dashed upload area, "Choose an audio file" / filename, "MP3, M4A or WAV · up to 5 seconds", a **Browse/Replace** button, and **Play** once a file is chosen. Label: "Pronunciation · your recording replaces the generated audio". An uploaded file is never overwritten by TTS. Changing the Word does not delete the file. Switching back to Generate uses TTS but keeps the file, so it can be selected again.
  - Upload goes through `admin-lesson-media` (upload); store the URL on the word with `audio_source: 'file'`.
- **Generate** (TTS), "generated from the word when you save":
  - One row: **Play** button, **voice** chips (US · Female (default) / US · Male / UK · Female / UK · Male, one voice per word), and an audio status badge.
  - Badge: **No word yet** (Word is empty) · **Generates on save** (new word, or the Word or voice changed since the last save; gray) · **Ready** (audio is generated and current; green).
  - On save: for each word whose audio is not "Ready", call TTS (`admin-lesson-media`) with `{ text: word, voice }`, store the audio URL on the word, then set the badge to Ready. Editing IPA, Meaning or Example does **not** regenerate audio.
  - In the design, Play uses the browser's speech engine as a stand-in. In production it should play the generated file, or call TTS on the fly if the word has not been saved yet.
- ⚠️ Bug found in the design: the word form's state and the question-view modal's state shared one name, so the Part of speech buttons disappeared and the inputs didn't take what you typed. **Keep the two states separate.**

### 4.2 Daily questions tab
- Left: list of 7 days (day, date, type, question; green dot if it has a question).
- A day with no question: "No question for {day}" + **"Write question"** / **"Choose from library"**.
- Question editor (same as v1's Add/Edit, but inside the week):
  - 5 types: Single choice, Multiple choice, Fill in, Reorder, Dictation.
  - **Listening** toggle for Single/Multiple/Fill in. Dictation always has audio; Reorder can't have audio. Audio source: TTS (choose a voice, transcript) or file upload (MP3/M4A/WAV, ≤ 30s). "Play preview" button.
  - Options: 2–6. Multiple choice needs at least 2 correct options. Fill in: the sentence must contain `___`, plus answer, accepted alternatives and an optional hint. Reorder: the correct sentence (shown to users as shuffled tiles).
  - Explanation (shown after answering).
  - **Tests lesson card** (optional): links the question to one lesson card, to help spot weak cards.
  - "Shown as author" (default "Irregular Verbs team").
  - "Remove question" is only allowed while the question has 0 answers.
  - Preview: "App preview · after answering".
- **Choose from library** (modal): Status/type filters, search, list of past questions (user-submitted badge, stats), **"View"** (detail, then "Select this question"), **"Edit first"** / **"Schedule"**.

---

## 5. Translations (per language, translate automatically on save)

### Backend contract
- `admin-translate({ lesson_id })` translates **every** locale in one call. Admin does not pick a language to translate.
- It only translates locales that are **missing** or **outdated** (the English changed after translation). Up-to-date locales are skipped.
- `locales: ["vi"]`: only those locales. `force: true`: re-translate machine translations even if they are fresh.
- A translation the admin **reviewed or edited is never overwritten**, even with `force`. It only goes back to machine-translated when the English changes.
- Users see the machine translation until it is reviewed.
- Status is tracked per (lesson, locale, card). When an admin edits the English of a card, every translation of that card becomes `outdated`.

### UI
- **"Save & translate"**: saves, then calls `admin-translate({ lesson_id })`. No separate button. Toast "Saved…", then "Translations updated · review them in Languages".
- **Languages card**: description "Write in English. Saving translates every language that's missing or outdated. Users see machine translations until you review them."
- "Tiếng Anh · Source" button plus a language dropdown (search box, tabs All / Needs review / Reviewed). Each row shows a dot and a status:

| State | Label | Dot | Rule |
|---|---|---|---|
| missing | Not translated | `#C9C9CE` | every card has no translation |
| old | N outdated | `#F5333F` | at least 1 card is outdated or missing |
| review | Machine · N to review | `#F2A76B` | fully translated, some cards not reviewed |
| ok | Reviewed | `#1FA971` | every card is reviewed |
| busy | Translating… | `#C9C9CE` | a call is running |

  Sort order: missing → old → review → busy → ok. "Needs review" = missing + old + review.
- Summary chips: "N reviewed / N to review / N outdated / N not translated". Hide chips with a count of 0. Clicking a chip opens the dropdown with that filter.
- **Opening a language does NOT call translate.**
- When a language is selected:
  - **"Re-translate {Language}"** → `admin-translate({ lesson_id, locales: [loc], force: true })`. Reviewed cards are kept. If every card is reviewed, show the toast "All {Language} cards are reviewed · nothing to re-translate".
  - **"Mark all {Language} reviewed"**: only shown when a machine-translated card exists.
  - Put each button label in its own `<span>` so the icon and text keep the correct gap.
- **Review screen for one card**: status badge (Machine / Reviewed / Outdated / Not translated / Translating…). There is **no** per-card re-translate.
  - Outdated: red banner "The English card changed after this was translated. Save to re-translate, or update it here."
  - Not translated: "Not translated yet" + **"Translate {Language}"** button.
  - Each field shows the English above a textarea. Editing a field marks the card **Reviewed**. A "Mark reviewed" toggle is also available.
  - Locked fields (the word, example sentences, formulas, signal words, quick-check question) stay in English: "Locked parts stay in English. They're what users are learning."
  - Translatable fields: card label, heading, text/tip, example translations, compare titles, mistake "Why", quick-check "If right/If wrong". For vocab: Meaning and the example translation.


## App config (new page)
Sidebar: new item **"App config"** below Users, after a divider. An orange dot shows when there are unsaved changes. The page edits the `app_config` table (key text, value jsonb) and has no new keys.

Header: kicker "Applies to all users on next app launch". Buttons: **Discard** (only when edited) and a primary button that reads "Saved" / "Save N changes" / "Fix errors to save". Save writes every changed key in one call, then shows the toast "App config saved". Edited rows get a light orange background and the badge "Edited · was {old}".

| Group | Key | Control | Rule / helper |
|---|---|---|---|
| Full-screen ads | `lesson_interstitial_every` | stepper 0–20, "lesson(s)" | 0 = off. Note: "Ad after every lesson" / "every 3rd lesson" |
| Full-screen ads | `verb_detail_interstitial_every` | stepper 0–50, "verb(s)" | 0 = off |
| Free trial & preview | `answer_trial_days` | stepper 0–365, "day(s)" | "Ends N days after sign-up". 0 = "No trial" |
| Free trial & preview | `lesson_preview_cards` | stepper 0–20, "card(s)" | "First N cards free". 0 = "Lessons fully locked" |
| App versions | `latest_version` | text, monospace | semver `x.y.z` → optional update prompt |
| App versions | `min_supported_version` | text, monospace | semver, must be ≤ latest → force update |
| Legal links | `privacy_url`, `terms_url` | text + open-link button | must start with `https://` |

The ads group subtitle says premium users never see interstitials. **Assumption to confirm:** 0 means off. Number values are saved as JSON numbers; versions and URLs are saved as JSON strings.
