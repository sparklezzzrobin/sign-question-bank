/**
 * build-data.mjs —— 把《专题刷题库》6 个 Markdown 解析渲染为 app/data/questions.js
 *
 * 用法：  cd app/tools && npm install && npm run build
 * 产物：  app/data/questions.js（window.QUESTION_DATA，供 index.html <script> 直接引入）
 *         app/assets/vendor/katex/（KaTeX CSS + 字体，公式在构建期渲染，运行时只需要这份 CSS）
 *
 * 解析约定（与题库书写格式一致）：
 *   题卡标题  ###/#### 2025 · 第 1 题（12 分）｜ 标题        （2026 模拟 · 第 N 题 亦支持）
 *   小节标题  ## 1.1 xxx   /   ### 3.3.1 xxx
 *   元信息行  > **细分** … ・ **题源** … ・ **原图** … ・ **出处** …
 *   题干      **题干** 之后，直到 <details> / > △ / --- / 下一个标题
 *   解析      <details><summary>…</summary> … </details>
 *   专题六 6.3 课件补充为有序列表项，单独解析为 T6-extra-N
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';
import katex from 'katex';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');            // Sign/
const APP  = path.join(ROOT, 'app');
const SRC  = path.join(ROOT, '专题刷题库');
const OUT  = path.join(APP, 'data');

const TOPICS = [
  { no: 1, file: '专题一_信号基础运算与LTI性质.md',   name: '信号基础运算与 LTI 性质' },
  { no: 2, file: '专题二_时域响应卷积与差分建模.md', name: '时域响应、卷积与差分建模' },
  { no: 3, file: '专题三_傅里叶变换SSB调制与抽样.md', name: '傅里叶变换、SSB 调制与抽样' },
  { no: 4, file: '专题四_拉普拉斯变换与S域电路.md',   name: '拉普拉斯变换与 S 域电路' },
  { no: 5, file: '专题五_Z变换与离散系统.md',        name: 'Z 变换与离散系统' },
  { no: 6, file: '专题六_状态变量分析.md',           name: '状态变量分析' },
  /* 拓展专题：仅来自教材习题库（郑君里教辅），无对应真题卷 */
  { no: 7, file: null, name: '信号矢量空间分析' },
  { no: 8, file: null, name: '离散傅里叶变换' },
  { no: 9, file: null, name: '模拟与数字滤波器' },
  { no: 10, file: null, name: '反馈系统' },
];
const topicNameOf = (no) => (TOPICS.find(t => t.no === no) || {}).name || `专题${no}`;

/* 教材习题库（郑君里《信号与系统》第3版教辅）：章号 → 专题映射 */
const TB_DIR = path.join(ROOT, '教材习题库');
export const TB_PDF_HREF = 'pdf/郑君里《信号与系统》（第3版）笔记和课后习题（含考研真题）详解.pdf';
const TB_CHAPTERS = [
  { ch: 1,  topic: 1,  file: '第01章_绪论.md' },
  { ch: 2,  topic: 2,  file: '第02章_连续时间系统的时域分析.md' },
  { ch: 3,  topic: 3,  file: '第03章_傅里叶变换.md' },
  { ch: 4,  topic: 4,  file: '第04章_拉普拉斯变换与s域分析.md' },
  { ch: 5,  topic: 3,  file: '第05章_滤波调制与抽样.md' },
  { ch: 6,  topic: 7,  file: '第06章_信号的矢量空间分析.md' },
  { ch: 7,  topic: 5,  file: '第07章_离散时间系统的时域分析.md' },
  { ch: 8,  topic: 5,  file: '第08章_z变换与z域分析.md' },
  { ch: 9,  topic: 8,  file: '第09章_离散傅里叶变换.md' },
  { ch: 10, topic: 9,  file: '第10章_模拟与数字滤波器.md' },
  { ch: 11, topic: 10, file: '第11章_反馈系统.md' },
  { ch: 12, topic: 6,  file: '第12章_系统的状态变量分析.md' },
];

