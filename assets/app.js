/* ============================================================
   Cadence — outreach & conversion tracker
   Vanilla JS · localStorage · no build step
   ============================================================ */
"use strict";

/* ---------- Icons (Lucide-style, thin line) ---------- */
const ICONS = {
  calendar:'<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/>',
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M17 5l2 2M15 7l2 2"/>',
  building:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h.5M14.5 7h.5M9 11h.5M14.5 11h.5M9 15h.5M14.5 15h.5M10 21v-3h4v3"/>',
  phone:'<path d="M4.5 5.5c0 8 6 14 14 14a2 2 0 0 0 2-1.7l.3-2a1.5 1.5 0 0 0-1-1.6l-2.7-.9a1.5 1.5 0 0 0-1.6.5l-.7.9a11 11 0 0 1-4.9-4.9l.9-.7a1.5 1.5 0 0 0 .5-1.6l-.9-2.7a1.5 1.5 0 0 0-1.6-1l-2 .3A2 2 0 0 0 4.5 5.5Z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  sliders:'<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
  undo:'<path d="M9 7 4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-1"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  download:'<path d="M12 3v12M7 11l5 5 5-5"/><path d="M5 21h14"/>',
  table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>',
  upload:'<path d="M12 21V9M7 13l5-5 5 5"/><path d="M5 3h14"/>',
  check:'<path d="m20 6-11 11-5-5"/>',
  handshake:'<path d="m11 17 2 2 4-4"/><path d="M3 11 8 6l4 3 4-3 5 5-3 3-4-3-2 2-2-2-4 3z"/>',
  calcheck:'<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="m9 15 2 2 4-4"/>',
  flag:'<path d="M4 21V4h11l-1.5 3.5L15 11H4"/>',
  users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17 20a5.5 5.5 0 0 0-2.3-4.5"/>',
  percent:'<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  ratio:'<rect x="3" y="8" width="7" height="8" rx="1"/><rect x="14" y="5" width="7" height="14" rx="1"/>',
  calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="11" r="1"/><circle cx="16" cy="11" r="1"/><circle cx="8" cy="15" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><circle cx="8" cy="19" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="16" cy="19" r="1"/>',
  coins:'<circle cx="9" cy="9" r="6"/><path d="M14.5 9a6 6 0 1 1-5.5 8.5"/><path d="M9 9h.01M9 6.5h.01M9 11.5h.01"/>',
};
function paintIcons(root=document){
  root.querySelectorAll('[data-icon]').forEach(el=>{
    const n=el.getAttribute('data-icon'); if(!ICONS[n]||el.dataset.painted)return;
    el.dataset.painted='1';
    el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
  });
}

/* ---------- Config: audiences, results, follow-ups, funnels ---------- */
// Canonical counters every event contributes to. saleClosed/rentalClosed are
// completed-deal counters (post-signing fulfillment) — separate from the
// call funnel, but tracked the same way (counter-only, no CRM fields).
const COUNTERS=['call','answered','qualified','meetingScheduled','meetingCompleted','signed','saleClosed','rentalClosed'];

const AUDIENCES={
  seller:{label:'מוכר'}, buyer:{label:'קונה'}, landlord:{label:'משכיר'},
};

// Call-result options per audience. Order = funnel depth; each records all prior stages.
const CALL_RESULTS={
  seller:[
    {key:'no_answer',   name:'לא ענו',                        desc:'שיחה +1',                        deltas:{call:1}},
    {key:'not_qual',    name:'נענו, לא הייתה שיחה איכותית',   desc:'שיחה + נענו',                    deltas:{call:1,answered:1}},
    {key:'qualified',   name:'שיחה איכותית',                 desc:'שיחה + נענו + איכותית',          deltas:{call:1,answered:1,qualified:1}},
    {key:'meeting',     name:'נקבעה פגישה',                  desc:'משפך מלא עד פגישה',    tone:'gold',deltas:{call:1,answered:1,qualified:1,meetingScheduled:1}},
  ],
  buyer:[
    {key:'no_answer',   name:'לא ענו',                        desc:'שיחה +1',                        deltas:{call:1}},
    {key:'not_qual',    name:'נענו, לא הייתה שיחה איכותית',   desc:'שיחה + נענו',                    deltas:{call:1,answered:1}},
    {key:'qualified',   name:'שיחה איכותית',                 desc:'שיחה + נענו + איכותית',          deltas:{call:1,answered:1,qualified:1}},
    {key:'meeting',     name:'נקבעה פגישה',                  desc:'משפך מלא עד פגישה',    tone:'gold',deltas:{call:1,answered:1,qualified:1,meetingScheduled:1}},
  ],
  landlord:[
    {key:'no_answer',   name:'לא ענו',                        desc:'שיחה +1',                        deltas:{call:1}},
    {key:'not_qual',    name:'נענו, לא הייתה שיחה איכותית',   desc:'שיחה + נענו',                    deltas:{call:1,answered:1}},
    {key:'qualified',   name:'שיחה איכותית',                 desc:'שיחה + נענו + איכותית',          deltas:{call:1,answered:1,qualified:1}},
    {key:'agreement',   name:'נחתם הסכם תיווך',              desc:'משפך מלא עד חתימה',    tone:'gold',deltas:{call:1,answered:1,qualified:1,signed:1}},
  ],
};

// Later, out-of-call events. Shown only for the relevant audience.
const FOLLOWUPS={
  seller:[
    {key:'meeting_done', name:'פגישה התקיימה',        icon:'calcheck',  deltas:{meetingCompleted:1}},
    {key:'exclusivity',  name:'נחתמה בלעדיות',        icon:'handshake', tone:'gold', deltas:{signed:1}},
    {key:'sale_closed',  name:'עסקת מכירה נסגרה',      icon:'coins',     tone:'gold', deltas:{saleClosed:1}},
    {key:'manual_meet',  name:'נקבעה פגישה ידנית',    icon:'flag',      full:true,   deltas:{meetingScheduled:1}},
  ],
  buyer:[
    {key:'meeting_done', name:'פגישה התקיימה',        icon:'calcheck',  deltas:{meetingCompleted:1}},
    {key:'brokerage',    name:'נחתם הסכם תיווך',      icon:'handshake', tone:'gold', deltas:{signed:1}},
    {key:'sale_closed',  name:'עסקת מכירה נסגרה',      icon:'coins',     tone:'gold', deltas:{saleClosed:1}},
    {key:'rental_closed',name:'עסקת השכרה נסגרה',      icon:'building',  tone:'gold', deltas:{rentalClosed:1}},
    {key:'manual_meet',  name:'נקבעה פגישה ידנית',    icon:'flag',      full:true,   deltas:{meetingScheduled:1}},
  ],
  landlord:[
    {key:'brokerage',    name:'נחתם הסכם תיווך',      icon:'handshake', tone:'gold', deltas:{signed:1}},
    {key:'rental_closed',name:'עסקת השכרה נסגרה',      icon:'building',  tone:'gold', full:true, deltas:{rentalClosed:1}},
  ],
};
// Extra correctable counters per audience, appended after the normal funnel
// stages in "תיקון סכומים" — completed deals aren't part of the call funnel
// (FUNNELS/dashboard widget stay untouched) but should still be fixable.
const DEAL_COUNTERS={ seller:['saleClosed'], buyer:['saleClosed','rentalClosed'], landlord:['rentalClosed'] };

// Funnel definition (ordered stages) per audience + a full/combined funnel for "All".
const FUNNELS={
  seller:['call','answered','qualified','meetingScheduled','meetingCompleted','signed'],
  buyer:['call','answered','qualified','meetingScheduled','meetingCompleted','signed'],
  landlord:['call','answered','qualified','signed'],
  all:['call','answered','qualified','meetingScheduled','meetingCompleted','signed'],
};
// Stage conversion section (Stats): sales-performance steps only, as
// explicit (from, to) pairs rather than a plain stage sequence — this lets
// us skip the meetingScheduled → meetingCompleted step (attendance, not a
// sales conversion; shown separately as the "אחוז השלמת פגישות" tile) while
// still ending on meetingCompleted → signed for audiences with a meeting step.
const CONV_STEPS={
  seller:[['call','answered'],['answered','qualified'],['qualified','meetingScheduled'],['meetingCompleted','signed']],
  buyer:[['call','answered'],['answered','qualified'],['qualified','meetingScheduled'],['meetingCompleted','signed']],
  landlord:[['call','answered'],['answered','qualified'],['qualified','signed']],
  all:[['call','answered'],['answered','qualified'],['qualified','meetingScheduled'],['meetingCompleted','signed']],
};
const STAGE_NAMES={
  call:'שיחות', answered:'נענו', qualified:'שיחות איכותיות', meetingScheduled:'פגישות שנקבעו',
  meetingCompleted:'פגישות שהתקיימו', signed:'הסכמים שנחתמו',
  saleClosed:'עסקאות מכירה שנסגרו', rentalClosed:'עסקאות השכרה שנסגרו',
};
const STAGE_SHORT={
  call:'שיחה', answered:'נענו', qualified:'שיחה איכותית', meetingScheduled:'פגישה נקבעה',
  meetingCompleted:'פגישה התקיימה', signed:'נחתם',
  saleClosed:'מכירה נסגרה', rentalClosed:'השכרה נסגרה',
};
// "Signed" reads differently per audience (exclusivity vs. brokerage
// agreement) — used only in the Stats conversion section's labels.
const SIGNED_SHORT={ seller:'נחתמה בלעדיות', buyer:'נחתם הסכם תיווך', landlord:'נחתם הסכם תיווך', all:'נחתם' };

