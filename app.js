/* Algo Playground — shell, router, shared widgets */
(function () {
  const Lab = (window.Lab = {});
  const lessons = [];
  Lab.register = (def) => lessons.push(def);

  /* ---------- storage (per-viewer progress, optional) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('algo-pg:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('algo-pg:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  Lab.store = store;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  Lab.esc = esc;
  Lab.k = (s, cls = '') => `<span class="k ${cls}">${esc(s)}</span>`;

  const ICON = {
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4.2" height="15" rx="1"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1"/></svg>',
  };

  /* ---------- chapters & catalogue ---------- */
  const CH = {
    st: { n: '01', name: 'Space–Time Trade-offs', th: 'ยอมใช้หน่วยความจำเพิ่ม เพื่อให้ทำงานเร็วขึ้น' },
    dp: { n: '02', name: 'Dynamic Programming', th: 'แก้ปัญหาย่อยครั้งเดียว จดลงตาราง แล้วใช้ซ้ำ' },
    gr: { n: '03', name: 'Greedy Technique', th: 'ทุกขั้นหยิบตัวที่ดีที่สุดตอนนี้ แล้วไม่ย้อนกลับ' },
  };
  const CATALOG = {
    st: [['counting', 'Counting Sort', 'นับว่ามีกี่ตัวที่น้อยกว่า ได้ตำแหน่งทันที', 'bars'],
         ['horspool', 'Horspool', 'ดูตัวอักษรตัวเดียว แล้วรู้ว่ากระโดดได้กี่ช่อง', 'strip'],
         ['boyer', 'Boyer-Moore', 'สองตาราง shift เลือกค่าที่กระโดดไกลกว่า', 'strip2'],
         ['hashing', 'Hashing', 'คำนวณเลขช่องจาก key แล้วไปที่ช่องนั้นเลย', 'hash'],
         ['btree', 'B-Tree', 'ต้นไม้เตี้ย หนึ่ง node เก็บได้หลาย key', 'btree']],
    dp: [['coinrow', 'Coin-row', 'หยิบเหรียญที่ไม่ติดกันให้ได้มูลค่ามากสุด', 'row'],
         ['change', 'Change-making', 'ทอนเงินด้วยจำนวนเหรียญน้อยที่สุด', 'row'],
         ['collect', 'Coin-collecting', 'หุ่นยนต์เดินขวาหรือลง เก็บเหรียญให้มากสุด', 'grid'],
         ['knapsack', '0/1 Knapsack', 'ถามทีละชิ้นว่าใส่หรือไม่ใส่ แล้วจดคำตอบ', 'grid'],
         ['obst', 'Optimal BST', 'จัด BST ให้ค้นหาเฉลี่ยน้อยครั้งที่สุด', 'btree'],
         ['floyd', 'Warshall & Floyd', 'เพิ่มจุดแวะทีละจุด ได้คำตอบทุกคู่', 'matrix']],
    gr: [['prim', 'Prim', 'งอกต้นไม้ทีละกิ่งที่สั้นที่สุด', 'graph'],
         ['kruskal', 'Kruskal', 'เรียง edge แล้วหยิบ ถ้าไม่ทำให้เกิดวงจร', 'graph'],
         ['dijkstra', 'Dijkstra', 'ปิดจุดที่ใกล้ที่สุดทีละจุด ได้ระยะสั้นสุด', 'graph'],
         ['huffman', 'Huffman', 'รวมสองตัวที่น้อยสุด ตัวที่ใช้บ่อยได้รหัสสั้น', 'tree'],
         ['greedylab', 'โจทย์ Greedy จาก lab', '12 แบบ จำเกณฑ์การเรียงให้ได้', 'bars']],
  };
  Lab.CH = CH;
  Lab.CATALOG = CATALOG;

  function glyph(kind) {
    const S = (inner, w = 120) => `<svg viewBox="0 0 ${w} 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    switch (kind) {
      case 'strip': return S([0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${4 + i * 16}" y="8" width="13" height="13" rx="3" opacity=".35"/>`).join('') +
        [3, 4, 5].map((i) => `<rect x="${4 + i * 16}" y="30" width="13" height="13" rx="3" fill="currentColor" fill-opacity=".18"/>`).join('') + `<path d="M36 52h40" /><path d="M70 47l6 5-6 5"/>`);
      case 'strip2': return S([0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${4 + i * 16}" y="8" width="13" height="13" rx="3" opacity=".35"/>`).join('') +
        [2, 3, 4, 5].map((i) => `<rect x="${4 + i * 16}" y="30" width="13" height="13" rx="3"${i > 3 ? ' fill="currentColor" fill-opacity=".3"' : ''}/>`).join(''));
      case 'grid': return S([0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${6 + c * 20}" y="${4 + r * 20}" width="16" height="16" rx="3" ${r === 2 && c === 4 ? 'fill="currentColor"' : r === 1 && (c === 4 || c === 2) ? 'fill="currentColor" fill-opacity=".25"' : 'opacity=".4"'}/>`).join('')).join(''));
      case 'graph': return S(`<path d="M16 48L44 14L84 16L106 46L60 50Z" opacity=".35"/><path d="M16 48L44 14L60 50L106 46" stroke-width="3.4"/>` +
        [[16, 48], [44, 14], [84, 16], [106, 46], [60, 50]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${i === 2 ? 'var(--surface)' : 'currentColor'}"/>`).join(''));
      case 'tree': return S(`<path d="M60 10L34 32M60 10L86 32M34 32L20 54M34 32L48 54"/>` + [[60, 10], [34, 32], [86, 32], [20, 54], [48, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="currentColor"/>`).join(''));
      case 'btree': return S(`<rect x="40" y="4" width="40" height="16" rx="3"/><path d="M60 4v16"/><rect x="6" y="40" width="30" height="16" rx="3" opacity=".5"/><rect x="45" y="40" width="30" height="16" rx="3" opacity=".5"/><rect x="84" y="40" width="30" height="16" rx="3" fill="currentColor" fill-opacity=".25"/><path d="M42 20L21 40M60 20v20M78 20l21 20"/>`);
      case 'bars': return S([28, 44, 14, 52, 36, 22].map((h, i) => `<rect x="${8 + i * 18}" y="${58 - h}" width="12" height="${h}" rx="3" ${i === 3 ? 'fill="currentColor"' : 'opacity=".45"'}/>`).join(''));
      case 'hash': return S(`<path d="M6 32h26"/><path d="M26 26l6 6-6 6"/>` + [0, 1, 2, 3, 4].map((i) => `<rect x="48" y="${2 + i * 12}" width="64" height="10" rx="2.5" ${i === 2 ? 'fill="currentColor" fill-opacity=".3"' : 'opacity=".4"'}/>`).join(''));
      case 'row': return S([0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${12 + i * 19}" cy="32" r="8" ${i % 2 === 0 ? 'fill="currentColor" fill-opacity=".3"' : 'opacity=".4"'}/>`).join(''));
      case 'matrix': return S([0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${24 + c * 18}" y="${6 + r * 18}" width="14" height="14" rx="3" ${c === 1 || r === 1 ? 'fill="currentColor" fill-opacity=".25"' : 'opacity=".4"'}/>`).join('')).join(''));
      default: return S('');
    }
  }

  Lab.glyph = glyph;

  /* ---------- what each symbol means, per lesson ---------- */
  const SYMS = {
    counting: [['A', 'อาร์เรย์ที่ยังไม่เรียง'], ['S', 'อาร์เรย์ผลลัพธ์ที่เรียงแล้ว'], ['Count[i]', 'จำนวนตัวที่น้อยกว่า A[i] = ช่องที่ A[i] ต้องไปอยู่ใน S'], ['D[v]', 'หลังบวกสะสม: จำนวนตัวที่ ≤ v'], ['[l, u]', 'ช่วงของค่าที่เป็นไปได้']],
    horspool: [['m', 'ความยาวของ pattern'], ['c', 'ตัวอักษรใน text ที่อยู่ใต้ตัวท้ายของ pattern'], ['t(c)', 'จำนวนช่องที่เลื่อน pattern ไปทางขวา']],
    boyer: [['m', 'ความยาวของ pattern'], ['c', 'ตัวอักษรใน text ที่เทียบแล้วไม่ตรง'], ['k', 'จำนวนตัวท้ายที่เทียบตรงแล้วก่อนเจอตัวที่ไม่ตรง'], ['t₁(c)', 'ค่าจากตาราง Horspool'], ['d₁', 'ระยะเลื่อนจากตัวที่ไม่ตรง (bad-symbol)'], ['d₂(k)', 'ระยะเลื่อนจากส่วนท้ายที่ตรงแล้ว k ตัว (good-suffix)']],
    hashing: [['K', 'key ที่จะเก็บ เช่นคำหนึ่งคำ'], ['h(K)', 'เลขช่องที่ K ต้องลงไป'], ['m', 'จำนวนช่องของตาราง'], ['mod', 'เศษจากการหาร']],
    btree: [['m', 'order = จำนวนลูกมากที่สุดของหนึ่ง node'], ['⌈m/2⌉', 'จำนวนลูกน้อยที่สุดของ node ภายใน'], ['n', 'จำนวน key ทั้งหมด']],
    coinrow: [['n', 'ใช้ได้แค่เหรียญที่ 1 ถึง n'], ['cₙ', 'มูลค่าของเหรียญที่ n'], ['F(n)', 'เงินมากสุดที่หยิบได้จากเหรียญ n เหรียญแรก'], ['F(n−1)', 'ไม่หยิบเหรียญที่ n'], ['cₙ + F(n−2)', 'หยิบเหรียญที่ n แล้วเหรียญ n−1 ห้ามหยิบ']],
    change: [['n', 'ยอดเงินที่ต้องทอน'], ['dⱼ', 'มูลค่าเหรียญชนิดที่ j'], ['F(n)', 'จำนวนเหรียญน้อยสุดที่ทอน n ได้'], ['F(n − dⱼ)', 'ยอดที่เหลือหลังใช้เหรียญ dⱼ ไป 1 เหรียญ'], ['+ 1', 'นับเหรียญ dⱼ เหรียญนั้น']],
    collect: [['i, j', 'แถวที่ i คอลัมน์ที่ j ของกระดาน'], ['cᵢⱼ', '1 ถ้าช่อง (i, j) มีเหรียญ ไม่มีเป็น 0'], ['F(i, j)', 'เหรียญมากสุดที่เก็บได้เมื่อเดินมาถึงช่อง (i, j)'], ['F(i−1, j)', 'มาจากช่องบน'], ['F(i, j−1)', 'มาจากช่องซ้าย']],
    knapsack: [['i', 'ชิ้นที่กำลังคิด (แถว)'], ['j', 'ความจุของเป้ (คอลัมน์)'], ['wᵢ', 'น้ำหนักของชิ้นที่ i'], ['vᵢ', 'มูลค่าของชิ้นที่ i'], ['F(i, j)', 'มูลค่ามากสุด ถ้าใช้ได้แค่ชิ้น 1…i และเป้จุ j'], ['F(i−1, j)', 'ไม่ใส่ชิ้น i: ช่องบน'], ['vᵢ + F(i−1, j−wᵢ)', 'ใส่ชิ้น i: ได้ vᵢ แล้วเป้เหลือ j−wᵢ']],
    obst: [['pᵢ', 'ความน่าจะเป็นที่จะค้นหา key ที่ i'], ['C(i, j)', 'จำนวนครั้งเทียบเฉลี่ยน้อยสุดของ BST ที่สร้างจาก key i…j'], ['k', 'key ที่ลองเลือกเป็น root'], ['C(i, k−1), C(k+1, j)', 'ต้นซ้ายและต้นขวาของ k'], ['pᵢ + … + pⱼ', 'ทุก key ลึกลงอีกหนึ่งชั้น จึงบวกความน่าจะเป็นรวม'], ['R(i, j)', 'k ที่ดีที่สุด (root)']],
    floyd: [['k', 'จุดแวะที่เพิ่มเข้ามาในรอบนี้'], ['R⁽ᵏ⁾[i, j]', '1 ถ้าไปจาก i ถึง j ได้ โดยแวะได้แค่จุด 1…k'], ['D⁽ᵏ⁾[i, j]', 'ระยะสั้นสุดจาก i ไป j โดยแวะได้แค่จุด 1…k'], ['[i, k] + [k, j]', 'ไป i → k แล้วต่อ k → j']],
    prim: [['|V|', 'จำนวนจุดในกราฟ'], ['u*', 'จุดที่เพิ่งถูกเพิ่มเข้าต้นไม้'], ['ป้าย (x, w)', 'จุดในต้นไม้ที่ใกล้สุดคือ x ห่าง w'], ['∞', 'ยังไม่มี edge ต่อกับต้นไม้']],
    kruskal: [['|V|', 'จำนวนจุดในกราฟ'], ['|V| − 1', 'จำนวน edge ของ spanning tree']],
    dijkstra: [['d(v)', 'ระยะสั้นสุดจากจุดเริ่มถึง v ที่รู้ตอนนี้ (∞ = ยังไปไม่ถึง)'], ['u', 'จุดที่เพิ่งปิดถาวร'], ['w(u, v)', 'น้ำหนัก edge จาก u ไป v'], ['มาจาก', 'จุดก่อนหน้าบนเส้นทางสั้นสุด']],
    huffman: [['p', 'ความถี่ (น้ำหนัก) ของตัวอักษร'], ['ความยาวรหัส', 'จำนวน bit = ความลึกของใบ'], ['bit เฉลี่ย', 'Σ ความยาวรหัส × p']],
  };
  Lab.SYMS = SYMS;
  const symList = (syms) => `<dl class="syms">${syms.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
  Lab.symList = symList;

  /* ---------- progress ---------- */
  const progress = {
    get(id) { return store.get('done:' + id, []); },
    mark(id, key) { const a = this.get(id); if (!a.includes(key)) { a.push(key); store.set('done:' + id, a); } updateCount(); },
  };
  Lab.progress = progress;
  let current = null;
  function updateCount() {
    const el = document.querySelector('.top .count');
    if (!el || !current) return;
    el.textContent = `ตอบถูก ${progress.get(current.id).length}/${current.checks} ข้อ`;
  }

  /* ---------- shared widgets ---------- */
  // Stepper: frames[] + render(frame, i) -> caption html
  Lab.stepper = function (host, opts) {
    const stage = document.createElement('div');
    const cap = document.createElement('div');
    cap.className = 'cap';
    cap.setAttribute('aria-live', 'polite');
    const bar = document.createElement('div');
    bar.className = 'stepper';
    bar.innerHTML = `<div class="srow"><input class="scrub" type="range" min="0" value="0" aria-label="เลื่อนดูทีละขั้น">
        <span class="scount"></span>
        <button class="sbtn play" data-a="play" aria-label="เล่นอัตโนมัติ">${ICON.play}</button></div>
      <div class="snav"><button class="navb" data-a="prev" aria-label="ย้อนหนึ่งขั้น">${ICON.prev}<span>ย้อน</span></button>
        <button class="navb main" data-a="next" aria-label="ขั้นถัดไป"><span>ถัดไป</span>${ICON.next}</button></div>`;
    // written working: every step's caption so far, like a worked solution on paper
    const work = document.createElement('div');
    work.className = 'swork';
    work.innerHTML = `<div class="swh"><h3>วิธีคำนวณ</h3><button class="swall">แสดงทุกขั้น</button></div><ol></ol>`;
    const hasWork = opts.work !== false && opts.frames.length > 2 && opts.frames.every((f) => f && typeof f.cap === 'string');
    host.append(stage, cap, bar);
    if (hasWork) host.append(work);
    let showAll = false;
    work.querySelector('.swall').onclick = () => { showAll = !showAll; work.querySelector('.swall').textContent = showAll ? 'ถึงขั้นปัจจุบัน' : 'แสดงทุกขั้น'; drawWork(); };
    const ol = work.querySelector('ol');
    function drawWork() {
      if (!hasWork || !frames.every((f) => typeof f.cap === 'string')) { work.hidden = true; return; }
      work.hidden = false;
      const upto = showAll ? frames.length - 1 : i;
      ol.innerHTML = frames.slice(0, upto + 1).map((f, k) => `<li class="${k === i ? 'now' : k > i ? 'later' : ''}" data-k="${k}"><span class="n">${k + 1}</span><span>${f.cap}</span></li>`).join('');
      const now = ol.querySelector('.now');
      if (now) ol.scrollTop = now.offsetTop - ol.clientHeight / 2;
    }
    ol.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) { stop(); go(+li.dataset.k); } });
    host.tabIndex = 0;
    const scrub = bar.querySelector('.scrub');
    const count = bar.querySelector('.scount');
    const playBtn = bar.querySelector('[data-a="play"]');
    const prevBtn = bar.querySelector('[data-a="prev"]'), nextBtn = bar.querySelector('[data-a="next"]');
    let frames = opts.frames, i = 0, timer = null;
    const speed = (opts.speed || 1000) * 1.7; // autoplay pace, slowed for reading

    function draw() {
      const html = opts.render(stage, frames[i], i, frames);
      cap.innerHTML = html || '';
      scrub.max = frames.length - 1;
      scrub.value = i;
      count.textContent = `${i + 1}/${frames.length}`;
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === frames.length - 1;
      if (opts.onStep) opts.onStep(i, frames);
      drawWork();
    }
    function go(n) { i = Math.max(0, Math.min(frames.length - 1, n)); draw(); }
    function stop() { clearInterval(timer); timer = null; playBtn.innerHTML = ICON.play; playBtn.setAttribute('aria-label', 'เล่นอัตโนมัติ'); }
    function play() {
      if (i >= frames.length - 1) go(0);
      playBtn.innerHTML = ICON.pause; playBtn.setAttribute('aria-label', 'หยุด');
      timer = setInterval(() => { if (i >= frames.length - 1) stop(); else go(i + 1); }, speed);
    }
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'play') { timer ? stop() : play(); return; }
      stop();
      if (a === 'next') go(i + 1); else if (a === 'prev') go(i - 1); else if (a === 'reset') go(0);
    });
    scrub.addEventListener('input', () => { stop(); go(+scrub.value); });
    host.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target !== scrub) return;
      if (e.key === 'ArrowRight') { stop(); go(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { stop(); go(i - 1); e.preventDefault(); }
    });
    draw();
    return {
      setFrames(f) { stop(); frames = f; i = 0; draw(); },
      go, stop,
      get index() { return i; },
    };
  };

  // Multiple-choice check with instant feedback
  Lab.check = function (host, { lesson, key, q, options, answer, why, label = 'ลองตอบ' }) {
    const box = document.createElement('div');
    box.className = 'check';
    box.innerHTML = `<div class="ck">${label}</div><div class="q">${q}</div>
      <div class="opts">${options.map((o, n) => `<button class="opt" data-n="${n}"><span class="ol">${'กขคงจ'[n]}</span><span>${o}</span></button>`).join('')}</div>
      <div class="fb"></div>`;
    host.append(box);
    const fb = box.querySelector('.fb');
    const done = progress.get(lesson).includes(key);
    function solve(showAll) {
      box.querySelectorAll('.opt').forEach((b) => {
        b.disabled = true;
        if (+b.dataset.n === answer) b.classList.add('right'); else b.classList.add('dim');
      });
      fb.innerHTML = `<span class="yes">ถูกต้อง</span> · ${why}`;
      fb.classList.add('on');
      if (!showAll) progress.mark(lesson, key);
    }
    if (done) solve(true);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b || b.disabled) return;
      if (+b.dataset.n === answer) { solve(false); return; }
      b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
      b.disabled = true;
      fb.innerHTML = `<span class="no">ยังไม่ใช่</span> · ลองอีกครั้ง`;
      fb.classList.add('on');
    });
  };

  /* ---------- pages ---------- */
  const app = () => document.getElementById('app');

  Lab.topbar = (...a) => topbar(...a);
  function topbar(where, chCls) {
    return `<header class="top ${chCls || ''}"><div class="wrap in">
      <a class="brand" href="#"><span class="dot"></span>Algo Playground</a>
      <span class="where">${where || ''}</span><span class="sp"></span><span class="count"></span></div>
      <div class="readbar"></div></header>`;
  }

  function renderHome() {
    current = null;
    const ready = Object.fromEntries(lessons.map((l) => [l.id, l]));
    const chapters = Object.keys(CH).map((c) => {
      const tiles = CATALOG[c].map(([id, title, blurb, g], n) => {
        const L = ready[id];
        const done = L ? progress.get(id).length : 0;
        const st = L
          ? (done ? `<div class="prog"><i style="width:${Math.round((done / L.checks) * 100)}%"></i></div><span>${done}/${L.checks}</span>` : `<span class="pill">เริ่มเรียน</span>`)
          : `<span class="pill">เร็ว ๆ นี้</span>`;
        const tag = L ? 'a' : 'div';
        return `<${tag} class="tile ${L ? 'open' : 'soon'}" ${L ? `href="#${id}"` : 'aria-disabled="true"'}>
          <div class="gl">${glyph(g)}</div><h3>${title}</h3><p>${blurb}</p><div class="st">${st}</div></${tag}>`;
      }).join('');
      return `<section class="chapter c-${c}"><div class="chead"><span class="num">${CH[c].n}</span><h2>${CH[c].name}</h2><p>${CH[c].th}</p></div>
        <div class="tiles" style="--cols:${CATALOG[c].length === 6 ? 3 : CATALOG[c].length}">${tiles}</div></section>`;
    }).join('');

    app().innerHTML = topbar('') + `
      <main class="wrap">
        <section class="hero">
          <h1>Watch algorithms<br>work, <span class="s1">step</span> <span class="s2">by</span> <span class="s3">step.</span></h1>
          <p class="lead">กดเล่น กดย้อน เปลี่ยนตัวเลขเอง แล้วดูว่าตารางกับกราฟเปลี่ยนยังไง ทุกบทใช้ตัวอย่างเดียวกับสไลด์ในห้อง</p>
          ${Lab.practice ? `<a class="btn big" href="#practice">ฝึกลงมือทำเอง ${ICON.next}</a>` : ''}
          <div class="herostrip c-st"><div class="scroll"><div id="heroStrip"></div></div></div>
        </section>
        ${chapters}
      </main>`;
    heroAnim();
  }

  function heroAnim() {
    const host = document.getElementById('heroStrip');
    if (!host || !Lab.horspool) return;
    const text = 'SPACE_TIME_DP_GREEDY';
    const pat = 'GREEDY';
    const frames = Lab.horspool.frames(text, pat).filter((f) => f.kind !== 'cmp' || f.last);
    let i = 0;
    // Keeps stepping even with Reduce Motion on: the CSS drops the sliding transition, so each step jumps instead.
    const draw = () => Lab.horspool.drawStrip(host, text, pat, frames[i]);
    draw();
    const t = setInterval(() => {
      if (!document.body.contains(host)) { clearInterval(t); return; }
      i = i >= frames.length - 1 ? 0 : i + 1; draw();
    }, 1100);
  }

  function renderLesson(L) {
    current = L;
    const ch = CH[L.ch];
    const order = CATALOG[L.ch].map((x) => x[0]);
    const all = Object.keys(CH).flatMap((c) => CATALOG[c].map((x) => x[0])).filter((id) => lessons.some((l) => l.id === id));
    const idx = all.indexOf(L.id);
    const nextId = all[(idx + 1) % all.length];
    const nextL = lessons.find((l) => l.id === nextId);
    app().innerHTML = topbar(`${ch.name} · ${L.title}`, 'c-' + L.ch) + `
      <main class="wrap c-${L.ch}">
        <header class="lhead col">
          <div class="chip"><i></i>${ch.n} · ${ch.name}</div>
          <h1>${L.title}</h1><div class="sub">${L.sub}</div>
          <div class="meta"><span>${L.minutes} นาที</span><span>${L.checks} คำถามระหว่างทาง</span><span>ใช้ตัวอย่างจากสไลด์ ${L.slide}</span></div>
        </header>
        <div id="lbody"></div>
        <nav class="next col"><a class="btn ghost" href="#">← ทุกบทเรียน</a>${nextL && nextL !== L ? `<a class="btn" href="#${nextL.id}">บทถัดไป: ${nextL.title} →</a>` : ''}</nav>
      </main>`;
    L.mount(document.getElementById('lbody'), Lab);
    const syms = SYMS[L.id];
    if (syms) {
      const body = document.getElementById('lbody');
      const rule = body.querySelector('.beat.core .rule');
      const host = rule || body.querySelector('.beat.core .col');
      if (host) host.insertAdjacentHTML(rule ? 'afterend' : 'beforeend', symList(syms));
      body.querySelectorAll('.swork .swh').forEach((h) => h.insertAdjacentHTML('afterend', `<details class="symk"><summary>ตัวแปรแต่ละตัวคืออะไร</summary>${symList(syms)}</details>`));
    }
    updateCount();
  }

  function onScroll() {
    const bar = document.querySelector('.readbar');
    if (!bar) return;
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100).toFixed(1) + '%';
  }

  function route() {
    const id = location.hash.slice(1);
    const L = lessons.find((l) => l.id === id);
    if (L) renderLesson(L);
    else if (Lab.practice && id.split('/')[0] === 'practice') { current = null; Lab.practice.render(app(), id.split('/')[1]); }
    else renderHome();
    window.scrollTo(0, 0);
    onScroll();
  }

  /* helper for lessons: beat section */
  Lab.beat = function (host, { kick, title, html = '', wide = false }) {
    // Weight by role: the core idea stands out, side material (traps, sandboxes) steps back.
    const tier = /^(ระวัง|ลองเอง|ลองใช้|ประยุกต์|ทำด้วยมือ)/.test(kick || '') ? 'side'
      : /^(ไอเดีย|นิยาม|วิธีใช้)/.test(kick || '') || html.includes('class="rule"') ? 'core' : '';
    const fold = /^ลองเอง/.test(kick || '');
    const s = document.createElement('section');
    s.className = 'beat ' + tier;
    // no eyebrows: the role shows through weight, not labels
    const kk = '';
    if (kick === 'ข้อสอบจำลอง') title = 'ข้อสอบจำลอง';
    s.innerHTML = `<div class="col">${kk ? `<div class="kick">${kk}</div>` : ''}${title ? `<h2>${title}</h2>` : ''}${html}</div>`;
    const slot = document.createElement('div');
    slot.className = wide ? 'wide' : 'col';
    if (fold) {
      const b = document.createElement('button');
      b.className = 'btn ghost fold';
      b.innerHTML = `เปิดดู ${ICON.next}`;
      b.onclick = () => { slot.hidden = false; b.remove(); };
      s.firstChild.append(b);
      slot.hidden = true;
    }
    s.append(slot);
    host.append(s);
    return slot;
  };

  /* ---------- more shared helpers ---------- */
  Lab.stage = function (slot) { const d = document.createElement('div'); d.className = 'stage'; slot.append(d); return d; };
  Lab.gap = function (el, h = 14) { const d = document.createElement('div'); d.style.height = h + 'px'; el.append(d); };
  Lab.exam = function (root, lesson, qs) {
    const s = Lab.beat(root, { kick: 'ข้อสอบจำลอง', title: 'แบบที่ออกบ่อย' });
    qs.forEach((q, n) => { if (n) Lab.gap(s); Lab.check(s, Object.assign({ lesson, label: `ข้อ ${n + 1}` }, q)); });
  };
  Lab.recap = function (root, items) {
    const s = Lab.beat(root, {});
    s.innerHTML = `<div class="recap"><h2>สรุป${items.length === 3 ? ' 3 บรรทัด' : ''}</h2><ol>${items.map((i) => `<li>${i}</li>`).join('')}</ol></div>`;
  };
  Lab.fmt = (x) => (x === Infinity ? '∞' : typeof x === 'number' && !Number.isInteger(x) ? String(+x.toFixed(2)) : String(x));

  // rows of cells: rows = [{label, cells:[{v, cls}], idx:bool}]
  Lab.cellRows = function (rows) {
    return `<div class="scroll"><div class="cellrows">${rows.map((r) => `<div class="lb">${r.label || ''}</div><div class="cells ${r.idx ? 'idx' : ''}">${r.cells.map((c) => `<div class="c ${c.cls || ''}">${c.v == null ? '' : esc(c.v)}</div>`).join('')}</div>`).join('')}</div></div>`;
  };

  // general graph drawing. G = {pos:{v:[x,y]}, E:[[u,v,w]], directed}
  let gid = 0;
  Lab.graph = function (G, o = {}) {
    const w = o.w || 560, h = o.h || 290, id = 'g' + (++gid);
    const V = Object.keys(G.pos);
    let s = `<svg class="gsvg" viewBox="0 0 ${w} ${h}"${o.maxw ? ` style="max-width:${o.maxw}px"` : ''} role="img" aria-label="กราฟ">`;
    if (G.directed) s += `<defs><marker id="${id}m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink-3)"/></marker></defs>`;
    for (const [u, v, wt] of G.E) {
      const [x1, y1] = G.pos[u], [x2, y2] = G.pos[v];
      const cls = 'ed ' + (o.edgeCls ? o.edgeCls(u, v, wt) || '' : '');
      const L = Math.hypot(x2 - x1, y2 - y1);
      let ex = x2, ey = y2;
      if (G.directed) { ex = x2 - ((x2 - x1) / L) * 26; ey = y2 - ((y2 - y1) / L) * 26; }
      s += `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}"${G.directed ? ` marker-end="url(#${id}m)"` : ''}/>`;
      if (wt != null && !o.noW) {
        const nx = -(y2 - y1) / L, ny = (x2 - x1) / L, off = o.wOff || 14, t = o.wPos ? o.wPos(u, v) : 0.5;
        s += `<text class="wl" x="${x1 + (x2 - x1) * t + nx * off}" y="${y1 + (y2 - y1) * t + ny * off + 5}">${wt}</text>`;
      }
    }
    for (const v of V) {
      const [x, y] = G.pos[v];
      const cls = 'nd ' + (o.nodeCls ? o.nodeCls(v) || '' : '');
      const fill = o.nodeFill ? o.nodeFill(v) : null;
      s += `<g class="${cls}" data-v="${v}"><circle cx="${x}" cy="${y}" r="${o.r || 21}"${fill ? ` style="fill:${fill};stroke:${fill}"` : ''}/><text x="${x}" y="${y}"${fill ? ' style="fill:#fff"' : ''}>${v}</text></g>`;
      const b = o.badge ? o.badge(v) : null;
      if (b != null) {
        const below = o.badgeBelow ? o.badgeBelow(v) : y > h / 2;
        const ly = below ? y + 40 : y - 40;
        const bw = Math.max(44, String(b.t).length * 9 + 16);
        s += `<g class="dl ${b.cls || ''}"><rect x="${x - bw / 2}" y="${ly - 13}" width="${bw}" height="26" rx="8"/><text x="${x}" y="${ly}">${b.t}</text></g>`;
      }
    }
    return s + '</svg>';
  };

  // binary tree drawing. nodes: {id: {l, r, label, sub, cls, box}} root id. edge labels via o.bits
  Lab.tree = function (nodes, root, o = {}) {
    const order = [], depth = {};
    (function walk(n, d) { if (n == null) return; walk(nodes[n].l, d + 1); order.push(n); depth[n] = d; walk(nodes[n].r, d + 1); })(root, 0);
    const maxD = Math.max(...Object.values(depth));
    const w = o.w || Math.max(260, order.length * (o.gapX || 64) + 40), lh = o.levelH || 70, h = (maxD + 1) * lh + 30 + (o.extraH || 0);
    const X = {}, Y = {};
    order.forEach((n, i) => { X[n] = 20 + (w - 40) * (order.length === 1 ? 0.5 : i / (order.length - 1)); Y[n] = 30 + depth[n] * lh; });
    let s = `<svg class="gsvg" viewBox="0 0 ${w} ${h}"${o.maxw ? ` style="max-width:${o.maxw}px"` : ''} role="img" aria-label="ต้นไม้">`;
    for (const n of order) for (const [side, c] of [['0', nodes[n].l], ['1', nodes[n].r]]) {
      if (c == null) continue;
      const on = o.edgeOn ? o.edgeOn(n, c) : false;
      s += `<line class="tl ${on ? 'on' : ''}" x1="${X[n]}" y1="${Y[n]}" x2="${X[c]}" y2="${Y[c]}"/>`;
      if (o.bits) s += `<text class="bit" x="${(X[n] + X[c]) / 2 + (side === '0' ? -9 : 9)}" y="${(Y[n] + Y[c]) / 2 - 4}">${side}</text>`;
    }
    for (const n of order) {
      const nd = nodes[n];
      if (nd.box) {
        const bw = Math.max(40, String(nd.label).length * 10 + 18);
        s += `<g class="bx ${nd.cls || ''}"><rect x="${X[n] - bw / 2}" y="${Y[n] - 17}" width="${bw}" height="34" rx="8"/><text x="${X[n]}" y="${Y[n]}"${String(nd.label).length > 2 ? ' style="font-size:13px"' : ''}>${nd.label}</text></g>`;
      } else {
        s += `<g class="nd ${nd.cls || ''}"><circle cx="${X[n]}" cy="${Y[n]}" r="${o.r || 19}"/><text x="${X[n]}" y="${Y[n]}"${String(nd.label).length > 2 ? ' style="font-size:13px"' : ''}>${nd.label}</text></g>`;
      }
      if (nd.sub != null) s += `<text class="sub" x="${X[n]}" y="${Y[n] + (nd.box ? 29 : 32)}">${nd.sub}</text>`;
    }
    return s + '</svg>';
  };

  Lab.start = function () {
    window.addEventListener('hashchange', route);
    window.addEventListener('scroll', onScroll, { passive: true });
    route();
  };
})();
