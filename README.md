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

Add it to your phone's home screen for an app-like, full-screen experience.

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

### Days & corrections
- Each calendar day opens fresh from zero; history is kept.
- Tap the date pill to **view or edit any previous day**.
- **Undo** reverses the last action; **Correct totals** nudges any stage to
  match reality (logged, so it stays undoable).

### Your data
Everything lives in your browser's `localStorage` on this device. From the
**Data** tab you can **export JSON** (full backup), **export CSV** (activity
log), or **import** a JSON backup. Export before switching phones or clearing
your browser.

## Tech

Plain HTML + CSS + vanilla JavaScript. No frameworks, no network calls, works
offline. Data model is a single append-only event log; all counters and stats
are derived from it, which keeps undo and corrections consistent.

```
index.html        markup + layout
assets/styles.css  muted-slate theme, glass cards, bento grid
assets/app.js      data model, funnel logic, stats, persistence
```
