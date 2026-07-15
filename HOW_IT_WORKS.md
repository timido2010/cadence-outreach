# Cadence — How This Project Works (Plain-Language Guide)

This file explains the whole system in simple terms, so you always know what
each piece does and what (if anything) you need to do yourself.

---

## The 3 pieces

| Piece | What it is | What it's for |
|---|---|---|
| **Supabase** | Your database | Stores every call, meeting, signed deal, and your goals. This is the single source of truth — the same data shows on your phone and desktop because both read from here. |
| **GitHub** | Your code storage | Stores the app's *files* (the screens, buttons, design). Not your activity data — just the program itself. Also backs up all your code history. |
| **GitHub Pages** | Your live website | Automatically builds a working website from whatever code is currently on GitHub. This is the link you actually open and use. |

Compare to your client portal project:

| Client portal | Cadence |
|---|---|
| Firebase | Supabase |
| Netlify | GitHub Pages |
| your domain | `timido2010.github.io/cadence-outreach` |

---

## Your live link

**https://timido2010.github.io/cadence-outreach/**

This is the only address you ever need. Open it on your phone, open it on
your desktop, sign in with the same account on both — same data everywhere.

---

## What you do vs. what I do

**Day to day, using the app:** nothing to deploy. Just open the link and use it.

**When you ask me to change something:** I edit the code and publish it for
you (see "Commit and push" below) — that's still the default, same as before.

