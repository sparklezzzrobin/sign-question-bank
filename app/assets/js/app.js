/* 信号与系统 · 刷题掌握系统 —— 前端逻辑（无框架，数据由 build-data.mjs 预渲染） */
'use strict';

const DATA = window.QUESTION_DATA;
const Q = DATA.questions;
const YEARS = [...new Set(Q.filter(q => q.year).map(q => q.year))].sort((a, b) => a - b);
const QMAP = new Map(Q.map(q => [q.id, q]));
const MATRIX_MAXQ = Math.max(...Q.filter(q => q.qNum).map(q => q.qNum));
const MOCK_YEARS = new Set(Q.filter(q => q.isMock && q.year).map(q => q.year));
const STATUSES = [
  { k: 'no',    label: '不会' },
  { k: 'faint', label: '不熟' },
  { k: 'ok',    label: '掌握' },
];
const ST_LABEL = { no: '不会', faint: '不熟', ok: '掌握' };
const NUMERALS = '一二三四五六七八九十';
const SRC_KINDS = [
  { k: 'all',       label: '全部来源' },
  { k: 'exam',      label: '历年真题' },
  { k: 'textbook',  label: '教材课后习题' },
  { k: 'school',    label: '名校考研真题' },
  { k: 'lecture',   label: '强化讲义' },
  { k: 'course',    label: '课件补充' },
];

/* ---------------- 存取 ---------------- */
const LS_KEY = 'sign_quiz_v1';
const LS_THEME = 'sign_quiz_theme';
function loadStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      marks: raw.marks && typeof raw.marks === 'object' ? raw.marks : {},
      chats: raw.chats && typeof raw.chats === 'object' ? raw.chats : {},
    };
  } catch { return { marks: {}, chats: {} }; }
}
let store = loadStore();
const save = () => localStorage.setItem(LS_KEY, JSON.stringify(store));
const statusOf = id => (store.marks[id] && store.marks[id].s) || null;
const favOf = id => Boolean(store.marks[id] && store.marks[id].f);
function setMark(id, patch) {
  const cur = store.marks[id] || {};
  store.marks[id] = { ...cur, ...patch, t: Date.now() };
  if (!store.marks[id].s && !store.marks[id].f) delete store.marks[id];
  save();
}

