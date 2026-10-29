# Handoff: Quiz Admin (Daily English Quiz – content admin web app)

## Overview
Desktop web admin for the "Irregular verbs / Daily Quiz" mobile app. Content admins use it to:
- monitor today's live question and moderate user explanations (reply, delete, handle reports),
- plan the daily question calendar (Schedule),
- browse/reuse every question ever created (Library),
- create/edit questions (4 types),
- review questions submitted by app users (Submissions).

The companion mobile app handoff is in `../design_handoff_quiz_app/`.

## About the Design Files
`Quiz Admin.dc.html` is a **design reference built in HTML** – a working prototype showing intended look and behavior, not production code. Recreate it in the target codebase's environment (React/Vue/etc.) with its own patterns, component library, routing and data layer. If no environment exists yet, a React + TypeScript SPA (e.g. Vite + React Router + TanStack Query) is a good fit.

Open the file directly in a browser to click through it (it needs `support.js` next to it). All data is mock and in-memory; nothing persists on reload.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii and copy are final. Recreate pixel-accurately; swap SVG icons for the codebase's icon set (Lucide matches 1:1 – all icons are Lucide-style 24px stroke icons).

---

## Global layout
- Page bg `#F2F2F3`, font **Manrope** (400–800, Google Fonts), text `#17171A`.
- **Sidebar** (left, sticky, 100vh): width 228px, white, right border `1px #ECECEE`, padding 22px 14px.
  - Brand: 32×32 orange (`#F2711C`) rounded-9 tile with "Q", "Quiz Admin" (15/800) + "English daily quiz" (12, `#6E6E73`).
  - Nav (gap 4, margin-top 30): Today · Schedule · Library · New question · Submissions. Item: padding 10px 12px, radius 10, 14/700, 18px icon. Active = bg `#FFF4EC` / text `#C25A14` (inactive transparent / `#17171A`).
  - Badges (22×20 pill, 11/800): Today = # reported explanations (orange filled); Schedule = # empty days in next 14 (grey `#F2F2F3`, border `#E4E4E7`); Submissions = # pending (orange).
  - Footer: current admin avatar + name + "Content admin".
- **Main**: padding 30px 32px 64px; content `max-width` 1040 (Schedule, Library) / 1180 (Form) / 1240 (Today, Submissions), centered.
- **Page header** pattern: kicker (12/800, uppercase, letter-spacing .06em, `#6E6E73`) + H1 (28/800, -0.01em). Primary action right-aligned.

## Screens

### 1. Today
- Header: kicker "● Live now" (orange), H1 "Today · Tue, Oct 27"; right: "Closes in 9h 12m" + "Edit question" (secondary button).
- 4 stat cards (auto-fit grid, min 130px): Answers, Correct rate, User explanations (count + "N replied"), **Next empty day** (orange tinted card `#FFF4EC`/border `#FBDCC6`) with link "Add question · N empty in 14 days →" (opens form on first gap) or "View schedule →".
- Two columns (auto-fit, min 380px):
  - **Question card**: type badge, author, question, per-option bar (count, %, correct option green `#1FA971`, others grey), "Official explanation" box (`#F2F2F3`).
  - **User explanations**: segmented filter All / Replied / Reported (with counts). Each item: avatar (36, color from name hash), name, "Picked X" badge (green if correct, red if wrong), time, text, **vote count** (up-arrow icon, same as app), Reply, Delete.
    - Reported item: red box "Reported N times · reason" + Dismiss / Delete.
    - Replies nested; admin replies have orange "Admin" chip and `#FFF4EC` bubble.
    - Reply composer: textarea + Cancel / Send reply (disabled until text).
    - Delete → confirm modal.

### 2. Schedule
- Header: kicker ("Next 14 days" or "Oct 2026 · 31 days"), H1 "Schedule", right: primary **New question**.
- Second row: segmented **Next 14 days | Month** (default Next 14 days). In Month mode a month stepper appears (‹ "October 2026" ›).
- Coverage card: legend counts (scheduled / draft / empty – future days only) + a bar of N equal cells (14 or days-in-month): scheduled `#F2711C`, draft `#F9C29C`, empty `#E4E4E7`, today `#17171A`, past with question `#C9C9CE`, past empty `#F2F2F3`.
- Day list (white card, rows divided by `#ECECEE`): grid `60px | 1fr | auto`, padding 14px 20px.
  - Left: weekday / day number (22/800) / month.
  - Middle (has question): type badge, status badge (Scheduled green / Draft grey / Live today orange / Published grey), "User submitted" badge (blue `#3F4FC9` on `rgba(91,108,240,.12)`) if from a user, question text (1 line ellipsis), author with 18px avatar.
  - Middle (empty): dashed box "No question scheduled — users will see an empty day." (past: "No question was shown this day.")
  - Right actions: **View** (all days with question), **Edit** (future/today only); empty future days: **Add question** (orange tint, + icon) then **From library** (white, book icon).
  - Today row bg `#FFF8F2`; past rows opacity .6, not editable.