/* ---------- State / persistence ---------- */
const STORAGE_KEY='cadence.v1';
// מחשבון יעדים defaults. "mine" mode reads real ratios from state.events;
// "manual" mode uses the `manual` block below, pre-filled from real data
// when there's enough of it, otherwise these sensible starting points.
const DEFAULT_CALC={
  mode:'mine',
  income:300000, marketingMonthly:1500, splitPct:50, workMonths:12, weeksPerMonth:4.33, daysPerWeek:6,
  avgPrice:1800000, commissionPct:2, exclusivityToSalePct:60,
  rentalCommission:6000, brokerageToRentalPct:50,
  mixSalesPct:70, mixRentalsPct:30,
  manual:{ callsPerDay:20, answeredPct:40, qualifiedPct:50, meetingPct:40, meetingCompletionPct:70, signedPct:20 },
};
const DEFAULT_STATE={
  events:[],                       // {id, ts, dateKey, audience, kind, label, deltas}
  goals:{call:25, meetingCompleted:3},
  audience:'seller',
  calc:structuredClone(DEFAULT_CALC),
};
let state=loadState();
let ui={ activeDate:todayKey(), view:'dashboard', range:'today', filter:'all', customFrom:null, customTo:null };
let currentUserId=null; // set once signed in; gates all cloud writes

function mergeCalc(saved){
  const c=structuredClone(DEFAULT_CALC);
  if(saved&&typeof saved==='object'){
    Object.assign(c, saved);
    c.manual=Object.assign(structuredClone(DEFAULT_CALC.manual), saved.manual||{});
  }
  return c;
}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return structuredClone(DEFAULT_STATE);
    const s=JSON.parse(raw);
    return {
      events:Array.isArray(s.events)?s.events:[],
      goals:Object.assign({call:25,meetingCompleted:3}, s.goals||{}),
      audience:AUDIENCES[s.audience]?s.audience:'seller',
      calc:mergeCalc(s.calc),
    };
  }catch(e){ console.warn('load failed',e); return structuredClone(DEFAULT_STATE); }
}
function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ toast('האחסון מלא — ייצאו גיבוי'); } }

/* ---------- Date helpers (local time) ---------- */
function todayKey(){ return keyOf(new Date()); }
function keyOf(d){ const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function parseKey(k){ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); }
function humanDate(k){
  if(k===todayKey())return 'היום';
  const y=new Date(); y.setDate(y.getDate()-1);
  if(k===keyOf(y))return 'אתמול';
  return parseKey(k).toLocaleDateString('he-IL',{weekday:'short',month:'short',day:'numeric'});
}
// Monday-start week containing `ref`.
function weekStart(ref){ const d=new Date(ref); const dow=(d.getDay()+6)%7; d.setDate(d.getDate()-dow); d.setHours(0,0,0,0); return d; }
function inRange(dateKey, range){
  if(range==='all')return true;
  if(range==='custom'){
    if(!ui.customFrom||!ui.customTo)return false;
    // YYYY-MM-DD strings compare chronologically; both endpoints inclusive.
    return dateKey>=ui.customFrom && dateKey<=ui.customTo;
  }
  const d=parseKey(dateKey), now=new Date();
  if(range==='today')return dateKey===todayKey();
  if(range==='week'){ const s=weekStart(now); return d>=s; }
  if(range==='month')return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
  return true;
}
// dd/mm/yyyy for display; the whole label is forced LTR in CSS.
function fmtDMY(key){ const [y,m,d]=key.split('-'); return `${d}/${m}/${y}`; }
function customRangeLabel(){ return `${fmtDMY(ui.customFrom)} – ${fmtDMY(ui.customTo)}`; }

/* ---------- Aggregation ---------- */
function emptyCounts(){ const o={}; COUNTERS.forEach(c=>o[c]=0); return o; }
function aggregate(filterFn){
  const c=emptyCounts();
  for(const ev of state.events){
    if(!filterFn(ev))continue;
    for(const k in ev.deltas){ if(k in c) c[k]+=ev.deltas[k]; }
  }
  COUNTERS.forEach(k=>{ if(c[k]<0)c[k]=0; });
  return c;
}
function dayCounts(dateKey, audience){
  return aggregate(ev=>ev.dateKey===dateKey && (!audience||ev.audience===audience));
}

/* ---------- Recording ---------- */
function record(kind,label,deltas,tone){
  const ev={ id:uid(), ts:Date.now(), dateKey:ui.activeDate, audience:state.audience, kind, label, deltas };
  state.events.push(ev); save();
  if(currentUserId) CadenceSync.enqueueUpsertEvent(CadenceSync.eventToRow(ev, currentUserId));
  renderDashboard();
  toast(label, tone==='gold'?'gold':'good');
}
function undoLast(){
  if(!state.events.length)return;
  const ev=state.events.pop(); save();
  if(currentUserId) CadenceSync.enqueueDeleteEvent(ev.id);
  renderDashboard();
  toast(`בוטל: ${ev.label}`,'undo');
}
// Queue the current goals + audience + calculator settings as one settings
// row (last-write-wins).
function pushSettings(){
  if(!currentUserId)return;
  CadenceSync.enqueueUpsertSettings({ user_id:currentUserId, goals:state.goals, audience:state.audience, calc_settings:state.calc });
}
// The calculator's inputs fire on every keystroke — debounce the cloud push
// so typing a number doesn't hammer the network, while the on-screen
// recompute still happens instantly (callers still call save() synchronously).
let pushSettingsTimer=null;
function pushSettingsDebounced(){
  clearTimeout(pushSettingsTimer);
  pushSettingsTimer=setTimeout(pushSettings, 700);
}

/* ---------- Toast ---------- */
let toastTimer=null;
function toast(msg,kind='good'){
  const t=document.getElementById('toast');
  const ico=kind==='undo'?ICONS.undo:kind==='gold'?ICONS.handshake:ICONS.check;
  t.className='toast '+(kind==='gold'?'gold':kind==='undo'?'undo':'');
  t.innerHTML=`<span class="t-icon"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round">${ico}</svg></span><span>${escapeHtml(msg)}</span>`;
  t.hidden=false; requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.hidden=true,300); }, 1900);
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
// Works even when opened via file:// where crypto.randomUUID may be missing.
function uid(){
  try{ if(crypto&&crypto.randomUUID)return crypto.randomUUID(); }catch(e){}
  return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
}

/* ============================================================
   Rendering — Dashboard
   ============================================================ */
function renderDashboard(){
  // audience segment
  document.querySelectorAll('#view-dashboard .seg-btn[data-audience]').forEach(b=>{
    b.classList.toggle('active', b.dataset.audience===state.audience);
  });
  document.getElementById('funnelAudienceLabel').textContent=AUDIENCES[state.audience].label;

  const counts=dayCounts(ui.activeDate, state.audience);
  renderFunnel(counts);
  renderGoals();
  renderFollowups();

  document.getElementById('undoBtn').disabled=state.events.length===0;
  // date pill + editing state
  const editing=ui.activeDate!==todayKey();
  document.getElementById('dateLabel').textContent=humanDate(ui.activeDate);
  document.getElementById('dateBtn').classList.toggle('editing',editing);
}