/* 27 强化讲义（风中醉风）：讲义专题 → 系统专题映射；题目 PDF 物理页 = 正文页码 + 2 */
const LECT_DIR = path.join(ROOT, '强化讲义库');
const LECT_PDF_HREF = 'pdf/27强化讲义.pdf';
const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九'];
const LECTURES = [
  { n: 1,  topic: 1, file: '讲义专题01_信号的分类运算和性质.md' },
  { n: 2,  topic: 1, file: '讲义专题02_系统的特性响应分类和阶数判断.md' },
  { n: 3,  topic: 1, file: '讲义专题03_冲激信号的运算.md' },
  { n: 4,  topic: 2, file: '讲义专题04_卷积卷积和.md' },
  { n: 5,  topic: 2, file: '讲义专题05_微分方程和差分方程求解.md' },
  { n: 6,  topic: 3, file: '讲义专题06_傅里叶级数.md' },
  { n: 7,  topic: 3, file: '讲义专题07_傅里叶变换的性质及常用结论.md' },
  { n: 8,  topic: 3, file: '讲义专题08_傅里叶变换分析通信系统.md' },
  { n: 9,  topic: 3, file: '讲义专题09_抽样定理.md' },
  { n: 10, topic: 4, file: '讲义专题10_拉氏变换的收敛域性质和常用结论.md' },
  { n: 11, topic: 5, file: '讲义专题11_z变换的收敛域性质和常用结论.md' },
  { n: 12, topic: 4, file: '讲义专题12_拉氏逆变换和逆z变换.md' },
  { n: 13, topic: 4, file: '讲义专题13_系统函数.md' },
  { n: 14, topic: 4, file: '讲义专题14_拉氏变换分析电路问题.md' },
  { n: 15, topic: 6, file: '讲义专题15_状态变量分析.md' },
  { n: 16, topic: 1, file: '讲义专题16_定义判断题.md' },
  { n: 17, topic: 1, file: '讲义专题17_推理题.md' },
  { n: 18, topic: 1, file: '讲义专题18_证明题.md' },
  { n: 19, topic: 1, file: '讲义专题19_简答题.md' },
];
const lectAnsPdf = (n) => `pdf/强化讲义专题${CN_NUM[n]}答案.pdf`;

/* 各年份原卷 PDF（相对 Sign 根目录）；2013~2021 用题库存档 HTML */
const PDF_MAP = {
  2022: [
    { label: '原卷 PDF', href: 'pdf/2022年武汉大学936信号与系统真题.pdf' },
    { label: '答案 PDF', href: 'pdf/2022年武汉大学936信号与系统真题答案.pdf' },
  ],
  2023: [
    { label: '原卷 PDF', href: 'pdf/2023年武汉大学936信号与系统真题.pdf' },
    { label: '答案 PDF', href: 'pdf/2023年武汉大学936信号与系统真题答案.pdf' },
  ],
  2024: [
    { label: '原卷 PDF', href: 'pdf/2024年武汉大学936信号与系统真题.pdf' },
    { label: '答案 PDF', href: 'pdf/2024年武汉大学936信号与系统答案.pdf' },
  ],
  2025: [{ label: '真题+答案 PDF', href: 'pdf/2025真题和答案.pdf' }],
  2026: [
    { label: '原卷 PDF', href: 'pdf/26年真题.pdf' },
    { label: '参考答案 PDF', href: 'pdf/26年参考答案.pdf' },
  ],
};
const ARCHIVE_PDFS = [{ label: '题库存档（原卷+部分答案）', href: 'pdf/信号与系统题库（含部分答案）.html' }];
const pdfsFor = (year) => (year && PDF_MAP[year]) || ARCHIVE_PDFS;

marked.use({ gfm: true, breaks: false });

/* ---------------- 公式遮罩 + KaTeX 渲染 ---------------- */
let mathStore = [];
const stash = (tex, disp) => (mathStore.push({ tex: tex.trim(), disp }), `ZZKTXZZ${mathStore.length - 1}ZZKTXZZ`);

function maskMath(md) {
  return md
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => stash(tex, true))
    .replace(/\$([^$]+?)\$/g, (_, tex) => stash(tex, false));
}

function renderMasked(html) {
  const errors = [];
  const out = html.replace(/ZZKTXZZ(\d+)ZZKTXZZ/g, (_, i) => {
    const { tex, disp } = mathStore[+i];
    try {
      return katex.renderToString(tex, { displayMode: disp, throwOnError: true, strict: false });
    } catch (e) {
      errors.push(tex.slice(0, 80));
      return katex.renderToString(tex, { displayMode: disp, throwOnError: false, strict: false });
    }
  });
  return { html: out, errors };
}

