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
};
function paintIcons(root=document){
  root.querySelectorAll('[data-icon]').forEach(el=>{
    const n=el.getAttribute('data-icon'); if(!ICONS[n]||el.dataset.painted)return;
    el.dataset.painted='1';
    el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
  });
}

/* ---------- Config: audiences, results, follow-ups, funnels ---------- */
// Canonical counters every event contributes to.
const COUNTERS=['call','answered','qualified','meetingScheduled','meetingCompleted','signed'];

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
    {key:'manual_meet',  name:'נקבעה פגישה ידנית',    icon:'flag',      full:true,   deltas:{meetingScheduled:1}},
  ],
  buyer:[
    {key:'meeting_done', name:'פגישה התקיימה',        icon:'calcheck',  deltas:{meetingCompleted:1}},
    {key:'brokerage',    name:'נחתם הסכם תיווך',      icon:'handshake', tone:'gold', deltas:{signed:1}},
    {key:'manual_meet',  name:'נקבעה פגישה ידנית',    icon:'flag',      full:true,   deltas:{meetingScheduled:1}},
  ],
  landlord:[
    {key:'brokerage',    name:'נחתם הסכם תיווך',      icon:'handshake', tone:'gold', full:true, deltas:{signed:1}},
  ],
};

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
};
const STAGE_SHORT={
  call:'שיחה', answered:'נענו', qualified:'שיחה איכותית', meetingScheduled:'פגישה נקבעה',
  meetingCompleted:'פגישה התקיימה', signed:'נחתם',
};
// "Signed" reads differently per audience (exclusivity vs. brokerage
// agreement) — used only in the Stats conversion section's labels.
const SIGNED_SHORT={ seller:'נחתמה בלעדיות', buyer:'נחתם הסכם תיווך', landlord:'נחתם הסכם תיווך', all:'נחתם' };

/* ---------- State / persistence ---------- */
const STORAGE_KEY='cadence.v1';
const DEFAULT_STATE={
  events:[],                       // {id, ts, dateKey, audience, kind, label, deltas}
  goals:{call:25, meetingCompleted:3},
  audience:'seller',
};
let state=loadState();
let ui={ activeDate:todayKey(), view:'dashboard', range:'today', filter:'all', customFrom:null, customTo:null };
let currentUserId=null; // set once signed in; gates all cloud writes

function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return structuredClone(DEFAULT_STATE);
    const s=JSON.parse(raw);
    return {
      events:Array.isArray(s.events)?s.events:[],
      goals:Object.assign({call:25,meetingCompleted:3}, s.goals||{}),
      audience:AUDIENCES[s.audience]?s.audience:'seller',
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
// Queue the current goals + audience as one settings row (last-write-wins).
function pushSettings(){
  if(!currentUserId)return;
  CadenceSync.enqueueUpsertSettings({ user_id:currentUserId, goals:state.goals, audience:state.audience });
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
  const stages=FUNNELS[state.audience];
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
        audience:AUDIENCES[s.audience]?s.audience:'seller' };
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
  // The top day selector belongs to day-based screens; Stats has its own
  // period filters, so hide it there to avoid confusion.
  document.getElementById('dateBtn').hidden = (v==='stats');
  if(v==='dashboard')renderDashboard();
  if(v==='stats')renderStats();
  if(v==='data')renderData();
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderAll(){ renderDashboard(); if(ui.view==='stats')renderStats(); if(ui.view==='data')renderData(); }

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
  const settingsOp=pending.find(op=>op.type==='upsert_settings');
  if(settingsOp){ goals=settingsOp.row.goals; audience=settingsOp.row.audience; }
  state={events,goals,audience};
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
  state.goals=newRow.goals; state.audience=newRow.audience;
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
