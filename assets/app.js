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
  seller:{label:'Seller'}, buyer:{label:'Buyer'}, landlord:{label:'Landlord'},
};

// Call-result options per audience. Order = funnel depth; each records all prior stages.
const CALL_RESULTS={
  seller:[
    {key:'no_answer',   name:'No Answer',              desc:'Call +1',                                 deltas:{call:1}},
    {key:'not_qual',    name:'Answered, Not Qualified',desc:'Call + Answered',                         deltas:{call:1,answered:1}},
    {key:'qualified',   name:'Qualified Conversation', desc:'Call + Answered + Qualified',             deltas:{call:1,answered:1,qualified:1}},
    {key:'meeting',     name:'Meeting Scheduled',      desc:'Full funnel through meeting',   tone:'gold',deltas:{call:1,answered:1,qualified:1,meetingScheduled:1}},
  ],
  buyer:[
    {key:'no_answer',   name:'No Answer',              desc:'Call +1',                                 deltas:{call:1}},
    {key:'not_qual',    name:'Answered, Not Qualified',desc:'Call + Answered',                         deltas:{call:1,answered:1}},
    {key:'qualified',   name:'Qualified Conversation', desc:'Call + Answered + Qualified',             deltas:{call:1,answered:1,qualified:1}},
    {key:'meeting',     name:'Meeting Scheduled',      desc:'Full funnel through meeting',   tone:'gold',deltas:{call:1,answered:1,qualified:1,meetingScheduled:1}},
  ],
  landlord:[
    {key:'no_answer',   name:'No Answer',              desc:'Call +1',                                 deltas:{call:1}},
    {key:'not_qual',    name:'Answered, Not Qualified',desc:'Call + Answered',                         deltas:{call:1,answered:1}},
    {key:'qualified',   name:'Qualified Conversation', desc:'Call + Answered + Qualified',             deltas:{call:1,answered:1,qualified:1}},
    {key:'agreement',   name:'Agreement Signed',       desc:'Full funnel through signing',   tone:'gold',deltas:{call:1,answered:1,qualified:1,signed:1}},
  ],
};

// Later, out-of-call events. Shown only for the relevant audience.
const FOLLOWUPS={
  seller:[
    {key:'meeting_done', name:'Meeting Completed',        icon:'calcheck',  deltas:{meetingCompleted:1}},
    {key:'exclusivity',  name:'Exclusivity Signed',       icon:'handshake', tone:'gold', deltas:{signed:1}},
    {key:'manual_meet',  name:'Meeting Scheduled Manually',icon:'flag',     full:true,   deltas:{meetingScheduled:1}},
  ],
  buyer:[
    {key:'meeting_done', name:'Meeting Completed',        icon:'calcheck',  deltas:{meetingCompleted:1}},
    {key:'brokerage',    name:'Brokerage Agreement Signed',icon:'handshake',tone:'gold', deltas:{signed:1}},
    {key:'manual_meet',  name:'Meeting Scheduled Manually',icon:'flag',     full:true,   deltas:{meetingScheduled:1}},
  ],
  landlord:[
    {key:'brokerage',    name:'Brokerage Agreement Signed',icon:'handshake',tone:'gold', full:true, deltas:{signed:1}},
  ],
};

// Funnel definition (ordered stages) per audience + a full/combined funnel for "All".
const FUNNELS={
  seller:['call','answered','qualified','meetingScheduled','meetingCompleted','signed'],
  buyer:['call','answered','qualified','meetingScheduled','meetingCompleted','signed'],
  landlord:['call','answered','qualified','signed'],
  all:['call','answered','qualified','meetingScheduled','meetingCompleted','signed'],
};
const STAGE_NAMES={
  call:'Calls', answered:'Answered', qualified:'Qualified', meetingScheduled:'Meetings scheduled',
  meetingCompleted:'Meetings completed', signed:'Signed',
};
const STAGE_SHORT={
  call:'Call', answered:'Answered', qualified:'Qualified', meetingScheduled:'Meeting set',
  meetingCompleted:'Met', signed:'Signed',
};