function renderFunnel(counts){
  const stages=FUNNELS[state.audience];
  const top=counts[stages[0]]||0;
  const el=document.getElementById('funnel');
  el.innerHTML=stages.map((st,i)=>{
    const v=counts[st]||0;
    const pctOfTop= top>0 ? Math.max(v/top,0) : 0;
    // width tapers with funnel depth even when empty, for the classic shape
    const shape=1-(i/(stages.length))*0.34;
    const trackW=(shape*100).toFixed(1);
    const fillW=(pctOfTop*100).toFixed(1);
    const isGold= st==='signed';
    const grad=isGold
      ? 'linear-gradient(90deg,rgba(230,178,113,.32),rgba(230,178,113,.5))'
      : 'linear-gradient(90deg,rgba(110,155,255,.28),rgba(110,155,255,.42))';
    return `<div class="f-row ${v===0?'empty':''}">
      <div class="f-track" style="width:${trackW}%">
        <div class="f-fill" style="width:${fillW}%;background:${grad}"></div>
        <div class="f-content">
          <span class="f-name">${STAGE_NAMES[st]}</span>
          <span class="f-val">${v}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderGoals(){
  // Goals are global for the day (all audiences combined).
  const c=dayCounts(ui.activeDate,null);
  const rows=[
    {key:'call', name:'שיחות', val:c.call, goal:state.goals.call},
    {key:'meetingCompleted', name:'פגישות שהתקיימו', val:c.meetingCompleted, goal:state.goals.meetingCompleted},
  ];
  document.getElementById('goals').innerHTML=rows.map(r=>{
    const pct= r.goal>0 ? Math.min(r.val/r.goal*100,100) : 0;
    const done= r.goal>0 && r.val>=r.goal;
    const color= done? 'var(--good)' : (r.key==='call'?'var(--accent)':'var(--gold)');
    return `<div class="goal ${done?'done':''}">
      <div class="goal-top">
        <span class="goal-name">${r.name}</span>
        <span class="goal-nums" dir="ltr">${r.val} <span class="goal-goal">/ ${r.goal}</span></span>
      </div>
      <div class="goal-bar"><i style="width:${pct}%;background:${color}"></i></div>
    </div>`;
  }).join('');
}

function renderFollowups(){
  const list=FOLLOWUPS[state.audience];
  document.getElementById('followups').innerHTML=list.map(f=>
    `<button class="fu-btn ${f.full?'full':''} press" data-fu="${f.key}" ${f.tone?`data-tone="${f.tone}"`:''} type="button">
      <span data-icon="${f.icon}"></span><span>${f.name}</span>
    </button>`).join('');
  paintIcons(document.getElementById('followups'));
}

/* ============================================================
   Sheets: call result, adjust, date, goals
   ============================================================ */
const sheet=document.getElementById('sheet');
const sheetBody=document.getElementById('sheetBody');
const sheetTitle=document.getElementById('sheetTitle');
function openSheet(title){ sheetTitle.textContent=title; sheet.hidden=false; }
function closeSheet(){ sheet.hidden=true; sheetBody.innerHTML=''; }

function openCallSheet(){
  const results=CALL_RESULTS[state.audience];
  openSheet(`${AUDIENCES[state.audience].label} — תוצאת שיחה`);
  sheetBody.innerHTML=`<div class="result-grid">${results.map((r,i)=>
    `<button class="result-btn press" data-result="${r.key}" ${r.tone?`data-tone="${r.tone}"`:''} type="button">
      <span class="result-rank">${i+1}</span>
      <span class="result-main">
        <span class="result-name">${r.name}</span>
        <span class="result-desc">${r.desc}</span>
      </span>
    </button>`).join('')}</div>`;
  sheetBody.querySelectorAll('[data-result]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const r=results.find(x=>x.key===btn.dataset.result);
      record('call', r.name, {...r.deltas}, r.tone);
      closeSheet();
    });
  });
}

function openAdjustSheet(){
  const stages=[...FUNNELS[state.audience], ...(DEAL_COUNTERS[state.audience]||[])];
  openSheet(`תיקון סכומים — ${AUDIENCES[state.audience].label}`);
  const base=dayCounts(ui.activeDate,state.audience);
  const working={...base};
  const editingOther= ui.activeDate!==todayKey();
  sheetBody.innerHTML=`
    ${editingOther?`<div class="editing-banner"><span data-icon="edit"></span>עריכת ${humanDate(ui.activeDate)}</div>`:''}
    <p class="muted-p">התאימו שלב כדי לשקף את המציאות. השינויים נרשמים כך שתמיד אפשר לבטל.</p>
    <div id="adjRows">${stages.map(st=>`
      <div class="adj-row" data-stage="${st}">
        <span class="adj-name">${STAGE_NAMES[st]}</span>
        <div class="adj-stepper">
          <button class="step-btn" data-dir="-1" type="button" aria-label="הפחתת ${STAGE_NAMES[st]}">−</button>
          <span class="adj-count">${working[st]}</span>
          <button class="step-btn" data-dir="1" type="button" aria-label="הוספת ${STAGE_NAMES[st]}">+</button>
        </div>
      </div>`).join('')}</div>
    <button class="sheet-cta press" id="adjSave" type="button">שמירת תיקונים</button>`;
  paintIcons(sheetBody);
  sheetBody.querySelectorAll('.adj-row').forEach(row=>{
    const st=row.dataset.stage, out=row.querySelector('.adj-count');
    row.querySelectorAll('.step-btn').forEach(b=>b.addEventListener('click',()=>{
      working[st]=Math.max(0, working[st]+Number(b.dataset.dir));
      out.textContent=working[st];
    }));
  });
  document.getElementById('adjSave').addEventListener('click',()=>{
    const deltas={}; let any=false;
    stages.forEach(st=>{ const d=working[st]-base[st]; if(d!==0){ deltas[st]=d; any=true; } });
    if(any){
      const ev={ id:uid(), ts:Date.now(), dateKey:ui.activeDate,
        audience:state.audience, kind:'adjust', label:'תיקון ידני', deltas };
      state.events.push(ev); save();
      if(currentUserId) CadenceSync.enqueueUpsertEvent(CadenceSync.eventToRow(ev, currentUserId));
      renderDashboard(); toast('הסכומים תוקנו','good');
    }
    closeSheet();
  });
}

function openDateSheet(){
  openSheet('בחירת יום');
  const y=new Date(); y.setDate(y.getDate()-1);
  sheetBody.innerHTML=`
    <input class="date-field" type="date" id="datePick" value="${ui.activeDate}" max="${todayKey()}" />
    <div class="date-quick">
      <button class="ghost-wide press" data-day="${todayKey()}" type="button">היום</button>
      <button class="ghost-wide press" data-day="${keyOf(y)}" type="button">אתמול</button>
    </div>
    <button class="sheet-cta press" id="dateGo" type="button">מעבר ליום זה</button>`;
  const pick=document.getElementById('datePick');
  sheetBody.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{ pick.value=b.dataset.day; }));
  document.getElementById('dateGo').addEventListener('click',()=>{
    if(pick.value){ ui.activeDate=pick.value; renderDashboard(); if(ui.view==='data')renderData(); }
    closeSheet();
  });
}

// Custom statistics range: pick מתאריך / עד תאריך, then show the data.
function openCustomRangeSheet(){
  openSheet('טווח מותאם');
  // Default to the last 30 days ending today when nothing is set yet.
  const d30=new Date(); d30.setDate(d30.getDate()-29);
  const from=ui.customFrom||keyOf(d30);
  const to=ui.customTo||todayKey();
  sheetBody.innerHTML=`
    <p class="muted-p">בחרו טווח תאריכים להצגת הסטטיסטיקות.</p>
    <label class="range-field-label" for="rangeFrom">מתאריך</label>
    <input class="date-field" type="date" id="rangeFrom" value="${from}" />
    <label class="range-field-label" for="rangeTo">עד תאריך</label>
    <input class="date-field" type="date" id="rangeTo" value="${to}" />
    <button class="sheet-cta press" id="rangeGo" type="button">הצג נתונים</button>`;
  document.getElementById('rangeGo').addEventListener('click',()=>{
    let a=document.getElementById('rangeFrom').value, b=document.getElementById('rangeTo').value;
    if(!a||!b){ toast('בחרו תאריך התחלה וסיום'); return; }
    if(a>b){ const t=a; a=b; b=t; }   // tolerate reversed input
    ui.customFrom=a; ui.customTo=b; ui.range='custom';
    renderStats(); closeSheet();
  });
}

function openGoalsSheet(){
  openSheet('יעדים יומיים');
  sheetBody.innerHTML=`
    <p class="muted-p">יעד אחד לכל היום, משותף לכל סוגי הקהל.</p>
    <div class="adj-row">
      <span class="adj-name">שיחות ליום</span>
      <div class="adj-stepper">
        <button class="step-btn" data-g="call" data-dir="-1" type="button">−</button>
        <span class="adj-count" id="gcall">${state.goals.call}</span>
        <button class="step-btn" data-g="call" data-dir="1" type="button">+</button>
      </div>
    </div>
    <div class="adj-row">
      <span class="adj-name">פגישות שהתקיימו ליום</span>
      <div class="adj-stepper">
        <button class="step-btn" data-g="meetingCompleted" data-dir="-1" type="button">−</button>
        <span class="adj-count" id="gmeet">${state.goals.meetingCompleted}</span>
        <button class="step-btn" data-g="meetingCompleted" data-dir="1" type="button">+</button>
      </div>
    </div>
    <button class="sheet-cta press" id="goalsSave" type="button">שמירת יעדים</button>`;
  const draft={...state.goals};
  sheetBody.querySelectorAll('.step-btn').forEach(b=>b.addEventListener('click',()=>{
    const g=b.dataset.g, step= g==='call'?1:1;
    draft[g]=Math.max(0, draft[g]+Number(b.dataset.dir)*step);
    document.getElementById(g==='call'?'gcall':'gmeet').textContent=draft[g];
  }));
  document.getElementById('goalsSave').addEventListener('click',()=>{
    state.goals=draft; save(); pushSettings(); renderDashboard(); toast('היעדים עודכנו'); closeSheet();
  });
}

/* ============================================================
   Rendering — Stats
   ============================================================ */
function fmtPct(num,den){ if(den<=0)return null; return Math.round(num/den*100); }
function fmtRatio(num,den){ if(den<=0)return null; return (num/den); }

function renderStats(){
  document.querySelectorAll('#rangeSeg .seg-btn').forEach(b=>b.classList.toggle('active',b.dataset.range===ui.range));
  document.querySelectorAll('#audFilterSeg .seg-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===ui.filter));

  // Custom-range caption: shows the active range and re-opens the picker.
  const info=document.getElementById('customRangeInfo');
  if(ui.range==='custom' && ui.customFrom && ui.customTo){
    info.hidden=false;
    info.innerHTML=`<span data-icon="calendar"></span><span class="cri-dates">${customRangeLabel()}</span>`;
    paintIcons(info);
  }else{ info.hidden=true; }

  const c=aggregate(ev=> inRange(ev.dateKey,ui.range) && (ui.filter==='all'||ev.audience===ui.filter));

  const answerRate=fmtPct(c.answered,c.call);
  const meetCompRate=fmtPct(c.meetingCompleted,c.meetingScheduled);

  const tiles=[
    {label:'סה"כ שיחות', icon:'phone', val:c.call, cls:'accent'},
    {label:'אחוז מענה', icon:'percent', val: answerRate===null?'—':answerRate+'%', sub: answerRate===null?'אין מספיק נתונים':`${c.answered} מתוך ${c.call}`, cls:'accent', small:answerRate===null},
    {label:'שיחות איכותיות', icon:'users', val:c.qualified},
    {label:'פגישות שנקבעו', icon:'calendar', val:c.meetingScheduled},
    {label:'פגישות שהתקיימו', icon:'calcheck', val:c.meetingCompleted},
    {label:'הסכמים שנחתמו', icon:'handshake', val:c.signed, cls:'gold'},
    {label:'אחוז השלמת פגישות', icon:'percent', val: meetCompRate===null?'—':meetCompRate+'%', sub: meetCompRate===null?'אין מספיק נתונים':`${c.meetingCompleted} מתוך ${c.meetingScheduled}`, span2:true, cls:'accent', small:meetCompRate===null},
  ];
  document.getElementById('statTiles').innerHTML=tiles.map(t=>
    `<div class="tile ${t.cls||''} ${t.span2?'span2':''}">
      <span class="tile-label"><span data-icon="${t.icon}"></span>${t.label}</span>
      <span class="tile-val ${t.small?'small':''}">${t.val}</span>
      ${t.sub?`<span class="tile-sub">${t.sub}</span>`:''}
    </div>`).join('');
  paintIcons(document.getElementById('statTiles'));

  renderTrend();
  renderConversions(c);
  renderRatios(c);
}

/* Trend chart — daily (or weekly) buckets of calls, with gold dots on days
   that closed a completed meeting. Adapts its window to the selected range. */
function buildTrend(){
  const audOk=ev=>(ui.filter==='all'||ev.audience===ui.filter);
  const now=new Date();
  const buckets=[];
  if(ui.range==='custom' && ui.customFrom && ui.customTo){
    // Adapt bucket size to the span so a long range stays readable:
    // <=31 days daily, <=~6 months weekly, otherwise monthly.
    const from=parseKey(ui.customFrom), to=parseKey(ui.customTo);
    const span=Math.round((to-from)/86400000)+1;
    if(span<=31){
      for(let d=new Date(from); d<=to; d.setDate(d.getDate()+1))
        buckets.push({label:String(d.getDate()), dk:keyOf(d)});
    }else if(span<=186){
      for(let s=weekStart(from); s<=to; ){ const e=new Date(s); e.setDate(e.getDate()+7);
        buckets.push({label:`${s.getDate()}/${s.getMonth()+1}`, from:new Date(s), to:e}); s=e; }
    }else{
      for(let s=new Date(from.getFullYear(),from.getMonth(),1); s<=to; ){ const e=new Date(s.getFullYear(),s.getMonth()+1,1);
        buckets.push({label:`${s.getMonth()+1}/${String(s.getFullYear()).slice(2)}`, from:new Date(s), to:e}); s=e; }
    }
    document.getElementById('trendLabel').textContent=customRangeLabel();
  }else if(ui.range==='all'){
    const start=weekStart(now);
    for(let i=11;i>=0;i--){ const s=new Date(start); s.setDate(s.getDate()-i*7); const e=new Date(s); e.setDate(e.getDate()+7);
      buckets.push({label:`${s.getDate()}/${s.getMonth()+1}`, from:s, to:e}); }
    document.getElementById('trendLabel').textContent='12 השבועות האחרונים';
  }else{
    const days= ui.range==='month'?30:7;
    for(let i=days-1;i>=0;i--){ const d=new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
      buckets.push({label:String(d.getDate()), dk:keyOf(d)}); }
    document.getElementById('trendLabel').textContent=`${days} הימים האחרונים`;
  }
  buckets.forEach(b=>{
    let calls=0, meets=0;
    for(const ev of state.events){
      if(!audOk(ev))continue;
      const inb = b.dk!==undefined ? ev.dateKey===b.dk : (()=>{ const d=parseKey(ev.dateKey); return d>=b.from && d<b.to; })();
      if(!inb)continue;
      calls+=ev.deltas.call||0; meets+=ev.deltas.meetingCompleted||0;
    }
    b.calls=Math.max(0,calls); b.meets=Math.max(0,meets);
  });
  return buckets;
}
function renderTrend(){
  const el=document.getElementById('trendChart');
  const data=buildTrend();
  const total=data.reduce((s,b)=>s+b.calls,0);
  if(total===0){ el.classList.remove('dense'); el.innerHTML='<div class="log-empty">עדיין אין מספיק נתונים.</div>'; return; }
  const maxC=Math.max(1,...data.map(d=>d.calls));
  el.classList.toggle('dense', data.length>10);
  el.innerHTML=data.map(b=>{
    const h=(b.calls/maxC*100).toFixed(1);
    return `<div class="tcol" title="${b.label}: ${b.calls} שיחות, ${b.meets} פגישות שהתקיימו">
      <div class="tbar-wrap">
        ${b.meets>0?`<span class="tdot"></span>`:''}
        <div class="tbar" style="height:${h}%"></div>
      </div>
      <span class="tlabel">${b.label}</span>
    </div>`;
  }).join('');
}

function renderConversions(c){
  const steps=CONV_STEPS[ui.filter] || CONV_STEPS.all;
  document.getElementById('convFunnelLabel').textContent= ui.filter==='all'?'משפך מלא':AUDIENCES[ui.filter].label;
  const signedLabel=SIGNED_SHORT[ui.filter]||SIGNED_SHORT.all;
  const rows=steps.map(([from,to])=>{
    const pct=fmtPct(c[to],c[from]);
    const toLabel = to==='signed' ? signedLabel : STAGE_SHORT[to];
    // RTL: 'from' is logical-first so it sits on the right; the arrow points
    // left toward 'to', matching the funnel's right-to-left progression.
    return `<div class="conv">
      <div class="conv-top">
        <span class="conv-stages">${STAGE_SHORT[from]} ← ${toLabel}</span>
        <span class="conv-pct">${pct===null?'<span style="color:var(--muted-2);font-weight:600">אין מספיק נתונים</span>':pct+'%'}</span>
      </div>
      <div class="conv-bar"><i style="width:${pct===null?0:Math.min(pct,100)}%"></i></div>
    </div>`;
  });
  document.getElementById('conversions').innerHTML=rows.join('');
}

function renderRatios(c){
  function ratioLine(name, num, den, unit){
    const r=fmtRatio(num,den);
    if(r===null)return {name, val:'אין מספיק נתונים', nd:true};
    const shown= r>=10 ? Math.round(r) : (Math.round(r*10)/10);
    return {name, val:`${shown} ${unit}`, nd:false};
  }
  const lines=[
    ratioLine('שיחות לכל פגישה שנקבעה', c.call, c.meetingScheduled, 'שיחות'),
    ratioLine('שיחות לכל הסכם שנחתם', c.call, c.signed, 'שיחות'),
    ratioLine('פגישות לכל הסכם שנחתם', c.meetingCompleted, c.signed, 'פגישות'),
  ];
  document.getElementById('ratios').innerHTML=lines.map(l=>
    `<div class="ratio">
      <span class="ratio-name">${l.name}</span>
      <span class="ratio-val ${l.nd?'nd':''}">${l.val}</span>
    </div>`).join('');
}

/* ============================================================
   Rendering — Data / activity log
   ============================================================ */
function updateSyncStatus(){
  const el=document.getElementById('syncStatus'); if(!el)return;
  const n= currentUserId ? CadenceSync.pendingCount() : 0;
  el.textContent = n>0 ? `מסנכרן… (${n} ממתינים)` : 'מסונכרן';
}

function renderData(){
  updateSyncStatus();
  document.getElementById('logDateLabel').textContent=humanDate(ui.activeDate);
  const evs=state.events.filter(e=>e.dateKey===ui.activeDate).slice().sort((a,b)=>b.ts-a.ts);
  const box=document.getElementById('activityLog');
  if(!evs.length){ box.innerHTML=`<div class="log-empty">לא נרשמה פעילות עבור ${humanDate(ui.activeDate)}.</div>`; return; }
  box.innerHTML=evs.map(e=>{
    const t=new Date(e.ts).toLocaleTimeString('he-IL',{hour:'numeric',minute:'2-digit'});
    const dotCls= e.kind==='adjust'?'adjust':(e.deltas.signed?'gold':'');
    const parts=Object.entries(e.deltas).map(([k,v])=>`${v>0?'+':''}${v} ${STAGE_SHORT[k]||k}`).join(' · ');
    return `<div class="log-item">
      <span class="log-dot ${dotCls}"></span>
      <span class="log-main">
        <span class="log-title">${escapeHtml(e.label)} <span style="color:var(--muted-2);font-weight:500">· ${AUDIENCES[e.audience]?.label||e.audience}</span></span>
        <span class="log-meta">${parts}</span>
      </span>
      <span class="log-time">${t}</span>
    </div>`;
  }).join('');
}

/* ============================================================
   מחשבון יעדים — goal calculator
   Connects an annual income target to the same real call/conversion data
   already tracked elsewhere in the app. Two modes:
   - "mine": the funnel ratios are read straight from aggregate() — the
     exact same numbers the Stats screen already shows.
   - "manual": those same ratio fields become user-editable, pre-filled
     from real data as a starting point, so testing a scenario never
     touches the real stored stats.
   ============================================================ */
function fmtInt(n){ return (n===null||n===undefined||!isFinite(n)) ? 'אין מספיק נתונים' : Math.round(n).toLocaleString('he-IL'); }
function fmtMoney(n){ return (n===null||n===undefined||!isFinite(n)) ? 'אין מספיק נתונים' : '₪'+Math.round(n).toLocaleString('he-IL'); }
function fmtSigned(n){ if(n===null||n===undefined||!isFinite(n))return 'אין מספיק נתונים'; const s=Math.round(n).toLocaleString('he-IL'); return n>0?'+'+s:s; }

// Real funnel ratios (%) computed from every stored event, all audiences,
// all time — reuses aggregate(), the exact same helper Stats is built on.
function getRealFunnelRatios(){
  const c=aggregate(()=>true);
  const activeDays=new Set();
  state.events.forEach(ev=>{ if(ev.deltas.call>0)activeDays.add(ev.dateKey); });
  const n=activeDays.size;
  const avgCallsPerActiveDay = n>0 ? c.call/n : 0;
  const answeredPct = c.call>0 ? c.answered/c.call*100 : 0;
  const qualifiedPct = c.answered>0 ? c.qualified/c.answered*100 : 0;
  const meetingPct = c.qualified>0 ? c.meetingScheduled/c.qualified*100 : 0;
  const meetingCompletionPct = c.meetingScheduled>0 ? c.meetingCompleted/c.meetingScheduled*100 : 0;
  const signedPct = c.meetingCompleted>0 ? c.signed/c.meetingCompleted*100 : 0;
  const ok = c.call>0 && c.answered>0 && c.qualified>0 && c.meetingScheduled>0 && c.meetingCompleted>0 && c.signed>0;
  return { raw:c, activeDays:n, avgCallsPerActiveDay, answeredPct, qualifiedPct, meetingPct, meetingCompletionPct, signedPct, ok };
}

// The full calculation: financial target -> required deals -> required
// signed agreements -> walked back through the call funnel -> required
// calls, plus a real-pace forecast for comparison.
function runCalculator(){
  const calc=state.calc, real=getRealFunnelRatios();
  const usingReal = calc.mode==='mine';
  const insufficientReal = usingReal && !real.ok;

  const r = (usingReal && real.ok) ? {
    answeredPct:real.answeredPct, qualifiedPct:real.qualifiedPct, meetingPct:real.meetingPct,
    meetingCompletionPct:real.meetingCompletionPct, signedPct:real.signedPct, callsPerDay:real.avgCallsPerActiveDay,
  } : {
    answeredPct:calc.manual.answeredPct, qualifiedPct:calc.manual.qualifiedPct, meetingPct:calc.manual.meetingPct,
    meetingCompletionPct:calc.manual.meetingCompletionPct, signedPct:calc.manual.signedPct, callsPerDay:calc.manual.callsPerDay,
  };

  const annualMarketing = calc.marketingMonthly*calc.workMonths;
  const userShareNeeded = calc.income+annualMarketing;
  const splitFactor = 1-(calc.splitPct/100);
  const grossCommissionNeeded = splitFactor>0 ? userShareNeeded/splitFactor : null;

  const mixSales=calc.mixSalesPct/100, mixRentals=calc.mixRentalsPct/100;
  const fullSaleCommission = calc.avgPrice*(calc.commissionPct/100);
  const revenueSalesNeeded = grossCommissionNeeded!==null ? grossCommissionNeeded*mixSales : null;
  const revenueRentalsNeeded = grossCommissionNeeded!==null ? grossCommissionNeeded*mixRentals : null;

  const dealsSalesRaw = (revenueSalesNeeded!==null && fullSaleCommission>0) ? revenueSalesNeeded/fullSaleCommission : null;
  const dealsRentalsRaw = (revenueRentalsNeeded!==null && calc.rentalCommission>0) ? revenueRentalsNeeded/calc.rentalCommission : null;
  const dealsSalesNeeded = dealsSalesRaw!==null ? Math.ceil(dealsSalesRaw) : null;
  const dealsRentalsNeeded = dealsRentalsRaw!==null ? Math.ceil(dealsRentalsRaw) : null;
  const dealsTotalNeeded = (dealsSalesNeeded||0)+(dealsRentalsNeeded||0);

  // Rounding whole-deal counts up means the achievable result usually
  // slightly *exceeds* the target — recompute the real resulting numbers
  // from those rounded counts so "פער מול היעד" reflects that surplus
  // rather than trivially reading zero. If the plan itself is impossible
  // (e.g. a 100% RE/MAX split), keep these null too rather than showing a
  // misleading ₪0/negative figure derived from a meaningless base.
  const planPossible = grossCommissionNeeded!==null;
  const achievedRevenue = planPossible ? (dealsSalesNeeded||0)*fullSaleCommission + (dealsRentalsNeeded||0)*calc.rentalCommission : null;
  const achievedUserShare = planPossible ? achievedRevenue*splitFactor : null;
  const achievedNetIncome = planPossible ? achievedUserShare-annualMarketing : null;
  const gapVsTarget = planPossible ? achievedNetIncome-calc.income : null;

  const signedNeededSales = (dealsSalesNeeded!==null && calc.exclusivityToSalePct>0) ? dealsSalesNeeded/(calc.exclusivityToSalePct/100) : null;
  const signedNeededRentals = (dealsRentalsNeeded!==null && calc.brokerageToRentalPct>0) ? dealsRentalsNeeded/(calc.brokerageToRentalPct/100) : null;
  const signedNeededTotal = (signedNeededSales===null&&signedNeededRentals===null) ? null : (signedNeededSales||0)+(signedNeededRentals||0);

  // In "לפי הנתונים שלי" mode with insufficient real data, don't silently
  // fall back to the hidden manual defaults for anything that depends on
  // conversion rates — that would compute a number the user never entered
  // and can't see. Show "not enough data" for those instead; the deal/
  // financial numbers above are unaffected since they don't depend on r.
  const rOk = !insufficientReal;
  const meetingsCompletedNeeded = (rOk && signedNeededTotal!==null && r.signedPct>0) ? signedNeededTotal/(r.signedPct/100) : null;
  const meetingsScheduledNeeded = (meetingsCompletedNeeded!==null && r.meetingCompletionPct>0) ? meetingsCompletedNeeded/(r.meetingCompletionPct/100) : null;
  const qualifiedNeeded = (meetingsScheduledNeeded!==null && r.meetingPct>0) ? meetingsScheduledNeeded/(r.meetingPct/100) : null;
  const answeredNeeded = (qualifiedNeeded!==null && r.qualifiedPct>0) ? qualifiedNeeded/(r.qualifiedPct/100) : null;
  const callsNeeded = (answeredNeeded!==null && r.answeredPct>0) ? answeredNeeded/(r.answeredPct/100) : null;

  const workingDaysPerYear = calc.workMonths*calc.weeksPerMonth*calc.daysPerWeek;
  const callsPerMonth = callsNeeded!==null ? callsNeeded/calc.workMonths : null;
  const callsPerWeek = callsNeeded!==null ? callsNeeded/(calc.workMonths*calc.weeksPerMonth) : null;
  const callsPerWorkDay = (callsNeeded!==null && workingDaysPerYear>0) ? callsNeeded/workingDaysPerYear : null;
  const meetingsPerMonth = meetingsCompletedNeeded!==null ? meetingsCompletedNeeded/calc.workMonths : null;
  const signedPerMonth = signedNeededTotal!==null ? signedNeededTotal/calc.workMonths : null;
  const dealsPerQuarter = dealsTotalNeeded/4;

  let comparison=null;
  if(real.ok){
    const projectedAnnualCalls = real.avgCallsPerActiveDay*workingDaysPerYear;
    const projAnswered = projectedAnnualCalls*(real.answeredPct/100);
    const projQualified = projAnswered*(real.qualifiedPct/100);
    const projMeetingsSched = projQualified*(real.meetingPct/100);
    const projMeetingsDone = projMeetingsSched*(real.meetingCompletionPct/100);
    const projSigned = projMeetingsDone*(real.signedPct/100);
    const projSalesDeals = projSigned*mixSales*(calc.exclusivityToSalePct/100);
    const projRentalDeals = projSigned*mixRentals*(calc.brokerageToRentalPct/100);
    const projRevenue = projSalesDeals*fullSaleCommission + projRentalDeals*calc.rentalCommission;
    const projNetIncome = projRevenue*splitFactor-annualMarketing;
    const forecastGap = projNetIncome-calc.income;
    const extraCallsPerDay = callsPerWorkDay!==null ? Math.max(0, callsPerWorkDay-real.avgCallsPerActiveDay) : null;
    const extraMeetingsPerMonth = meetingsPerMonth!==null ? Math.max(0, meetingsPerMonth-(projMeetingsDone/calc.workMonths)) : null;
    const extraSignedTotal = signedNeededTotal!==null ? Math.max(0, signedNeededTotal-projSigned) : null;
    const realistic = forecastGap>=0 ? 'good' : (forecastGap>=-Math.abs(calc.income)*0.2 ? 'close' : 'far');
    comparison={ projectedAnnualCalls, projNetIncome, forecastGap, extraCallsPerDay, extraMeetingsPerMonth, extraSignedTotal, realistic };
  }

  return { insufficientReal, real, usingReal, annualMarketing, grossCommissionNeeded, achievedUserShare, achievedNetIncome, gapVsTarget,
    dealsSalesNeeded, dealsRentalsNeeded, dealsTotalNeeded, signedNeededTotal,
    meetingsCompletedNeeded, meetingsScheduledNeeded, qualifiedNeeded, callsNeeded,
    callsPerMonth, callsPerWeek, callsPerWorkDay, meetingsPerMonth, signedPerMonth, dealsPerQuarter,
    comparison };
}

const CALC_FIELDS=[
  ['income','number'],['marketingMonthly','number'],['splitPct','pct'],
  ['workMonths','number'],['weeksPerMonth','number'],['daysPerWeek','number'],
  ['avgPrice','number'],['commissionPct','pct'],['exclusivityToSalePct','pct'],
  ['rentalCommission','number'],['brokerageToRentalPct','pct'],
];
const CALC_MANUAL_FIELDS=[
  ['callsPerDay','number'],['answeredPct','pct'],['qualifiedPct','pct'],
  ['meetingPct','pct'],['meetingCompletionPct','pct'],['signedPct','pct'],
];

function calcField(key,label,value,manual){
  const path = manual? `manual.${key}` : key;
  const step = key.endsWith('Pct') ? '0.1' : 'any';
  return `<div class="calc-row">
    <label class="calc-label" for="cf_${key}">${label}</label>
    <input class="num-field" id="cf_${key}" type="number" step="${step}" inputmode="decimal"
      data-calc-key="${path}" value="${value}" />
  </div>`;
}

function renderCalcInputs(){
  const calc=state.calc;
  document.querySelectorAll('#calcModeSeg .seg-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===calc.mode));

  document.getElementById('calcGeneral').innerHTML=[
    calcField('income','יעד הכנסה שנתית נטו לפני מס (₪)',calc.income),
    calcField('marketingMonthly','הוצאות שיווק חודשיות (₪)',calc.marketingMonthly),
    calcField('splitPct','אחוז חלוקה ל-RE/MAX (%)',calc.splitPct),
    calcField('workMonths','חודשי עבודה בשנה',calc.workMonths),
    calcField('weeksPerMonth','שבועות ממוצעים בחודש',calc.weeksPerMonth),
    calcField('daysPerWeek','ימי עבודה בשבוע',calc.daysPerWeek),
  ].join('');

  const fullCommission = calc.avgPrice*(calc.commissionPct/100);
  document.getElementById('calcSales').innerHTML=[
    calcField('avgPrice','מחיר נכס ממוצע (₪)',calc.avgPrice),
    calcField('commissionPct','אחוז עמלה ממוצע (%)',calc.commissionPct),
    `<div class="calc-row"><span class="calc-label">עמלה מלאה מחושבת אוטומטית</span><span class="calc-computed">${fmtMoney(fullCommission)}</span></div>`,
    calcField('exclusivityToSalePct','אחוז חתימות בלעדיות שהופכות לעסקת מכירה (%)',calc.exclusivityToSalePct),
  ].join('');

  document.getElementById('calcRental').innerHTML=[
    calcField('rentalCommission','עמלה מלאה ממוצעת לעסקת השכרה (₪)',calc.rentalCommission),
    calcField('brokerageToRentalPct','אחוז הסכמי תיווך למשכירים שהופכים לעסקת השכרה (%)',calc.brokerageToRentalPct),
  ].join('');

  document.getElementById('calcMix').innerHTML=`
    <div class="calc-row"><label class="calc-label" for="cf_mixSalesPct">מכירות (%)</label>
      <input class="num-field" id="cf_mixSalesPct" type="number" step="1" inputmode="decimal" data-calc-key="mixSalesPct" value="${calc.mixSalesPct}" /></div>
    <div class="calc-row"><label class="calc-label" for="cf_mixRentalsPct">השכרות (%)</label>
      <input class="num-field" id="cf_mixRentalsPct" type="number" step="1" inputmode="decimal" data-calc-key="mixRentalsPct" value="${calc.mixRentalsPct}" /></div>
    <p class="calc-mix-total">סה"כ: <span id="calcMixTotal">${(calc.mixSalesPct+calc.mixRentalsPct).toFixed(0)}</span>%</p>`;

  const manualCard=document.getElementById('calcManualCard');
  if(calc.mode==='manual'){
    manualCard.hidden=false;
    const real=getRealFunnelRatios();
    document.getElementById('calcManual').innerHTML=CALC_MANUAL_FIELDS.map(([k,type])=>{
      const label={ callsPerDay:'שיחות ליום עבודה', answeredPct:'אחוז מענה (%)', qualifiedPct:'אחוז שיחות איכותיות מתוך הנענות (%)',
        meetingPct:'אחוז פגישות שנקבעות מתוך השיחות האיכותיות (%)', meetingCompletionPct:'אחוז השלמת פגישות (%)',
        signedPct:'אחוז חתימות מתוך פגישות שהתקיימו (%)' }[k];
      return calcField(k,label,calc.manual[k],true);
    }).join('') + (real.ok?'':'<p class="muted-p" style="margin-top:10px">אין עדיין מספיק נתונים אמיתיים למילוי אוטומטי — ההנחות שלמעלה הן נקודת התחלה סבירה, אפשר לשנות אותן בחופשיות.</p>');
  }else{
    manualCard.hidden=true;
  }

  paintIcons();
  renderCalcResults();
}

function renderCalcResults(){
  const calc=state.calc, res=runCalculator();

  const banner=document.getElementById('calcInsufficient');
  banner.hidden = !res.insufficientReal;

  document.getElementById('calcFinance').innerHTML=[
    ['מחזור עמלות נדרש לפני חלוקת RE/MAX', fmtMoney(res.grossCommissionNeeded)],
    ['חלק המשתמש לאחר החלוקה', fmtMoney(res.achievedUserShare)],
    ['הוצאות שיווק שנתיות', fmtMoney(res.annualMarketing)],
    ['הכנסה נטו צפויה לפני מס', fmtMoney(res.achievedNetIncome)],
    ['פער מול היעד', fmtSigned(res.gapVsTarget)],
  ].map(([n,v])=>`<div class="ratio"><span class="ratio-name">${n}</span><span class="ratio-val">${v}</span></div>`).join('');

  document.getElementById('calcDeals').innerHTML=[
    ['עסקאות מכירה נדרשות', fmtInt(res.dealsSalesNeeded)],
    ['עסקאות השכרה נדרשות', fmtInt(res.dealsRentalsNeeded)],
    ['סך העסקאות הנדרש', fmtInt(res.dealsTotalNeeded)],
  ].map(([n,v])=>`<div class="ratio"><span class="ratio-name">${n}</span><span class="ratio-val">${v}</span></div>`).join('');

  document.getElementById('calcActivity').innerHTML=[
    ['חתימות נדרשות', fmtInt(res.signedNeededTotal)],
    ['פגישות נדרשות', fmtInt(res.meetingsCompletedNeeded)],
    ['שיחות איכותיות נדרשות', fmtInt(res.qualifiedNeeded)],
    ['שיחות נדרשות', fmtInt(res.callsNeeded)],
  ].map(([n,v])=>`<div class="ratio"><span class="ratio-name">${n}</span><span class="ratio-val">${v}</span></div>`).join('');

  document.getElementById('calcTime').innerHTML=[
    ['שיחות בשנה', fmtInt(res.callsNeeded)],
    ['שיחות בחודש', fmtInt(res.callsPerMonth)],
    ['שיחות בשבוע', fmtInt(res.callsPerWeek)],
    ['שיחות ביום עבודה', fmtInt(res.callsPerWorkDay)],
    ['פגישות בחודש', fmtInt(res.meetingsPerMonth)],
    ['חתימות בחודש', fmtInt(res.signedPerMonth)],
    ['עסקאות ברבעון', fmtInt(res.dealsPerQuarter)],
    ['עסקאות בשנה', fmtInt(res.dealsTotalNeeded)],
  ].map(([n,v])=>`<div class="ratio"><span class="ratio-name">${n}</span><span class="ratio-val">${v}</span></div>`).join('');

  const cmpCard=document.getElementById('calcComparisonCard');
  if(res.comparison){
    cmpCard.hidden=false;
    const c=res.comparison;
    const badge={ good:['היעד ריאלי בקצב הנוכחי','var(--good)'], close:['קרוב ליעד — נדרש שיפור קל','var(--gold)'], far:['רחוק מהיעד — נדרש שיפור משמעותי','var(--danger)'] }[c.realistic];
    document.getElementById('calcComparison').innerHTML=[
      ['יעד שנתי', fmtMoney(calc.income)],
      ['תחזית שנתית לפי הקצב הנוכחי', fmtMoney(c.projNetIncome)],
      ['פער צפוי', fmtSigned(c.forecastGap)],
      ['שיחות נוספות ביום הדרושות', fmtInt(c.extraCallsPerDay)],
      ['פגישות נוספות בחודש הדרושות', fmtInt(c.extraMeetingsPerMonth)],
      ['חתימות נוספות הדרושות', fmtInt(c.extraSignedTotal)],
    ].map(([n,v])=>`<div class="ratio"><span class="ratio-name">${n}</span><span class="ratio-val">${v}</span></div>`).join('')
      + `<div class="calc-badge" style="color:${badge[1]};border-color:${badge[1]}">${badge[0]}</div>`;
  }else{
    cmpCard.hidden=true;
  }
}

function wireCalc(){
  document.getElementById('calcModeSeg').addEventListener('click',e=>{
    const b=e.target.closest('[data-mode]'); if(!b)return;
    state.calc.mode=b.dataset.mode;
    if(state.calc.mode==='manual'){
      // Switching into manual mode seeds it from real data as a starting
      // point (only if there's enough of it) — never resets a scenario
      // the user has already customized.
      const real=getRealFunnelRatios();
      if(real.ok && !state.calc._seededFromReal){
        Object.assign(state.calc.manual, {
          callsPerDay:Math.round(real.avgCallsPerActiveDay*10)/10,
          answeredPct:Math.round(real.answeredPct*10)/10, qualifiedPct:Math.round(real.qualifiedPct*10)/10,
          meetingPct:Math.round(real.meetingPct*10)/10, meetingCompletionPct:Math.round(real.meetingCompletionPct*10)/10,
          signedPct:Math.round(real.signedPct*10)/10,
        });
        state.calc._seededFromReal=true;
      }
    }
    save(); pushSettings(); renderCalcInputs();
  });

  // Delegated input handler covers every generated field, including ones
  // added later (manual card, mix pair) without re-wiring per render.
  document.getElementById('view-calc').addEventListener('input',e=>{
    const el=e.target.closest('[data-calc-key]'); if(!el)return;
    const val=parseFloat(el.value);
    if(isNaN(val))return;
    const path=el.dataset.calcKey;
    if(path.startsWith('manual.')) state.calc.manual[path.slice(7)]=val;
    else state.calc[path]=val;

    // Keep the sales/rentals mix pair summing to 100 automatically instead
    // of allowing (and having to validate against) an invalid total.
    if(path==='mixSalesPct'||path==='mixRentalsPct'){
      const other = path==='mixSalesPct' ? 'mixRentalsPct' : 'mixSalesPct';
      state.calc[other]=Math.max(0, 100-val);
      const otherEl=document.getElementById('cf_'+other);
      if(otherEl) otherEl.value=state.calc[other];
      const totalEl=document.getElementById('calcMixTotal');
      if(totalEl) totalEl.textContent=(state.calc.mixSalesPct+state.calc.mixRentalsPct).toFixed(0);
    }
    save(); pushSettingsDebounced();
    renderCalcResults();
  });
}

/* ============================================================
   Export / import
   ============================================================ */
function download(filename, text, type){
  const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportJSON(){
  download(`cadence-backup-${todayKey()}.json`, JSON.stringify(state,null,2), 'application/json');
  toast('הגיבוי יוצא');
}
function exportCSV(){
  const head=['date','time','audience','kind','label',...COUNTERS];
  const rows=[head.join(',')];
  state.events.slice().sort((a,b)=>a.ts-b.ts).forEach(e=>{
    const t=new Date(e.ts).toISOString();
    const cells=[e.dateKey,t,e.audience,e.kind,`"${String(e.label).replace(/"/g,'""')}"`,
      ...COUNTERS.map(k=>e.deltas[k]||0)];
    rows.push(cells.join(','));
  });
  download(`cadence-activity-${todayKey()}.csv`, rows.join('\n'), 'text/csv');
  toast('קובץ CSV יוצא');
}
function importJSON(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const s=JSON.parse(reader.result);
      if(!s||!Array.isArray(s.events))throw new Error('bad file');
      if(!confirm(`לייבא ${s.events.length} רשומות? פעולה זו תחליף את הנתונים הנוכחיים.`))return;
      state={ events:s.events, goals:Object.assign({call:25,meetingCompleted:3},s.goals||{}),
        audience:AUDIENCES[s.audience]?s.audience:'seller', calc:mergeCalc(s.calc) };
      save();
      if(currentUserId){
        // Upsert is idempotent, so queuing every imported row is safe even
        // if some were already in the cloud.
        state.events.forEach(ev=>CadenceSync.enqueueUpsertEvent(CadenceSync.eventToRow(ev,currentUserId)));
        pushSettings();
      }
      renderAll(); toast('הגיבוי שוחזר');
    }catch(e){ toast('לא ניתן לקרוא את הקובץ'); }
  };
  reader.readAsText(file);
}

/* ============================================================
   View switching + wiring
   ============================================================ */
function setView(v){
  ui.view=v;
  document.querySelectorAll('.view').forEach(s=>s.hidden = s.id!=='view-'+v);
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===v));
  // The top day selector belongs to day-based screens; Stats and the
  // calculator have their own scope, so hide it there to avoid confusion.
  document.getElementById('dateBtn').hidden = (v==='stats'||v==='calc');
  if(v==='dashboard')renderDashboard();
  if(v==='stats')renderStats();
  if(v==='data')renderData();
  if(v==='calc')renderCalcInputs();
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderAll(){
  renderDashboard();
  if(ui.view==='stats')renderStats();
  if(ui.view==='data')renderData();
  if(ui.view==='calc')renderCalcResults();
}