function md2html(md) {
  mathStore = [];
  const { html, errors } = renderMasked(marked.parse(maskMath(md)));
  return { html, errors };
}

/** 标题里可能夹 $…$，不走 marked，只做转义 + 行内公式 */
function title2html(t) {
  mathStore = [];
  const masked = maskMath(t);
  const esc = masked.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return renderMasked(esc).html;
}

/* ---------------- 题卡解析 ---------------- */
const CARD_RE  = /^(\d{4})( 模拟)?\s*·\s*第\s*(\d+)\s*题(?:（(\d+)\s*分）)?\s*｜\s*(.+)$/;
const TB_CARD_RE = /^(教材|名校)\s*(\d+)-(\d+)\s*｜\s*(.+)$/;
const SEC2_RE  = /^(\d+\.\d+)\s+(.+)/;
const SEC3_RE  = /^(\d+\.\d+\.\d+)\s+(.+)/;
const META_KEYS = ['细分', '题源', '原图', '出处', '页码', '归类', '答案页', '专题'];

function splitMeta(block) {
  const meta = {};
  for (const key of META_KEYS) {
    const re = new RegExp(`\\*\\*${key}\\*\\*([\\s\\S]*?)(?=\\*\\*(?:${META_KEYS.join('|')})\\*\\*|$)`, 'g');
    const parts = [...block.matchAll(re)].map(m => m[1].replace(/[\s・·+＋/]*$/, '').trim()).filter(Boolean);
    if (parts.length) meta[key] = parts.join('\n');   // 同键多次出现（如多张原图）合并
  }
  return meta;
}

function extractImages(seg, report, ctx) {
  const imgs = [];
  let missingNote = null;
  const MISS = '原图未随资料库保存 · 请对照原卷 PDF';
  if (!seg) return { imgs, missingNote };
  if (/未随存档保留|无关/.test(seg)) missingNote = MISS;
  for (const m of seg.matchAll(/`([^`]*images\/[^`]+)`/g)) {
    const rel = m[1].trim();
    const exists = existsSync(path.join(ROOT, rel));
    if (exists && !missingNote) imgs.push({ type: 'local', src: rel, href: '../' + rel });
    else if (!exists && !missingNote) {
      report.missingImages.push(`${ctx}: ${rel}（路径不存在）`);
      imgs.push({ type: 'missing', note: MISS });
    }
  }
  for (const m of seg.matchAll(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g)) {
    imgs.push({ type: 'remote', src: m[2], href: m[2], label: m[1] });
  }
  if (!imgs.length && missingNote) imgs.push({ type: 'missing', note: missingNote });
  return { imgs, missingNote };
}

