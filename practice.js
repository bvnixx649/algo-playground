/* Practice: random problems the learner solves cell by cell */
(function () {
  const { esc } = Lab;
  const K = Lab.k;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const drills = [];

  /* ---------- shared: answer inputs ---------- */
  // Checks as you type: right once it equals the answer, wrong once it is as long as the answer (or on Enter/blur).
  function wire(inp, answer, ctx, onRight) {
    const ans = String(answer).toUpperCase();
    inp.autocomplete = 'off';
    inp.spellcheck = false;
    const judge = (final) => {
      if (inp.readOnly) return;
      const v = inp.value.trim().toUpperCase();
      inp.classList.remove('bad');
      if (!v) return;
      if (v === ans) {
        inp.value = String(answer);
        inp.readOnly = true;
        inp.classList.add('ok');
        inp.tabIndex = -1;
        ctx.clearHint();
        const had = document.activeElement === inp;
        onRight && onRight();
        if (had) ctx.focusNext(inp);
      } else if (final || v.length >= ans.length) {
        void inp.offsetWidth;
        inp.classList.add('bad');
        ctx.miss++;
      }
    };
    inp.addEventListener('input', () => judge(false));
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { judge(true); e.preventDefault(); } });
    inp.addEventListener('change', () => judge(true));
  }
  const numInput = (cls = '') => `<input class="ans ${cls}" inputmode="numeric" enterkeyhint="next" aria-label="คำตอบ">`;
  function shakeEl(el) { el.classList.remove('shake'); void el.getBoundingClientRect(); el.classList.add('shake'); }

  /* ---------- shell around one drill ---------- */
  function shell(host, D) {
    host.innerHTML = `<div class="dhead"><h2>${D.title}</h2><p>${D.task}</p></div>
      <div class="stage pstage"></div>
      <div class="phint" aria-live="polite"></div>
      <div class="pbar"><button class="btn ghost hintb">คำใบ้</button><span class="pprog"></span><span class="sp"></span><button class="btn newb">โจทย์ใหม่</button></div>
      ${Lab.SYMS[D.id] ? `<details class="symk"><summary>ตัวแปรแต่ละตัวคืออะไร</summary>${Lab.symList(Lab.SYMS[D.id])}</details>` : ''}
      <ol class="work"></ol>`;
    const stage = host.querySelector('.pstage'), hintEl = host.querySelector('.phint'), prog = host.querySelector('.pprog'), workEl = host.querySelector('.work');
    let inst = null;
    const ctx = {
      miss: 0,
      root: stage,
      progress(a, b) { prog.textContent = `${a}/${b}`; },
      work(html) {
        workEl.querySelectorAll('.new').forEach((x) => x.classList.remove('new'));
        workEl.insertAdjacentHTML('beforeend', `<li class="new">${html}</li>`);
      },
      clearHint() { hintEl.classList.remove('on'); stage.querySelectorAll('.hl-up,.hl-dg').forEach((e) => e.classList.remove('hl-up', 'hl-dg')); },
      focusNext(from) {
        const all = [...stage.querySelectorAll('input.ans')].filter((x) => !x.readOnly && x.offsetParent !== null);
        const after = all.find((x) => from.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING) || all[0];
        if (after) after.focus({ preventScroll: false });
      },
      finish(html) {
        const n = Lab.store.get('practice:' + D.id, 0) + 1;
        Lab.store.set('practice:' + D.id, n);
        const d = document.createElement('div');
        d.className = 'pdone';
        d.innerHTML = `<div><b>${html}</b><span>${ctx.miss ? `พลาดไป ${ctx.miss} ครั้งระหว่างทาง` : 'ไม่พลาดเลยสักช่อง'}</span></div><button class="btn big">ข้อต่อไป</button>`;
        d.querySelector('button').onclick = () => { start(); host.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
        stage.append(d);
        host.querySelector('.hintb').disabled = true;
        requestAnimationFrame(() => d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
      },
    };
    function start() {
      ctx.miss = 0;
      ctx.clearHint();
      host.querySelector('.hintb').disabled = false;
      stage.innerHTML = '';
      workEl.innerHTML = '';
      inst = D.create(stage, ctx);
    }
    host.querySelector('.hintb').onclick = () => {
      ctx.clearHint();
      const h = inst && inst.hint();
      if (!h) return;
      hintEl.innerHTML = h;
      hintEl.classList.add('on');
    };
    host.querySelector('.newb').onclick = start;
    start();
  }

  /* ================= Horspool ================= */
  const WORDS = ['BARBER', 'LEADER', 'PEPPER', 'BANANA', 'TATTOO', 'GREEDY', 'COCOA', 'EERIE', 'KAYAK', 'BAOBAB', 'SEESAW', 'ROTOR', 'NINJA', 'MAMBA'];

  function hsTable(p) { const t = {}; for (let j = 0; j < p.length - 1; j++) t[p[j]] = p.length - 1 - j; return t; }
  function hsRounds(text, pat) {
    const m = pat.length, n = text.length, t = hsTable(pat), R = [];
    let i = m - 1;
    while (i <= n - 1) {
      const start = i - m + 1, cmp = [];
      let k = 0;
      while (k < m) { const ok = text[i - k] === pat[m - 1 - k]; cmp.push({ pos: i - k, ok }); if (!ok) break; k++; }
      if (k === m) { R.push({ start, cmp, found: true }); return R; }
      const s = t[text[i]] ?? m;
      R.push({ start, cmp, look: i, c: text[i], shift: s });
      i += s;
    }
    return R;
  }
  function hsProblem() {
    for (let tries = 0; tries < 400; tries++) {
      const pat = pickOne(WORDS), m = pat.length;
      const own = [...new Set(pat)];
      const extra = shuffle([...'ACDEHILMNOPRSTUWY'].filter((c) => !own.includes(c))).slice(0, 3).concat('_');
      const n = rnd(14, 17);
      let text = Array.from({ length: n }, () => (Math.random() < 0.55 ? pickOne(own) : pickOne(extra))).join('');
      if (Math.random() < 0.8) { const at = rnd(Math.floor(n / 2), n - m); text = text.slice(0, at) + pat + text.slice(at + m); }
      const R = hsRounds(text, pat);
      if (R.length >= 3 && R.length <= 6 && R.some((r) => r.shift > 1)) return { text, pat, R };
    }
    return { text: 'JIM_SAW_ME_IN_A_BARBERSHOP', pat: 'BARBER', R: hsRounds('JIM_SAW_ME_IN_A_BARBERSHOP', 'BARBER') };
  }

  drills.push({
    id: 'horspool', ch: 'st', title: 'Horspool', glyph: 'strip',
    blurb: 'สร้างตาราง shift แล้วบอกว่าแต่ละรอบกระโดดกี่ช่อง',
    task: 'เติมตาราง shift ก่อน จากนั้นดูตัวอักษรใน text ที่อยู่ใต้ตัวท้ายของ pattern แล้วตอบว่าต้องเลื่อนกี่ช่อง',
    create(el, ctx) {
      const { text, pat, R } = hsProblem(), m = pat.length, t = hsTable(pat);
      const keys = [...new Set(pat)];
      const total = keys.length + 1 + R.length + 1;
      let solved = 0, round = 0, stage2 = false;
      const bump = () => ctx.progress(++solved, total);
      ctx.progress(0, total);

      el.innerHTML = `<div class="pq">Pattern ${K(pat, 'acc')} ยาว m = ${m}</div>
        <div class="stable ptable">${keys.map((c) => `<label class="e"><span>${esc(c)}</span>${numInput()}</label>`).join('')}
          <label class="e"><span>อื่น ๆ</span>${numInput()}</label></div>
        <div class="hs2" hidden>
          <div class="pq">Text ${K(text)}</div>
          <div class="scroll hsx"><div class="sh"></div></div>
          <div class="ask"></div>
          <div class="pillrow hist"></div>
        </div>`;
      const ins = el.querySelectorAll('.ptable input');
      const tableDone = () => [...ins].every((x) => x.readOnly);
      const tableEq = (c) => {
        if (!c) return `t(อื่น ๆ) = m = <b>${m}</b>`;
        const at = pat.slice(0, -1).lastIndexOf(c);
        if (at < 0) return `t(${esc(c)}) = m = <b>${m}</b> <span class="muted">(${esc(c)} อยู่แค่ตัวท้าย ไม่นับ)</span>`;
        return `t(${esc(c)}) = m − 1 − ${at} = ${m} − 1 − ${at} = <b>${m - 1 - at}</b>`;
      };
      keys.forEach((c, n) => {
        ins[n].dataset.c = c;
        wire(ins[n], t[c] ?? m, ctx, () => { ctx.work(tableEq(c)); bump(); if (tableDone()) openRun(); });
      });
      ins[keys.length].dataset.c = '';
      wire(ins[keys.length], m, ctx, () => { ctx.work(tableEq('')); bump(); if (tableDone()) openRun(); });

      const sh = el.querySelector('.sh'), ask = el.querySelector('.ask'), hist = el.querySelector('.hist');
      function openRun() {
        stage2 = true;
        el.querySelector('.hs2').hidden = false;
        el.querySelector('.ptable').classList.add('locked');
        showRound();
      }
      function showRound() {
        const r = R[round];
        Lab.horspool.drawStrip(sh, text, pat, { start: r.start, cmp: [], look: r.start + m - 1 });
        const lookCell = sh.querySelectorAll('.text .cell')[r.start + m - 1];
        const box = el.querySelector('.hsx');
        if (lookCell) box.scrollLeft = Math.max(0, lookCell.offsetLeft - box.clientWidth + 60);
        ask.innerHTML = `<span>รอบที่ ${round + 1} · ตัวใต้ท้าย pattern คือ ${K(text[r.start + m - 1], 'hi')} → เลื่อน</span>${numInput('w')}<span>ช่อง</span>
          <span class="or">หรือ</span><button class="btn ghost foundb">ตรงครบ เจอแล้ว</button>`;
        const inp = ask.querySelector('input'), fb = ask.querySelector('.foundb');
        if (r.found) {
          inp.addEventListener('input', () => { if (inp.value.trim()) { inp.classList.remove('bad'); void inp.offsetWidth; inp.classList.add('bad'); ctx.miss++; } });
          fb.onclick = () => advance();
        } else {
          wire(inp, r.shift, ctx, () => advance());
          fb.onclick = () => { shakeEl(fb); ctx.miss++; };
        }
      }
      function advance() {
        const r = R[round];
        ctx.work(r.found
          ? `รอบ ${round + 1}: เทียบจากขวา ตรงครบ ${r.cmp.length} ตัว → เจอที่ index ${r.start} <span class="muted">(เทียบ ${r.cmp.length} ครั้ง)</span>`
          : `รอบ ${round + 1}: ตัวใต้ท้าย = ${esc(r.c)} → t(${esc(r.c)}) = <b>${r.shift}</b> <span class="muted">(เทียบ ${r.cmp.length} ครั้ง)</span>`);
        bump();
        ask.querySelectorAll('input,button').forEach((x) => (x.disabled = true));
        Lab.horspool.drawStrip(sh, text, pat, { start: r.start, cmp: r.cmp, found: r.found, look: r.found ? null : r.look });
        hist.insertAdjacentHTML('beforeend', `<span class="${r.found ? 'on' : ''}">${r.found ? `เจอที่ index ${r.start}` : `เลื่อน ${r.shift}`}</span>`);
        round++;
        setTimeout(() => (round < R.length ? showRound() : askComps()), 750);
      }
      function askComps() {
        const comps = R.reduce((s, r) => s + r.cmp.length, 0);
        const last = R[R.length - 1];
        ask.innerHTML = `<span>${last.found ? 'เจอแล้ว' : 'pattern เลยท้าย text ไปแล้ว ไม่เจอ'} · รวมทุกรอบเทียบตัวอักษรไปกี่ครั้ง</span>${numInput('w')}<span>ครั้ง</span>`;
        if (!last.found) Lab.horspool.drawStrip(sh, text, pat, { start: last.start, cmp: last.cmp });
        const inp = ask.querySelector('input');
        wire(inp, comps, ctx, () => { ctx.work(`จำนวนการเทียบ = ${R.map((r) => r.cmp.length).join(' + ')} = <b>${comps}</b>`); bump(); ctx.finish(`รวม ${comps} ครั้ง ถูกต้อง`); });
        round = R.length;
      }

      return {
        hint() {
          if (!stage2) {
            const inp = [...ins].find((x) => x === document.activeElement && !x.readOnly) || [...ins].find((x) => !x.readOnly);
            const c = inp.dataset.c;
            if (!c) return `ตัวอักษรที่ไม่อยู่ใน ${m - 1} ตัวแรกของ pattern เลื่อนได้เต็มความยาว คือ m`;
            const lastPos = pat.slice(0, -1).lastIndexOf(c);
            if (lastPos < 0) return `${K(c, 'hi')} อยู่แค่ตัวท้ายสุดของ pattern ตัวท้ายไม่นับ จึงเหมือนตัวที่ไม่อยู่ใน pattern ได้ค่า m`;
            return `ดู ${K(c, 'hi')} ตัวที่อยู่ขวาสุดใน ${m - 1} ตัวแรก (ไม่นับตัวท้าย) อยู่ index ${lastPos} ค่าคือ m − 1 − index = ${m} − 1 − ${lastPos}`;
          }
          if (round >= R.length) return 'แต่ละรอบเทียบจากขวาไปซ้าย ช่องเขียวกับแดงคือครั้งที่เทียบ ' + R.map((r, n) => `รอบ ${n + 1} = ${r.cmp.length}`).join(', ');
          const r = R[round];
          if (r.found) return 'ไล่เทียบจากตัวท้ายไปทางซ้ายดูว่าทุกตัวตรงกันไหม';
          return `ตัวใต้ท้าย pattern คือ ${K(r.c, 'hi')} เปิดตาราง shift ที่ช่อง ${r.c in t ? K(r.c) : 'อื่น ๆ'} ได้เลย ไม่ต้องสนว่าเทียบไม่ตรงที่ตัวไหน`;
        },
      };
    },
  });

  /* ================= 0/1 Knapsack ================= */
  function ksSolve(items, W) {
    const n = items.length, F = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= W; j++) {
      const { w, v } = items[i - 1];
      F[i][j] = w <= j ? Math.max(F[i - 1][j], v + F[i - 1][j - w]) : F[i - 1][j];
    }
    return F;
  }
  function ksProblem() {
    for (let tries = 0; tries < 400; tries++) {
      const n = rnd(3, 4), W = n === 3 ? rnd(4, 5) : rnd(5, 6);
      const items = Array.from({ length: n }, () => ({ w: rnd(1, 4), v: rnd(3, 30) }));
      if (items.reduce((s, x) => s + x.w, 0) <= W) continue;
      const F = ksSolve(items, W);
      let j = W, used = 0;
      for (let i = n; i >= 1; i--) if (F[i][j] !== F[i - 1][j]) { used++; j -= items[i - 1].w; }
      if (used >= 2) return { items, W, F };
    }
  }

  drills.push({
    id: 'knapsack', ch: 'dp', title: '0/1 Knapsack', glyph: 'grid',
    blurb: 'เติมตาราง F(i, j) เอง แล้วบอกว่าหยิบชิ้นไหน',
    task: 'เติมตาราง F(i, j) ให้ครบทุกช่อง จะเติมตามแถวหรือกระโดดก็ได้ ช่องไหนถูกจะล็อกทันที เสร็จแล้วเลือกชิ้นที่อยู่ในคำตอบ',
    create(el, ctx) {
      const { items, W, F } = ksProblem(), n = items.length, total = n * W + 1;
      let solved = 0, phase = 1;
      ctx.progress(0, total);
      let h = `<div class="scroll"><table class="kt ksp"><tr><th></th>${Array.from({ length: W + 1 }, (_, j) => `<th>j=${j}</th>`).join('')}</tr>`;
      for (let i = 0; i <= n; i++) {
        const it = items[i - 1];
        h += `<tr><th class="rowh">${i === 0 ? 'ไม่มีของ' : `ชิ้น ${i}<small>w=${it.w}, v=${it.v}</small>`}</th>`;
        for (let j = 0; j <= W; j++) h += i === 0 || j === 0 ? `<td class="base" data-i="${i}" data-j="${j}">0</td>` : `<td class="in" data-i="${i}" data-j="${j}">${numInput()}</td>`;
        h += '</tr>';
      }
      el.innerHTML = `<div class="pq">เป้จุได้ W = ${W}</div>${h}</table></div>
        <div class="ks2" hidden><div class="pq">ตารางครบแล้ว เลือกชิ้นที่ใส่เป้เพื่อให้ได้ ${K(F[n][W], 'acc')}</div>
          <div class="items">${items.map((it, k) => `<button class="item" data-k="${k}"><span class="nm">ชิ้น ${k + 1}<small>w=${it.w}</small></span><span class="val">${it.v}</span></button>`).join('')}</div>
          <div class="bag"><button class="btn sendb">ส่งคำตอบ</button><span class="bagmsg"></span></div></div>`;
      const cell = (i, j) => el.querySelector(`td[data-i="${i}"][data-j="${j}"]`);
      el.querySelectorAll('td.in input').forEach((inp) => {
        const td = inp.parentElement, i = +td.dataset.i, j = +td.dataset.j;
        inp.setAttribute('aria-label', `F(${i},${j})`);
        wire(inp, F[i][j], ctx, () => { ctx.work(ksEq(i, j, true)); ctx.progress(++solved, total); if (solved === n * W) openPick(); });
      });
      // equation for F(i,j); numbers only for cells already known (row 0, col 0 or solved)
      const known = (i, j) => i === 0 || j === 0 || !!(cell(i, j).querySelector('input') || {}).readOnly;
      const val = (i, j) => (known(i, j) ? F[i][j] : '?');
      function ksEq(i, j, full) {
        const { w, v } = items[i - 1], res = full ? `<b>${F[i][j]}</b>` : '?';
        if (w > j) return `F(${i},${j}) = F(${i - 1},${j}) = ${res} <span class="muted">(w${i} = ${w} > ${j} ใส่ไม่ได้)</span>`;
        const a = val(i - 1, j), b = val(i - 1, j - w);
        return `F(${i},${j}) = max( F(${i - 1},${j}) , ${v} + F(${i - 1},${j - w}) ) = max( ${a} , ${v} + ${b} )${b !== '?' ? ` = max( ${a} , ${v + b} )` : ''} = ${res}`;
      }
      function backEq() {
        const L = [];
        let j = W;
        for (let i = n; i >= 1; i--) {
          if (F[i][j] === F[i - 1][j]) L.push(`F(${i},${j}) = ${F[i][j]} = F(${i - 1},${j}) → ไม่ใส่ชิ้น ${i}`);
          else { L.push(`F(${i},${j}) = ${F[i][j]} ≠ F(${i - 1},${j}) = ${F[i - 1][j]} → ใส่ชิ้น ${i}, j = ${j} − ${items[i - 1].w} = ${j - items[i - 1].w}`); j -= items[i - 1].w; }
        }
        return L;
      }
      const pickSet = new Set();
      function openPick() {
        phase = 2;
        el.querySelector('.ks2').hidden = false;
        el.querySelector('.ks2').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      el.querySelectorAll('.item').forEach((b) => (b.onclick = () => {
        const k = +b.dataset.k;
        pickSet.has(k) ? pickSet.delete(k) : pickSet.add(k);
        b.classList.toggle('in', pickSet.has(k));
        el.querySelector('.bagmsg').textContent = '';
      }));
      el.querySelector('.sendb').onclick = (e) => {
        const ws = [...pickSet].reduce((s, k) => s + items[k].w, 0), vs = [...pickSet].reduce((s, k) => s + items[k].v, 0);
        const msg = el.querySelector('.bagmsg');
        if (ws <= W && vs === F[n][W]) {
          ctx.progress(total, total);
          el.querySelectorAll('.item,.sendb').forEach((x) => (x.disabled = true));
          backEq().forEach((l) => ctx.work(l));
          ctx.finish(`หยิบชิ้น ${[...pickSet].sort().map((k) => k + 1).join(', ')} หนัก ${ws} ได้ ${vs}`);
        } else {
          ctx.miss++;
          shakeEl(e.currentTarget);
          msg.textContent = ws > W ? `หนักรวม ${ws} เกินเป้ที่จุ ${W}` : `ได้มูลค่า ${vs} ยังไม่เท่ากับ ${F[n][W]}`;
        }
      };
      return {
        hint() {
          if (phase === 2) return `เริ่มที่มุมขวาล่าง F(${n},${W}) ถ้าค่าเท่ากับช่องบน แปลว่าไม่ได้ใส่ชิ้นนั้น ขึ้นแถวบน ถ้าไม่เท่า แปลว่าใส่ แล้วขยับซ้ายไปเท่าน้ำหนักของชิ้นนั้นก่อนขึ้นแถวบน`;
          const act = document.activeElement;
          let inp = act && act.matches('td.in input') && !act.readOnly ? act : el.querySelector('td.in input:not([readonly])');
          if (!inp) return '';
          const td = inp.parentElement, i = +td.dataset.i, j = +td.dataset.j, { w, v } = items[i - 1];
          cell(i - 1, j).classList.add('hl-up');
          if (w > j) return `ชิ้น ${i} หนัก ${w} เกินเป้ที่จุ ${j} ใส่ไม่ได้ ลอก${K('ช่องบน', 'skip')}ลงมา<br><span class="mono">${ksEq(i, j, false)}</span>`;
          cell(i - 1, j - w).classList.add('hl-dg');
          const ready = known(i - 1, j) && known(i - 1, j - w);
          return `เลือกค่ามากกว่าระหว่างไม่ใส่ (${K('ช่องบน', 'skip')}) กับใส่ (${v} + ${K(`F(${i - 1},${j - w})`, 'take')})<br><span class="mono">${ksEq(i, j, false)}</span>${ready ? '' : '<br><span class="muted">เติมช่องที่ไฮไลต์ก่อน</span>'}`;
        },
      };
    },
  });

  /* ================= Dijkstra ================= */
  const DPOS = { a: [50, 150], b: [180, 55], c: [180, 245], d: [370, 55], e: [370, 245], f: [510, 150] };
  const DCAND = [['a', 'b'], ['a', 'c'], ['b', 'c'], ['b', 'd'], ['c', 'e'], ['d', 'e'], ['d', 'f'], ['e', 'f'], ['b', 'e'], ['c', 'd']];
  function djProblem() {
    for (;;) {
      let E = DCAND.filter(() => Math.random() < 0.75);
      if (E.some(([u, v]) => u + v === 'be') && E.some(([u, v]) => u + v === 'cd')) E = E.filter(([u, v]) => u + v !== 'cd');
      const V = Object.keys(DPOS), seen = new Set(['a']), st = ['a'];
      while (st.length) { const x = st.pop(); for (const [u, v] of E) for (const [p, q] of [[u, v], [v, u]]) if (p === x && !seen.has(q)) { seen.add(q); st.push(q); } }
      if (seen.size === V.length && E.length >= 7) return { pos: DPOS, E: E.map(([u, v]) => [u, v, rnd(1, 9)]) };
    }
  }

  drills.push({
    id: 'dijkstra', ch: 'gr', title: 'Dijkstra', glyph: 'graph',
    blurb: 'แตะจุดที่จะปิดถัดไป แล้วกรอกระยะที่อัปเดตเอง',
    task: 'เริ่มจาก a แตะจุดที่ควรปิดถาวรเป็นลำดับถัดไป แล้วกรอกค่า d ใหม่ของเพื่อนบ้านที่ยังไม่ปิด (ถ้าไม่ดีขึ้นก็กรอกค่าเดิม)',
    create(el, ctx) {
      const G = djProblem(), V = Object.keys(G.pos);
      const adj = Object.fromEntries(V.map((v) => [v, []]));
      for (const [u, v, w] of G.E) { adj[u].push([v, w]); adj[v].push([u, w]); }
      for (const v of V) adj[v].sort((x, y) => (x[0] < y[0] ? -1 : 1));
      const d = Object.fromEntries(V.map((v) => [v, Infinity])), prev = {}, done = [];
      d.a = 0;
      let phase = 'pick', cur = null, pend = [];
      ctx.progress(0, V.length);
      el.innerHTML = `<div class="pq ask"></div><div class="dgrid"><div class="gh"></div><div class="th"></div></div>`;
      const gh = el.querySelector('.gh'), th = el.querySelector('.th'), ask = el.querySelector('.ask');

      function draw() {
        const relax = pend.map((p) => p.v);
        gh.innerHTML = Lab.graph(G, {
          h: 300, r: 25,
          nodeCls: (v) => (done.includes(v) ? 'done' : d[v] < Infinity ? 'front' : '') + (v === cur && phase === 'relax' ? ' cur' : '') + (phase === 'pick' && !done.includes(v) ? ' click' : ''),
          edgeCls: (u, v) => (phase === 'relax' && ((u === cur && relax.includes(v)) || (v === cur && relax.includes(u))) ? 'try' : prev[v] === u || prev[u] === v ? 'tree' : ''),
          badge: (v) => ({ t: Lab.fmt(d[v]), cls: done.includes(v) ? 'fin' : '' }),
        });
        th.innerHTML = `<table class="dt"><tr><th>จุด</th><th>d</th><th>มาจาก</th></tr>${V.map((v) => {
          const p = pend.find((x) => x.v === v);
          return `<tr class="${done.includes(v) ? 'done' : ''}"><td>${v}</td><td>${p ? numInput('dt-in') : Lab.fmt(d[v])}</td><td>${prev[v] || '–'}</td></tr>`;
        }).join('')}</table>`;
        th.querySelectorAll('input.ans').forEach((inp, k) => {
          const p = pend[k];
          inp.dataset.v = p.v;
          wire(inp, p.nd, ctx, () => { ctx.work(djEq(p, true)); p.ok = true; if (pend.every((x) => x.ok)) setTimeout(finishRelax, 350); });
        });
        if (phase === 'pick') ask.innerHTML = done.length ? 'แตะจุดที่จะปิดถาวรเป็นลำดับถัดไป' : 'แตะจุดแรกที่จะปิดถาวร';
        else ask.innerHTML = `ปิด ${K(cur, 'acc')} แล้ว กรอก d ใหม่ของ ${pend.map((p) => K(p.v)).join(' ')} ในตาราง`;
      }
      function djEq(p, full) {
        const head = `d(${p.v}) = min(${Lab.fmt(p.old)}, d(${cur})+${p.w}) = min(${Lab.fmt(p.old)}, ${d[cur]}+${p.w})`;
        if (!full) return `${head} = ?`;
        return `${head} = <b>${p.nd}</b> <span class="muted">${p.nd < p.old ? `(อัปเดต มาจาก ${cur})` : '(คงเดิม)'}</span>`;
      }
      function candidates() {
        const open = V.filter((v) => !done.includes(v) && d[v] < Infinity);
        const best = Math.min(...open.map((v) => d[v]));
        return { open, best };
      }
      gh.addEventListener('click', (e) => {
        const g = e.target.closest('.nd');
        if (!g || phase !== 'pick') return;
        const v = g.dataset.v;
        if (done.includes(v)) return;
        const { best } = candidates();
        if (d[v] !== best) { ctx.miss++; shakeEl(g); g.classList.add('bad'); setTimeout(() => g.classList.remove('bad'), 700); return; }
        ctx.clearHint();
        const others = V.filter((x) => !done.includes(x) && d[x] < Infinity && x !== v);
        ctx.work(`ปิด ${v} เพราะ d(${v}) = ${d[v]}${others.length ? ` น้อยสุดเมื่อเทียบกับ ${others.map((x) => `d(${x}) = ${d[x]}`).join(', ')}` : done.length ? ' (เหลือจุดเดียว)' : ' (จุดเริ่มต้น)'}`);
        done.push(v); cur = v;
        ctx.progress(done.length, V.length);
        pend = adj[v].filter(([x]) => !done.includes(x)).map(([x, w]) => ({ v: x, w, old: d[x], nd: Math.min(d[x], d[v] + w) }));
        if (done.length === V.length) { phase = 'end'; cur = null; draw(); ask.innerHTML = ''; ctx.finish(`ปิดครบทุกจุด ระยะจาก a คือ ${V.slice(1).map((x) => `${x} = ${d[x]}`).join(', ')}`); return; }
        phase = pend.length ? 'relax' : 'pick';
        if (!pend.length) cur = null;
        draw();
        if (phase === 'relax' && matchMedia('(hover:hover)').matches) { const f = th.querySelector('input.ans'); f && f.focus(); }
      });
      function finishRelax() {
        for (const p of pend) if (p.nd < p.old) { d[p.v] = p.nd; prev[p.v] = cur; }
        pend = []; cur = null; phase = 'pick';
        draw();
      }
      draw();
      return {
        hint() {
          if (phase === 'pick') {
            const { open } = candidates();
            return `จุดที่ยังไม่ปิดแต่มีระยะแล้ว: ${open.sort((x, y) => d[x] - d[y]).map((v) => `${v} (${d[v]})`).join(', ')} เลือกตัวที่ d น้อยที่สุด`;
          }
          if (phase !== 'relax') return '';
          const act = document.activeElement;
          const v = act && act.dataset && act.dataset.v && !act.readOnly ? act.dataset.v : (th.querySelector('input.ans:not([readonly])') || {}).dataset?.v;
          const p = pend.find((x) => x.v === v);
          if (!p) return '';
          return `เทียบค่าเดิมกับทางที่ผ่าน ${cur} แล้วเก็บตัวที่น้อยกว่า<br><span class="mono">${djEq(p, false)}</span>`;
        },
      };
    },
  });

  /* ---------- page ---------- */
  function render(app, id) {
    const D = drills.find((x) => x.id === id) || drills[0];
    const tiles = drills.map((x) => {
      const n = Lab.store.get('practice:' + x.id, 0);
      return `<a class="tile open c-${x.ch} ${x === D ? 'sel' : ''}" href="#practice/${x.id}" ${x === D ? 'aria-current="true"' : ''}>
        <div class="gl">${Lab.glyph(x.glyph)}</div><h3>${x.title}</h3><p>${x.blurb}</p>
        <div class="st">${n ? `<span>ทำไปแล้ว ${n} ข้อ</span>` : ''}</div></a>`;
    }).join('');
    app.innerHTML = Lab.topbar('ฝึกทำเอง', 'c-' + D.ch) + `
      <main class="wrap">
        <section class="hero phero">
          <h1>Your turn.</h1>
          <p class="lead">สุ่มโจทย์ใหม่ทุกครั้ง กรอกเองทีละช่อง ถูกหรือผิดรู้ทันที ติดตรงไหนกดคำใบ้</p>
        </section>
        <div class="tiles ptiles" style="--cols:${drills.length}">${tiles}</div>
        <section class="drill c-${D.ch}" id="drill"></section>
        <nav class="next"><a class="btn ghost" href="#">← ทุกบทเรียน</a></nav>
      </main>`;
    shell(app.querySelector('#drill'), D);
  }

  Lab.practice = { render, drills };
})();