function wire(){
  paintIcons();
  // audience
  document.querySelectorAll('#view-dashboard .seg-btn[data-audience]').forEach(b=>
    b.addEventListener('click',()=>{ state.audience=b.dataset.audience; save(); pushSettings(); renderDashboard(); }));
  // primary
  document.getElementById('newCallBtn').addEventListener('click',openCallSheet);
  // follow-ups (delegated)
  document.getElementById('followups').addEventListener('click',e=>{
    const btn=e.target.closest('[data-fu]'); if(!btn)return;
    const f=FOLLOWUPS[state.audience].find(x=>x.key===btn.dataset.fu); if(!f)return;
    record('followup', f.name, {...f.deltas}, f.tone);
  });
  // corrections
  document.getElementById('undoBtn').addEventListener('click',undoLast);
  document.getElementById('adjustBtn').addEventListener('click',openAdjustSheet);
  document.getElementById('editGoalsBtn').addEventListener('click',openGoalsSheet);
  // date
  document.getElementById('dateBtn').addEventListener('click',openDateSheet);
  // sheet close
  document.getElementById('sheetClose').addEventListener('click',closeSheet);
  sheet.addEventListener('click',e=>{ if(e.target===sheet)closeSheet(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!sheet.hidden)closeSheet(); });
  // tabs
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>setView(t.dataset.view)));
  // stats segments
  document.getElementById('rangeSeg').addEventListener('click',e=>{ const b=e.target.closest('[data-range]'); if(!b)return;
    if(b.dataset.range==='custom'){ openCustomRangeSheet(); return; }
    ui.range=b.dataset.range; renderStats(); });
  document.getElementById('customRangeInfo').addEventListener('click',openCustomRangeSheet);
  document.getElementById('audFilterSeg').addEventListener('click',e=>{ const b=e.target.closest('[data-filter]'); if(!b)return; ui.filter=b.dataset.filter; renderStats(); });
  // data actions
  document.getElementById('exportJson').addEventListener('click',exportJSON);
  document.getElementById('exportCsv').addEventListener('click',exportCSV);
  document.getElementById('importBtn').addEventListener('click',()=>document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change',e=>{ if(e.target.files[0])importJSON(e.target.files[0]); e.target.value=''; });
  document.getElementById('resetBtn').addEventListener('click',async ()=>{
    if(confirm('למחוק את כל הנתונים במכשיר ומהענן? ייצאו גיבוי קודם — פעולה זו אינה הפיכה.')){
      state=structuredClone(DEFAULT_STATE); save(); ui.activeDate=todayKey();
      CadenceSync.clearOutbox();
      if(currentUserId){ try{ await CadenceSync.deleteAllCloudData(currentUserId); }catch(e){} }
      renderAll(); toast('כל הנתונים נמחקו','undo');
    }
  });

  // If the app is left open past midnight while showing today, roll to the new day.
  let lastToday=todayKey();
  setInterval(()=>{
    const t=todayKey();
    if(t!==lastToday){
      if(ui.activeDate===lastToday){ ui.activeDate=t; renderAll(); }
      lastToday=t;
    }
  }, 30000);

  wireCalc();
}

