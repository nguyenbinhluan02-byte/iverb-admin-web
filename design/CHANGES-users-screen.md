# Task: Add read-only "Users" screen to Quiz Admin

Implement in the existing admin web app. Match the existing Library screen's components and styles (search bar, filter dropdown buttons, list card, pager). Visual reference: `Quiz Admin.dc.html` → sidebar → **Users** (open in a browser). Full spec: `README.md` → "Latest changes (Nov 1, 2026 · Users screen)".

**Read only. No create, edit, delete or status-change actions.**

---

## 1. Sidebar
- Add nav item **Users** as the last item, after "Submissions".
- Icon: lucide `users`, 18px. No badge.
- Route: `/users`. Active style is the same as other items (bg `rgba(242,113,28,0.1)`, text `#C25A14`).

## 2. Page structure (container max-width 1240, centered, vertical gap 20)
1. Header
   - Eyebrow: `{total} accounts · read only`, 12px/800, `#6E6E73`, uppercase, letter-spacing .06em
   - H1: `Users`, 28px/800
2. Search input. Reuse the Library search component. Placeholder: `Search by name or email`.
   - Case-insensitive and accent-insensitive: strip Vietnamese diacritics and map `đ` to `d`.
3. Filter row. Reuse the Library filter dropdown component. Order:
   1. **Status**: All · Active · Expired · Deletion requested (show count per option)
   2. **Plan**: All · Premium · Free gift (show count)
   3. **Joined**: month picker (see §4)
   4. **Sign-in**: Any · Google · Apple · Email (show count)
   5. **Sort**: Recently active (default) · Newest joined · Oldest joined · Name A–Z (use `vi` locale compare). No counts.
   - All filters and the search combine with AND.
   - Any filter, search or sort change resets to page 1.
   - Choosing an option closes the dropdown.
4. Body: flex row with wrap, gap 18
   - Left: table (flex `1 1 560px`, min-width 0)
   - Right: detail panel (flex `0 1 360px`, min-width 300, `position: sticky; top: 30px`)

## 3. Table
- Card: white, border `1px solid #ECECEE`, radius 18, `overflow-x: auto`.
- Grid columns for the header and every row: `minmax(200px,1fr) 140px 130px 100px 100px`, gap 14, padding `12px 20px`, `min-width: 740px`.
- Columns: **User | Status | Plan | Joined | Last active**
- Header row: 11px/800, uppercase, `#6E6E73`, bottom border `#ECECEE`.
- Cells:
  - **User**: avatar 34px circle with initials (color hashed from the name, same as the existing `colorFor`). Next to it, name (14/700) on top and email below (12px, `#6E6E73`). Both truncate with ellipsis.
  - **Status**: pill (see §5)
  - **Plan**: plan name (13/700) with a sub-line under it (12px, `#6E6E73`):
    - active + Premium → `Renews {MMM D, YYYY}`
    - active + Free gift → `Ends {date}`
    - expired → `Ended {date}`
    - deletion requested → `Until {erase date}`
  - **Joined**: `MMM D, YYYY`, 13px, `#17171A`
  - **Last active**: `Today` / `Yesterday` / `N days ago`, 13px, `#6E6E73`
- Row interaction:
  - Hover bg `#FAFAFA`.
  - Clicking a row selects it (no navigation).
  - Selected row: bg `#FFF8F2`, left border `3px solid #F2711C` (unselected rows have the same 3px border in transparent).
  - By default the first row of the current page is selected.
- Empty state: `No users match your search.`, centered, padding 48px, 14px, `#6E6E73`.
- Pager below the card: `{from}–{to} of {n}` on the left, prev/next 34×34 buttons on the right (disabled color `#C7C7CC`). 12 rows per page.