/* ---------------- UI 状态 ---------------- */
const ui = {
  view: 'brush',
  topic: 0, group: null,          // 侧栏筛选：0=全部
  status: 'all',                  // all|no|faint|ok|unset|fav
  src: 'all',                     // all|exam|textbook|school|course
  year: 0, q: '',
  heatMode: 'matrix',
};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------------- 视图切换 ---------------- */
function switchView(v) {
  ui.view = v;
  $$('#tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
  $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
  if (v === 'heat') renderHeat();
  if (v === 'stats') renderStats();
}

/* ---------------- 侧栏 ---------------- */
function topicGroups(no) {
  const seen = new Map();
  for (const q of Q.filter(x => x.topicNo === no)) {
    const key = q.group || '-';
    if (!seen.has(key)) seen.set(key, { code: q.group, title: q.groupTitle, n: 0 });
    seen.get(key).n++;
  }
  const arr = [...seen.values()];
  const numKey = code => {
    if (!code) return null;
    const p = String(code).split('.').map(Number);
    return p.some(Number.isNaN) ? null : p;
  };
  arr.sort((a, b) => {
    const na = numKey(a.code), nb = numKey(b.code);
    if (na && nb) {
      for (let i = 0; i < Math.max(na.length, nb.length); i++) {
        const d = (na[i] || 0) - (nb[i] || 0);
        if (d) return d;
      }
      return 0;
    }
    if (na) return -1;
    if (nb) return 1;
    return String(a.code).localeCompare(String(b.code));
  });
  return arr;
}
function renderSidebar() {
  const host = $('#sidebar');
  const bar = countsOf(Q);
  let html = `<button class="side-all ${ui.topic === 0 ? 'active' : ''}" data-topic="0">全部题目 <span>${Q.length}</span></button>`;
  for (const t of DATA.topics) {
    const list = Q.filter(x => x.topicNo === t.no);
    const c = countsOf(list);
    const tActive = ui.topic === t.no && !ui.group;
      html += `<div class="side-topic">
      <button class="side-topic-head ${tActive ? 'active' : ''}" data-topic="${t.no}" title="专题${NUMERALS[t.no - 1]} · ${esc(t.name)}（${list.length} 题）">
        <span>专题${NUMERALS[t.no - 1]} · ${esc(t.name)}</span><span class="n">${list.length}</span>
        ${miniBar(c, list.length)}
      </button>
      <div class="side-group-list">`;
    for (const g of topicGroups(t.no)) {
      if (!g.code) continue;
      const gActive = ui.topic === t.no && ui.group === g.code;
      const gc = countsOf(list.filter(x => x.group === g.code));
      html += `<button class="side-group ${gActive ? 'active' : ''}" data-topic="${t.no}" data-group="${esc(g.code)}" title="${esc(g.code)} ${esc(g.title || '')}（${g.n} 题）">
        <span class="code">${esc(g.code)}</span><span class="t">${esc(g.title || '')}</span><span class="n">${g.n}</span>
        ${miniBar(gc, g.n)}
      </button>`;
    }
    html += `</div></div>`;
  }
  host.innerHTML = html;

  function miniBar(c, total) {
    if (!total) return '';
    const w = k => (c[k] / total * 100).toFixed(1) + '%';
    return `<span class="minibar">
      <i style="width:${w('ok')};background:var(--st-ok)"></i>
      <i style="width:${w('faint')};background:var(--st-faint)"></i>
      <i style="width:${w('no')};background:var(--st-no)"></i>
    </span>`;
  }
}
function countsOf(list) {
  const c = { no: 0, faint: 0, ok: 0 };
  for (const q of list) { const s = statusOf(q.id); if (s) c[s]++; }
  return c;
}

/* ---------------- 筛选条 ---------------- */
function renderFilterBar() {
  const chips = [
    { k: 'all', label: '全部' },
    ...STATUSES.map(s => ({ k: s.k, label: s.label, dot: s.k })),
    { k: 'unset', label: '未标' },
    { k: 'fav', label: '★ 收藏' },
  ];
  $('#statusChips').innerHTML = chips.map(c =>
    `<button class="chip ${ui.status === c.k ? 'active' : ''}" data-k="${c.k}">
      ${c.dot ? `<span class="dot" style="background:var(--st-${c.dot})"></span>` : ''}${c.label}
    </button>`).join('');
  const sel = $('#yearSel');
  sel.innerHTML = `<option value="0">全部年份</option>` +
    YEARS.map(y => `<option value="${y}" ${ui.year === y ? 'selected' : ''}>${y}${MOCK_YEARS.has(y) ? '（模拟）' : ''}</option>`).join('');
  const srcSel = $('#srcSel');
  srcSel.innerHTML = SRC_KINDS.map(s =>
    `<option value="${s.k}" ${ui.src === s.k ? 'selected' : ''}>${s.label}</option>`).join('');
}
function matchesFilters(q) {
  if (ui.topic && q.topicNo !== ui.topic) return false;
  if (ui.group && q.group !== ui.group) return false;
  if (ui.src !== 'all' && (q.srcKind || 'exam') !== ui.src) return false;
  if (ui.year && q.year !== ui.year) return false;
  if (ui.q && !q.searchText.includes(ui.q)) return false;
  const s = statusOf(q.id), f = favOf(q.id);
  switch (ui.status) {
    case 'all': return true;
    case 'unset': return !s;
    case 'fav': return f;
    default: return s === ui.status;
  }
}
function filtered() {
  const list = Q.filter(matchesFilters);
  // 年份筛选：只出该年真题（教材/名校题无年份自然被排除），并按题号升序排列
  if (ui.year) list.sort((a, b) => (a.qNum || 99) - (b.qNum || 99));
  return list;
}

/* ---------------- 卡片 ---------------- */
function cardHTML(q) {
  const st = statusOf(q.id), fav = favOf(q.id);
  const topicBadge = (q.year && q.group) ? `<span class="badge plain" title="来自考点 ${esc(q.group)}">${esc(q.group)}</span>` : '';
  const srcBadge = q.srcLabel ? `<span class="badge">${esc(q.srcKind === 'textbook' ? q.srcLabel.replace(/^教材/, '教材（郑君里第三版）') : q.srcLabel)}</span>` : '';
  const yearBadge = q.year
    ? `<span class="badge${q.isMock ? ' mock' : ''}">${q.year}${q.isMock ? ' · 模拟' : ''} · 第 ${q.qNum} 题</span>`
    : (q.srcLabel ? '' : `<span class="badge mock">课件补充</span>`);
  const score = q.score ? `<span class="badge plain">${q.score} 分</span>` : '';
  const imgs = (q.images || []).map(im => {
    if (im.type === 'missing') return `<div class="img-missing"><b>🖼️ 原图缺失</b> · ${esc(im.note || '请对照原卷 PDF 查看')}</div>`;
    return `<img class="thumb" loading="lazy" src="${esc(im.href)}" data-act="zoom" data-src="${esc(im.href)}" alt="题图">`;
  }).join('');
  const sol = q.solutionHtml
    ? `<details class="sol"><summary><span class="arrow">▶</span>📖 展开解析${q.solutionSource ? ` · ${esc(q.solutionSource)}` : ''}（先自己完整做一遍再看）</summary>
         <div class="sol-body">${q.solutionHtml}</div></details>`
    : `<div class="sol-none">📖 暂无解析 · 请对照答案卷 / 题库存档 PDF</div>`;
  const remark = q.remark ? `<div class="remark">⚠️ ${q.remarkHtml || esc(q.remark)}</div>` : '';
  const pdfs = (q.pdfs || []).map(p =>
    `<a class="pdf-link" href="../${esc(p.href)}" target="_blank" rel="noopener" title="打开 ${esc(p.href)}">📄 ${esc(p.label)}</a>`).join('');
  return `<article class="card ${st ? 'st-' + st : ''}" data-id="${q.id}">
    <div class="card-head">
      <div class="badges">${srcBadge}${yearBadge}${score}${topicBadge}</div>
      <div class="head-actions">
        <button class="fav-btn ${fav ? 'on' : ''}" data-act="fav" title="收藏" aria-pressed="${fav}">${fav ? '★' : '☆'}</button>
        <button class="ai-fab" data-act="ai" title="AI 讲解本题（已读取题干与解析）">🤖 AI</button>
      </div>
      <h3 class="card-title">${q.titleHtml}</h3>
    </div>
    <div class="card-stem">${q.stemHtml}</div>
    ${imgs ? `<div class="card-imgs">${imgs}</div>` : ''}
    ${remark}
    ${sol}
    <div class="card-foot">
      <div class="seg-status" role="group" aria-label="掌握状态">
        ${STATUSES.map(s => `<button class="st-btn ${st === s.k ? 'on' : ''}" data-act="status" data-s="${s.k}" aria-pressed="${st === s.k}"><span class="dot"></span>${s.label}</button>`).join('')}
      </div>
      <div class="pdf-btns">${pdfs}</div>
    </div>
  </article>`;
}
function renderCards() {
  const list = filtered();
  $('#cards').innerHTML = list.length
    ? list.map(cardHTML).join('') + `<div class="end-mark">已显示全部题目</div>`
    : `<div class="img-missing" style="margin-top:30px">没有符合筛选条件的题目 —— 试试放宽筛选。</div>`;
  $('#countText').textContent = `显示 ${list.length} / ${Q.length} 题`;
  // 外链图加载失败时降级为提示条（热链失效、断网等）
  $$('#cards img.thumb').forEach(im => {
    const fail = () => {
      const div = document.createElement('div');
      div.className = 'img-missing';
      div.innerHTML = '<b>🖼️ 图片未能加载</b> · 请对照原卷 PDF 查看原图';
      im.replaceWith(div);
    };
    if (im.complete && im.naturalWidth === 0) fail();
    else im.addEventListener('error', fail);
  });
}

/* 卡片交互（事件委托） */
$('#cards').addEventListener('click', e => {
  const zoom = e.target.closest('[data-act="zoom"]');
  if (zoom) { openLightbox(zoom.dataset.src); return; }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const card = btn.closest('.card');
  const id = card.dataset.id;
  if (btn.dataset.act === 'ai') { openAIPanel(id); return; }
  if (btn.dataset.act === 'status') {
    const s = btn.dataset.s;
    setMark(id, { s: statusOf(id) === s ? null : s });
    syncCard(card, id);
  } else if (btn.dataset.act === 'fav') {
    setMark(id, { f: !favOf(id) });
    syncCard(card, id);
  }
});
function syncCard(card, id) {
  const st = statusOf(id), fav = favOf(id);
  card.classList.remove('st-no', 'st-faint', 'st-ok');
  if (st) card.classList.add('st-' + st);
  card.querySelectorAll('.st-btn').forEach(b => {
    const on = b.dataset.s === st;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
  const fv = card.querySelector('.fav-btn');
  fv.classList.toggle('on', fav);
  fv.textContent = fav ? '★' : '☆';
  fv.setAttribute('aria-pressed', fav);
  renderSidebar();
}

/* 筛选控件事件 */
$('#statusChips').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  ui.status = c.dataset.k;
  renderFilterBar(); renderCards();
});
$('#yearSel').addEventListener('change', e => { ui.year = +e.target.value; renderCards(); });
$('#srcSel').addEventListener('change', e => { ui.src = e.target.value; renderCards(); });
$('#searchInput').addEventListener('input', e => { ui.q = e.target.value.trim().toLowerCase(); renderCards(); });
$('#sidebar').addEventListener('click', e => {
  const btn = e.target.closest('[data-topic]');
  if (!btn) return;
  const t = +btn.dataset.topic, g = btn.dataset.group || null;
  if (t === ui.topic && g === ui.group) { ui.topic = 0; ui.group = null; }
  else { ui.topic = t; ui.group = g; }
  renderSidebar(); renderCards();
});

/* ---------------- 热力图 ---------------- */
const qByYearNum = new Map(Q.filter(q => q.year && q.qNum).map(q => [`${q.year}-${q.qNum}`, q]));
function cellHTML(q) {
  if (!q) return `<div class="hcell void"></div>`;
  const st = statusOf(q.id), fav = favOf(q.id);
  const tag = q.year ? `${q.year}${q.isMock ? '（模拟）' : ''}·第${q.qNum}题` : (q.srcLabel || '课件补充');
  const tip = `${tag} ${q.title}` +
    `${st ? ' · ' + ST_LABEL[st] : ' · 未标'}` + (fav ? ' · ★收藏' : '');
  return `<div class="hcell ${st ? 's-' + st : ''}" data-id="${q.id}" data-tip="${esc(tip)}">${fav ? '<span class="fv"></span>' : ''}</div>`;
}
function renderHeat() {
  const host = $('#heatWrap');
  $$('#heatModeSeg button').forEach(b => b.classList.toggle('active', b.dataset.mode === ui.heatMode));
  if (ui.heatMode === 'matrix') {
    let html = `<div class="heat-grid" style="grid-template-columns:44px repeat(${YEARS.length}, var(--hc))">`;
    html += `<div></div>` + YEARS.map(y => `<div class="hlabel top">${y}</div>`).join('');
    for (let n = 1; n <= MATRIX_MAXQ; n++) {
      html += `<div class="hlabel">${n}</div>`;
      for (const y of YEARS) html += cellHTML(qByYearNum.get(`${y}-${n}`));
    }
    host.innerHTML = html + `</div>`;
  } else if (ui.heatMode === 'flat') {
    let html = '';
    for (const t of DATA.topics) {
      const list = Q.filter(x => x.topicNo === t.no && x.year);   // 仅统计真题
      if (!list.length) continue;
      html += `<div class="heat-block">
        <div class="heat-block-title">专题${NUMERALS[t.no - 1]} · ${esc(t.name)} <small style="color:var(--muted)">（${list.length} 题）</small></div>
        <div class="heat-grid" style="grid-template-columns:repeat(26, var(--hc))">${list.map(cellHTML).join('')}</div>
      </div>`;
    }
    host.innerHTML = html;
  } else {   // all · 全库（含教材课后习题 / 名校考研真题 / 课件补充）
    let html = '';
    for (const t of DATA.topics) {
      const list = Q.filter(x => x.topicNo === t.no);
      if (!list.length) continue;
      html += `<div class="heat-block">
        <div class="heat-block-title">专题${NUMERALS[t.no - 1]} · ${esc(t.name)} <small style="color:var(--muted)">（${list.length} 题）</small></div>
        <div class="heat-grid" style="grid-template-columns:repeat(26, var(--hc))">${list.map(cellHTML).join('')}</div>
      </div>`;
    }
    host.innerHTML = html || `<div class="img-missing">题库为空</div>`;
  }
}
$('#heatModeSeg').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  ui.heatMode = b.dataset.mode;
  renderHeat();
});
$('#heatWrap').addEventListener('click', e => {
  const cell = e.target.closest('.hcell[data-id]');
  if (cell) goToQuestion(cell.dataset.id);
});
$('#heatLegend').innerHTML = `
  <span class="sw" style="background:var(--st-unset)"></span>未标
  <span class="sw" style="background:var(--st-no)"></span>不会
  <span class="sw" style="background:var(--st-faint)"></span>不熟
  <span class="sw" style="background:var(--st-ok)"></span>掌握
  <span class="sw" style="position:relative"><span class="fv" style="border:none"></span></span>收藏`;