/* Offline support — register the service worker when served over http(s). */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

/* ============================================================
   Auth gate + cloud sync boot
   ============================================================ */
function showAuthScreen(){
  document.getElementById('app').hidden=true;
  document.getElementById('authScreen').hidden=false;
}
function showApp(){
  document.getElementById('authScreen').hidden=true;
  document.getElementById('app').hidden=false;
}

let authMode='signin';
function wireAuthForm(){
  const form=document.getElementById('authForm');
  const toggleBtn=document.getElementById('authToggleMode');
  const submitBtn=document.getElementById('authSubmit');
  const errEl=document.getElementById('authError');

  toggleBtn.addEventListener('click',()=>{
    authMode = authMode==='signin' ? 'signup' : 'signin';
    submitBtn.textContent = authMode==='signin' ? 'התחברות' : 'יצירת חשבון';
    toggleBtn.textContent = authMode==='signin' ? 'אין לי חשבון — יצירת חשבון חדש' : 'יש לי כבר חשבון — התחברות';
    errEl.hidden=true;
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!CadenceSync.isConfigured()){
      document.getElementById('authNotConfigured').hidden=false;
      return;
    }
    const email=document.getElementById('authEmail').value.trim();
    const password=document.getElementById('authPassword').value;
    errEl.hidden=true; errEl.style.color=''; submitBtn.disabled=true;
    try{
      const fn = authMode==='signin' ? CadenceSync.signIn : CadenceSync.signUp;
      const {error} = await fn(email,password);
      if(error){ errEl.textContent=translateAuthError(error); errEl.hidden=false; return; }
      if(authMode==='signup'){
        // If email confirmation is required, no session exists yet — the
        // auth-state listener will pick it up automatically once confirmed.
        errEl.style.color='var(--good)';
        errEl.textContent='החשבון נוצר. אם נדרש אימות אימייל, בדקו את תיבת הדואר ואז התחברו.';
        errEl.hidden=false;
      }
    }catch(err){
      errEl.textContent='שגיאת רשת — ודאו שיש חיבור לאינטרנט ונסו שוב.';
      errEl.hidden=false;
    }finally{
      submitBtn.disabled=false;
    }
  });
}
function translateAuthError(error){
  const m=(error&&error.message)||'';
  if(/invalid login credentials/i.test(m))return 'אימייל או סיסמה שגויים.';
  if(/already registered|already exists/i.test(m))return 'כבר קיים חשבון עם אימייל זה — נסו להתחבר.';
  if(/password should be|at least 6/i.test(m))return 'הסיסמה קצרה מדי (לפחות 6 תווים).';
  return 'שגיאה: '+m;
}