/* ---------- State / persistence ---------- */
const STORAGE_KEY='cadence.v1';
const DEFAULT_STATE={
  events:[],                       // {id, ts, dateKey, audience, kind, label, deltas}
  goals:{call:25, meetingCompleted:3},
  audience:'seller',
};
let state=loadState();
let ui={ activeDate:todayKey(), view:'dashboard', range:'today', filter:'all' };

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
function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ toast('Storage full — export a backup'); } }

/* ---------- Date helpers (local time) ---------- */
function todayKey(){ return keyOf(new Date()); }
function keyOf(d){ const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function parseKey(k){ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); }
function humanDate(k){
  if(k===todayKey())return 'Today';
  const y=new Date(); y.setDate(y.getDate()-1);
  if(k===keyOf(y))return 'Yesterday';
  return parseKey(k).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
}
// Monday-start week containing `ref`.
function weekStart(ref){ const d=new Date(ref); const dow=(d.getDay()+6)%7; d.setDate(d.getDate()-dow); d.setHours(0,0,0,0); return d; }
function inRange(dateKey, range){
  if(range==='all')return true;
  const d=parseKey(dateKey), now=new Date();
  if(range==='today')return dateKey===todayKey();
  if(range==='week'){ const s=weekStart(now); return d>=s; }
  if(range==='month')return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
  return true;
}

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
  renderDashboard();
  toast(label, tone==='gold'?'gold':'good');
}
function undoLast(){
  if(!state.events.length)return;
  const ev=state.events.pop(); save();
  renderDashboard();
  toast(`Undone: ${ev.label}`,'undo');
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
    {key:'call', name:'Calls', val:c.call, goal:state.goals.call},
    {key:'meetingCompleted', name:'Meetings completed', val:c.meetingCompleted, goal:state.goals.meetingCompleted},
  ];
  document.getElementById('goals').innerHTML=rows.map(r=>{
    const pct= r.goal>0 ? Math.min(r.val/r.goal*100,100) : 0;
    const done= r.goal>0 && r.val>=r.goal;
    const color= done? 'var(--good)' : (r.key==='call'?'var(--accent)':'var(--gold)');
    return `<div class="goal ${done?'done':''}">
      <div class="goal-top">
        <span class="goal-name">${r.name}</span>
        <span class="goal-nums">${r.val} <span class="goal-goal">/ ${r.goal}</span></span>
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
  openSheet(`${AUDIENCES[state.audience].label} — call result`);
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
  openSheet(`Correct totals — ${AUDIENCES[state.audience].label}`);
  const base=dayCounts(ui.activeDate,state.audience);
  const working={...base};
  const editingOther= ui.activeDate!==todayKey();
  sheetBody.innerHTML=`
    ${editingOther?`<div class="editing-banner"><span data-icon="edit"></span>Editing ${humanDate(ui.activeDate)}</div>`:''}
    <p class="muted-p">Nudge a stage to match reality. Changes are logged so you can still undo.</p>
    <div id="adjRows">${stages.map(st=>`
      <div class="adj-row" data-stage="${st}">
        <span class="adj-name">${STAGE_NAMES[st]}</span>
        <div class="adj-stepper">
          <button class="step-btn" data-dir="-1" type="button" aria-label="decrease ${STAGE_NAMES[st]}">−</button>
          <span class="adj-count">${working[st]}</span>
          <button class="step-btn" data-dir="1" type="button" aria-label="increase ${STAGE_NAMES[st]}">+</button>
        </div>
      </div>`).join('')}</div>
    <button class="sheet-cta press" id="adjSave" type="button">Save corrections</button>`;
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
      state.events.push({ id:uid(), ts:Date.now(), dateKey:ui.activeDate,
        audience:state.audience, kind:'adjust', label:'Manual correction', deltas });
      save(); renderDashboard(); toast('Totals corrected','good');
    }
    closeSheet();
  });
}

function openDateSheet(){
  openSheet('Choose a day');
  const y=new Date(); y.setDate(y.getDate()-1);
  sheetBody.innerHTML=`
    <input class="date-field" type="date" id="datePick" value="${ui.activeDate}" max="${todayKey()}" />
    <div class="date-quick">
      <button class="ghost-wide press" data-day="${todayKey()}" type="button">Today</button>
      <button class="ghost-wide press" data-day="${keyOf(y)}" type="button">Yesterday</button>
    </div>
    <button class="sheet-cta press" id="dateGo" type="button">Open this day</button>`;
  const pick=document.getElementById('datePick');
  sheetBody.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{ pick.value=b.dataset.day; }));
  document.getElementById('dateGo').addEventListener('click',()=>{
    if(pick.value){ ui.activeDate=pick.value; renderDashboard(); if(ui.view==='data')renderData(); }
    closeSheet();
  });
}

function openGoalsSheet(){
  openSheet('Daily goals');
  sheetBody.innerHTML=`
    <p class="muted-p">One target for the whole day, across every audience.</p>
    <div class="adj-row">
      <span class="adj-name">Calls per day</span>
      <div class="adj-stepper">
        <button class="step-btn" data-g="call" data-dir="-1" type="button">−</button>
        <span class="adj-count" id="gcall">${state.goals.call}</span>
        <button class="step-btn" data-g="call" data-dir="1" type="button">+</button>
      </div>
    </div>
    <div class="adj-row">
      <span class="adj-name">Meetings completed per day</span>
      <div class="adj-stepper">
        <button class="step-btn" data-g="meetingCompleted" data-dir="-1" type="button">−</button>
        <span class="adj-count" id="gmeet">${state.goals.meetingCompleted}</span>
        <button class="step-btn" data-g="meetingCompleted" data-dir="1" type="button">+</button>
      </div>
    </div>
    <button class="sheet-cta press" id="goalsSave" type="button">Save goals</button>`;
  const draft={...state.goals};
  sheetBody.querySelectorAll('.step-btn').forEach(b=>b.addEventListener('click',()=>{
    const g=b.dataset.g, step= g==='call'?1:1;
    draft[g]=Math.max(0, draft[g]+Number(b.dataset.dir)*step);
    document.getElementById(g==='call'?'gcall':'gmeet').textContent=draft[g];
  }));
  document.getElementById('goalsSave').addEventListener('click',()=>{
    state.goals=draft; save(); renderDashboard(); toast('Goals updated'); closeSheet();
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

  const c=aggregate(ev=> inRange(ev.dateKey,ui.range) && (ui.filter==='all'||ev.audience===ui.filter));

  const answerRate=fmtPct(c.answered,c.call);
  const meetCompRate=fmtPct(c.meetingCompleted,c.meetingScheduled);

  const tiles=[
    {label:'Total calls', icon:'phone', val:c.call, cls:'accent'},
    {label:'Answer rate', icon:'percent', val: answerRate===null?'—':answerRate+'%', sub: answerRate===null?'Not enough data':`${c.answered} of ${c.call}`, cls:'accent', small:answerRate===null},
    {label:'Qualified talks', icon:'users', val:c.qualified},
    {label:'Meetings scheduled', icon:'calendar', val:c.meetingScheduled},
    {label:'Meetings completed', icon:'calcheck', val:c.meetingCompleted},
    {label:'Signed agreements', icon:'handshake', val:c.signed, cls:'gold'},
    {label:'Meeting completion', icon:'percent', val: meetCompRate===null?'—':meetCompRate+'%', sub: meetCompRate===null?'Not enough data':`${c.meetingCompleted} of ${c.meetingScheduled}`, span2:true, cls:'accent', small:meetCompRate===null},
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
  if(ui.range==='all'){
    const start=weekStart(now);
    for(let i=11;i>=0;i--){ const s=new Date(start); s.setDate(s.getDate()-i*7); const e=new Date(s); e.setDate(e.getDate()+7);
      buckets.push({label:`${s.getMonth()+1}/${s.getDate()}`, from:s, to:e}); }
    document.getElementById('trendLabel').textContent='Last 12 weeks';
  }else{
    const days= ui.range==='month'?30:7;
    for(let i=days-1;i>=0;i--){ const d=new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
      buckets.push({label:String(d.getDate()), dk:keyOf(d)}); }
    document.getElementById('trendLabel').textContent=`Last ${days} days`;
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
  if(total===0){ el.classList.remove('dense'); el.innerHTML='<div class="log-empty">Not enough data yet.</div>'; return; }
  const maxC=Math.max(1,...data.map(d=>d.calls));
  el.classList.toggle('dense', data.length>10);
  el.innerHTML=data.map(b=>{
    const h=(b.calls/maxC*100).toFixed(1);
    return `<div class="tcol" title="${b.label}: ${b.calls} calls, ${b.meets} meetings completed">
      <div class="tbar-wrap">
        ${b.meets>0?`<span class="tdot"></span>`:''}
        <div class="tbar" style="height:${h}%"></div>
      </div>
      <span class="tlabel">${b.label}</span>
    </div>`;
  }).join('');
}

function renderConversions(c){
  const funnel=FUNNELS[ui.filter] || FUNNELS.all;
  document.getElementById('convFunnelLabel').textContent= ui.filter==='all'?'Full funnel':AUDIENCES[ui.filter].label;
  const rows=[];
  for(let i=0;i<funnel.length-1;i++){
    const from=funnel[i], to=funnel[i+1];
    const pct=fmtPct(c[to],c[from]);
    rows.push(`<div class="conv">
      <div class="conv-top">
        <span class="conv-stages">${STAGE_SHORT[from]} → ${STAGE_SHORT[to]}</span>
        <span class="conv-pct">${pct===null?'<span style="color:var(--muted-2);font-weight:600">Not enough data</span>':pct+'%'}</span>
      </div>
      <div class="conv-bar"><i style="width:${pct===null?0:Math.min(pct,100)}%"></i></div>
    </div>`);
  }
  document.getElementById('conversions').innerHTML=rows.join('');
}

function renderRatios(c){
  function ratioLine(name, num, den, unit){
    const r=fmtRatio(num,den);
    if(r===null)return {name, val:'Not enough data', nd:true};
    const shown= r>=10 ? Math.round(r) : (Math.round(r*10)/10);
    return {name, val:`${shown} ${unit}`, nd:false};
  }
  const lines=[
    ratioLine('Calls per scheduled meeting', c.call, c.meetingScheduled, 'calls'),
    ratioLine('Calls per signed agreement', c.call, c.signed, 'calls'),
    ratioLine('Meetings per signed agreement', c.meetingCompleted, c.signed, 'meetings'),
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
function renderData(){
  document.getElementById('logDateLabel').textContent=humanDate(ui.activeDate);
  const evs=state.events.filter(e=>e.dateKey===ui.activeDate).slice().sort((a,b)=>b.ts-a.ts);
  const box=document.getElementById('activityLog');
  if(!evs.length){ box.innerHTML=`<div class="log-empty">No activity logged for ${humanDate(ui.activeDate).toLowerCase()}.</div>`; return; }
  box.innerHTML=evs.map(e=>{
    const t=new Date(e.ts).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
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
  toast('Backup exported');
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
  toast('CSV exported');
}
function importJSON(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const s=JSON.parse(reader.result);
      if(!s||!Array.isArray(s.events))throw new Error('bad file');
      if(!confirm(`Import ${s.events.length} events? This replaces your current data.`))return;
      state={ events:s.events, goals:Object.assign({call:25,meetingCompleted:3},s.goals||{}),
        audience:AUDIENCES[s.audience]?s.audience:'seller' };
      save(); renderAll(); toast('Backup restored');
    }catch(e){ toast('Could not read that file'); }
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
    b.addEventListener('click',()=>{ state.audience=b.dataset.audience; save(); renderDashboard(); }));
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
  document.getElementById('rangeSeg').addEventListener('click',e=>{ const b=e.target.closest('[data-range]'); if(!b)return; ui.range=b.dataset.range; renderStats(); });
  document.getElementById('audFilterSeg').addEventListener('click',e=>{ const b=e.target.closest('[data-filter]'); if(!b)return; ui.filter=b.dataset.filter; renderStats(); });
  // data actions
  document.getElementById('exportJson').addEventListener('click',exportJSON);
  document.getElementById('exportCsv').addEventListener('click',exportCSV);
  document.getElementById('importBtn').addEventListener('click',()=>document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change',e=>{ if(e.target.files[0])importJSON(e.target.files[0]); e.target.value=''; });
  document.getElementById('resetBtn').addEventListener('click',()=>{
    if(confirm('Erase ALL data on this device? Export a backup first — this cannot be undone.')){
      state=structuredClone(DEFAULT_STATE); save(); ui.activeDate=todayKey(); renderAll(); toast('All data erased','undo');
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

/* boot */
renderDashboard();
setView('dashboard');
wire();