/* 跳转到某题 */
function goToQuestion(id) {
  const q = QMAP.get(id);
  if (!q) return;
  switchView('brush');
  // 若当前筛选会隐藏该卡，先重置筛选
  if (!matchesFilters(q)) {
    ui.topic = 0; ui.group = null; ui.status = 'all'; ui.src = 'all'; ui.year = 0; ui.q = '';
    $('#searchInput').value = '';
    renderFilterBar(); renderSidebar(); renderCards();
  }
  const card = $(`.card[data-id="${CSS.escape(id)}"]`);
  if (card) {
    // 只滚 .brush-main（scrollIntoView 会连带滚动 overflow:hidden 的 <main>，造成双重视差）
    const bm = $('.brush-main');
    const br = bm.getBoundingClientRect(), cr = card.getBoundingClientRect();
    bm.scrollTop += cr.top - br.top - (bm.clientHeight - cr.height) / 2;
    card.classList.remove('flash'); void card.offsetWidth;
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 3500);
  }
  history.replaceState(null, '', '#q=' + id);
}

/* ---------------- 统计 ---------------- */
function renderStats() {
  const c = countsOf(Q);
  const fav = Q.filter(q => favOf(q.id)).length;
  const marked = c.no + c.faint + c.ok;
  const cards = [
    { v: Q.length, k: '总题数', cls: '' },
    { v: marked, k: '已标记', cls: 'c-accent' },
    { v: c.no, k: '不会', cls: 'c-no' },
    { v: c.faint, k: '不熟', cls: 'c-faint' },
    { v: c.ok, k: '掌握', cls: 'c-ok' },
    { v: fav, k: '收藏', cls: 'c-fav' },
    { v: (c.ok / Q.length * 100).toFixed(1) + '%', k: '总掌握率', cls: 'c-ok' },
  ];
  $('#statCards').innerHTML = cards.map(x =>
    `<div class="stat-card ${x.cls}"><div class="v">${x.v}</div><div class="k">${x.k}</div></div>`).join('');

  $('#topicBars').innerHTML = DATA.topics.map(t => {
    const list = Q.filter(x => x.topicNo === t.no);
    const tc = countsOf(list);
    const w = k => (tc[k] / list.length * 100).toFixed(1) + '%';
    return `<div class="topic-bar-row">
      <div class="name">专题${NUMERALS[t.no - 1]} · ${esc(t.name)}</div>
      <div class="tbar">
        <i class="p-ok" style="width:${w('ok')}"></i>
        <i class="p-faint" style="width:${w('faint')}"></i>
        <i class="p-no" style="width:${w('no')}"></i>
      </div>
      <div class="txt">掌握 ${tc.ok} / ${list.length}</div>
    </div>`;
  }).join('');

  renderPunch();
}