### 3. Library
- Header: kicker "N questions", H1 "Library".
- Search field (white, 12 radius): matches text, sentence, answer, author, option text.
- **Filter row** – custom dropdowns (see Components → Dropdown): Status (All / Published / Not published / Upcoming / Drafts, with counts), Added by (Anyone / Admins / Users, with counts), Type (All / Single choice / Multiple choice / Fill in the blank / Reorder words), Sort (Newest date first / Oldest date first). Filters combine (AND); status counts respect the Added-by filter.
  - "Not published" = Upcoming + Drafts (not live).
- Rows: grid `1fr | auto`. Badges (type, status, User submitted), text, author avatar. Actions: **View**, **History · N** (N = times used), then **Reuse** (published) or **Edit** (not published).
- No date column (removed intentionally – usage dates live in History).
- **Pagination** (below the list card, row `space-between`, gap 12, wraps): left "Showing 1–8 of N" (13/600 `#6E6E73`); right: ‹ prev, page numbers, › next (gap 6).
  - Page size **8**. Buttons 34×34 (numbers min-width 34, padding 0 8), radius 9, border `1px #E4E4E7`, white, 13/700. Active page = bg/border `#17171A`, text white.
  - Shows first, last, current ±1; gaps collapse to "…" (`#8E8E93`). Prev/next disabled at the ends (icon `#C7C7CC`).
  - Page resets to 1 when search, Status, Added by, Type or Sort changes; page is clamped if results shrink. Hidden when there are no results.
  - API: `GET /questions?…&page&pageSize=8` → `{ items, total }`.

### 4. New / Edit question (form)
- Header kicker: "Add to schedule" / "Editing · …" / "Reusing · …" / "Reviewing submission"; H1 accordingly.
- Left card (form) + right sticky **App preview** (360px) that mirrors the mobile card live.
- Fields: Question type cards (Single / Multiple / Fill in the blank / Reorder words, with description), Question textarea, then by type:
  - Single/Multi: 2–6 options, mark correct (radio vs checkbox shape), add/remove.
  - Fill: sentence with `___` (validation "Add ___ where the blank should go."), correct answer, optional hint.
  - Order: correct sentence (words shuffled for users), word count.
- Duplicate check: orange box "Similar questions already exist" listing matches with "% match" (token overlap ≥ 60%, top 3).
- Explanation (shown after answering), Publish date chips (next 14 days, 7-col grid, dot = taken; warning "This day already has a question — scheduling will replace it."), Shown as author.
- Footer: Cancel · Save draft (needs text) · **Schedule** / "Approve & schedule" (needs valid form).

### 5. Submissions
- Segmented Pending / Approved / Rejected (counts). Master list (left, max 420px) + detail (right).
- Detail: submitter avatar, "Submitted … · history", status pill, question rendering per type, duplicate warning or "No similar questions in the library", submitter's explanation.
- Pending: publish-date chips + Reject (red outline) · Edit before approving · **Approve & schedule**.
- Reject modal: reason chips (Wrong answer, Duplicate question, Unclear wording, Too easy / too hard, Not appropriate) + optional note; submitter is notified.
- Approved / Rejected states show a result banner.

## Modals (all: overlay `rgba(23,23,26,.45)`, card white radius 18, shadow `0 24px 60px rgba(0,0,0,.25)`, click overlay or × to close)

