/* Lesson: Optimal Binary Search Tree */
(function () {
  const K = Lab.k;
  const r2 = (x) => Math.round(x * 100) / 100;

  const TREES = [
    { n: { A: { label: 'A', r: 'B' }, B: { label: 'B', r: 'C' }, C: { label: 'C' } }, root: 'A', d: { A: 1, B: 2, C: 3 } },
    { n: { A: { label: 'A', r: 'C' }, C: { label: 'C', l: 'B' }, B: { label: 'B' } }, root: 'A', d: { A: 1, C: 2, B: 3 } },
    { n: { B: { label: 'B', l: 'A', r: 'C' }, A: { label: 'A' }, C: { label: 'C' } }, root: 'B', d: { B: 1, A: 2, C: 2 } },
    { n: { C: { label: 'C', l: 'A' }, A: { label: 'A', r: 'B' }, B: { label: 'B' } }, root: 'C', d: { C: 1, A: 2, B: 3 } },
    { n: { C: { label: 'C', l: 'B' }, B: { label: 'B', l: 'A' }, A: { label: 'A' } }, root: 'C', d: { C: 1, B: 2, A: 3 } },
  ];
  const FREQ = { A: 3, B: 4, C: 5 };

  function solve(p) {
    const n = p.length, C = [], R = [];
    for (let i = 1; i <= n + 1; i++) { C[i] = []; R[i] = []; C[i][i - 1] = 0; if (i <= n) { C[i][i] = p[i - 1]; R[i][i] = i; } }
    const steps = [];
    for (let d = 1; d < n; d++)
      for (let i = 1; i + d <= n; i++) {
        const j = i + d, cand = [];
        let best = Infinity, bk = null;
        for (let k = i; k <= j; k++) {
          const v = r2((C[i][k - 1] || 0) + (k + 1 <= j ? C[k + 1][j] : 0));
          cand.push({ k, a: C[i][k - 1] || 0, b: k + 1 <= j ? C[k + 1][j] : 0, v });
          if (v < best - 1e-9) { best = v; bk = k; }
        }
        const sp = r2(p.slice(i - 1, j).reduce((a, b) => a + b, 0));
        C[i][j] = r2(best + sp); R[i][j] = bk;
        steps.push({ i, j, cand, bk, sp, val: C[i][j] });
      }
    return { C, R, steps };
  }

  function frames(p, keys) {
    const n = p.length, { C, R, steps } = solve(p), fr = [];
    fr.push({ filled: new Set(), cap: `แนวทแยงแรก C(i, i) = pᵢ (ต้นไม้ key เดียว เทียบ 1 ครั้ง) และ C(i, i−1) = 0 (ต้นไม้ว่าง)` });
    const filled = new Set();
    for (const st of steps) {
      filled.add(st.i + ',' + st.j);
      const lines = st.cand.map((c) => {
        const leftName = `C(${st.i},${c.k - 1})`, rightName = `C(${c.k + 1},${st.j})`;
        return `k=${keys[c.k - 1]}: ${leftName}+${rightName} = ${Lab.fmt(c.a)}+${Lab.fmt(c.b)} = ${c.k === st.bk ? `<b>${Lab.fmt(c.v)}</b>` : Lab.fmt(c.v)}`;
      }).join(' · ');
      fr.push({ filled: new Set(filled), cur: [st.i, st.j], srcA: [st.i, st.bk - 1], srcB: [st.bk + 1, st.j],
        cap: `C(${st.i},${st.j}) = min{ ${lines} } + Σp(${Lab.fmt(st.sp)}) = <b>${Lab.fmt(st.val)}</b> · root = ${K(keys[st.bk - 1], 'hi')}` });
    }
    fr.push({ filled: new Set(filled), done: true, cap: `C(1,${n}) = <b>${Lab.fmt(C[1][n])}</b> = จำนวนครั้งเปรียบเทียบเฉลี่ยของต้นไม้ที่ดีที่สุด · root = ${keys[R[1][n] - 1]}` });
    return { C, R, fr };
  }

  function tables(p, keys, C, R, f) {
    const n = p.length;
    const has = (a, i, j) => a && a[0] === i && a[1] === j;
    const one = (M, isR) => {
      let h = `<table class="kt"><tr><th>i \\ j</th>${Array.from({ length: n + 1 }, (_, j) => `<th>${j}</th>`).join('')}</tr>`;
      for (let i = 1; i <= n + 1; i++) {
        h += `<tr><th class="rowh">${i}</th>`;
        for (let j = 0; j <= n; j++) {
          let v = '', cls = 'empty';
          if (j === i - 1) { v = isR ? '' : '0'; cls = isR ? 'empty' : 'base'; }
          else if (j === i && i <= n) { v = isR ? keys[R[i][j] - 1] : Lab.fmt(M[i][j]); cls = ''; }
          else if (j > i && (f.filled.has(i + ',' + j))) { v = isR ? keys[R[i][j] - 1] : Lab.fmt(M[i][j]); cls = ''; }
          if (has(f.cur, i, j)) cls = 'cur';
          else if (!isR && (has(f.srcA, i, j) || has(f.srcB, i, j)) && j >= i - 1) cls = 'up';
          if (f.done && i === 1 && j === n) cls = 'cur';
          h += `<td class="${cls}">${cls === 'empty' ? '' : v}</td>`;
        }
        h += '</tr>';
      }
      return h + '</table>';
    };
    return `<div class="scroll"><div class="row2"><div><div class="mini-h">ตารางหลัก C(i, j)</div>${one(C, false)}</div><div><div class="mini-h">ตาราง root R(i, j)</div>${one(R, true)}</div></div></div>`;
  }

  function buildTree(R, keys, p, i, j, nodes) {
    if (i > j) return null;
    const k = R[i][j];
    const id = keys[k - 1];
    nodes[id] = { label: id, sub: 'p=' + p[k - 1] };
    nodes[id].l = buildTree(R, keys, p, i, k - 1, nodes);
    nodes[id].r = buildTree(R, keys, p, k + 1, j, nodes);
    return id;
  }

  Lab.register({
    id: 'obst', ch: 'dp', title: 'Optimal BST', sub: 'จัด binary search tree ให้ค้นหาเฉลี่ยน้อยครั้งที่สุด', minutes: 10, checks: 4, slide: 'week8 หน้า 48–60',
    mount(root) {
      const L = 'obst';
      let s = Lab.beat(root, {
        kick: 'โจทย์',
        title: 'key A, B, C ถูกค้นบ่อย 3, 4, 5 ครั้ง',
        html: `<p>ค่าใช้จ่าย = Σ (ระดับของ node × ความถี่) เพราะ node ที่ระดับ d ต้องเปรียบเทียบ d ครั้ง แตะต้นไม้แต่ละต้นเพื่อดูค่าใช้จ่าย ลองหาต้นที่ถูกที่สุด</p>`,
        wide: true,
      });
      const st = Lab.stage(s);
      st.innerHTML = `<div class="picks">${TREES.map((t, n) => `<button class="pick" data-n="${n}">${Lab.tree(t.n, t.root, { w: 170, levelH: 52, r: 16, maxw: 150 })}<div class="cost">แตะเพื่อคำนวณ</div></button>`).join('')}</div><div class="cap" id="obMsg">ทั้งหมดมี 5 ต้น (Catalan number ของ 3)</div>`;
      const shown = new Set();
      st.addEventListener('click', (e) => {
        const b = e.target.closest('.pick'); if (!b) return;
        const t = TREES[+b.dataset.n];
        const cost = Object.keys(FREQ).reduce((a, k) => a + t.d[k] * FREQ[k], 0);
        b.classList.add('shown');
        b.querySelector('.cost').innerHTML = `${['A', 'B', 'C'].map((k) => `${t.d[k]}·${FREQ[k]}`).join(' + ')} = <b>${cost}</b>`;
        shown.add(+b.dataset.n);
        if (cost === 20) b.classList.add('best');
        st.querySelector('#obMsg').innerHTML = cost === 20 ? `<b style="color:var(--ok)">B เป็น root ดีที่สุด = 20</b> ทั้งที่ C ถูกค้นบ่อยที่สุด การเอาตัวถี่สุดขึ้น root ไม่ได้ดีเสมอ` : `ดูแล้ว ${shown.size}/5 ต้น`;
      });

      s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'ลองให้ทุก key เป็น root',
        html: `<p>n key มี BST ได้เป็นจำนวน Catalan (n = 4 มี 14 ต้น, n = 10 มี 16,796 ต้น) ลองทุกต้นไม่ไหว DP ใช้ข้อสังเกตนี้</p>
          <p>ถ้า a<sub>k</sub> เป็น root ต้นซ้ายต้องเป็น optimal BST ของ a<sub>i</sub>…a<sub>k−1</sub> และต้นขวาเป็นของ a<sub>k+1</sub>…a<sub>j</sub> ทุก node ในต้นย่อยลึกลง 1 ชั้น จึงต้อง<b>บวกความน่าจะเป็นของทั้งช่วง</b></p>
          <div class="rule"><span class="lbl">recurrence</span>C(i, j) = min<sub>i ≤ k ≤ j</sub> { C(i, k−1) + C(k+1, j) } + (pᵢ + … + pⱼ)
          <span class="lbl" style="margin-top:8px">เริ่มต้น</span>C(i, i−1) = 0 · C(i, i) = pᵢ · R(i, j) = k ที่ให้ค่าน้อยสุด</div>`,
      });

      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'A, B, C, D · p = 0.1, 0.2, 0.4, 0.3', html: `<p>เติมตามแนวทแยง: ช่วงยาว 2 ก่อน แล้ว 3 แล้ว 4 ช่องที่มีกรอบคือ C(i, k−1) กับ C(k+1, j) ของ root ที่ดีที่สุด</p>`, wide: true });
      const p = [0.1, 0.2, 0.4, 0.3], keys = ['A', 'B', 'C', 'D'];
      const { C, R, fr } = frames(p, keys);
      Lab.stepper(Lab.stage(s), { frames: fr, speed: 1800, render(el, f) { el.innerHTML = tables(p, keys, C, R, f); return f.cap; } });
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'key 2 ตัว p = 0.1, 0.2 → C(1,2) และ root คือ', options: ['0.3, root 1', '0.4, root 2', '0.5, root 1', '0.4, root 1'], answer: 1, why: 'root 1: 0 + 0.2 = 0.2 · root 2: 0.1 + 0 = 0.1 → min 0.1 + Σp 0.3 = 0.4 root 2' });

      s = Lab.beat(root, { kick: 'ผลลัพธ์', title: 'ประกอบต้นไม้จากตาราง R', html: `<p>R(1,4) = 3 → C เป็น root · ซ้ายคือช่วง 1…2 → R(1,2) = 2 → B · ใต้ B คือช่วง 1…1 → A · ขวาของ C คือช่วง 4…4 → D</p>` });
      const nodes = {};
      const rt = buildTree(R, keys, p, 1, 4, nodes);
      Lab.stage(s).innerHTML = Lab.tree(nodes, rt, { w: 320, levelH: 72, maxw: 340 }) + `<div class="cap" style="text-align:center">ค้นหาเฉลี่ย <b>1.7</b> ครั้ง</div>`;

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean"><li>ลืม <b>+ Σp ของทั้งช่วง i…j</b></li>
          <li>C(i, i−1) = 0 คือต้นไม้ว่าง ใช้ตอน root อยู่ริมช่วง</li>
          <li>อ่านตารางผิด: แถว = i (key แรกของช่วง) คอลัมน์ = j (key สุดท้าย)</li>
          <li>เวลา ${K('Θ(n³)')} · memory ${K('Θ(n²)')}</li></ul>`,
      });
      Lab.exam(root, L, [
        { key: 'c2', q: 'key 3 ตัวสร้าง binary search tree ได้กี่แบบ', options: ['3', '5', '6', '14'], answer: 1, why: 'Catalan number C₃ = 5 (key 4 ตัวได้ 14)' },
        { key: 'c3', q: 'ประสิทธิภาพของ optimal BST แบบ DP', options: ['Θ(n²)', 'Θ(n³)', 'Θ(n log n)', 'Θ(2ⁿ)'], answer: 1, why: 'ตาราง n² ช่อง แต่ละช่องลอง root ไม่เกิน n ตัว' },
        { key: 'c4', q: 'A, B, C ความถี่ 3, 4, 5 ให้ B เป็น root, A ลูกซ้าย, C ลูกขวา ค่าใช้จ่ายรวมเท่าไร', options: ['20', '22', '23', '26'], answer: 0, why: '2·3 + 1·4 + 2·5 = 20 (lab ข้อ 11)' },
      ]);
      Lab.recap(root, [
        'C(i, j) = min over k { C(i, k−1) + C(k+1, j) } + Σ pᵢ…pⱼ',
        'เติมตามแนวทแยง · R(i, j) เก็บ root เพื่อประกอบต้นไม้',
        'Θ(n³) เวลา · Θ(n²) memory',
      ]);
    },
  });
})();