/* 打卡热力图（按日 · 每列一周，列内日期自上而下，时间从左到右，月份轴在底部） */
function renderPunch() {
  const byDay = new Map();
  for (const m of Object.values(store.marks)) {
    if (!m.t) continue;
    const d = new Date(m.t);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }
  const keyOf = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  // 以“今天”所在周（周日开头）收尾，向左铺满 371 天
  const end = new Date();
  end.setDate(end.getDate() + (6 - end.getDay()));            // 本周六
  const days = 53 * 7;
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  let labels = '', cells = '';
  // 月份轴在底部：标在包含每月 1 号的那一列正下方，与格子逐列对齐
  for (let w = 0; w < 53; w++) {
    let ml = '';
    for (let r = 0; r < 7; r++) {
      const d = new Date(start); d.setDate(start.getDate() + w * 7 + r);
      if (d.getDate() === 1) { ml = MONTHS[d.getMonth()]; break; }
    }
    if (ml) labels += `<div class="hlabel bottom" style="grid-column:${w + 1};grid-row:8">${ml}</div>`;
  }
  // 格子逐格显式定位：第 w 周第 r 天 → 第 w+1 列第 r+1 行（修复原先 auto-flow 按行填充把日期拍平的 bug）
  for (let w = 0; w < 53; w++) {
    for (let r = 0; r < 7; r++) {
      const d = new Date(start); d.setDate(start.getDate() + w * 7 + r);
      if (d > end) continue;
      const n = byDay.get(keyOf(d)) || 0;
      const cls = n === 0 ? '' : n <= 2 ? 'q1' : n <= 4 ? 'q2' : n <= 6 ? 'q3' : 'q4';
      cells += `<div class="pcell ${cls}${w <= 3 ? ' tip-left' : w >= 49 ? ' tip-right' : ''}" style="grid-column:${w + 1};grid-row:${r + 1}" data-tip="${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} · 标记 ${n} 题"></div>`;
    }
  }
  $('#punch').innerHTML = `
    <div class="punch-scroll"><div class="punch-grid" style="grid-template-columns:repeat(53, minmax(10px, 1fr));grid-template-rows:repeat(7, auto) 18px">
      ${labels}${cells}
    </div></div>
    <div class="punch-legend">少
      <span class="sw" style="background:var(--st-unset)"></span>
      <span class="sw q1"></span><span class="sw q2"></span><span class="sw q3"></span><span class="sw q4"></span>
      多 · 每天标记的题数（颜色越深越多）
    </div>`;
}

/* ---------------- 侧栏宽度调节 ---------------- */
const SBW_KEY = 'sign_quiz_sbw';
const sbwClamp = w => Math.min(520, Math.max(180, w));
let sbw = sbwClamp(+(localStorage.getItem(SBW_KEY) || 264));
const applySbw = () => document.getElementById('view-brush').style.setProperty('--sbw', sbw + 'px');
applySbw();
{
  const rz = $('#sideResizer');
  rz.addEventListener('pointerdown', e => {
    e.preventDefault();
    rz.classList.add('dragging');
    document.body.classList.add('resizing');
    try { rz.setPointerCapture(e.pointerId); } catch {}
    const move = ev => { sbw = sbwClamp(ev.clientX); applySbw(); };
    const up = () => {
      rz.classList.remove('dragging');
      document.body.classList.remove('resizing');
      localStorage.setItem(SBW_KEY, String(sbw));
      rz.removeEventListener('pointermove', move);
      rz.removeEventListener('pointerup', up);
      rz.removeEventListener('pointercancel', up);
    };
    rz.addEventListener('pointermove', move);
    rz.addEventListener('pointerup', up);
    rz.addEventListener('pointercancel', up);
  });
  rz.addEventListener('dblclick', () => { sbw = 264; applySbw(); localStorage.setItem(SBW_KEY, '264'); });
}