### Choose from library (Schedule → empty day → From library) – max-width 640
- Header: "For tomorrow · Wed, Oct 28" kicker, title "Choose from library", ×.
- Search (grey field 40px) + dropdowns: **Status** (All / Published / Not published, with counts), **Added by**, **Type**, **Sort** (Shown longest ago – default / Shown most recently).
- Pool: published questions + drafts from other days + pending user submissions. Published listed first.
- Row = selectable radio card (selected: orange border, `#FFF8F2`). Meta: type badge with icon, "User submitted" badge, and "Shown Mon, Oct 12" / "Draft · on Fri, Nov 6 (will move)" / "Pending review · from Tuan Nguyen".
- Footer: "N questions" · **Edit first** · **Schedule** (disabled until a row is picked).
  - Schedule: published → copied to the day; draft → moved to the day; submission → approved & scheduled. Toast "Scheduled for …".
  - Edit first → opens the form pre-filled for that day.

### Reuse calendar (Library → Reuse, or View → Reuse) – max-width 440
- Question text on top, month stepper (cannot go before current month), Mon-first 7-col grid, cells 46px high.
- Cell states: **empty future** = white, dashed `#C9C9CE` border, bold, clickable; **has question** = `#F5F5F6`, grey text, dot orange (scheduled) / light orange (draft), not clickable, tooltip shows the existing question; **past/today** = `#FAFAFA`, faded, not clickable; **selected** = orange fill, white text.
- Legend: Empty · Scheduled · Draft · Past. Footer: "Schedule for …" · Cancel · **Schedule** → saves directly (no form).

### View question (Library & Schedule → View) – max-width 520
- Badges (type w/ icon, status, User submitted), question (18/800), then per type: options with correct ones green-bordered + "✓ Correct"; fill sentence with answer highlighted green + hint; order = word tiles in correct order. Explanation box (`#FFF8F2`), author.
- Footer: **History · N**, **Edit** (not published) or **Reuse** (published → reuse calendar).

### Usage history (Library → History / View → History) – max-width 480
- Question text + summary "Shown N times · first used Mar 2024".
- Grouped **by year** (newest first), sticky year header with "N times". Each entry: colored dot, "Mon, Oct 12", status pill (Shown / Live today / Scheduled / Draft).
- A question's identity for history = same text + sentence + option texts (reused copies share one history). Empty state: "This question hasn't been used yet."
- In the prototype, 2024–2025 entries are mock data.

### Others
Delete confirm (explanations/replies), Reject submission (see above). Toast: dark pill bottom-center, green check, auto-hides after 2.4s.

## Components

**Dropdown (filter)** – trigger: height 34, radius 9, border `#E4E4E7` (open: `#17171A`), 15px icon + label (13/600 `#6E6E73`) + value (13/800) + chevron. Menu: absolute, top +6px, min-width 230, padding 6, radius 12, border `#ECECEE`, shadow `0 14px 36px rgba(23,23,26,.14)`. Option: 28×28 icon tile (tinted per meaning) + label (14, 600; selected 800 on `#FFF8F2`) + count (12/700 `#8E8E93`) + orange check when selected. Click outside closes.
Option icons: All=layers, Published=check-circle (green tile), Not published=eye-off, Upcoming=calendar (orange tile), Drafts=pencil, Anyone=users, Admins=shield, Users=user (blue tile), Single=radio, Multi=check-square, Fill=type, Order=arrows-up-down, sort=arrow-down/up, history/clock.

**Buttons** – Primary: `#F2711C` bg, white, 14/800, padding 11px 18px, radius 11. Secondary: white, border `#E4E4E7`, 14/700. Row actions: padding 8px 12–14px, radius 9, 13/700–800, 14px icon, gap 6. Tint action: bg `rgba(242,113,28,.12)`, text `#C25A14`. Disabled: bg `#E4E4E7`, text `#8E8E93`.

**Badges/pills** – padding 3px 9px, radius 999, 11/800. Type `rgba(242,113,28,.1)`/`#C25A14`; Scheduled `rgba(31,169,113,.12)`/`#137A51`; Draft & Published `#F2F2F3`/`#6E6E73`; Live `rgba(242,113,28,.12)`/`#C25A14`; User submitted `rgba(91,108,240,.12)`/`#3F4FC9`; Pending `#FFF4EC`/`#B4500F`; Rejected `rgba(245,51,63,.1)`/`#C21D29`.

**Segmented control** – track `#E9E9EB` radius 10 padding 4; item 13/700 padding 7px 14px radius 7; active white + shadow `0 1px 2px rgba(0,0,0,.08)`.