**If you want to publish changes yourself** (e.g. you edited a file, or just
don't want to wait on me): double-click **`deploy.bat`** in this project
folder. That's your "commit + deploy" button — see the section below.

You never need to touch GitHub's or Supabase's technical settings day-to-day
— only the one-time SQL step described further down, and only when I
explicitly hand you a new script.

---

## Publishing changes yourself — `deploy.bat`

This project now has a file called **`deploy.bat`** sitting in the main
project folder, right next to `index.html`. This is your equivalent of the
"deploy" step you had in the client portal project. To use it:

1. Double-click **`deploy.bat`**. A black command window opens.
2. It asks you to describe what changed — type a short note (e.g. "fixed typo")
   or just press **Enter** to skip.
3. It automatically saves the changes (**commit**) and uploads them (**push**).
4. When it says **"Done!"**, your live site will update within about a minute:
   **https://timido2010.github.io/cadence-outreach/** (hard-refresh once to see it: `Ctrl+Shift+R`)

If it says **"Nothing to commit"**, that just means nothing in the project
folder actually changed — nothing to publish, totally normal.

If it says **"Push failed"**, check your internet connection and double-click
it again. If it keeps failing, send me a screenshot of the black window.

You do **not** need this file for day-to-day use of the app — only if you (or
I, working outside a chat with you) edit files directly and need to publish
them.

---

## "Commit" and "push" — what these words mean

You'll hear me say these when I make changes. You don't do this yourself, but
here's what it means so it's not a mystery:

- **Commit** = saving a labeled snapshot of the code, like naming a save file
  in a video game ("added dark mode", "fixed login bug").
- **Push** = uploading that snapshot to GitHub, which makes your live site
  rebuild automatically.

When I say "I pushed the update," it means: **the live link now has the new
version. Refresh the page to see it** (a hard refresh — `Ctrl+Shift+R` — the
first time after any update, so your browser doesn't show an old cached copy).

---

## The one-time Supabase setup

You already have a Supabase project. If I ever say "re-run the SQL script,"
here's exactly what that means — this is the *only* technical step that's
ever on you, and only when I explicitly ask for it:

1. Go to **supabase.com** → log in → open your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Copy the entire box below (click inside it, Ctrl+A, Ctrl+C) and paste it into the SQL Editor.
5. Click **Run** (or press Ctrl+Enter).
6. You should see a green "Success" message. That's it — done.

It's safe to run this same script again any time I ask — it won't duplicate
anything or break existing data.

```sql
-- Cadence — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).
-- Creates two tables, scoped to a single authenticated user via Row Level Security.

create table if not exists public.events (
  id           uuid primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  ts           bigint not null,        -- epoch millis, matches the app's event.ts
  date_key     text not null,          -- 'YYYY-MM-DD', the tracking day this event belongs to
  audience     text not null,          -- 'seller' | 'buyer' | 'landlord'
  kind         text not null,          -- 'call' | 'followup' | 'adjust'
  label        text not null,
  deltas       jsonb not null,
  created_at   timestamptz not null default now()
);

create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_user_date_idx on public.events(user_id, date_key);

alter table public.events enable row level security;

drop policy if exists "events_select_own" on public.events;
drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_delete_own" on public.events;

create policy "events_select_own" on public.events
  for select using (auth.uid() = user_id);
create policy "events_insert_own" on public.events
  for insert with check (auth.uid() = user_id);
create policy "events_update_own" on public.events
  for update using (auth.uid() = user_id);
create policy "events_delete_own" on public.events
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.events to authenticated;

create table if not exists public.settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  goals         jsonb not null default '{"call":25,"meetingCompleted":3}'::jsonb,
  audience      text not null default 'seller',
  updated_at    timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_select_own" on public.settings;
drop policy if exists "settings_insert_own" on public.settings;
drop policy if exists "settings_update_own" on public.settings;

create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id);

grant select, insert, update on public.settings to authenticated;
```

(This is identical to the `supabase_schema.sql` file in the project folder —
copying from here means you never have to go find that file yourself.)

### How often do I need to re-run this?

**Almost never.** This is not routine maintenance. It's only needed when a
*new feature* requires a *new database structure* (a new table, or a new
column on an existing one) — that's rare. Normal daily use of the app (logging
calls, checking stats, editing goals) never touches this. If I ever add
something that needs it, I'll tell you explicitly and hand you the updated
script. Otherwise, ignore this section entirely.

### Where to find your Supabase keys (only needed once, already done)
Settings (gear icon, bottom-left) → **API** → you'll see:
- **Project URL**
- **anon public** key (sometimes now called "Publishable key")

These two values are already saved in this project's `assets/config.js` file.
You never need to touch them again unless you create a brand-new Supabase project.

---

## Your account

Cadence uses one simple sign-in (email + a password you pick) — not Google
login, not multiple users. Whatever email/password you used to sign up the
first time is what you use on every device to see the same data.

If you ever forget your password, tell me and I'll walk you through Supabase's
reset flow (I still won't type it for you — just guide you).

### How many accounts / users can I have?

Technically up to 50,000 (Supabase's free-tier limit) — effectively unlimited
for personal use. But important: **every account is a separate, private
silo** — there's no "team" or shared-data feature built into this app.

- **Same person, two devices (phone + desktop):** use **one account** — that's
  the normal case, already fully supported.
- **A second person with their own tracking:** they'd create their **own
  separate account** (different email). Their data is completely invisible to
  yours and vice versa — it's not a shared workspace.

---

## "What if later I want to..."

**...use my own domain instead of the github.io link?**
Yes, easy. GitHub Pages supports custom domains. Tell me the domain you own,
and I'll add one config file plus tell you the one DNS record to add at
wherever you bought the domain (GoDaddy, Namecheap, etc. — I don't have
access to your registrar, so that one step is yours). Live within a few
hours of adding the record.

**...switch the database from Supabase to Firebase?**
Possible, but not a quick swap — Supabase and Firebase are different systems
that don't speak the same language. I'd need to rewrite `assets/sync.js` (the
one file that talks to the database) and recreate the schema/security rules
for Firebase. Your screens, design, and workflow would stay identical —
only that one connector changes. A real but contained job, doable whenever
you want; today's choice doesn't lock you in.

---

## Starting fresh — deleting test/practice data

**Easiest way — inside the app:**
1. Open the app → **נתונים** (Data) tab.
2. Scroll to the **איפוס** (Reset) card.
3. Tap **מחיקת כל הנתונים**.
4. Confirm.

This deletes everything on **both** your device and your Supabase cloud
database in one step — the app is built to do both together, so nothing gets
left behind to reappear later.

**Alternative — directly in Supabase** (only if the button above ever fails):
1. Go to **supabase.com** → your project → **Table Editor** (left sidebar).
2. Click the **events** table → select all rows → **Delete**.
3. Click the **settings** table → select all rows → **Delete**.
4. Refresh the app — it'll start clean the next time you sign in.

---

## Backups (extra safety, optional)

Even though Supabase is the real backup, the app also has a manual export in
the **נתונים** (Data) tab:
- **ייצוא JSON** — full backup file
- **ייצוא CSV** — spreadsheet-friendly activity log

Handy if you ever want an offline copy, but not required for normal use.

---

## Quick troubleshooting

| Problem | What it usually means |
|---|---|
| App looks outdated after I say I pushed an update | Hard-refresh: `Ctrl+Shift+R` (desktop) or close/reopen the app if installed on your phone. |
| "סנכרון הענן עדיין לא הוגדר" (cloud sync not configured) message | Supabase keys are missing from `assets/config.js` — tell me and I'll check. |
| Data missing on one device | Make sure you signed in with the **exact same email** on both devices. |
| Can't sign in | Tell me the exact error message shown on screen and I'll investigate (I'll never ask for your password). |