/* ================= AI 讲解（DeepSeek 官方 API 直连） ================= */
const AI_LS = 'sign_quiz_ai';
const AI_SYSTEM = `你是《信号与系统》课程的考研辅导老师，学生正在备考武汉大学 807/936。你会先收到一道真题的完整资料（题干＋参考解析），请基于这份资料回答学生的提问。

回答要求：
- 用中文，用 Markdown 组织内容；数学公式一律用 LaTeX：行内 $...$，独立公式 $$...$$；
- 讲思路、逐步推导、指出易错点时要写清关键步骤，简洁直接，不要复述题干原文；
- 学生给出自己的解答请你检验时，逐步核对并明确指出对错与原因；
- 若解析与题干冲突，以题干为准并说明；若资料无解析，按标准教材方法解答并注明这是你给出的解法。`;

let aiCfg = (() => {
  try {
    const c = JSON.parse(localStorage.getItem(AI_LS) || '{}');
    let model = c.model || 'deepseek-flash';
    if (model === 'deepseek-chat' || model === 'deepseek-reasoner') model = 'deepseek-flash';   // 旧模型名迁移
    return {
      base: (c.base || 'https://api.deepseek.com').replace(/\/+$/, ''), key: c.key || '', model,
      think: c.think !== false,          // 深度思考（V4 系默认开启）
      streamOut: c.streamOut !== false,  // 流式输出
    };
  } catch { return { base: 'https://api.deepseek.com', key: '', model: 'deepseek-flash', think: true, streamOut: true }; }
})();
const saveAiCfg = () => localStorage.setItem(AI_LS, JSON.stringify(aiCfg));