**Avatar** – circle, initials (first letters of first 2 words), white 800 text, bg from name hash over palette `#F2711C #1FA971 #5B6CF0 #D64F9A #0E9FB5 #8A5CF6 #C98A00 #4B5563`. Sizes 18 / 22 / 24 / 28 / 34 / 36 / 42.

**Cards** – white, border `1px #ECECEE`, radius 16–18.

## State & data

```ts
type QType = 'single' | 'multi' | 'fill' | 'order';
interface Question {
  id: string;
  type: QType;
  text: string;
  options?: { text: string; correct: boolean }[]; // single/multi, 2–6
  sentence?: string;  // fill: contains "___"; order: correct sentence
  answer?: string;    // fill
  hint?: string;      // fill, optional
  explanation?: string;
  author: string;           // display name shown in app
  community?: boolean;      // came from a user submission
}
interface ScheduleEntry { date: string /*YYYY-MM-DD*/; questionId: string; status: 'scheduled' | 'draft'; }
interface Submission extends Omit<Question,'id'|'author'> { id: string; name: string; submittedAt: string; history: string; status: 'pending'|'approved'|'rejected'; day?: string; reason?: string; note?: string; }
interface Explanation { id: string; name: string; pick: string; ok: boolean; time: string; votes: number; text: string; reports?: number; reason?: string; replies: Reply[]; }
```
Derived status: date < today → Published, = today → Live, > today → Scheduled/Draft.
Usage history = all ScheduleEntries for the same question (or questions with identical content).

UI state needed: current view, schedule mode (`next` | `month`) + month offset, library filters (query, status, source, type, sort) + library page, open dropdown id, modals (`pick` {day, query, status, source, type, sort, selected}, `reuse` {question, monthOffset, selectedDay}, `view` question, `history` question, reject, delete confirm), form draft, toast.

Suggested endpoints: `GET /schedule?from&to`, `PUT /schedule/:date` (assign/move/replace), `GET /questions?status&source&type&q&sort`, `GET /questions/:id/usage`, `POST/PATCH /questions`, `GET /submissions?status`, `POST /submissions/:id/approve {date}`, `POST /submissions/:id/reject {reason,note}`, `GET /today`, explanation reply/delete/dismiss-report endpoints.

## Behavior notes
- Days are in the app's timezone; past days are read-only everywhere.
- Scheduling onto a taken day replaces it (form & submissions warn); reuse calendar & library picker only allow empty days.
- Duplicate detection: lowercase word tokens (len ≥ 3) from text/sentence/answer/hint/options; score = overlap / min(size); ≥ 0.6 shown.
- Answer counts / % correct are **not** shown in Library, Schedule or pickers (not available yet). Only the Today screen shows live stats.
- Responsive: layouts wrap via flex-wrap/auto-fit; sidebar is fixed-width (desktop-first, ≥ 1024px target).

## Design tokens
- Orange (brand/primary) `#F2711C`, hover `#D85F10`, deep `#C25A14`, deeper `#B4500F`, light `#F9C29C`, tints `#FFF4EC` `#FFF8F2` `#FBDCC6`
- Ink `#17171A`, muted `#6E6E73`, subtle `#8E8E93`, disabled `#C9C9CE`
- Surfaces: page `#F2F2F3`, card `#FFFFFF`, field/track `#F2F2F3` / `#E9E9EB`, hover `#F5F5F6`, borders `#ECECEE` / `#E4E4E7`
- Green `#1FA971` / text `#137A51`; Red `#F5333F` / text `#C21D29`; Blue (user) `#5B6CF0` / text `#3F4FC9`
- Radii: 6–7 (chips), 8–9 (small buttons), 10–12 (inputs, buttons, menus), 16–18 (cards, modals), 999 (pills)
- Type: Manrope; H1 28/800, section 16–20/800, body 14–15/600–700, meta 12–13, kicker 12/800 uppercase
- Shadows: modal `0 24px 60px rgba(0,0,0,.25)`, menu `0 14px 36px rgba(23,23,26,.14)`, preview phone `0 18px 50px rgba(0,0,0,.08)`
- Focus: border `#F2711C` + `0 0 0 3px rgba(242,113,28,.15)`

## Assets
No raster assets. Icons are inline Lucide-style SVGs (stroke 2–2.4). Font: Manrope (Google Fonts).

## Files
- `Quiz Admin.dc.html` – full admin prototype (all screens + modals; logic class at the bottom holds mock data and derived state).
- `support.js` – runtime needed only to open the prototype in a browser.