// Reconcile local state with the cloud. Cloud is authoritative — a local
// event missing from it is presumed intentionally deleted (e.g. from
// another device), NOT "not yet synced", so it is dropped rather than
// resurrected. The only thing preserved on top of the cloud snapshot is
// this device's own outbox: genuinely pending upserts/deletes/settings that
// haven't been confirmed yet.
//
// Exception: a brand-new account that has never synced anything before
// (cloud has zero events and no settings row) — there, any current local
// data is presumed pre-existing device data that needs migrating up, not
// something to discard.
function applyCloudSnapshot(cloud){
  const byId=new Map(cloud.events.map(e=>[e.id,e]));
  const isFirstEverSync = cloud.events.length===0 && !cloud.goals;

  if(isFirstEverSync){
    state.events.forEach(ev=>{
      if(!byId.has(ev.id)){
        byId.set(ev.id, ev);
        CadenceSync.enqueueUpsertEvent(CadenceSync.eventToRow(ev, currentUserId));
      }
    });
  }

  const pending=CadenceSync.peekOutbox();
  pending.forEach(op=>{
    if(op.type==='upsert_event')byId.set(op.row.id, CadenceSync.rowToEvent(op.row));
    else if(op.type==='delete_event')byId.delete(op.id);
  });
  const events=[...byId.values()].sort((a,b)=>a.ts-b.ts);
  let goals = cloud.goals || state.goals;
  let audience = cloud.audience || state.audience;
  let calc = cloud.calc ? mergeCalc(cloud.calc) : state.calc;
  const settingsOp=pending.find(op=>op.type==='upsert_settings');
  if(settingsOp){ goals=settingsOp.row.goals; audience=settingsOp.row.audience; calc=mergeCalc(settingsOp.row.calc_settings); }
  state={events,goals,audience,calc};
  save();
  if(isFirstEverSync) pushSettings(); // seed this brand-new account's settings row
}