function parseTopicFile(tp, report) {
  const text = readFileSync(path.join(SRC, tp.file), 'utf8');
  const lines = text.split(/\r?\n/);
  const cards = [];
  let sec2 = null, sec3 = null;           // 当前 2 级 / 3 级小节
  let i = 0;
  const H = /^(#{1,6})\s+(.*)$/;

  while (i < lines.length) {
    const hm = lines[i].match(H);
    if (!hm) { i++; continue; }
    const [, hashes, htext] = hm;
    const level = hashes.length;
    const c = htext.match(CARD_RE);
    if (c) {
      const year = +c[1];
      const isMock = Boolean(c[2]);
      const qNum = +c[3];
      const score = c[4] ? +c[4] : null;
      const title = c[5].trim();
      i++;
      // 收集标题后的元信息 blockquote
      let metaBlock = '';
      while (i < lines.length && (/^>/.test(lines[i]) || /^\s*$/.test(lines[i]))) {
        if (/^>/.test(lines[i])) metaBlock += lines[i].replace(/^>\s?/, '') + '\n';
        i++;
      }
      const meta = splitMeta(metaBlock);
      // 题干
      let stem = '', solution = null, solSource = null, remarks = [];
      let inDetails = false, summaryDone = false;
      const detBuf = [];
      while (i < lines.length) {
        const L = lines[i];
        if (H.test(L)) break;
        if (/^\s*-{3,}\s*$/.test(L)) { if (!inDetails) break; }
        if (/^\s*\*\*题干\*\*\s*$/.test(L)) { i++; continue; }
        if (!inDetails && /^\s*<details>/i.test(L)) {
        inDetails = true;
        summaryDone = /<\/summary>/i.test(L);   // 单行 <details><summary>…</summary> 格式
        i++; continue;
      }
        if (inDetails) {
          if (/<summary>/i.test(L)) {
            const sm = L.match(/<summary>([\s\S]*?)<\/summary>/i);
            const s = sm ? sm[1] : '';
            const srcM = s.match(/（([^）]*)）/);
            solSource = srcM && srcM[1] ? srcM[1] : null;
            if (solSource && /先自己|做一遍/.test(solSource)) solSource = null;
            if (sm) { summaryDone = true; i++; continue; }
          }
          if (/<\/details>/i.test(L)) { inDetails = false; i++; continue; }
          if (summaryDone) detBuf.push(L);
          i++;
          continue;
        }
        if (/^>\s*△?/.test(L) && /△/.test(L)) { remarks.push(L.replace(/^>\s?/, '').trim()); i++; continue; }
        stem += L + '\n';
        i++;
      }
      const post = detBuf.join('\n').trim();
      if (post) solution = post;
      // id 规则：T专题号-年份(模拟卷加 m)-题号，如 T1-2025-1 / T1-2026m-5 / T6-extra-1
      const cardId = `T${tp.no}-${year}${isMock ? 'm' : ''}-${qNum}`;
      const { imgs, missingNote } = extractImages(meta['原图'] || '', report, `${tp.file} ${year}-${qNum}`);
      const { html: stemHtml, errors: e1 } = md2html(stem.trim());
      let solHtml = null;
      const e2 = [];
      if (solution != null) { const r = md2html(solution); solHtml = r.html; e2.push(...r.errors); }
      if (missingNote && !imgs.length) imgs.push({ type: 'missing', note: missingNote });
      const remarkText = remarks.length ? remarks.join(' ') : null;
      cards.push({
        id: cardId, topicNo: tp.no, topicName: tp.name,
        srcKind: 'exam', srcLabel: null,
        section: sec3 ? sec3.code : (sec2 ? sec2.code : null),
        sectionTitle: sec3 ? sec3.title : (sec2 ? sec2.title : null),
        group: sec2 ? sec2.code : null, groupTitle: sec2 ? sec2.title : null,
        subCode: meta['细分'] || null,
        year, isMock, qNum, score,
        title, titleHtml: title2html(title),
        stemHtml, searchText: (title + '\n' + stem).toLowerCase(),
        stem: stem.trim(),
        solution: solution != null ? solution : null,
        solutionHtml: solHtml, solutionSource: solSource,
        images: imgs,
        pdfs: pdfsFor(year),
        remark: remarkText,
        remarkHtml: remarkText ? title2html(remarkText) : null,
      });
      report.katexErrors.push(...e1, ...e2);
      continue;
    }
    // 小节标题
    const s3 = htext.match(SEC3_RE);
    if (s3 && level >= 3) { sec3 = { code: s3[1], title: s3[2].trim() }; i++; continue; }
    const s2 = htext.match(SEC2_RE);
    if (s2 && level <= 3) { sec2 = { code: s2[1], title: s2[2].trim() }; sec3 = null; i++; continue; }
    // 考频总览 / 参见 等：若为“参见”块，跳过整块
    if (/参见/.test(htext)) {
      i++;
      while (i < lines.length && !H.test(lines[i])) i++;
      continue;
    }
    i++;
  }
  return cards;
}

/* 专题六 6.3 课件补充（有序列表项） */
function parseExtras(report) {
  const text = readFileSync(path.join(SRC, TOPICS[5].file), 'utf8');
  const start = text.indexOf('## 6.3');
  if (start < 0) return [];
  const seg = text.slice(start).split(/\r?\n/);
  const cards = [];
  for (const L of seg) {
    const m = L.match(/^(\d+)\.\s+(.+)$/);
    if (!m) continue;
    const n = +m[1];
    const raw = m[2].trim();
    const { html } = md2html(raw);
    cards.push({
      id: `T6-extra-${n}`, topicNo: 6, topicName: TOPICS[5].name,
      srcKind: 'course', srcLabel: '课件补充',
      section: '6.3', sectionTitle: '课件补充练习', group: '6.3', groupTitle: '课件补充练习（题库存档附录）',
      subCode: null, year: null, isMock: false, qNum: null, score: null,
      title: `课件补充练习 ${n}`, titleHtml: `课件补充练习 ${n}`,
      stemHtml: html, searchText: ('课件补充练习 ' + n + ' ' + raw).toLowerCase(),
      stem: raw, solution: null,
      solutionHtml: null, solutionSource: null,
      images: [], pdfs: ARCHIVE_PDFS,
      remark: '△ 题库未附解析（课件补充题）。',
      remarkHtml: '△ 题库未附解析（课件补充题）。',
    });
  }
  return cards;
}

/* ---------------- 教材习题库（郑君里教辅）----------------
 * 卡片标题：#### 教材 2-15 ｜ 标题   /   #### 名校 2-3 ｜ 标题
 * 元信息：> **归类** 1.4（归入该专题现有考点小节；新小节写 "1.6 标题"）・ **原图** `images/tb/xxx.png` ・ **出处** 中山大学 2010 研 ・ **页码** 24
 * 题干 **题干** 之后；解析 <details><summary>📖 解答</summary>…</details>
 */
const sec2MapCache = new Map();   // topicNo -> { code: title }
function sec2MapOf(topicNo) {
  if (sec2MapCache.has(topicNo)) return sec2MapCache.get(topicNo);
  const tp = TOPICS.find(t => t.no === topicNo);
  const map = {};
  if (tp && tp.file && existsSync(path.join(SRC, tp.file))) {
    for (const m of readFileSync(path.join(SRC, tp.file), 'utf8').matchAll(/^## (\d+\.\d+)\s+(.+)$/gm)) {
      map[m[1]] = m[2].trim();
    }
  }
  sec2MapCache.set(topicNo, map);
  return map;
}

function parseTbFile(entry, report) {
  const fp = path.join(TB_DIR, entry.file);
  if (!existsSync(fp)) return [];
  const text = readFileSync(fp, 'utf8');
  const lines = text.split(/\r?\n/);
  const cards = [];
  let i = 0;
  const H = /^(#{1,6})\s+(.*)$/;

  while (i < lines.length) {
    const hm = lines[i].match(H);
    if (!hm) { i++; continue; }
    const c = hm[2].match(TB_CARD_RE);
    if (!c) { i++; continue; }
    const kind = c[1] === '教材' ? 'textbook' : 'school';
    const no = `${c[2]}-${c[3]}`;
    const title = c[4].trim().replace(/？$/, '');   // 尾部"？"=转录存疑标记，不入标题
    const uncertain = /？$/.test(c[4].trim());
    i++;
    let metaBlock = '';
    while (i < lines.length && (/^>/.test(lines[i]) || /^\s*$/.test(lines[i]))) {
      if (/^>/.test(lines[i])) metaBlock += lines[i].replace(/^>\s?/, '') + '\n';
      i++;
    }
    const meta = splitMeta(metaBlock);
    let stem = '', solution = null, solSource = null;
    let inDetails = false, summaryDone = false;
    const detBuf = [];
    while (i < lines.length) {
      const L = lines[i];
      if (H.test(L)) break;
      if (/^\s*-{3,}\s*$/.test(L) && !inDetails) break;
      if (/^\s*\*\*题干\*\*\s*$/.test(L)) { i++; continue; }
      if (!inDetails && /^\s*<details>/i.test(L)) {
        inDetails = true;
        summaryDone = /<\/summary>/i.test(L);   // 单行 <details><summary>…</summary> 格式
        i++; continue;
      }
      if (inDetails) {
        if (/<summary>/i.test(L)) {
          const sm = L.match(/<summary>([\s\S]*?)<\/summary>/i);
          if (sm) { summaryDone = true; i++; continue; }
        }
        if (/<\/details>/i.test(L)) { inDetails = false; i++; continue; }
        if (summaryDone) detBuf.push(L);
        i++;
        continue;
      }
      stem += L + '\n';
      i++;
    }
    const post = detBuf.join('\n').trim();
    if (post) solution = post;

    const id = `TB${entry.ch}-${kind === 'textbook' ? 'E' : 'K'}${c[3]}`;
    const { imgs, missingNote } = extractImages(meta['原图'] || '', report, `${entry.file} ${no}`);
    const { html: stemHtml, errors: e1 } = md2html(stem.trim());
    let solHtml = null;
    const e2 = [];
    if (solution != null) { const r = md2html(solution); solHtml = r.html; e2.push(...r.errors); }
    if (missingNote && !imgs.length) imgs.push({ type: 'missing', note: missingNote });
    const page = meta['页码'] ? +meta['页码'].trim() || null : null;
    const srcNote = (meta['出处'] || '').trim() || null;
    const srcLabel = kind === 'textbook' ? `教材 ${no}` : (srcNote || `名校 ${no}`);
    /* 归类：优先映射到该专题现有考点小节；写"新代码 标题"则新建小节 */
    const cls = (meta['归类'] || '').trim();
    const clsM = cls.match(/^(\d+\.\d+)\s*(.*)$/);
    let group = '其他', groupTitle = '其他题目（待归类）';
    if (clsM) {
      group = clsM[1];
      groupTitle = sec2MapOf(entry.topic)[clsM[1]] || clsM[2].trim() || clsM[1];
    }
    const remarkText = uncertain ? '△ 本章转录存在个别辨认不清之处，欢迎对照教辅 PDF 校对。' : null;
    cards.push({
      id, topicNo: entry.topic, topicName: topicNameOf(entry.topic),
      srcKind: kind, srcLabel,
      section: null, sectionTitle: null,
      group, groupTitle,
      subCode: meta['细分'] || null,
      year: null, isMock: false, qNum: null, score: null,
      title, titleHtml: title2html(title),
      stemHtml, searchText: (title + '\n' + (srcNote || '') + '\n' + stem).toLowerCase(),
      stem: stem.trim(),
      solution, solutionHtml: solHtml, solutionSource: srcNote,
      images: imgs,
      pdfs: page ? [{ label: `教辅详解 · p${page}`, href: TB_PDF_HREF + '#page=' + page }]
                 : [{ label: '教辅详解 PDF', href: TB_PDF_HREF }],
      remark: remarkText,
      remarkHtml: remarkText,
    });
    report.katexErrors.push(...e1, ...e2);
  }
  return cards;
}

/* ---------------- 27 强化讲义（风中醉风）----------------
 * 卡片标题：#### 讲义 1-5 ｜ 标题   （专题号-专题内连续题号；强化题为【强化】前缀）
 * 元信息：> **归类** 1.3 标题 ・ **原图** `images/lg/…` ・ **出处** … ・ **页码** <讲义 PDF 物理页> ・ **答案页** <答案 PDF 页> ・ **专题** <覆盖归属专题>
 * 题干 **题干** 之后；解析 <details>…</details>（自撰文字解析 + 手写答案 PDF 链接）
 */
function parseLectFile(entry, report) {
  const fp = path.join(LECT_DIR, entry.file);
  if (!existsSync(fp)) {
    console.warn(`⚠ 讲义文件缺失：${entry.file}`);
    return [];
  }
  const text = readFileSync(fp, 'utf8');
  const lines = text.split(/\r?\n/);
  const cards = [];
  let i = 0;
  const H = /^(#{1,6})\s+(.*)$/;
  const RE = /^讲义\s*(\d+)-(\d+)\s*｜\s*(.+)$/;

  while (i < lines.length) {
    const hm = lines[i].match(H);
    if (!hm) { i++; continue; }
    const c = hm[2].match(RE);
    if (!c) { i++; continue; }
    const no = `${c[1]}-${c[2]}`;
    const title = c[3].trim().replace(/？$/, '');
    i++;
    let metaBlock = '';
    while (i < lines.length && (/^>/.test(lines[i]) || /^\s*$/.test(lines[i]))) {
      if (/^>/.test(lines[i])) metaBlock += lines[i].replace(/^>\s?/, '') + '\n';
      i++;
    }
    const meta = splitMeta(metaBlock);
    let stem = '', solution = null, solSource = null;
    let inDetails = false, summaryDone = false;
    const detBuf = [];
    while (i < lines.length) {
      const L = lines[i];
      if (H.test(L)) break;
      if (/^\s*-{3,}\s*$/.test(L) && !inDetails) break;
      if (/^\s*\*\*题干\*\*\s*$/.test(L)) { i++; continue; }
      if (!inDetails && /^\s*<details>/i.test(L)) {
        inDetails = true;
        summaryDone = /<\/summary>/i.test(L);
        i++; continue;
      }
      if (inDetails) {
        if (/<summary>/i.test(L)) {
          const sm = L.match(/<summary>([\s\S]*?)<\/summary>/i);
          if (sm) { summaryDone = true; i++; continue; }
        }
        if (/<\/details>/i.test(L)) { inDetails = false; i++; continue; }
        if (summaryDone) detBuf.push(L);
        i++;
        continue;
      }
      stem += L + '\n';
      i++;
    }
    const post = detBuf.join('\n').trim();
    if (post) solution = post;

    const id = `LG${entry.n}-${c[2]}`;
    const { imgs, missingNote } = extractImages(meta['原图'] || '', report, `${entry.file} ${no}`);
    const { html: stemHtml, errors: e1 } = md2html(stem.trim());
    let solHtml = null;
    const e2 = [];
    if (solution != null) {
      const r = md2html(solution);
      /* 解析区的手写答案图：注入点击放大（与题图 thumb 同一套 lightbox 委托） */
      solHtml = r.html.replace(/<img([^>]*?)\ssrc="([^"]+)"/g,
        '<img$1 src="$2" data-act="zoom" data-src="$2"');
      e2.push(...r.errors);
    }
    if (missingNote && !imgs.length) imgs.push({ type: 'missing', note: missingNote });
    const page = meta['页码'] ? +meta['页码'].trim() || null : null;
    const ansPage = meta['答案页'] ? +meta['答案页'].trim().split(/[^\d]+/)[0] || null : null;
    const srcNote = (meta['出处'] || '').trim() || null;
    /* 归类：组码首位数字决定到哪个专题的小节表查标题（题型专题的题可跨专题归类） */
    const cls = (meta['归类'] || '').trim();
    const clsM = cls.match(/^(\d+\.\d+)\s*(.*)$/);
    let group = '其他', groupTitle = '其他题目（待归类）';
    if (clsM) {
      group = clsM[1];
      const gTopic = +clsM[1].split('.')[0];
      groupTitle = sec2MapOf(gTopic)[clsM[1]] || clsM[2].trim() || clsM[1];
    }
    const topicNo = +(meta['专题'] || '').trim() || entry.topic;
    solSource = null;   /* 解析为自撰文字版；手写答案经卡底「手写答案 PDF」链接查看 */
    cards.push({
      id, topicNo, topicName: topicNameOf(topicNo),
      srcKind: 'lecture', srcLabel: `讲义 ${no}`,
      section: null, sectionTitle: null,
      group, groupTitle,
      subCode: meta['细分'] || null,
      year: null, isMock: false, qNum: null, score: null,
      title, titleHtml: title2html(title),
      stemHtml, searchText: (title + '\n' + (srcNote || '') + '\n' + stem).toLowerCase(),
      stem: stem.trim(),
      solution, solutionHtml: solHtml, solutionSource: solSource,
      images: imgs,
      pdfs: [
        ...(page ? [{ label: `讲义 · p${page}`, href: LECT_PDF_HREF + '#page=' + page }] : []),
        { label: '手写答案 PDF', href: lectAnsPdf(entry.n) + (ansPage ? '#page=' + ansPage : '') },
      ],
      remark: null, remarkHtml: null,
    });
    report.katexErrors.push(...e1, ...e2);
  }
  return cards;
}

/* ---------------- 主流程 ---------------- */
function main() {
  const report = { total: 0, perTopic: {}, missingImages: [], katexErrors: [], collisions: [] };
  const all = [];
  for (const tp of TOPICS) {
    if (!tp.file) continue;
    const cards = parseTopicFile(tp, report);
    if (tp.no === 6) cards.push(...parseExtras(report));
    report.perTopic[tp.no] = cards.length;
    all.push(...cards);
  }
  /* 教材习题库（郑君里教辅）：按章解析，映射到对应专题 */
  const tbPerTopic = {};
  let tbCount = 0;
  for (const entry of TB_CHAPTERS) {
    const cards = parseTbFile(entry, report);
    tbCount += cards.length;
    tbPerTopic[entry.topic] = (tbPerTopic[entry.topic] || 0) + cards.length;
    all.push(...cards);
  }
  /* 27 强化讲义：按讲义专题解析，题目→系统专题，解析=手写答案嵌入图 */
  const lectPerTopic = {};
  let lectCount = 0;
  for (const entry of LECTURES) {
    const cards = parseLectFile(entry, report);
    lectCount += cards.length;
    if (cards.length) {
      const t = cards[0].topicNo;
      lectPerTopic[t] = (lectPerTopic[t] || 0) + cards.length;
    }
    all.push(...cards);
  }
  report.total = all.length;

  // id 冲突检查
  const seen = new Map();
  for (const q of all) {
    if (seen.has(q.id)) report.collisions.push(`${q.id} 重复（${seen.get(q.id)} / ${q.section}）`);
    seen.set(q.id, q.section);
  }

  // 输出（专题列表只保留实际有题的）
  const usedTopics = new Set(all.map(q => q.topicNo));
  mkdirSync(OUT, { recursive: true });
  const payload = {
    builtAt: new Date().toISOString(),
    topics: TOPICS.filter(t => usedTopics.has(t.no)).map(({ no, name }) => ({ no, name })),
    questions: all,
  };
  writeFileSync(path.join(OUT, 'questions.js'),
    '/* 本文件由 app/tools/build-data.mjs 生成，请勿手改；修改题库后重新构建 */\n' +
    `window.QUESTION_DATA = ${JSON.stringify(payload)};\n`, 'utf8');

  // KaTeX CSS + 字体 + 运行时 JS（AI 对话渲染需要）、marked UMD
  const KD = path.join(HERE, 'node_modules', 'katex', 'dist');
  const VENDOR = path.join(APP, 'assets', 'vendor');
  if (existsSync(KD)) {
    mkdirSync(path.join(VENDOR, 'katex', 'fonts'), { recursive: true });
    cpSync(path.join(KD, 'katex.min.css'), path.join(VENDOR, 'katex', 'katex.min.css'));
    cpSync(path.join(KD, 'katex.min.js'), path.join(VENDOR, 'katex', 'katex.min.js'));
    for (const f of readdirSync(path.join(KD, 'fonts'))) {
      if (/\.(woff2|woff|ttf)$/.test(f)) cpSync(path.join(KD, 'fonts', f), path.join(VENDOR, 'katex', 'fonts', f));
    }
  } else {
    console.warn('⚠ 未找到 katex 包，请先 npm install');
  }
  const MD_UMD = path.join(HERE, 'node_modules', 'marked', 'lib', 'marked.umd.js');
  if (existsSync(MD_UMD)) cpSync(MD_UMD, path.join(VENDOR, 'marked.umd.js'));

  // 对账报告
  const README_COUNTS = { 1: 20, 2: 22, 3: 34, 4: 24, 5: 29, 6: 17 };
  console.log('========== 构建报告 ==========');
  console.log(`题卡总数：${report.total}（真题 146 + 教材库 ${tbCount} + 讲义库 ${lectCount}）`);
  for (const [no, n] of Object.entries(report.perTopic)) {
    const diff = n - (README_COUNTS[no] ?? 0);
    const extra = [];
    if (tbPerTopic[no]) extra.push(`教材库 ${tbPerTopic[no]}`);
    if (lectPerTopic[no]) extra.push(`讲义库 ${lectPerTopic[no]}`);
    const extraN = extra.length ? `（${extra.join(' + ')}）` : '';
    console.log(`  专题${no}：${n} 张${extraN}（真题 README ${README_COUNTS[no] ?? '?'}，差 ${diff >= 0 ? '+' : ''}${diff}）`);
  }
  const withSol = all.filter(q => q.solutionHtml).length;
  const favReady = all.filter(q => q.year && q.qNum).length;
  console.log(`带解析：${withSol} / ${report.total}；可入热力图矩阵（有年份+题号）：${favReady}`);
  const years = [...new Set(all.map(q => q.year).filter(Boolean))].sort();
  console.log(`年份覆盖：${years.join(', ')}`);
  console.log(`ID 冲突：${report.collisions.length ? report.collisions.join('；') : '无'}`);
  console.log(`缺图：${report.missingImages.length} 处`);
  report.missingImages.forEach(x => console.log('  - ' + x));
  console.log(`KaTeX 报错：${report.katexErrors.length} 处`);
  [...new Set(report.katexErrors)].slice(0, 20).forEach(x => console.log('  - ' + x));
  const noPdf = all.filter(q => !q.pdfs || !q.pdfs.length);
  console.log(`无 PDF 链接的题：${noPdf.length}`);
  console.log('输出：app/data/questions.js');
}

main();
