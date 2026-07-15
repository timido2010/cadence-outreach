/* ============================================================
   Cadence — cloud sync (Supabase)
   Single-user auth + an append-mostly event log synced to Postgres.
   Every write lands in localStorage immediately (instant UI), then a
   small persisted outbox flushes to the cloud in the background. Rows
   are upserted by their own uuid, so retries after a dropped connection
   never create duplicates.
   ============================================================ */
"use strict";

const CadenceSync = (() => {
  const OUTBOX_KEY = 'cadence.outbox.v1';
  let client = null;
  let configured = false;
  let session = null;
  const authListeners = [];

  function init() {
    const cfg = window.CADENCE_CONFIG || {};
    configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY
      && !cfg.SUPABASE_URL.startsWith('YOUR_') && !cfg.SUPABASE_ANON_KEY.startsWith('YOUR_'));
    if (!configured) return false;
    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    client.auth.onAuthStateChange((event, s) => {
      session = s;
      authListeners.forEach(fn => fn(session, event));
    });
    return true;
  }

  function isConfigured() { return configured; }
  // supabase-js calls this once immediately with any persisted session (or
  // null), then again on every future sign-in/out — the single source of
  // truth for auth state, so callers don't need a separate "restore" step.
  function onAuthChange(fn) { authListeners.push(fn); }

  async function signUp(email, password) {
    const { error } = await client.auth.signUp({ email, password });
    return { error };
  }
  async function signIn(email, password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error };
  }
  async function signOut() {
    clearOutbox();
    await client.auth.signOut();
  }

  /* ---------- row <-> app-event mapping ---------- */
  function eventToRow(ev, userId) {
    return { id: ev.id, user_id: userId, ts: ev.ts, date_key: ev.dateKey,
      audience: ev.audience, kind: ev.kind, label: ev.label, deltas: ev.deltas };
  }
  function rowToEvent(row) {
    return { id: row.id, ts: Number(row.ts), dateKey: row.date_key,
      audience: row.audience, kind: row.kind, label: row.label, deltas: row.deltas };
  }

  /* ---------- cloud reads ---------- */
  async function fetchAll(userId) {
    const [{ data: rows, error: e1 }, { data: settingsRow, error: e2 }] = await Promise.all([
      client.from('events').select('*').eq('user_id', userId).order('ts', { ascending: true }),
      client.from('settings').select('*').eq('user_id', userId).maybeSingle(),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    return {
      events: (rows || []).map(rowToEvent),
      goals: settingsRow ? settingsRow.goals : null,
      audience: settingsRow ? settingsRow.audience : null,
    };
  }

  async function deleteAllCloudData(userId) {
    await client.from('events').delete().eq('user_id', userId);
    await client.from('settings').delete().eq('user_id', userId);
  }

  /* ---------- outbox (pending writes, offline-safe) ---------- */
  function loadOutbox() {
    try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveOutbox(box) {
    try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(box)); } catch (e) {}
  }
  function clearOutbox() { saveOutbox([]); }
  function pendingCount() { return loadOutbox().length; }
  function peekOutbox() { return loadOutbox(); }

  function enqueueUpsertEvent(row) {
    const box = loadOutbox();
    box.push({ type: 'upsert_event', row });
    saveOutbox(box);
    flush();
  }
  function enqueueDeleteEvent(id) {
    let box = loadOutbox();
    // If the same row is still queued as an unsent upsert, cancel both —
    // no need to round-trip an insert that's about to be deleted anyway.
    const idx = box.findIndex(op => op.type === 'upsert_event' && op.row.id === id);
    if (idx !== -1) { box.splice(idx, 1); saveOutbox(box); return; }
    box.push({ type: 'delete_event', id });
    saveOutbox(box);
    flush();
  }
  function enqueueUpsertSettings(row) {
    // Only the latest settings write matters — collapse any earlier queued one.
    const box = loadOutbox().filter(op => op.type !== 'upsert_settings');
    box.push({ type: 'upsert_settings', row });
    saveOutbox(box);
    flush();
  }

  let flushing = false;
  let reflushNeeded = false;
  async function flush() {
    if (!configured || !session) return;
    if (flushing) { reflushNeeded = true; return; } // an op landed mid-flush; re-run once this pass ends
    flushing = true;
    try {
      let box = loadOutbox();
      while (box.length) {
        const op = box[0];
        try {
          if (op.type === 'upsert_event') {
            const { error } = await client.from('events').upsert(op.row, { onConflict: 'id' });
            if (error) throw error;
          } else if (op.type === 'delete_event') {
            const { error } = await client.from('events').delete().eq('id', op.id);
            if (error) throw error;
          } else if (op.type === 'upsert_settings') {
            const { error } = await client.from('settings').upsert(op.row, { onConflict: 'user_id' });
            if (error) throw error;
          }
        } catch (err) {
          break; // network/transient failure — stop, keep remaining ops queued for later
        }
        box.shift();
        saveOutbox(box);
      }
    } finally {
      flushing = false;
    }
    if (reflushNeeded) { reflushNeeded = false; flush(); }
  }

  window.addEventListener('online', flush);

  return {
    init, isConfigured, onAuthChange,
    signUp, signIn, signOut,
    fetchAll, deleteAllCloudData,
    enqueueUpsertEvent, enqueueDeleteEvent, enqueueUpsertSettings,
    flush, pendingCount, peekOutbox, clearOutbox,
    eventToRow, rowToEvent,
  };
})();