async function onSignedIn(session){
  currentUserId=session.user.id;
  try{
    const cloud=await CadenceSync.fetchAll(currentUserId);
    applyCloudSnapshot(cloud);
  }catch(e){
    toast('אין חיבור לענן כרגע — עובד מהעותק המקומי','undo');
  }
  document.getElementById('accountEmail').textContent = session.user.email||'—';
  showApp();
  renderDashboard();
  setView(ui.view||'dashboard');
  CadenceSync.flush();
  CadenceSync.subscribeRealtime(currentUserId, onRemoteEventChange, onRemoteSettingsChange, resyncFromCloud);
}
function onSignedOut(){
  currentUserId=null;
  document.getElementById('authForm').reset();
  showAuthScreen();
}

// Realtime only reaches a device that's actively connected the instant a
// change happens — a backgrounded tab, a locked phone, or a brief network
// drop means it's silently missed with no way to know. This does a full
// re-fetch-and-merge (same as sign-in) so a missed change self-heals as
// soon as the device comes back, instead of staying wrong until a manual
// refresh. Triggered on tab focus, reconnect, and realtime resubscribe.
let resyncing=false;
async function resyncFromCloud(){
  if(!currentUserId||resyncing)return;
  resyncing=true;
  try{
    const cloud=await CadenceSync.fetchAll(currentUserId);
    applyCloudSnapshot(cloud);
    renderAll();
  }catch(e){
    // offline or transient — next trigger (focus/online/reconnect) will retry
  }finally{
    resyncing=false;
  }
}
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')resyncFromCloud(); });
window.addEventListener('online',resyncFromCloud);

