/* Lesson: Prim's algorithm (MST) */
(function () {
  const K = Lab.k;
  const INF = Infinity;
  const G = {
    pos: { a: [60, 165], b: [190, 60], c: [410, 60], d: [540, 165], e: [300, 280], f: [300, 160] },
    E: [['a', 'b', 3], ['a', 'e', 6], ['a', 'f', 5], ['b', 'c', 1], ['b', 'f', 4], ['c', 'f', 4], ['c', 'd', 6], ['d', 'f', 5], ['d', 'e', 8], ['e', 'f', 2]],
  };
  Lab.MSTG = G;
  const key = (u, v) => [u, v].sort().join('');

  function frames(G, s) {
    const V = Object.keys(G.pos);
    const adj = Object.fromEntries(V.map((v) => [v, {}]));
    for (const [u, v, w] of G.E) { adj[u][v] = w; adj[v][u] = w; }
    const inT = [s], tree = [], lab = {};
    let total = 0;
    const relabel = () => {
      const chg = [];
      for (const v of V) {
        if (inT.includes(v)) continue;
        let best = lab[v] || { p: null, w: INF };
        for (const t of inT) if (adj[t][v] != null && adj[t][v] < best.w) best = { p: t, w: adj[t][v] };
        if (!lab[v] || best.w !== lab[v].w) chg.push(v);
        lab[v] = best;
      }
      return chg;
    };
    const fr = [];
    const snap = (o) => Object.assign({ inT: inT.slice(), tree: tree.slice(), lab: Object.fromEntries(Object.entries(lab).map(([k, x]) => [k, { ...x }])), total }, o);
    relabel();
    fr.push(snap({ cap: `เริ่มที่ ${K(s, 'acc')} · จุดที่ติดกับต้นไม้ได้ป้าย (มาจากไหน, น้ำหนัก) ที่เหลือ = ∞` }));
    while (inT.length < V.length) {
      let u = null;
      for (const v of V) if (!inT.includes(v) && lab[v].w < INF && (u === null || lab[v].w < lab[u].w)) u = v;
      if (u === null) break;
      const p = lab[u].p, w = lab[u].w;
      fr.push(snap({ pick: u, edge: key(p, u), cap: `ป้ายที่น้อยที่สุดคือ ${u}(${p}, ${w}) → เพิ่ม edge ${K(p + '–' + u + ' (' + w + ')', 'hi')} เข้าต้นไม้` }));
      inT.push(u); tree.push(key(p, u)); total += w;
      const chg = relabel();
      fr.push(snap({ chg, cap: chg.length ? `อัปเดตป้ายเพื่อนบ้านของ ${u}: ${chg.map((v) => `${v}(${lab[v].p}, ${lab[v].w})`).join(', ')}` : `เพื่อนบ้านของ ${u} ไม่มีป้ายไหนดีขึ้น` }));
    }
    fr.push(snap({ done: true, cap: `ครบ ${V.length} จุด ใช้ ${V.length - 1} edge · น้ำหนักรวม MST = <b>${total}</b>` }));
    return fr;
  }

  function side(G, f) {
    const V = Object.keys(G.pos).filter((v) => !f.inT.includes(v));
    return `<div class="mini-h">ต้นไม้: ${f.inT.join(', ')}</div><table class="dt"><tr><th>จุดที่เหลือ</th><th>ใกล้ต้นไม้สุดผ่าน</th><th>น้ำหนัก</th></tr>${V.map((v) => {
      const l = f.lab[v] || { p: null, w: null };
      const c = f.chg && f.chg.includes(v) ? 'chg' : '';
      return `<tr><td>${v}</td><td class="${c}">${l.p || '–'}</td><td class="${c}">${l.w == null ? '∞' : Lab.fmt(l.w)}</td></tr>`;
    }).join('') || '<tr><td colspan="3" class="stt">ไม่เหลือแล้ว</td></tr>'}</table><div class="calc">รวมตอนนี้ = <b>${f.total}</b></div>`;
  }

  function mount(slot, G, s) {
    Lab.stepper(Lab.stage(slot), {
      frames: frames(G, s), speed: 1300,
      render(el, f) {
        const svg = Lab.graph(G, {
          w: 600, h: 330,
          edgeCls: (u, v) => (f.edge === key(u, v) ? 'try' : f.tree.includes(key(u, v)) ? 'tree' : ''),
          nodeCls: (v) => (f.inT.includes(v) ? 'done' : f.pick === v ? 'cur' : f.lab[v] && f.lab[v].w < INF ? 'front' : ''),
          badge: (v) => (f.inT.includes(v) ? null : { t: f.lab[v] && f.lab[v].w < INF ? `${f.lab[v].p},${f.lab[v].w}` : '∞', cls: f.chg && f.chg.includes(v) ? 'chg' : '' }),
          badgeBelow: (v) => G.pos[v][1] > 150,
        });
        el.innerHTML = `<div class="dgrid"><div>${svg}</div><div>${side(G, f)}</div></div>`;
        return f.cap;
      },
    });
  }

  Lab.register({
    id: 'prim', ch: 'gr', title: 'Prim', sub: 'minimum spanning tree แบบงอกต้นไม้ทีละกิ่ง', minutes: 8, checks: 3, slide: 'week9 หน้า 7–20',
    mount(root) {
      const L = 'prim';
      let s = Lab.beat(root, {
        kick: 'นิยาม',
        title: 'Minimum spanning tree',
        html: `<p><b>Spanning tree</b> คือเลือก edge มาชุดหนึ่งที่เชื่อม<b>ทุกจุด</b>และ<b>ไม่มีวงจร</b> ต้องใช้ |V| − 1 edge พอดี <b>MST</b> คือ spanning tree ที่น้ำหนักรวมน้อยที่สุด ใช้วางสายไฟ ท่อ หรือถนนให้ถึงทุกที่ด้วยต้นทุนต่ำสุด</p>`,
        wide: true,
      });
      const g4 = { pos: { a: [30, 30], b: [150, 30], c: [30, 130], d: [150, 130] }, E: [['a', 'b', 1], ['a', 'c', 5], ['b', 'd', 2], ['c', 'd', 3]] };
      const trees = [[null, 'กราฟ'], ['ac', 'T₁ = 1 + 2 + 3 = 6 · MST'], ['bd', 'T₂ = 1 + 5 + 3 = 9'], ['cd', 'T₃ = 1 + 5 + 2 = 8']];
      Lab.stage(s).innerHTML = `<div class="picks">${trees.map(([drop, t], n) => `<div class="pick ${n === 1 ? 'best' : ''}" style="cursor:default">${Lab.graph(n ? { pos: g4.pos, E: g4.E.filter((e) => e[0] + e[1] !== drop) } : g4, { w: 180, h: 160, r: 15, maxw: 150, edgeCls: () => (n ? 'tree' : '') })}<div class="cost" style="color:var(--ink)">${t}</div></div>`).join('')}</div>`;

      s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'งอกจากจุดเดียว เลือกกิ่งที่เบาที่สุดเสมอ',
        html: `<p>เริ่มจากจุดไหนก็ได้ ทุกขั้นดู edge ที่เชื่อมจุด<b>ในต้นไม้</b>กับจุด<b>นอกต้นไม้</b> แล้วหยิบเส้นที่เบาที่สุด ทำ |V| − 1 ครั้ง</p>
          <div class="rule"><span class="lbl">วิธีจดแบบในสไลด์</span>จุดนอกต้นไม้ติดป้าย u(จุดในต้นไม้ที่ใกล้สุด, น้ำหนัก) · ไม่ติดต้นไม้ = ∞ · เพิ่ม u* แล้วอัปเดตป้ายเพื่อนบ้านของ u* ถ้าน้ำหนักน้อยลง</div>`,
      });

      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'ตัวอย่างจากสไลด์', html: `<p>เลือกจุดเริ่มได้ ลองเปลี่ยนดูว่าน้ำหนักรวม MST ยังเท่าเดิม</p>`, wide: true });
      const bar = document.createElement('div');
      bar.className = 'fields';
      bar.innerHTML = `<label class="field" style="flex:0 1 160px">จุดเริ่ม<select id="prS">${Object.keys(G.pos).map((v) => `<option>${v}</option>`).join('')}</select></label>`;
      s.append(bar);
      const host = document.createElement('div');
      s.append(host);
      const build = () => { host.innerHTML = ''; mount(host, G, bar.querySelector('select').value); };
      bar.addEventListener('change', build);
      build();
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'เริ่มที่ a edge แรกที่ Prim เลือกคือ', options: ['b–c (1)', 'a–b (3)', 'e–f (2)', 'a–f (5)'], answer: 1, why: 'ตอนเริ่มมีแค่ edge ที่ออกจาก a: a–b 3, a–f 5, a–e 6 · b–c ยังไม่ติดต้นไม้' });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean"><li>ห้ามหยิบ edge ที่เบาที่สุด<b>ทั้งกราฟ</b> ต้องเป็น edge ที่<b>ติดกับต้นไม้</b>เท่านั้น (หยิบทั้งกราฟคือ Kruskal)</li>
          <li>มี edge หนักเท่ากัน MST อาจมีหลายแบบ แต่น้ำหนักรวมเท่ากันเสมอ</li>
          <li>ใช้ได้กับกราฟที่เชื่อมกันเท่านั้น</li>
          <li>เวลา: matrix + array ${K('Θ(|V|²)')} · adjacency list + min-heap ${K('O(|E| log |V|)')}</li></ul>`,
      });
      Lab.exam(root, L, [
        { key: 'c2', q: 'MST ของกราฟเชื่อมกัน n จุด มีกี่ edge', options: ['n', 'n − 1', 'n + 1', 'n(n−1)/2'], answer: 1, why: 'ต้นไม้ n จุดมี n − 1 edge เสมอ' },
        { key: 'c3', q: 'Prim ที่ใช้ adjacency list + min-heap ใช้เวลา', options: ['Θ(|V|³)', 'O(|V| + |E|)', 'O(|E| log |V|)', 'Θ(|V|)'], answer: 2, why: '(|V| − 1 + |E|) ครั้งของ heap operation ครั้งละ O(log |V|)' },
      ]);
      Lab.recap(root, [
        'ทุกขั้นหยิบ edge ที่เบาที่สุดจากต้นไม้ไปจุดนอกต้นไม้',
        'ทำ |V| − 1 ครั้ง · เริ่มจุดไหนก็ได้ น้ำหนักรวมเท่ากัน',
        'Θ(|V|²) หรือ O(|E| log |V|) ด้วย heap',
      ]);
    },
  });
})();