## 4. Joined month picker
- Trigger: same style as the other filter buttons. Calendar icon, label `Joined`, value `Any month` or `MMM YYYY` (e.g. `Oct 2026`), chevron. Border is `#17171A` while open.
- Popover: absolute, 6px below the trigger, width 272, padding 12, radius 12, border `#ECECEE`, shadow `0 14px 36px rgba(23,23,26,.14)`, gap 10.
  1. Year row: ‹ prev, year (14/800), › next.
     - Range: from the app launch year to the current year. Disable the buttons at the limits.
     - The popover opens on the selected year, or on the current year when nothing is selected.
  2. Month grid: 3 columns × 4 rows, gap 6. Each cell is 38px tall, radius 9, 13/700, and shows the month short name (Jan…Dec).
     - Normal month: white bg, border `#E4E4E7`, text `#17171A`
     - Selected month: bg and border `#F2711C`, text white
     - Future month: disabled, bg `#F7F7F8`, text `#C7C7CC`
     - **Do not show any per-month user count.**
  3. Full-width `Any month` button (34px, border `#E4E4E7`). Clicking it clears the filter.
- Picking a month sets the filter, closes the popover and resets to page 1.
- Clicking outside closes the popover. Use the same behavior as the other dropdowns.

## 5. Status pills (11px/800, padding 3px 9px, radius 999)
| value | label | bg | text |
|---|---|---|---|
| `active` | Active | `rgba(31,169,113,.12)` | `#137A51` |
| `expired` | Expired | `#FFF4EC` | `#B4500F` |
| `deleting` | Deletion requested | `rgba(245,51,63,.1)` | `#C21D29` |

## 6. Detail panel (read only)
- Card: white, border `#ECECEE`, radius 18.
- **Top section** (centered, padding `22px 22px 18px`, bottom border):
  - Avatar 56px with initials (18/800)
  - Name, 17/800
  - Email, 13px, `#6E6E73`, `word-break: break-all`
  - Status pill (12px)
  - Note, 12px, `#6E6E73`:
    - active: `Can answer daily questions and post in community.`
    - expired: `Plan ended {date}. Can read but not answer until renewed.`
    - deleting: `User asked to delete this account. Data will be erased on {date}.`
- **Account** section: title 11px/800 uppercase `#6E6E73`. Key/value rows, 13px, key in `#6E6E73` on the left, value bold on the right:
  - User ID
  - Sign-in
  - Plan
  - Date row, label depends on status: `Renews` / `Ends` / `Ended` / `Erase on`
  - Joined
  - Last active
  - Device: `Android · v3.4.2`
- **Activity** section: 2-column grid of tiles (bg `#F7F7F8`, radius 12, padding `10px 12px`). Each tile has the value (18/800) on top and the label (12px, `#6E6E73`) below:
  - Questions answered
  - Accuracy (%)
  - Current streak (days)
  - Community answers
  - Questions submitted
  - Times reported

## 7. Data / API
```ts
type AdminUser = {
  id: string; name: string; email: string;
  provider: 'Google' | 'Apple' | 'Email';
  status: 'active' | 'expired' | 'deleting';
  plan: 'Premium yearly' | 'Premium monthly' | 'Free gift';
  planExpiresAt: string;            // ISO
  deletionScheduledAt?: string;     // when status = 'deleting'
  joinedAt: string; lastActiveAt: string;
  platform: 'Android' | 'iOS'; appVersion: string;
  stats: { answered: number; accuracyPct: number; streakDays: number;
           communityAnswers: number; submissions: number; reportsReceived: number };
};
```
```
GET /admin/users
  ?q=&status=all|active|expired|deleting
  &plan=all|premium|gift
  &joinedMonth=YYYY-MM            // omit = any month
  &provider=all|Google|Apple|Email
  &sort=recent|newest|oldest|name
  &page=1&pageSize=12
→ { items: AdminUser[], total: number,
    counts: { status: {...}, plan: {...}, provider: {...} } }   // no per-month counts
```

## 8. Acceptance checklist
- [ ] Users nav item is visible and the active state works
- [ ] Search matches names and emails with or without Vietnamese accents
- [ ] All 5 filters combine with each other; each change resets to page 1
- [ ] Month picker: year navigation works, future months are disabled, "Any month" clears the filter, no counts are shown
- [ ] Table scrolls horizontally on narrow screens; the User column is never squeezed below 200px
- [ ] Clicking a row updates the detail panel; the first row is selected by default
- [ ] No edit or delete controls anywhere on this screen
