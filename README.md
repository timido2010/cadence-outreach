# Cadence — Real Estate Outreach Tracker

A fast, mobile-first tracker for daily cold-calling activity and conversion
statistics. Built for a working agent: record a call in **two taps**, watch the
funnel fill, and see conversion rates over time. It is deliberately **not a CRM**
— no client names, notes, or lead sources.

## Quick start

No build step, no dependencies. Either:

- **Open directly:** double-click `index.html`, or
- **Serve locally** (recommended for phones on the same network):
  ```
  python -m http.server 8777
  ```
  then visit `http://<your-computer-ip>:8777/` on your phone.

### Install as an app (offline)
Cadence is a PWA. Serve it over `http`/`https` (or `localhost`), open it in the
phone browser, and choose **Add to Home Screen** / **Install**. It then launches
full-screen and **works with no connection** — a service worker caches the app
shell, and all your data is local anyway. (Install requires being served, not
opened as a `file://` path.)

## How it works

### Tracking (the two-tap flow)
1. Pick an audience — **Seller · Buyer · Landlord**. The choice sticks until you change it.
2. Tap **New Call**, then tap the result. Done.

Results are **cumulative** — selecting a deeper stage records every stage before it:

| Result                    | Records                                        |
|---------------------------|------------------------------------------------|
| No Answer                 | Call                                           |
| Answered, Not Qualified   | Call · Answered                                |
| Qualified Conversation    | Call · Answered · Qualified                    |
| Meeting Scheduled *(Seller/Buyer)* | Call · Answered · Qualified · Meeting Scheduled |
| Agreement Signed *(Landlord)*      | Call · Answered · Qualified · Signed            |

### Follow-ups
Later events get their own one-tap buttons, filtered to the active audience:
Meeting Completed, Exclusivity / Brokerage Agreement Signed, and Meeting
Scheduled Manually.

### Funnels
- **Seller:** Call → Answered → Qualified → Meeting Scheduled → Meeting Completed → Exclusivity Signed
- **Buyer:** Call → Answered → Qualified → Meeting Scheduled → Meeting Completed → Brokerage Agreement Signed
- **Landlord:** Call → Answered → Qualified → Brokerage Agreement Signed

### Goals
One target for the whole day (not per audience): **calls per day** and
**meetings completed per day**, shown as live progress bars.

### Stats
Four ranges — **Today · Week · Month · All Time** — with an audience filter.
Includes answer rate, meeting completion rate, signed agreements, stage-by-stage
conversion, and efficiency ratios (calls per meeting, calls per signed
agreement, meetings per signed agreement). Any calculation without enough data
shows **"Not enough data"** instead of dividing by zero.

A **Trend** chart shows call volume per day (or per week for All Time), with a
gold dot on any day you completed a meeting — so momentum is visible at a glance.

### Days & corrections
- Each calendar day opens fresh from zero; history is kept.
- Tap the date pill to **view or edit any previous day**.
- **Undo** reverses the last action; **Correct totals** nudges any stage to
  match reality (logged, so it stays undoable).

### Your data — cloud sync
Cadence signs in to a single account (email + password) and stores every call,
follow-up, correction, and your goals in a shared cloud database (Supabase).
Sign in with the same account on your phone and your desktop and both show the
exact same activity, updated immediately. `localStorage` is still used as an
**offline cache** — actions save instantly on the device and sync to the cloud
in the background, so nothing is lost if you're briefly offline; queued
actions flush automatically (without duplicating) once you're back online.

From the **Data** tab you can also **export JSON** (full backup), **export
CSV** (activity log), or **import** a JSON backup — useful as an extra local
safety copy alongside the cloud sync.

#### One-time cloud setup
1. Create a free project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, run [`supabase_schema.sql`](supabase_schema.sql) once — it creates the `events` and `settings` tables with row-level security so only your signed-in account can read or write your rows.
3. In **Settings → API**, copy the **Project URL** and **anon public key** into [`assets/config.js`](assets/config.js).
4. Open the app and create your account on the sign-in screen (any email + a password of 6+ characters). Sign in with the same account on every device.

The anon key is meant to be public (Supabase's security model relies on the
database rules in the SQL script, not on hiding this key), so it's safe to
commit `config.js` as-is once filled in.

## Tech

Plain HTML + CSS + vanilla JavaScript, no build step. The event log (calls,
follow-ups, corrections) and one settings row (goals + last-picked audience)
sync to Postgres via Supabase; every write also lands in `localStorage`
immediately for instant UI feedback and offline resilience. A small pending-
operations queue (`assets/sync.js`) flushes to the cloud in the background and
upserts by each record's own id, so retries after a dropped connection never
create duplicates.

```
index.html               markup + layout + auth screen
assets/styles.css         muted-slate theme, glass cards, bento grid, trend chart
assets/app.js             data model, funnel logic, stats, trend, auth/sync wiring
assets/sync.js            Supabase auth + cloud read/write + offline outbox
assets/config.js          your Supabase Project URL + anon key
assets/vendor/supabase.js vendored Supabase JS SDK (cached offline like everything else)
assets/icon.svg           app icon
manifest.webmanifest      PWA metadata (installable)
sw.js                     service worker — offline app-shell cache (not API calls)
supabase_schema.sql       run once in Supabase's SQL Editor to create the tables
```

When you change any cached file, bump `CACHE` in `sw.js` so installed clients
pick up the update (already done for you in commits going forward).