let aiQid = null, aiAbort = null, aiVendorsLoading = null;
function loadScript(src) {
  return new Promise((ok, bad) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => bad(new Error('组件加载失败：' + src));
    document.head.appendChild(s);
  });
}
function ensureAiVendors() {
  if (window.marked && window.katex) return Promise.resolve();
  if (!aiVendorsLoading) {
    aiVendorsLoading = Promise.all([
      window.marked ? Promise.resolve() : loadScript('assets/vendor/marked.umd.js'),
      window.katex ? Promise.resolve() : loadScript('assets/vendor/katex/katex.min.js'),
    ]).then(() => { if (!window.marked || !window.katex) throw new Error('组件加载失败'); });
    aiVendorsLoading.catch(() => { aiVendorsLoading = null; });
  }
  return aiVendorsLoading;
}
function aiMdToHtml(md) {
  const stash = [];
  let t = String(md).replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => (stash.push({ tex: tex.trim(), d: true }), `ZZKTXZZ${stash.length - 1}ZZKTXZZ`))
    .replace(/\$([^$]+?)\$/g, (_, tex) => (stash.push({ tex: tex.trim(), d: false }), `ZZKTXZZ${stash.length - 1}ZZKTXZZ`));
  t = window.marked.parse(t);
  return t.replace(/ZZKTXZZ(\d+)ZZKTXZZ/g, (_, i) => {
    const { tex, d } = stash[+i];
    try { return katex.renderToString(tex, { displayMode: d, throwOnError: true, strict: false }); }
    catch { return katex.renderToString(tex, { displayMode: d, throwOnError: false, strict: false }); }
  });
}
function aiContext(q) {
  const topic = `专题${NUMERALS[q.topicNo - 1]} ${q.topicName}`;
  const src = q.year ? `${q.year}${q.isMock ? '（模拟卷）' : ''} 年 第 ${q.qNum} 题${q.score ? `（${q.score} 分）` : ''}`
    : q.srcKind === 'textbook' ? `郑君里《信号与系统》（第3版）${q.srcLabel}`
    : q.srcKind === 'school' ? `名校考研真题 · ${q.srcLabel}`
    : q.srcKind === 'lecture' ? `27 考研强化讲义（风中醉风）· ${q.srcLabel}`
    : '课件补充练习（无年份题号）';
  return ['【题目资料】',
    `归类：${topic} · ${q.group || ''} ${q.groupTitle || ''}${q.subCode ? `（考点细分 ${q.subCode}）` : ''}`,
    `来源：${src}`,
    `标题：${q.title}`,
    '', '【题干】', q.stem || '（无）', '',
    '【参考解析】',
    (q.solution || '（该题无解析存档。请按标准教材方法为学生解答。）')
      .replace(/!\[[^\]]*\]\(([^)]+)\)/g, '（此处为手写解答扫描图 $1，你无法直接读取其内容；请引导学生点开「📖 展开解析」自行查看，并基于题干为学生讲解思路）')
      .replace(/\[([^\]]*)\]\(([^)]+)\)/g, '（链接：$1）')
      .trim()].join('\n');
}
function aiErrMsg(err) {
  const s = err.status;
  if (s === 401) return '🔑 API Key 无效（401）。请点 ⚙️ 检查 Key 是否填对。';
  if (s === 402) return '💰 账户余额不足（402）。请到 platform.deepseek.com 充值后重试。';
  if (s === 429) return '⏳ 触发限流（429），等几秒再发。';
  if (s) return `❌ 请求失败（HTTP ${s}）：<br><small>${esc(String(err.message || '').slice(0, 300))}</small>`;
  return `❌ 网络请求失败：${esc(String(err.message || err))}<br><small>请检查本机网络能否访问 api.deepseek.com（代理软件开着时试试关掉）。</small>`;
}
function appendAiBubble(kind, streaming) {
  const div = document.createElement('div');
  div.className = 'ai-msg ' + kind + (streaming ? ' streaming' : '');
  $('#aiMsgs').appendChild(div);
  return div;
}
const scrollAi = () => { const m = $('#aiMsgs'); m.scrollTop = m.scrollHeight; };
function renderAiMsgs() {
  const host = $('#aiMsgs');
  const hist = (store.chats || {})[aiQid] || [];
  host.innerHTML = '';
  if (!hist.length) {
    host.innerHTML = `<div class="ai-empty">🤖 已读取本题题干${QMAP.get(aiQid)?.solution ? '与参考解析' : ''}，直接开问。<br>试试：<br>「这题的解题思路是什么？」<br>「第 (2) 问为什么这样做？」<br>「出一道同类题让我练」</div>`;
    return;
  }
  for (const m of hist) {
    const div = document.createElement('div');
    div.className = 'ai-msg ' + (m.role === 'user' ? 'user' : 'bot');
    if (m.role === 'user') {
      div.textContent = m.content;
    } else {
      try {
        div.innerHTML = (m.rc ? `<details class="ai-rc"><summary>💭 已深度思考 · 点击展开</summary><div class="ai-rc-body">${esc(m.rc)}</div></details>` : '')
          + `<div class="ai-ans">${aiMdToHtml(m.content)}</div>`;
      } catch { div.textContent = m.content; }
    }
    host.appendChild(div);
  }
  scrollAi();
}
/* ---------------- 历史对话（跨题目） ---------------- */
function aiRelTime(ts) {
  if (!ts) return '';
  const d = Date.now() - ts;
  if (d < 60e3) return '刚刚';
  if (d < 3600e3) return Math.floor(d / 60e3) + ' 分钟前';
  if (d < 86400e3) return Math.floor(d / 3600e3) + ' 小时前';
  if (d < 7 * 86400e3) return Math.floor(d / 86400e3) + ' 天前';
  const dt = new Date(ts);
  return dt.getFullYear() === new Date().getFullYear()
    ? `${dt.getMonth() + 1}月${dt.getDate()}日`
    : `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;
}
function renderAiHistory() {
  const host = $('#aiHistory');
  const items = Object.entries(store.chats || {})
    .filter(([qid, msgs]) => QMAP.has(qid) && msgs.length)
    .map(([qid, msgs]) => {
      const q = QMAP.get(qid);
      const lastUser = [...msgs].reverse().find(m => m.role === 'user') || msgs[msgs.length - 1];
      return {
        qid, q,
        t: msgs.reduce((mx, m) => Math.max(mx, m.t || 0), 0),
        preview: String(lastUser.content || '').replace(/\s+/g, ' ').slice(0, 90),
        n: msgs.length,
      };
    })
    .sort((a, b) => b.t - a.t);
  if (!items.length) {
    host.innerHTML = `<div class="ai-hempty">🕘 暂无历史对话<br><small>在题目里点「🤖 AI」提问后，所有对话都会保存在这里，随时回看</small></div>`;
    return;
  }
  host.innerHTML = `<div class="ai-hcount">共 ${items.length} 题有对话记录 · 按最近提问排序，点击回看</div>` + items.map(it => {
    const tag = it.q.year ? `${it.q.year}${it.q.isMock ? '（模拟）' : ''}·第${it.q.qNum}题` : (it.q.srcLabel || '课件补充');
    return `<div class="ai-hitem" data-qid="${esc(it.qid)}" title="点击回看本题对话">
      <div class="ai-hitem-head">
        <span class="badge">${esc(tag)}</span>
        <span class="t">${it.n} 条 · ${aiRelTime(it.t) || '较早'}</span>
        <button class="ai-hdel" data-del="${esc(it.qid)}" title="删除本题对话记录">🗑</button>
      </div>
      <div class="ai-hitem-title">${esc(it.q.title)}</div>
      <div class="ai-hitem-prev">${esc(it.preview) || '<i>（空）</i>'}</div>
    </div>`;
  }).join('');
}
function setAiHist(open) {
  $('#aiHistory').hidden = !open;
  $('#aiMsgs').style.display = open ? 'none' : '';
  $('.ai-composer').style.display = open ? 'none' : '';
  $('#aiHistBtn').classList.toggle('on', open);
  if (open) renderAiHistory();
}
function openAIPanel(qid) {
  const q = QMAP.get(qid);
  if (!q) return;
  if (aiAbort) aiAbort.abort();
  ensureAiVendors().then(() => { if (aiQid === qid && !$('#aiPanel').hidden) renderAiMsgs(); }).catch(() => {});
  aiQid = qid;
  setAiHist(false);
  const t = (q.year ? `${q.year}${q.isMock ? '（模拟）' : ''}·第${q.qNum}题 ` : '课件补充 · ') + q.title;
  $('#aiQTitle').textContent = t;
  $('#aiQTitle').title = t;
  $('#aiCtx').innerHTML = `已读取本题<b>题干</b>${q.solution ? '与<b>参考解析</b>' : '（本题无解析存档，AI 会按教材方法解答）'}，可直接提问`;
  renderAiMsgs();
  $('#aiPanel').hidden = false;
  if (!aiCfg.key) openAiSettings();
  else $('#aiInput').focus();
}
function openAiSettings() {
  $('#aiBase').value = aiCfg.base;
  $('#aiKey').value = aiCfg.key;
  $('#aiModel').value = aiCfg.model;
  $('#aiThink').checked = aiCfg.think;
  $('#aiStreamSel').value = aiCfg.streamOut ? 'stream' : 'full';
  $('#aiSettings').hidden = false;
  $('#aiKey').focus();
}
/* 流式气泡结构：💭 思考折叠块 + 正式回答区 */
function buildBotBubble(bot) {
  bot.innerHTML = `<details class="ai-rc" open><summary>💭 深度思考中…</summary><div class="ai-rc-body"></div></details><div class="ai-ans"></div>`;
  return {
    rcBody: bot.querySelector('.ai-rc-body'),
    rcDetails: bot.querySelector('.ai-rc'),
    rcSummary: bot.querySelector('.ai-rc summary'),
    ans: bot.querySelector('.ai-ans'),
  };
}
async function sendAi() {
  const q = QMAP.get(aiQid);
  const input = $('#aiInput');
  const text = input.value.trim();
  if (!q || !text) return;
  if (!aiCfg.key) { openAiSettings(); return; }
  try { await ensureAiVendors(); } catch (e) { appendAiBubble('err').innerHTML = '❌ ' + esc(e.message); return; }

  store.chats = store.chats || {};
  const hist = store.chats[aiQid] || (store.chats[aiQid] = []);
  hist.push({ role: 'user', content: text, t: Date.now() });
  save();
  renderAiMsgs();
  input.value = ''; input.style.height = 'auto';

  const bot = appendAiBubble('bot', true);
  const parts = buildBotBubble(bot);
  const sendBtn = $('#aiSendBtn');
  sendBtn.textContent = '⏹ 停止'; sendBtn.classList.add('stop');
  aiAbort = new AbortController();

  let rc = '', full = '', dirtyC = false, dirtyR = false, lastPaint = 0;
  let sawByte = false, watchdogFired = false;
  const paintRc = () => {
    parts.rcBody.textContent = rc;
    if (full) { parts.rcDetails.open = false; parts.rcSummary.textContent = `💭 已深度思考（约 ${Math.max(1, Math.round(rc.length / 120))} 秒阅读量）· 点击展开`; }
    scrollAi();
  };
  const paintAns = () => { parts.ans.innerHTML = aiMdToHtml(full); scrollAi(); };

  const watchdog = setInterval(() => {
    if (Date.now() - (sendAi._lastByte || 0) > 60000) { watchdogFired = true; aiAbort.abort(); }
  }, 5000);
  sendAi._lastByte = Date.now();

  const messages = () => [{ role: 'system', content: AI_SYSTEM + '\n\n' + aiContext(q) },
    ...hist.slice(-30).map(m => ({ role: m.role, content: m.content }))];
  const body = (withThinking) => {
    const b = { model: aiCfg.model, messages: messages(), stream: aiCfg.streamOut };
    if (withThinking) b.thinking = { type: aiCfg.think ? 'enabled' : 'disabled' };
    return b;
  };

  try {
    let res = await fetch(aiCfg.base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aiCfg.key },
      body: JSON.stringify(body(true)),
      signal: aiAbort.signal,
    });
    // thinking 参数不被接受时，去掉该参数重试一次
    if (res.status === 400) {
      res = await fetch(aiCfg.base + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aiCfg.key },
        body: JSON.stringify(body(false)),
        signal: aiAbort.signal,
      });
    }
    if (!res.ok) {
      let detail = '';
      try { const j = await res.json(); detail = j.error?.message || JSON.stringify(j).slice(0, 200); }
      catch { detail = await res.text().catch(() => ''); }
      throw Object.assign(new Error(detail || res.statusText), { status: res.status });
    }

    if (!aiCfg.streamOut) {
      /* 整段返回：一次性解析 */
      const j = await res.json();
      sendAi._lastByte = Date.now(); sawByte = true;
      const msg = j.choices?.[0]?.message || {};
      rc = msg.reasoning_content || '';
      full = msg.content || '';
      if (rc) { parts.rcBody.textContent = rc; parts.rcDetails.open = false; parts.rcSummary.textContent = '💭 已深度思考 · 点击展开'; }
      parts.ans.innerHTML = aiMdToHtml(full || '（模型未返回内容）');
    } else {
      /* 流式：先收 reasoning_content（思考），再收 content（回答），两者都实时显示 */
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sendAi._lastByte = Date.now(); sawByte = true;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta || {};
            if (delta.reasoning_content) { rc += delta.reasoning_content; dirtyR = true; }
            if (delta.content) { full += delta.content; dirtyC = true; }
          } catch {}
        }
        const now = Date.now();
        if (dirtyR && now - lastPaint > 200) { paintRc(); lastPaint = now; dirtyR = false; }
        if (dirtyC && now - lastPaint > 150) { paintAns(); lastPaint = now; dirtyC = false; }
      }
      if (rc) paintRc();
      if (full) paintAns();
    }
    bot.classList.remove('streaming');
    if (full || rc) { hist.push({ role: 'assistant', content: full || '（无正文内容）', t: Date.now(), ...(rc ? { rc } : {}) }); save(); }
    else bot.remove();
  } catch (err) {
    bot.classList.remove('streaming');
    if (err.name === 'AbortError') {
      if (watchdogFired) {
        bot.remove();
        appendAiBubble('err').innerHTML = `⏱️ 60 秒内没有收到任何数据，已自动中断。<br><small>常见原因：① 代理/VPN 缓存了流式响应 → ⚙️ 里把「输出方式」改成<b>整段返回</b>；② 网络无法直连 api.deepseek.com。</small>`;
      } else if (full || rc) {
        if (full) paintAns(); else parts.rcBody.textContent = rc;
        parts.rcDetails.open = false;
        parts.rcSummary.textContent = '💭 思考（手动停止）';
        hist.push({ role: 'assistant', content: full || '（已停止生成）', t: Date.now(), ...(rc ? { rc } : {}) });
        save();
      } else bot.remove();
    } else {
      bot.remove();
      appendAiBubble('err').innerHTML = aiErrMsg(err);
    }
  } finally {
    clearInterval(watchdog);
    aiAbort = null;
    const b = $('#aiSendBtn');
    b.textContent = '发送'; b.classList.remove('stop');
    scrollAi();
  }
}

$('#aiSendBtn').addEventListener('click', () => { if (aiAbort) aiAbort.abort(); else sendAi(); });
$('#aiInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAi(); }
});
$('#aiInput').addEventListener('input', e => {
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px';
});
$('#aiCloseBtn').addEventListener('click', () => { $('#aiPanel').hidden = true; });
$('#aiSettingsBtn').addEventListener('click', openAiSettings);
$('#aiClearBtn').addEventListener('click', () => {
  if (!aiQid) return;
  if (!confirm('清空本题的 AI 对话记录？')) return;
  delete (store.chats || {})[aiQid];
  save();
  renderAiMsgs();
  if (!$('#aiHistory').hidden) renderAiHistory();
});
$('#aiHistBtn').addEventListener('click', () => setAiHist($('#aiHistory').hidden));
$('#aiHistory').addEventListener('click', e => {
  const del = e.target.closest('[data-del]');
  if (del) {
    const qid = del.dataset.del;
    if (!confirm('删除本题的 AI 对话记录？')) return;
    delete (store.chats || {})[qid];
    save();
    if (qid === aiQid) renderAiMsgs();
    renderAiHistory();
    return;
  }
  const item = e.target.closest('.ai-hitem');
  if (!item || !QMAP.has(item.dataset.qid)) return;
  goToQuestion(item.dataset.qid);   // 背景里滚动定位到该题
  openAIPanel(item.dataset.qid);
});
$('#aiSaveSettings').addEventListener('click', () => {
  aiCfg.base = ($('#aiBase').value.trim() || 'https://api.deepseek.com').replace(/\/+$/, '');
  aiCfg.key = $('#aiKey').value.trim();
  aiCfg.model = $('#aiModel').value;
  aiCfg.think = $('#aiThink').checked;
  aiCfg.streamOut = $('#aiStreamSel').value === 'stream';
  saveAiCfg();
  $('#aiSettings').hidden = true;
  toast(aiCfg.key ? '✅ AI 设置已保存' : '⚠️ 未填 Key，填好才能提问');
});
$('#aiCancelSettings').addEventListener('click', () => { $('#aiSettings').hidden = true; });
$('#aiSettings').addEventListener('click', e => { if (e.target.id === 'aiSettings') $('#aiSettings').hidden = true; });

/* 面板宽度：拖左缘调节，双击恢复默认（与侧栏同一套交互） */
const AIW_KEY = 'sign_quiz_aiw', AIW_DEF = 680;
const aiwClamp = w => Math.min(Math.min(1280, window.innerWidth - 40), Math.max(420, w));
const applyAiw = () => $('#aiPanel').style.setProperty('--aiw', aiw + 'px');
let aiw = aiwClamp(+(localStorage.getItem(AIW_KEY) || AIW_DEF));
applyAiw();
{
  const rz = $('#aiResizer');
  rz.addEventListener('pointerdown', e => {
    e.preventDefault();
    document.body.classList.add('resizing');
    rz.classList.add('dragging');
    try { rz.setPointerCapture(e.pointerId); } catch {}
    const move = ev => { aiw = aiwClamp(window.innerWidth - ev.clientX); applyAiw(); };
    const up = () => {
      rz.classList.remove('dragging');
      document.body.classList.remove('resizing');
      localStorage.setItem(AIW_KEY, String(aiw));
      rz.removeEventListener('pointermove', move);
      rz.removeEventListener('pointerup', up);
      rz.removeEventListener('pointercancel', up);
    };
    rz.addEventListener('pointermove', move);
    rz.addEventListener('pointerup', up);
    rz.addEventListener('pointercancel', up);
  });
  rz.addEventListener('dblclick', () => { aiw = AIW_DEF; applyAiw(); localStorage.setItem(AIW_KEY, String(AIW_DEF)); });
}

/* ---------------- 备份（含 AI 对话记录） ---------------- */
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ app: 'sign-quiz', version: 2, exportedAt: new Date().toISOString(), marks: store.marks, chats: store.chats || {} }, null, 2)],
    { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `刷题记录备份_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('✅ 备份已导出');
});
$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (!data || typeof data.marks !== 'object') throw new Error('格式不对');
      const n = Object.keys(data.marks).length + Object.keys(data.chats || {}).length;
      if (!confirm(`将导入 ${Object.keys(data.marks).length} 条做题记录、${Object.keys(data.chats || {}).length} 题对话记录，并覆盖当前数据，确定？`)) return;
      store = { marks: data.marks, chats: data.chats || {} };
      save();
      renderSidebar(); renderCards(); renderStats();
      toast('✅ 导入成功');
    } catch { toast('❌ 导入失败：文件格式不正确'); }
  };
  r.readAsText(f);
  e.target.value = '';
});
$('#clearBtn').addEventListener('click', () => {
  if (!confirm('确定清空所有做题记录（不会/不熟/掌握/收藏）？此操作不可恢复，建议先导出备份。')) return;
  store = { marks: {} };
  save();
  renderSidebar(); renderCards(); renderStats();
  toast('已清空所有记录');
});