// Live cross-device updates: a change made on another signed-in device (or
// this one, echoing its own write back) arrives here and is folded straight
// into local state — no manual refresh needed. Idempotent by id, so an
// echo of our own just-made change is a harmless no-op re-render.
function onRemoteEventChange(payload){
  const {eventType,new:newRow,old:oldRow}=payload;
  if(eventType==='DELETE'){
    if(!oldRow||!oldRow.id)return;
    state.events=state.events.filter(e=>e.id!==oldRow.id);
  }else{
    const ev=CadenceSync.rowToEvent(newRow);
    const idx=state.events.findIndex(e=>e.id===ev.id);
    if(idx===-1)state.events.push(ev); else state.events[idx]=ev;
    state.events.sort((a,b)=>a.ts-b.ts);
  }
  save();
  renderAll();
}
function onRemoteSettingsChange(payload){
  const {eventType,new:newRow}=payload;
  if(eventType==='DELETE'||!newRow)return;
  state.goals=newRow.goals; state.audience=newRow.audience; state.calc=mergeCalc(newRow.calc_settings);
  save();
  renderAll();
}

async function boot(){
  document.documentElement.lang='he';
  document.documentElement.dir='rtl';
  wire();
  wireAuthForm();
  document.getElementById('signOutBtn').addEventListener('click',()=>CadenceSync.signOut());

  const configured=CadenceSync.init();
  if(!configured){
    document.getElementById('authNotConfigured').hidden=false;
    showAuthScreen();
    return;
  }
  showAuthScreen();
  // supabase-js fires this once immediately with whatever session (if any)
  // was persisted from a previous visit, then again on every future
  // sign-in/sign-out — one listener covers both the initial restore and
  // subsequent auth changes.
  CadenceSync.onAuthChange((session)=>{
    if(session && session.user.id!==currentUserId){ onSignedIn(session); }
    else if(!session && currentUserId!==null){ onSignedOut(); }
    else if(!session){ showAuthScreen(); }
  });
}
boot();
