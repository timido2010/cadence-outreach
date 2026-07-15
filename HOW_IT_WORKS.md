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

**You:**
- Open the link above and use the app (log calls, check stats).
- Sign in once per device with your one account (email + password you chose).
- Ask me for changes/features when you want something different.

**Me (whenever you ask for a change):**
- Edit the code.
- Save it to GitHub ("commit" + "push" — see below).
- GitHub Pages automatically rebuilds your live site within about a minute.
- I test it and tell you when it's ready.

You never need to run a command, open a terminal, or touch GitHub/Supabase's
technical settings — unless it's a one-time setup step like the one below.

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

You already have a Supabase project. If I ever hand you a **new or updated**
`supabase_schema.sql` file, here's exactly what to do with it — this is the
*only* technical step that's ever on you, and only when I explicitly ask for it:

1. Go to **supabase.com** → log in → open your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Open the `supabase_schema.sql` file in this project, select all its text, copy it.
5. Paste it into the SQL Editor box.
6. Click **Run** (or press Ctrl+Enter).
7. You should see a green "Success" message. That's it — done.

It's safe to run this same script again if I ever ask — it won't duplicate
anything or break existing data.

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