/* ---------------- lightbox / toast / 主题 ---------------- */
function openLightbox(src) {
  $('#lightboxImg').src = src;
  $('#lightbox').hidden = false;
}
$('#lightbox').addEventListener('click', () => { $('#lightbox').hidden = true; });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#lightbox').hidden) { $('#lightbox').hidden = true; return; }
  if (!$('#aiSettings').hidden) { $('#aiSettings').hidden = true; return; }
  if (!$('#aiHistory').hidden) { setAiHist(false); return; }
  if (!$('#aiPanel').hidden) $('#aiPanel').hidden = true;
});

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
}

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem(LS_THEME, t);
}
$('#themeBtn').addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem(LS_THEME) ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

/* ---------------- 外观风格（暖纸 Claude 风 / 冷灰现代风） ---------------- */
const LS_LOOK = 'sign_quiz_look';
function applyLook(look, save = true) {
  document.documentElement.dataset.look = look;
  if (save) localStorage.setItem(LS_LOOK, look);
  $$('#lookMenu .look-opt[data-look]').forEach(b => b.classList.toggle('active', b.dataset.look === look));
}
applyLook(localStorage.getItem(LS_LOOK) || 'claude', false);
$('#lookBtn').addEventListener('click', e => {
  e.stopPropagation();
  $('#lookMenu').hidden = !$('#lookMenu').hidden;
});
document.addEventListener('click', e => {
  if (!$('#lookMenu').hidden && !e.target.closest('#lookMenu')) $('#lookMenu').hidden = true;
});
$$('#lookMenu .look-opt[data-look]').forEach(b =>
  b.addEventListener('click', () => { applyLook(b.dataset.look); }));
$$('#lookMenu .look-opt[data-theme-opt]').forEach(b =>
  b.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  }));

/* ---------------- 启动 ---------------- */
$$('#tabs .tab').forEach(t => t.addEventListener('click', () => switchView(t.dataset.view)));
renderSidebar();
renderFilterBar();
renderCards();
window.addEventListener('hashchange', () => {
  const m = location.hash.match(/^#q=(.+)$/);
  if (m) goToQuestion(m[1]);
});
const initJump = location.hash.match(/^#q=(.+)$/);
if (initJump) goToQuestion(initJump[1]);
