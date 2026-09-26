/* Lesson: B-Tree (Levitin variant: records in leaves, parent keys copy first key of right child) */
(function () {
  const K = Lab.k;
  const MAXK = 3; // order 4: at most 4 children, at most 3 keys per node
  let uid = 0;
  const leaf = (keys) => ({ id: ++uid, leaf: true, keys });
  const inner = (keys, kids) => ({ id: ++uid, leaf: false, keys, kids });
  const clone = (n) => (n.leaf ? { id: n.id, leaf: true, keys: n.keys.slice() } : { id: n.id, leaf: false, keys: n.keys.slice(), kids: n.kids.map(clone) });

  function initial() {
    return inner([20, 51], [
      inner([11, 15], [leaf([4, 7, 10]), leaf([11, 14]), leaf([15, 16, 19])]),
      inner([25, 34, 40], [leaf([20, 24]), leaf([25, 28]), leaf([34, 38]), leaf([40, 43, 46])]),
      inner([60], [leaf([51, 55]), leaf([60, 68, 80])]),
    ]);
  }

  // returns {root, frames}
  function insert(root0, key) {
    let root = clone(root0);
    const F = [];
    const push = (mark, cap) => F.push({ root: clone(root), mark, cap });
    const path = [];
    let n = root;
    while (true) {
      path.push(n);
      if (n.leaf) break;
      let i = 0;
      while (i < n.keys.length && key >= n.keys[i]) i++;
      const why = i === 0 ? `${key} &lt; ${n.keys[0]}` : i === n.keys.length ? `${key} ≥ ${n.keys[i - 1]}` : `${n.keys[i - 1]} ≤ ${key} &lt; ${n.keys[i]}`;
      push({ [n.id]: 'hi' }, `ที่ node [${n.keys.join(', ')}] : ${why} → ลงลูกตัวที่ ${i + 1}`);
      n = n.kids[i];
    }
    if (n.keys.includes(key)) { push({ [n.id]: 'hi' }, `${key} มีอยู่แล้ว ไม่ต้องใส่ซ้ำ`); return { root, frames: F }; }
    n.keys.push(key); n.keys.sort((a, b) => a - b);
    if (n.keys.length <= MAXK) { push({ [n.id]: 'acc' }, `ถึงใบ ใส่ ${K(key, 'hi')} แล้วมี ${n.keys.length} key ไม่เกิน 3 → จบ`); return { root, frames: F }; }
    push({ [n.id]: 'bad' }, `ใส่ ${key} แล้วใบมี 4 key <b>เกิน 3</b> → ต้องแบ่ง`);
    let child = n, lvl = path.length - 1;
    while (true) {
      const parent = lvl > 0 ? path[lvl - 1] : null;
      let left, right, up;
      if (child.leaf) {
        left = leaf(child.keys.slice(0, 2)); right = leaf(child.keys.slice(2)); up = right.keys[0];
      } else {
        left = inner(child.keys.slice(0, 2), child.kids.slice(0, 3)); up = child.keys[2]; right = inner(child.keys.slice(3), child.kids.slice(3));
      }
      if (!parent) {
        root = inner([up], [left, right]);
        push({ [root.id]: 'acc', [left.id]: 'acc', [right.id]: 'acc' }, `root ล้น → แบ่งเป็น [${left.keys.join(', ')}] กับ [${right.keys.join(', ')}] แล้วสร้าง root ใหม่ [${up}] · ต้นไม้<b>สูงขึ้น 1 ชั้น</b>`);
        break;
      }
      const ci = parent.kids.indexOf(child);
      parent.kids.splice(ci, 1, left, right);
      parent.keys.splice(ci, 0, up);
      if (parent.keys.length <= MAXK) {
        push({ [left.id]: 'acc', [right.id]: 'acc', [parent.id]: 'hi' }, `แบ่งเป็น [${left.keys.join(', ')}] | [${right.keys.join(', ')}] แล้วส่ง ${K(up, 'hi')} ขึ้นไปที่ parent → parent มี ${parent.keys.length} key จบ`);
        break;
      }
      push({ [left.id]: 'acc', [right.id]: 'acc', [parent.id]: 'bad' }, `ส่ง ${up} ขึ้นไป แต่ parent มี 4 key <b>ล้นอีก</b> → แบ่ง parent ต่อ`);
      child = parent; lvl--;
    }
    return { root, frames: F };
  }

  function draw(root, mark = {}) {
    const CW = 30, GAP = 14, LH = 78;
    const levels = [];
    (function walk(n, d) { (levels[d] = levels[d] || []).push(n); if (!n.leaf) n.kids.forEach((k) => walk(k, d + 1)); })(root, 0);
    const X = {}, W = {};
    const width = (n) => Math.max(1, n.keys.length) * CW;
    let x = 10;
    const leaves = levels[levels.length - 1];
    for (const n of leaves) { X[n.id] = x; W[n.id] = width(n); x += W[n.id] + GAP; }
    const total = x;
    for (let d = levels.length - 2; d >= 0; d--)
      for (const n of levels[d]) {
        const a = n.kids[0], b = n.kids[n.kids.length - 1];
        const cx = (X[a.id] + X[b.id] + W[b.id]) / 2;
        W[n.id] = width(n); X[n.id] = cx - W[n.id] / 2;
      }
    const h = levels.length * LH + 10;
    let s = `<svg class="gsvg" viewBox="0 0 ${total} ${h}" style="max-width:${Math.max(total, 300)}px;min-width:${Math.min(total, 720)}px" role="img" aria-label="B-tree">`;
    levels.forEach((lv, d) => lv.forEach((n) => {
      if (n.leaf) return;
      n.kids.forEach((c, i) => {
        const bx = X[n.id] + i * CW; // pointer sits on the boundary between keys
        s += `<line class="tl" x1="${bx}" y1="${10 + d * LH + 30}" x2="${X[c.id] + W[c.id] / 2}" y2="${10 + (d + 1) * LH}"/>`;
      });
    }));
    levels.forEach((lv, d) => lv.forEach((n) => {
      const cls = mark[n.id] || '';
      n.keys.forEach((k, i) => { s += `<g class="bx ${cls}"><rect x="${X[n.id] + i * CW}" y="${10 + d * LH}" width="${CW}" height="30" rx="4"/><text x="${X[n.id] + i * CW + CW / 2}" y="${10 + d * LH + 15}">${k}</text></g>`; });
    }));
    return s + '</svg>';
  }

  function height(root) { let d = 1, n = root; while (!n.leaf) { n = n.kids[0]; d++; } return d; }

  Lab.register({
    id: 'btree', ch: 'st', title: 'B-Tree', sub: 'ต้นไม้เตี้ย ๆ ที่หนึ่ง node เก็บได้หลาย key', minutes: 8, checks: 4, slide: 'week7 หน้า 38–41',
    mount(root) {
      const L = 'btree';
      let s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'node ใหญ่ขึ้น ต้นไม้ก็เตี้ยลง',
        html: `<p>ฐานข้อมูลเก็บข้อมูลบน disk ทุกครั้งที่ลงไปอีกชั้นคือการอ่าน disk หนึ่งครั้ง B-tree ให้แต่ละ node มีหลาย key และหลาย pointer ต้นไม้จึงเตี้ยมาก ใช้ทำ index ของฐานข้อมูลและ file system</p>
          <div class="rule"><span class="lbl">B-tree order m (ตัวอย่างนี้ m = 4)</span>root มีลูก 2 … m (หรือเป็นใบ) · node ภายในมีลูก ⌈m/2⌉ … m = 2 … 4
          <span class="lbl" style="margin-top:8px">กฎที่สำคัญที่สุด</span>ใบทุกใบอยู่ระดับเดียวกัน → ค้นหาและใส่ ${'Θ(log n)'}</div>
          <p>แบบในสไลด์ (Levitin) ข้อมูลจริงอยู่ที่ใบ key ใน node ข้างบนคือ key ตัวแรกของลูกทางขวา ใช้บอกทางว่าจะลงลูกตัวไหน</p>`,
      });

      s = Lab.beat(root, {
        kick: 'ลองเอง',
        title: 'ใส่ key แล้วดูการแบ่ง node',
        html: `<p>ต้นไม้เริ่มต้นคือตัวอย่าง order 4 จากสไลด์ กด ${K('ใส่ 65')} เพื่อดูตัวอย่างในสไลด์ หรือพิมพ์ตัวเลขเอง ใบไหนมีเกิน 3 key จะถูกแบ่งครึ่ง แล้วส่ง key ขึ้นไปข้างบน</p>`,
        wide: true,
      });
      const bar = document.createElement('div');
      bar.style.cssText = 'display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px';
      bar.innerHTML = `<label class="field" style="flex:0 1 140px">key<input id="btK" type="number" value="65" min="1" max="999"></label>
        <button class="btn" data-a="ins">ใส่</button><button class="btn ghost" data-a="s65">ใส่ 65 (สไลด์)</button><button class="btn ghost" data-a="many">ใส่ 5, 6, 8, 9</button><button class="btn ghost" data-a="reset">เริ่มใหม่</button>`;
      s.append(bar);
      const host = document.createElement('div');
      s.append(host);
      const info = document.createElement('p');
      info.className = 'muted';
      info.style.marginTop = '10px';
      s.append(info);
      let tree = initial();
      const show = (frames) => {
        host.innerHTML = '';
        Lab.stepper(Lab.stage(host), { frames, speed: 1400, render(el, f) { el.innerHTML = `<div class="scroll">${draw(f.root, f.mark)}</div>`; return f.cap; } });
        info.textContent = `ความสูงตอนนี้ ${height(tree)} ชั้น`;
      };
      const doInsert = (keys) => {
        let all = [];
        for (const k of keys) { const r = insert(tree, k); tree = r.root; all = all.concat(r.frames); }
        show(all);
      };
      bar.addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]'); if (!a) return;
        if (a.dataset.a === 'reset') { tree = initial(); show([{ root: tree, mark: {}, cap: 'ต้นไม้ตัวอย่าง order 4 จากสไลด์' }]); }
        if (a.dataset.a === 'ins') { const v = Math.round(+bar.querySelector('#btK').value); if (v > 0 && v < 1000) doInsert([v]); }
        if (a.dataset.a === 's65') { tree = initial(); doInsert([65]); }
        if (a.dataset.a === 'many') doInsert([5, 6, 8, 9]);
      });
      show([{ root: tree, mark: {}, cap: 'ต้นไม้ตัวอย่าง order 4 จากสไลด์ · ใบทุกใบอยู่ชั้นเดียวกัน' }]);

      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'ใส่ 65 ลงในต้นไม้ตัวอย่าง ใบ [60, 68, 80] แบ่งแล้ว parent ของใบนั้นจะมี key อะไร', options: ['[60, 65]', '[60, 68]', '[65]', '[68]'], answer: 1,
        why: 'ใบกลายเป็น [60, 65, 68, 80] แบ่งเป็น [60, 65] | [68, 80] แล้วส่ง 68 (ตัวแรกของใบขวา) ขึ้นไป parent เดิม [60] จึงเป็น [60, 68]' });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean">
          <li>B-tree <b>โตขึ้นที่ root</b> (แบ่งแล้วส่งขึ้นบน) ไม่ได้ยืดลงล่าง ใบจึงอยู่ระดับเดียวกันเสมอ</li>
          <li>order 4 → node ภายในมีลูก <b>2–4</b> ตัว (key 1–3 ตัว) · root มีลูกได้ 2–4</li>
          <li>ความสูง h ≤ ⌊log<sub>⌈m/2⌉</sub>((n + 1)/4)⌋ + 1 → ค้นหาและใส่ ${K('Θ(log n)')}</li>
          <li>B-tree เป็น space–time แบบ <b>prestructuring</b> เหมือน hashing</li></ul>`,
      });
      Lab.exam(root, L, [
        { key: 'c2', q: 'B-tree order 4 node ภายในที่ไม่ใช่ root มีลูกได้', options: ['1–4 ตัว', '2–4 ตัว', '2–3 ตัว', '4 ตัวพอดี'], answer: 1, why: '⌈m/2⌉ … m = 2 … 4' },
        { key: 'c3', q: 'ใส่ key แล้ว root ล้น สิ่งที่เกิดคือ', options: ['ใบลึกลงไปอีกชั้น', 'แบ่ง root แล้วสร้าง root ใหม่ ต้นไม้สูงขึ้น 1 ชั้น', 'ย้าย key ไป node ข้าง ๆ', 'ไม่ให้ใส่'], answer: 1, why: 'ทุกใบจึงยังอยู่ชั้นเดียวกัน' },
        { key: 'c4', q: 'ค้นหาใน B-tree ที่มี n key ใช้เวลา', options: ['Θ(1)', 'Θ(log n)', 'Θ(n)', 'Θ(n log n)'], answer: 1, why: 'ความสูงเป็น log ของ n (ฐาน ⌈m/2⌉)' },
      ]);
      Lab.recap(root, [
        'หลาย key ต่อ node → ต้นไม้เตี้ย → อ่าน disk น้อยครั้ง',
        'ใบล้น → แบ่งครึ่ง ส่ง key ขึ้น parent · root ล้น → สูงขึ้น 1 ชั้น',
        'ใบอยู่ระดับเดียวกันเสมอ · ค้นหา/ใส่ Θ(log n)',
      ]);
    },
  });
})();
